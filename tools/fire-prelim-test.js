// fire-prelim.js icin headless test (Modul-Test tarzi).
const F_mod = require('../HVAC_Pro_v8/js/fire-prelim.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Sprinkler talep debisi: Q = debit_l_min_m2 * min(A_m2, tasarim_alani_m2)
// sprinklerDemand({A_m2:1000, debit_l_min_m2:5, tasarim_alani_m2:260})
// = 5 * min(1000, 260) = 5 * 260 = 1300 L/min
const q1 = F_mod.sprinklerDemand({ A_m2: 1000, debit_l_min_m2: 5, tasarim_alani_m2: 260 });
chk('sprinklerDemand({A_m2:1000, debit_l_min_m2:5, tasarim_alani_m2:260}) == 1300', near(q1, 1300, 0.01));

// 2) Hidrant talep debisi: Q = hidrant_sayisi * debit_l_s_adet
// hydrantDemand({hidrant_sayisi:2, debit_l_s_adet:10}) = 2 * 10 = 20 L/s
const q2 = F_mod.hydrantDemand({ hidrant_sayisi: 2, debit_l_s_adet: 10 });
chk('hydrantDemand({hidrant_sayisi:2, debit_l_s_adet:10}) == 20', near(q2, 20, 0.01));

// 3) Tank hacmi: V = Q_l_min * sure_dk
// tankVolume({Q_l_min:1300, sure_dk:60}) = 1300 * 60 = 78000 L
const v1 = F_mod.tankVolume({ Q_l_min: 1300, sure_dk: 60 });
chk('tankVolume({Q_l_min:1300, sure_dk:60}) == 78000', near(v1, 78000, 0.01));

// 4) Cesitli basarili hesaplamalar
const q3 = F_mod.sprinklerDemand({ A_m2: 500, debit_l_min_m2: 4, tasarim_alani_m2: 500 });
chk('sprinklerDemand({A_m2:500, debit_l_min_m2:4, tasarim_alani_m2:500}) == 2000', near(q3, 2000, 0.01));

const q4 = F_mod.hydrantDemand({ hidrant_sayisi: 4, debit_l_s_adet: 5 });
chk('hydrantDemand({hidrant_sayisi:4, debit_l_s_adet:5}) == 20', near(q4, 20, 0.01));

const v2 = F_mod.tankVolume({ Q_l_min: 500, sure_dk: 30 });
chk('tankVolume({Q_l_min:500, sure_dk:30}) == 15000', near(v2, 15000, 0.01));

// 5) Guvenli girdi: NaN / gecersiz -> NaN dondurur (patlamaz)
chk('sprinklerDemand(null) -> NaN', Number.isNaN(F_mod.sprinklerDemand(null)));
chk('sprinklerDemand(undefined) -> NaN', Number.isNaN(F_mod.sprinklerDemand(undefined)));
chk('sprinklerDemand({}) -> NaN', Number.isNaN(F_mod.sprinklerDemand({})));
chk('sprinklerDemand({A_m2:NaN, ...}) -> NaN', Number.isNaN(F_mod.sprinklerDemand({ A_m2: NaN, debit_l_min_m2: 5, tasarim_alani_m2: 260 })));
chk('sprinklerDemand({A_m2:-100, ...}) -> NaN', Number.isNaN(F_mod.sprinklerDemand({ A_m2: -100, debit_l_min_m2: 5, tasarim_alani_m2: 260 })));
chk('sprinklerDemand({A_m2:1000, debit_l_min_m2:-5, ...}) -> NaN', Number.isNaN(F_mod.sprinklerDemand({ A_m2: 1000, debit_l_min_m2: -5, tasarim_alani_m2: 260 })));
chk('sprinklerDemand({..., tasarim_alani_m2:-10}) -> NaN', Number.isNaN(F_mod.sprinklerDemand({ A_m2: 1000, debit_l_min_m2: 5, tasarim_alani_m2: -10 })));

chk('hydrantDemand(null) -> NaN', Number.isNaN(F_mod.hydrantDemand(null)));
chk('hydrantDemand(undefined) -> NaN', Number.isNaN(F_mod.hydrantDemand(undefined)));
chk('hydrantDemand({}) -> NaN', Number.isNaN(F_mod.hydrantDemand({})));
chk('hydrantDemand({hidrant_sayisi:NaN, ...}) -> NaN', Number.isNaN(F_mod.hydrantDemand({ hidrant_sayisi: NaN, debit_l_s_adet: 10 })));
chk('hydrantDemand({hidrant_sayisi:-2, ...}) -> NaN', Number.isNaN(F_mod.hydrantDemand({ hidrant_sayisi: -2, debit_l_s_adet: 10 })));
chk('hydrantDemand({hidrant_sayisi:2, debit_l_s_adet:-10}) -> NaN', Number.isNaN(F_mod.hydrantDemand({ hidrant_sayisi: 2, debit_l_s_adet: -10 })));
chk('hydrantDemand("abc") -> NaN', Number.isNaN(F_mod.hydrantDemand('abc')));

chk('tankVolume(null) -> NaN', Number.isNaN(F_mod.tankVolume(null)));
chk('tankVolume(undefined) -> NaN', Number.isNaN(F_mod.tankVolume(undefined)));
chk('tankVolume({}) -> NaN', Number.isNaN(F_mod.tankVolume({})));
chk('tankVolume({Q_l_min:NaN, ...}) -> NaN', Number.isNaN(F_mod.tankVolume({ Q_l_min: NaN, sure_dk: 60 })));
chk('tankVolume({Q_l_min:-1300, ...}) -> NaN', Number.isNaN(F_mod.tankVolume({ Q_l_min: -1300, sure_dk: 60 })));
chk('tankVolume({Q_l_min:1300, sure_dk:-60}) -> NaN', Number.isNaN(F_mod.tankVolume({ Q_l_min: 1300, sure_dk: -60 })));

// 6) Sonlu sayi kontrol
chk('sprinklerDemand sonuc sonlu', isFinite(q1) && q1 === 1300);
chk('hydrantDemand sonuc sonlu', isFinite(q2) && q2 === 20);
chk('tankVolume sonuc sonlu', isFinite(v1) && v1 === 78000);

R('\n' + (fail ? fail + ' KALDI' : 'fire-prelim.js testleri GECTI'));
process.exit(fail ? 1 : 0);
