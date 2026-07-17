// HVAC Hesap Pro — Zorunlu Sistemler Kontrol Listesi (mandatory-systems-checklist.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Binaların Yangından Korunması Hakkında Yönetmelik (TEYİT) bazında sprinkler, hidrant,
// sığınak havalandırması, asansör basınçlandırması, duman tahliye sistemi zorunluluğu kontrolü.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Zorunlu sistemler kontrolü.
  // Girdi: {
  //   bina_yuksekligi_m,
  //   kat_sayisi,
  //   toplam_insaat_alani_m2,
  //   esik_sprinkler_yukseklik_m,      // Kullanıcı/yönetmelik tarafından sağlanan eşik
  //   esik_hidrant_alan_m2,             // Kullanıcı/yönetmelik tarafından sağlanan eşik
  //   esik_siginak_kat_sayisi,          // Kullanıcı/yönetmelik tarafından sağlanan eşik
  //   esik_asansor_basinclandirma_yukseklik_m,  // Kullanıcı/yönetmelik tarafından sağlanan eşik
  //   esik_duman_tahliye_alan_m2        // Kullanıcı/yönetmelik tarafından sağlanan eşik
  // }
  // Çıktı: {
  //   sprinkler_gerekli: boolean | null,
  //   hidrant_gerekli: boolean | null,
  //   siginak_havalandirma_gerekli: boolean | null,
  //   asansor_basinclandirma_gerekli: boolean | null,
  //   duman_tahliye_gerekli: boolean | null
  // }
  // Notlar:
  // - Tüm esik_* parametreleri giriş parametreleridir (hardcode yok). Yönetmelik eşikleri
  //   kullanıcı tarafından veya dış konfigürasyondan sağlanır.
  // - Eksik/NaN girdide ilgili alan null döner (crash yok).
  // - Karşılaştırma >= işlemi ile yapılır.
  function calc(opt) {
    opt = opt || {};

    var bina_h = _num(opt.bina_yuksekligi_m);
    var kat_n = _num(opt.kat_sayisi);
    var alan = _num(opt.toplam_insaat_alani_m2);
    var esik_spr_h = _num(opt.esik_sprinkler_yukseklik_m);
    var esik_hid_a = _num(opt.esik_hidrant_alan_m2);
    var esik_sig_k = _num(opt.esik_siginak_kat_sayisi);
    var esik_asa_h = _num(opt.esik_asansor_basinclandirma_yukseklik_m);
    var esik_dum_a = _num(opt.esik_duman_tahliye_alan_m2);

    var out = {
      sprinkler_gerekli: null,
      hidrant_gerekli: null,
      siginak_havalandirma_gerekli: null,
      asansor_basinclandirma_gerekli: null,
      duman_tahliye_gerekli: null
    };

    // sprinkler_gerekli: bina_yuksekligi_m >= esik_sprinkler_yukseklik_m
    if (isFinite(bina_h) && isFinite(esik_spr_h)) {
      out.sprinkler_gerekli = bina_h >= esik_spr_h;
    }

    // hidrant_gerekli: toplam_insaat_alani_m2 >= esik_hidrant_alan_m2
    if (isFinite(alan) && isFinite(esik_hid_a)) {
      out.hidrant_gerekli = alan >= esik_hid_a;
    }

    // siginak_havalandirma_gerekli: kat_sayisi >= esik_siginak_kat_sayisi
    if (isFinite(kat_n) && isFinite(esik_sig_k)) {
      out.siginak_havalandirma_gerekli = kat_n >= esik_sig_k;
    }

    // asansor_basinclandirma_gerekli: bina_yuksekligi_m >= esik_asansor_basinclandirma_yukseklik_m
    if (isFinite(bina_h) && isFinite(esik_asa_h)) {
      out.asansor_basinclandirma_gerekli = bina_h >= esik_asa_h;
    }

    // duman_tahliye_gerekli: toplam_insaat_alani_m2 >= esik_duman_tahliye_alan_m2
    if (isFinite(alan) && isFinite(esik_dum_a)) {
      out.duman_tahliye_gerekli = alan >= esik_dum_a;
    }

    return out;
  }

  var api = {
    calc: calc
  };
  if (typeof window !== 'undefined') window.MandatorySystemsChecklist = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
