// HVAC Pro v8 — Ek Hesaplar UI (Additional Calculations UI Engine)
// Dinamik form üretimi, hesapla butonu, sonuç gösterimi

(function () {
  'use strict';

  // Config yüklendi mi kontrol et
  if (!window.EkHesaplarConfig) {
    console.warn('EkHesaplarConfig yüklenmedi. js/ek-hesaplar-config.js önce yüklenmelidir.');
    return;
  }

  const config = window.EkHesaplarConfig;
  let currentModuleIndex = -1;

  // ─── UI Öğeleri ───────────────────────────────────────────────────────
  function getContainers() {
    return {
      dropdown: document.getElementById('ek-hesaplar-modul-select'),
      formContainer: document.getElementById('ek-hesaplar-form-container'),
      resultsContainer: document.getElementById('ek-hesaplar-results'),
      calculateBtn: document.getElementById('ek-hesaplar-btn-calculate')
    };
  }

  // ─── Dropdown'u doldur ─────────────────────────────────────────────────
  function initDropdown() {
    const containers = getContainers();
    if (!containers.dropdown) return;

    // Dropdown temizle
    containers.dropdown.innerHTML = '<option value="">-- Modül Seçin --</option>';

    config.forEach((mod, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = mod.nameTr || mod.id;
      containers.dropdown.appendChild(opt);
    });

    // Change event
    containers.dropdown.addEventListener('change', onModuleChanged);
  }

  // ─── Modül değişikliğinde form güncelle ──────────────────────────────
  function onModuleChanged(e) {
    const idx = parseInt(e.target.value);
    if (idx < 0 || idx >= config.length) {
      currentModuleIndex = -1;
      clearForm();
      return;
    }

    currentModuleIndex = idx;
    const mod = config[idx];

    // Açıklama göster
    const containers = getContainers();
    if (containers.formContainer) {
      let html = '<div style="margin-bottom: 12px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px;">';
      html += '<strong>' + mod.nameTr + '</strong><br>';
      html += '<small style="color: #666;">' + mod.description + '</small>';
      html += '</div>';

      // Parametreler için form oluştur
      html += '<div class="ek-hesaplar-form-fields">';
      mod.params.forEach((param, pIdx) => {
        const inputId = 'ek-param-' + idx + '-' + pIdx;
        html += '<div class="pi" style="margin-bottom: 10px;">';
        html += '  <label for="' + inputId + '">' + param.label + ' (' + param.unit + ')</label>';

        if (param.type === 'number') {
          html += '  <input type="number" id="' + inputId + '" ';
          if (param.min !== undefined) html += 'min="' + param.min + '" ';
          if (param.max !== undefined) html += 'max="' + param.max + '" ';
          if (param.step !== undefined) html += 'step="' + param.step + '" ';
          html += 'value="' + param.default + '" />';
        } else if (param.type === 'string') {
          html += '  <input type="text" id="' + inputId + '" value="' + param.default + '" />';
        } else if (param.type === 'enum') {
          html += '  <input type="number" id="' + inputId + '" value="' + param.default + '" min="' + param.min + '" max="' + param.max + '" />';
        }
        html += '</div>';
      });
      html += '</div>';

      containers.formContainer.innerHTML = html;
    }
  }

  // ─── Form temizle ─────────────────────────────────────────────────────
  function clearForm() {
    const containers = getContainers();
    if (containers.formContainer) {
      containers.formContainer.innerHTML = '';
    }
  }

  // ─── Hesapla butonu ───────────────────────────────────────────────────
  function onCalculate() {
    if (currentModuleIndex < 0) {
      alert('Lütfen bir modül seçin.');
      return;
    }

    const mod = config[currentModuleIndex];

    // Modülün window object'ine erişebilir mi kontrol et
    if (!mod.windowName || !window[mod.windowName]) {
      showError('Modül yüklenmedi: ' + mod.nameTr + ' (' + mod.windowName + ')');
      return;
    }

    // Fonksiyona erişebilir mi
    if (!mod.mainFunc || typeof window[mod.windowName][mod.mainFunc] !== 'function') {
      showError('Fonksiyon bulunamadı: ' + mod.mainFunc);
      return;
    }

    // Parametreleri topla
    const params = {};
    mod.params.forEach((param, pIdx) => {
      const inputId = 'ek-param-' + currentModuleIndex + '-' + pIdx;
      const elem = document.getElementById(inputId);
      if (!elem) {
        showError('Input bulunamadı: ' + inputId);
        return;
      }

      let val = elem.value;
      if (param.type === 'number') {
        val = parseFloat(val);
        if (isNaN(val)) {
          showError(param.label + ' geçersiz sayıdır.');
          return;
        }
      }

      params[param.name] = val;
    });

    // Fonksiyonu çağır
    try {
      const func = window[mod.windowName][mod.mainFunc];

      // Parametreleri object olarak mı, yoksa spread olarak mı geçeceğini belirle
      // Çoğu modül { ...params } şeklinde object alıyor
      let result;
      if (mod.mainFunc === 'uValue' || mod.mainFunc === 'rTotal') {
        // Bu fonksiyonlar array + optional params alıyor
        // Basit için default params kullan
        result = func([], params.Rsi || 0.13, params.Rse || 0.04);
      } else if (mod.mainFunc === 'wasteFlow' || mod.mainFunc === 'fanSelect') {
        // Pozisyonel parametreler
        const paramArray = Object.values(params);
        result = func(...paramArray);
      } else {
        // Çoğu modül — object parametre
        result = func(params);
      }

      showResult(mod, params, result);
    } catch (err) {
      showError('Hesaplamada hata: ' + err.message);
    }
  }

  // ─── Sonuç göster ─────────────────────────────────────────────────────
  function showResult(mod, inputs, result) {
    const containers = getContainers();
    if (!containers.resultsContainer) return;

    let html = '<div style="padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 6px; margin-top: 12px;">';
    html += '<h4 style="margin: 0 0 8px 0; color: #059669;">✓ Hesaplama Sonucu</h4>';
    html += '<strong>' + mod.nameTr + '</strong><br>';

    // Giriş parametrelerini göster
    html += '<div style="margin-top: 8px; font-size: 11px; color: #666;">';
    html += '<strong>Giriş:</strong> ';
    const inputStrs = mod.params.map(p => {
      const val = inputs[p.name];
      return p.label + '=' + (typeof val === 'number' ? val.toFixed(2) : val) + ' ' + p.unit;
    });
    html += inputStrs.join(', ');
    html += '</div>';

    // Sonuç
    html += '<div style="margin-top: 8px; font-weight: bold; color: #059669;">';
    if (typeof result === 'object' && result !== null) {
      // Nesne sonuç
      html += '<strong>Sonuç:</strong><br>';
      Object.keys(result).forEach(key => {
        const val = result[key];
        let displayVal;
        if (typeof val === 'number') {
          if (isNaN(val)) {
            displayVal = 'NaN (Geçersiz giriş)';
          } else if (!isFinite(val)) {
            displayVal = 'Inf (Matematik hatası)';
          } else {
            displayVal = val.toFixed(4);
          }
        } else {
          displayVal = String(val);
        }
        html += '  ' + key + ' = ' + displayVal + '<br>';
      });
    } else if (typeof result === 'number') {
      // Sayı sonuç
      let displayVal;
      if (isNaN(result)) {
        displayVal = 'NaN (Geçersiz giriş)';
      } else if (!isFinite(result)) {
        displayVal = 'Inf (Matematik hatası)';
      } else {
        displayVal = result.toFixed(4);
      }
      html += 'Sonuç: ' + displayVal;
    } else {
      html += 'Sonuç: ' + String(result);
    }
    html += '</div>';

    html += '</div>';
    containers.resultsContainer.innerHTML = html;
  }

  // ─── Hata göster ──────────────────────────────────────────────────────
  function showError(msg) {
    const containers = getContainers();
    if (!containers.resultsContainer) return;

    let html = '<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 6px; margin-top: 12px; color: #b91c1c;">';
    html += '<strong>✗ Hata:</strong> ' + msg;
    html += '</div>';
    containers.resultsContainer.innerHTML = html;
  }

  // ─── Başlat ───────────────────────────────────────────────────────────
  function init() {
    const containers = getContainers();
    if (!containers.dropdown || !containers.calculateBtn) {
      console.warn('Ek Hesaplar UI öğeleri bulunamadı.');
      return;
    }

    initDropdown();
    containers.calculateBtn.addEventListener('click', onCalculate);
  }

  // DOM hazır olduktan sonra başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export
  if (typeof window !== 'undefined') {
    window.EkHesaplarUI = {
      init: init,
      showResult: showResult,
      showError: showError
    };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init };
  }
})();
