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
      this.render();
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
        alert('Lutfen tum alanlari doldurun.');
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
          console.error('hesaplaMahalV5 fonksiyonu yüklenmedi (calc-engine.js eksik?).');
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
        console.error('Mahal hesaplamada hata (hesaplaMahalV5):', err);
        mahal.qIsı = 0;
        mahal.qSogutma = 0;
        mahal._motorHata = true;
      }
    },

    // Render tablo
    render: function() {
      this.renderTable();
      this.updateSummary();
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
        row.innerHTML = '<td colspan="6" style="text-align: center; color: #64748b;">Mahal eklenmemis</td>';
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
        infoDiv.innerHTML = '<div style="font-size: 11px; color: #475569;">Mahaller ekleyerek baslayın.</div>';
      } else {
        infoDiv.innerHTML = `
          <div style="font-size: 11px; color: #475569;">
            <strong>Toplam Alan:</strong> ${totalArea.toFixed(1)} m²<br>
            <strong>Isı Kaybi:</strong> ${totalHeating.toFixed(2)} kW<br>
            <strong>Soğutma Yükü:</strong> ${totalCooling.toFixed(2)} kW<br>
            <strong>Mahallar:</strong> ${this.mahals.length} adet
          </div>
        `;
      }
    },

    // Storage'a kaydet
    saveToStorage: function() {
      try {
        localStorage.setItem('gsem_mahals', JSON.stringify(this.mahals));
      } catch (e) {
        console.warn('localStorage yazma hatası:', e);
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
        console.warn('localStorage okuma hatası:', e);
      }
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
