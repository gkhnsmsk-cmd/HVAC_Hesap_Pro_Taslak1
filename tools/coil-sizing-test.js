// coil-sizing.js icin headless test.
const CS = require('../HVAC_Pro_v8/js/coil-sizing.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Hava: debi_m3h=2000, T_giris_C=16, T_cikis_C=45
//    Q_kW = (2000/3600) * 1.2 * 1.005 * (45-16)
//         = (2000/3600) * 1.2 * 1.005 * 29
//         = 0.555556 * 1.2 * 1.005 * 29
//         ≈ 19.44 kW
const r1 = CS.calc({ tip: 'hava', debi_m3h: 2000, T_giris_C: 16, T_cikis_C: 45 });
chk('calc hava: 2000 m³/h, ΔT=29K → 19.44 kW (±0.5)', near(r1.Q_kW, 19.44, 0.5));
chk('calc hava: sonlu Q_kW donder', isFinite(r1.Q_kW));

// 2) Su: debi_lps=2, T_giris_C=45, T_cikis_C=35
//    Q_kW = 2 * 4.186 * (45-35)
//         = 2 * 4.186 * 10
//         = 83.72 kW
const r2 = CS.calc({ tip: 'su', debi_lps: 2, T_giris_C: 45, T_cikis_C: 35 });
chk('calc su: 2 L/s, ΔT=10K → 83.72 kW (±0.5)', near(r2.Q_kW, 83.72, 0.5));
chk('calc su: sonlu Q_kW donder', isFinite(r2.Q_kW));

// 3) Guvenli girdi: bilinmeyen tip -> NaN
const bad1 = CS.calc({ tip: 'unknown', debi_m3h: 2000, T_giris_C: 16, T_cikis_C: 45 });
chk('calc: bilinmeyen tip -> NaN (guvenli)', Number.isNaN(bad1.Q_kW));

// 4) Guvenli girdi: hava tipi ama debi_m3h eksik -> NaN
const bad2 = CS.calc({ tip: 'hava', T_giris_C: 16, T_cikis_C: 45 });
chk('calc hava: debi_m3h eksik -> NaN (guvenli)', Number.isNaN(bad2.Q_kW));

// 5) Guvenli girdi: su tipi ama debi_lps eksik -> NaN
const bad3 = CS.calc({ tip: 'su', T_giris_C: 45, T_cikis_C: 35 });
chk('calc su: debi_lps eksik -> NaN (guvenli)', Number.isNaN(bad3.Q_kW));

// 6) Guvenli girdi: sicaklik eksik -> NaN
const bad4 = CS.calc({ tip: 'hava', debi_m3h: 2000, T_giris_C: 16 });
chk('calc: T_cikis_C eksik -> NaN (guvenli)', Number.isNaN(bad4.Q_kW));

// 7) Guvenli girdi: opt yok -> NaN (patlamaz)
const bad5 = CS.calc();
chk('calc() -> NaN (guvenli)', Number.isNaN(bad5.Q_kW));

// 8) Guvenli girdi: gecersiz debi -> NaN
const bad6 = CS.calc({ tip: 'hava', debi_m3h: 'x', T_giris_C: 16, T_cikis_C: 45 });
chk('calc: debi_m3h gecersiz -> NaN (guvenli)', Number.isNaN(bad6.Q_kW));

// 9) Guvenli girdi: gecersiz sicaklik -> NaN
const bad7 = CS.calc({ tip: 'hava', debi_m3h: 2000, T_giris_C: 'x', T_cikis_C: 45 });
chk('calc: T_giris_C gecersiz -> NaN (guvenli)', Number.isNaN(bad7.Q_kW));

// 10) Hava: ters sicaklik farkı da calisir (abs kullandik)
const r3 = CS.calc({ tip: 'hava', debi_m3h: 2000, T_giris_C: 45, T_cikis_C: 16 });
chk('calc hava: ters sicaklik → aynı Q_kW', near(r3.Q_kW, r1.Q_kW, 0.1));

R('\n' + (fail ? fail + ' KALDI' : 'coil-sizing.js testleri GECTI'));
process.exit(fail ? 1 : 0);
