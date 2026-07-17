// Gsem Mep Pro — Kapali Genlesme Tanki (expansion-tank.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// EN 12828 basitlestirilmis kapali membranli genlesme tanki boyutlandirma.
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Nominal genlesme tanki hacmi.
  // Girdi: { V_sistem_L, e, Pmax_bar, Pon_bar }
  //   V_sistem_L : sistemdeki toplam su hacmi (L)  — KULLANICI GIRDISI
  //   e          : su genlesme katsayisi (birimsiz) — GIRDI.
  //                (teyit: ~90 C icin or. 0.0359; sicakliga gore standarttan alinir)
  //   Pmax_bar   : emniyet ventili acma / azami isletme basinci (bar, gauge) — GIRDI
  //   Pon_bar    : tank on-basinci / statik basinc (bar, gauge) — GIRDI
  // Cikti: { Ve_L, Vn_L }  (1 ondalik)
  //   Ve = V_sistem * e                                  (su genlesme hacmi, L)
  //   Vn = Ve * (Pmax_bar + 1) / (Pmax_bar - Pon_bar)    (basitlestirilmis EN 12828)
  // Guvenli girdi: gecersiz/sifir-bolme -> NaN alanlarla doner (patlamaz).
  function nominalVolume(opt) {
    opt = opt || {};
    var V = _num(opt.V_sistem_L);
    var e = _num(opt.e);
    var Pmax = _num(opt.Pmax_bar);
    var Pon = _num(opt.Pon_bar);

    var out = { Ve_L: NaN, Vn_L: NaN };

    if (!isFinite(V) || V < 0) return out;
    if (!isFinite(e) || e < 0) return out;

    var Ve = V * e;
    out.Ve_L = Math.round(Ve * 10) / 10;

    // Basinc farki sifir/negatif -> sifir bolme, guvenli NaN.
    if (!isFinite(Pmax) || !isFinite(Pon)) return out;
    var dP = Pmax - Pon;
    if (dP <= 0) return out;

    var Vn = Ve * (Pmax + 1) / dP;
    out.Vn_L = Math.round(Vn * 10) / 10;

    return out;
  }

  var api = {
    nominalVolume: nominalVolume
  };
  if (typeof window !== 'undefined') window.ExpansionTank = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
