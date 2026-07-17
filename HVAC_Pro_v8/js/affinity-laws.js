// Gsem Mep Pro — Affinite Yasalari (affinity-laws.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Pompa/Fan ölçeklendirmesi: devir sayisi (RPM) ve rotor capi (D) ile capa goru olceklendirme.
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Devir Sayisina Gore Olceklendirme: scaleBySpeed
  // Girdi: { Q1, H1, P1, N1, N2 }
  //   Q1      : Kapasite 1 (m³/h veya benzeri birim) — GIRDI ZORUNLU
  //   H1      : Basinc yuksekligi 1 (m su sutunu veya benzeri) — GIRDI ZORUNLU
  //   P1      : Gucu 1 (kW veya benzeri) — GIRDI ZORUNLU
  //   N1      : Devir sayisi 1 (RPM) — GIRDI ZORUNLU
  //   N2      : Devir sayisi 2 (RPM) — GIRDI ZORUNLU
  // Cikti: { Q2, H2, P2 }  (2 ondalik)
  //   Q2 = Q1 * (N2/N1)
  //   H2 = H1 * (N2/N1)^2
  //   P2 = P1 * (N2/N1)^3
  // Guvenli girdi: gecersiz/bolme/sifir -> NaN alanlarla doner (patlamaz).
  function scaleBySpeed(opt) {
    opt = opt || {};
    var Q1 = _num(opt.Q1);
    var H1 = _num(opt.H1);
    var P1 = _num(opt.P1);
    var N1 = _num(opt.N1);
    var N2 = _num(opt.N2);

    var out = { Q2: NaN, H2: NaN, P2: NaN };

    // Temel validasyon: hepsi sonlu olmali, N1 sifir degil
    if (!isFinite(Q1) || !isFinite(H1) || !isFinite(P1)) return out;
    if (!isFinite(N1) || !isFinite(N2)) return out;
    if (N1 === 0) return out;  // Sifir bolme riski

    var ratio = N2 / N1;
    out.Q2 = Math.round(Q1 * ratio * 100) / 100;
    out.H2 = Math.round(H1 * Math.pow(ratio, 2) * 100) / 100;
    out.P2 = Math.round(P1 * Math.pow(ratio, 3) * 100) / 100;

    return out;
  }

  // Rotor Capina Gore Olceklendirme: scaleByDiameter
  // Girdi: { Q1, H1, P1, D1, D2 }
  //   Q1      : Kapasite 1 (m³/h veya benzeri birim) — GIRDI ZORUNLU
  //   H1      : Basinc yuksekligi 1 (m su sutunu veya benzeri) — GIRDI ZORUNLU
  //   P1      : Gucu 1 (kW veya benzeri) — GIRDI ZORUNLU
  //   D1      : Rotor capi 1 (mm veya benzeri) — GIRDI ZORUNLU
  //   D2      : Rotor capi 2 (mm veya benzeri) — GIRDI ZORUNLU
  // Cikti: { Q2, H2, P2 }  (2 ondalik)
  //   Afinite yasalari: ratio = D2/D1
  //   Q2 = Q1 * ratio
  //   H2 = H1 * ratio^2
  //   P2 = P1 * ratio^3
  // Guvenli girdi: gecersiz/bolme/sifir -> NaN alanlarla doner (patlamaz).
  function scaleByDiameter(opt) {
    opt = opt || {};
    var Q1 = _num(opt.Q1);
    var H1 = _num(opt.H1);
    var P1 = _num(opt.P1);
    var D1 = _num(opt.D1);
    var D2 = _num(opt.D2);

    var out = { Q2: NaN, H2: NaN, P2: NaN };

    // Temel validasyon: hepsi sonlu olmali, D1 sifir degil
    if (!isFinite(Q1) || !isFinite(H1) || !isFinite(P1)) return out;
    if (!isFinite(D1) || !isFinite(D2)) return out;
    if (D1 === 0) return out;  // Sifir bolme riski

    var ratio = D2 / D1;
    out.Q2 = Math.round(Q1 * ratio * 100) / 100;
    out.H2 = Math.round(H1 * Math.pow(ratio, 2) * 100) / 100;
    out.P2 = Math.round(P1 * Math.pow(ratio, 3) * 100) / 100;

    return out;
  }

  var api = {
    scaleBySpeed: scaleBySpeed,
    scaleByDiameter: scaleByDiameter
  };
  if (typeof window !== 'undefined') window.AffinityLaws = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
