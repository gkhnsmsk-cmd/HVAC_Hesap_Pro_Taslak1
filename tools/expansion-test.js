// expansion-tank.js icin headless test (Modul-Test tarzi).
const E = require('../HVAC_Pro_v8/js/expansion-tank.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: V_sistem=1000, e=0.0359, Pmax=3, Pon=1
//    Ve = 1000*0.0359 = 35.9 ; Vn = 35.9*(3+1)/(3-1) = 35.9*4/2 = 71.8
const r = E.nominalVolume({ V_sistem_L: 1000, e: 0.0359, Pmax_bar: 3, Pon_bar: 1 });
chk('Ve = 35.9 (±0.5)', near(r.Ve_L, 35.9, 0.5));
chk('Vn = 71.8 (±0.5)', near(r.Vn_L, 71.8, 0.5));
chk('Ve, Vn sonlu', isFinite(r.Ve_L) && isFinite(r.Vn_L));

// 2) Buyukluk mertebesi: daha yuksek Pmax farki -> daha kucuk tank.
const r2 = E.nominalVolume({ V_sistem_L: 1000, e: 0.0359, Pmax_bar: 5, Pon_bar: 1 });
chk('daha genis basinc farki -> daha kucuk Vn', r2.Vn_L < r.Vn_L);

// 3) Sifir bolme guvenli: Pmax == Pon -> Vn NaN, Ve yine hesaplanir.
const z = E.nominalVolume({ V_sistem_L: 1000, e: 0.0359, Pmax_bar: 2, Pon_bar: 2 });
chk('Pmax=Pon -> Vn NaN (guvenli)', Number.isNaN(z.Vn_L));
chk('Pmax=Pon -> Ve yine sonlu', near(z.Ve_L, 35.9, 0.5));

// 4) Negatif basinc farki guvenli.
const n = E.nominalVolume({ V_sistem_L: 1000, e: 0.0359, Pmax_bar: 1, Pon_bar: 3 });
chk('Pmax<Pon -> Vn NaN (guvenli)', Number.isNaN(n.Vn_L));

// 5) Guvenli girdi: gecersiz V -> NaN alanlar (patlamaz).
const bad = E.nominalVolume({ V_sistem_L: 'x', e: 0.0359, Pmax_bar: 3, Pon_bar: 1 });
chk('V gecersiz -> Ve NaN (guvenli)', Number.isNaN(bad.Ve_L));
const bad2 = E.nominalVolume({ V_sistem_L: -5, e: 0.0359, Pmax_bar: 3, Pon_bar: 1 });
chk('negatif V -> Ve NaN (guvenli)', Number.isNaN(bad2.Ve_L));
chk('opt yok -> patlamaz', (() => { try { E.nominalVolume(); return true; } catch (e) { return false; } })());

R('\n' + (fail ? fail + ' KALDI' : 'expansion-tank.js testleri GECTI'));
process.exit(fail ? 1 : 0);
