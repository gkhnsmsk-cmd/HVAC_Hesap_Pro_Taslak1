// staircase-pressurization.js icin headless test.
const SP = require('../HVAC_Pro_v8/js/staircase-pressurization.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: sizinti_alani_m2=0.01 m², hedef_basinc_farkiPa=50 Pa, hava_yogunluk=1.2
//    v = 0.83 * sqrt(2*50/1.2) = 0.83 * sqrt(83.33) = 0.83 * 9.128 ≈ 7.577 m/s
//    Q = 0.01 * 7.577 * 3.6 ≈ 0.273 m³/h
const r1 = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50, hava_yogunluk: 1.2 });
chk('calc hızı 50 Pa ile ≈0.27 m³/h (±0.05)', near(r1.debi_m3h, 0.27, 0.05));
chk('calc sonlu debi donder', isFinite(r1.debi_m3h));

// 2) Daha büyük basınç farkı -> daha yüksek debi
const r2a = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50 });
const r2b = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 100 });
chk('calc: yüksek basınç -> yüksek debi', r2b.debi_m3h > r2a.debi_m3h);

// 3) Daha büyük kaçak alanı -> doğru orantılı debi
const r3a = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50 });
const r3b = SP.calc({ sizinti_alani_m2: 0.02, hedef_basinc_farkiPa: 50 });
chk('calc: büyük alan -> daha yüksek debi', r3b.debi_m3h > r3a.debi_m3h);

// 4) Varsayılan hava_yogunluk (1.2 kg/m³)
const r4a = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50 });
const r4b = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50, hava_yogunluk: 1.2 });
chk('calc: varsayılan yoğunluk = 1.2 kg/m³', Math.abs(r4a.debi_m3h - r4b.debi_m3h) < 0.01);

// 5) Sıfır basınç farkı -> sıfır debi
const r5 = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 0 });
chk('calc: 0 Pa basınç farkı -> ~0 m³/h', near(r5.debi_m3h, 0, 0.01));

// 6) Güvenli girdi: sizinti_alani_m2 geçersiz -> NaN
const bad1 = SP.calc({ sizinti_alani_m2: 'x', hedef_basinc_farkiPa: 50 });
chk('calc: alan geçersiz -> NaN (güvenli)', Number.isNaN(bad1.debi_m3h));

// 7) Güvenli girdi: hedef_basinc_farkiPa geçersiz -> NaN
const bad2 = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 'invalid' });
chk('calc: basınç geçersiz -> NaN (güvenli)', Number.isNaN(bad2.debi_m3h));

// 8) Güvenli girdi: hava_yogunluk ≤ 0 -> NaN (bölme hatası)
const bad3 = SP.calc({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50, hava_yogunluk: 0 });
chk('calc: yoğunluk=0 -> NaN (güvenli)', Number.isNaN(bad3.debi_m3h));

// 9) Güvenli girdi: negatif alan -> NaN
const bad4 = SP.calc({ sizinti_alani_m2: -0.01, hedef_basinc_farkiPa: 50 });
chk('calc: negatif alan -> NaN (güvenli)', Number.isNaN(bad4.debi_m3h));

// 10) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad5 = SP.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad5.debi_m3h));

// 11) Büyük alan örneği: sizinti_alani_m2=0.1 m², hedef_basinc_farkiPa=100 Pa
const r6 = SP.calc({ sizinti_alani_m2: 0.1, hedef_basinc_farkiPa: 100 });
chk('calc: 0.1 m² × 100 Pa → sonuç > 2 m³/h', r6.debi_m3h > 2);

// ── openDoorFlow / designFlow (YENİ — açık kapı senaryosu) ──
// 12) openDoorFlow: kapi_alani_m2=1.6 (tek kanat kapı), min_hiz_ms=1.0
//     Q = 1.6*1.0*3600 = 5760 m³/h
const od12 = SP.openDoorFlow({ kapi_alani_m2: 1.6, min_hiz_ms: 1.0 });
chk('openDoorFlow 1.6m² x 1.0m/s == 5760 m³/h', near(od12.debi_m3h, 5760, 1));

// 13) openDoorFlow geçersiz girdi -> NaN
chk('openDoorFlow alan<=0 -> NaN', Number.isNaN(SP.openDoorFlow({ kapi_alani_m2: 0, min_hiz_ms: 1 }).debi_m3h));
chk('openDoorFlow hiz<=0 -> NaN', Number.isNaN(SP.openDoorFlow({ kapi_alani_m2: 1.6, min_hiz_ms: 0 }).debi_m3h));

// 14) designFlow: açık kapı senaryosu (5760) >> kapalı kapı (0.27) -> baskın 'acik' olmalı
const df14 = SP.designFlow({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50, kapi_alani_m2: 1.6, min_hiz_ms: 1.0 });
chk('designFlow baskın senaryo = acik (gerçekçi vaka)', df14.gov_senaryo === 'acik');
chk('designFlow tasarim_debi = max(kapali,acik) ≈ 5760', near(df14.tasarim_debi_m3h, 5760, 1));
chk('designFlow her iki bileşeni de rapor ediyor', isFinite(df14.kapali_kapi_debi_m3h) && isFinite(df14.acik_kapi_debi_m3h));

// 15) designFlow: sadece kapalı-kapı girdisi verilirse (açık kapı verisi yok) -> kapali baskın, acik=NaN
const df15 = SP.designFlow({ sizinti_alani_m2: 0.01, hedef_basinc_farkiPa: 50 });
chk('designFlow açık kapı verisi yoksa gov=kapali', df15.gov_senaryo === 'kapali');
chk('designFlow açık kapı verisi yoksa acik_kapi_debi=NaN', Number.isNaN(df15.acik_kapi_debi_m3h));

// 16) designFlow: hiçbir girdi yok -> tamamen NaN, patlamaz
const df16 = SP.designFlow();
chk('designFlow() hiçbir girdi -> tasarim_debi NaN', Number.isNaN(df16.tasarim_debi_m3h));
chk('designFlow() hiçbir girdi -> gov_senaryo null', df16.gov_senaryo === null);

R('\n' + (fail ? fail + ' KALDI' : 'staircase-pressurization.js testleri GECTI'));
process.exit(fail ? 1 : 0);
