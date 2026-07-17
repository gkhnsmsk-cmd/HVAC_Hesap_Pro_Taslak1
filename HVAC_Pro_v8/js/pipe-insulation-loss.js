// HVAC Hesap Pro — Boru Yalıtım Isı Kaybı (pipe-insulation-loss.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Silindirik iletim formülü ile yalıtımlı boru ısı kaybı hesaplaması.
// Referans: Fourier yasası, TS 2164, EN 12831
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // lossPerMeter: Yalıtımlı boru başına ısı kaybı (W/m)
  // Girdi: {
  //   T_i_C     : boru iç sıcaklığı (°C) — GİRDİ ZORUNLU
  //   T_o_C     : ortam/dış sıcaklığı (°C) — GİRDİ ZORUNLU
  //   r1_m      : boru iç çapının yarısı / iç yarıçap (m) — GİRDİ ZORUNLU
  //   r2_m      : yalıtımın dış yarıçapı (m) — GİRDİ ZORUNLU
  //   k_W_mK    : yalıtım malzemesinin ısıl iletkenliği (W/m·K) — GİRDİ ZORUNLU
  //               Malzeme teknik veri sayfasından TEYİT EDİLMESİ ZORUNLU.
  //               (Örn: poliüretan ~0.025-0.040, cam yünü ~0.035-0.045, vb.)
  // }
  // Çıktı: W/m cinsinden ısı kaybı, sonlu pozitif sayı veya NaN (güvenli)
  //
  // Formül (Fourier silindirik iletim):
  //   q_W_m = 2 * π * k_W_mK * (T_i_C - T_o_C) / ln(r2_m / r1_m)
  //
  // Geçersiz girdiler (r2<=r1, k<=0, NaN, vb.) → NaN (crash yok)
  function lossPerMeter(opts) {
    opts = opts || {};
    var T_i = _num(opts.T_i_C);
    var T_o = _num(opts.T_o_C);
    var r1 = _num(opts.r1_m);
    var r2 = _num(opts.r2_m);
    var k = _num(opts.k_W_mK);

    // Temel validasyon: tüm parametreler sonlu olmalı
    if (!isFinite(T_i) || !isFinite(T_o) || !isFinite(r1) || !isFinite(r2) || !isFinite(k)) {
      return NaN;
    }

    // Fiziksel kısıtlamalar:
    // - Isıl iletkenlik pozitif olmalı
    // - r2 > r1 (yalıtım dışarıda olmalı)
    if (k <= 0 || r2 <= r1) {
      return NaN;
    }

    // Fourier silindirik iletim formülü
    var dT = T_i - T_o;  // Sıcaklık farkı
    var ln_ratio = Math.log(r2 / r1);  // ln(r2/r1)

    // Formül: q = 2 * π * k * ΔT / ln(r2/r1)
    var q = (2 * Math.PI * k * dT) / ln_ratio;

    return q;
  }

  // totalLoss: Toplam ısı kaybı (W)
  // Girdi: {
  //   q_W_m  : başına ısı kaybı (W/m) — GİRDİ ZORUNLU (lossPerMeter'den gelebilir)
  //   L_m    : boru uzunluğu (m) — GİRDİ ZORUNLU
  // }
  // Çıktı: W cinsinden toplam ısı kaybı, sonlu sayı veya NaN
  //
  // Formül (basit çarpım):
  //   Q = q_W_m * L_m
  function totalLoss(opts) {
    opts = opts || {};
    var q = _num(opts.q_W_m);
    var L = _num(opts.L_m);

    if (!isFinite(q) || !isFinite(L)) {
      return NaN;
    }

    var Q = q * L;
    return Q;
  }

  var api = {
    lossPerMeter: lossPerMeter,
    totalLoss: totalLoss
  };
  if (typeof window !== 'undefined') window.PipeInsulationLoss = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
