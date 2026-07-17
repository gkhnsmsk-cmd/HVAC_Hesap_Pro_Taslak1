// affinity-laws.js icin headless test (Modul-Test tarzi).
const AL = require('../HVAC_Pro_v8/js/affinity-laws.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) scaleBySpeed: Bilinen vaka
//    Q1=100 m³/h, H1=20 m, P1=5 kW, N1=1000 RPM, N2=1500 RPM
//    ratio = 1500/1000 = 1.5
//    Q2 = 100 * 1.5 = 150 m³/h
//    H2 = 20 * 1.5^2 = 20 * 2.25 = 45 m
//    P2 = 5 * 1.5^3 = 5 * 3.375 = 16.875 kW
const r1 = AL.scaleBySpeed({ Q1: 100, H1: 20, P1: 5, N1: 1000, N2: 1500 });
chk('scaleBySpeed Q2 = 150 (±0.1)', near(r1.Q2, 150, 0.1));
chk('scaleBySpeed H2 = 45 (±0.1)', near(r1.H2, 45, 0.1));
chk('scaleBySpeed P2 = 16.875 (±0.1)', near(r1.P2, 16.875, 0.1));
chk('scaleBySpeed sonlu degerleri donder', isFinite(r1.Q2) && isFinite(r1.H2) && isFinite(r1.P2));

// 2) scaleByDiameter: Bilinen vaka
//    Q1=100 m³/h, H1=20 m, P1=5 kW, D1=200 mm, D2=250 mm
//    ratio = 250/200 = 1.25
//    Q2 = 100 * 1.25 = 125 m³/h
//    H2 = 20 * 1.25^2 = 20 * 1.5625 = 31.25 m
//    P2 = 5 * 1.25^3 = 5 * 1.953125 = 9.765625 kW
const r2 = AL.scaleByDiameter({ Q1: 100, H1: 20, P1: 5, D1: 200, D2: 250 });
chk('scaleByDiameter Q2 = 125 (±0.1)', near(r2.Q2, 125, 0.1));
chk('scaleByDiameter H2 = 31.25 (±0.1)', near(r2.H2, 31.25, 0.1));
chk('scaleByDiameter P2 ≈ 9.77 (±0.1)', near(r2.P2, 9.765625, 0.1));
chk('scaleByDiameter sonlu degerleri donder', isFinite(r2.Q2) && isFinite(r2.H2) && isFinite(r2.P2));

// 3) scaleBySpeed: Daha yuksek devir -> daha yuksek kapasite ve basinc
const r3a = AL.scaleBySpeed({ Q1: 100, H1: 20, P1: 5, N1: 1000, N2: 800 });
const r3b = AL.scaleBySpeed({ Q1: 100, H1: 20, P1: 5, N1: 1000, N2: 1200 });
chk('scaleBySpeed: dusuk devir -> dusuk kapasite', r3a.Q2 < 100 && r3b.Q2 > 100);

// 4) Guvenli girdi: gecersiz Q1 -> NaN
const bad1 = AL.scaleBySpeed({ Q1: 'x', H1: 20, P1: 5, N1: 1000, N2: 1500 });
chk('scaleBySpeed Q1 gecersiz -> NaN (guvenli)', Number.isNaN(bad1.Q2) && Number.isNaN(bad1.H2) && Number.isNaN(bad1.P2));

// 5) Guvenli girdi: sifir N1 -> NaN (bolme hatasi)
const bad2 = AL.scaleBySpeed({ Q1: 100, H1: 20, P1: 5, N1: 0, N2: 1500 });
chk('scaleBySpeed N1=0 -> NaN (guvenli, bolme hatasi)', Number.isNaN(bad2.Q2) && Number.isNaN(bad2.H2) && Number.isNaN(bad2.P2));

// 6) Guvenli girdi: sifir D1 -> NaN (bolme hatasi)
const bad3 = AL.scaleByDiameter({ Q1: 100, H1: 20, P1: 5, D1: 0, D2: 250 });
chk('scaleByDiameter D1=0 -> NaN (guvenli, bolme hatasi)', Number.isNaN(bad3.Q2) && Number.isNaN(bad3.H2) && Number.isNaN(bad3.P2));

// 7) Guvenli girdi: gecersiz P1 -> NaN
const bad4 = AL.scaleByDiameter({ Q1: 100, H1: 20, P1: 'invalid', D1: 200, D2: 250 });
chk('scaleByDiameter P1="invalid" -> NaN (guvenli)', Number.isNaN(bad4.Q2) && Number.isNaN(bad4.H2) && Number.isNaN(bad4.P2));

// 8) Guvenli girdi: opt yok -> NaN (patlamaz)
const bad5 = AL.scaleBySpeed();
chk('scaleBySpeed() -> NaN (guvenli)', Number.isNaN(bad5.Q2) && Number.isNaN(bad5.H2) && Number.isNaN(bad5.P2));

// 9) Guvenli girdi: negatif degerler islemlenebilir (matematik olarak)
const r4 = AL.scaleBySpeed({ Q1: -100, H1: 20, P1: 5, N1: 1000, N2: 1500 });
chk('scaleBySpeed negatif Q1 islenebilir', isFinite(r4.Q2) && r4.Q2 === -150);

// 10) scaleByDiameter: caplar esit ise cikti girdiye esit
const r5 = AL.scaleByDiameter({ Q1: 100, H1: 20, P1: 5, D1: 200, D2: 200 });
chk('scaleByDiameter D1=D2 -> Q2=Q1', r5.Q2 === 100);
chk('scaleByDiameter D1=D2 -> H2=H1', r5.H2 === 20);
chk('scaleByDiameter D1=D2 -> P2=P1', r5.P2 === 5);

R('\n' + (fail ? fail + ' KALDI' : 'affinity-laws.js testleri GECTI'));
process.exit(fail ? 1 : 0);
