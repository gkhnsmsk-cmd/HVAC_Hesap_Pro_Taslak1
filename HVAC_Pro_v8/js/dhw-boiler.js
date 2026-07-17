// HVAC Hesap Pro — Isıtılmış Su (DHW) Boiler Modülü (dhw-boiler.js)
// SAF (DOM'suz) IIFE modül; headless test edilebilir.
// Boiler ısı yükü hesabı (EN 12831, ASHRAE) ve depolama hacmi boyutlandırması.
// MALZEME/EKIPMAN KÜTÜPHANESI YOKTUR — tüm değerler KULLANICI GİRDİSİDİR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  /**
   * Boiler ısı yükü hesabı (su ısıtma gücü).
   * Girdi: { debiLpm, tGiris_C, tCikis_C, cp, yogunluk }
   *   debiLpm      : su debisi (L/dak) — KULLANICI GİRDİSİ
   *   tGiris_C     : giriş sıcaklığı (°C) — KULLANICI GİRDİSİ
   *   tCikis_C     : çıkış sıcaklığı (°C) — KULLANICI GİRDİSİ
   *   cp           : özgül ısı kapasitesi (kJ/kg·K, varsayılan 4.186 su için)
   *   yogunluk     : su yoğunluğu (kg/L, varsayılan 1.0)
   * Çıktı: { kW } (2 ondalık) veya { error: "..." } (geçersiz girdi)
   * Formül: kW = (debiLpm/60) * yogunluk * cp * ΔT
   *         [kg/s] * [kJ/kg·K] * [K] = [kJ/s] = [kW]
   */
  function calc(opt) {
    opt = opt || {};
    var debi = _num(opt.debiLpm);
    var tGiris = _num(opt.tGiris_C);
    var tCikis = _num(opt.tCikis_C);
    var cp = _num(opt.cp);
    var yogunluk = _num(opt.yogunluk);

    // Varsayılanlar
    if (!isFinite(cp)) cp = 4.186;  // su için kJ/kg·K
    if (!isFinite(yogunluk)) yogunluk = 1.0;  // su kg/L

    // Güvenli girdi kontrolü
    if (!isFinite(debi) || debi < 0) {
      return { error: 'Debi (debiLpm) negatif veya geçersiz' };
    }
    if (!isFinite(tGiris) || !isFinite(tCikis)) {
      return { error: 'Sıcaklık girdileri (tGiris_C, tCikis_C) geçersiz' };
    }
    if (!isFinite(cp) || cp <= 0) {
      return { error: 'cp (özgül ısı) pozitif olmalı' };
    }
    if (!isFinite(yogunluk) || yogunluk <= 0) {
      return { error: 'Yoğunluk pozitif olmalı' };
    }

    var deltaT = tCikis - tGiris;
    // Negatif ΔT (soğutma) veya sıfır yükü kabul edilir
    var debiKgSek = (debi / 60) * yogunluk;
    var kW = debiKgSek * cp * deltaT;

    return {
      kW: Math.round(kW * 100) / 100
    };
  }

  /**
   * Sıcak su depolama tank hacmi boyutlandırması.
   * Girdi: { gunlukIhtiyacL, esZamanlilikFaktor }
   *   gunlukIhtiyacL      : günlük toplam sıcak su ihtiyacı (L) — KULLANICI GİRDİSİ
   *   esZamanlilikFaktor  : eş zamanlılık faktörü (birimsiz, 0...1, varsayılan 1.0)
   *                         (örn. 0.5 = sistem kapasitesi günde 2 kez yenilenebilir)
   * Çıktı: { hacimL } (1 ondalık) veya { error: "..." } (geçersiz girdi)
   * Formül: hacimL = gunlukIhtiyacL * esZamanlilikFaktor
   */
  function depolamaHacmi(opt) {
    opt = opt || {};
    var ihtiyac = _num(opt.gunlukIhtiyacL);
    var faktor = _num(opt.esZamanlilikFaktor);

    // Varsayılan
    if (!isFinite(faktor)) faktor = 1.0;

    // Güvenli girdi kontrolü
    if (!isFinite(ihtiyac) || ihtiyac < 0) {
      return { error: 'Günlük ihtiyaç (gunlukIhtiyacL) negatif veya geçersiz' };
    }
    if (!isFinite(faktor) || faktor < 0) {
      return { error: 'Eş zamanlılık faktörü negatif olmalı' };
    }

    var hacim = ihtiyac * faktor;
    return {
      hacimL: Math.round(hacim * 10) / 10
    };
  }

  var api = {
    calc: calc,
    depolamaHacmi: depolamaHacmi
  };

  if (typeof window !== 'undefined') window.DhwBoiler = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
