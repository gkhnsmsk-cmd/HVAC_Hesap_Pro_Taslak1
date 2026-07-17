// smoke-extract.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/smoke-extract.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) ACH bazli tahliye: V=2000 m3, ACH=10 -> Q=20000 m3/h
chk('achExtract({V_m3:2000, ach:10}) == 20000', near(S.achExtract({V_m3:2000, ach:10}), 20000, 1));

// 2) Alan bazli tahliye: A=800 m2, debit=40 m3/h.m2 -> Q=32000 m3/h
chk('areaExtract({A_m2:800, debit_m3h_m2:40}) == 32000', near(S.areaExtract({A_m2:800, debit_m3h_m2:40}), 32000, 1));

// 3) Taze hava tahmini: Q=20000 m3/h, oran=0.9 -> Q_makeup=18000 m3/h
chk('makeupAirEstimate(20000, 0.9) == 18000', near(S.makeupAirEstimate(20000, 0.9), 18000, 1));

// 4) Taze hava tahmini, farkli oran: Q=32000, oran=0.85 -> Q_makeup=27200
chk('makeupAirEstimate(32000, 0.85) == 27200', near(S.makeupAirEstimate(32000, 0.85), 27200, 1));

// 5) Guvenli girdi: NaN/gecersiz -> NaN (patlamaz)
chk('achExtract(null) -> NaN', Number.isNaN(S.achExtract(null)));
chk('achExtract({V_m3:"x"}) -> NaN', Number.isNaN(S.achExtract({V_m3:"x"})));
chk('achExtract({V_m3:-100}) -> NaN', Number.isNaN(S.achExtract({V_m3:-100})));
chk('achExtract({V_m3:2000, ach:-5}) -> NaN', Number.isNaN(S.achExtract({V_m3:2000, ach:-5})));

// 6) Alan bazli tahliye guvenli girdi
chk('areaExtract({A_m2:"x"}) -> NaN', Number.isNaN(S.areaExtract({A_m2:"x"})));
chk('areaExtract({A_m2:-50}) -> NaN', Number.isNaN(S.areaExtract({A_m2:-50})));
chk('areaExtract({debit_m3h_m2:NaN}) -> NaN', Number.isNaN(S.areaExtract({A_m2:800, debit_m3h_m2:NaN})));

// 7) Taze hava parametresi eksik/gecersiz
chk('makeupAirEstimate(20000, undefined) -> NaN', Number.isNaN(S.makeupAirEstimate(20000, undefined)));
chk('makeupAirEstimate(20000, NaN) -> NaN', Number.isNaN(S.makeupAirEstimate(20000, NaN)));
chk('makeupAirEstimate(20000, "x") -> NaN', Number.isNaN(S.makeupAirEstimate(20000, "x")));
chk('makeupAirEstimate(20000, -0.5) -> NaN', Number.isNaN(S.makeupAirEstimate(20000, -0.5)));

// 8) Sifir/negatif debi guvenli
chk('achExtract({V_m3:0, ach:10}) -> 0', near(S.achExtract({V_m3:0, ach:10}), 0, 0.1));
chk('areaExtract({A_m2:0, debit_m3h_m2:40}) -> 0', near(S.areaExtract({A_m2:0, debit_m3h_m2:40}), 0, 0.1));
chk('makeupAirEstimate(0, 0.9) -> 0', near(S.makeupAirEstimate(0, 0.9), 0, 0.1));

// 9) Sonlu sayi kontrolu
chk('achExtract(valid) sonlu', isFinite(S.achExtract({V_m3:1500, ach:8})));
chk('areaExtract(valid) sonlu', isFinite(S.areaExtract({A_m2:600, debit_m3h_m2:35})));
chk('makeupAirEstimate(valid) sonlu', isFinite(S.makeupAirEstimate(20000, 0.88)));

R('\n' + (fail ? fail + ' KALDI' : 'smoke-extract.js testleri GECTI'));
process.exit(fail ? 1 : 0);
