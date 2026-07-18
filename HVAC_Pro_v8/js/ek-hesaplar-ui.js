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

  // ─── Dropdown'u doldur (category filtresi ile) ─────────────────────────
  function initDropdown(categoryFilter) {
    const containers = getContainers();
    if (!containers.dropdown) return;

    // Dropdown temizle
    containers.dropdown.innerHTML = '<option value="">-- Modül Seçin --</option>';

    config.forEach((mod, idx) => {
      // Category filtresi: null ise hepsini göster, aksi halde sadece eşleşeni göster
      if (categoryFilter && mod.category !== categoryFilter) {
        return;
      }

      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = mod.nameTr || mod.id;
      containers.dropdown.appendChild(opt);
    });

    // Change event
    containers.dropdown.addEventListener('change', onModuleChanged);
  }

  // ─── Modül değişikliğinde form güncelle ──────────────────────────────
  function onModuleChanged(e, containerId) {
    const idx = parseInt(e.target.value);
    if (idx < 0 || idx >= config.length) {
      currentModuleIndex = -1;
      if (containerId) {
        // render() üzerinden çağrılmış
        const formContainer = document.getElementById('ek-hesaplar-form-container-' + containerId);
        if (formContainer) formContainer.innerHTML = '';
      } else {
        // init() üzerinden çağrılmış (eski şekil)
        clearForm();
      }
      return;
    }

    currentModuleIndex = idx;
    const mod = config[idx];

    // Açıklama göster
    const formContainer = containerId
      ? document.getElementById('ek-hesaplar-form-container-' + containerId)
      : getContainers().formContainer;

    if (formContainer) {
      let html = '<div style="margin-bottom: 12px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 4px;">';
      html += '<strong>' + mod.nameTr + '</strong><br>';
      html += '<small style="color: #666;">' + mod.description + '</small>';
      html += '</div>';

      // Parametreler için form oluştur
      html += '<div class="ek-hesaplar-form-fields">';
      mod.params.forEach((param, pIdx) => {
        const inputId = containerId
          ? 'ek-param-' + containerId + '-' + idx + '-' + pIdx
          : 'ek-param-' + idx + '-' + pIdx;
        html += '<div class="pi" style="margin-bottom: 10px;">';
        html += '  <label for="' + inputId + '">' + param.label + (param.unit ? ' (' + param.unit + ')' : '') + '</label>';

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
        } else if (param.type === 'array') {
          // Çok-satırlı (dizi) parametre: her satır itemFields'e göre birden
          // fazla alt-input içerir (örn. medical-gas.js totalFlow({noktalar:[...]})).
          html += '  <table class="ek-array-table" id="ek-array-table-' + inputId + '" data-next-index="0" data-item-fields=\'' + JSON.stringify(param.itemFields || []).replace(/'/g, '&#39;') + '\'>';
          html += '    <thead><tr>';
          (param.itemFields || []).forEach(function (f) { html += '<th>' + f.label + '</th>'; });
          html += '<th></th></tr></thead>';
          html += '    <tbody id="ek-array-body-' + inputId + '"></tbody>';
          html += '  </table>';
          html += '  <button type="button" class="ek-array-add-btn" data-target="' + inputId + '" style="margin-top:4px; padding:3px 8px; font-size:11px; background:#fff; border:1px solid #e2e8f0; border-radius:4px; cursor:pointer;">+ Satır Ekle</button>';
        }
        html += '</div>';
      });
      html += '</div>';

      formContainer.innerHTML = html;

      // Dizi (array) parametreleri için: başlangıçta 1 satır ekle + "+ Satır
      // Ekle"/"Sil" butonlarını bağla (event delegation, formContainer üstünde).
      mod.params.forEach(function (param, pIdx) {
        if (param.type !== 'array') return;
        const inputId = containerId
          ? 'ek-param-' + containerId + '-' + idx + '-' + pIdx
          : 'ek-param-' + idx + '-' + pIdx;
        addArrayRow(inputId, param.itemFields || []);
      });
      if (!formContainer._ekArrayDelegated) {
        formContainer.addEventListener('click', function (ev) {
          const addBtn = ev.target.closest('.ek-array-add-btn');
          if (addBtn) {
            const targetId = addBtn.getAttribute('data-target');
            const table = document.getElementById('ek-array-table-' + targetId);
            if (table) {
              let itemFields = [];
              try { itemFields = JSON.parse(table.getAttribute('data-item-fields') || '[]'); } catch (e) { itemFields = []; }
              addArrayRow(targetId, itemFields);
            }
            return;
          }
          const delBtn = ev.target.closest('.ek-array-del-btn');
          if (delBtn) {
            const row = delBtn.closest('tr');
            if (row) row.remove();
          }
        });
        formContainer._ekArrayDelegated = true;
      }
    }
  }

  // ─── Dizi (array) parametresine yeni satır ekle ───────────────────────
  function addArrayRow(inputId, itemFields) {
    const tbody = document.getElementById('ek-array-body-' + inputId);
    const table = document.getElementById('ek-array-table-' + inputId);
    if (!tbody || !table) return;

    const rowIdx = parseInt(table.getAttribute('data-next-index') || '0', 10);
    table.setAttribute('data-next-index', String(rowIdx + 1));

    const tr = document.createElement('tr');
    itemFields.forEach(function (f) {
      const td = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.id = inputId + '-row' + rowIdx + '-' + f.name;
      inp.className = 'ek-array-cell';
      inp.style.width = '70px';
      inp.style.padding = '2px 4px';
      inp.style.fontSize = '11px';
      if (f.default !== undefined) inp.value = f.default;
      td.appendChild(inp);
      tr.appendChild(td);
    });
    const tdBtn = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'ek-array-del-btn';
    delBtn.textContent = 'Sil';
    delBtn.style.cssText = 'padding:2px 6px; font-size:10px; background:#fff; border:1px solid #e2e8f0; border-radius:3px; cursor:pointer; color:#b91c1c;';
    tdBtn.appendChild(delBtn);
    tr.appendChild(tdBtn);

    tbody.appendChild(tr);
  }

  // ─── Dizi (array) parametresinin tüm satırlarını oku ──────────────────
  function readArrayParam(inputId, itemFields) {
    const tbody = document.getElementById('ek-array-body-' + inputId);
    if (!tbody) return [];
    const rows = tbody.querySelectorAll('tr');
    const result = [];
    rows.forEach(function (tr) {
      const obj = {};
      let hasValue = false;
      itemFields.forEach(function (f) {
        const cellInput = tr.querySelector('input[id$="-' + f.name + '"]');
        if (cellInput) {
          const v = parseFloat(cellInput.value);
          obj[f.name] = isNaN(v) ? 0 : v;
          if (cellInput.value !== '') hasValue = true;
        }
      });
      if (hasValue) result.push(obj);
    });
    return result;
  }

  // ─── Form temizle ─────────────────────────────────────────────────────
  function clearForm() {
    const containers = getContainers();
    if (containers.formContainer) {
      containers.formContainer.innerHTML = '';
    }
  }

  // ─── Hesapla butonu (containerId desteği ile) ─────────────────────────
  function onCalculate(containerId) {
    if (currentModuleIndex < 0) {
      const resultsContainer = containerId
        ? document.getElementById('ek-hesaplar-results-' + containerId)
        : getContainers().resultsContainer;
      if (resultsContainer) {
        resultsContainer.innerHTML = '<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 6px; color: #b91c1c;"><strong>Uyarı:</strong> Lütfen bir modül seçin.</div>';
      }
      return;
    }

    const mod = config[currentModuleIndex];

    // Modülün window object'ine erişebilir mi kontrol et
    if (!mod.windowName || !window[mod.windowName]) {
      showErrorUI('Modül yüklenmedi: ' + mod.nameTr + ' (' + mod.windowName + ')', containerId);
      return;
    }

    // Fonksiyona erişebilir mi
    if (!mod.mainFunc || typeof window[mod.windowName][mod.mainFunc] !== 'function') {
      showErrorUI('Fonksiyon bulunamadı: ' + mod.mainFunc, containerId);
      return;
    }

    // Parametreleri topla
    const params = {};
    mod.params.forEach((param, pIdx) => {
      const inputId = containerId
        ? 'ek-param-' + containerId + '-' + currentModuleIndex + '-' + pIdx
        : 'ek-param-' + currentModuleIndex + '-' + pIdx;

      if (param.type === 'array') {
        // Dizi (çok-satırlı) parametre: tek bir input yok, satırları oku.
        params[param.name] = readArrayParam(inputId, param.itemFields || []);
        return;
      }

      const elem = document.getElementById(inputId);
      if (!elem) {
        showErrorUI('Input bulunamadı: ' + inputId, containerId);
        return;
      }

      let val = elem.value;
      if (param.type === 'number') {
        val = parseFloat(val);
        if (isNaN(val)) {
          showErrorUI(param.label + ' geçersiz sayıdır.', containerId);
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

      showResultUI(mod, params, result, containerId);
    } catch (err) {
      showErrorUI('Hesaplamada hata: ' + err.message, containerId);
    }
  }

  // ─── Sonuç göster (containerId desteği ile) ─────────────────────────────
  function showResultUI(mod, inputs, result, containerId) {
    const resultsContainer = containerId
      ? document.getElementById('ek-hesaplar-results-' + containerId)
      : getContainers().resultsContainer;
    if (!resultsContainer) return;

    let html = '<div style="padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 6px; margin-top: 12px;">';
    html += '<h4 style="margin: 0 0 8px 0; color: #059669;">✓ Hesaplama Sonucu</h4>';
    html += '<strong>' + mod.nameTr + '</strong><br>';

    // Giriş parametrelerini göster
    html += '<div style="margin-top: 8px; font-size: 11px; color: #666;">';
    html += '<strong>Giriş:</strong> ';
    const inputStrs = mod.params.map(p => {
      const val = inputs[p.name];
      if (p.type === 'array') {
        return p.label + '=[' + (Array.isArray(val) ? val.length : 0) + ' satır]';
      }
      return p.label + '=' + (typeof val === 'number' ? val.toFixed(2) : val) + (p.unit ? ' ' + p.unit : '');
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
    resultsContainer.innerHTML = html;
  }

  // ─── Hata göster (containerId desteği ile) ────────────────────────────
  function showErrorUI(msg, containerId) {
    const resultsContainer = containerId
      ? document.getElementById('ek-hesaplar-results-' + containerId)
      : getContainers().resultsContainer;
    if (!resultsContainer) return;

    let html = '<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 6px; margin-top: 12px; color: #b91c1c;">';
    html += '<strong>✗ Hata:</strong> ' + msg;
    html += '</div>';
    resultsContainer.innerHTML = html;
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

  // ─── Render fonksiyonu (render(containerId, categoryFilter)) ───────────
  function render(containerId, categoryFilter) {
    // Container bulundu mu?
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn('Container bulunamadı: ' + containerId);
      return;
    }

    // HTML yapı oluştur (dropdown + form + results)
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <select id="ek-hesaplar-modul-select-${containerId}" style="padding: 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; color: #1a1f28; font-size: 13px;">
          <option value="">-- Modül Seçin --</option>
        </select>
        <div id="ek-hesaplar-form-container-${containerId}" style="display: flex; flex-direction: column; gap: 10px;"></div>
        <button id="ek-hesaplar-btn-calculate-${containerId}" style="padding: 8px 12px; background: #3b82f6; color: white; border: 1px solid #3b82f6; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">Hesapla</button>
        <div id="ek-hesaplar-results-${containerId}"></div>
      </div>
    `;

    // Dropdown doldur (category filtresi ile)
    const dropdown = document.getElementById('ek-hesaplar-modul-select-' + containerId);
    if (!dropdown) {
      console.warn('Dropdown oluşturulamadı: ' + containerId);
      return;
    }

    // Config modüllerini category'ye göre filtrele ve dropdown'a ekle
    config.forEach((mod, idx) => {
      if (categoryFilter && mod.category !== categoryFilter) {
        return;
      }

      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = mod.nameTr || mod.id;
      dropdown.appendChild(opt);
    });

    // Change event
    dropdown.addEventListener('change', function(e) {
      onModuleChanged(e, containerId);
    });

    // Hesapla buton
    const calculateBtn = document.getElementById('ek-hesaplar-btn-calculate-' + containerId);
    if (calculateBtn) {
      calculateBtn.addEventListener('click', function() {
        onCalculate(containerId);
      });
    }
  }

  // ─── Başlat (geriye dönük uyumluluk) ───────────────────────────────────
  function init() {
    const containers = getContainers();
    if (!containers.dropdown || !containers.calculateBtn) {
      console.warn('Ek Hesaplar UI öğeleri bulunamadı.');
      return;
    }

    initDropdown(null); // null = tüm modüller
    containers.calculateBtn.addEventListener('click', onCalculate);
  }

  // DOM hazır olduktan sonra eski şekilde başlat (geriye dönük uyumluluk)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // init(); // Eski şekilde otomatik başlatma devre dışı, sadece parametreleriyle çağrılacak
  }

  // Export
  if (typeof window !== 'undefined') {
    window.EkHesaplarUI = {
      init: init,
      render: render,
      showResult: showResult,
      showError: showError
    };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, render };
  }
})();
