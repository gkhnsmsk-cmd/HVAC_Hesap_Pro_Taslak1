// HVAC Hesap Pro — Log Mean Temperature Difference (lmtd.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Isı eşanjörlerinde LMTD ve gerekli alan hesabı.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // lmtd: Log Mean Temperature Difference hesabı.
  // dT1_C: sıcak ve soğuk akışkan arasındaki sıcaklık farkı bir uçta (°C)
  // dT2_C: sıcak ve soğuk akışkan arasındaki sıcaklık farkı diğer uçta (°C)
  // 
  // Formül:
  // - Eğer dT1_C == dT2_C: LMTD = dT1_C (limit durumu)
  // - Eğer dT1_C != dT2_C: LMTD_C = (dT1_C - dT2_C) / ln(dT1_C / dT2_C)
  //
  // Her iki dT değeri pozitif olmalıdır (mutlak değerler).
  // Geçersiz/negatif/sıfır girdiler NaN döner (güvenli).
  // Sonuç: °C cinsinden, sonlu pozitif sayı veya NaN
  function lmtd(opts) {
    opts = opts || {};
    var dT1 = _num(opts.dT1_C);
    var dT2 = _num(opts.dT2_C);

    if (!isFinite(dT1) || !isFinite(dT2)) return NaN;
    if (dT1 <= 0 || dT2 <= 0) return NaN;

    // Limit durumu: dT1 == dT2
    if (dT1 === dT2) {
      return dT1;
    }

    // Genel formül: LMTD = ΔT1 - ΔT2 / ln(ΔT1/ΔT2)
    var dT_ratio = dT1 / dT2;
    var ln_ratio = Math.log(dT_ratio);
    if (ln_ratio === 0) return NaN; // Payda sıfır (matematiksel güvenlik)
    
    var lmtd_C = (dT1 - dT2) / ln_ratio;
    return lmtd_C;
  }

  // requiredArea: Isı eşanjörü için gerekli yüzey alanı hesabı.
  // Q_W: eşanjörde transfer edilen ısı gücü (Watt)
  // U_W_m2K: eşanjörün genel ısı transfer katsayısı (W/m²K)
  //          Esanjör teknik veri sayfasından TEYIT edilmesi ZORUNLU.
  //          Tür (plaka, boru-kanatçık, spiral vb.) ve akışkanlar tarafından değişir.
  // LMTD_C: Log Mean Temperature Difference (°C), lmtd() fonksiyonundan
  //
  // Formül: A_m2 = Q_W / (U_W_m2K * LMTD_C)
  //
  // Sonuç: m² cinsinden gerekli alan, sonlu pozitif sayı veya NaN
  function requiredArea(opts) {
    opts = opts || {};
    var Q = _num(opts.Q_W);
    var U = _num(opts.U_W_m2K);
    var LMTD = _num(opts.LMTD_C);

    if (!isFinite(Q) || !isFinite(U) || !isFinite(LMTD)) return NaN;
    if (U <= 0 || LMTD <= 0) return NaN;

    var area_m2 = Q / (U * LMTD);
    return area_m2;
  }

  var api = {
    lmtd: lmtd,
    requiredArea: requiredArea
  };
  if (typeof window !== 'undefined') window.LMTD = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
