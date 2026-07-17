// uvalue-engine.js icin headless test (Modul-Test tarzi).
const U = require('../HVAC_Pro_v8/js/uvalue-engine.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Iki katmanli duvar:
//    d=0.20 lambda=0.50 -> R=0.40 ; d=0.05 lambda=0.035 -> R=1.4286
//    Rsi=0.13 Rse=0.04 -> R_top = 0.13+0.40+1.42857+0.04 = 2.0  -> U=0.50
const wall = [{ d_m: 0.20, lambda: 0.50 }, { d_m: 0.05, lambda: 0.035 }];
chk('2 katmanli duvar R ~= 2.0', near(U.rTotal(wall, 0.13, 0.04), 2.0, 0.01));
chk('2 katmanli duvar U ~= 0.50', near(U.uValue(wall, 0.13, 0.04), 0.50, 0.01));

// 2) Varsayilan Rsi/Rse (verilmezse duvar 0.13/0.04) ayni sonucu vermeli.
chk('varsayilan Rsi/Rse duvar U ~= 0.50', near(U.uValue(wall), 0.50, 0.01));
chk('DEFAULT_RSI=0.13', U.DEFAULT_RSI === 0.13);
chk('DEFAULT_RSE=0.04', U.DEFAULT_RSE === 0.04);

// 3) Tek katman kontrol: d=0.10 lambda=0.04 -> R=2.5 ; +0.13+0.04 = 2.67 -> U=0.375
const single = [{ d_m: 0.10, lambda: 0.04 }];
chk('tek katman R ~= 2.67', near(U.rTotal(single), 2.67, 0.01));
chk('tek katman U ~= 0.375', near(U.uValue(single), 0.375, 0.005));

// 4) NaN / negatif / bozuk girdi -> guvenli (tabaka atlanir), yalniz yuzey direnci kalir.
//    Bos/atlanan tabakalar -> R = Rsi+Rse = 0.17 -> U ~= 5.882
chk('NaN lambda -> guvenli (atlanir)', near(U.uValue([{ d_m: 0.1, lambda: NaN }]), 5.882, 0.01));
chk('negatif kalinlik -> guvenli (atlanir)', near(U.uValue([{ d_m: -0.1, lambda: 0.04 }]), 5.882, 0.01));
chk('sifir lambda -> guvenli (atlanir)', near(U.uValue([{ d_m: 0.1, lambda: 0 }]), 5.882, 0.01));
chk('bos dizi -> yalniz yuzey direnci', near(U.rTotal([]), 0.17, 0.001));
chk('layers null -> NaN dondurmez, sonlu', isFinite(U.rTotal(null)));

R('\n' + (fail ? fail + ' KALDI' : 'uvalue-engine.js testleri GECTI'));
process.exit(fail ? 1 : 0);
