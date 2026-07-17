// Duman Tahliye / Egzoz Ön Hesapları (smoke-extract.js) — EN 12101
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// ACH bazlı ve alan bazlı duman tahliye debisi, taze hava telafisi.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // ACH bazli duman tahliye debisi.
  // V_m3: hacim (m3) — KULLANICI GIRDISI.
  // ach: hava degisim hizi (ACH, 1/saat) — KULLANICI GIRDISI.
  //      EN 12101 yonetmelik degeri (TEYIT).
  // Q_m3h = V_m3 * ach
  // Varsayilan deger VERILMEZ; kullanici girecek.
  function achExtract(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var v = _num(opts.V_m3);
    var a = _num(opts.ach);
    if (!isFinite(v) || v < 0) return NaN;
    if (!isFinite(a) || a < 0) return NaN;
    var q = v * a;
    return Math.round(q * 1000) / 1000; // 3 ondalik
  }

  // Alan bazli duman tahliye debisi (atrium / kapali otopark).
  // A_m2: alan (m2) — KULLANICI GIRDISI.
  // debit_m3h_m2: alan basi debi (m3/h.m2) — KULLANICI GIRDISI (TEYIT).
  // Q_m3h = A_m2 * debit_m3h_m2
  function areaExtract(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var a = _num(opts.A_m2);
    var d = _num(opts.debit_m3h_m2);
    if (!isFinite(a) || a < 0) return NaN;
    if (!isFinite(d) || d < 0) return NaN;
    var q = a * d;
    return Math.round(q * 1000) / 1000; // 3 ondalik
  }

  // Taze hava (makeup air) tahmini — tahliye debisenin bir orani.
  // Q_extract_m3h: toplam duman tahliye debisi (m3/h).
  // oran: taze hava orani (0-1, GIRDI ZORUNLU, varsayilan VERME).
  //       Tipik araligi 0.85-0.9 (yorumda belirt).
  // Q_makeup_m3h = Q_extract_m3h * oran
  // Parametre eksikse NaN donsun.
  function makeupAirEstimate(Q_extract_m3h, oran) {
    var q = _num(Q_extract_m3h);
    var r = _num(oran);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(r) || r < 0) return NaN;
    var result = q * r;
    return Math.round(result * 1000) / 1000; // 3 ondalik
  }

  var api = {
    achExtract: achExtract,
    areaExtract: areaExtract,
    makeupAirEstimate: makeupAirEstimate
  };
  if (typeof window !== 'undefined') window.SmokeExtract = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
