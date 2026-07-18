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

  // ─────────────────────────────────────────────────────────────────
  // Eski calc() SADECE izgara-alanı × sabit-hız yöntemini kullanıyordu.
  // Gerçek VDI 2052, cihazların KONVEKTİF ISI YÜKÜNE dayalı termik
  // plume debisini ve davlumbazın YAKALAMA VERİMİNİ (capture &
  // containment) de hesaba katar — bu eskiden HİÇ YOKTU. Aşağıdaki
  // fonksiyonlar cihaz-bazlı yöntemi ekler; TAM termik plume denklemi
  // (cihaz geometrisi/montaj yüksekliği bağımlı, çok değişkenli)
  // KAPSAM DIŞIDIR — burada VDI 2052 Ek tablolarının k-katsayı
  // yaklaşımı (yaygın mühendislik pratiği) kullanılır, TEYİT gerekir.

  // deviceConvectiveLoad: Cihaz listesinden toplam konvektif ısı yükü.
  //   cihazlar = [{Q_conv_kW}, ...] — her cihazın konvektif yükü
  //   (GİRDİ ZORUNLU, VDI 2052 Ek/cihaz teknik veri sayfası TEYİT —
  //   pişirme cihazı tipine göre büyük ölçüde değişir, sabit VERİLMEZ)
  function deviceConvectiveLoad(opt) {
    opt = opt || {};
    var cihazlar = opt.cihazlar;
    if (!Array.isArray(cihazlar) || cihazlar.length === 0) return NaN;

    var total = 0;
    for (var i = 0; i < cihazlar.length; i++) {
      var q = _num(cihazlar[i] && cihazlar[i].Q_conv_kW);
      if (!isFinite(q) || q < 0) return NaN;
      total += q;
    }
    return Math.round(total * 1000) / 1000;
  }

  // deviceBasedFlow: Konvektif ısı yüküne dayalı GEREKLİ debi.
  //   toplam_Q_conv_kW  : deviceConvectiveLoad() çıktısı veya manuel (kW)
  //   k_katsayi_m3h_kW  : Debi/yük oranı (m³/h per kW) — GİRDİ ZORUNLU,
  //                       davlumbaz tipine göre değişir (duvar tipi
  //                       tipik ~200–300, ada tipi genelde DAHA YÜKSEK
  //                       — VDI 2052/DIN 18869 TEYİT, sabit VERİLMEZ)
  // Sonuç: V_gerekli_m3h = toplam_Q_conv_kW * k_katsayi_m3h_kW
  function deviceBasedFlow(opt) {
    opt = opt || {};
    var q = _num(opt.toplam_Q_conv_kW);
    var k = _num(opt.k_katsayi_m3h_kW);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(k) || k <= 0) return NaN;
    return Math.round(q * k * 100) / 100;
  }

  // captureEfficiencyAdjust: Yakalama verimini uygulayarak TASARIM
  // debisine çevirir (verim <1 ise gerçek gereken debi artar).
  //   V_gerekli_m3h  : deviceBasedFlow() çıktısı (m³/h)
  //   yakalama_verimi: Davlumbazın yakalama & tutma verimi (0-1] —
  //                    GİRDİ ZORUNLU (VDI 2052/DIN 18869 TEYİT, tip/
  //                    montaj/açık kenar sayısına göre değişir)
  // Sonuç: V_tasarim_m3h = V_gerekli_m3h / yakalama_verimi
  function captureEfficiencyAdjust(opt) {
    opt = opt || {};
    var v = _num(opt.V_gerekli_m3h);
    var eta = _num(opt.yakalama_verimi);
    if (!isFinite(v) || v < 0) return NaN;
    if (!isFinite(eta) || eta <= 0 || eta > 1) return NaN;
    return Math.round((v / eta) * 100) / 100;
  }

  // combinedFlow: İzgara-hızı yöntemi (calc) İLE cihaz-bazlı yöntemi
  // (deviceBasedFlow + captureEfficiencyAdjust) KARŞILAŞTIRIR, fanın
  // karşılaması gereken BÜYÜK debiyi döndürür — tek yönteme güvenmek
  // yerine iki bağımsız kontrolün BÜYÜK OLANI seçilir (mühendislik
  // pratiği: iki yöntem birbirini doğrulamalı).
  function combinedFlow(opt) {
    opt = opt || {};
    var gril = calc(opt).debi_m3h;
    var cihazGerekli = deviceBasedFlow(opt);
    var cihazTasarim = captureEfficiencyAdjust({ V_gerekli_m3h: cihazGerekli, yakalama_verimi: opt.yakalama_verimi });

    var g = isFinite(gril) ? gril : NaN;
    var c = isFinite(cihazTasarim) ? cihazTasarim : NaN;

    if (!isFinite(g) && !isFinite(c)) {
      return { izgara_debi_m3h: NaN, cihaz_debi_m3h: NaN, tasarim_debi_m3h: NaN, gov_yontem: null };
    }
    var gSafe = isFinite(g) ? g : -Infinity;
    var cSafe = isFinite(c) ? c : -Infinity;
    var maxVal = Math.max(gSafe, cSafe);
    return {
      izgara_debi_m3h: isFinite(g) ? g : NaN,
      cihaz_debi_m3h: isFinite(c) ? c : NaN,
      tasarim_debi_m3h: maxVal,
      gov_yontem: maxVal === gSafe ? 'izgara' : 'cihaz'
    };
  }

  var api = {
    calc: calc,
    deviceConvectiveLoad: deviceConvectiveLoad,
    deviceBasedFlow: deviceBasedFlow,
    captureEfficiencyAdjust: captureEfficiencyAdjust,
    combinedFlow: combinedFlow
  };
  if (typeof window !== 'undefined') window.KitchenHood = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
