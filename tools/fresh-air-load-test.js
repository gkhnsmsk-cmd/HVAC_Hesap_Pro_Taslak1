// fresh-air-load.js icin headless test (Modul-Test tarzi).
const FAL = require('../HVAC_Pro_v8/js/fresh-air-load.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel hesaplama: debi_m3h=1000, T_dis_C=35, T_ic_C=24, x_dis_g_kg=18, x_ic_g_kg=10
//    Elle hesapla:
//    debi_kg_s = (1000/3600) * 1.2 = 0.3333... kg/s
//    Q_duyulur = 0.3333... * 1.005 * (35-24) = 0.3333... * 1.005 * 11 = 3.685 kW
//    Q_gizli = 0.3333... * 2500 * (18-10) / 1000 = 0.3333... * 2500 * 8 / 1000 = 6.667 kW
//    Q_toplam = 3.685 + 6.667 = 10.352 kW
const r1 = FAL.calc({ debi_m3h: 1000, T_dis_C: 35, T_ic_C: 24, x_dis_g_kg: 18, x_ic_g_kg: 10 });
chk('calc Q_duyulur ≈ 3.685 (±0.1)', near(r1.Q_duyulur_kW, 3.685, 0.1));
chk('calc Q_gizli ≈ 6.667 (±0.1)', near(r1.Q_gizli_kW, 6.667, 0.1));
chk('calc Q_toplam ≈ 10.352 (±0.1)', near(r1.Q_toplam_kW, 10.352, 0.1));
chk('calc tum alanlar sonlu', isFinite(r1.Q_duyulur_kW) && isFinite(r1.Q_gizli_kW) && isFinite(r1.Q_toplam_kW));

// 2) Yalniz duyulur yuk: nem degerleri verilmemisse Q_gizli = 0
const r2 = FAL.calc({ debi_m3h: 1000, T_dis_C: 35, T_ic_C: 24 });
chk('calc nem degerleri yok -> Q_gizli = 0', r2.Q_gizli_kW === 0);
chk('calc Q_duyulur yine 3.685 (±0.1)', near(r2.Q_duyulur_kW, 3.685, 0.1));
chk('calc Q_toplam = Q_duyulur', near(r2.Q_toplam_kW, r2.Q_duyulur_kW, 0.001));

// 3) Negatif degisim (sogutma): T_ic > T_dis
const r3 = FAL.calc({ debi_m3h: 1000, T_dis_C: 24, T_ic_C: 35 });
chk('calc T_ic > T_dis -> Q_duyulur negatif', r3.Q_duyulur_kW < 0);

// 4) Negatif yuk degisimi (nem kaybi): x_ic > x_dis
const r4 = FAL.calc({ debi_m3h: 1000, T_dis_C: 35, T_ic_C: 24, x_dis_g_kg: 10, x_ic_g_kg: 18 });
chk('calc x_ic > x_dis -> Q_gizli negatif', r4.Q_gizli_kW < 0);
chk('calc Q_toplam okadar dusuk', r4.Q_toplam_kW < r4.Q_duyulur_kW);

// 5) Guvenli girdi: gecersiz debi -> NaN
const bad1 = FAL.calc({ debi_m3h: 'x', T_dis_C: 35, T_ic_C: 24 });
chk('calc debi gecersiz -> NaN (guvenli)', Number.isNaN(bad1.Q_duyulur_kW) && Number.isNaN(bad1.Q_gizli_kW) && Number.isNaN(bad1.Q_toplam_kW));

// 6) Guvenli girdi: eksik zorunlu alan (T_dis yok) -> NaN
const bad2 = FAL.calc({ debi_m3h: 1000, T_ic_C: 24 });
chk('calc T_dis eksik -> NaN (guvenli)', Number.isNaN(bad2.Q_duyulur_kW) && Number.isNaN(bad2.Q_gizli_kW) && Number.isNaN(bad2.Q_toplam_kW));

// 7) Guvenli girdi: eksik zorunlu alan (T_ic yok) -> NaN
const bad3 = FAL.calc({ debi_m3h: 1000, T_dis_C: 35 });
chk('calc T_ic eksik -> NaN (guvenli)', Number.isNaN(bad3.Q_duyulur_kW) && Number.isNaN(bad3.Q_gizli_kW) && Number.isNaN(bad3.Q_toplam_kW));

// 8) Guvenli girdi: opt yok -> NaN (patlamaz)
const bad4 = FAL.calc();
chk('calc() -> NaN (guvenli)', Number.isNaN(bad4.Q_duyulur_kW) && Number.isNaN(bad4.Q_gizli_kW) && Number.isNaN(bad4.Q_toplam_kW));

// 9) Guvenli girdi: negatif debi (fiziksel anlamsiz ama matematik olarak islenebilir)
const r5 = FAL.calc({ debi_m3h: -1000, T_dis_C: 35, T_ic_C: 24 });
chk('calc negatif debi islenebilir', isFinite(r5.Q_duyulur_kW) && isFinite(r5.Q_gizli_kW) && isFinite(r5.Q_toplam_kW));

// 10) Guvenli girdi: sadece x_dis verilip x_ic yok -> Q_gizli = 0 (OPSİYONEL eksikse)
const r6 = FAL.calc({ debi_m3h: 1000, T_dis_C: 35, T_ic_C: 24, x_dis_g_kg: 18 });
chk('calc x_ic yok -> Q_gizli = 0', r6.Q_gizli_kW === 0);

R('\n' + (fail ? fail + ' KALDI' : 'fresh-air-load.js testleri GECTI'));
process.exit(fail ? 1 : 0);
