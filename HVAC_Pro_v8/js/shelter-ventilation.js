// Sığınak Havalandırması — Taze Hava Debisi Motoru (shelter-ventilation.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Kişi başı ve hacim (ACH) bazlı taze hava debisi hesaplama.
// İki yöntemi de sunar; otomatik seçim YAPILMAZ — kullanıcı seçer.
(function () {
  'use strict';

  // Sığınak yönetmeliği — kişi başı taze hava debisi (teyit — standarttan doğrulanmalı):
  //   Tipik aralık: 30-50 m³/h kişi başına (yoğunluğa, kullanım süresine göre değişir)
  //   Referans: EN 16798 (Indoor environmental input parameters), bölgesel yönetmelikler
  var DEFAULT_PERSON_M3H = 30; // Örnek varsayım (kişi başı m³/h)

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kişi başı taze hava gereksinimi: Q = kişi_sayısı × kişi_başı_m³h
  // kişi_başı_m³h: GIRDI (varsayılan değer verilmez; kullanıcı girer)
  // Geçersiz girdi -> NaN dön (güvenli, patlamaz)
  function freshAirRequired(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var n = _num(opts.kisi_sayisi);
    var q_per = _num(opts.kisi_basi_m3h);
    if (!isFinite(n) || n < 0 || !isFinite(q_per) || q_per < 0) return NaN;
    var result = n * q_per;
    return Math.round(result * 100) / 100; // 2 ondalık
  }

  // Hacim bazlı taze hava (ACH — Air Changes per Hour): Q = V × ACH
  // Nota: İki yöntemden (kişi başı ve ACH) BÜYÜK OLANI seçmesi için,
  //       bu fonksiyon sadece ACH sonucunu döner; UI/entegrasyon katmanında seçim yapılır.
  function achFromVolume(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var v = _num(opts.V_m3);
    var ach = _num(opts.ach);
    if (!isFinite(v) || v < 0 || !isFinite(ach) || ach < 0) return NaN;
    var result = v * ach;
    return Math.round(result * 100) / 100; // 2 ondalık
  }

  // Fan seçimi yardımcısı: Q (m³/h) → m³/s (fan katalogları genelde m³/s, l/s veya CFM ile verilir)
  // Cihaz seçimi YAPILMAZ; sadece birim dönüşümü.
  function fanSelect(Q_m3h) {
    var q = _num(Q_m3h);
    if (!isFinite(q) || q < 0) return NaN;
    var q_m3s = q / 3600; // m³/s
    return Math.round(q_m3s * 10000) / 10000; // 4 ondalık (hassas birim dönüşümü)
  }

  var api = {
    DEFAULT_PERSON_M3H: DEFAULT_PERSON_M3H,
    freshAirRequired: freshAirRequired,
    achFromVolume: achFromVolume,
    fanSelect: fanSelect
  };
  if (typeof window !== 'undefined') window.ShelterVentilation = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
