// Gsem Mep Pro — Mutfak Hood Egzoz (VDI 2052)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Mutfak davlumbazının gerekli hava debisi hesaplaması.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Mutfak Hood Egzoz: calc
  // Girdi: { alanM2, izgara_eni_m, hava_hizi_ms, cikmaDugume }
  //   alanM2          : Davlumba alanı (m²) — GIRDI ZORUNLU (referans/validasyon)
  //   izgara_eni_m    : İzgaranın genişliği (m) — GIRDI ZORUNLU
  //   hava_hizi_ms    : Hava hızı (m/s) — GIRDI ZORUNLU
  //   cikmaDugume     : Çıkma düğümü derinliği (m) — OPSIYONEL, varsayı 2
  //
  // Formül:
  //   A_grill_m2 = izgara_eni_m * cikmaDugume  [m²]
  //   Q_m3h = A_grill_m2 * hava_hizi_ms * 3600  [m³/h]
  //
  // Cikti: { debi_m3h }  (2 ondalik)
  // Guvenli girdi: gecersiz -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var alanM2 = _num(opt.alanM2);
    var izgara_eni_m = _num(opt.izgara_eni_m);
    var hava_hizi_ms = _num(opt.hava_hizi_ms);
    var cikmaDugume = _num(opt.cikmaDugume);

    // Opsiyonel parametre: cikmaDugume varsayılan 2 m
    // Eğer sağlanmışsa ama geçersizse, hata dön
    if (!isFinite(cikmaDugume)) {
      if (opt.cikmaDugume !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { debi_m3h: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      cikmaDugume = 2;
    }

    var out = { debi_m3h: NaN };

    // Validasyon: zorunlu girdiler sonlu ve pozitif
    if (!isFinite(alanM2) || !isFinite(izgara_eni_m) || !isFinite(hava_hizi_ms)) return out;
    if (alanM2 < 0 || izgara_eni_m < 0 || hava_hizi_ms < 0 || cikmaDugume <= 0) return out;

    // İzgara alanı
    var A_grill_m2 = izgara_eni_m * cikmaDugume;

    // Hava debisi
    var debi_m3h = A_grill_m2 * hava_hizi_ms * 3600;

    out.debi_m3h = Math.round(debi_m3h * 100) / 100;
    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.KitchenHood = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
