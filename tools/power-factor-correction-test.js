// power-factor-correction.js icin headless test (Modul-Test tarzi).
const PFC = require('../HVAC_Pro_v8/js/power-factor-correction.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) capacitorPower: Bilinen vaka
//    P_kW=100, cosPhi1=0.75, cosPhi2=0.95
//    tanPhi1 = tan(acos(0.75)) = tan(41.41°) ≈ 0.8819
//    tanPhi2 = tan(acos(0.95)) = tan(18.19°) ≈ 0.3287
//    Qc_kVAR = 100 * (0.8819 - 0.3287) ≈ 55.32 kVAR
const r1 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 0.75, cosPhi2: 0.95 });
chk('capacitorPower P=100, cosPhi1=0.75, cosPhi2=0.95 ≈ 55.3 (±1)', near(r1, 55.3, 1));

// 2) newApparentPower: Bilinen vaka
//    P_kW=100, cosPhi2=0.95
//    S_kVA = 100 / 0.95 ≈ 105.26 kVA
const r2 = PFC.newApparentPower({ P_kW: 100, cosPhi2: 0.95 });
chk('newApparentPower P=100, cosPhi2=0.95 ≈ 105.26 (±0.1)', near(r2, 105.26, 0.1));

// 3) capacitorPower cosPhi1 <= 0 -> NaN (guvenli)
const bad1 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 0, cosPhi2: 0.95 });
chk('capacitorPower cosPhi1=0 -> NaN (guvenli)', Number.isNaN(bad1));

// 4) capacitorPower cosPhi1 < 0 -> NaN (guvenli)
const bad2 = PFC.capacitorPower({ P_kW: 100, cosPhi1: -0.5, cosPhi2: 0.95 });
chk('capacitorPower cosPhi1=-0.5 -> NaN (guvenli)', Number.isNaN(bad2));

// 5) capacitorPower cosPhi1 > 1 -> NaN (guvenli)
const bad3 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 1.5, cosPhi2: 0.95 });
chk('capacitorPower cosPhi1=1.5 -> NaN (guvenli)', Number.isNaN(bad3));

// 6) capacitorPower cosPhi2 <= 0 -> NaN (guvenli)
const bad4 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 0.75, cosPhi2: 0 });
chk('capacitorPower cosPhi2=0 -> NaN (guvenli)', Number.isNaN(bad4));

// 7) capacitorPower cosPhi2 > 1 -> NaN (guvenli)
const bad5 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 0.75, cosPhi2: 1.2 });
chk('capacitorPower cosPhi2=1.2 -> NaN (guvenli)', Number.isNaN(bad5));

// 8) capacitorPower P_kW yok -> NaN (guvenli)
const bad6 = PFC.capacitorPower({ cosPhi1: 0.75, cosPhi2: 0.95 });
chk('capacitorPower P_kW yok -> NaN (guvenli)', Number.isNaN(bad6));

// 9) capacitorPower cosPhi1 NaN -> NaN (guvenli)
const bad7 = PFC.capacitorPower({ P_kW: 100, cosPhi1: NaN, cosPhi2: 0.95 });
chk('capacitorPower cosPhi1=NaN -> NaN (guvenli)', Number.isNaN(bad7));

// 10) capacitorPower cosPhi2 NaN -> NaN (guvenli)
const bad8 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 0.75, cosPhi2: NaN });
chk('capacitorPower cosPhi2=NaN -> NaN (guvenli)', Number.isNaN(bad8));

// 11) newApparentPower cosPhi2 <= 0 -> NaN (guvenli)
const bad9 = PFC.newApparentPower({ P_kW: 100, cosPhi2: 0 });
chk('newApparentPower cosPhi2=0 -> NaN (guvenli)', Number.isNaN(bad9));

// 12) newApparentPower cosPhi2 > 1 -> NaN (guvenli)
const bad10 = PFC.newApparentPower({ P_kW: 100, cosPhi2: 1.1 });
chk('newApparentPower cosPhi2=1.1 -> NaN (guvenli)', Number.isNaN(bad10));

// 13) newApparentPower P_kW yok -> NaN (guvenli)
const bad11 = PFC.newApparentPower({ cosPhi2: 0.95 });
chk('newApparentPower P_kW yok -> NaN (guvenli)', Number.isNaN(bad11));

// 14) newApparentPower cosPhi2 NaN -> NaN (guvenli)
const bad12 = PFC.newApparentPower({ P_kW: 100, cosPhi2: NaN });
chk('newApparentPower cosPhi2=NaN -> NaN (guvenli)', Number.isNaN(bad12));

// 15) capacitorPower P_kW < 0 -> NaN (guvenli)
const bad13 = PFC.capacitorPower({ P_kW: -100, cosPhi1: 0.75, cosPhi2: 0.95 });
chk('capacitorPower P_kW=-100 -> NaN (guvenli)', Number.isNaN(bad13));

// 16) newApparentPower P_kW < 0 -> NaN (guvenli)
const bad14 = PFC.newApparentPower({ P_kW: -100, cosPhi2: 0.95 });
chk('newApparentPower P_kW=-100 -> NaN (guvenli)', Number.isNaN(bad14));

// 17) capacitorPower cosPhi1 = 1 (mükemmel güç faktörü) -> Qc
const r3 = PFC.capacitorPower({ P_kW: 100, cosPhi1: 1, cosPhi2: 0.95 });
chk('capacitorPower cosPhi1=1 -> sonuc istenebilir', isFinite(r3));

// 18) newApparentPower cosPhi2 = 1 (mükemmel güç faktörü) -> S = P
const r4 = PFC.newApparentPower({ P_kW: 100, cosPhi2: 1 });
chk('newApparentPower cosPhi2=1 -> S=P=100', near(r4, 100, 0.01));

// 19) newApparentPower gecersiz girdi turu (string) -> NaN (guvenli)
const bad15 = PFC.newApparentPower({ P_kW: 'abc', cosPhi2: 0.95 });
chk('newApparentPower P_kW="abc" -> NaN (guvenli)', Number.isNaN(bad15));

// 20) capacitorPower opt yok -> NaN (guvenli)
const bad16 = PFC.capacitorPower();
chk('capacitorPower() -> NaN (guvenli)', Number.isNaN(bad16));

R('\n' + (fail ? fail + ' KALDI' : 'power-factor-correction.js testleri GECTI'));
process.exit(fail ? 1 : 0);
