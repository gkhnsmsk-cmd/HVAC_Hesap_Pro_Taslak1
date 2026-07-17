// pump-npsh.js icin headless test (Modul-Test tarzi).
const P = require('../HVAC_Pro_v8/js/pump-npsh.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: NPSHa hesaplama
//    P_atm=101.325 kPa, h_s=2m, h_f=1m, P_vap=2.34 kPa, rho=1000, g=9.81
//    NPSHa = (101325-2340)/(1000*9.81) - 2 - 1 = 98985/9810 - 3 = 10.09 - 3 = 7.09 m
const r = P.npshAvailable({ P_atm_kPa: 101.325, h_s_m: 2, h_f_m: 1, P_vap_kPa: 2.34 });
chk('NPSHa = 7.09 (±0.3)', near(r.NPSHa_m, 7.09, 0.3));
chk('NPSHa sonlu', isFinite(r.NPSHa_m));

// 2) Marjin kontrolu: NPSHa=7.09, NPSHr=3, guvenlik=0.5 -> 7.09-3=4.09 >= 0.5 = TRUE
const m1 = P.marginCheck(7.09, 3, 0.5);
chk('marginCheck(7.09, 3, 0.5) == true', m1 === true);

// 3) Marjin kontrolu: NPSHa=3, NPSHr=3, guvenlik=0.5 -> 3-3=0 >= 0.5 = FALSE
const m2 = P.marginCheck(3, 3, 0.5);
chk('marginCheck(3, 3, 0.5) == false', m2 === false);

// 4) Default guvenlik payı (0.5m): NPSHa=4, NPSHr=3 -> 4-3=1 >= 0.5 = TRUE
const m3 = P.marginCheck(4, 3);
chk('marginCheck(4, 3) [default payı=0.5] == true', m3 === true);

// 5) Buyukluk mertebesi: yuksek buhar basinci -> daha dusuk NPSHa
const r2 = P.npshAvailable({ P_atm_kPa: 101.325, h_s_m: 2, h_f_m: 1, P_vap_kPa: 10 });
chk('yuksek P_vap -> daha dusuk NPSHa', r2.NPSHa_m < r.NPSHa_m);

// 6) Negatif h_s (emme pompa ustunde): heissta daha cok NPSH
const r3 = P.npshAvailable({ P_atm_kPa: 101.325, h_s_m: -2, h_f_m: 1, P_vap_kPa: 2.34 });
chk('negatif h_s (pompa yuksekte) -> daha yuksek NPSHa', r3.NPSHa_m > r.NPSHa_m);

// 7) Guvenli girdi: gecersiz P_atm -> NaN
const bad1 = P.npshAvailable({ P_atm_kPa: 'x', h_s_m: 2, h_f_m: 1, P_vap_kPa: 2.34 });
chk('P_atm gecersiz -> NPSHa NaN (guvenli)', Number.isNaN(bad1.NPSHa_m));

// 8) Guvenli girdi: negatif rho -> NaN
const bad2 = P.npshAvailable({ P_atm_kPa: 101.325, h_s_m: 2, h_f_m: 1, P_vap_kPa: 2.34, rho: -1 });
chk('negatif rho -> NaN (guvenli)', Number.isNaN(bad2.NPSHa_m));

// 9) Guvenli girdi: sifir g -> NaN
const bad3 = P.npshAvailable({ P_atm_kPa: 101.325, h_s_m: 2, h_f_m: 1, P_vap_kPa: 2.34, g: 0 });
chk('g=0 -> NaN (guvenli)', Number.isNaN(bad3.NPSHa_m));

// 10) Guvenli girdi: marginCheck ile NaN -> false
const bad4 = P.marginCheck(NaN, 3, 0.5);
chk('marginCheck(NaN, ...) -> false (guvenli)', bad4 === false);

// 11) Guvenli girdi: opt yok -> patlamaz
chk('npshAvailable() -> NaN (guvenli)', (() => { try { var z = P.npshAvailable(); return Number.isNaN(z.NPSHa_m); } catch (e) { return false; } })());
chk('marginCheck() -> false (guvenli)', (() => { try { return P.marginCheck() === false; } catch (e) { return false; } })());

R('\n' + (fail ? fail + ' KALDI' : 'pump-npsh.js testleri GECTI'));
process.exit(fail ? 1 : 0);
