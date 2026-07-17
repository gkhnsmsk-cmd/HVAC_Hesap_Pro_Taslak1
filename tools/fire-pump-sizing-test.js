// fire-pump-sizing.js icin headless test.
const FPS = require('../HVAC_Pro_v8/js/fire-pump-sizing.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: Q_sprinkler_m3h=54, Q_hidrant_m3h=30, Q_dolap_m3h=10, es_zamanlilik_faktoru=1
//    Q_toplam = (54 + 30 + 10) * 1 = 94 m³/h
const r1 = FPS.calc({ Q_sprinkler_m3h: 54, Q_hidrant_m3h: 30, Q_dolap_m3h: 10, es_zamanlilik_faktoru: 1 });
chk('calc 54+30+10 m³/h × 1 faktör → 94 m³/h (±0.1)', near(r1.Q_toplam_m3h, 94, 0.1));
chk('calc sonlu toplam debi donder', isFinite(r1.Q_toplam_m3h));

// 2) Varsayılan es_zamanlilik_faktoru = 1.0
const r2a = FPS.calc({ Q_sprinkler_m3h: 54, Q_hidrant_m3h: 30, Q_dolap_m3h: 10 });
const r2b = FPS.calc({ Q_sprinkler_m3h: 54, Q_hidrant_m3h: 30, Q_dolap_m3h: 10, es_zamanlilik_faktoru: 1.0 });
chk('calc: varsayılan es_zamanlilik_faktoru = 1.0', Math.abs(r2a.Q_toplam_m3h - r2b.Q_toplam_m3h) < 0.1);

// 3) Daha yüksek faktör -> daha yüksek toplam debi
const r3a = FPS.calc({ Q_sprinkler_m3h: 54, Q_hidrant_m3h: 30, Q_dolap_m3h: 10, es_zamanlilik_faktoru: 0.8 });
const r3b = FPS.calc({ Q_sprinkler_m3h: 54, Q_hidrant_m3h: 30, Q_dolap_m3h: 10, es_zamanlilik_faktoru: 1.0 });
chk('calc: yüksek faktör -> yüksek toplam debi', r3b.Q_toplam_m3h > r3a.Q_toplam_m3h);

// 4) Sadece sprinkler: Q_sprinkler_m3h=100
const r4 = FPS.calc({ Q_sprinkler_m3h: 100 });
chk('calc: sadece sprinkler 100 m³/h → 100 m³/h', near(r4.Q_toplam_m3h, 100, 0.1));

// 5) Sadece hidrant: Q_hidrant_m3h=50
const r5 = FPS.calc({ Q_hidrant_m3h: 50 });
chk('calc: sadece hidrant 50 m³/h → 50 m³/h', near(r5.Q_toplam_m3h, 50, 0.1));

// 6) Eşzamanlılık faktörü 0.6 (varsayılan değil)
const r6 = FPS.calc({ Q_sprinkler_m3h: 100, es_zamanlilik_faktoru: 0.6 });
chk('calc: 100 × 0.6 faktör → 60 m³/h (±0.1)', near(r6.Q_toplam_m3h, 60, 0.1));

// 7) Pass-through P_gerekli_bar: 8.5 bar dışarıdan veriliyorsa, döner
const r7 = FPS.calc({ Q_sprinkler_m3h: 54, P_gerekli_bar: 8.5 });
chk('calc: P_gerekli_bar pass-through', isFinite(r7.P_gerekli_bar) && r7.P_gerekli_bar === 8.5);

// 8) Güvenli girdi: Q_sprinkler_m3h geçersiz -> NaN
const bad1 = FPS.calc({ Q_sprinkler_m3h: 'x' });
chk('calc: sprinkler debi geçersiz -> NaN (güvenli)', Number.isNaN(bad1.Q_toplam_m3h));

// 9) Güvenli girdi: negatif debi -> NaN
const bad2 = FPS.calc({ Q_sprinkler_m3h: -50 });
chk('calc: negatif sprinkler debi -> NaN (güvenli)', Number.isNaN(bad2.Q_toplam_m3h));

// 10) Güvenli girdi: faktör geçersiz -> NaN
const bad3 = FPS.calc({ Q_sprinkler_m3h: 100, es_zamanlilik_faktoru: 'bad' });
chk('calc: faktör geçersiz -> NaN (güvenli)', Number.isNaN(bad3.Q_toplam_m3h));

// 11) Güvenli girdi: faktör ≤ 0 -> NaN
const bad4 = FPS.calc({ Q_sprinkler_m3h: 100, es_zamanlilik_faktoru: 0 });
chk('calc: faktör=0 -> NaN (güvenli)', Number.isNaN(bad4.Q_toplam_m3h));

// 12) Güvenli girdi: hepsi sıfır (en az bir Q_* gerekli) -> NaN
const bad5 = FPS.calc({ Q_sprinkler_m3h: 0, Q_hidrant_m3h: 0, Q_dolap_m3h: 0 });
chk('calc: hepsi sıfır -> NaN (güvenli)', Number.isNaN(bad5.Q_toplam_m3h));

// 13) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad6 = FPS.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad6.Q_toplam_m3h));

// 14) Negatif hidrant + pozitif sprinkler -> NaN (tüm Q'lar kontrol edilir)
const bad7 = FPS.calc({ Q_sprinkler_m3h: 100, Q_hidrant_m3h: -50 });
chk('calc: negatif hidrant debi -> NaN (güvenli)', Number.isNaN(bad7.Q_toplam_m3h));

// 15) Yüksek faktör: 100 m³/h × 1.5 faktör = 150 m³/h
const r8 = FPS.calc({ Q_sprinkler_m3h: 100, es_zamanlilik_faktoru: 1.5 });
chk('calc: 100 × 1.5 faktör → 150 m³/h (±0.1)', near(r8.Q_toplam_m3h, 150, 0.1));

R('\n' + (fail ? fail + ' KALDI' : 'fire-pump-sizing.js testleri GECTI'));
process.exit(fail ? 1 : 0);
