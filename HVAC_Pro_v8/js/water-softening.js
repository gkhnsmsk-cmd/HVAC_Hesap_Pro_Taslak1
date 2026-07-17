// HVAC Hesap Pro — Su Yumuşatma Reçine Hacmi (water-softening.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Su yumuşatma sistemleri için reçine yükü ve gerekli hacim hesabi.
(function () {
  'use strict';

  // Su sertliği dönüşüm sabiti
  // 1 Fransız sertlik derecesi (°F) = 10 mg CaCO3/L
  // Bu sabit, birim dönüşümü için kullanılır ve teyit edilmiştir.
  var HARDNESS_CONVERSION_FACTOR = 10;  // mg CaCO3/L per °F

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // resinVolume: Su yumuşatma reçinesinin gerekli hacmi.
  // debi_m3h: Su debisi (m3/h)
  // sertlik_delta_F: Sertlik farkı (°F cinsinden, giriş-çıkış arasındaki hedef azalış)
  // sure_h: Çalışma süresi veya döngü süresi (saat)
  // recine_kapasite_gr_L: Reçine kapasitesi (gram CaCO3 eşdeğeri per litre reçine)
  //   NOT: Bu değer reçine ürünün teknik veri sayfasından TEYİT EDİLMELİDİR.
  //   Ürün tipine göre değişir (weak-acid, strong-acid vb.).
  // 
  // yuk_gr = debi_m3h * sure_h * sertlik_delta_F * HARDNESS_CONVERSION_FACTOR
  // V_L = yuk_gr / recine_kapasite_gr_L
  // 
  // Geçersiz girdiler (NaN, sıfıra bölme) -> NaN döndür, hata oluşturma
  // Sonuç: {yuk_gr: <number>, V_L: <number>} veya {yuk_gr: NaN, V_L: NaN}
  function resinVolume(opts) {
    opts = opts || {};
    var debi = _num(opts.debi_m3h);
    var hardness = _num(opts.sertlik_delta_F);
    var duration = _num(opts.sure_h);
    var capacity = _num(opts.recine_kapasite_gr_L);

    // Girdilerden herhangi biri geçersizse NaN döndür
    if (!isFinite(debi) || !isFinite(hardness) || !isFinite(duration) || !isFinite(capacity)) {
      return { yuk_gr: NaN, V_L: NaN };
    }

    // Yük hesabı: debi * süre * sertlik_delta * dönüşüm faktörü
    var yuk_gr = debi * duration * hardness * HARDNESS_CONVERSION_FACTOR;

    // Reçine hacmi: yük / kapasite
    // Kapasite sıfırsa, sıfıra bölme -> NaN güvenli
    var V_L = yuk_gr / capacity;

    return { yuk_gr: yuk_gr, V_L: V_L };
  }

  var api = {
    HARDNESS_CONVERSION_FACTOR: HARDNESS_CONVERSION_FACTOR,
    resinVolume: resinVolume
  };
  if (typeof window !== 'undefined') window.WaterSoftening = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
