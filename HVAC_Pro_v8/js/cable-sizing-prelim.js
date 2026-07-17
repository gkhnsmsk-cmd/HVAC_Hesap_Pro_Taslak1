// Gsem Mep Pro — Kablo Boyutlandirma Ön Kontrolleri (cable-sizing-prelim.js)
// SAF (DOM'suz) IIFE modül; headless test edilebilir.
// Işletme akimi ve gerilim düşüşü hesapları — KESIТ SEÇIMI YAPMAZ.
// Referans: TS 2164, VDI yonetmelik (basit tek-faz-eşdeğeri).
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Işletme akimi hesabi.
  // Girdi: { P_kW, V, cosPhi, faz }
  //   P_kW    : İçletme gücü (kW) — KULLANICI GIRDISI
  //   V       : Gerilim (V) — KULLANICI GIRDISI, tipik: 400 (3-faz) / 230 (1-faz)
  //   cosPhi  : Güç faktörü (birimsiz, 0 < cosPhi <= 1) — KULLANICI GIRDISI
  //   faz     : Faz sayisi (1 veya 3) — KULLANICI GIRDISI
  // Cikti: I_A (A cinsinden akım), birimsiz olmayan sayı.
  //   faz==3: I_A = (P_kW * 1000) / (sqrt(3) * V * cosPhi)
  //   faz==1: I_A = (P_kW * 1000) / (V * cosPhi)
  // Güvenli girdi: V yok -> NaN, cosPhi yok -> NaN, geçersiz faz -> NaN.
  function loadCurrent(opt) {
    opt = opt || {};
    var P = _num(opt.P_kW);
    var V = _num(opt.V);
    var cosPhi = _num(opt.cosPhi);
    var faz = _num(opt.faz);

    // V ve cosPhi ZORUNLU.
    if (!isFinite(V) || !isFinite(cosPhi)) return NaN;
    // P veya faz geçersiz.
    if (!isFinite(P) || P < 0) return NaN;
    if (!isFinite(faz) || (faz !== 1 && faz !== 3)) return NaN;

    var I_A;
    if (faz === 3) {
      // Üç-faz (3 tel, dengeli yük).
      I_A = (P * 1000) / (Math.sqrt(3) * V * cosPhi);
    } else {
      // Tek-faz (2 tel).
      I_A = (P * 1000) / (V * cosPhi);
    }

    return I_A;
  }

  // Gerilim düşüşü ön kontrol.
  // Girdi: { I_A, L_m, kesit_mm2, iletken_direnc_ohm_km, V, limit_yuzde }
  //   I_A                   : Hatlı akım (A) — KULLANICI GIRDISI
  //   L_m                   : Kablo uzunluğu (m, gidiş) — KULLANICI GIRDISI
  //   kesit_mm2             : Kablo kesit alani (mm2) — KULLANICI GIRDISI
  //   iletken_direnc_ohm_km : İletken ozgul direnci (Ω/km/mm²) — GİRDİ
  //                           Teyit (20°C, IEC 60228):
  //                             Bakır: ~1.68 Ω·mm²/m = 1680 Ω·km/mm²
  //                                    Pratik tablo: 1.75–1.8 Ω·km/mm²
  //                             Alüminyum: ~2.65 Ω·mm²/m = 2650 Ω·km/mm²
  //   V                     : Hat gerilimi (V) — KULLANICI GIRDISI
  //   limit_yuzde           : Maksimum izin verilen düşüş (%, opsiyonel)
  //                           Varsayılan: 5 (TS 2164 / YÖNETMELİK TİPİK)
  // Cikti: { dV_V, dV_yuzde, uygun }
  //   dV_V      : Gerilim düşüşü (V cinsinden, mutlak)
  //   dV_yuzde  : Gerilim düşüşü (% cinsinden)
  //   uygun     : bool, dV_yuzde <= limit_yuzde mi
  // Basit hesap: Gidiş-dönüş (2*L_m), tek-faz-eşdeğeri.
  //   R_toplam_ohm = (iletken_direnc_ohm_km / 1000) * L_m * 2
  //   dV_V = I_A * R_toplam_ohm
  //   dV_yuzde = (dV_V / V) * 100
  function voltageDropCheck(opt) {
    opt = opt || {};
    var I = _num(opt.I_A);
    var L = _num(opt.L_m);
    var kesit = _num(opt.kesit_mm2);
    var rho = _num(opt.iletken_direnc_ohm_km);
    var V = _num(opt.V);
    var limit = opt.limit_yuzde || 5; // Varsayılan %5
    limit = _num(limit);

    var out = { dV_V: NaN, dV_yuzde: NaN, uygun: false };

    // Zorunlu girdiler.
    if (!isFinite(I) || !isFinite(L) || !isFinite(kesit) || !isFinite(rho) || !isFinite(V)) {
      return out;
    }
    if (!isFinite(limit)) {
      return out;
    }

    // Mantik kontrolleri.
    if (I < 0 || L < 0 || kesit <= 0 || V <= 0 || limit < 0) {
      return out;
    }

    // Gidiş-dönüş direnci (tek-faz-eşdeğeri basit yaklaşım).
    var R_ohm = (rho / 1000) * L * 2;

    // Gerilim düşüşü.
    var dV = I * R_ohm;
    var dV_pct = (dV / V) * 100;

    out.dV_V = dV;
    out.dV_yuzde = dV_pct;
    out.uygun = (dV_pct <= limit);

    return out;
  }

  var api = {
    loadCurrent: loadCurrent,
    voltageDropCheck: voltageDropCheck
  };
  if (typeof window !== 'undefined') window.CableSizingPrelim = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
