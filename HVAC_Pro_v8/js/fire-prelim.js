// Gsem Mep Pro — Yangin On Hesap (fire-prelim.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Tehlike sinifi debisi, hidrant talepleri, tanki hacmi ön hesabı.
// NFPA 13 / EN 12845 temel formüller; tasarım parametreleri KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // Yardimci: Number dönüştürme ve finite kontrol
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Sprinkler sistemi tasarım debisi (NFPA 13 / EN 12845 esasl):
  // Q_l_min = debit_l_min_m2 * Math.min(A_m2, tasarim_alani_m2)
  // Tehlike sinifina gore debit_l_min_m2 degerleri: NFPA13/EN12845'ten teyit
  // (Sabit deger degil, teyit parametresi olarak kullanici girer.)
  // A_m2: Tum alan (m2)
  // debit_l_min_m2: Tehlike sinifina gore min debit (l/min.m2) - GIRDI - TEYIT
  // tasarim_alani_m2: Tasarlanmasi gereken min alan (m2) - GIRDI - TEYIT
  // Gecersiz / negatif girdi -> guvenli NaN dondurur.
  function sprinklerDemand(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var a = _num(opt.A_m2);
    var d = _num(opt.debit_l_min_m2);
    var ta = _num(opt.tasarim_alani_m2);
    if (!isFinite(a) || a < 0) return NaN;
    if (!isFinite(d) || d < 0) return NaN;
    if (!isFinite(ta) || ta < 0) return NaN;
    var q = d * Math.min(a, ta);
    return Math.round(q * 100) / 100; // 2 ondalik (L/min)
  }

  // Hidrant sistemi debi talepleri (EN 671-1 / yönetmelik esasl):
  // Q_l_s = hidrant_sayisi * debit_l_s_adet
  // debit_l_s_adet: Yönetmelik değeri (l/s per hidrant) - GIRDI - TEYIT
  // hidrant_sayisi: Toplam hidrant sayisi
  // Gecersiz / negatif girdi -> guvenli NaN dondurur.
  function hydrantDemand(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var hs = _num(opt.hidrant_sayisi);
    var d = _num(opt.debit_l_s_adet);
    if (!isFinite(hs) || hs < 0) return NaN;
    if (!isFinite(d) || d < 0) return NaN;
    var q = hs * d;
    return Math.round(q * 100) / 100; // 2 ondalik (L/s)
  }

  // Depolama tanki hacmi (EN 12845 Ek A esasl):
  // V_L = Q_l_min * sure_dk (dakika cinsinden bakim suresi)
  // Q_l_min: Sprinkler talep debisi (L/min)
  // sure_dk: Sistem tasarım süresi (dakika) - GIRDI - TEYIT
  // Gecersiz / negatif girdi -> guvenli NaN dondurur.
  function tankVolume(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var q = _num(opt.Q_l_min);
    var s = _num(opt.sure_dk);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(s) || s < 0) return NaN;
    var v = q * s;
    return Math.round(v * 100) / 100; // 2 ondalik (L)
  }

  var api = {
    sprinklerDemand: sprinklerDemand,
    hydrantDemand: hydrantDemand,
    tankVolume: tankVolume
  };
  if (typeof window !== 'undefined') window.FirePrelim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
