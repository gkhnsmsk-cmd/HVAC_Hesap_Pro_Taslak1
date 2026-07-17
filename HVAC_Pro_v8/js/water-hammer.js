// HVAC Hesap Pro — Su Darbesi Basınç Artışı (water-hammer.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Joukowsky formülü ile su darbesi (water hammer) basınç artışı hesaplaması.
// Referans: Colebrook-White, Darcy-Weisbach (boru akış fiziği standardları).
// MALZEME/EKIPMAN KÜTÜPHANESI YOKTUR — tüm değerler KULLANICI GİRDİSİDİR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Joukowsky basınç artışı (su darbesi).
  // Girdi: { rho, a_ms, dv_ms }
  //   rho     : sıvının yoğunluğu (kg/m³) — OPSIYONEL (default 1000, su @ standart koşullar)
  //   a_ms    : basınç dalga hızı (m/s) — GİRDİ ZORUNLU
  //             (boru malzemesi ve et kalınlığına bağlı; bkz. kaynak tabloları)
  //   dv_ms   : ani hız değişimi (m/s) — GİRDİ ZORUNLU (pompa durdurma, valf kapanması vb.)
  // Çıktı: { dP_Pa, dP_bar }
  //   dP_Pa  : basınç artışı (Pa)
  //   dP_bar : basınç artışı (bar, Pa/1e5 için)
  // Güvenli girdi: geçersiz/bölme → NaN alanlarla döner (patlamamaz).
  function joukowskyPressureRise(opt) {
    opt = opt || {};
    // Opsiyonel rho: undefined/null ise default 1000, aksi halde validate
    var rho = (opt.rho !== undefined && opt.rho !== null) ? _num(opt.rho) : 1000;
    var a_ms = _num(opt.a_ms);
    var dv_ms = _num(opt.dv_ms);

    var out = { dP_Pa: NaN, dP_bar: NaN };

    // Temel validasyon
    if (!isFinite(rho) || rho <= 0) return out;
    if (!isFinite(a_ms) || a_ms <= 0) return out;
    if (!isFinite(dv_ms)) return out;  // dv_ms negatif olabilir (hız düşüşü)

    // Joukowsky formülü: dP = rho * a * dv (Pa)
    var dP = rho * a_ms * dv_ms;

    out.dP_Pa = Math.round(dP);  // Pa, tam sayı
    out.dP_bar = Math.round((dP / 1e5) * 100) / 100;  // bar, 2 ondalık

    return out;
  }

  var api = {
    joukowskyPressureRise: joukowskyPressureRise
  };
  if (typeof window !== 'undefined') window.WaterHammer = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
