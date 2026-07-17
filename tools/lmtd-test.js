// lmtd.js icin headless test (Modul-Test tarzi).
const LMTD = require('../HVAC_Pro_v8/js/lmtd.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) LMTD temel formül test:
//    dT1=40, dT2=10
//    LMTD = (40 - 10) / ln(40/10) = 30 / ln(4) = 30 / 1.3863 ≈ 21.64
chk('lmtd dT1=40,dT2=10 ~= 21.64',
  near(LMTD.lmtd({
    dT1_C: 40,
    dT2_C: 10
  }), 21.64, 0.1));

// 2) LMTD limit durumu (dT1 == dT2):
//    dT1=20, dT2=20 -> LMTD=20 (limit)
chk('lmtd dT1=20,dT2=20 (limit) = 20',
  LMTD.lmtd({
    dT1_C: 20,
    dT2_C: 20
  }) === 20);

// 3) LMTD farklı değerler:
//    dT1=50, dT2=5
//    LMTD = (50 - 5) / ln(50/5) = 45 / ln(10) = 45 / 2.3026 ≈ 19.53
chk('lmtd dT1=50,dT2=5 ~= 19.53',
  near(LMTD.lmtd({
    dT1_C: 50,
    dT2_C: 5
  }), 19.53, 0.1));

// 4) RequiredArea temel test:
//    Q_W=50000 W, U_W_m2K=500 W/m²K, LMTD_C=21.6
//    A = 50000 / (500 * 21.6) = 50000 / 10800 ≈ 4.63 m²
chk('requiredArea Q=50000,U=500,LMTD=21.6 ~= 4.63',
  near(LMTD.requiredArea({
    Q_W: 50000,
    U_W_m2K: 500,
    LMTD_C: 21.6
  }), 4.63, 0.1));

// 5) RequiredArea başka realistik değerler:
//    Q_W=100000 W, U_W_m2K=1000 W/m²K, LMTD_C=20
//    A = 100000 / (1000 * 20) = 100000 / 20000 = 5 m²
chk('requiredArea Q=100000,U=1000,LMTD=20 = 5',
  near(LMTD.requiredArea({
    Q_W: 100000,
    U_W_m2K: 1000,
    LMTD_C: 20
  }), 5, 0.01));

// 6) RequiredArea sonlu ve pozitif olmalı:
chk('requiredArea sonlu pozitif sonuç',
  isFinite(LMTD.requiredArea({
    Q_W: 50000,
    U_W_m2K: 500,
    LMTD_C: 21.6
  })) && LMTD.requiredArea({
    Q_W: 50000,
    U_W_m2K: 500,
    LMTD_C: 21.6
  }) > 0);

// 7) Geçersiz LMTD girdileri -> NaN güvenli
chk('lmtd negatif dT1 -> NaN',
  !isFinite(LMTD.lmtd({
    dT1_C: -10,
    dT2_C: 10
  })));

chk('lmtd dT2=0 -> NaN',
  !isFinite(LMTD.lmtd({
    dT1_C: 40,
    dT2_C: 0
  })));

chk('lmtd NaN input -> NaN',
  !isFinite(LMTD.lmtd({
    dT1_C: NaN,
    dT2_C: 10
  })));

// 8) Geçersiz requiredArea girdileri -> NaN güvenli
chk('requiredArea negatif U -> NaN',
  !isFinite(LMTD.requiredArea({
    Q_W: 50000,
    U_W_m2K: -500,
    LMTD_C: 21.6
  })));

chk('requiredArea LMTD=0 -> NaN',
  !isFinite(LMTD.requiredArea({
    Q_W: 50000,
    U_W_m2K: 500,
    LMTD_C: 0
  })));

chk('requiredArea NaN input -> NaN',
  !isFinite(LMTD.requiredArea({
    Q_W: NaN,
    U_W_m2K: 500,
    LMTD_C: 21.6
  })));

// 9) Entegre test: LMTD ve requiredArea birlikte
var calc_lmtd = LMTD.lmtd({ dT1_C: 40, dT2_C: 10 });
var calc_area = LMTD.requiredArea({
  Q_W: 50000,
  U_W_m2K: 500,
  LMTD_C: calc_lmtd
});
chk('lmtd+requiredArea entegresi sonlu pozitif',
  isFinite(calc_area) && calc_area > 0);

R('\n' + (fail ? fail + ' KALDI' : 'lmtd.js testleri GECTI'));
process.exit(fail ? 1 : 0);
