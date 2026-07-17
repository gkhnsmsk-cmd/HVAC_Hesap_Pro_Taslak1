// Gsem Mep Pro — Pompa NPSH Analizi (pump-npsh.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// NPSH (Net Positive Suction Head) hesaplama ve marjin kontrolu.
// EN 16298, ISO 5198 basitlestirilmis NPSH hesaplama.
// MALZEME/EKIPMAN KUTUPHANESI YOKTUR — tum degerler KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kullanilabilir NPSH (Net Positive Suction Head Available).
  // Girdi: { P_atm_kPa, h_s_m, h_f_m, P_vap_kPa, rho, g }
  //   P_atm_kPa  : atmosferik basinc (kPa) — GIRDI
  //   h_s_m      : emme yuksekligi (m) — GIRDI (negative olabilir: pozisyon emme)
  //   h_f_m      : emme isleminde surtuenme kaybi (m su sutunu) — GIRDI
  //   P_vap_kPa  : cisatkin buhar basinci (kPa) — GIRDI
  //   rho        : sisinin yogunlugu (kg/m³) — OPSIYONEL (default 1000, su @ 15°C)
  //   g          : yercekim ivmesi (m/s²) — OPSIYONEL (default 9.81, fizik sabiti)
  // Cikti: { NPSHa_m }  (2 ondalik)
  //   NPSHa = (P_atm + 1000) / (rho*g) - h_s - h_f - (P_vap*1000) / (rho*g)
  //           = [(P_atm - P_vap)*1000] / (rho*g) - h_s - h_f
  // Guvenlı girdi: gecersiz/bolme -> NaN alanlarla doner (patlamaz).
  function npshAvailable(opt) {
    opt = opt || {};
    var P_atm = _num(opt.P_atm_kPa);
    var h_s = _num(opt.h_s_m);
    var h_f = _num(opt.h_f_m);
    var P_vap = _num(opt.P_vap_kPa);
    // Opsiyonel parametreler: undefined/null ise default, aksi halde validate
    var rho = (opt.rho !== undefined && opt.rho !== null) ? _num(opt.rho) : 1000;
    var g = (opt.g !== undefined && opt.g !== null) ? _num(opt.g) : 9.81;

    var out = { NPSHa_m: NaN };

    // Temel validasyon
    if (!isFinite(P_atm)) return out;
    if (!isFinite(h_s)) return out;
    if (!isFinite(h_f)) return out;
    if (!isFinite(P_vap)) return out;
    if (!isFinite(rho) || rho <= 0) return out;
    if (!isFinite(g) || g <= 0) return out;

    // NPSH formulae: rho*g = conversion factor Pa -> m su sutunu
    var rhoG = rho * g;  // Pa/m
    var NPSHa = (P_atm * 1000 - P_vap * 1000) / rhoG - h_s - h_f;

    out.NPSHa_m = Math.round(NPSHa * 100) / 100;  // 2 ondalik
    return out;
  }

  // Marjin kontrolu: Kullanilabilir NPSH yeterli mi?
  // Girdi: { NPSHa_m, NPSHr_m, guvenlik_payi_m }
  //   NPSHa_m       : Kullanilabilir NPSH (m) — GIRDI
  //   NPSHr_m       : Pompa gerektigi minimum NPSH (m) — GIRDI (imalatci datasi)
  //   guvenlik_payi_m : Emniyet payı (m) — OPSIYONEL (default 0.5, tipik mühendislik pratiği)
  // Cikti: true/false
  //   true ise  : NPSHa - NPSHr >= guvenlik_payi (GÜVENLİ)
  //   false ise : yetersiz NPSH veya marjin yok (RİSK)
  function marginCheck(npsha_m, npshr_m, guvenlik_payi_m) {
    var a = _num(npsha_m);
    var r = _num(npshr_m);
    // Opsiyonel payı: undefined/null ise default 0.5, aksi halde validate
    var p = (guvenlik_payi_m !== undefined && guvenlik_payi_m !== null) ? _num(guvenlik_payi_m) : 0.5;

    // NaN birisi -> guvenli false (basarısızlık modu)
    if (!isFinite(a) || !isFinite(r) || !isFinite(p)) return false;

    // Marjin kontrolu
    return (a - r) >= p;
  }

  var api = {
    npshAvailable: npshAvailable,
    marginCheck: marginCheck
  };
  if (typeof window !== 'undefined') window.PumpNPSH = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
