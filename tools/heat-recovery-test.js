// heat-recovery.js icin headless test (Modul-Test tarzi).
const HR = require('../HVAC_Pro_v8/js/heat-recovery.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Sensible effectiveness test:
//    T_disaridan_C=-5, T_egzozdan_C=22, T_besleme_sonrasi_C=15
//    eff = (15 - (-5)) / (22 - (-5)) = 20 / 27 ≈ 0.7407
chk('sensibleEffectiveness T(in)=-5,T(ex)=22,T(out)=15 ~= 0.741',
  near(HR.sensibleEffectiveness({
    T_disaridan_C: -5,
    T_egzozdan_C: 22,
    T_besleme_sonrasi_C: 15
  }), 0.741, 0.01));

// 2) Geri kazanılan ısı: Q=3000 m3/h, eff=0.7, dT=27°C
//    kW = (3000/3600) * 1.2 * 1005 * 27 * 0.7 / 1000
//    = 0.8333 * 1.2 * 1005 * 27 * 0.7 / 1000 ≈ 19.1 kW
chk('recoveredHeat Q=3000 m3h,eff=0.7,dT=27 sonlu',
  isFinite(HR.recoveredHeat({
    Q_m3h: 3000,
    eff: 0.7,
    dT_C: 27
  })));
chk('recoveredHeat Q=3000 m3h,eff=0.7,dT=27 pozitif',
  HR.recoveredHeat({
    Q_m3h: 3000,
    eff: 0.7,
    dT_C: 27
  }) > 0);

// 3) Payda sıfır (T_egzozdan_C == T_disaridan_C) -> NaN güvenli
chk('sensibleEffectiveness payda=0 -> NaN',
  !isFinite(HR.sensibleEffectiveness({
    T_disaridan_C: 20,
    T_egzozdan_C: 20,
    T_besleme_sonrasi_C: 20
  })));

// 4) Geçersiz girdiler -> NaN güvenli
chk('sensibleEffectiveness NaN input -> NaN',
  !isFinite(HR.sensibleEffectiveness({
    T_disaridan_C: NaN,
    T_egzozdan_C: 22,
    T_besleme_sonrasi_C: 15
  })));
chk('recoveredHeat NaN input -> NaN',
  !isFinite(HR.recoveredHeat({
    Q_m3h: NaN,
    eff: 0.7,
    dT_C: 27
  })));

// 5) Constants
chk('DEFAULT_RHO = 1.2', HR.DEFAULT_RHO === 1.2);
chk('DEFAULT_CP = 1005', HR.DEFAULT_CP === 1005);

// 6) Override rho/cp test
chk('recoveredHeat custom rho=1.0',
  isFinite(HR.recoveredHeat({
    Q_m3h: 3000,
    eff: 0.7,
    dT_C: 27,
    rho: 1.0
  })));

R('\n' + (fail ? fail + ' KALDI' : 'heat-recovery.js testleri GECTI'));
process.exit(fail ? 1 : 0);
