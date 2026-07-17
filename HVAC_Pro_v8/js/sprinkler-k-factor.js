// HVAC Hesap Pro — Sprinkler K-Faktörü Debisi ve Basınç (sprinkler-k-factor.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Sprinkler K-faktörüne göre debi ve basınç hesaplamaları.
// Standart: ISO 9226, EN 12845
// Kullanıcı girdisi: K-faktörü (L/min/bar^0.5) ve basınç (bar) veya debi (L/min)
(function () {
  'use strict';

  // Yardimci: Number dönüştürme ve finite kontrol
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Debiden basınç hesapla: P = (Q/K)^2
  // K: Sprinkler K-faktörü (L/min/bar^0.5) - GIRDI - TEYIT
  // debiLpm: Debi (L/min) - GIRDI - TEYIT
  // Döner: basınç (bar) veya NaN geçersiz girdi için
  function basincFromDebi(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var k = _num(opt.K);
    var q = _num(opt.debiLpm);
    if (!isFinite(k) || k <= 0) return NaN;
    if (!isFinite(q) || q < 0) return NaN;
    if (q === 0) return 0;
    var p = Math.pow(q / k, 2);
    return Math.round(p * 10000) / 10000; // 4 ondalık (bar)
  }

  // Basınçtan debi hesapla: Q = K * sqrt(P)
  // K: Sprinkler K-faktörü (L/min/bar^0.5) - GIRDI - TEYIT
  // basincBar: Basınç (bar) - GIRDI - TEYIT
  // Döner: debi (L/min) veya NaN geçersiz girdi için
  function debiFromBasinc(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var k = _num(opt.K);
    var p = _num(opt.basincBar);
    if (!isFinite(k) || k <= 0) return NaN;
    if (!isFinite(p) || p < 0) return NaN;
    var q = k * Math.sqrt(p);
    return Math.round(q * 100) / 100; // 2 ondalık (L/min)
  }

  // Toplam debi (N sprinkler × debi/adet)
  // sprinklerSayisi: Sprinkler sayısı - GIRDI - TEYIT
  // debiLpmHer: Her bir sprinklerin debisi (L/min) - GIRDI - TEYIT
  // Döner: toplam debi (L/min) veya NaN geçersiz girdi için
  function toplamDebi(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var n = _num(opt.sprinklerSayisi);
    var q = _num(opt.debiLpmHer);
    if (!isFinite(n) || n < 0) return NaN;
    if (!isFinite(q) || q < 0) return NaN;
    var qtot = n * q;
    return Math.round(qtot * 100) / 100; // 2 ondalık (L/min)
  }

  var api = {
    debiFromBasinc: debiFromBasinc,
    basincFromDebi: basincFromDebi,
    toplamDebi: toplamDebi
  };
  if (typeof window !== 'undefined') window.SprinklerKFactor = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
