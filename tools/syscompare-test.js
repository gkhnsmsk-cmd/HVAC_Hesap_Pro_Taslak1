// system-compare.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/system-compare.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: ilk_yatirim=100000, yillik_isletme=10000, omur_yil=10, faiz=0.1
//    af = (1-(1.1)^-10)/0.1 = 6.14457 ; NPV = 100000 + 10000*6.14457 = 161445.7
const n1 = S.npv({ ilk_yatirim: 100000, yillik_isletme: 10000, omur_yil: 10, faiz: 0.1 });
chk('npv ~= 161446 (±100)', near(n1, 161446, 100));

// 2) faiz == 0 -> limit annuite carpani = omur_yil.
//    NPV = 50000 + 5000*10 = 100000
const n0 = S.npv({ ilk_yatirim: 50000, yillik_isletme: 5000, omur_yil: 10, faiz: 0 });
chk('faiz=0 -> NPV = 100000 (±0.5)', near(n0, 100000, 0.5));

// 3) Gecersiz/eksik girdi -> NaN (patlamaz).
chk('gecersiz girdi -> NaN', Number.isNaN(S.npv({ ilk_yatirim: 'x', yillik_isletme: 1000, omur_yil: 10, faiz: 0.1 })));
chk('negatif omur -> NaN', Number.isNaN(S.npv({ ilk_yatirim: 1000, yillik_isletme: 100, omur_yil: -5, faiz: 0.1 })));
chk('opt yok -> patlamaz', (() => { try { S.npv(); return true; } catch (e) { return false; } })());

// 4) compare(): 2 sistem, dogru siralama + en dusuk NPV onerilen.
const cmp = S.compare([
  { ad: 'VRF', ilk_yatirim: 120000, yillik_isletme: 8000, omur_yil: 10, faiz: 0.1 },
  { ad: 'Chiller', ilk_yatirim: 100000, yillik_isletme: 10000, omur_yil: 10, faiz: 0.1 }
]);
chk('compare 2 sistem siralama uzunlugu 2', cmp.siralama.length === 2);
chk('compare siralama artan (npv[0] <= npv[1])', cmp.siralama[0].npv <= cmp.siralama[1].npv);
chk('compare sira alanlari 1,2', cmp.siralama[0].sira === 1 && cmp.siralama[1].sira === 2);
// VRF NPV = 120000+8000*6.14457 = 169156.6 ; Chiller NPV = 100000+10000*6.14457 = 161445.7 -> Chiller daha dusuk.
chk('compare onerilen en dusuk NPV sistemi (Chiller)', cmp.onerilen === 'Chiller');

// 5) compare(): gecersiz sistem sona atilir, onerilmez.
const cmpBad = S.compare([
  { ad: 'Gecerli', ilk_yatirim: 100000, yillik_isletme: 10000, omur_yil: 10, faiz: 0.1 },
  { ad: 'Bozuk', ilk_yatirim: 'x', yillik_isletme: 10000, omur_yil: 10, faiz: 0.1 }
]);
chk('gecersiz sistem sona atilir', cmpBad.siralama[1].ad === 'Bozuk');
chk('gecersiz sistem onerilmez', cmpBad.onerilen === 'Gecerli');

// 6) compare(): dizi degilse guvenli bos sonuc.
const cmpEmpty = S.compare(null);
chk('dizi degilse siralama bos', Array.isArray(cmpEmpty.siralama) && cmpEmpty.siralama.length === 0);
chk('dizi degilse onerilen null', cmpEmpty.onerilen === null);

R('\n' + (fail ? fail + ' KALDI' : 'system-compare.js testleri GECTI'));
process.exit(fail ? 1 : 0);
