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

  // ─────────────────────────────────────────────────────────────────
  // TAM ASCE 7-22 / TBDY 2018 Bileşen Sismik Kuvveti (Eq. 13.3-1)
  //
  //   Fp = [0.4 * ap * Sds * Ip * Wp / Rp] * (1 + 2*z/h)
  //   Sınırlar:  Fp_min = 0.3 * Sds * Ip * Wp
  //              Fp_max = 1.6 * Sds * Ip * Wp
  //
  // seismicLoad() (yukarıdaki) formülün ap/Rp/yükseklik terimlerini
  // İHMAL EDEN basitleştirilmiş halidir — sonucu gerçek değerden 2-3 kat
  // SAPTIRABİLİR (özellikle esnek/asma sistemlerde ap=2.5, Rp düşükse).
  // Bu fonksiyon TAM formülü uygular, geriye dönük uyumluluk için eski
  // fonksiyon SİLİNMEDİ ama ARTIK UI'DA KULLANILMIYOR (bkz ek-hesaplar-config.js).
  //
  // Girdi (TÜMÜ ZORUNLU, hiçbiri hardcode edilmez — standart-bağımlı):
  //   W_kg : Bileşen/ekipman ağırlığı (kg) — proje verisi.
  //   Sds  : Tasarım spektral ivme katsayısı — ASCE7 Ch.11 / TBDY2018
  //          deprem haritası + zemin sınıfından, TEYİT gerekir.
  //   Ip   : Bileşen önem katsayısı (tipik 1.0 veya 1.5) — ASCE7 §13.1.3
  //          / TBDY2018, bina/ekipman önem sınıfına göre, TEYİT gerekir.
  //   ap   : Bileşen amplifikasyon katsayısı (tipik 1.0–2.5) — ASCE7
  //          Tablo 13.5-1 (mekanik/elektrik) veya 13.6-1, bileşenin
  //          esnekliğine göre, TEYİT gerekir. Sabit/varsayılan VERİLMEZ.
  //   Rp   : Bileşen davranış (response modification) katsayısı
  //          (tipik 1.0–12) — aynı tablolardan, ankraj tipine göre,
  //          TEYİT gerekir.
  //   z_m  : Bileşenin bağlantı noktasının bina tabanından yüksekliği (m).
  //   h_m  : Binanın tabandan ortalama çatı yüksekliği (m).
  //
  // z_m/h_m oranı ASCE7 gereği [0,1] aralığına sınırlanır (kod dışı
  // geometri girilirse — z_m>h_m — otomatik 1.0'a kırpılır, NaN DÖNMEZ,
  // ama bu durum girilen yüksekliklerin gözden geçirilmesi gerektiğine
  // işarettir).
  //
  // Geçersiz/eksik/negatif/NaN girdi -> güvenli NaN döner.
  function seismicLoadASCE7(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var wp = _num(opt.W_kg);
    var sds = _num(opt.Sds);
    var ip = _num(opt.Ip);
    var ap = _num(opt.ap);
    var rp = _num(opt.Rp);
    var z = _num(opt.z_m);
    var h = _num(opt.h_m);

    if (!isFinite(wp) || wp < 0) return NaN;
    if (!isFinite(sds) || sds < 0) return NaN;
    if (!isFinite(ip) || ip <= 0) return NaN;
    if (!isFinite(ap) || ap <= 0) return NaN;
    if (!isFinite(rp) || rp <= 0) return NaN;
    if (!isFinite(z) || z < 0) return NaN;
    if (!isFinite(h) || h <= 0) return NaN;

    var ratio = z / h;
    if (ratio > 1) ratio = 1; // ASCE7: z/h sınırı 1.0
    if (ratio < 0) ratio = 0;

    var fp = (0.4 * ap * sds * ip * wp / rp) * (1 + 2 * ratio);
    var fpMin = 0.3 * sds * ip * wp;
    var fpMax = 1.6 * sds * ip * wp;
    if (fp < fpMin) fp = fpMin;
    if (fp > fpMax) fp = fpMax;

    return Math.round(fp * 100) / 100;
  }

  var api = {
    seismicLoad: seismicLoad,           // ESKİ, basitleştirilmiş — sadece geriye dönük uyumluluk
    seismicLoadASCE7: seismicLoadASCE7  // YENİ, tam ASCE7-22/TBDY2018 formülü — UI bunu kullanır
  };
  if (typeof window !== 'undefined') window.SeismicHanger = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
