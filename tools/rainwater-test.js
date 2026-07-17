// rainwater-drainage.js icin headless test (Modul-Test tarzi).
const R_mod = require('../HVAC_Pro_v8/js/rainwater-drainage.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) EN 12056-3: Q = C * A * i  (L/s)
// designFlow({A_m2: 200, C: 1.0, i_l_s_m2: 0.03}) = 1.0 * 200 * 0.03 = 6.0
const q1 = R_mod.designFlow({ A_m2: 200, C: 1.0, i_l_s_m2: 0.03 });
chk('designFlow({A_m2:200, C:1.0, i_l_s_m2:0.03}) ~= 6.0', near(q1, 6.0, 0.1));

// 2) Serbest dusme kapasite sinir testleri (EN 12056-3)
chk('gutterPipeDN(0.5) -> DN70', R_mod.gutterPipeDN(0.5) === 'DN70');
chk('gutterPipeDN(1.5) -> DN70', R_mod.gutterPipeDN(1.5) === 'DN70');
chk('gutterPipeDN(2.0) -> DN100', R_mod.gutterPipeDN(2.0) === 'DN100');
chk('gutterPipeDN(4.5) -> DN100', R_mod.gutterPipeDN(4.5) === 'DN100');
chk('gutterPipeDN(6.0) -> DN125', R_mod.gutterPipeDN(6.0) === 'DN125');
chk('gutterPipeDN(8.5) -> DN125', R_mod.gutterPipeDN(8.5) === 'DN125');
chk('gutterPipeDN(10.0) -> DN150', R_mod.gutterPipeDN(10.0) === 'DN150');
chk('gutterPipeDN(15.0) -> DN150', R_mod.gutterPipeDN(15.0) === 'DN150');
chk('gutterPipeDN(20.0) -> DN200', R_mod.gutterPipeDN(20.0) === 'DN200');

// 3) Cesitli basarili hesaplamalar
const q2 = R_mod.designFlow({ A_m2: 100, C: 1.0, i_l_s_m2: 0.02 });
chk('designFlow({A_m2:100, C:1.0, i_l_s_m2:0.02}) ~= 2.0', near(q2, 2.0, 0.01));

// 4) Guvenli girdi: NaN / gecersiz -> NaN dondurur (patlamaz)
chk('designFlow(null) -> NaN', Number.isNaN(R_mod.designFlow(null)));
chk('designFlow(undefined) -> NaN', Number.isNaN(R_mod.designFlow(undefined)));
chk('designFlow({}) -> NaN', Number.isNaN(R_mod.designFlow({})));
chk('designFlow({A_m2:NaN, C:1.0, i_l_s_m2:0.03}) -> NaN', Number.isNaN(R_mod.designFlow({ A_m2: NaN, C: 1.0, i_l_s_m2: 0.03 })));
chk('designFlow({A_m2:-10, C:1.0, i_l_s_m2:0.03}) -> NaN', Number.isNaN(R_mod.designFlow({ A_m2: -10, C: 1.0, i_l_s_m2: 0.03 })));
chk('designFlow({A_m2:200, C:-1, i_l_s_m2:0.03}) -> NaN', Number.isNaN(R_mod.designFlow({ A_m2: 200, C: -1, i_l_s_m2: 0.03 })));
chk('designFlow({A_m2:200, C:1.0, i_l_s_m2:-0.03}) -> NaN', Number.isNaN(R_mod.designFlow({ A_m2: 200, C: 1.0, i_l_s_m2: -0.03 })));

chk('gutterPipeDN(NaN) -> NaN', Number.isNaN(R_mod.gutterPipeDN(NaN)));
chk('gutterPipeDN(-5) -> NaN', Number.isNaN(R_mod.gutterPipeDN(-5)));
chk('gutterPipeDN("abc") -> NaN', Number.isNaN(R_mod.gutterPipeDN('abc')));

// 5) Sonlu sayi kontrol
chk('designFlow sonuc sonlu', isFinite(q1) && q1 === 6.0);
chk('gutterPipeDN(6.0) string dondur', typeof R_mod.gutterPipeDN(6.0) === 'string');

R('\n' + (fail ? fail + ' KALDI' : 'rainwater-drainage.js testleri GECTI'));
process.exit(fail ? 1 : 0);
