// HVAC Hesap Pro — Basınçlı Hava Talebi (compressed-air.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Basınçlı hava sistemleri için alet debisi ve zamanlilik faktörü hesaplamaları.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // airDemand: Basınçlı hava talebini hesapla.
  // Q_m3h = toplam_alet_debisi_m3h * es_zamanlilik_faktoru
  // toplam_alet_debisi_m3h: tüm aletlerin toplam debi ihtiyacı (m3/h)
  // es_zamanlilik_faktoru: eş zamanlılık faktörü, 0-1 arası tipik (GİRDİ ZORUNLU)
  //   - Alet sayısı ve kullanım profiline göre değişir.
  //   - Endüstri/uygulama tipine göre TEYİT edilmeli, tipik aralık 0.4-0.8.
  //   - Bu fonksiyon tasarım kararı vermez: >1 veya negatif girilse bile sadece çarpar.
  //   - Sınır kontrolü YAPMAZ (tasarımcının sorumluluğu).
  // Sonuç: m3/h (geçersiz/NaN girdi -> NaN güvenli)
  function airDemand(opts) {
    opts = opts || {};
    var Q_total = _num(opts.toplam_alet_debisi_m3h);
    var factor = _num(opts.es_zamanlilik_faktoru);

    if (!isFinite(Q_total) || !isFinite(factor)) return NaN;

    return Q_total * factor;
  }

  var api = {
    airDemand: airDemand
  };
  if (typeof window !== 'undefined') window.CompressedAir = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
