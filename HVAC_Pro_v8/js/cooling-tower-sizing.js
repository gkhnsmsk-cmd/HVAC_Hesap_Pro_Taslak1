// Gsem Mep Pro — Soğutma Kulesi Kapasitesi
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Soğutma sisteminin pompa ısısını dikkate alarak kulesi kapasitesi tahmini.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Soğutma Kulesi Kapasitesi: calc
  // Girdi: { Q_sogutma_kW, pompVerimi_yuzde }
  //   Q_sogutma_kW         : Soğutma yükü (kW) — GIRDI ZORUNLU
  //   pompVerimi_yuzde     : Pompa ısı oranı (%) — OPSIYONEL, varsayı 3%
  //                          (tasarım pratiği: pompa tarafından üretilen ısı yükün ~%3'ü)
  //
  // Formül:
  //   Atilan_toplam_kW = Q_sogutma_kW * (1 + pompVerimi_yuzde/100)  [kW]
  //   Kule_kapasite_kW = Atilan_toplam_kW  (soğutma kulesi min. kapasitesi)
  //
  // Cikti: { Kule_kapasite_kW }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var Q_sogutma_kW = _num(opt.Q_sogutma_kW);
    var pompVerimi_yuzde = _num(opt.pompVerimi_yuzde);

    // Opsiyonel parametre: pompVerimi_yuzde varsayılan 3% (tasarım pratiği)
    // Eğer sağlanmışsa ama geçersizse, hata dön
    if (!isFinite(pompVerimi_yuzde)) {
      if (opt.pompVerimi_yuzde !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { Kule_kapasite_kW: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      pompVerimi_yuzde = 3;
    }

    var out = { Kule_kapasite_kW: NaN };

    // Validasyon: Q_sogutma_kW sonlu ve pozitif
    if (!isFinite(Q_sogutma_kW)) return out;
    if (Q_sogutma_kW < 0) return out;
    if (pompVerimi_yuzde < 0) return out;

    // Toplam atılan ısı (soğutma yükü + pompa ısısı)
    var Atilan_toplam_kW = Q_sogutma_kW * (1 + pompVerimi_yuzde / 100);

    // Soğutma kulesi kapasitesi (minimum)
    var Kule_kapasite_kW = Atilan_toplam_kW;

    out.Kule_kapasite_kW = Math.round(Kule_kapasite_kW * 100) / 100;
    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.CoolingTowerSizing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
