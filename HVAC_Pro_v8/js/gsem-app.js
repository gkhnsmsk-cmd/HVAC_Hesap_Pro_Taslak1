// GSEM MEP PRO — Application Logic
// Mahal yönetimi, calc-engine entegrasyonu, canlı güncelleme

(function() {
  'use strict';

  window.gsemApp = {
    mahals: [],
    defaultCalcParams: {
      Tmax: 33,
      DR: 10,
      kisKt: -12,
      ruzgarZam: 1.1,
      emSog: 5,
      emIst: 5,
      odaZam: 0,
      effZam: 0,
      shgc: 0.6,
      fAyd: 1.0,
      ruzgarHiz: 3.5
    },

    // Initialize app
    init: function() {
      this.attachEventListeners();
      this.loadFromStorage();
      this.loadThemeFromStorage();
      this.loadAISettings();
      this.applyI18nPlaceholders();
      this.render();
      // Set language selector to current language (restored from localStorage by i18n.js)
      const langSelector = document.getElementById('lang-selector');
      if (langSelector) {
        langSelector.value = window.i18n.lang;
      }
    },

    // Event listeners
    attachEventListeners: function() {
      const ribbonBtn = document.getElementById('ribbon-mahal-ekle');
      const toolbarBtn = document.getElementById('btn-mahal-ekle');

      if (ribbonBtn) {
        ribbonBtn.addEventListener('click', () => this.openModal());
      }
      if (toolbarBtn) {
        toolbarBtn.addEventListener('click', () => this.openModal());
      }

      // Language selector listener
      const langSelector = document.getElementById('lang-selector');
      if (langSelector) {
        langSelector.addEventListener('change', (e) => {
          window.i18n.setLang(e.target.value);
          window.i18n.applyI18n();
          document.getElementById('lang-selector').value = window.i18n.lang;
        });
      }

      // Theme selector listener
      const themeSelector = document.getElementById('theme-selector');
      if (themeSelector) {
        themeSelector.addEventListener('change', (e) => {
          this.applyTheme(e.target.value);
        });
      }

      // AI Settings — Save Groq API Key button listener
      const saveGroqBtn = document.getElementById('btn-save-groq-key');
      if (saveGroqBtn) {
        saveGroqBtn.addEventListener('click', () => this.saveAISettings());
      }

      // Settings tab listener — load AI settings when tab opens
      const settingsTab = document.querySelector('.ribbon-tab[data-tab="settings"]');
      if (settingsTab) {
        settingsTab.addEventListener('click', () => this.loadAISettings());
      }

      // AI Chat — Send Prompt button listener
      const aiSendBtn = document.getElementById('ai-send-btn');
      if (aiSendBtn) {
        aiSendBtn.addEventListener('click', () => this.onAISendPrompt());
      }
    },

    // Modal açma
    openModal: function() {
      document.getElementById('mahal-modal').classList.add('active');
    },

    // Modal kapatma
    closeModal: function() {
      document.getElementById('mahal-modal').classList.remove('active');
      this.clearModalFields();
    },

    // Modal alanlarını temizle
    clearModalFields: function() {
      document.getElementById('modal-mahal-adi').value = '';
      document.getElementById('modal-alan').value = '50';
      document.getElementById('modal-yukseklik').value = '3.0';
      document.getElementById('modal-dis-sicaklik-kis').value = '-12';
      document.getElementById('modal-ic-sicaklik-kis').value = '21';
      document.getElementById('modal-dis-sicaklik-yaz').value = '33';
      document.getElementById('modal-ic-sicaklik-yaz').value = '24';
    },

    // Mahal ekle
    addMahal: function() {
      const mahalAdi = document.getElementById('modal-mahal-adi').value.trim();
      const alan = parseFloat(document.getElementById('modal-alan').value);
      const yukseklik = parseFloat(document.getElementById('modal-yukseklik').value);
      const disKis = parseFloat(document.getElementById('modal-dis-sicaklik-kis').value);
      const icKis = parseFloat(document.getElementById('modal-ic-sicaklik-kis').value);
      const disYaz = parseFloat(document.getElementById('modal-dis-sicaklik-yaz').value);
      const icYaz = parseFloat(document.getElementById('modal-ic-sicaklik-yaz').value);

      if (!mahalAdi || !alan || !yukseklik) {
        alert(window.i18n.get('modal_fill_fields'));
        return;
      }

      const mahal = {
        id: Date.now(),
        mahalAdi: mahalAdi,
        alan: alan,
        h: yukseklik,
        icSicaklikKis: icKis,
        disSicaklikKis: disKis,
        icSicaklikYaz: icYaz,
        disSicaklikYaz: disYaz,
        qIsı: 0,
        qSogutma: 0
      };

      // Hesapla
      this.calculateMahal(mahal);

      // Tabloya ekle
      this.mahals.push(mahal);
      this.saveToStorage();
      this.render();
      this.closeModal();
    },

    // Mahal hesapla — GERÇEK motor: calc-engine.js / hesaplaMahalV5 (EN 12831 kış + ASHRAE CLTD yaz)
    calculateMahal: function(mahal) {
      try {
        if (typeof hesaplaMahalV5 === 'undefined') {
          console.error(window.i18n.get('error_calc_engine_missing'));
          mahal.qIsı = 0;
          mahal.qSogutma = 0;
          mahal._motorHata = true;
          return;
        }

        // Basit modal sadece toplam alan+yükseklik alıyor; yön bazlı duvar/pencere alanı
        // TOPLANMIYOR. Motor bunları istiyor — kare oda varsayımıyla türetiyoruz:
        //   çevre = 4×kenar (kenar=√alan), dış duvar = çevre×h, pencere/duvar oranı %20 (tipik ofis/konut)
        // Bu bir YAKLAŞIKLIK: gerçek projede yön bazlı gerçek duvar/pencere alanları girilmeli
        // (bkz. index.html Excel-tabanlı akış — orada gerçek ölçüler kullanılıyor).
        const kenar = Math.sqrt(Math.max(mahal.alan, 1));
        const cevre = 4 * kenar;
        const disDuvarToplam = cevre * mahal.h;
        const pencereOrani = 0.20;
        const pencereToplam = disDuvarToplam * pencereOrani;
        const duvarToplam = disDuvarToplam - pencereToplam;
        // Tek dış cephe (güney) varsayımıyla motora veriyoruz — 4 yöne bölmek sonucu değiştirmez
        // (motor yön bazlı sadece güneş radyasyonu/CLTD farkı için kullanıyor; muhafazakâr taraf
        // için tüm cepheyi "güney"e veriyoruz — yaz kazancı biraz yüksek çıkabilir, kışta etkisiz).

        const row = {
          mahalAdi: mahal.mahalAdi,
          alan: mahal.alan,
          h: mahal.h,
          'İç Sıcaklık- Yaz': mahal.icSicaklikYaz,
          'İç Sıcaklık- Kış': mahal.icSicaklikKis,
          'duvar u değeri': 0.45,
          'pencere u değeri': 2.1,
          'tavan u değeri': 0.35,
          'döşeme u değeri': 0.50,
          'pencere gölgeleme kaysayısı': 0.5,
          'güney dış duvar alanı': duvarToplam,
          'güney dış pencere alanı': pencereToplam,
          'tavan alanı': mahal.alan,
          'döşeme alanı': mahal.alan,
          'aydınlatma yükü': 20
        };

        const P = {
          Tmax: mahal.disSicaklikYaz,
          DR: this.defaultCalcParams.DR,
          kisKt: mahal.disSicaklikKis,
          ruzgarZam: this.defaultCalcParams.ruzgarZam,
          emSog: this.defaultCalcParams.emSog,
          emIst: this.defaultCalcParams.emIst,
          odaZam: this.defaultCalcParams.odaZam,
          effZam: this.defaultCalcParams.effZam,
          shgc: this.defaultCalcParams.shgc,
          fAyd: this.defaultCalcParams.fAyd,
          ruzgarHiz: this.defaultCalcParams.ruzgarHiz,
          infilEkle: true,
          thSogEkle: false,
          thIstEkle: false
        };

        const sonuc = hesaplaMahalV5(row, P, null);

        mahal.qIsı = (sonuc.qKayip || 0) / 1000;      // W -> kW (kış ısı kaybı, EN 12831)
        mahal.qSogutma = (sonuc.bestLoad || 0) / 1000; // W -> kW (yaz tepe soğutma yükü, ASHRAE CLTD)
        mahal._motorHata = false;

      } catch (err) {
        console.error(window.i18n.get('error_calc_failed'), err);
        mahal.qIsı = 0;
        mahal.qSogutma = 0;
        mahal._motorHata = true;
      }
    },

    // Render tablo
    render: function() {
      this.renderTable();
      this.updateSummary();
      // Reports tab'ı açık ise onu da güncelle
      const reportsContainer = document.getElementById('ek-hesaplar-reports');
      if (reportsContainer && reportsContainer.style.display !== 'none') {
        this.renderReports();
      }
    },

    // Render Reports tab
    renderReports: function() {
      const container = document.getElementById('ek-hesaplar-reports');
      if (!container) return;

      // HTML template: başlık + rapor tablosu + özet
      const totalHeating = this.mahals.reduce((sum, m) => sum + m.qIsı, 0);
      const totalCooling = this.mahals.reduce((sum, m) => sum + m.qSogutma, 0);
      const totalArea = this.mahals.reduce((sum, m) => sum + m.alan, 0);
      const unitHeating = totalArea > 0 ? (totalHeating * 1000) / totalArea : 0;

      let tableRows = '';
      if (this.mahals.length === 0) {
        tableRows = '<tr><td colspan="5" style="text-align: center; color: #64748b;">' + window.i18n.get('report_no_data') + '</td></tr>';
      } else {
        this.mahals.forEach((mahal) => {
          tableRows += `
            <tr>
              <td>${mahal.mahalAdi}</td>
              <td>${mahal.alan.toFixed(1)}</td>
              <td>${mahal.h.toFixed(1)}</td>
              <td>${(mahal.qIsı * 1000).toFixed(0)}</td>
              <td>${(mahal.qSogutma * 1000).toFixed(0)}</td>
            </tr>
          `;
        });
      }

      container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Header -->
          <div>
            <h2 style="font-size: 18px; font-weight: 700; color: #1a1f28; margin-bottom: 4px;" data-i18n="report_title">Proje Raporu</h2>
            <p style="font-size: 13px; color: #64748b;" data-i18n="report_subtitle">Isıtma/Soğutma Hesapları</p>
          </div>

          <!-- Report Table -->
          <div>
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th data-i18n="table_room_name">Mahal Adi</th>
                  <th data-i18n="table_area">Alan (m2)</th>
                  <th data-i18n="table_height">Yukseklik (m)</th>
                  <th data-i18n="table_heat_loss">Isi Kaybi (W)</th>
                  <th data-i18n="table_cooling_load">Sogutma Yuku (W)</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>

          <!-- Summary Section -->
          <div style="background: #f8f9fb; border: 1px solid #e2e8f0; border-radius: 4px; padding: 16px;">
            <h3 style="font-size: 14px; font-weight: 700; color: #1a1f28; margin-bottom: 12px;" data-i18n="report_summary">Özet</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div>
                <span style="color: #64748b;" data-i18n="report_total_area">Toplam Alan:</span>
                <span style="color: #3B82F6; font-weight: 700; margin-left: 8px;">${totalArea.toFixed(1)} m²</span>
              </div>
              <div>
                <span style="color: #64748b;" data-i18n="report_total_heating">Toplam Isı Kaybı:</span>
                <span style="color: #3B82F6; font-weight: 700; margin-left: 8px;">${totalHeating.toFixed(2)} kW</span>
              </div>
              <div>
                <span style="color: #64748b;" data-i18n="report_total_cooling">Toplam Soğutma Yükü:</span>
                <span style="color: #3B82F6; font-weight: 700; margin-left: 8px;">${totalCooling.toFixed(2)} kW</span>
              </div>
              <div>
                <span style="color: #64748b;" data-i18n="report_avg_heating">Ortalama Isı (W/m²):</span>
                <span style="color: #3B82F6; font-weight: 700; margin-left: 8px;">${unitHeating.toFixed(0)} W/m²</span>
              </div>
            </div>
          </div>

          <!-- Export Button -->
          <div>
            <button id="btn-report-export" class="toolbar-btn" style="padding: 8px 16px; background: #3B82F6; color: #fff; border-color: #3B82F6;" data-i18n="report_export">Rapor İndir (CSV)</button>
          </div>
        </div>
      `;

      // Apply i18n to newly rendered elements
      if (window.i18n) {
        window.i18n.applyI18n();
      }

      // Export button listener
      const exportBtn = document.getElementById('btn-report-export');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => this.exportReportCSV());
      }
    },

    // Export Report as CSV (placeholder)
    exportReportCSV: function() {
      if (this.mahals.length === 0) {
        alert(window.i18n.get('report_no_data'));
        return;
      }

      // CSV header
      const csvHeader = ['Mahal Adi', 'Alan (m2)', 'Yukseklik (m)', 'Isi Kaybi (W)', 'Sogutma Yuku (W)'];

      // CSV rows
      const csvRows = this.mahals.map(mahal => [
        mahal.mahalAdi,
        mahal.alan.toFixed(1),
        mahal.h.toFixed(1),
        (mahal.qIsı * 1000).toFixed(0),
        (mahal.qSogutma * 1000).toFixed(0)
      ]);

      // Summary rows
      const totalHeating = this.mahals.reduce((sum, m) => sum + m.qIsı, 0);
      const totalCooling = this.mahals.reduce((sum, m) => sum + m.qSogutma, 0);
      const totalArea = this.mahals.reduce((sum, m) => sum + m.alan, 0);
      const unitHeating = totalArea > 0 ? (totalHeating * 1000) / totalArea : 0;

      // Build CSV
      let csv = csvHeader.join(',') + '\n';
      csvRows.forEach(row => csv += row.join(',') + '\n');
      csv += '\n,,,Özet,\n';
      csv += `Toplam Alan,${totalArea.toFixed(1)},m²\n`;
      csv += `Toplam Isı Kaybı,${totalHeating.toFixed(2)},kW\n`;
      csv += `Toplam Soğutma Yükü,${totalCooling.toFixed(2)},kW\n`;
      csv += `Ortalama Isı,${unitHeating.toFixed(0)},W/m²\n`;

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'rapor_' + new Date().toISOString().split('T')[0] + '.csv';
      link.click();
    },

    // Tabloyu doldur
    renderTable: function() {
      const tbody = document.getElementById('mahaller-tbody');
      tbody.innerHTML = '';

      this.mahals.forEach((mahal, idx) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${mahal.mahalAdi}</td>
          <td>${mahal.alan.toFixed(1)}</td>
          <td>${mahal.h.toFixed(1)}</td>
          <td>${(mahal.qIsı * 1000).toFixed(0)}</td>
          <td>${(mahal.qSogutma * 1000).toFixed(0)}</td>
          <td>✓</td>
        `;
        tbody.appendChild(row);
      });

      if (this.mahals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; color: #64748b;">' + window.i18n.get('table_empty') + '</td>';
        tbody.appendChild(row);
      }
    },

    // Özeti güncelle
    updateSummary: function() {
      const totalHeating = this.mahals.reduce((sum, m) => sum + m.qIsı, 0);
      const totalCooling = this.mahals.reduce((sum, m) => sum + m.qSogutma, 0);
      const totalArea = this.mahals.reduce((sum, m) => sum + m.alan, 0);
      const unitHeating = totalArea > 0 ? (totalHeating * 1000) / totalArea : 0;

      document.getElementById('summary-heating-total').textContent = totalHeating.toFixed(1) + ' kW';
      document.getElementById('summary-heating-unit').textContent = unitHeating.toFixed(0) + ' W/m2';
      document.getElementById('summary-cooling-total').textContent = totalCooling.toFixed(1) + ' kW';
      document.getElementById('summary-room-count').textContent = this.mahals.length;

      const infoDiv = document.getElementById('summary-info');
      if (this.mahals.length === 0) {
        infoDiv.innerHTML = '<div style="font-size: 11px; color: #475569;">' + window.i18n.get('info_add_rooms') + '</div>';
      } else {
        infoDiv.innerHTML = `
          <div style="font-size: 11px; color: #475569;">
            <strong>${window.i18n.get('summary_area')}</strong> ${totalArea.toFixed(1)} m²<br>
            <strong>${window.i18n.get('summary_heating')}</strong> ${totalHeating.toFixed(2)} kW<br>
            <strong>${window.i18n.get('summary_cooling')}</strong> ${totalCooling.toFixed(2)} kW<br>
            <strong>${window.i18n.get('summary_rooms')}</strong> ${this.mahals.length} adet
          </div>
        `;
      }
    },

    // Storage'a kaydet
    saveToStorage: function() {
      try {
        localStorage.setItem('gsem_mahals', JSON.stringify(this.mahals));
      } catch (e) {
        console.warn(window.i18n.get('error_storage_write'), e);
      }
    },

    // Storage'dan yükle
    loadFromStorage: function() {
      try {
        const saved = localStorage.getItem('gsem_mahals');
        if (saved) {
          this.mahals = JSON.parse(saved);
        }
      } catch (e) {
        console.warn(window.i18n.get('error_storage_read'), e);
      }
    },

    // Tema uygula
    applyTheme: function(theme) {
      if (theme === 'light') {
        document.body.classList.remove('theme-dark');
      } else if (theme === 'dark') {
        document.body.classList.add('theme-dark');
      }
      localStorage.setItem('gsem_theme', theme);
      const themeSelector = document.getElementById('theme-selector');
      if (themeSelector) {
        themeSelector.value = theme;
      }
    },

    // Storage'dan tema yükle
    loadThemeFromStorage: function() {
      try {
        const savedTheme = localStorage.getItem('gsem_theme') || 'light';
        this.applyTheme(savedTheme);
      } catch (e) {
        console.warn('Tema yüklemede hata:', e);
        this.applyTheme('light');
      }
    },

    // AI Settings — Validate API Key format
    validateAPIKey: function(key) {
      return key && key.trim().startsWith('gsk_');
    },

    // AI Settings — Load Groq API Key from localStorage
    loadAISettings: function() {
      try {
        const apiKey = localStorage.getItem('groq_api_key') || '';
        const inputElement = document.getElementById('groq-api-key');

        if (inputElement) {
          inputElement.value = apiKey;
        }

        this.updateAIStatus(apiKey);
      } catch (e) {
        console.warn('AI ayarları yüklemede hata:', e);
      }
    },

    // AI Settings — Save Groq API Key to localStorage
    saveAISettings: function() {
      try {
        const inputElement = document.getElementById('groq-api-key');
        if (!inputElement) return;

        const apiKey = inputElement.value.trim();

        if (!this.validateAPIKey(apiKey)) {
          alert(window.i18n.get('error_invalid_api_key') || 'API Key geçersiz. "gsk_" ile başlamalıdır.');
          return;
        }

        localStorage.setItem('groq_api_key', apiKey);
        this.updateAIStatus(apiKey);
        alert(window.i18n.get('success_api_key_saved') || 'API Key başarıyla kaydedildi.');
      } catch (e) {
        console.error('AI ayarları kaydedilirken hata:', e);
        alert('Hata: ' + e.message);
      }
    },

    // AI Settings — Update status indicator
    updateAIStatus: function(apiKey) {
      try {
        const statusDot = document.getElementById('groq-status-dot');
        const statusText = document.getElementById('groq-status-text');

        if (!statusDot || !statusText) return;

        const isValid = this.validateAPIKey(apiKey);

        if (isValid) {
          statusDot.style.backgroundColor = '#10B981';
          statusText.textContent = window.i18n.get('ai_agent_connected') || 'Bağlı';
          statusText.style.color = '#10B981';
        } else {
          statusDot.style.backgroundColor = '#e2e8f0';
          statusText.textContent = window.i18n.get('ai_agent_disconnected') || 'Bağlı Değil';
          statusText.style.color = '#64748b';
        }
      } catch (e) {
        console.warn('Status güncellemede hata:', e);
      }
    },

    // AI Chat — Send Prompt and get response from Groq API
    onAISendPrompt: function() {
      const promptArea = document.getElementById('ai-prompt');
      const responseDiv = document.getElementById('ai-response');
      const sendBtn = document.getElementById('ai-send-btn');

      if (!promptArea || !responseDiv) return;

      const prompt = promptArea.value.trim();
      if (!prompt) {
        alert(window.i18n.get('ai_error_empty_prompt') || 'Lütfen bir soru girin.');
        return;
      }

      // Get API key from localStorage (already saved via Settings)
      const apiKey = localStorage.getItem('groq_api_key') || '';
      if (!apiKey || !apiKey.startsWith('gsk_')) {
        responseDiv.textContent = window.i18n.get('ai_error_no_key') || 'Lütfen Settings\'de Groq API key girin.';
        responseDiv.style.display = 'block';
        responseDiv.style.color = '#ef4444';
        return;
      }

      // Set loading state
      sendBtn.disabled = true;
      responseDiv.textContent = window.i18n.get('ai_loading') || 'Yanıt alınıyor...';
      responseDiv.style.display = 'block';
      responseDiv.style.color = '#64748b';

      // Call Groq API via groq-client.js
      if (!window.GroqClient) {
        responseDiv.textContent = 'Hata: GroqClient yüklenmedi.';
        responseDiv.style.color = '#ef4444';
        sendBtn.disabled = false;
        return;
      }

      window.GroqClient.setAPIKey(apiKey);
      window.GroqClient.sendPrompt(prompt).then(result => {
        sendBtn.disabled = false;
        if (result.error) {
          responseDiv.textContent = 'Hata: ' + result.error;
          responseDiv.style.color = '#ef4444';
        } else {
          responseDiv.textContent = result;
          responseDiv.style.color = '#1a1f28';
        }
      }).catch(err => {
        sendBtn.disabled = false;
        responseDiv.textContent = 'Beklenmeyen hata: ' + err.message;
        responseDiv.style.color = '#ef4444';
        console.error('AI chat error:', err);
      });
    },

    // Apply i18n to placeholder attributes
    applyI18nPlaceholders: function() {
      const elements = document.querySelectorAll('[data-i18n-placeholder]');
      elements.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const value = window.i18n.get(key);
        if (value) el.placeholder = value;
      });
    }
  };

  // Auto-init DOMContentLoaded'de
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      gsemApp.init();
    });
  } else {
    gsemApp.init();
  }
})();
