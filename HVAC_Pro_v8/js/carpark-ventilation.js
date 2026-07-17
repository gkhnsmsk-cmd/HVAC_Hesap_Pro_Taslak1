// Gsem Mep Pro — Otopark Havalandirma Debisi Motoru (carpark-ventilation.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Normal isletme ve yangin modu ventilasyon gereksinimi (ACH/alan bazli).
// Jet fan sayisi kaba tahmini (itki, erisim mesafesi hesaba KATILMAZ).
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Normal isletme ventilasyon debisi (ACH bazli).
  // V_m3: otopark hacmi (m3) — KULLANICI GIRDISI.
  // ach: hava degisim hizi (ACH, 1/saat) — KULLANICI GIRDISI.
  //      Yonetmelige gore tipik 6 ACH (TEYIT).
  // Q_m3h = V_m3 * ach
  // Varsayilan deger VERILMEZ; kullanici girecek.
  function normalVentFlow(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var v = _num(opts.V_m3);
    var a = _num(opts.ach);
    if (!isFinite(v) || v < 0) return NaN;
    if (!isFinite(a) || a < 0) return NaN;
    var q = v * a;
    return Math.round(q * 1000) / 1000; // 3 ondalik
  }

  // Yangin modu ventilasyon debisi (alan bazli).
  // A_m2: otopark toplam alan (m2) — KULLANICI GIRDISI.
  // debit_m3h_m2: alan basi debi (m3/h.m2) — KULLANICI GIRDISI.
  //               Yangin yonetmeligi alan basi debi (TEYIT).
  // Q_m3h = A_m2 * debit_m3h_m2
  function fireVentFlow(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var a = _num(opts.A_m2);
    var d = _num(opts.debit_m3h_m2);
    if (!isFinite(a) || a < 0) return NaN;
    if (!isFinite(d) || d < 0) return NaN;
    var q = a * d;
    return Math.round(q * 1000) / 1000; // 3 ondalik
  }

  // Jet fan sayisi kaba tahmini.
  // Q_m3h: toplam ventilasyon debisi (m3/h).
  // tek_fan_m3h: tek fan kapasitesi (m3/h).
  // Sonuc = Math.ceil(Q_m3h / tek_fan_m3h)
  // NOT: Kaba tahmin; itki ve erisim mesafesi hesaba KATILMAZ.
  //      Detayli hesap CAD asamasinda yapilir — TASARIM KARARI ICERMEZ.
  function jetFanCountEstimate(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var q = _num(opts.Q_m3h);
    var f = _num(opts.tek_fan_m3h);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(f) || f <= 0) return NaN; // sifir bolme guvenli
    var count = Math.ceil(q / f);
    return count;
  }

  var api = {
    normalVentFlow: normalVentFlow,
    fireVentFlow: fireVentFlow,
    jetFanCountEstimate: jetFanCountEstimate
  };
  if (typeof window !== 'undefined') window.CarparkVentilation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
