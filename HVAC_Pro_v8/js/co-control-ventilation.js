// CO Sensör Kontrollü Otopark Havalandirma (co-control-ventilation.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// CO sensörü kontrollü degisken debili havalandirma min/max ACH limitleri.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // CO sensörü kontrollü debi: min ve max ACH limitlerinden
  // iki debi limiti hesapla.
  // V_m3: otopark hacmi (m3) — KULLANICI GIRDISI (ZORUNLU).
  // ach_min: minimum hava degisim hizi (ACH, 1/saat) — KULLANICI GIRDISI (ZORUNLU).
  //          TEYIT: Yonetmelik/CO sensör kontrol bandı TEYIT EDILMELI.
  // ach_max: maksimum hava degisim hizi (ACH, 1/saat) — KULLANICI GIRDISI (ZORUNLU).
  //          TEYIT: Yonetmelik/CO sensör kontrol bandı TEYIT EDILMELI.
  // Q_min_m3h = V_m3 * ach_min
  // Q_max_m3h = V_m3 * ach_max
  // Doner: {Q_min_m3h, Q_max_m3h} objesi.
  function coBasedFlow(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var v = _num(opts.V_m3);
    var amin = _num(opts.ach_min);
    var amax = _num(opts.ach_max);
    if (!isFinite(v) || v < 0) return NaN;
    if (!isFinite(amin) || amin < 0) return NaN;
    if (!isFinite(amax) || amax < 0) return NaN;
    var q_min = v * amin;
    var q_max = v * amax;
    return {
      Q_min_m3h: Math.round(q_min * 1000) / 1000,
      Q_max_m3h: Math.round(q_max * 1000) / 1000
    };
  }

  // CO seviyesi kontrol: CO ppm'i esik ile karsilastir.
  // co_ppm: Olculen CO konsantrasyonu (ppm) — KULLANICI GIRDISI (ZORUNLU).
  // esik_ppm: CO esik degeri (ppm) — KULLANICI GIRDISI (ZORUNLU).
  //           TEYIT: Yonetmelik CO esik degeri TEYIT EDILMELI.
  // Doner: true ise co_ppm > esik_ppm (fan hizini artir), false ise altinda.
  // NOT: Tasarim karari veya otomasyon mantigi ICERMEZ; basit karsilastirma.
  function coLevelCheck(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var co = _num(opts.co_ppm);
    var thr = _num(opts.esik_ppm);
    if (!isFinite(co) || co < 0) return NaN;
    if (!isFinite(thr) || thr < 0) return NaN;
    return co > thr;
  }

  var api = {
    coBasedFlow: coBasedFlow,
    coLevelCheck: coLevelCheck
  };
  if (typeof window !== 'undefined') window.COControlVentilation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
