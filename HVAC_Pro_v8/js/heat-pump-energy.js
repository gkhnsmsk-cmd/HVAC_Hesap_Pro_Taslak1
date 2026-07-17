// HVAC Hesap Pro — Isı Pompası Enerji Verimliliği (heat-pump-energy.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Isı pompası cihazları için elektrik talebi ve karbon emisyonu hesabı.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // electricityDemand: Isı pompasının elektrik talebini hesapla.
  // kWh_elektrik = Q_isi_kWh / COP
  // Q_isi_kWh: ısı pompasından alınan ısı enerji (kWh)
  // COP: Coefficient of Performance (boyutsuz, >0)
  //      ZORUNLU GIRDI — cihaz teknik veri sayfasından TEYIT edilmeli
  //      (COP ısıtma/soğutma modu, dış hava sıcaklığı, yük koşullarına bağlı olarak değişir)
  // Sonuç: kWh cinsinden elektrik talebi (pozitif sonlu beklenir)
  // COP<=0 veya NaN -> NaN güvenli
  function electricityDemand(opts) {
    opts = opts || {};
    var Q_isi_kWh = _num(opts.Q_isi_kWh);
    var COP = _num(opts.COP);

    if (!isFinite(Q_isi_kWh) || !isFinite(COP)) return NaN;
    // COP <= 0 -> fiziksel olarak imkansız -> NaN
    if (COP <= 0) return NaN;

    var kWh_elektrik = Q_isi_kWh / COP;
    return kWh_elektrik;
  }

  // carbonEmission: Elektrik tüketimine dayalı karbon emisyonunu hesapla.
  // kgCO2 = kWh_elektrik * emisyon_faktoru_kgCO2_kWh
  // kWh_elektrik: elektrik tüketimi (kWh)
  // emisyon_faktoru_kgCO2_kWh: şebeke karbon intensitesi (kgCO2/kWh)
  //                             ZORUNLU GIRDI — ulusal elektrik şebekesinin yıllık ortalama
  //                             emisyon faktöründen TEYIT edilmeli (ülke, yıl, kaynak karması)
  //                             Örn: Türkiye 2020 ~0.45, AB ortalaması ~0.35, Fransa ~0.05
  // Sonuç: kgCO2 cinsinden toplam emisyon
  // NaN girdiler -> NaN güvenli
  function carbonEmission(opts) {
    opts = opts || {};
    var kWh_elektrik = _num(opts.kWh_elektrik);
    var emisyon_faktoru_kgCO2_kWh = _num(opts.emisyon_faktoru_kgCO2_kWh);

    if (!isFinite(kWh_elektrik) || !isFinite(emisyon_faktoru_kgCO2_kWh)) return NaN;

    var kgCO2 = kWh_elektrik * emisyon_faktoru_kgCO2_kWh;
    return kgCO2;
  }

  var api = {
    electricityDemand: electricityDemand,
    carbonEmission: carbonEmission
  };
  if (typeof window !== 'undefined') window.HeatPumpEnergy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
