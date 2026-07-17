// water-hammer.js icin headless test (Modul-Test tarzi).
const W = require('../HVAC_Pro_v8/js/water-hammer.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: Joukowsky basınç artışı
//    rho=1000 kg/m3, a_ms=1200 m/s, dv_ms=2 m/s
//    dP_Pa = 1000 * 1200 * 2 = 2400000 Pa = 24 bar
const r = W.joukowskyPressureRise({ rho: 1000, a_ms: 1200, dv_ms: 2 });
chk('dP_Pa = 2400000 (±1000)', near(r.dP_Pa, 2400000, 1000));
chk('dP_Pa sonlu', isFinite(r.dP_Pa));
chk('dP_bar = 24 (±0.01)', near(r.dP_bar, 24, 0.01));

// 2) Default rho kullanıldığını doğrula: rho vermedikçe 1000 kullanılsın
const r2 = W.joukowskyPressureRise({ a_ms: 1200, dv_ms: 2 });
chk('Default rho=1000 kullanılıyor', near(r2.dP_Pa, 2400000, 1000));

// 3) Farklı dalga hızı: a=600 m/s, dv=1 m/s, rho=1000
//    dP = 1000 * 600 * 1 = 600000 Pa = 6 bar
const r3 = W.joukowskyPressureRise({ rho: 1000, a_ms: 600, dv_ms: 1 });
chk('Dusuk hiz: dP_Pa = 600000 (±500)', near(r3.dP_Pa, 600000, 500));

// 4) Hiz degisimi negatif (hiz düşüşü): dv=-2 m/s -> basınç düşüşü
const r4 = W.joukowskyPressureRise({ rho: 1000, a_ms: 1200, dv_ms: -2 });
chk('Negatif dv (hiz düsüsü): dP_Pa negatif', r4.dP_Pa < 0);

// 5) Buyukluk mertebesi kontrol: yuksek dalga hizi -> yuksek basınç
const r5a = W.joukowskyPressureRise({ rho: 1000, a_ms: 1000, dv_ms: 2 });
const r5b = W.joukowskyPressureRise({ rho: 1000, a_ms: 1500, dv_ms: 2 });
chk('Yuksek a_ms -> yuksek dP_Pa', r5b.dP_Pa > r5a.dP_Pa);

// 6) Guvenli girdi: gecersiz rho -> NaN
const bad1 = W.joukowskyPressureRise({ rho: 'x', a_ms: 1200, dv_ms: 2 });
chk('Gecersiz rho -> dP_Pa NaN (guvenli)', Number.isNaN(bad1.dP_Pa));

// 7) Guvenli girdi: a_ms = 0 -> NaN (dalga hizi sifir guvenli degil)
const bad2 = W.joukowskyPressureRise({ rho: 1000, a_ms: 0, dv_ms: 2 });
chk('a_ms=0 -> NaN (guvenli)', Number.isNaN(bad2.dP_Pa));

// 8) Guvenli girdi: dv_ms gecersiz -> NaN
const bad3 = W.joukowskyPressureRise({ rho: 1000, a_ms: 1200, dv_ms: 'y' });
chk('Gecersiz dv_ms -> NaN (guvenli)', Number.isNaN(bad3.dP_Pa));

// 9) Guvenli girdi: rho = 0 -> NaN
const bad4 = W.joukowskyPressureRise({ rho: 0, a_ms: 1200, dv_ms: 2 });
chk('rho=0 -> NaN (guvenli)', Number.isNaN(bad4.dP_Pa));

// 10) Guvenli girdi: rho negatif -> NaN
const bad5 = W.joukowskyPressureRise({ rho: -1000, a_ms: 1200, dv_ms: 2 });
chk('Negatif rho -> NaN (guvenli)', Number.isNaN(bad5.dP_Pa));

// 11) Guvenli girdi: a_ms negatif -> NaN
const bad6 = W.joukowskyPressureRise({ rho: 1000, a_ms: -1200, dv_ms: 2 });
chk('Negatif a_ms -> NaN (guvenli)', Number.isNaN(bad6.dP_Pa));

// 12) Guvenli girdi: opt yok -> patlamaz
chk('joukowskyPressureRise() -> NaN (guvenli)', (() => { try { var z = W.joukowskyPressureRise(); return Number.isNaN(z.dP_Pa); } catch (e) { return false; } })());

R('\n' + (fail ? fail + ' KALDI' : 'water-hammer.js testleri GECTI'));
process.exit(fail ? 1 : 0);
