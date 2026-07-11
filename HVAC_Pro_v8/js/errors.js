// HVAC Hesap Pro — Merkezi Hata Yakalama (errors.js)
// window hata olaylarini yakalar, okunur panel gosterir, persist.js varsa
// "son taslagi geri yukle" sunar. Tamamen eklemeli; motor'a dokunmaz.
(function () {
  var _log = [];
  function formatError(e) {
    if (!e) return 'Bilinmeyen hata';
    var m = e.message || (e.reason && (e.reason.message || e.reason)) || String(e);
    var src = e.filename ? String(e.filename).split('/').pop() : '';
    var ln = e.lineno ? (':' + e.lineno) : '';
    return String(m) + (src ? (' [' + src + ln + ']') : '');
  }
  function showPanel(rec) {
    try {
      if (typeof document === 'undefined' || !document.body) return;
      var lang = (typeof LANG !== 'undefined' && LANG === 'en');
      var bar = document.getElementById('_hvacErrBar');
      if (!bar) {
        bar = document.createElement('div'); bar.id = '_hvacErrBar';
        bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100000;background:#7f1d1d;color:#fff;padding:8px 16px;font-size:12px;display:flex;align-items:center;gap:12px;box-shadow:0 -2px 8px rgba(0,0,0,.3);';
        document.body.appendChild(bar);
      }
      bar.innerHTML = '';
      var msg = document.createElement('span'); msg.style.flex = '1';
      msg.textContent = (lang ? 'An error occurred: ' : 'Bir hata olustu: ') + rec.msg;
      bar.appendChild(msg);
      var canR = (typeof window !== 'undefined' && window.HvacPersist && window.HvacPersist.hasAutosave && window.HvacPersist.hasAutosave());
      if (canR) {
        var br = document.createElement('button');
        br.textContent = lang ? 'Restore last draft' : 'Son taslagi geri yukle';
        br.style.cssText = 'background:#10b981;color:#fff;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;';
        br.onclick = function () { try { window.HvacPersist.restoreLast(); } catch (e) {} bar.remove(); };
        bar.appendChild(br);
      }
      var bx = document.createElement('button');
      bx.textContent = lang ? 'Dismiss' : 'Kapat';
      bx.style.cssText = 'background:transparent;color:#fecaca;border:1px solid #b91c1c;border-radius:6px;padding:4px 10px;cursor:pointer;';
      bx.onclick = function () { bar.remove(); };
      bar.appendChild(bx);
    } catch (_) {}
  }
  function record(e) {
    var rec = { t: new Date().toISOString(), msg: formatError(e),
      stack: (e && ((e.error && e.error.stack) || (e.reason && e.reason.stack))) || '' };
    _log.push(rec); if (_log.length > 50) _log.shift();
    if (typeof console !== 'undefined') console.error('[HVAC hata]', rec.msg, rec.stack || '');
    showPanel(rec);
    return rec;
  }
  function install() {
    if (typeof window === 'undefined') return;
    window.addEventListener('error', function (e) { record(e); });
    window.addEventListener('unhandledrejection', function (e) { record(e); });
  }
  function wrap(fn, label) {
    return function () {
      try { return fn.apply(this, arguments); }
      catch (e) { record({ message: (label ? label + ': ' : '') + (e && e.message || e), error: e }); throw e; }
    };
  }
  var api = { install: install, wrap: wrap, record: record, getLog: function () { return _log.slice(); }, _pure: { formatError: formatError } };
  if (typeof window !== 'undefined') window.HvacErrors = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
