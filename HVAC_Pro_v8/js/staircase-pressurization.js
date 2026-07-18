// Gsem Mep Pro — Merdiven Basınçlandırması (EN 12101-6)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Orifiyce akış formülü ile kaçak alanından gereken hava debisi.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Merdiven Basınçlandırması: calc
  // Girdi: { sizinti_alani_m2, hedef_basinc_farkiPa, hava_yogunluk }
  //   sizinti_alani_m2       : Kaçak alanı (m²) — GIRDI ZORUNLU
  //   hedef_basinc_farkiPa   : Hedef basınç farkı (Pa) — GIRDI ZORUNLU
  //   hava_yogunluk          : Hava yoğunluğu (kg/m³) — OPSIYONEL, varsayı 1.2
  //
  // Formül (EN 12101-6, orifice flow):
  //   v_ms = 0.83 * sqrt(2 * ΔP / ρ)  [m/s]
  //   Q_m3h = A * v * 3.6               [m³/h]
  //
  // Cikti: { debi_m3h }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif/sifir bolme -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var sizinti_alani_m2 = _num(opt.sizinti_alani_m2);
    var hedef_basinc_farkiPa = _num(opt.hedef_basinc_farkiPa);
    var hava_yogunluk = _num(opt.hava_yogunluk);

    // Opsiyonel parametre: hava_yogunluk varsayılan 1.2 kg/m³
    // Eğer sağlanmışsa ama geçersizse, hata dön
    if (!isFinite(hava_yogunluk)) {
      if (opt.hava_yogunluk !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { debi_m3h: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      hava_yogunluk = 1.2;
    }

    var out = { debi_m3h: NaN };

    // Validasyon: gerekli girdiler sonlu ve pozitif
    if (!isFinite(sizinti_alani_m2) || !isFinite(hedef_basinc_farkiPa)) return out;
    if (sizinti_alani_m2 < 0 || hedef_basinc_farkiPa < 0) return out;
    if (hava_yogunluk <= 0) return out;

    // Orifice flow hızı
    var v_ms = 0.83 * Math.sqrt(2 * hedef_basinc_farkiPa / hava_yogunluk);
    var debi_m3h = sizinti_alani_m2 * v_ms * 3.6;

    out.debi_m3h = Math.round(debi_m3h * 100) / 100;
    return out;
  }

  // ─────────────────────────────────────────────────────────────────
  // Eski calc() SADECE "tüm kapılar kapalı" (kaçak-alanı) senaryosunu
  // hesaplıyordu. Gerçek EN 12101-6 tasarımı İKİ senaryoyu karşılaştırıp
  // BÜYÜK OLANI seçer:
  //   (1) Kapılar kapalı  -> kaçak alanından debi (calc(), yukarıda)
  //   (2) Tasarım kapısı AÇIK -> açık kapı kesitinden minimum hız ile
  //       debi (fan bu debiyi de karşılayabilmeli, genelde BASKIN
  //       senaryo budur — kod eskiden bunu hiç hesaplamıyordu).
  // Çok katlı/çok kapılı tam ağ analizi (kat bazlı yığın etkisi vb.)
  // BU MODÜLÜN KAPSAMI DIŞINDADIR — proje-özel TEYİT gerekir.

  // openDoorFlow: Tasarım kapısı AÇIKKEN gereken minimum debi.
  // kapi_alani_m2   : Açık kapı net geçiş kesiti (m²) — GİRDİ ZORUNLU
  // min_hiz_ms      : Kapı kesitinden geçmesi gereken min. hava hızı
  //                   (m/s) — GİRDİ ZORUNLU, sabit VERİLMEZ (EN 12101-6
  //                   kategoriye göre tipik 0.75–2 m/s, TEYİT gerekir)
  // Sonuç: { debi_m3h } = kapi_alani_m2 * min_hiz_ms * 3600
  function openDoorFlow(opt) {
    opt = opt || {};
    var a = _num(opt.kapi_alani_m2);
    var v = _num(opt.min_hiz_ms);
    if (!isFinite(a) || a <= 0) return { debi_m3h: NaN };
    if (!isFinite(v) || v <= 0) return { debi_m3h: NaN };
    return { debi_m3h: Math.round(a * v * 3600 * 100) / 100 };
  }

  // designFlow: Kapalı-kapı (kaçak) VE açık-kapı (hız) senaryolarını
  // KARŞILAŞTIRIR, fanın karşılaması gereken BÜYÜK debiyi döndürür.
  // Girdi: calc() ve openDoorFlow() girdilerinin BİRLEŞİMİ.
  // Sonuç: { kapali_kapi_debi_m3h, acik_kapi_debi_m3h, tasarim_debi_m3h, gov_senaryo }
  //   gov_senaryo: 'kapali' | 'acik' — hangi senaryo baskın (bilgi amaçlı)
  function designFlow(opt) {
    opt = opt || {};
    var closed = calc(opt);
    var open = openDoorFlow(opt);

    if (!isFinite(closed.debi_m3h) && !isFinite(open.debi_m3h)) {
      return { kapali_kapi_debi_m3h: NaN, acik_kapi_debi_m3h: NaN, tasarim_debi_m3h: NaN, gov_senaryo: null };
    }
    var c = isFinite(closed.debi_m3h) ? closed.debi_m3h : -Infinity;
    var o = isFinite(open.debi_m3h) ? open.debi_m3h : -Infinity;
    var maxVal = Math.max(c, o);

    return {
      kapali_kapi_debi_m3h: closed.debi_m3h,
      acik_kapi_debi_m3h: open.debi_m3h,
      tasarim_debi_m3h: isFinite(maxVal) && maxVal > -Infinity ? maxVal : NaN,
      gov_senaryo: maxVal === c ? 'kapali' : 'acik'
    };
  }

  var api = { calc: calc, openDoorFlow: openDoorFlow, designFlow: designFlow };
  if (typeof window !== 'undefined') window.StaircasePressurization = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
