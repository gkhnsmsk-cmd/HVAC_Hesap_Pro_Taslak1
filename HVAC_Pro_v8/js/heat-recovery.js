// HVAC Hesap Pro — Isı Geri Kazanım Verimi (heat-recovery.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Isı geri kazanim cihazlari icin sensible effectiveness ve enerji kazanim hesabi.
(function () {
  'use strict';

  // HAVA fiziği sabitleri (1.2 kg/m3 yogunluk, 1005 J/kgK ozgul isı)
  // Bu degerleri teyit: ISA standart sartlarda (1.225 kg/m3, 15°C) yakla.
  var DEFAULT_RHO = 1.2;        // kg/m3
  var DEFAULT_CP = 1005;        // J/kgK

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // sensibleEffectiveness: Isı geri kazanim cihazinin sensible effectiveness'i.
  // eff = (T_besleme_sonrasi - T_disaridan) / (T_egzozdan - T_disaridan)
  // T_disaridan_C: dışarıdan gelen havanın sıcaklığı (°C)
  // T_egzozdan_C: egzoz havasının sıcaklığı (°C)
  // T_besleme_sonrasi_C: ısı geri kazanımdan sonra beslemede sıcaklık (°C)
  // Sonuç: 0-1 arası, 3 ondalık
  // Payda sıfırsa (T_egzozdan==T_disaridan) -> NaN güvenli
  function sensibleEffectiveness(opts) {
    opts = opts || {};
    var T_in = _num(opts.T_disaridan_C);
    var T_ex = _num(opts.T_egzozdan_C);
    var T_out = _num(opts.T_besleme_sonrasi_C);

    if (!isFinite(T_in) || !isFinite(T_ex) || !isFinite(T_out)) return NaN;

    var denom = T_ex - T_in;
    // Payda sıfır -> NaN (hiç delta yok demek, effectiveness tanımsız)
    if (denom === 0) return NaN;

    var eff = (T_out - T_in) / denom;
    // 0-1 aralığında tutup 3 ondalık
    eff = Math.max(0, Math.min(1, eff));
    return Math.round(eff * 1000) / 1000;
  }

  // recoveredHeat: Geri kazanılan ısı gücü (kW).
  // kW = (Q_m3h/3600) * rho * cp * dT_C * eff / 1000
  // Q_m3h: debi (m3/h)
  // eff: effectiveness (0-1)
  // dT_C: sıcaklık farkı (°C)
  // rho: hava yoğunluğu (kg/m3), varsayılan 1.2 (HAVA FİZİĞİ SABİTİ, güvenli varsayılan)
  // cp: özgül ısı (J/kgK), varsayılan 1005 (HAVA FİZİĞİ SABİTİ, güvenli varsayılan)
  // Sonuç: kW (sonlu ve pozitif olması beklenir)
  function recoveredHeat(opts) {
    opts = opts || {};
    var Q_m3h = _num(opts.Q_m3h);
    var eff = _num(opts.eff);
    var dT = _num(opts.dT_C);
    var rho = (opts.rho !== undefined && opts.rho !== null) ? _num(opts.rho) : DEFAULT_RHO;
    var cp = (opts.cp !== undefined && opts.cp !== null) ? _num(opts.cp) : DEFAULT_CP;

    if (!isFinite(Q_m3h) || !isFinite(eff) || !isFinite(dT) || !isFinite(rho) || !isFinite(cp)) return NaN;
    // Hava debisini m3/s'ye dönüştür
    var Q_m3s = Q_m3h / 3600;
    // kW = kg/m3 * m3/s * J/kgK * K / 1000 = J/s / 1000 = kW
    var kW = Q_m3s * rho * cp * dT * eff / 1000;
    return kW;
  }

  var api = {
    DEFAULT_RHO: DEFAULT_RHO,
    DEFAULT_CP: DEFAULT_CP,
    sensibleEffectiveness: sensibleEffectiveness,
    recoveredHeat: recoveredHeat
  };
  if (typeof window !== 'undefined') window.HeatRecovery = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
