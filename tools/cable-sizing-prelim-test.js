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
// 7) Örnek: I=16A, L=50m, kesit=6mm2, direnc=3.08 Ω/km, V=400V
//    R = (3.08/1000)*50*2 = 0.0308*100 = 0.308 Ω
//    dV = 16*0.308 = 4.928 V
//    dV% = (4.928/400)*100 = 1.232%
//    Varsayılan limit %5 -> uygun=true
const V1 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('dV_V pozitif ve sonlu', isFinite(V1.dV_V) && V1.dV_V > 0);
chk('dV_yuzde ~1.23 (±0.1)', near(V1.dV_yuzde, 1.23, 0.1));
chk('dV_yuzde < %5 limit -> uygun=true', V1.uygun === true);

// 8) Uzun hattında büyük düşüş: I=20A, L=200m, kesit=2.5mm2, direnc=7.0, V=230V
//    R = (7.0/1000)*200*2 = 0.007*400 = 2.8 Ω
//    dV = 20*2.8 = 56 V
//    dV% = (56/230)*100 = 24.35% >> %5 limit
const V2 = C.voltageDropCheck({ I_A: 20, L_m: 200, kesit_mm2: 2.5, iletken_direnc_ohm_km: 7.0, V: 230 });
chk('Büyük düşüş dV_yuzde>%5 -> uygun=false', V2.uygun === false);
chk('dV_yuzde yaklaşık 24.35 (±0.5)', near(V2.dV_yuzde, 24.35, 0.5));

// 9) Özel limit: dV% = 3.14% (varsayılan %5'ten bağımsız), limit=%2 -> uygun=false
const V3 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400, limit_yuzde: 2 });
chk('limit_yuzde=%2 ile dV~1.23% -> uygun=true', V3.uygun === true);

// 10) Özel limit: dV% = 3.14% limit=%1 -> uygun=false
const V4 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400, limit_yuzde: 1.0 });
chk('limit_yuzde=%1.0 ile dV~1.23% -> uygun=false', V4.uygun === false);

// 11) Eksik zorunlu girdi: I_A eksik -> dV_V NaN.
const V5 = C.voltageDropCheck({ L_m: 50, kesit_mm2: 6, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('I_A eksik -> dV_V NaN (guvenli)', Number.isNaN(V5.dV_V));

// 12) Sifir kesit -> patlamaz, NaN.
const V6 = C.voltageDropCheck({ I_A: 16, L_m: 50, kesit_mm2: 0, iletken_direnc_ohm_km: 3.08, V: 400 });
chk('kesit_mm2=0 -> dV_V NaN (guvenli)', Number.isNaN(V6.dV_V));

// 13) opt yok -> patlamaz.
chk('voltageDropCheck() arg yok -> patlamaz', (() => { try { C.voltageDropCheck(); return true; } catch (e) { return false; } })());
chk('loadCurrent() arg yok -> patlamaz', (() => { try { C.loadCurrent(); return true; } catch (e) { return false; } })());

R('\n' + (fail ? fail + ' KALDI' : 'cable-sizing-prelim.js testleri GECTI'));
process.exit(fail ? 1 : 0);
