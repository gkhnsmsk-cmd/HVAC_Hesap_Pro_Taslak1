// Gsem Mep Pro — Sistem Karsilastirma (system-compare.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// LCC / NPV (net bugunku deger) ile sistem alternatiflerini karsilastirir.
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
// Not: Burada tum nakit akislari MALIYET olarak pozitif alinir; en DUSUK NPV
//      (yasam boyu maliyet) en avantajli sistemdir.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Yasam boyu maliyet (NPV) — yillik isletme maliyetinin bugunku degeri + ilk yatirim.
  // Girdi: { ilk_yatirim, yillik_isletme, omur_yil, faiz }
  //   ilk_yatirim    : baslangic yatirim maliyeti (para birimi) — GIRDI
  //   yillik_isletme : yillik isletme maliyeti (para birimi/yil) — GIRDI
  //   omur_yil       : degerlendirme suresi (yil) — GIRDI
  //   faiz           : yillik iskonto orani (birimsiz, or. 0.10) — GIRDI
  // Cikti: NPV (number). Gecersiz/tanimsiz girdi -> NaN (patlamaz).
  //   NPV = ilk_yatirim + yillik_isletme * ((1 - (1+faiz)^-omur) / faiz)
  //   faiz == 0 durumunda annuite carpani -> omur (limit); guvenli.
  function npv(opt) {
    opt = opt || {};
    var I = _num(opt.ilk_yatirim);
    var A = _num(opt.yillik_isletme);
    var n = _num(opt.omur_yil);
    var i = _num(opt.faiz);

    if (!isFinite(I) || !isFinite(A) || !isFinite(n) || !isFinite(i)) return NaN;
    if (n < 0) return NaN;

    var af;
    if (i === 0) {
      af = n; // limit: (1-(1+i)^-n)/i -> n
    } else {
      af = (1 - Math.pow(1 + i, -n)) / i;
    }
    if (!isFinite(af)) return NaN;

    return I + A * af;
  }

  // Sistem alternatiflerini NPV'ye gore karsilastir.
  // Girdi: sistemler[] = [{ ad, ilk_yatirim, yillik_isletme, omur_yil, faiz }, ...]
  // Cikti: { siralama: [{ ad, npv, sira }], onerilen: <ad|null> }
  //   siralama : NPV artan (en ucuz yasam boyu maliyet once) siralanmis.
  //   onerilen : en dusuk NPV'ye sahip sistemin adi (yoksa null).
  //   Gecersiz NPV veren sistemler siralamada sona atilir, onerilmez.
  function compare(sistemler) {
    var out = { siralama: [], onerilen: null };
    if (!Array.isArray(sistemler)) return out;

    var rows = sistemler.map(function (s) {
      s = s || {};
      return { ad: s.ad, npv: npv(s) };
    });

    rows.sort(function (a, b) {
      var av = isFinite(a.npv) ? a.npv : Infinity;
      var bv = isFinite(b.npv) ? b.npv : Infinity;
      return av - bv;
    });

    rows.forEach(function (r, idx) {
      r.sira = idx + 1;
    });

    out.siralama = rows;
    if (rows.length && isFinite(rows[0].npv)) out.onerilen = rows[0].ad;

    return out;
  }

  var api = {
    npv: npv,
    compare: compare
  };
  if (typeof window !== 'undefined') window.SystemCompare = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
