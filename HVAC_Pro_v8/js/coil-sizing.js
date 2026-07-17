// Gsem Mep Pro — Coil Sizing (coil-sizing.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Hava ve su kaynakli coil boyutlandirilmasi — isil kapasite hesaplamasi.
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // calc({tip, debi_m3h, debi_lps, T_giris_C, T_cikis_C})
  // Coil isil kapasite hesaplamasi
  //   tip       : 'hava' veya 'su'
  //   debi_m3h  : debi (m³/h) — TIP='hava' icin ZORUNLU
  //   debi_lps  : debi (L/s) — TIP='su' icin ZORUNLU
  //   T_giris_C : Giris sicakligi (°C) — ZORUNLU
  //   T_cikis_C : Cikis sicakligi (°C) — ZORUNLU
  // Cikti: { Q_kW }  (isil kapasite, 2 ondalik)
  //   Hava: Q_kW = (debi_m3h/3600) * 1.2 * 1.005 * abs(T_cikis_C - T_giris_C)
  //   Su:   Q_kW = (debi_lps/1000) * 1000 * 4.186 * abs(T_cikis_C - T_giris_C)
  //              = debi_lps * 4.186 * abs(T_cikis_C - T_giris_C)
  // Guvenli girdi: gecersiz/eksik -> NaN alanlarla doner (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var tip = opt.tip;
    var debi_m3h = _num(opt.debi_m3h);
    var debi_lps = _num(opt.debi_lps);
    var T_giris_C = _num(opt.T_giris_C);
    var T_cikis_C = _num(opt.T_cikis_C);

    var out = { Q_kW: NaN };

    // Temel validasyon: sicakliklar her zaman gerekli
    if (!isFinite(T_giris_C) || !isFinite(T_cikis_C)) return out;

    if (tip === 'hava') {
      if (!isFinite(debi_m3h)) return out;
      // Hava: Q_kW = (debi_m3h/3600) * 1.2 * 1.005 * abs(T_cikis_C - T_giris_C)
      // Fizisel sabitler: hava_yogunlugu=1.2 kg/m³, cp_hava=1.005 kJ/kgK
      var dT = Math.abs(T_cikis_C - T_giris_C);
      out.Q_kW = Math.round((debi_m3h / 3600) * 1.2 * 1.005 * dT * 100) / 100;
    } else if (tip === 'su') {
      if (!isFinite(debi_lps)) return out;
      // Su: Q_kW = (debi_lps/1000) * 1000 * 4.186 * abs(T_cikis_C - T_giris_C)
      //         = debi_lps * 4.186 * abs(T_cikis_C - T_giris_C)
      // Fizisel sabitler: su_yogunlugu=1000 kg/m³, cp_su=4.186 kJ/kgK
      var dT = Math.abs(T_cikis_C - T_giris_C);
      out.Q_kW = Math.round(debi_lps * 4.186 * dT * 100) / 100;
    } else {
      return out;  // Bilinmeyen tip -> NaN (guvenli)
    }

    return out;
  }

  var api = {
    calc: calc
  };
  if (typeof window !== 'undefined') window.CoilSizing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
