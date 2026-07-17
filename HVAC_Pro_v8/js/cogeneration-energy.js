// HVAC Hesap Pro — Kogenerasyonu Enerji Verimliliği (cogeneration-energy.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Kogenerasyon (CHP) cihazları için elektrik ve ısı çıktıları ile verimlilik hesabı.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // outputs: Kogenerasyon cihazından elektrik ve ısı çıktılarını hesapla.
  // Girdiler:
  //   yakit_girdi_kW: yakıt giriş gücü (kW, >0)
  //   elektrik_verimi: elektrik verimlilik oranı (boyutsuz, 0 < η_e ≤ 1)
  //   isil_verim: ısıl verimlilik oranı (boyutsuz, 0 < η_t ≤ 1)
  //
  // ZORUNLU GİRDİ — elektrik_verimi ve isil_verim cihaz teknik veri sayfasından TEYİT edilmeli
  // (Verimler cihaz tipi, yakıt türü, yükleme durumuna bağlı olarak değişir)
  //
  // Çıktılar:
  //   elektrik_kW: elektrik çıktısı = yakit_girdi_kW * elektrik_verimi
  //   isi_kW: ısıl çıktısı (ısıtma/soğutma) = yakit_girdi_kW * isil_verim
  //   toplam_verim: toplam verimlilik oranı = elektrik_verimi + isil_verim
  //
  // Geçersiz/negatif/NaN girdi -> NaN güvenli
  function outputs(opts) {
    opts = opts || {};
    var yakit_girdi_kW = _num(opts.yakit_girdi_kW);
    var elektrik_verimi = _num(opts.elektrik_verimi);
    var isil_verim = _num(opts.isil_verim);

    if (!isFinite(yakit_girdi_kW) || !isFinite(elektrik_verimi) || !isFinite(isil_verim)) return NaN;
    // Girdiler negatif veya sıfır -> fiziksel olarak imkansız -> NaN
    if (yakit_girdi_kW <= 0) return NaN;
    if (elektrik_verimi <= 0 || elektrik_verimi > 1) return NaN;
    if (isil_verim <= 0 || isil_verim > 1) return NaN;

    var elektrik_kW = yakit_girdi_kW * elektrik_verimi;
    var isi_kW = yakit_girdi_kW * isil_verim;
    var toplam_verim = elektrik_verimi + isil_verim;

    return {
      elektrik_kW: elektrik_kW,
      isi_kW: isi_kW,
      toplam_verim: toplam_verim
    };
  }

  // primaryEnergySavingRatio: Kogenerasyon cihazının birincil enerji tasarrufu oranını (PES) hesapla.
  // Girdiler:
  //   ref_elektrik_verimi: referans elektrik üretim verimlilik oranı (boyutsuz, 0 < η_ref_e ≤ 1)
  //   ref_isi_verimi: referans ısı sağlama verimlilik oranı (boyutsuz, 0 < η_ref_t ≤ 1)
  //   elektrik_verimi: kogenerasyon elektrik verimlilik oranı (boyutsuz)
  //   isil_verim: kogenerasyon ısıl verimlilik oranı (boyutsuz)
  //
  // ZORUNLU GİRDİ — ref_elektrik_verimi ve ref_isi_verimi ulusal şebeke/kazan verimleri olarak TEYİT edilmeli
  // (Referans veriler ülke, yıl, standart kaynağına bağlı olarak değişir; örn. EN 50160, EN 12831)
  //
  // Hesap: PES = 1 - 1 / ((η_e / η_ref_e) + (η_t / η_ref_t))
  // Döner değer: 0 ile 1 arasında bir PES oranı (0.2 = %20 tasarrufu) veya NaN
  //
  // Geçersiz/sıfır/NaN girdi -> NaN güvenli
  function primaryEnergySavingRatio(opts) {
    opts = opts || {};
    var ref_elektrik_verimi = _num(opts.ref_elektrik_verimi);
    var ref_isi_verimi = _num(opts.ref_isi_verimi);
    var elektrik_verimi = _num(opts.elektrik_verimi);
    var isil_verim = _num(opts.isil_verim);

    if (!isFinite(ref_elektrik_verimi) || !isFinite(ref_isi_verimi) ||
        !isFinite(elektrik_verimi) || !isFinite(isil_verim)) return NaN;

    // Referans veriler sıfır veya olumsuz -> geçersiz -> NaN
    if (ref_elektrik_verimi <= 0 || ref_isi_verimi <= 0) return NaN;
    // CHP verimleri olumsuz -> geçersiz -> NaN
    if (elektrik_verimi <= 0 || isil_verim <= 0) return NaN;

    var denom = (elektrik_verimi / ref_elektrik_verimi) + (isil_verim / ref_isi_verimi);
    if (denom <= 0) return NaN;

    var PES = 1 - (1 / denom);
    return PES;
  }

  var api = {
    outputs: outputs,
    primaryEnergySavingRatio: primaryEnergySavingRatio
  };
  if (typeof window !== 'undefined') window.CogenerationEnergy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
