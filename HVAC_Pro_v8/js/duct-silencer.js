// HVAC Hesap Pro — Kanal Silenceri Azaltma Hesabı (duct-silencer.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Ses gücü seviyesinden gerekli ses azaltmasını hesaplar.
(function () {
  'use strict';

  // Sayı doğrulama helper: isFinite kontrol
  // Geçersiz/NaN girdiler -> NaN döndür (güvenli, patlamadan)
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // attenuationRequired: Kanal silenceri için gerekli ses azaltmasını (dB cinsinden) hesapla.
  // NOT: Bu fonksiyon SADECE azaltma farkını hesaplar; silencer SEÇİMİ YAPMAZ.
  // Akustik danışman veya ölçüm sonuçlarıyla oda azaltmasının TEYİT edilmesi gerekir.
  //
  // opts.SWL_kaynak_dB: Kaynak ses gücü seviyesi (dB)
  //                     GIRDI ZORUNLU, kaynak cihazdan veya ölçümden alınır
  // opts.hedef_NC_dB: Hedef oda gürültü sınıfı / gürültü kriteri (dB)
  //                   GIRDI ZORUNLU, oda tasarım kriteridir
  // opts.oda_azaltma_dB: Oda geometrisi ve malzeme tarafından sağlanan doğal azaltma (dB)
  //                      GIRDI ZORUNLU, akustik ölçüm veya hesap sonucu, sabit değer VERME
  //
  // Sonuç: gerekli_azaltma_dB = SWL_kaynak_dB - hedef_NC_dB - oda_azaltma_dB
  //        Negatif sonuç: susturucu gerekmiyor (oda doğal olarak hedefi karşılıyor)
  //        Bu durum normal ve beklenen bir sonuçtur — kırpma yapılmaz.
  // Geçersiz/NaN girdilerde: NaN döndür (panik-patlamadan).
  function attenuationRequired(opts) {
    opts = opts || {};
    var SWL = _num(opts.SWL_kaynak_dB);
    var NC = _num(opts.hedef_NC_dB);
    var oda_az = _num(opts.oda_azaltma_dB);

    if (!isFinite(SWL) || !isFinite(NC) || !isFinite(oda_az)) return NaN;

    // Gerekli azaltma = kaynak gücü - hedef - oda katkısı
    var gerekli = SWL - NC - oda_az;
    return Math.round(gerekli * 10) / 10; // 1 ondalık (dB)
  }

  var api = {
    attenuationRequired: attenuationRequired
  };
  if (typeof window !== 'undefined') window.DuctSilencer = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
