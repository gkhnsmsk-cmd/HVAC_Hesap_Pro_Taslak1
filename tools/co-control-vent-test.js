// co-control-ventilation.js icin headless test (Modul-Test tarzi).
const C = require('../HVAC_Pro_v8/js/co-control-ventilation.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) CO Bazli Debi: V=1000 m3, ach_min=2, ach_max=6 -> Q_min=2000, Q_max=6000
var result1 = C.coBasedFlow({V_m3:1000, ach_min:2, ach_max:6});
chk('coBasedFlow({V_m3:1000, ach_min:2, ach_max:6}).Q_min_m3h == 2000',
    result1 && near(result1.Q_min_m3h, 2000, 1));
chk('coBasedFlow({V_m3:1000, ach_min:2, ach_max:6}).Q_max_m3h == 6000',
    result1 && near(result1.Q_max_m3h, 6000, 1));

// 2) CO Seviye Kontrolu: co_ppm=60, esik=50 -> true (ustunde)
chk('coLevelCheck({co_ppm:60, esik_ppm:50}) === true',
    C.coLevelCheck({co_ppm:60, esik_ppm:50}) === true);

// 3) CO Seviye Kontrolu: co_ppm=30, esik=50 -> false (altinda)
chk('coLevelCheck({co_ppm:30, esik_ppm:50}) === false',
    C.coLevelCheck({co_ppm:30, esik_ppm:50}) === false);

// 4) CO Seviye Kontrolu: co_ppm=50, esik=50 -> false (esitlik degil ustunde)
chk('coLevelCheck({co_ppm:50, esik_ppm:50}) === false',
    C.coLevelCheck({co_ppm:50, esik_ppm:50}) === false);

// 5) Guvenli girdi: coBasedFlow NaN girdisi -> NaN (patlamaz)
chk('coBasedFlow(NaN) -> NaN', Number.isNaN(C.coBasedFlow(NaN)));
chk('coBasedFlow({V_m3:"x"}) -> NaN', Number.isNaN(C.coBasedFlow({V_m3:"x"})));
chk('coBasedFlow({V_m3:-100}) -> NaN', Number.isNaN(C.coBasedFlow({V_m3:-100})));
chk('coBasedFlow({ach_min:-5}) -> NaN', Number.isNaN(C.coBasedFlow({V_m3:1000, ach_min:-5, ach_max:6})));
chk('coBasedFlow({ach_max:"y"}) -> NaN', Number.isNaN(C.coBasedFlow({V_m3:1000, ach_min:2, ach_max:"y"})));

// 6) Guvenli girdi: coLevelCheck NaN girdisi -> NaN (patlamaz)
chk('coLevelCheck(NaN) -> NaN', Number.isNaN(C.coLevelCheck(NaN)));
chk('coLevelCheck({co_ppm:"x"}) -> NaN', Number.isNaN(C.coLevelCheck({co_ppm:"x"})));
chk('coLevelCheck({co_ppm:-50}) -> NaN', Number.isNaN(C.coLevelCheck({co_ppm:-50})));
chk('coLevelCheck({esik_ppm:"z"}) -> NaN', Number.isNaN(C.coLevelCheck({co_ppm:60, esik_ppm:"z"})));
chk('coLevelCheck({esik_ppm:-30}) -> NaN', Number.isNaN(C.coLevelCheck({co_ppm:60, esik_ppm:-30})));

// 7) Sonlu sayi kontrolu: geçerli girdiler sonlu sayi donmes
var flow = C.coBasedFlow({V_m3:500, ach_min:1, ach_max:5});
chk('coBasedFlow(valid) Q_min_m3h sonlu', flow && isFinite(flow.Q_min_m3h));
chk('coBasedFlow(valid) Q_max_m3h sonlu', flow && isFinite(flow.Q_max_m3h));
chk('coLevelCheck(valid) boolean', typeof C.coLevelCheck({co_ppm:45, esik_ppm:40}) === 'boolean');

// 8) Sifir degerleri: V_m3=0, ach_min=0, ach_max=0 -> Q=0 (gecerli ama sifir)
var zero_flow = C.coBasedFlow({V_m3:0, ach_min:0, ach_max:0});
chk('coBasedFlow({V_m3:0, ...}) -> Q=0 (valid)', zero_flow && zero_flow.Q_min_m3h === 0 && zero_flow.Q_max_m3h === 0);

// 9) Buyuk sayilar: yuksek hacim ve ACH
var large = C.coBasedFlow({V_m3:10000, ach_min:3, ach_max:12});
chk('coBasedFlow(large) Q_min=30000', large && near(large.Q_min_m3h, 30000, 1));
chk('coBasedFlow(large) Q_max=120000', large && near(large.Q_max_m3h, 120000, 1));

// 10) CO Kontrol: Sinirlarda
chk('coLevelCheck(co=51, esik=50) -> true (sinirun ustunde)',
    C.coLevelCheck({co_ppm:51, esik_ppm:50}) === true);
chk('coLevelCheck(co=49, esik=50) -> false (sinirun altinda)',
    C.coLevelCheck({co_ppm:49, esik_ppm:50}) === false);

R('\n' + (fail ? fail + ' KALDI' : 'co-control-ventilation.js testleri GECTI'));
process.exit(fail ? 1 : 0);
