// pipe-insulation-loss.js icin headless test (Modul-Test tarzi).
const PIL = require('../HVAC_Pro_v8/js/pipe-insulation-loss.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) lossPerMeter temel formül test:
//    T_i_C=80, T_o_C=20, r1_m=0.02, r2_m=0.05, k_W_mK=0.04
//    q = 2*π*0.04*(80-20)/ln(0.05/0.02) = 2*π*0.04*60/ln(2.5)
//    q ≈ 15.0796 / 0.9163 ≈ 16.44 W/m
chk('lossPerMeter T_i=80,T_o=20,r1=0.02,r2=0.05,k=0.04 ~= 16.44',
  near(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  }), 16.44, 0.1));

// 2) lossPerMeter farklı sıcaklık farkı:
//    T_i_C=90, T_o_C=10, r1_m=0.02, r2_m=0.05, k_W_mK=0.04
//    q = 2*π*0.04*80/ln(2.5) ≈ 21.94 W/m
chk('lossPerMeter T_i=90,T_o=10 ~= 21.94',
  near(PIL.lossPerMeter({
    T_i_C: 90,
    T_o_C: 10,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  }), 21.94, 0.1));

// 3) lossPerMeter düşük k değeri (daha iyi yalıtım):
//    T_i_C=80, T_o_C=20, r1_m=0.02, r2_m=0.05, k_W_mK=0.025
//    q = 2*π*0.025*60/ln(2.5) ≈ 10.28 W/m
chk('lossPerMeter k=0.025 (iyi yalitim) ~= 10.28',
  near(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.025
  }), 10.28, 0.1));

// 4) lossPerMeter yüksek k değeri (kötü yalıtım):
//    T_i_C=80, T_o_C=20, r1_m=0.02, r2_m=0.05, k_W_mK=0.08
//    q = 2*π*0.08*60/ln(2.5) ≈ 32.89 W/m
chk('lossPerMeter k=0.08 (kotu yalitim) ~= 32.89',
  near(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.08
  }), 32.89, 0.1));

// 5) totalLoss temel test:
//    q_W_m=16.44, L_m=100 -> Q = 1644 W
chk('totalLoss q=16.44,L=100 = 1644',
  near(PIL.totalLoss({
    q_W_m: 16.44,
    L_m: 100
  }), 1644, 1));

// 6) totalLoss başka örnek:
//    q_W_m=10.28, L_m=50 -> Q = 514 W
chk('totalLoss q=10.28,L=50 = 514',
  near(PIL.totalLoss({
    q_W_m: 10.28,
    L_m: 50
  }), 514, 1));

// 7) lossPerMeter sonlu pozitif olmalı:
chk('lossPerMeter sonlu pozitif sonuç',
  isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  })) && PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  }) > 0);

// 8) totalLoss sonlu olmalı:
chk('totalLoss sonlu sonuç',
  isFinite(PIL.totalLoss({
    q_W_m: 16.44,
    L_m: 100
  })));

// 9) Geçersiz lossPerMeter girdileri -> NaN güvenli
chk('lossPerMeter r2 <= r1 -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.05,
    r2_m: 0.02,
    k_W_mK: 0.04
  })));

chk('lossPerMeter r2 == r1 -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.03,
    r2_m: 0.03,
    k_W_mK: 0.04
  })));

// 10) Geçersiz lossPerMeter girdileri: k <= 0
chk('lossPerMeter k <= 0 -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0
  })));

chk('lossPerMeter k negatif -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: -0.04
  })));

// 11) Geçersiz lossPerMeter girdileri: NaN parametreler
chk('lossPerMeter NaN T_i_C -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: NaN,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  })));

chk('lossPerMeter NaN T_o_C -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: NaN,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  })));

chk('lossPerMeter NaN r1_m -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: NaN,
    r2_m: 0.05,
    k_W_mK: 0.04
  })));

chk('lossPerMeter NaN r2_m -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: NaN,
    k_W_mK: 0.04
  })));

chk('lossPerMeter NaN k_W_mK -> NaN',
  !isFinite(PIL.lossPerMeter({
    T_i_C: 80,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: NaN
  })));

// 12) Geçersiz totalLoss girdileri -> NaN güvenli
chk('totalLoss NaN q_W_m -> NaN',
  !isFinite(PIL.totalLoss({
    q_W_m: NaN,
    L_m: 100
  })));

chk('totalLoss NaN L_m -> NaN',
  !isFinite(PIL.totalLoss({
    q_W_m: 16.44,
    L_m: NaN
  })));

// 13) Geçersiz totalLoss: sonsuz değerler
chk('totalLoss sonsuz q_W_m -> NaN',
  !isFinite(PIL.totalLoss({
    q_W_m: Infinity,
    L_m: 100
  })));

chk('totalLoss sonsuz L_m -> NaN',
  !isFinite(PIL.totalLoss({
    q_W_m: 16.44,
    L_m: Infinity
  })));

// 14) Entegre test: lossPerMeter ve totalLoss birlikte
var calc_q = PIL.lossPerMeter({
  T_i_C: 80,
  T_o_C: 20,
  r1_m: 0.02,
  r2_m: 0.05,
  k_W_mK: 0.04
});
var calc_Q = PIL.totalLoss({
  q_W_m: calc_q,
  L_m: 100
});
chk('lossPerMeter+totalLoss entegresi (calc_q * 100 ile doğrulama)',
  isFinite(calc_Q) && calc_Q > 0 && near(calc_Q, calc_q * 100, 0.5));

// 15) Sıfır sıcaklık farkı:
//    T_i_C=20, T_o_C=20 -> q = 0
chk('lossPerMeter sifir sicaklik farki = 0',
  PIL.lossPerMeter({
    T_i_C: 20,
    T_o_C: 20,
    r1_m: 0.02,
    r2_m: 0.05,
    k_W_mK: 0.04
  }) === 0);

// 16) Opsiyonel opt parametresi yok -> NaN güvenli
chk('lossPerMeter() -> NaN (guvenli)',
  (() => { try { return Number.isNaN(PIL.lossPerMeter()); } catch (e) { return false; } })());

R('\n' + (fail ? fail + ' KALDI' : 'pipe-insulation-loss.js testleri GECTI'));
process.exit(fail ? 1 : 0);
