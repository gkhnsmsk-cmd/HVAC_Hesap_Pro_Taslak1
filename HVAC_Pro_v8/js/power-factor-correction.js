// Power Factor Correction — Düzeltme Kapasitesi Hesabı (power-factor-correction.js)
// SAF (DOM'suz) IIFE modül; headless test edilebilir.
// Referans: IEC 60831, IEEE 18, elektrik mühendisliği standartları.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kapasitör gücü hesabı (reaktif enerji).
  // Girdi: { P_kW, cosPhi1, cosPhi2 }
  //   P_kW     : Gerçek güç (kW) — KULLANICI GIRDISI
  //   cosPhi1  : Başlangıç güç faktörü (0 < cosPhi1 <= 1) — KULLANICI GIRDISI
  //   cosPhi2  : Hedef güç faktörü (0 < cosPhi2 <= 1) — KULLANICI GIRDISI
  // Çıktı: Qc_kVAR (kVAR cinsinden reaktif enerji)
  //   Qc_kVAR = P_kW * (tan(acos(cosPhi1)) - tan(acos(cosPhi2)))
  // Güvenli girdi: Geçersiz cosPhi -> NaN.
  function capacitorPower(opt) {
    opt = opt || {};
    var P = _num(opt.P_kW);
    var cosPhi1 = _num(opt.cosPhi1);
    var cosPhi2 = _num(opt.cosPhi2);

    // P, cosPhi1, cosPhi2 ZORUNLU.
    if (!isFinite(P)) return NaN;
    if (!isFinite(cosPhi1)) return NaN;
    if (!isFinite(cosPhi2)) return NaN;

    // cosPhi geçerlilik kontrol: (0, 1]
    if (cosPhi1 <= 0 || cosPhi1 > 1) return NaN;
    if (cosPhi2 <= 0 || cosPhi2 > 1) return NaN;

    // P negatif kontrol.
    if (P < 0) return NaN;

    // Düzeltme hesabı.
    var tanPhi1 = Math.tan(Math.acos(cosPhi1));
    var tanPhi2 = Math.tan(Math.acos(cosPhi2));
    var Qc_kVAR = P * (tanPhi1 - tanPhi2);

    return Qc_kVAR;
  }

  // Yeni görünür güç hesabı (düzeltme sonrası).
  // Girdi: { P_kW, cosPhi2 }
  //   P_kW     : Gerçek güç (kW) — KULLANICI GIRDISI
  //   cosPhi2  : Hedef güç faktörü (0 < cosPhi2 <= 1) — KULLANICI GIRDISI
  // Çıktı: S_kVA (kVA cinsinden görünür güç)
  //   S_kVA = P_kW / cosPhi2
  // Güvenli girdi: Geçersiz cosPhi2 -> NaN.
  function newApparentPower(opt) {
    opt = opt || {};
    var P = _num(opt.P_kW);
    var cosPhi2 = _num(opt.cosPhi2);

    // P, cosPhi2 ZORUNLU.
    if (!isFinite(P)) return NaN;
    if (!isFinite(cosPhi2)) return NaN;

    // cosPhi geçerlilik kontrol: (0, 1]
    if (cosPhi2 <= 0 || cosPhi2 > 1) return NaN;

    // P negatif kontrol.
    if (P < 0) return NaN;

    var S_kVA = P / cosPhi2;

    return S_kVA;
  }

  var api = {
    capacitorPower: capacitorPower,
    newApparentPower: newApparentPower
  };
  if (typeof window !== 'undefined') window.PowerFactorCorrection = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
