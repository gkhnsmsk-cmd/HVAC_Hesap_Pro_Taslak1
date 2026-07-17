// HVAC Hesap Pro — Tıbbi Gaz Sistemleri (medical-gas.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Tıbbi gaz (O2, vakum, basınçlı hava, N2O) debi hesaplamaları.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // totalFlow: Tıbbi gaz sistemi toplam debisi (L/min)
  // noktalar = [{adet, debi_l_min_nokta}, ...]
  // Her nokta tipi ve gaz türüne göre debi_l_min_nokta değişir (GİRDİ ZORUNLU)
  //   - Gaz tipi (O2/vakum/basınçlı hava/N2O) göre TEYİT edilmeli
  //   - Nokta tipi (anestezi, acil, ameliyat vb.) göre TEYİT edilmeli
  //   - ISO 7396-1 / yönetmelik nokta debisi tablosu TEYIT
  // Sonuç: Σ(adet * debi_l_min_nokta) [L/min]
  // Güvenli: geçersiz/NaN girdi -> NaN
  function totalFlow(opts) {
    opts = opts || {};
    var noktalar = opts.noktalar || [];

    if (!Array.isArray(noktalar)) return NaN;

    var total = 0;
    for (var i = 0; i < noktalar.length; i++) {
      var nokta = noktalar[i];
      var adet = _num(nokta.adet);
      var debi = _num(nokta.debi_l_min_nokta);

      if (!isFinite(adet) || !isFinite(debi)) return NaN;

      total += adet * debi;
    }

    return total;
  }

  // simultaneityFactor: Eş-zamanlılık faktörü uygulanmış debi (L/min)
  // toplam_l_min: toplam L/min (totalFlow çıktısı veya manuel)
  // faktor: eş-zamanlılık/çeşitlilik faktörü (tipik 0-1, GİRDİ ZORUNLU)
  //   - ISO 7396-1 Ek tabloları / yönetmelik TEYIT edilmeli
  //   - Sistemin eş zamanlı kullanım oranını belirtir
  //   - Bu fonksiyon tasarım kararı vermez: sabit VERMEZ, girdiye bağlı
  // Sonuç: toplam_l_min * faktor [L/min]
  // Güvenli: geçersiz/NaN girdi -> NaN
  function simultaneityFactor(opts) {
    opts = opts || {};
    var toplam_l_min = _num(opts.toplam_l_min);
    var faktor = _num(opts.faktor);

    if (!isFinite(toplam_l_min) || !isFinite(faktor)) return NaN;

    return toplam_l_min * faktor;
  }

  var api = {
    totalFlow: totalFlow,
    simultaneityFactor: simultaneityFactor
  };
  if (typeof window !== 'undefined') window.MedicalGas = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
