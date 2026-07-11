// HVAC Hesap Pro — Otomatik Kayit + Geri-Al (persist.js)
// Mevcut _projeDataOlustur() / yukleProjeVeri() uzerine kurulu.
// Saf halka/mantik (headless test edilebilir) + ince localStorage/DOM adaptoru ayrik.
// Motor'a DOKUNMAZ. Tamamen eklemeli; script satirini silmek = tam revert.
(function () {
  var KEY = 'hvac_autosave_v1';
  var MAX = 5;                 // donen snapshot halkasi boyutu
  var SCHEMA = 1;
  var QUOTA = 4 * 1024 * 1024; // ~4MB guvenlik siniri

  // ---------- SAF MANTIK (test edilebilir) ----------
  function pushSnapshot(ring, snap, max) {
    var r = (ring || []).slice();
    r.push(snap);
    max = max || MAX;
    while (r.length > max) r.shift();
    return r;
  }
  function readStore(raw) {
    try {
      var o = JSON.parse(raw);
      if (o && o.schema === SCHEMA && Array.isArray(o.ring)) return o;
    } catch (e) {}
    return { schema: SCHEMA, ring: [] };   // bozuk/yanlis surum -> temiz
  }
  function writeStore(store) {
    return JSON.stringify({ schema: SCHEMA, ring: (store && store.ring) || [] });
  }

  // ---------- localStorage ADAPTORU ----------
  function _ls() { return (typeof localStorage !== 'undefined') ? localStorage : null; }
  function _load() { var ls = _ls(); return readStore(ls ? ls.getItem(KEY) : null); }
  function _save(store) {
    var s = writeStore(store);
    if (s.length > QUOTA) { store.ring = store.ring.slice(-2); s = writeStore(store); }
    var ls = _ls(); if (ls) { try { ls.setItem(KEY, s); } catch (e) { /* kota */ } }
  }

  // ---------- DOM-bagli otomatik kayit / geri-al ----------
  var _timer = null;
  function autosave() {                 // debounce'lu
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(function () {
      try {
        if (typeof window === 'undefined' || typeof window._projeDataOlustur !== 'function') return;
        var data = window._projeDataOlustur();
        // bos proje kaydetme (mahal yoksa)
        if (!data || !data.mahalData || !data.mahalData.length) return;
        var store = _load();
        store.ring = pushSnapshot(store.ring, { t: new Date().toISOString(), data: data }, MAX);
        _save(store);
      } catch (e) { if (typeof console !== 'undefined') console.error('autosave hata:', e); }
    }, 1500);
  }
  function hasAutosave() { return _load().ring.length > 0; }
  function lastSnapshot() { var r = _load().ring; return r.length ? r[r.length - 1] : null; }
  function snapshotCount() { return _load().ring.length; }
  function restoreLast() {
    var snap = lastSnapshot();
    if (snap && typeof window !== 'undefined' && typeof window.yukleProjeVeri === 'function') {
      window.yukleProjeVeri(snap.data); return true;
    }
    return false;
  }
  function undo() {                     // bir onceki snapshot'a don
    var store = _load();
    if (store.ring.length < 2) return false;
    store.ring.pop();                   // mevcudu at
    _save(store);
    return restoreLast();
  }
  function clearAll() { var ls = _ls(); if (ls) ls.removeItem(KEY); }

  function offerRestore() {
    try {
      if (typeof document === 'undefined' || !hasAutosave()) return;
      if (typeof window !== 'undefined' && window.globalData && window.globalData.length) return;
      if (document.getElementById('_hvacRestoreBar')) return;
      var snap = lastSnapshot(); if (!snap) return;
      var lang = (typeof LANG !== 'undefined' && LANG === 'en');
      var when = ''; try { when = new Date(snap.t).toLocaleString(); } catch (e) {}
      var bar = document.createElement('div');
      bar.id = '_hvacRestoreBar';
      bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1e293b;color:#fff;padding:8px 16px;font-size:13px;display:flex;align-items:center;gap:12px;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);';
      var msg = document.createElement('span');
      msg.textContent = (lang ? 'A recoverable draft was found' : 'Kurtarilabilir bir taslak bulundu') + (when ? (' (' + when + ')') : '') + '.';
      var btnR = document.createElement('button');
      btnR.textContent = lang ? 'Restore' : 'Geri Yukle';
      btnR.style.cssText = 'background:#10b981;color:#fff;border:none;border-radius:6px;padding:5px 12px;cursor:pointer;font-weight:600;';
      btnR.onclick = function () { if (restoreLast()) { bar.remove(); if (typeof _toast === 'function') _toast(lang ? 'Draft restored' : 'Taslak geri yuklendi'); } };
      var btnX = document.createElement('button');
      btnX.textContent = lang ? 'Dismiss' : 'Kapat';
      btnX.style.cssText = 'background:transparent;color:#cbd5e1;border:1px solid #475569;border-radius:6px;padding:5px 12px;cursor:pointer;';
      btnX.onclick = function () { bar.remove(); };
      bar.appendChild(msg); bar.appendChild(btnR); bar.appendChild(btnX);
      document.body.appendChild(bar);
    } catch (e) { if (typeof console !== 'undefined') console.error('offerRestore hata:', e); }
  }

  var api = {
    autosave: autosave, hasAutosave: hasAutosave, lastSnapshot: lastSnapshot,
    snapshotCount: snapshotCount, restoreLast: restoreLast, undo: undo, clearAll: clearAll, offerRestore: offerRestore,
    _pure: { pushSnapshot: pushSnapshot, readStore: readStore, writeStore: writeStore, MAX: MAX, SCHEMA: SCHEMA }
  };
  if (typeof window !== 'undefined') window.HvacPersist = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
