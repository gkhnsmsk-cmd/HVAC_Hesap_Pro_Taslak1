// Asansör Basınç Kontrolü / Sızıntı Hava Debisi (elevator-pressurization.js)
// Kapı açılış sızıntı alanı ve basınç farkından debisi hesapla.
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Referans: EN 12101 (duman kontrol sistemleri), orifis akış formülü
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kapı açılışı / sızıntı alanlarından hesaplanan hava debisi.
  // Orifis akış formülü: V = C * A * sqrt(2 * dP / rho)
  // Parametreler:
  //   - sizdirmazlikAlaniM2: kapı/boşluk sızıntı alanları toplamı (m²) — ZORUNLU
  //   - hizKatsayi: orifis hız katsayısı (0-1 arası; default 0.83)
  //   - hedefBasincFarkiPa: hedef basınç farkı (Pa) — ZORUNLU (kullanıcı girer, hardcode YAPILMAZ)
  //   - hava_yogunluk: hava yoğunluğu (kg/m³; default 1.2 @ 20°C)
  // Çıktı: {hizMs, debiM3s, debiM3h} veya {error: "..."}
  // Geçersiz girdi -> {error: "..."} dön (hata fırlatma YAPILMAZ)
  function calc(opts) {
    if (!opts || typeof opts !== 'object') {
      return { error: 'invalid input: opts must be an object' };
    }

    var sizdirmazlik = _num(opts.sizdirmazlikAlaniM2);
    var hiz_kats = opts.hizKatsayi !== undefined ? _num(opts.hizKatsayi) : 0.83;
    var basınc = _num(opts.hedefBasincFarkiPa);
    var yogunluk = opts.hava_yogunluk !== undefined ? _num(opts.hava_yogunluk) : 1.2;

    // Zorunlu parametreleri kontrol et
    if (!isFinite(sizdirmazlik) || sizdirmazlik < 0) {
      return { error: 'invalid sizdirmazlikAlaniM2: must be a non-negative number' };
    }
    if (!isFinite(basınc) || basınc < 0) {
      return { error: 'invalid hedefBasincFarkiPa: must be a non-negative number' };
    }

    // Varsayılan parametreleri kontrol et
    if (!isFinite(hiz_kats) || hiz_kats < 0 || hiz_kats > 1) {
      return { error: 'invalid hizKatsayi: must be 0-1' };
    }
    if (!isFinite(yogunluk) || yogunluk <= 0) {
      return { error: 'invalid hava_yogunluk: must be > 0' };
    }

    // Orifis akış formülü: V = C * sqrt(2 * dP / rho)
    var hizMs = hiz_kats * Math.sqrt(2 * basınc / yogunluk);

    // Debi: Q = A * V
    var debiM3s = sizdirmazlik * hizMs;
    var debiM3h = debiM3s * 3600;

    // Adil yuvarlama (3 ondalık + birim hassasiyeti)
    return {
      hizMs: Math.round(hizMs * 10000) / 10000,      // 4 ondalık (m/s hassasiyeti)
      debiM3s: Math.round(debiM3s * 10000) / 10000,  // 4 ondalık
      debiM3h: Math.round(debiM3h * 1000) / 1000     // 3 ondalık (m³/h standart)
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Eski calc() SADECE "kapılar kapalı" (sızıntı) senaryosunu
  // hesaplıyordu. Gerçek tasarımda asansör kapısı bir katta AÇIKKEN
  // (kurtarma/tahliye senaryosu) çok daha büyük debi gerekebilir —
  // bu senaryo eskiden HİÇ hesaplanmıyordu. Aşağıdaki fonksiyonlar
  // bu eksiği kapatır (bkz staircase-pressurization.js'deki aynı desen).
  // Kat-bazlı piston etkisi (kabin hareketi) ve çok katlı tam ağ
  // analizi BU MODÜLÜN KAPSAMI DIŞINDADIR — proje-özel TEYİT gerekir.

  // openDoorFlow: Asansör kapısı AÇIKKEN gereken minimum debi.
  // kapi_alani_m2 : Açık kapı net geçiş kesiti (m²) — GİRDİ ZORUNLU
  // min_hiz_ms    : Kapı kesitinden geçmesi gereken min. hız (m/s)
  //                 — GİRDİ ZORUNLU, sabit VERİLMEZ (TEYİT gerekir)
  function openDoorFlow(opt) {
    opt = opt || {};
    var a = _num(opt.kapi_alani_m2);
    var v = _num(opt.min_hiz_ms);
    if (!isFinite(a) || a <= 0) return { error: 'invalid kapi_alani_m2: must be > 0' };
    if (!isFinite(v) || v <= 0) return { error: 'invalid min_hiz_ms: must be > 0' };
    var debiM3h = a * v * 3600;
    return { debiM3h: Math.round(debiM3h * 1000) / 1000 };
  }

  // designFlow: Kapalı-kapı (calc) ve açık-kapı (openDoorFlow)
  // senaryolarını KARŞILAŞTIRIR, fanın karşılaması gereken BÜYÜK
  // debiyi döndürür (gov_senaryo: 'kapali' | 'acik' | null).
  function designFlow(opt) {
    opt = opt || {};
    var closed = calc(opt);
    var open = openDoorFlow(opt);
    var c = (closed && isFinite(closed.debiM3h)) ? closed.debiM3h : NaN;
    var o = (open && isFinite(open.debiM3h)) ? open.debiM3h : NaN;

    if (!isFinite(c) && !isFinite(o)) {
      return { kapaliKapiDebiM3h: NaN, acikKapiDebiM3h: NaN, tasarimDebiM3h: NaN, govSenaryo: null };
    }
    var cSafe = isFinite(c) ? c : -Infinity;
    var oSafe = isFinite(o) ? o : -Infinity;
    var maxVal = Math.max(cSafe, oSafe);
    return {
      kapaliKapiDebiM3h: isFinite(c) ? c : NaN,
      acikKapiDebiM3h: isFinite(o) ? o : NaN,
      tasarimDebiM3h: maxVal,
      govSenaryo: maxVal === cSafe ? 'kapali' : 'acik'
    };
  }

  var api = {
    calc: calc,
    openDoorFlow: openDoorFlow,
    designFlow: designFlow
  };
  if (typeof window !== 'undefined') window.ElevatorPressurization = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
