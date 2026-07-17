// Sismik Askı Yatay Kuvvet Basit Hesabı (seismic-hanger.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Bina ve ekipman sismik tasarımı için yatay kuvvet hesabı.
(function () {
  'use strict';

  // Yardımcı: Number dönüştürme ve finite kontrol
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Basitleştirilmiş ASCE 7 tipi sismik yatay kuvvet hesabı:
  // Fp_kg = 0.4 * Sds * Ip * W_kg
  // Bu formül, bina yapısına asılan HVAC/MEP ekipmanının sismik yüküdür.
  //
  // W_kg: Ekipmanın kütlesi (kg) — KULLANICI GIRDISI.
  // Sds: Tasarım spektral ivme katsayısı (dimensiyonsuz) — KULLANICI GIRDISI (TEYIT).
  //   Deprem bölgesine, zemin sınıfına ve bina önem kategorisine göre değişir.
  //   Sabit değer VERILMEZ, ASCE 7 / TBDY 2018 (Türkiye Bina Deprem Yönetmeliği)
  //   tabloları / deprem haritasından alınır.
  // Ip: Ekipman önem katsayısı (dimensiyonsuz) — KULLANICI GIRDISI (TEYIT).
  //   Tipik değerler 1.0 (normal ekipman), 1.5 (kritik ekipman) aralığı.
  //   Sabit değer VERILMEZ, bina önem kategorisine ve ekipman kritikalliğine göre
  //   proje tasarım yönetmeliği belirler.
  //
  // BASITLESTIRILMIS FORMUL NOTU:
  //   Bu modül, tam sismik analiz yerine basit tasarım yöntemi (simplified design method)
  //   için hızlı hesap sağlar. Detaylı sismik tasarım, dinamik analiz, modal yöntemler
  //   vb. tam yönetmelik gerektir ve bu modul kapsam dışıdır.
  //   Gerçek projede: ASCE 7-22, TBDY 2018, yerel deprem yönetmelikleri ve
  //   proje özel teknik şartnamesine uyulmalıdır.
  //
  // Geçersiz girdi (NaN, negatif, infinit) -> güvenli NaN döndürür.
  function seismicLoad(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var w = _num(opt.W_kg);
    var sds = _num(opt.Sds);
    var ip = _num(opt.Ip);

    // Girdi doğrulaması
    if (!isFinite(w) || w < 0) return NaN;
    if (!isFinite(sds) || sds < 0) return NaN;
    if (!isFinite(ip) || ip < 0) return NaN;

    // Sismik yatay kuvvet (kg-force olarak döndürülür)
    var fp = 0.4 * sds * ip * w;
    return Math.round(fp * 100) / 100; // 2 ondalık (kg-force)
  }

  var api = {
    seismicLoad: seismicLoad
  };
  if (typeof window !== 'undefined') window.SeismicHanger = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
