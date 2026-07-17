// Gsem Mep Pro — Asansör Motor Soğutması
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Asansör makine odasında motor soğutması için gerekli hava debisi.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Asansör Motor Soğutması: calc
  // Girdi: { motor_kW, verim_yuzde, hedef_temp_artisi_K }
  //   motor_kW              : Motor gücü (kW) — GIRDI ZORUNLU
  //   verim_yuzde           : Motor verimi (%) — GIRDI ZORUNLU
  //   hedef_temp_artisi_K   : Hedef sıcaklık artışı (K) — GIRDI ZORUNLU
  //
  // Formül (Isı dengesi):
  //   Atilan_isi_kW = motor_kW * (1 - verim_yuzde/100)  [kW]
  //   Q = ρ * V * Cp * ΔT  [termike transfer formülü]
  //   V_m3h = (Atilan_isi_kW * 1000 * 3600) / (1.2 * 1005 * hedef_temp_artisi_K)  [m³/h]
  //   Burada: ρ=1.2 kg/m³, Cp=1005 J/(kg·K) — hava özellikleri (sabit, güvenli)
  //
  // Cikti: { debi_m3h }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif/sifir bolme -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var motor_kW = _num(opt.motor_kW);
    var verim_yuzde = _num(opt.verim_yuzde);
    var hedef_temp_artisi_K = _num(opt.hedef_temp_artisi_K);

    var out = { debi_m3h: NaN };

    // Validasyon: tüm girdiler sonlu, motor_kW ve verim pozitif, temp > 0
    if (!isFinite(motor_kW) || !isFinite(verim_yuzde) || !isFinite(hedef_temp_artisi_K)) return out;
    if (motor_kW < 0 || verim_yuzde < 0 || hedef_temp_artisi_K <= 0) return out;
    if (verim_yuzde > 100) return out;  // Verim %100'den fazla olamaz

    // Atılan ısı
    var Atilan_isi_kW = motor_kW * (1 - verim_yuzde / 100);

    // Hava yoğunluğu ve spesifik ısı (sabit, hava özellikleri)
    // ρ = 1.2 kg/m³, Cp = 1005 J/(kg·K)
    var rho = 1.2;
    var Cp = 1005;

    // Hacimsel debi: Q [W] = ρ * V [m³/s] * Cp * ΔT
    // V [m³/h] = (Q * 1000 [W/kW] * 3600 [s/h]) / (ρ * Cp * ΔT)
    var debi_m3h = (Atilan_isi_kW * 1000 * 3600) / (rho * Cp * hedef_temp_artisi_K);

    out.debi_m3h = Math.round(debi_m3h * 100) / 100;
    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.ElevatorMotorCooling = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
