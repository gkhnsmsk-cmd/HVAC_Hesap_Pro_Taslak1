// Gsem Mep Pro — U-Deger Motoru (uvalue-engine.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// EN ISO 6946 esasli tabakalı yapı bilesenleri icin U-deger (isi gecirgenlik katsayisi).
// MALZEME KUTUPHANESI YOKTUR — lambda (isi iletkenlik) degeri KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // EN ISO 6946 varsayilan yuzey dirençleri (m2K/W).
  // Duvar (yatay isi akisi) icin: Rsi=0.13, Rse=0.04 — teyit (EN ISO 6946 Tablo).
  var DEFAULT_RSI = 0.13;
  var DEFAULT_RSE = 0.04;

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Tabakalarin toplam isil direncini (R) dondurur (m2K/W).
  // layers = [{ d_m, lambda }] ; d_m: kalinlik (m), lambda: isi iletkenlik (W/mK).
  // Gecersiz / negatif / sifir-lambda girdi -> o tabaka guvenli sekilde 0 direnç sayilir.
  function rTotal(layers, Rsi, Rse) {
    var rsi = (Rsi === undefined || Rsi === null) ? DEFAULT_RSI : _num(Rsi);
    var rse = (Rse === undefined || Rse === null) ? DEFAULT_RSE : _num(Rse);
    if (!isFinite(rsi) || rsi < 0) rsi = DEFAULT_RSI;
    if (!isFinite(rse) || rse < 0) rse = DEFAULT_RSE;

    var sum = 0;
    if (Array.isArray(layers)) {
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i] || {};
        var d = _num(L.d_m);
        var lam = _num(L.lambda);
        // Guvenli girdi: gecersiz/negatif kalinlik veya lambda -> tabaka atlanir.
        if (!isFinite(d) || d < 0) continue;
        if (!isFinite(lam) || lam <= 0) continue;
        sum += d / lam;
      }
    }
    return rsi + sum + rse;
  }

  // U = 1 / R_total  (W/m2K), 3 ondalik.
  function uValue(layers, Rsi, Rse) {
    var R = rTotal(layers, Rsi, Rse);
    if (!isFinite(R) || R <= 0) return NaN;
    return Math.round((1 / R) * 1000) / 1000;
  }

  var api = {
    DEFAULT_RSI: DEFAULT_RSI,
    DEFAULT_RSE: DEFAULT_RSE,
    rTotal: rTotal,
    uValue: uValue
  };
  if (typeof window !== 'undefined') window.UValue = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
