// ═══════════════════════════════════════════════════════════════════
// GROQ AI AJAN MODÜLÜ — Tam yazılım kontrolü
// Model: llama-3.3-70b-versatile  |  128k context, ücretsiz
// Proxy: localhost:3001 (start.bat) | Direct: console.groq.com key
// ═══════════════════════════════════════════════════════════════════

const GrokAPI = (() => {
  const PROXY_URL  = 'http://localhost:3001/api/groq';
  const PROXY_STAT = 'http://localhost:3001/api/status';
  const DIRECT_URL = 'https://api.groq.com/openai/v1/chat/completions';
  const MODEL      = 'llama-3.3-70b-versatile';
  let   _model     = MODEL;   // kullanıcı seçebilir (setModel)
  function setModel(m){ if(m) _model = m; }
  function getModel(){ return _model; }
  const MAX_HIST   = 20;
  const MAX_CTX    = 8000;
  const TIMEOUT    = 45000;

  let _history   = [];
  let _abortCtrl = null;
  let _lastKey   = '';
  let _proxyOk   = null;

  // ─── Proxy kontrolü ─────────────────────────────────────────────
  async function checkProxy() {
    try {
      const res  = await fetch(PROXY_STAT, { signal: AbortSignal.timeout(1500) });
      const data = await res.json();
      _proxyOk = data.ok;
      var _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
      _setProxyStatus(_proxyOk, _proxyOk
        ? (_isEN ? 'Groq proxy active — AI agent ready' : 'Groq proxy aktif — AI ajan hazır')
        : (_isEN ? 'Proxy running but GROQ_API_KEY is missing' : 'Proxy var ama GROQ_API_KEY eksik'));
      if (_proxyOk) _hideKeyInput();
    } catch (e) {
      _proxyOk = false;
      var _isEN2 = (typeof LANG !== 'undefined' && LANG === 'en');
      _setProxyStatus(null, _isEN2
        ? 'No proxy — start start.bat or enter a key'
        : 'Proxy yok — start.bat ile başlatın veya key girin');
    }
    return _proxyOk;
  }

  function _setProxyStatus(ok, msg) {
    var dot = document.getElementById('apiStatusDot');
    var txt = document.getElementById('apiStatusTxt');
    if (dot) dot.style.background = ok === true ? 'var(--gr)' : ok === false ? 'var(--rd)' : 'var(--gd)';
    if (txt) txt.textContent = msg;
    var badge = document.getElementById('proxyBadge');
    if (badge) badge.style.display = ok === true ? 'flex' : 'none';
  }

  function _hideKeyInput() {
    var wrap = document.getElementById('apiKeyWrap');
    if (wrap) wrap.style.display = 'none';
    var btn = document.getElementById('testGroqBtn');
    if (btn) btn.style.display = 'none';
  }

  // ─── Key yönetimi ────────────────────────────────────────────────
  function getKey() {
    if (_proxyOk) return '__proxy__';
    var el = document.getElementById('gemini_key');
    var k  = el ? el.value.trim() : '';
    if (k) { _lastKey = k; try { sessionStorage.setItem('hvac_groq_key', k); } catch(e){} }
    return k || _lastKey;
  }

  function loadSavedKey() {
    try {
      var k = sessionStorage.getItem('hvac_groq_key');
      if (k) { _lastKey = k; var el = document.getElementById('gemini_key'); if (el && !el.value) el.value = k; }
    } catch(e) {}
    checkProxy();
  }

  // ─── Proje bağlamı ──────────────────────────────────────────────
  function buildContext() {
    var P   = window.globalParams || {};
    var n   = function(v) { return isNaN(+v) ? 0 : +v || 0; };
    var _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
    var fmt = function(v, d) { return n(v).toLocaleString(_isEN ? 'en-US' : 'tr-TR', { maximumFractionDigits: d || 0 }); };

    if (!window.globalResults || !window.globalResults.length) {
      return _isEN
        ? 'PROJECT: ' + (P.prjAdi||'Undefined') + ' | City: ' + (P.sehir||'-') + '\nNo calculation run yet.'
        : 'PROJE: ' + (P.prjAdi||'Tanimsiz') + ' | Sehir: ' + (P.sehir||'-') + '\nHenuz hesap yapilmamis.';
    }

    var mahaller = (window.globalResults || []).map(function(r) {
      return {
        no: r.mahalNo, adi: r.mahalAdi, tip: r.mahalTip,
        m2: n(r.alan), kisi: r.nToplam || 0,
        sog_kW: +(n(r.bestLoad)/1000).toFixed(2),
        ist_kW: +(n(r.qKayip)/1000).toFixed(2),
        wmq: r.alan > 0 ? Math.round(n(r.bestLoad)/n(r.alan)) : 0,
        peak: (r.bestAy||'') + '/' + (r.bestSaat||'') + 'h',
        cihaz: r.cihaz ? r.cihaz.model + ' x' + r.cihaz.adet : '-',
        th_ls: Math.round(n(r.thData && r.thData.th)),
        yon: r.yon || '-'
      };
    });

    var totSog  = mahaller.reduce(function(s,r){ return s+r.sog_kW; }, 0);
    var totIst  = mahaller.reduce(function(s,r){ return s+r.ist_kW; }, 0);
    var totAlan = mahaller.reduce(function(s,r){ return s+r.m2; }, 0);

    var ctx = 'PROJE: ' + (P.prjAdi||'-') + ' | No:' + (P.prjNo||'-') + ' | Muh:' + (P.kim||'-') + '\n' +
      'IKLIM: Yaz ' + (P.yazKt||'?') + 'C / Kis ' + (P.kisKt||'?') + 'C | DR:' + (P.dr||'?') + ' | SHGC:' + (P.shgc||'?') + '\n' +
      'SISTEM: ' + (P.sistem||'?') + ' | Unite: ' + (P.icUniteTip||'?') + '\n' +
      'TOPLAM: Sog=' + fmt(totSog,1) + 'kW | Ist=' + fmt(totIst,1) + 'kW | Alan=' + fmt(totAlan) + 'm2\n' +
      'MAHALLER (' + mahaller.length + '):\n' + JSON.stringify(mahaller);

    if (ctx.length > MAX_CTX) ctx = ctx.slice(0, MAX_CTX) + '...(kisaltildi)';
    return ctx;
  }

  // ─── Ajan sistem promptu ─────────────────────────────────────────
  function buildSysPrompt(ctx) {
    var step = window._wizStep || 1;
    var stepHint = window._wizStepHint || '';
    return [
      'Sen HVAC Hesap Pro v8 yaziliminin AKILLI AJAN asistanisin.',
      'Kullanicinin isteklerini anlayip YAZILIMI KENDIN KONTROL EDERSIN.',
      'Turkce yaz. Teknik, net ve eyleme odakli ol.',
      '',
      '=== AJAN KONTROL SISTEMI ===',
      'Eylem yapmak icin mesajina JSON_COMMANDS bloku ekle:',
      '```json_commands',
      '[{"action":"eylem_adi", ...parametreler}]',
      '```',
      'Birden fazla eylem ayni blokta olabilir.',
      '',
      '=== TUM EYLEMLER ===',
      '',
      '1. go_to_step: {"action":"go_to_step","step":N}',
      '   N=1 Veri Yukleme, 2=Parametreler, 3=Havalandirma, 4=Sonuclar',
      '',
      '2. set_field: {"action":"set_field","id":"ALAN_ID","value":"DEGER"}',
      '   Kullanilabilir alanlar:',
      '   IKLIM: p_sehir, p_yaz_kt, p_yaz_yt, p_kis_kt, p_dr',
      '   SISTEM: p_sistem(fancoil/wlhp/vrf/split/hassas), p_ic_unite',
      '   HESAP: p_oda_zam(%), p_eff_zam(%), p_fayd, p_shgc(0-1)',
      '   IC KOSUL: p_ic_kt, p_ic_rh, p_ic_kt_kis, p_ic_nem',
      '   EMNIYET: p_em_sog(%), p_em_ist(%)',
      '   ISIL: p_th_k(W/m2K), p_igk(Isi Geri Kazanim Verimi, %)',
      '   HAVALANDIR: p_th_std(ASHRAE/TS825/EN12831/MANUEL), p_th_min, p_th_eff',
      '   DIGER: p_wind(1.07/1.00), p_isletme(1/2), p_ruzgar(m/s)',
      '   PROJE: p_prjadi, p_prjno, p_kim, p_sirket',
      '',
      '3. run_calculation: {"action":"run_calculation"}',
      '',
      '4. refresh_calc: {"action":"refresh_calc"}',
      '   (parametreler degistikten sonra hesabi yenile)',
      '',
      '5. update_cell: {"action":"update_cell","mahal":"MAHAL_NO","field":"ALAN","value":DEGER}',
      '   Alanlar: alan, yukseklik, kisi, cam, yon(K/G/D/B/KD/GD/GB/KB)',
      '',
      '6. bulk_update: {"action":"bulk_update","filter":{"tip":"ofis"},"set":{"kisi":6}}',
      '   filter secenekleri: tip, yon, min_alan, max_alan',
      '   set: alan, yukseklik, kisi, cam, yon ve diger alanlar',
      '',
      '7. apply_safety: {"action":"apply_safety","factor":1.2,"target":"sog"}',
      '   target: sog(sogutma), ist(isitma), her(ikisi)',
      '',
      '8. apply_standard: {"action":"apply_standard","standard":"ASHRAE62.1"}',
      '   Standartlar: ASHRAE62.1, TS825, EN12831',
      '',
      '9. export: {"action":"export","format":"pdf"}',
      '   format: pdf, excel, word',
      '',
      '10. set_theme: {"action":"set_theme","theme":"dark-pro"}',
      '    Temalar: dark-pro, midnight, ocean, light-pro, warm',
      '',
      '11. highlight: {"action":"highlight","id":"ALAN_ID"}',
      '',
      '12. toast: {"action":"toast","text":"Mesaj","color":"green"}',
      '    color: green, red, blue',
      '',
      '13. add_room: {"action":"add_room","adi":"Ofis 101","tip":"ofis","alan":50,"kisi":5,"yon":"K"}',
      '',
      '14. set_language: {"action":"set_language","lang":"en"}',
      '',
      '=== MUHENDISLIK STANDARTLARI ===',
      'ASHRAE 62.1: Ofis 2.5 L/s/kisi + 0.3 L/s/m2 | Toplanti 5 L/s/kisi | WC 25 L/s',
      'Spesifik sogutma: Ofis 50-100 W/m2 | Toplanti 100-150 W/m2 | WC 30-60 W/m2',
      'Konfor: Yaz 22-26C | Kis 20-24C | RH 40-60%',
      'Duvar U degeri: <=0.45 W/m2K | Pencere: <=2.4 W/m2K',
      '',
      '=== ORNEK KULLANIM ===',
      'Kullanici: "SHGC yi 0.65 yap ve hesapla"',
      'Cevap: SHGC 0.65 yapiliyor ve hesap yenileniyor.',
      '```json_commands',
      '[{"action":"set_field","id":"p_shgc","value":"0.65"},{"action":"run_calculation"}]',
      '```',
      '',
      'Kullanici: "tum ofis mahallerinin kisi sayisini 8 yap"',
      'Cevap: Ofis mahalleri guncelleniyor.',
      '```json_commands',
      '[{"action":"bulk_update","filter":{"tip":"ofis"},"set":{"kisi":8}},{"action":"refresh_calc"}]',
      '```',
      '',
      '=== MEVCUT DURUM ===',
      'Aktif adim: ' + step + ' | ' + stepHint,
      '',
      '=== PROJE VERISI ===',
      ctx
    ].join('\n');
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  function _sleep(ms) { return new Promise(function(r){ setTimeout(r, ms); }); }

  function _addStatus(msg) {
    if (typeof window.addAiMsg === 'function') window.addAiMsg('sys', msg);
  }

  function _highlight(el) {
    if (!el) return;
    el.classList.remove('ai-field-highlight');
    void el.offsetWidth;
    el.classList.add('ai-field-highlight');
    setTimeout(function(){ el.classList.remove('ai-field-highlight'); }, 2000);
  }

  // ─── Fetch ───────────────────────────────────────────────────────
  async function _fetch(messages, opts) {
    opts = opts || {};
    var maxRetry = opts.retry !== undefined ? opts.retry : 2;
    var lastErr;

    if (_proxyOk) {
      for (var attempt = 0; attempt <= maxRetry; attempt++) {
        _abortCtrl = new AbortController();
        var timer = setTimeout(function(){ _abortCtrl.abort(); }, TIMEOUT);
        try {
          var res = await fetch(PROXY_URL, {
            method: 'POST', signal: _abortCtrl.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: _model, messages, temperature: opts.temperature ?? 0.3, max_tokens: opts.max_tokens ?? 2048 })
          });
          clearTimeout(timer);
          if (res.status === 429) {
            var wait = parseInt(res.headers.get('retry-after') || '5', 10) * 1000;
            if (attempt < maxRetry) { _addStatus('Rate limit — ' + Math.round(wait/1000) + 's bekleniyor...'); await _sleep(wait); continue; }
          }
          var data = await res.json();
          if (!res.ok || data.error) throw new Error((data.error && data.error.message) || ('HTTP ' + res.status));
          return data;
        } catch (err) {
          clearTimeout(timer);
          if (err.name === 'AbortError') throw new Error('Zaman asimi. Sunucu acik mi? (start.bat)');
          lastErr = err;
          if (attempt < maxRetry) { _addStatus('Yeniden (' + (attempt+1) + ')...'); await _sleep(1200*(attempt+1)); }
        }
      }
      throw lastErr;
    }

    var key = getKey();
    if (!key || key === '__proxy__') {
      throw new Error('Groq bagli degil.\n① start.bat ile sunucuyu baslatin\n② Sag paneldeki key alanina gsk_... yapistirin (console.groq.com)');
    }
    for (var att = 0; att <= maxRetry; att++) {
      _abortCtrl = new AbortController();
      var tmr = setTimeout(function(){ _abortCtrl.abort(); }, TIMEOUT);
      try {
        var r2 = await fetch(DIRECT_URL, {
          method: 'POST', signal: _abortCtrl.signal,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({ model: _model, messages, temperature: opts.temperature ?? 0.3, max_tokens: opts.max_tokens ?? 2048 })
        });
        clearTimeout(tmr);
        if (r2.status === 429) {
          var w2 = parseInt(r2.headers.get('retry-after') || '5', 10) * 1000;
          if (att < maxRetry) { _addStatus('Rate limit — ' + Math.round(w2/1000) + 's...'); await _sleep(w2); continue; }
        }
        var d2 = await r2.json();
        if (!r2.ok || d2.error) {
          var m2 = (d2.error && d2.error.message) || ('HTTP ' + r2.status);
          if (r2.status === 401) throw new Error('API key gecersiz: ' + m2);
          throw new Error(m2);
        }
        return d2;
      } catch (err2) {
        clearTimeout(tmr);
        if (err2.name === 'AbortError') throw new Error('Zaman asimi (45s).');
        lastErr = err2;
        if (att < maxRetry) { _addStatus('Hata: ' + err2.message); await _sleep(1500*(att+1)); }
      }
    }
    throw lastErr;
  }

  // ─── Ajan komut yürütücü ─────────────────────────────────────────
  function _execCmd(cmd) {
    var results = [];
    try {
      switch (cmd.action) {

        case 'go_to_step':
          if (typeof goToStep === 'function') goToStep(parseInt(cmd.step) || 1);
          results.push('✅ ' + cmd.step + '. adima gecildi');
          break;

        case 'set_field': {
          var el = document.getElementById(cmd.id);
          if (!el) { results.push('❌ Alan bulunamadi: ' + cmd.id); break; }
          var oldVal = el.value;
          el.value = String(cmd.value);
          el.dispatchEvent(new Event('change', {bubbles:true}));
          el.dispatchEvent(new Event('input',  {bubbles:true}));
          _highlight(el);
          results.push('✅ ' + cmd.id + ': ' + oldVal + ' → ' + cmd.value);
          break;
        }

        case 'run_calculation':
          if (typeof runHesap === 'function') { setTimeout(runHesap, 300); results.push('✅ Hesap baslatildi'); }
          else results.push('❌ runHesap bulunamadi');
          break;

        case 'refresh_calc':
          if (window.globalResults && window.globalResults.length) {
            if (typeof updateHesiYuku === 'function') { setTimeout(updateHesiYuku, 300); results.push('✅ Hesap yenilendi'); }
            else if (typeof runHesap === 'function') { setTimeout(runHesap, 300); results.push('✅ Hesap yenilendi'); }
          } else if (typeof runHesap === 'function') { setTimeout(runHesap, 300); results.push('✅ Hesap baslatildi'); }
          break;

        case 'update_cell': {
          var mahalNo = parseInt(cmd.mahal || cmd.no || 0);
          var field   = String(cmd.field || '');
          var val     = isNaN(+cmd.value) ? cmd.value : +cmd.value;
          var src     = window.globalData || [];
          var row     = src.find(function(r){ return r.mahalNo == mahalNo; });
          if (row) { row[field] = val; results.push('✅ Mahal #' + mahalNo + ' ' + field + '=' + val); }
          else results.push('❌ Mahal #' + mahalNo + ' bulunamadi');
          break;
        }

        case 'bulk_update': {
          var filter = cmd.filter || {};
          var set    = cmd.set || {};
          var src2   = window.globalData || [];
          if (!src2.length) { results.push('❌ Veri yuklenmemis'); break; }
          var count  = 0;
          src2.forEach(function(r) {
            if (filter.tip      && (r.mahalTip||'').toLowerCase() !== filter.tip.toLowerCase()) return;
            if (filter.yon      && r.yon !== filter.yon) return;
            if (filter.min_alan && +r.alan < +filter.min_alan) return;
            if (filter.max_alan && +r.alan > +filter.max_alan) return;
            Object.keys(set).forEach(function(k){ r[k] = set[k]; });
            count++;
          });
          results.push('✅ ' + count + ' mahale ' + JSON.stringify(set) + ' uygulandi');
          if (count > 0) setTimeout(function(){ typeof updateHesiYuku === 'function' && updateHesiYuku(); }, 400);
          break;
        }

        case 'apply_safety': {
          var factor = parseFloat(cmd.factor) || 1.1;
          var target = cmd.target || 'her';
          var pct    = Math.round((factor - 1) * 100);
          if (target === 'sog' || target === 'her') {
            var emS = document.getElementById('p_em_sog');
            if (emS) { emS.value = pct; _highlight(emS); emS.dispatchEvent(new Event('change')); }
          }
          if (target === 'ist' || target === 'her') {
            var emI = document.getElementById('p_em_ist');
            if (emI) { emI.value = pct; _highlight(emI); emI.dispatchEvent(new Event('change')); }
          }
          results.push('✅ x' + factor + ' emniyet katsayisi uygulandi (% ' + pct + ')');
          if (window.globalResults && window.globalResults.length) {
            setTimeout(function(){ typeof updateHesiYuku === 'function' && updateHesiYuku(); }, 400);
          }
          break;
        }

        case 'apply_standard': {
          var std = (cmd.standard || '').toUpperCase();
          var stdEl = document.getElementById('p_th_std');
          if (stdEl) {
            var v = std.includes('ASHRAE') ? 'ASHRAE' : std.includes('TS') ? 'TS825' : std.includes('EN') ? 'EN12831' : 'ASHRAE';
            stdEl.value = v; _highlight(stdEl); stdEl.dispatchEvent(new Event('change'));
          }
          if (std.includes('ASHRAE')) {
            var minEl = document.getElementById('p_th_min');
            if (minEl) { minEl.value = '10'; _highlight(minEl); }
          }
          results.push('✅ ' + std + ' standardi uygulandi');
          if (window.globalResults && window.globalResults.length) {
            setTimeout(function(){ typeof updateHesiYuku === 'function' && updateHesiYuku(); }, 500);
          }
          break;
        }

        case 'export': {
          var fmt = (cmd.format || '').toLowerCase();
          var fns = { pdf: 'exportHAP_PDF', excel: 'exportExcel', xlsx: 'exportExcel', word: 'exportWord' };
          var fn  = fns[fmt];
          if (fn && typeof window[fn] === 'function') {
            setTimeout(window[fn], 300);
            results.push('✅ ' + fmt.toUpperCase() + ' disa aktariliyor');
          } else results.push('❌ Format bilinmiyor: ' + cmd.format);
          break;
        }

        case 'set_theme':
          if (typeof setTheme === 'function') { setTheme(cmd.theme); results.push('✅ Tema: ' + cmd.theme); }
          else results.push('❌ setTheme bulunamadi');
          break;

        case 'highlight': {
          var el2 = document.getElementById(cmd.id);
          if (el2) { _highlight(el2); el2.scrollIntoView({behavior:'smooth', block:'center'}); results.push('✅ ' + cmd.id + ' vurgulandi'); }
          else results.push('❌ ' + cmd.id + ' bulunamadi');
          break;
        }

        case 'toast': {
          var color = cmd.color === 'red' ? 'var(--rd)' : cmd.color === 'green' ? 'var(--gr)' : 'var(--bl)';
          if (typeof showToast === 'function') showToast(cmd.text || '', color);
          results.push('✅ Mesaj gosterildi');
          break;
        }

        case 'set_language':
          if (typeof switchLang === 'function') { switchLang(cmd.lang); results.push('✅ Dil degistirildi'); }
          break;

        case 'add_room':
          if (typeof openYeniMahalModal === 'function') {
            openYeniMahalModal();
            var fmap = { adi:'nm_adi', tip:'nm_tip', alan:'nm_alan', kisi:'nm_kisi', yon:'nm_yon', yukseklik:'nm_yukseklik', cam:'nm_cam' };
            Object.keys(fmap).forEach(function(k){
              if (cmd[k] !== undefined) {
                var el3 = document.getElementById(fmap[k]);
                if (el3) el3.value = cmd[k];
              }
            });
            results.push('✅ Mahal formu acildi — veri dolduruldu, onaylayin');
          } else results.push('❌ openYeniMahalModal bulunamadi');
          break;

        default:
          results.push('⚠ Bilinmeyen eylem: ' + cmd.action);
      }
    } catch(e) {
      results.push('❌ Hata (' + (cmd.action||'?') + '): ' + e.message);
    }
    return results;
  }

  // ─── JSON komut parse + yürüt ────────────────────────────────────
  function _parseAndApply(text) {
    var match = text.match(/```json_commands\s*([\s\S]*?)```/);
    if (!match) return '';
    var feedback = '';
    try {
      var cmds = JSON.parse(match[1].trim());
      if (!Array.isArray(cmds)) cmds = [cmds];
      var allResults = [];
      cmds.forEach(function(cmd){ allResults = allResults.concat(_execCmd(cmd)); });
      if (allResults.length) {
        feedback = '<div class="ai-action-feed">' + allResults.join('<br>') + '</div>';
      }
    } catch (e) {
      feedback = '<div style="color:var(--rd);font-size:9px;font-family:var(--mono);margin-top:6px;">⚠ Parse hatasi: ' + e.message + '</div>';
    }
    return feedback;
  }

  // ─── Geçmiş yönetimi ─────────────────────────────────────────────
  function clearHistory() { _history = []; }
  function _trimHistory() { if (_history.length > MAX_HIST) _history = _history.slice(-MAX_HIST); }

  // ─── Ana send ────────────────────────────────────────────────────
  async function send(userText) {
    if (!userText || !userText.trim()) return;
    var ctx      = buildContext();
    var sysP     = buildSysPrompt(ctx);
    var messages = [{ role: 'system', content: sysP }].concat(_history).concat([{ role: 'user', content: userText }]);
    var data     = await _fetch(messages);
    var text     = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(Yanit alinamadi)';
    _history.push({ role: 'user',      content: userText });
    _history.push({ role: 'assistant', content: text });
    _trimHistory();
    var cmdFeedback = _parseAndApply(text);
    var displayText = text.replace(/```json_commands[\s\S]*?```/g, '').trim();
    return { text: displayText, cmdFeedback: cmdFeedback };
  }

  async function test() {
    var data = await _fetch([{ role: 'user', content: 'Reply with: OK' }], { temperature: 0, max_tokens: 8, retry: 0 });
    return !!(data.choices && data.choices[0] && data.choices[0].message);
  }

  // ─── Ham soru-cevap (agent komut işlemeden düz metin/JSON döner) ──
  async function ask(prompt, opts) {
    opts = opts || {};
    var messages = opts.system
      ? [{ role: 'system', content: opts.system }, { role: 'user', content: prompt }]
      : [{ role: 'user', content: prompt }];
    var data = await _fetch(messages, { temperature: opts.temperature ?? 0.1, max_tokens: opts.max_tokens ?? 700, retry: opts.retry ?? 1 });
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  }

  async function suggestBulkEdit() {
    if (!window.globalResults || !window.globalResults.length) throw new Error('Once hesabi calistirin.');
    var snapshot = window.globalResults.slice(0, 20).map(function(r) {
      return { no: r.mahalNo, adi: r.mahalAdi, tip: r.mahalTip, sog: Math.round(+(r.bestLoad||0)), ist: Math.round(+(r.qKayip||0)) };
    });
    var prompt = 'Mahal listesi: ' + JSON.stringify(snapshot) + '\nToplu duzenleme json_commands uret.';
    var data = await _fetch([{ role: 'user', content: prompt }], { temperature: 0.1, max_tokens: 600, retry: 1 });
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  }

  function abort() { if (_abortCtrl) { _abortCtrl.abort(); _abortCtrl = null; } }
  function isProxyMode() { return _proxyOk === true; }

  return {
    send, test, ask, suggestBulkEdit, abort,
    setModel, getModel, isProxyMode, getKey, loadSavedKey,
    checkProxy, clearHistory, execCmd: _execCmd
  };
})();

window.GrokAPI = GrokAPI;

// Geriye uyumluluk
window.applyAICommands = function(cmds) {
  var results = [];
  (cmds || []).forEach(function(cmd){ results = results.concat(GrokAPI.execCmd(cmd)); });
  return results;
};
