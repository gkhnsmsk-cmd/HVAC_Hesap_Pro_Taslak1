// pipe-thermal-expansion.js icin headless test (Modul-Test tarzi).
const PE = require('../HVAC_Pro_v8/js/pipe-thermal-expansion.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) linearExpansion test: L_m=50, alpha_per_C=0.000012, dT_C=60
//    dL_mm = 50 * 0.000012 * 60 * 1000 = 50 * 0.000012 * 60000 = 36 mm
chk('linearExpansion L=50m,alpha=0.000012,dT=60 ~= 36 mm',
  near(PE.linearExpansion({
    L_m: 50,
    alpha_per_C: 0.000012,
    dT_C: 60
  }), 36, 0.1));

// 2) linearExpansion sonli ve pozitif
var le = PE.linearExpansion({
  L_m: 50,
  alpha_per_C: 0.000012,
  dT_C: 60
});
chk('linearExpansion sonlu',
  isFinite(le));
chk('linearExpansion pozitif',
  le > 0);

// 3) loopLength test: makul degerleri (dL_mm=36, D_mm=50, E_MPa=200000, sigma_allow_MPa=140)
//    Lb_mm = sqrt(3 * 200000 * 50 * 36 / 140) = sqrt(3 * 200000 * 50 * 36 / 140)
//    = sqrt(1,542,857,143) ~ 39,280 mm (makul, beslemeli)
var ll = PE.loopLength({
  dL_mm: 36,
  D_mm: 50,
  E_MPa: 200000,
  sigma_allow_MPa: 140
});
chk('loopLength sonlu',
  isFinite(ll));
chk('loopLength pozitif',
  ll > 0);

// 4) Geçersiz girdiler -> NaN güvenli
chk('linearExpansion NaN input (L_m=NaN) -> NaN',
  !isFinite(PE.linearExpansion({
    L_m: NaN,
    alpha_per_C: 0.000012,
    dT_C: 60
  })));
chk('linearExpansion NaN input (alpha_per_C=NaN) -> NaN',
  !isFinite(PE.linearExpansion({
    L_m: 50,
    alpha_per_C: NaN,
    dT_C: 60
  })));
chk('linearExpansion NaN input (dT_C=NaN) -> NaN',
  !isFinite(PE.linearExpansion({
    L_m: 50,
    alpha_per_C: 0.000012,
    dT_C: NaN
  })));

chk('loopLength NaN input (dL_mm=NaN) -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: NaN,
    D_mm: 50,
    E_MPa: 200000,
    sigma_allow_MPa: 140
  })));
chk('loopLength NaN input (D_mm=NaN) -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: 36,
    D_mm: NaN,
    E_MPa: 200000,
    sigma_allow_MPa: 140
  })));
chk('loopLength NaN input (E_MPa=NaN) -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: 36,
    D_mm: 50,
    E_MPa: NaN,
    sigma_allow_MPa: 140
  })));
chk('loopLength NaN input (sigma_allow_MPa=NaN) -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: 36,
    D_mm: 50,
    E_MPa: 200000,
    sigma_allow_MPa: NaN
  })));

// 5) Sıfır/negatif sigma -> NaN güvenli
chk('loopLength sigma_allow_MPa=0 -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: 36,
    D_mm: 50,
    E_MPa: 200000,
    sigma_allow_MPa: 0
  })));
chk('loopLength sigma_allow_MPa=-50 -> NaN',
  !isFinite(PE.loopLength({
    dL_mm: 36,
    D_mm: 50,
    E_MPa: 200000,
    sigma_allow_MPa: -50
  })));

R('\n' + (fail ? fail + ' KALDI' : 'pipe-thermal-expansion.js testleri GECTI'));
process.exit(fail ? 1 : 0);
