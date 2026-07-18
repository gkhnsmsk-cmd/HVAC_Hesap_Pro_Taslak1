// kitchen-hood.js icin headless test.
const KH = require('../HVAC_Pro_v8/js/kitchen-hood.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: alanM2=10, izgara_eni_m=2.5, hava_hizi_ms=1.0, cikmaDugume=2
//    A_grill = 2.5 * 2 = 5 m²
//    Q = 5 * 1.0 * 3600 = 18000 m³/h
const r1 = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc 18000 m³/h (±100)', near(r1.debi_m3h, 18000, 100));
chk('calc sonlu debi donder', isFinite(r1.debi_m3h));

// 2) Varsayılan cikmaDugume = 2
const r2a = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0 });
const r2b = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: varsayılan cikmaDugume = 2', Math.abs(r2a.debi_m3h - r2b.debi_m3h) < 1);

// 3) Daha yüksek hava hızı -> daha yüksek debi
const r3a = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 0.5, cikmaDugume: 2 });
const r3b = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: yüksek hava hızı -> yüksek debi', r3b.debi_m3h > r3a.debi_m3h);

// 4) Daha geniş izgara -> daha yüksek debi
const r4a = KH.calc({ alanM2: 10, izgara_eni_m: 2.0, hava_hizi_ms: 1.0, cikmaDugume: 2 });
const r4b = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: geniş izgara -> yüksek debi', r4b.debi_m3h > r4a.debi_m3h);

// 5) Daha derin çıkma düğümü -> daha yüksek debi
const r5a = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 1 });
const r5b = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: derin çıkma -> yüksek debi', r5b.debi_m3h > r5a.debi_m3h);

// 6) Sıfır hava hızı -> sıfır debi
const r6 = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 0, cikmaDugume: 2 });
chk('calc: 0 m/s hava hızı -> 0 m³/h debi', near(r6.debi_m3h, 0, 1));

// 7) Güvenli girdi: alanM2 geçersiz -> NaN
const bad1 = KH.calc({ alanM2: 'x', izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: alan geçersiz -> NaN (güvenli)', Number.isNaN(bad1.debi_m3h));

// 8) Güvenli girdi: izgara_eni_m geçersiz -> NaN
const bad2 = KH.calc({ alanM2: 10, izgara_eni_m: 'invalid', hava_hizi_ms: 1.0, cikmaDugume: 2 });
chk('calc: izgara genişliği geçersiz -> NaN (güvenli)', Number.isNaN(bad2.debi_m3h));

// 9) Güvenli girdi: hava_hizi_ms geçersiz -> NaN
const bad3 = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 'bad', cikmaDugume: 2 });
chk('calc: hava hızı geçersiz -> NaN (güvenli)', Number.isNaN(bad3.debi_m3h));

// 10) Güvenli girdi: cikmaDugume ≤ 0 -> NaN
const bad4 = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 0 });
chk('calc: çıkma=0 -> NaN (güvenli)', Number.isNaN(bad4.debi_m3h));

// 11) Güvenli girdi: negatif hava hızı -> NaN
const bad5 = KH.calc({ alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: -1.0, cikmaDugume: 2 });
chk('calc: negatif hava hızı -> NaN (güvenli)', Number.isNaN(bad5.debi_m3h));

// 12) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad6 = KH.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad6.debi_m3h));

// 13) Küçük değerler: alanM2=1, izgara_eni_m=0.5, hava_hizi_ms=0.1, cikmaDugume=2
//     A_grill = 0.5 * 2 = 1 m²
//     Q = 1 * 0.1 * 3600 = 360 m³/h
const r7 = KH.calc({ alanM2: 1, izgara_eni_m: 0.5, hava_hizi_ms: 0.1, cikmaDugume: 2 });
chk('calc: küçük değerler → 360 m³/h (±10)', near(r7.debi_m3h, 360, 10));

// ── deviceConvectiveLoad / deviceBasedFlow / captureEfficiencyAdjust / combinedFlow (YENİ) ──
// 12) deviceConvectiveLoad: 3 cihaz, toplam yük
const dcl12 = KH.deviceConvectiveLoad({ cihazlar: [{ Q_conv_kW: 5 }, { Q_conv_kW: 3.5 }, { Q_conv_kW: 2 }] });
chk('deviceConvectiveLoad 5+3.5+2 == 10.5', near(dcl12, 10.5, 0.001));

// 13) deviceConvectiveLoad: boş/geçersiz -> NaN
chk('deviceConvectiveLoad([]) -> NaN', Number.isNaN(KH.deviceConvectiveLoad({ cihazlar: [] })));
chk('deviceConvectiveLoad negatif yük -> NaN', Number.isNaN(KH.deviceConvectiveLoad({ cihazlar: [{ Q_conv_kW: -1 }] })));

// 14) deviceBasedFlow: 10.5 kW x 250 m3h/kW = 2625 m3h
const dbf14 = KH.deviceBasedFlow({ toplam_Q_conv_kW: 10.5, k_katsayi_m3h_kW: 250 });
chk('deviceBasedFlow 10.5kW x 250 == 2625 m3h', near(dbf14, 2625, 1));

// 15) deviceBasedFlow geçersiz k -> NaN
chk('deviceBasedFlow k<=0 -> NaN', Number.isNaN(KH.deviceBasedFlow({ toplam_Q_conv_kW: 10.5, k_katsayi_m3h_kW: 0 })));

// 16) captureEfficiencyAdjust: 2625 / 0.75 = 3500
const cea16 = KH.captureEfficiencyAdjust({ V_gerekli_m3h: 2625, yakalama_verimi: 0.75 });
chk('captureEfficiencyAdjust 2625/0.75 == 3500', near(cea16, 3500, 1));

// 17) captureEfficiencyAdjust geçersiz verim (0, >1) -> NaN
chk('captureEfficiencyAdjust verim=0 -> NaN', Number.isNaN(KH.captureEfficiencyAdjust({ V_gerekli_m3h: 2625, yakalama_verimi: 0 })));
chk('captureEfficiencyAdjust verim=1.5 -> NaN', Number.isNaN(KH.captureEfficiencyAdjust({ V_gerekli_m3h: 2625, yakalama_verimi: 1.5 })));

// 18) combinedFlow: iki yöntem karşılaştırılıyor, büyük olan seçilmeli
// izgara yöntemi: alanM2=10, izgara_eni_m=2.5, hava_hizi_ms=1.0, cikmaDugume=2 -> 18000 m3h
// cihaz yöntemi: toplam_Q_conv_kW=10.5, k=250, verim=0.75 -> 2625/0.75=3500 m3h
// izgara (18000) >> cihaz (3500) -> gov='izgara'
const cf18 = KH.combinedFlow({
  alanM2: 10, izgara_eni_m: 2.5, hava_hizi_ms: 1.0, cikmaDugume: 2,
  toplam_Q_conv_kW: 10.5, k_katsayi_m3h_kW: 250, yakalama_verimi: 0.75
});
chk('combinedFlow izgara ve cihaz debilerini raporluyor', isFinite(cf18.izgara_debi_m3h) && isFinite(cf18.cihaz_debi_m3h));
chk('combinedFlow tasarim_debi = max(izgara,cihaz) == 18000', near(cf18.tasarim_debi_m3h, 18000, 1));
chk('combinedFlow gov_yontem = izgara', cf18.gov_yontem === 'izgara');

// 19) combinedFlow: sadece cihaz verisi varsa gov='cihaz'
const cf19 = KH.combinedFlow({ toplam_Q_conv_kW: 10.5, k_katsayi_m3h_kW: 250, yakalama_verimi: 0.75 });
chk('combinedFlow sadece cihaz verisi -> gov=cihaz', cf19.gov_yontem === 'cihaz');
chk('combinedFlow sadece cihaz verisi -> izgara_debi=NaN', Number.isNaN(cf19.izgara_debi_m3h));

// 20) combinedFlow: hiçbir girdi yok -> tamamen NaN, patlamaz
const cf20 = KH.combinedFlow();
chk('combinedFlow() hiçbir girdi -> tasarim_debi NaN', Number.isNaN(cf20.tasarim_debi_m3h));
chk('combinedFlow() hiçbir girdi -> gov_yontem null', cf20.gov_yontem === null);

R('\n' + (fail ? fail + ' KALDI' : 'kitchen-hood.js testleri GECTI'));
process.exit(fail ? 1 : 0);
