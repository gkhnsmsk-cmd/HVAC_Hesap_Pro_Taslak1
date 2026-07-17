// HVAC Hesap Pro — Boru Isıl Genleşme (pipe-thermal-expansion.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Borularda sıcaklık değişikliğine bağlı genleşme ve dilatasyon kolu boyutlandırması.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // linearExpansion: Doğrusal genleşme hesabı.
  // dL_mm = L_m * alpha_per_C * dT_C * 1000
  // L_m: boru uzunluğu (m)
  // alpha_per_C: doğrusal genleşme katsayısı (1/°C) — KULLANICI GIRDISI
  //              (Malzeme teknik veri sayfasından TEYİT EDİLMELİ; örn: çelik ~12e-6, bakır ~17e-6, PPR ~0.15)
  // dT_C: sıcaklık farkı (°C)
  // Çıktı: mm (bir ondalık)
  // Güvenli girdi: geçersiz/NaN -> NaN dönüşü
  function linearExpansion(opts) {
    opts = opts || {};
    var L = _num(opts.L_m);
    var alpha = _num(opts.alpha_per_C);
    var dT = _num(opts.dT_C);

    if (!isFinite(L) || !isFinite(alpha) || !isFinite(dT)) return NaN;

    var dL_mm = L * alpha * dT * 1000;
    return Math.round(dL_mm * 10) / 10;
  }

  // loopLength: Basit L-kompansatör / dilatasyon kolu boyutlandırması (tahmini).
  // Basitleştirilmiş formül (ASME B31/EN 13480 teyit — basitlestirilmis):
  // Lb_mm = sqrt(3 * E_MPa * D_mm * dL_mm / sigma_allow_MPa)
  // dL_mm: toplam genleşme miktarı (mm) — GIRDI
  // D_mm: boru dış çapı (mm) — GIRDI
  // E_MPa: malzeme elastisite modülü (MPa) — KULLANICI GIRDISI (malzeme teknik veri sayfasından)
  // sigma_allow_MPa: izin verilebilir gerilme (MPa) — KULLANICI GIRDISI (standart teyidi)
  // Çıktı: mm (kolu uzunluğu, bir ondalık)
  // Güvenli girdi: geçersiz/sıfır-bölme -> NaN
  function loopLength(opts) {
    opts = opts || {};
    var dL = _num(opts.dL_mm);
    var D = _num(opts.D_mm);
    var E = _num(opts.E_MPa);
    var sigma = _num(opts.sigma_allow_MPa);

    if (!isFinite(dL) || !isFinite(D) || !isFinite(E) || !isFinite(sigma)) return NaN;

    // Sıfır-bölme koruması: payda sıfır veya negatif
    var denom = sigma;
    if (denom <= 0) return NaN;

    var Lb_mm = Math.sqrt(3 * E * D * dL / sigma);
    return Math.round(Lb_mm * 10) / 10;
  }

  var api = {
    linearExpansion: linearExpansion,
    loopLength: loopLength
  };
  if (typeof window !== 'undefined') window.PipeThermalExpansion = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
