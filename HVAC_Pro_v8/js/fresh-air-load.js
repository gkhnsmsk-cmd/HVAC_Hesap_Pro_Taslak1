// Gsem Mep Pro — Taze Hava Yukleri (fresh-air-load.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Taze hava entalpisi ve nem yuklerinin hesaplanmasi.
// Standart: ASHRAE Handbook — Fundamentals (hava ozellikleri)
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Taze Hava Yuklerinin Hesaplanmasi: calc
  // Girdi: { debi_m3h, T_dis_C, T_ic_C, x_dis_g_kg, x_ic_g_kg }
  //   debi_m3h    : Taze hava debisi (m³/h) — GIRDI ZORUNLU
  //   T_dis_C     : HaricI hava sicakligi (°C) — GIRDI ZORUNLU
  //   T_ic_C      : Ic hava sicakligi (°C) — GIRDI ZORUNLU
  //   x_dis_g_kg  : HaricI hava mutlak nemi (g su/kg kuru hava) — OPSİYONEL
  //   x_ic_g_kg   : Ic hava mutlak nemi (g su/kg kuru hava) — OPSİYONEL
  // Cikti: { Q_duyulur_kW, Q_gizli_kW, Q_toplam_kW }  (3 ondalik)
  //   Q_duyulur_kW = (debi/3600) * rho * cp * (T_dis - T_ic)
  //   Q_gizli_kW = (debi/3600) * rho * Hfg * (x_dis - x_ic) / 1000
  //                (x degerleri verilmemisse Q_gizli = 0)
  //   Q_toplam_kW = Q_duyulur_kW + Q_gizli_kW
  // Fizik sabitleri (hardcoded):
  //   rho_hava = 1.2 kg/m³
  //   cp_hava = 1.005 kJ/kgK
  //   Hfg_buharlasma = 2500 kJ/kg
  // Guvenli girdi: gecersiz/NaN -> NaN alanlarla doner (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var debi_m3h = _num(opt.debi_m3h);
    var T_dis_C = _num(opt.T_dis_C);
    var T_ic_C = _num(opt.T_ic_C);
    var x_dis_g_kg = _num(opt.x_dis_g_kg);
    var x_ic_g_kg = _num(opt.x_ic_g_kg);

    var out = { Q_duyulur_kW: NaN, Q_gizli_kW: NaN, Q_toplam_kW: NaN };

    // Temel validasyon: zorunlu alanlar sonlu olmali
    if (!isFinite(debi_m3h) || !isFinite(T_dis_C) || !isFinite(T_ic_C)) return out;

    // Sabitler
    var rho_hava = 1.2;        // kg/m³
    var cp_hava = 1.005;       // kJ/kgK
    var Hfg = 2500;            // kJ/kg (buharlasma isisi)

    // Debi kg/s olarak donustur
    var debi_kg_s = (debi_m3h / 3600) * rho_hava;

    // Duyulur ısı: Q_duyulur = debi * cp * (T_dis - T_ic)
    var Q_duyulur_kW = debi_kg_s * cp_hava * (T_dis_C - T_ic_C);

    // Gizli ısı: nem degerleri verilmisse hesapla, yoksa 0
    var Q_gizli_kW = 0;
    if (isFinite(x_dis_g_kg) && isFinite(x_ic_g_kg)) {
      // Q_gizli = debi * Hfg * (x_dis - x_ic) / 1000
      // x degeri g/kg cinsinden, Hfg kJ/kg cinsinden, sonuc kW cinsinden
      Q_gizli_kW = debi_kg_s * Hfg * (x_dis_g_kg - x_ic_g_kg) / 1000;
    }

    // Toplam ısı
    var Q_toplam_kW = Q_duyulur_kW + Q_gizli_kW;

    // Sabit 3 ondalik basamaga yuvarla
    out.Q_duyulur_kW = Math.round(Q_duyulur_kW * 1000) / 1000;
    out.Q_gizli_kW = Math.round(Q_gizli_kW * 1000) / 1000;
    out.Q_toplam_kW = Math.round(Q_toplam_kW * 1000) / 1000;

    return out;
  }

  var api = {
    calc: calc
  };
  if (typeof window !== 'undefined') window.FreshAirLoad = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
