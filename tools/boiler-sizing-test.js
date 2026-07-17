// boiler-sizing.js icin headless test.
const BS = require('../HVAC_Pro_v8/js/boiler-sizing.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: Q_isitma_yuku_kW=100, emniyet_faktoru=1.2
//    P_kombi = 100 * 1.2 = 120 kW
const r1 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.2 });
chk('calc 100 kW yük × 1.2 faktör → 120 kW (±0.1)', near(r1.P_kombi_kW, 120, 0.1));
chk('calc sonlu kombi gücü donder', isFinite(r1.P_kombi_kW));

// 2) Varsayılan emniyet_faktoru = 1.2
const r2a = BS.calc({ Q_isitma_yuku_kW: 100 });
const r2b = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.2 });
chk('calc: varsayılan emniyet faktörü = 1.2', Math.abs(r2a.P_kombi_kW - r2b.P_kombi_kW) < 0.1);

// 3) Daha yüksek faktör -> daha yüksek kombi gücü
const r3a = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.15 });
const r3b = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.2 });
chk('calc: yüksek faktör -> yüksek kombi gücü', r3b.P_kombi_kW > r3a.P_kombi_kW);

// 4) Daha yüksek isıtma yükü -> daha yüksek kombi gücü
const r4a = BS.calc({ Q_isitma_yuku_kW: 50, emniyet_faktoru: 1.2 });
const r4b = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.2 });
chk('calc: yüksek yük -> yüksek kombi gücü', r4b.P_kombi_kW > r4a.P_kombi_kW);

// 5) Hipotetik faktör 1.0 (emniyet yok)
const r5 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.0 });
chk('calc: 1.0 faktör -> yüke eşit', near(r5.P_kombi_kW, 100, 0.1));

// 6) Sıfır isıtma yükü -> sıfır kombi gücü
const r6 = BS.calc({ Q_isitma_yuku_kW: 0, emniyet_faktoru: 1.2 });
chk('calc: 0 kW yük → 0 kW kombi', near(r6.P_kombi_kW, 0, 0.1));

// 7) Güvenli girdi: Q_isitma_yuku_kW geçersiz -> NaN
const bad1 = BS.calc({ Q_isitma_yuku_kW: 'x', emniyet_faktoru: 1.2 });
chk('calc: yük geçersiz -> NaN (güvenli)', Number.isNaN(bad1.P_kombi_kW));

// 8) Güvenli girdi: emniyet_faktoru geçersiz -> NaN
const bad2 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 'bad' });
chk('calc: faktör geçersiz -> NaN (güvenli)', Number.isNaN(bad2.P_kombi_kW));

// 9) Güvenli girdi: negatif yük -> NaN
const bad3 = BS.calc({ Q_isitma_yuku_kW: -100, emniyet_faktoru: 1.2 });
chk('calc: negatif yük -> NaN (güvenli)', Number.isNaN(bad3.P_kombi_kW));

// 10) Güvenli girdi: faktör ≤ 0 -> NaN
const bad4 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 0 });
chk('calc: faktör=0 -> NaN (güvenli)', Number.isNaN(bad4.P_kombi_kW));

// 11) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad5 = BS.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad5.P_kombi_kW));

// 12) Üst aralık faktörü: Q=100, faktör=1.3 (yüksek emniyet)
//     P = 100 * 1.3 = 130 kW
const r7 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.3 });
chk('calc: 1.3 faktör (yüksek emniyet) → 130 kW (±0.1)', near(r7.P_kombi_kW, 130, 0.1));

// 13) Alt aralık faktörü: Q=100, faktör=1.15 (minimal emniyet)
//     P = 100 * 1.15 = 115 kW
const r8 = BS.calc({ Q_isitma_yuku_kW: 100, emniyet_faktoru: 1.15 });
chk('calc: 1.15 faktör (minimal emniyet) → 115 kW (±0.1)', near(r8.P_kombi_kW, 115, 0.1));

R('\n' + (fail ? fail + ' KALDI' : 'boiler-sizing.js testleri GECTI'));
process.exit(fail ? 1 : 0);
