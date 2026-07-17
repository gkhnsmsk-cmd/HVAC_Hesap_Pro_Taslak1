// Oda Havalandırması — Kişi Başı ve Hacim (ACH) Bazlı Debi Motoru (room-ventilation-rate.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Oda tipi ve kişi yoğunluğuna göre taze hava debisi hesaplama.
// İki yöntemi de sunar; otomatik seçim YAPILMAZ — kullanıcı seçer.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Hacim bazlı taze hava (ACH — Air Changes per Hour): Q = V × ACH
  // ach: GIRDI (varsayılan değer verilmez; kullanıcı girer, yönetmeliğe/oda tipine göre değişir)
  // Nota: EN 16798-1 oda tipi tablosu TEYİT — ach değerleri kategoriye/risklere göre ayarlanır
  // Geçersiz girdi -> NaN dön (güvenli, patlamaz)
  function byACH(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var v = _num(opts.V_m3);
    var ach = _num(opts.ach);
    if (!isFinite(v) || v < 0 || !isFinite(ach) || ach < 0) return NaN;
    var result = v * ach;
    return Math.round(result * 100) / 100; // 2 ondalık
  }

  // Kişi başı taze hava gereksinimi: Q = kişi_sayısı × kişi_başı_m³h
  // kişi_başı_m³h: GIRDI (varsayılan değer verilmez; kullanıcı girer)
  // Nota: EN 16798-1 Kategori (I/II/III/IV) kişi başı debi tablosu TEYİT
  //       Tipik aralık: Kategori I (yüksek beklenti): 7 l/s ~ 25 m³/h per person
  //                     Kategori II (orta): 5 l/s ~ 18 m³/h per person
  //                     Kategori III (düşük): 3-4 l/s ~ 11-14 m³/h per person
  // Geçersiz girdi -> NaN dön (güvenli, patlamaz)
  function byOccupancy(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var n = _num(opts.kisi_sayisi);
    var q_per = _num(opts.kisi_basi_m3h);
    if (!isFinite(n) || n < 0 || !isFinite(q_per) || q_per < 0) return NaN;
    var result = n * q_per;
    return Math.round(result * 100) / 100; // 2 ondalık
  }

  // İki yöntemden (ACH ve kişi başı) sonuçları karşılaştır
  // Otomatik seçim YAPILMAZ — sadece bilgilendirme; kullanıcı/tasarımcı seçer
  function compare(opts) {
    if (!opts || typeof opts !== 'object') return NaN;
    var q_ach = _num(opts.Q_ach_m3h);
    var q_occ = _num(opts.Q_occupancy_m3h);
    if (!isFinite(q_ach) || !isFinite(q_occ)) return NaN;
    
    var buyuk_olan = q_ach > q_occ ? 'ach' : (q_occ > q_ach ? 'occupancy' : 'esit');
    
    return {
      Q_ach_m3h: q_ach,
      Q_occupancy_m3h: q_occ,
      buyuk_olan: buyuk_olan
    };
  }

  var api = {
    byACH: byACH,
    byOccupancy: byOccupancy,
    compare: compare
  };
  if (typeof window !== 'undefined') window.RoomVentilationRate = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
