// Gsem Mep Pro — Yagmur Suyu Debi Motoru (rainwater-drainage.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// EN 12056-3 esasli yagmur suyu debisi (Q) ve basit min DN onerisi.
// MALZEME / ALAN KUTUPHANESI YOKTUR — A_m2, C, i KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // EN 12056-3 aciklama (teyit — standarttan dogrulanmali):
  //   Q = C * A * i  (L/s)
  //   C: akis katsayisi (duz catide tipik 1.0, girdi, varsayim degil)
  //   A: yagmur toplama alani (m2)
  //   i: yagmur siddeti (l/s.m2) — EN 12056-3 Ek B bolgesel deger, TEYIT
  // Dikkat: i HAZIR l/s.m2 cinsinden verilir; 1000'e bolme formulu icinde DEGIL.

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Yagmur suyu tasarim debisi: Q = C * A * i  (L/s)
  // A_m2: toplama alani (m2)
  // C: akis katsayisi (girdi, varsayilan yok; duz cat 1.0)
  // i_l_s_m2: yagmur siddeti (l/s.m2, bolgeye gore, EN 12056-3 Ek B, TEYIT)
  // Gecersiz / negatif girdi -> guvenli NaN dondurur.
  function designFlow(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var a = _num(opt.A_m2);
    var c = _num(opt.C);
    var i = _num(opt.i_l_s_m2);
    if (!isFinite(a) || a < 0) return NaN;
    if (!isFinite(c) || c < 0) return NaN;
    if (!isFinite(i) || i < 0) return NaN;
    var q = c * a * i;
    return Math.round(q * 100) / 100; // 2 ondalik (L/s)
  }

  // Basit kapasite tablosuyla min DN onerisi (teyit — proje esas alinacak):
  // Dikey boru serbest dusme kapasitesi (yaklasik deger):
  //   Q <= 1.5 -> DN70
  //   Q <= 4.5 -> DN100
  //   Q <= 8.5 -> DN125
  //   Q <= 15 -> DN150
  //   else -> DN200
  // (Basitlestirilmis, detay CAD asamasinda kontrol edilmeli.)
  function gutterPipeDN(Q_l_s) {
    var q = _num(Q_l_s);
    if (!isFinite(q) || q < 0) return NaN;
    if (q <= 1.5) return 'DN70';
    if (q <= 4.5) return 'DN100';
    if (q <= 8.5) return 'DN125';
    if (q <= 15) return 'DN150';
    return 'DN200';
  }

  var api = {
    designFlow: designFlow,
    gutterPipeDN: gutterPipeDN
  };
  if (typeof window !== 'undefined') window.RainwaterDrainage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
