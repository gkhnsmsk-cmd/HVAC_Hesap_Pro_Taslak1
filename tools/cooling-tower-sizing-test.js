// cooling-tower-sizing.js icin headless test.
const CTS = require('../HVAC_Pro_v8/js/cooling-tower-sizing.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: Q_sogutma_kW=500, pompVerimi_yuzde=3
//    Atilan_toplam = 500 * (1 + 3/100) = 500 * 1.03 = 515 kW
const r1 = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 3 });
chk('calc 500 kW + 3% pompa → 515 kW (±1)', near(r1.Kule_kapasite_kW, 515, 1));
chk('calc sonlu kapasite donder', isFinite(r1.Kule_kapasite_kW));

// 2) Varsayılan pompVerimi_yuzde = 3
const r2a = CTS.calc({ Q_sogutma_kW: 500 });
const r2b = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 3 });
chk('calc: varsayılan pompa verimi = 3%', Math.abs(r2a.Kule_kapasite_kW - r2b.Kule_kapasite_kW) < 0.1);

// 3) Daha yüksek pompa verimi -> daha yüksek kapasite gereksinimi
const r3a = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 2 });
const r3b = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 3 });
chk('calc: daha yüksek pompa ısısı -> daha yüksek kapasite', r3b.Kule_kapasite_kW > r3a.Kule_kapasite_kW);

// 4) Daha yüksek soğutma yükü -> daha yüksek kapasite
const r4a = CTS.calc({ Q_sogutma_kW: 400, pompVerimi_yuzde: 3 });
const r4b = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 3 });
chk('calc: yüksek soğutma yükü -> yüksek kapasite', r4b.Kule_kapasite_kW > r4a.Kule_kapasite_kW);

// 5) Sıfır pompa verimi (hipotetik)
const r5 = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 0 });
chk('calc: 0% pompa verimi -> Q_sogutma ile eşit', near(r5.Kule_kapasite_kW, 500, 0.1));

// 6) Sıfır soğutma yükü -> sıfır kapasite
const r6 = CTS.calc({ Q_sogutma_kW: 0, pompVerimi_yuzde: 3 });
chk('calc: 0 kW soğutma → 0 kW kapasite', near(r6.Kule_kapasite_kW, 0, 0.1));

// 7) Güvenli girdi: Q_sogutma_kW geçersiz -> NaN
const bad1 = CTS.calc({ Q_sogutma_kW: 'x', pompVerimi_yuzde: 3 });
chk('calc: soğutma yükü geçersiz -> NaN (güvenli)', Number.isNaN(bad1.Kule_kapasite_kW));

// 8) Güvenli girdi: pompVerimi_yuzde geçersiz -> NaN
const bad2 = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: 'bad' });
chk('calc: pompa verimi geçersiz -> NaN (güvenli)', Number.isNaN(bad2.Kule_kapasite_kW));

// 9) Güvenli girdi: negatif Q_sogutma_kW -> NaN
const bad3 = CTS.calc({ Q_sogutma_kW: -500, pompVerimi_yuzde: 3 });
chk('calc: negatif soğutma yükü -> NaN (güvenli)', Number.isNaN(bad3.Kule_kapasite_kW));

// 10) Güvenli girdi: negatif pompa verimi -> NaN
const bad4 = CTS.calc({ Q_sogutma_kW: 500, pompVerimi_yuzde: -5 });
chk('calc: negatif pompa verimi -> NaN (güvenli)', Number.isNaN(bad4.Kule_kapasite_kW));

// 11) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad5 = CTS.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad5.Kule_kapasite_kW));

// 12) Büyük soğutma yükü: Q=1000 kW, pompa=3%
//     Kapasite = 1000 * 1.03 = 1030 kW
const r7 = CTS.calc({ Q_sogutma_kW: 1000, pompVerimi_yuzde: 3 });
chk('calc: 1000 kW + 3% → 1030 kW (±2)', near(r7.Kule_kapasite_kW, 1030, 2));

R('\n' + (fail ? fail + ' KALDI' : 'cooling-tower-sizing.js testleri GECTI'));
process.exit(fail ? 1 : 0);
