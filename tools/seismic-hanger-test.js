// seismic-hanger.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/seismic-hanger.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Sismik yatay kuvvet: W_kg=100, Sds=1.0, Ip=1.5
// Fp = 0.4 * 1.0 * 1.5 * 100 = 60 kg-force
const f1 = S.seismicLoad({ W_kg: 100, Sds: 1.0, Ip: 1.5 });
chk('seismicLoad({W_kg:100, Sds:1.0, Ip:1.5}) == 60', f1 === 60);

// 2) Farklı kütlenin sismik yükü: W_kg=250, Sds=0.8, Ip=1.0
// Fp = 0.4 * 0.8 * 1.0 * 250 = 80 kg-force
const f2 = S.seismicLoad({ W_kg: 250, Sds: 0.8, Ip: 1.0 });
chk('seismicLoad({W_kg:250, Sds:0.8, Ip:1.0}) == 80', f2 === 80);

// 3) Yüksek önem katsayısı: W_kg=50, Sds=1.2, Ip=2.0
// Fp = 0.4 * 1.2 * 2.0 * 50 = 48 kg-force
const f3 = S.seismicLoad({ W_kg: 50, Sds: 1.2, Ip: 2.0 });
chk('seismicLoad({W_kg:50, Sds:1.2, Ip:2.0}) == 48', f3 === 48);

// 4) Geçersiz girdi: negatif kütlenin -> NaN
chk('seismicLoad({W_kg:-100, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: -100, Sds: 1.0, Ip: 1.5 })));

// 5) Geçersiz girdi: negatif Sds -> NaN
chk('seismicLoad({Sds:-0.5, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 100, Sds: -0.5, Ip: 1.5 })));

// 6) Geçersiz girdi: negatif Ip -> NaN
chk('seismicLoad({Ip:-1.0, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 100, Sds: 1.0, Ip: -1.0 })));

// 7) Geçersiz girdi: null/undefined -> NaN
chk('seismicLoad(null) -> NaN', Number.isNaN(S.seismicLoad(null)));
chk('seismicLoad({}) -> NaN', Number.isNaN(S.seismicLoad({})));

// 8) Geçersiz girdi: string değeri -> NaN (coerce başarısız)
chk('seismicLoad({W_kg:"abc", ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 'abc', Sds: 1.0, Ip: 1.5 })));

// 9) Sonlu sayı kontrolü
chk('seismicLoad(valid) sonlu', isFinite(f1));
chk('seismicLoad(valid) sonlu', isFinite(f2));

// 10) Sıfır kütlesi (geçerli): W_kg=0 -> Fp=0
const f4 = S.seismicLoad({ W_kg: 0, Sds: 1.0, Ip: 1.5 });
chk('seismicLoad({W_kg:0, ...}) == 0', f4 === 0);

R('\n' + (fail ? fail + ' KALDI' : 'seismic-hanger.js testleri GECTI'));
process.exit(fail ? 1 : 0);
