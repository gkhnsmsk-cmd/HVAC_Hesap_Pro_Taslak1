// HVAC Hesap Pro — Yoğunlaşma Riski Kontrolü (Glaser Yöntemi Basitleştirilmiş)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Katmanlar içinden dışına doğru, her sınırda sıcaklık ve buhar basıncı profili hesaplama.

(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Doyma buvar basıncı Magnus formülü (Pa), Sonntag versiyonu
  // Psat_Pa = 611 * exp(17.27 * T_C / (T_C + 237.3))
  function _psat(T_C) {
    return 611 * Math.exp(17.27 * T_C / (T_C + 237.3));
  }

  // vaporPressureProfile: Katmanlar içinde yoğunlaşma riski profili
  // opts.katmanlar: [{d_m, sd_m}, ...] dizisi (d_m: kalınlık m, sd_m: eşdeğer hava difüzyon kalınlığı)
  // opts.Ti_C: İç ortam sıcaklığı (°C)
  // opts.Tdis_C: Dış ortam sıcaklığı (°C)
  // opts.RHi: İç ortam bağıl nem (%, 0-100)
  // opts.RHdis: Dış ortam bağıl nem (%, 0-100)
  // Dönüş: Katman sınırlarında profil [] — her eleman:
  //   {
  //     konum_sd: o noktaya kadarki kümülatif sd (m)
  //     T_C: sıcaklık (°C)
  //     P_buhar_Pa: buvar kısmi basıncı (Pa)
  //     P_sat_Pa: doyma buvar basıncı (Pa)
  //     risk: P_buhar > P_sat (boolean yoğunlaşma riski)
  //   }
  // BASİTLEŞTİRİLMİŞ versiyon: sıcaklık profili sd-orantılı doğrusal, buvar basıncı da sd-orantılı doğrusal
  // (Gerçek Glaser'da sıcaklık profili R-ağırlıklıdır; detaylı hesap için tam yöntem TEYİT edilmeli)
  function vaporPressureProfile(opts) {
    opts = opts || {};
    var katmanlar = opts.katmanlar || [];
    var Ti_C = _num(opts.Ti_C);
    var Tdis_C = _num(opts.Tdis_C);
    var RHi = _num(opts.RHi);
    var RHdis = _num(opts.RHdis);

    // Geçersiz girdiler -> güvenli boş dizi
    if (!Array.isArray(katmanlar) || katmanlar.length === 0) return [];
    if (!isFinite(Ti_C) || !isFinite(Tdis_C) || !isFinite(RHi) || !isFinite(RHdis)) return [];

    // İç ve dış buvar kısmi basınçları (Pa)
    var P_sat_i = _psat(Ti_C);      // İç doyma basıncı
    var P_sat_dis = _psat(Tdis_C);  // Dış doyma basıncı
    var P_i = (RHi / 100) * P_sat_i;       // İç buvar kısmi basıncı
    var P_dis = (RHdis / 100) * P_sat_dis; // Dış buvar kısmi basıncı

    // Katmanların sd toplamı
    var sd_total = 0;
    for (var i = 0; i < katmanlar.length; i++) {
      var sd_m = _num(katmanlar[i].sd_m);
      if (!isFinite(sd_m)) return []; // Geçersiz sd -> güvenli boş dizi
      sd_total += sd_m;
    }
    if (sd_total <= 0) return []; // sd_total sıfır/negatif -> güvenli boş dizi

    // Profil noktaları (katman sayısı + 1)
    var profil = [];

    // Her sınırda interpolasyon yap (i=0: en içten, i=katmanlar.length: en dışta)
    var kumulatif_sd = 0;
    for (var i = 0; i <= katmanlar.length; i++) {
      if (i > 0) {
        kumulatif_sd += _num(katmanlar[i - 1].sd_m);
      }

      // Sıcaklık: sd oranına göre doğrusal interpolasyon
      // T(konum) = Ti_C + (Tdis_C - Ti_C) * (kumulatif_sd / sd_total)
      var oran_sd = (sd_total > 0) ? (kumulatif_sd / sd_total) : 0;
      var T_C = Ti_C + (Tdis_C - Ti_C) * oran_sd;

      // Buvar basıncı: sd oranına göre doğrusal interpolasyon
      // P_buhar(konum) = P_i + (P_dis - P_i) * (kumulatif_sd / sd_total)
      var P_buhar = P_i + (P_dis - P_i) * oran_sd;

      // O noktadaki doyma basıncı
      var P_sat = _psat(T_C);

      // Yoğunlaşma riski: P_buhar > P_sat
      var risk = (P_buhar > P_sat);

      profil.push({
        konum_sd: kumulatif_sd,
        T_C: T_C,
        P_buhar_Pa: P_buhar,
        P_sat_Pa: P_sat,
        risk: risk
      });
    }

    return profil;
  }

  var api = {
    vaporPressureProfile: vaporPressureProfile
  };
  if (typeof window !== 'undefined') window.CondensationCheck = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
