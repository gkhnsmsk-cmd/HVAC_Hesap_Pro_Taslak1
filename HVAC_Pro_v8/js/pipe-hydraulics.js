// Gsem Mep Pro — Boru Hidroligi Cekirdegi (pipe-hydraulics.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Darcy-Weisbach + Swamee-Jain (Colebrook yaklasik) surtunme faktoru ile
// dolu-kesitli daire boruda basinc kaybi. Su varsayilanlari (20 C civari).
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // Su varsayilanlari (teyit): rho ~ 1000 kg/m3, mu ~ 0.001 Pa.s, eps ~ 0.045 mm (celik/PPRC ort.)
  var DEF_RHO = 1000;    // kg/m3
  var DEF_MU  = 0.001;   // Pa.s (dinamik viskozite)
  var DEF_EPS = 0.045;   // mm (mutlak puruzluluk)

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Darcy-Weisbach basinc kaybi.
  // Girdi: { Q_m3h, D_mm, L_m, rho, mu, eps_mm }
  //   Q_m3h : debi (m3/saat), D_mm : ic cap (mm), L_m : uzunluk (m)
  //   rho,mu,eps_mm : opsiyonel (su varsayilanlari)
  // Cikti: { v_ms, Re, f, dP_Pa_m, dP_total_kPa }
  // Guvenli girdi: gecersiz/negatif/sifir -> NaN alanlarla doner (patlamaz).
  function pressureDrop(opt) {
    opt = opt || {};
    var Q_m3h = _num(opt.Q_m3h);
    var D_mm  = _num(opt.D_mm);
    var L_m   = _num(opt.L_m);
    var rho = (opt.rho    === undefined || opt.rho    === null) ? DEF_RHO : _num(opt.rho);
    var mu  = (opt.mu     === undefined || opt.mu     === null) ? DEF_MU  : _num(opt.mu);
    var eps = (opt.eps_mm === undefined || opt.eps_mm === null) ? DEF_EPS : _num(opt.eps_mm);
    if (!isFinite(rho) || rho <= 0) rho = DEF_RHO;
    if (!isFinite(mu)  || mu  <= 0) mu  = DEF_MU;
    if (!isFinite(eps) || eps <  0) eps = DEF_EPS;

    var out = { v_ms: NaN, Re: NaN, f: NaN, dP_Pa_m: NaN, dP_total_kPa: NaN };

    // Gecersiz temel girdi -> guvenli NaN cikti.
    if (!isFinite(Q_m3h) || Q_m3h < 0) return out;
    if (!isFinite(D_mm)  || D_mm  <= 0) return out;

    var D_m = D_mm / 1000;                 // m
    var eps_m = eps / 1000;                // m
    var Q_s = Q_m3h / 3600;                // m3/s
    var A = Math.PI * D_m * D_m / 4;       // m2
    var v = Q_s / A;                       // m/s
    out.v_ms = Math.round(v * 1e6) / 1e6;

    // Debi 0 -> hiz 0, kayip 0 (Re/f tanimsiz kalir).
    if (v === 0) {
      out.Re = 0; out.f = 0; out.dP_Pa_m = 0;
      out.dP_total_kPa = 0;
      return out;
    }

    var Re = rho * v * D_m / mu;
    out.Re = Math.round(Re * 100) / 100;

    var f;
    if (Re < 2300) {
      // Laminer: f = 64/Re (Darcy).
      f = 64 / Re;
    } else {
      // Swamee-Jain (turbulent): f = 0.25 / [log10( eps/(3.7 D) + 5.74/Re^0.9 )]^2
      var term = (eps_m / (3.7 * D_m)) + (5.74 / Math.pow(Re, 0.9));
      var lg = Math.log(term) / Math.LN10; // log10
      f = 0.25 / (lg * lg);
    }
    out.f = Math.round(f * 1e6) / 1e6;

    // Darcy-Weisbach: dP/L = f * (1/D) * rho * v^2 / 2  (Pa/m)
    var dP_pm = f * (1 / D_m) * rho * v * v / 2;
    out.dP_Pa_m = Math.round(dP_pm * 1e4) / 1e4;

    var L = (!isFinite(L_m) || L_m < 0) ? 0 : L_m;
    var dP_total_Pa = dP_pm * L;
    out.dP_total_kPa = Math.round((dP_total_Pa / 1000) * 1e6) / 1e6;

    return out;
  }

  var api = {
    DEF_RHO: DEF_RHO,
    DEF_MU: DEF_MU,
    DEF_EPS: DEF_EPS,
    pressureDrop: pressureDrop
  };
  if (typeof window !== 'undefined') window.PipeHydraulics = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
