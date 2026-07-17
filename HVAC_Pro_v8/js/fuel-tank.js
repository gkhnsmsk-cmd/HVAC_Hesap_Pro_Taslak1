// HVAC Hesap Pro — Yakıt Depo Hacmi (fuel-tank.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Yakıt depo boyutlandırması için hacim hesabi.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // tankVolume: Gereken yakıt depo hacmini hesapla.
  // V_L = debi_kg_h * calisma_saat / yogunluk_kg_L
  // debi_kg_h: yakıt debisi (kg/h)
  // calisma_saat: çalışma süresi (saat)
  // yogunluk_kg_L: yakıt yoğunluğu (kg/L) — GİRDİ ZORUNLU, teknik veri ile TEYİT edilmeli
  //               (örn: motorin ~0.83-0.86 kg/L, HFO ~0.91-0.95 kg/L).
  //               Yakıt tipine göre değişir, sabit değer VERME.
  // Sonuç: V_L (litre cinsinden)
  // Payda sıfırsa (yogunluk_kg_L==0) veya girdi geçersizse -> NaN güvenli
  function tankVolume(opts) {
    opts = opts || {};
    var debi_kg_h = _num(opts.debi_kg_h);
    var calisma_saat = _num(opts.calisma_saat);
    var yogunluk_kg_L = _num(opts.yogunluk_kg_L);

    if (!isFinite(debi_kg_h) || !isFinite(calisma_saat) || !isFinite(yogunluk_kg_L)) return NaN;

    // Payda sıfır -> NaN (yoğunluk sıfır olamaz, güvenli denetim)
    if (yogunluk_kg_L === 0) return NaN;

    var V_L = (debi_kg_h * calisma_saat) / yogunluk_kg_L;
    return Math.round(V_L * 10) / 10; // 1 ondalık (L)
  }

  var api = {
    tankVolume: tankVolume
  };
  if (typeof window !== 'undefined') window.FuelTank = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
