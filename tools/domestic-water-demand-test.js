// domestic-water-demand.js icin headless test.
const DWD = require('../HVAC_Pro_v8/js/domestic-water-demand.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: gunluk_ortalama_debi_m3gun=24, pik_katsayisi=3, calisma_saati=10
//    Pik_debi_m3h = (24 * 3) / 10 = 72 / 10 = 7.2 m³/h
//    Hidrofor_tank = 7.2 * (15/60) * 0.25 = 7.2 * 0.25 * 0.25 = 0.45 m³
const r1 = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10, pompa_devre_dakika: 15 });
chk('calc 24 m³/gün × 3 / 10h → Pik 7.2 m³/h (±0.01)', near(r1.Pik_debi_m3h, 7.2, 0.01));
chk('calc Pik 7.2 × 0.25 dakika × 0.25 marj → Hidrofor 0.45 m³ (±0.01)', near(r1.Hidrofor_tank_hacmi_m3, 0.45, 0.01));
chk('calc sonlu pik debi donder', isFinite(r1.Pik_debi_m3h));
chk('calc sonlu tank hacmi donder', isFinite(r1.Hidrofor_tank_hacmi_m3));

// 2) Varsayılan parametreler: pik_katsayisi=3, calisma_saati=10, pompa_devre_dakika=15
const r2a = DWD.calc({ gunluk_ortalama_debi_m3gun: 24 });
const r2b = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10, pompa_devre_dakika: 15 });
chk('calc: varsayılan parametreler uygulanır', Math.abs(r2a.Pik_debi_m3h - r2b.Pik_debi_m3h) < 0.01);
chk('calc: varsayılan tank hacmi uygulanır', Math.abs(r2a.Hidrofor_tank_hacmi_m3 - r2b.Hidrofor_tank_hacmi_m3) < 0.01);

// 3) Daha yüksek pik katsayısı -> daha yüksek pik debi
const r3a = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 2, calisma_saati: 10 });
const r3b = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10 });
chk('calc: yüksek pik katsayısı -> yüksek pik debi', r3b.Pik_debi_m3h > r3a.Pik_debi_m3h);

// 4) Daha düşük çalışma saati -> daha yüksek pik debi (ters oran)
const r4a = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10 });
const r4b = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 8 });
chk('calc: düşük çalışma saati -> yüksek pik debi', r4b.Pik_debi_m3h > r4a.Pik_debi_m3h);

// 5) Daha yüksek pompa devre zamanı -> daha yüksek tank hacmi
const r5a = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10, pompa_devre_dakika: 10 });
const r5b = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10, pompa_devre_dakika: 15 });
chk('calc: yüksek devre zamanı -> yüksek tank hacmi', r5b.Hidrofor_tank_hacmi_m3 > r5a.Hidrofor_tank_hacmi_m3);

// 6) Sıfır günlük debi -> sıfır pik debi ve tank hacmi
const r6 = DWD.calc({ gunluk_ortalama_debi_m3gun: 0, pik_katsayisi: 3, calisma_saati: 10 });
chk('calc: 0 m³/gün → 0 pik debi', near(r6.Pik_debi_m3h, 0, 0.01));
chk('calc: 0 m³/gün → 0 tank hacmi', near(r6.Hidrofor_tank_hacmi_m3, 0, 0.01));

// 7) Güvenli girdi: gunluk_ortalama_debi_m3gun geçersiz -> NaN
const bad1 = DWD.calc({ gunluk_ortalama_debi_m3gun: 'x', pik_katsayisi: 3, calisma_saati: 10 });
chk('calc: günlük debi geçersiz -> NaN (güvenli)', Number.isNaN(bad1.Pik_debi_m3h));
chk('calc: günlük debi geçersiz -> tank NaN (güvenli)', Number.isNaN(bad1.Hidrofor_tank_hacmi_m3));

// 8) Güvenli girdi: pik_katsayisi geçersiz -> NaN
const bad2 = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 'bad', calisma_saati: 10 });
chk('calc: pik katsayısı geçersiz -> NaN (güvenli)', Number.isNaN(bad2.Pik_debi_m3h));

// 9) Güvenli girdi: negatif günlük debi -> NaN
const bad3 = DWD.calc({ gunluk_ortalama_debi_m3gun: -24, pik_katsayisi: 3, calisma_saati: 10 });
chk('calc: negatif günlük debi -> NaN (güvenli)', Number.isNaN(bad3.Pik_debi_m3h));

// 10) Güvenli girdi: negatif/sıfır pik_katsayisi -> NaN
const bad4 = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 0, calisma_saati: 10 });
chk('calc: pik katsayısı=0 -> NaN (güvenli)', Number.isNaN(bad4.Pik_debi_m3h));

// 11) Güvenli girdi: negatif/sıfır calisma_saati -> NaN
const bad5 = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 0 });
chk('calc: çalışma saati=0 -> NaN (güvenli)', Number.isNaN(bad5.Pik_debi_m3h));

// 12) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad6 = DWD.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad6.Pik_debi_m3h));

// 13) Konut örneği: 48 m³/gün, 2 katsayı, 12 saat
//     Pik = (48 * 2) / 12 = 8 m³/h
const r7 = DWD.calc({ gunluk_ortalama_debi_m3gun: 48, pik_katsayisi: 2, calisma_saati: 12, pompa_devre_dakika: 15 });
chk('calc: 48 m³/gün × 2 / 12h → 8 m³/h (±0.1)', near(r7.Pik_debi_m3h, 8, 0.1));

// 14) Negatif pompa devre zamanı -> NaN
const bad7 = DWD.calc({ gunluk_ortalama_debi_m3gun: 24, pik_katsayisi: 3, calisma_saati: 10, pompa_devre_dakika: -5 });
chk('calc: negatif devre zamanı -> NaN (güvenli)', Number.isNaN(bad7.Hidrofor_tank_hacmi_m3));

R('\n' + (fail ? fail + ' KALDI' : 'domestic-water-demand.js testleri GECTI'));
process.exit(fail ? 1 : 0);
