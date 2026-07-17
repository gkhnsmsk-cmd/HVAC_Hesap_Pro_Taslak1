// noise-level-sum.js icin headless test (Modul-Test tarzi).
const NLS = require('../HVAC_Pro_v8/js/noise-level-sum.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel logaritmik toplama test:
//    İki eşit ses kaynağı: [50, 50] dB
//    Formül: L = 10 * log10(10^(50/10) + 10^(50/10))
//          = 10 * log10(10^5 + 10^5)
//          = 10 * log10(2 * 10^5)
//          = 10 * (5 + log10(2))
//          = 10 * (5 + 0.301)
//          ≈ 53.01 dB
chk('sumDecibels [50, 50] ≈ 53.0 (±0.1)',
  near(NLS.sumDecibels([50, 50]), 53.0, 0.1));

// 2) Tek kaynak test:
//    [45] dB -> 45 dB (kimlik)
chk('sumDecibels [45] === 45',
  NLS.sumDecibels([45]) === 45);

// 3) Boş dizi test: güvenli, 0 dB (sessizlik)
var emptyResult = NLS.sumDecibels([]);
chk('sumDecibels [] === 0 (boş dizi)',
  emptyResult === 0 && isFinite(emptyResult));

// 4) Null/undefined dizi test: güvenli, 0 dB
chk('sumDecibels null === 0',
  NLS.sumDecibels(null) === 0);

chk('sumDecibels undefined === 0',
  NLS.sumDecibels(undefined) === 0);

// 5) Geçersiz girdiler (NaN/Infinity) yoksay: fakat varsa sayılara çevir
//    [50, NaN, 50] -> iki geçerli, -> ~53 dB
chk('sumDecibels [50, NaN, 50] ≈ 53.0 (NaN yoksay)',
  near(NLS.sumDecibels([50, NaN, 50]), 53.0, 0.1));

// 6) Üç eşit kaynak: [50, 50, 50]
//    L = 10 * log10(3 * 10^5) = 10 * (5 + log10(3)) ≈ 10 * 5.477 ≈ 54.77
chk('sumDecibels [50, 50, 50] ≈ 54.8 (±0.1)',
  near(NLS.sumDecibels([50, 50, 50]), 54.8, 0.1));

// 7) nrMargin temel test:
//    L_toplam = 53 dB, hedef_NR = 40 dB
//    Fark = 53 - 40 = 13 dB (hedefi aşıyor)
chk('nrMargin {L_toplam_dB:53, hedef_NR_dB:40} === 13',
  NLS.nrMargin({L_toplam_dB: 53, hedef_NR_dB: 40}) === 13);

// 8) nrMargin negatif sonuç (hedefin altında, iyi):
//    L_toplam = 30 dB, hedef_NR = 40 dB
//    Fark = 30 - 40 = -10 dB (hedefin altında)
chk('nrMargin {L_toplam_dB:30, hedef_NR_dB:40} === -10',
  NLS.nrMargin({L_toplam_dB: 30, hedef_NR_dB: 40}) === -10);

// 9) nrMargin sıfır (hedefi tam karşılıyor):
//    L_toplam = 40 dB, hedef_NR = 40 dB
//    Fark = 0 dB
chk('nrMargin {L_toplam_dB:40, hedef_NR_dB:40} === 0',
  NLS.nrMargin({L_toplam_dB: 40, hedef_NR_dB: 40}) === 0);

// 10) nrMargin NaN girdisi güvenli:
chk('nrMargin {L_toplam_dB:NaN, hedef_NR_dB:40} -> NaN',
  !isFinite(NLS.nrMargin({L_toplam_dB: NaN, hedef_NR_dB: 40})));

chk('nrMargin {L_toplam_dB:53, hedef_NR_dB:NaN} -> NaN',
  !isFinite(NLS.nrMargin({L_toplam_dB: 53, hedef_NR_dB: NaN})));

// 11) nrMargin undefined opts:
chk('nrMargin undefined -> NaN',
  !isFinite(NLS.nrMargin(undefined)));

// 12) Tüm geçersiz girdilerle sumDecibels:
//    [NaN, NaN, undefined] -> 0 (hiç geçerli yok)
var allInvalidResult = NLS.sumDecibels([NaN, NaN, undefined]);
chk('sumDecibels [NaN, NaN, undefined] === 0 (tüm geçersiz)',
  allInvalidResult === 0 && isFinite(allInvalidResult));

R('\n' + (fail ? fail + ' KALDI' : 'noise-level-sum.js testleri GECTI'));
process.exit(fail ? 1 : 0);
