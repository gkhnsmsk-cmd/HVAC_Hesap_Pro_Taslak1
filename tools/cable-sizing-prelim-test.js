// cable-sizing-prelim.js icin headless test (Modül-Test tarzi).
const C = require('../HVAC_Pro_v8/js/cable-sizing-prelim.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// --- loadCurrent testleri ---
// 1) 3-faz, bilinen değer: P=10kW, V=400V, cosPhi=0.9, faz=3
//    I = (10*1000) / (sqrt(3)*400*0.9) = 10000 / (1.732*360) = 10000/623.52 ~= 16.04A
const I1 = C.loadCurrent({ P_kW: 10, V: 400, cosPhi: 0.9, faz: 3 });
chk('3-faz 10kW@400V,cosPhi=0.9 -> I~=16.04A (±0.1)', near(I1, 16.04, 0.1));
chk('3-faz sonuç sonlu', isFinite(I1));

// 2) 1-faz: P=2.3kW, V=230V, cosPhi=0.95, faz=1
//    I = (2.3*1000) / (230*0.95) = 2300/218.5 ~= 10.53A
const I2 = C.loadCurrent({ P_kW: 2.3, V: 230, cosPhi: 0.95, faz: 1 });
chk('1-faz 2.3kW@230V,cosPhi=0.95 -> I~=10.53A (±0.1)', near(I2, 10.53, 0.1));

// 3) V eksik -> NaN (zorunlu girdi).
const I3 = C.loadCurrent({ P_kW: 10, cosPhi: 0.9, faz: 3 });
chk('V eksik -> NaN (guvenli)', Number.isNaN(I3));

// 4) cosPhi eksik -> NaN (zorunlu girdi).
const I4 = C.loadCurrent({ P_kW: 10, V: 400, faz: 3 });
chk('cosPhi eksik -> NaN (guvenli)', Number.isNaN(I4));

// 5) Negatif güç -> NaN.
const I5 = C.loadCurrent({ P_kW: -5, V: 400, cosPhi: 0.9, faz: 3 });
chk('P_kW negatif -> NaN (guvenli)', Number.isNaN(I5));

// 6) Geçersiz faz -> NaN.
const I6 = C.loadCurrent({ P_kW: 10, V: 400, cosPhi: 0.9, faz: 2 });
chk('faz=2 (geçersiz) -> NaN (guvenli)', Number.isNaN(I6));

// --- voltageDropCheck testleri ---
// DÜZELTME (kritik bug fix): eski formülde kesit_mm2 hesaba hiç
// katılmıyordu (R=rho*L*2, /kesit eksikti). Aşağıdaki beklenen
// değerler DOĞRU formülle (R=rho*L*2/kesit) yeniden hesaplandı.
//
// 7) Örnek: I=16A, L=50m, kesit=6mm2, direnc=3.08 Ω·mm²/km, V=400V
//    R = (3.08/1000)*50*2/6 = 0.308/6 = 0.051333 Ω
//    dV = 16*0.051333 = 0.821333 V
//    dV% = (0.821333/400)*100 = 0.20533%
//    Varsayılan limit %5 -> uygun=true
const V1 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('dV_V pozitif ve sonlu', isFinite(V1.dV_V) && V1.dV_V > 0);
chk('dV_yuzde ~0.205 (±0.01)', near(V1.dV_yuzde, 0.20533, 0.01));
chk('dV_yuzde < %5 limit -> uygun=true', V1.uygun === true);

// 8) Uzun hat, küçük kesit: I=20A, L=200m, kesit=2.5mm2, direnc=7.0, V=230V
//    R = (7.0/1000)*200*2/2.5 = 2.8/2.5 = 1.12 Ω
//    dV = 20*1.12 = 22.4 V
//    dV% = (22.4/230)*100 = 9.7391% > %5 limit
const V2 = C.voltageDropCheck({ I_A: 20, L_m: 200, kesit_mm2: 2.5, iletken_direnc_ohm_km: 7.0, V: 230 });
chk('Büyük düşüş dV_yuzde>%5 -> uygun=false', V2.uygun === false);
chk('dV_yuzde yaklaşık 9.7391 (±0.05)', near(V2.dV_yuzde, 9.7391, 0.05));

// 9) KRİTİK REGRESYON TESTİ: Aynı akım/uzunluk/direnç, SADECE kesit
//    büyütülürse (6mm2 -> 16mm2) gerilim düşümü AZALMALI (eski bug'da
//    değişmiyordu — bu test bugün tekrar edip etmediğini yakalar).
const Vsmall = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400 });
const Vbig = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 16, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('REGRESYON: büyük kesit (16mm2) küçük kesitten (6mm2) DAHA DÜŞÜK dV vermeli', Vbig.dV_V < Vsmall.dV_V);
chk('REGRESYON: kesit 6->16 oranıyla dV ters orantılı (6/16 ~= 0.375)', near(Vbig.dV_V / Vsmall.dV_V, 6 / 16, 0.001));

// 10) Özel limit: aynı vaka (dV~0.205%), limit=%0.1 -> uygun=false
const V4 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400, limit_yuzde: 0.1 });
chk('limit_yuzde=%0.1 ile dV~0.205% -> uygun=false', V4.uygun === false);

// 11) Eksik zorunlu girdi: I_A eksik -> dV_V NaN.
const V5 = C.voltageDropCheck({ L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('I_A eksik -> dV_V NaN (guvenli)', Number.isNaN(V5.dV_V));

// 12) Sifir kesit -> patlamaz, NaN.
const V6 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 0, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('kesit_mm2=0 -> dV_V NaN (guvenli)', Number.isNaN(V6.dV_V));

// 13) opt yok -> patlamaz.
chk('voltageDropCheck() arg yok -> patlamaz', (() => { try { C.voltageDropCheck(); return true; } catch (e) { return false; } })());
chk('loadCurrent() arg yok -> patlamaz', (() => { try { C.loadCurrent(); return true; } catch (e) { return false; } })());

// --- ampacityCheck testleri (YENİ — IEC 60364-5-52 derating) ---
// 14) Temel: I=25A, baseAmpacity=32A, k1=0.94 (35°C), k2=0.8 (4 kablo grubu)
//     I_izin = 32*0.94*0.8 = 24.064 -> I=25 > 24.064 -> uygun=false
const A1 = C.ampacityCheck({ I_A: 25, baseAmpacity_A: 32, k1_sicaklik: 0.94, k2_gruplama: 0.8 });
chk('ampacityCheck I_izin_A ~= 24.06', near(A1.I_izin_A, 24.06, 0.01));
chk('ampacityCheck I=25 > I_izin=24.06 -> uygun=false', A1.uygun === false);

// 15) Derating olmadan (k1=k2=1) yeterli kapasite
const A2 = C.ampacityCheck({ I_A: 25, baseAmpacity_A: 32, k1_sicaklik: 1.0, k2_gruplama: 1.0 });
chk('ampacityCheck k1=k2=1 -> I_izin=32, uygun=true', A2.I_izin_A === 32 && A2.uygun === true);

// 16) asim_orani doğru hesaplanmalı
chk('ampacityCheck asim_orani = I/I_izin', near(A1.asim_orani, 25 / 24.064, 0.01));

// 17) Geçersiz girdi -> uygun=null, NaN
const A3 = C.ampacityCheck({ I_A: 25, baseAmpacity_A: 0, k1_sicaklik: 1, k2_gruplama: 1 });
chk('ampacityCheck baseAmpacity=0 -> uygun=null', A3.uygun === null && Number.isNaN(A3.I_izin_A));
const A4 = C.ampacityCheck({ I_A: 25, baseAmpacity_A: 32, k1_sicaklik: 0, k2_gruplama: 1 });
chk('ampacityCheck k1=0 -> uygun=null', A4.uygun === null);
const A5 = C.ampacityCheck({});
chk('ampacityCheck({}) -> uygun=null', A5.uygun === null);

R('\n' + (fail ? fail + ' KALDI' : 'cable-sizing-prelim.js testleri GECTI'));
process.exit(fail ? 1 : 0);
