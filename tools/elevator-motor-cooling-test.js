// elevator-motor-cooling.js icin headless test.
const EMC = require('../HVAC_Pro_v8/js/elevator-motor-cooling.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: motor_kW=10, verim_yuzde=90, hedef_temp_artisi_K=10
//    Atilan_isi = 10 * (1 - 90/100) = 1 kW
//    Q = (1 * 1000 * 3600) / (1.2 * 1005 * 10) = 3600000 / 12060 ≈ 298.5 m³/h
const r1 = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc 10kW motor, 90% verim, 10K fark → ~300 m³/h (±5)', near(r1.debi_m3h, 300, 5));
chk('calc sonlu debi donder', isFinite(r1.debi_m3h));

// 2) Daha yüksek atılan ısı -> daha yüksek debi
const r2a = EMC.calc({ motor_kW: 10, verim_yuzde: 95, hedef_temp_artisi_K: 10 });
const r2b = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc: daha düşük verim -> daha yüksek debi', r2b.debi_m3h > r2a.debi_m3h);

// 3) Daha geniş sıcaklık farkı -> daha düşük debi gereksinimi
const r3a = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 5 });
const r3b = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc: büyük temp farkı -> düşük debi', r3a.debi_m3h > r3b.debi_m3h);

// 4) Daha yüksek motor gücü -> daha yüksek debi (sabit verim ve temp farkında)
const r4a = EMC.calc({ motor_kW: 5, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
const r4b = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc: yüksek motor gücü -> yüksek debi', r4b.debi_m3h > r4a.debi_m3h);

// 5) Sıfır atılan ısı (100% verim) -> sıfır debi
const r5 = EMC.calc({ motor_kW: 10, verim_yuzde: 100, hedef_temp_artisi_K: 10 });
chk('calc: 100% verim -> ~0 m³/h debi', near(r5.debi_m3h, 0, 1));

// 6) Güvenli girdi: motor_kW geçersiz -> NaN
const bad1 = EMC.calc({ motor_kW: 'x', verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc: motor_kW geçersiz -> NaN (güvenli)', Number.isNaN(bad1.debi_m3h));

// 7) Güvenli girdi: verim_yuzde geçersiz -> NaN
const bad2 = EMC.calc({ motor_kW: 10, verim_yuzde: 'bad', hedef_temp_artisi_K: 10 });
chk('calc: verim geçersiz -> NaN (güvenli)', Number.isNaN(bad2.debi_m3h));

// 8) Güvenli girdi: hedef_temp_artisi_K ≤ 0 -> NaN (bölme hatası)
const bad3 = EMC.calc({ motor_kW: 10, verim_yuzde: 90, hedef_temp_artisi_K: 0 });
chk('calc: temp farkı=0 -> NaN (güvenli)', Number.isNaN(bad3.debi_m3h));

// 9) Güvenli girdi: verim > 100 -> NaN (fiziksel değil)
const bad4 = EMC.calc({ motor_kW: 10, verim_yuzde: 110, hedef_temp_artisi_K: 10 });
chk('calc: verim>100 -> NaN (güvenli)', Number.isNaN(bad4.debi_m3h));

// 10) Güvenli girdi: negatif motor gücü -> NaN
const bad5 = EMC.calc({ motor_kW: -10, verim_yuzde: 90, hedef_temp_artisi_K: 10 });
chk('calc: negatif motor gücü -> NaN (güvenli)', Number.isNaN(bad5.debi_m3h));

// 11) Güvenli girdi: opt yok -> NaN (patlamaz)
const bad6 = EMC.calc();
chk('calc() -> NaN (güvenli)', Number.isNaN(bad6.debi_m3h));

// 12) Daha düşük motor gücü ve verim: motor_kW=5, verim=85, temp=10
//     Atilan = 5 * 0.15 = 0.75 kW
//     Q = (0.75 * 1000 * 3600) / 12060 ≈ 223.9 m³/h
const r6 = EMC.calc({ motor_kW: 5, verim_yuzde: 85, hedef_temp_artisi_K: 10 });
chk('calc: 5kW motor, 85% verim → ~224 m³/h (±10)', near(r6.debi_m3h, 224, 10));

R('\n' + (fail ? fail + ' KALDI' : 'elevator-motor-cooling.js testleri GECTI'));
process.exit(fail ? 1 : 0);
