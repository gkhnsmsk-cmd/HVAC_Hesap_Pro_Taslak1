// duct-heat-gain.js icin headless test.
const DHG = require('../HVAC_Pro_v8/js/duct-heat-gain.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// ===== calc() testleri =====
const r1 = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: 0.5x20x22=220 W (kanal isi kazanci)', near(r1.Q_W, 220, 0.1));
chk('calc sonucu sonlu', isFinite(r1.Q_W));

const r2 = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 25, T_air_C: 25 });
chk('calc: deltaT=0 -> Q=0 W', near(r2.Q_W, 0, 0.01));

const r3 = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 10, T_air_C: 25 });
chk('calc: deltaT<0 -> Q<0 (isi kaybi)', near(r3.Q_W, -150, 0.1));

const r4a = DHG.calc({ U_W_m2K: 0.3, A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
const r4b = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: yuksek U -> yuksek Q', r4b.Q_W > r4a.Q_W);

const r5a = DHG.calc({ U_W_m2K: 0.5, A_m2: 10, T_ambient_C: 35, T_air_C: 13 });
const r5b = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: yuksek A -> yuksek Q', r5b.Q_W > r5a.Q_W);

const bad1 = DHG.calc({ U_W_m2K: 'x', A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: U gecersiz -> NaN (guvenli)', Number.isNaN(bad1.Q_W));

const bad2 = DHG.calc({ U_W_m2K: 0.5, A_m2: 'bad', T_ambient_C: 35, T_air_C: 13 });
chk('calc: A gecersiz -> NaN (guvenli)', Number.isNaN(bad2.Q_W));

const bad3 = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: null, T_air_C: 13 });
chk('calc: Tamb gecersiz -> NaN (guvenli)', Number.isNaN(bad3.Q_W));

const bad4 = DHG.calc({ U_W_m2K: 0.5, A_m2: 20, T_ambient_C: 35, T_air_C: undefined });
chk('calc: Tair gecersiz -> NaN (guvenli)', Number.isNaN(bad4.Q_W));

const bad5 = DHG.calc({ U_W_m2K: -0.5, A_m2: 20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: U<0 -> NaN (guvenli)', Number.isNaN(bad5.Q_W));

const bad6 = DHG.calc({ U_W_m2K: 0.5, A_m2: -20, T_ambient_C: 35, T_air_C: 13 });
chk('calc: A<0 -> NaN (guvenli)', Number.isNaN(bad6.Q_W));

const bad7 = DHG.calc();
chk('calc() -> NaN (guvenli)', Number.isNaN(bad7.Q_W));

const r6 = DHG.calc({ U_W_m2K: 0.333, A_m2: 15.5, T_ambient_C: 22.5, T_air_C: 12.3 });
chk('calc: 3 ondalik (0.333x15.5x10.2)', near(r6.Q_W, 0.333 * 15.5 * 10.2, 0.01));

// ===== percentOfLoad() testleri =====
const p1 = DHG.percentOfLoad({ Q_W: 220, toplam_yuk_W: 1000 });
chk('percentOfLoad: 220/1000 = 22%', near(p1.yuzde, 22, 0.1));

const p2 = DHG.percentOfLoad({ Q_W: -150, toplam_yuk_W: 1000 });
chk('percentOfLoad: -150/1000 = -15%', near(p2.yuzde, -15, 0.1));

const p3 = DHG.percentOfLoad({ Q_W: 0, toplam_yuk_W: 1000 });
chk('percentOfLoad: Q=0 -> 0%', near(p3.yuzde, 0, 0.01));

const p4 = DHG.percentOfLoad({ Q_W: 220, toplam_yuk_W: 1000 });
chk('percentOfLoad: 220/1000 = 22% dogru oran', near(p4.yuzde, 22, 0.1));

const pbad1 = DHG.percentOfLoad({ Q_W: 220, toplam_yuk_W: 0 });
chk('percentOfLoad: sifir yuk -> NaN (guvenli)', Number.isNaN(pbad1.yuzde));

const pbad2 = DHG.percentOfLoad({ Q_W: 'bad', toplam_yuk_W: 1000 });
chk('percentOfLoad: Q gecersiz -> NaN (guvenli)', Number.isNaN(pbad2.yuzde));

const pbad3 = DHG.percentOfLoad({ Q_W: 220, toplam_yuk_W: 'x' });
chk('percentOfLoad: toplam_yuk gecersiz -> NaN (guvenli)', Number.isNaN(pbad3.yuzde));

const pbad4 = DHG.percentOfLoad();
chk('percentOfLoad() -> NaN (guvenli)', Number.isNaN(pbad4.yuzde));

const p5 = DHG.percentOfLoad({ Q_W: 333, toplam_yuk_W: 1000 });
chk('percentOfLoad: 333/1000 = 33.3% (2 ondalik)', near(p5.yuzde, 33.3, 0.01));

R('\n' + (fail ? fail + ' KALDI' : 'duct-heat-gain.js testleri GECTI'));
process.exit(fail ? 1 : 0);
