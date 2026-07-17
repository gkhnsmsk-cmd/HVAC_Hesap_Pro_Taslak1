// carpark-ventilation.js icin headless test (Modul-Test tarzi).
const C = require('../HVAC_Pro_v8/js/carpark-ventilation.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Normal isletme: V=1000 m3, ACH=6 -> Q=6000 m3/h
chk('normalVentFlow({V_m3:1000, ach:6}) == 6000', near(C.normalVentFlow({V_m3:1000, ach:6}), 6000, 1));

// 2) Yangin modu: A=500 m2, debit=40 m3/h.m2 -> Q=20000 m3/h
chk('fireVentFlow({A_m2:500, debit_m3h_m2:40}) == 20000', near(C.fireVentFlow({A_m2:500, debit_m3h_m2:40}), 20000, 1));

// 3) Fan sayisi tahmini: Q=6000 m3/h, tek_fan=1000 m3/h -> 6 fan
chk('jetFanCountEstimate({Q_m3h:6000, tek_fan_m3h:1000}) == 6', C.jetFanCountEstimate({Q_m3h:6000, tek_fan_m3h:1000}) === 6);

// 4) Fan sayisi yukleme: Q=7500, tek_fan=1000 -> 8 fan (ceil)
chk('jetFanCountEstimate({Q_m3h:7500, tek_fan_m3h:1000}) == 8', C.jetFanCountEstimate({Q_m3h:7500, tek_fan_m3h:1000}) === 8);

// 5) Guvenli girdi: NaN girdisi -> NaN (patlamaz)
chk('normalVentFlow(NaN) -> NaN', Number.isNaN(C.normalVentFlow(NaN)));
chk('normalVentFlow({V_m3:"x"}) -> NaN', Number.isNaN(C.normalVentFlow({V_m3:"x"})));
chk('normalVentFlow({V_m3:-100}) -> NaN', Number.isNaN(C.normalVentFlow({V_m3:-100})));
chk('normalVentFlow({ach:-5}) -> NaN', Number.isNaN(C.normalVentFlow({V_m3:1000, ach:-5})));

// 6) Fire flow guvenli girdi
chk('fireVentFlow({A_m2:"x"}) -> NaN', Number.isNaN(C.fireVentFlow({A_m2:"x"})));
chk('fireVentFlow({A_m2:-50}) -> NaN', Number.isNaN(C.fireVentFlow({A_m2:-50})));
chk('fireVentFlow({debit_m3h_m2:NaN}) -> NaN', Number.isNaN(C.fireVentFlow({A_m2:500, debit_m3h_m2:NaN})));

// 7) Sifir bolme guvenli: tek_fan <= 0 -> NaN
chk('jetFanCountEstimate({tek_fan_m3h:0}) -> NaN', Number.isNaN(C.jetFanCountEstimate({Q_m3h:1000, tek_fan_m3h:0})));
chk('jetFanCountEstimate({tek_fan_m3h:-100}) -> NaN', Number.isNaN(C.jetFanCountEstimate({Q_m3h:1000, tek_fan_m3h:-100})));

// 8) Sonlu sayi kontrolu
chk('normalVentFlow(valid) sonlu', isFinite(C.normalVentFlow({V_m3:500, ach:4})));
chk('fireVentFlow(valid) sonlu', isFinite(C.fireVentFlow({A_m2:300, debit_m3h_m2:30})));
chk('jetFanCountEstimate(valid) sonlu', isFinite(C.jetFanCountEstimate({Q_m3h:3000, tek_fan_m3h:500})));

R('\n' + (fail ? fail + ' KALDI' : 'carpark-ventilation.js testleri GECTI'));
process.exit(fail ? 1 : 0);
