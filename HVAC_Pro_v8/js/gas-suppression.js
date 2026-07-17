// Gazli Sondürme Ajan Miktarı (gas-suppression.js) — NFPA 2001
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Yangın söndürme sistemi ajan kütlesi, silindir tahmini.
(function () {
  'use strict';

  // Yardımcı: Number dönüştürme ve finite kontrol
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // NFPA 2001 tipi ajan kütlesi hesabı:
  // W_kg = (V_m3 / ozgul_hacim_m3_kg) * (tasarim_konsantrasyon_yuzde / (100 - tasarim_konsantrasyon_yuzde))
  // V_m3: Koruma alanının hacmi (m3) — KULLANICI GIRDISI.
  // tasarim_konsantrasyon_yuzde: Tasarım konsantrasyonu (%) — KULLANICI GIRDISI (TEYIT).
  //   Ajan tipine (FM200/Novec1230/CO2) ve sıcaklığa göre değişir.
  //   Sabit değer VERILMEZ, ajan üreticisi tablosu / NFPA 2001 referansı TEYIT.
  // ozgul_hacim_m3_kg: Ajanın özgül hacmi (m3/kg) — KULLANICI GIRDISI (TEYIT).
  //   Sıcaklık/basınçtan bağımsız olarak ajan veri sayfasından alınır.
  // Geçersiz girdi (konsantrasyon >= 100 veya negatif) -> güvenli NaN döndürür.
  function agentMass(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var v = _num(opt.V_m3);
    var conc = _num(opt.tasarim_konsantrasyon_yuzde);
    var shv = _num(opt.ozgul_hacim_m3_kg);

    // Girdi doğrulaması
    if (!isFinite(v) || v < 0) return NaN;
    if (!isFinite(conc) || conc < 0 || conc >= 100) return NaN;
    if (!isFinite(shv) || shv <= 0) return NaN;

    // NFPA 2001 formülü
    var w = (v / shv) * (conc / (100 - conc));
    return Math.round(w * 100) / 100; // 2 ondalık (kg)
  }

  // Silindir sayısı tahmini (sadece bölme işlemi, tasarım kararı içermez):
  // Silindirler çift gaz basıncı ile çalışır ve depolama kapasitesi limitlidir.
  // Bu fonksiyon sadece kaç silindir gerekebileceğini matematiksel olarak hesaplar;
  // fiili yerleştirme, çalışma basıncı kontrolü vb. CAD aşamasında yapılır.
  // W_kg: Gerekli toplam ajan kütlesi (kg).
  // tup_kapasite_kg: Tek silindirin ajan kapasitesi (kg) — KULLANICI GIRDISI.
  // Çıktı: Gerekli silindir sayısı (en az 1).
  function cylinderCountEstimate(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var w = _num(opt.W_kg);
    var cap = _num(opt.tup_kapasite_kg);

    if (!isFinite(w) || w < 0) return NaN;
    if (!isFinite(cap) || cap <= 0) return NaN;

    var count = Math.ceil(w / cap);
    return count;
  }

  var api = {
    agentMass: agentMass,
    cylinderCountEstimate: cylinderCountEstimate
  };
  if (typeof window !== 'undefined') window.GasSuppression = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
