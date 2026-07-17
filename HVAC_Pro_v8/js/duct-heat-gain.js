// Gsem Mep Pro — Kanal Isi Kazanci/Kaybi Motoru (duct-heat-gain.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Kanal havasindaki isi iletimi hesaplamasi (isi kazanci soğutmada, isi kaybi ısıtmada).
// Standart-veri DEĞİL, saf fizik: Q = U * A * ΔT
(function () {
  'use strict';

  function _num(x) {
    // null ve undefined -> NaN (geçersiz girdiler)
    if (x === null || x === undefined) return NaN;
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kanal Isı Kazancı/Kaybı Hesaplamasi: calc
  // Girdi: { U_W_m2K, A_m2, T_ambient_C, T_air_C }
  //   U_W_m2K         : Kanal yalitim (iletim) katsayisi (W/m2K) — GIRDI ZORUNLU
  //                     Kanal yalitim kalintigi/malzemesine göre hesaplanir veya teyit edilir.
  //   A_m2            : Kanal yüzeyi alani (m2) — GIRDI ZORUNLU
  //   T_ambient_C     : Çevresel sicaklik (°C) — GIRDI ZORUNLU (örn. çatı, dış hava)
  //   T_air_C         : Kanal hava sicakligi (°C) — GIRDI ZORUNLU
  //
  // Formül (iletim):
  //   Q_W = U_W_m2K * A_m2 * (T_ambient_C - T_air_C)
  //
  // SONUÇ İŞARETİ:
  //   Pozitif Q_W  = Kanal havasina isi KAZANCI (soğutmada istenmeyen)
  //   Negatif Q_W  = Kanal havasidan isi KAYBI (ısıtmada)
  //
  // Çikti: { Q_W }  (3 ondalik)
  // Guvenli girdi: gecersiz/NaN herhangi birinde -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var U = _num(opt.U_W_m2K);
    var A = _num(opt.A_m2);
    var Tamb = _num(opt.T_ambient_C);
    var Tair = _num(opt.T_air_C);

    var out = { Q_W: NaN };

    // Validasyon: Tüm girdiler sonlu ve geçerli olmalı
    if (!isFinite(U)) return out;
    if (!isFinite(A)) return out;
    if (!isFinite(Tamb)) return out;
    if (!isFinite(Tair)) return out;

    // U (iletim katsayisi) ve A (alan) negatif olmamali
    // (U genelde pozitif, A da pozitif; ama fizik olarak negatif olmamali)
    if (U < 0 || A < 0) return out;

    // Sicaklik farkı herhangi bir degerde olabilir (negatif, pozitif, sifir)
    // Hesapla
    var deltaT = Tamb - Tair;
    var Q = U * A * deltaT;

    out.Q_W = Math.round(Q * 1000) / 1000;
    return out;
  }

  // Yük Yüzdesi Hesaplamasi: percentOfLoad
  // Girdi: { Q_W, toplam_yuk_W }
  //   Q_W           : Kanal isi kazanci/kaybi (W) — GIRDI ZORUNLU
  //   toplam_yuk_W  : Toplam isitma/soğutma yükü (W) — GIRDI ZORUNLU
  //
  // Formül:
  //   Oran (%) = (Q_W / toplam_yuk_W) * 100
  //
  // NOT: Bu fonksiyon SADECE BILGI AMAÇLIDIR — tasarım kararı içermez.
  //      Pozitif oran: kanal isi kazanci yüzdesi (soğutma yüküne etki)
  //      Negatif oran: kanal isi kaybi yüzdesi (ısıtma yüküne katkilanma)
  //
  // Çikti: { yuzde }  (2 ondalik)
  // Guvenli girdi: 
  //   - Gecersiz Q_W veya toplam_yuk_W -> NaN
  //   - toplam_yuk_W = 0 (sifir bölme) -> NaN (güvenli)
  function percentOfLoad(opt) {
    opt = opt || {};
    var Q = _num(opt.Q_W);
    var totalLoad = _num(opt.toplam_yuk_W);

    var out = { yuzde: NaN };

    if (!isFinite(Q)) return out;
    if (!isFinite(totalLoad)) return out;

    // Sifir bölme: güvenli
    if (totalLoad === 0) return out;

    var pct = (Q / totalLoad) * 100;
    out.yuzde = Math.round(pct * 100) / 100;
    return out;
  }

  var api = {
    calc: calc,
    percentOfLoad: percentOfLoad
  };
  if (typeof window !== 'undefined') window.DuctHeatGain = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
