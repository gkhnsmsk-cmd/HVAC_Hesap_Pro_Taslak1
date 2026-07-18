// seismic-hanger.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/seismic-hanger.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Sismik yatay kuvvet: W_kg=100, Sds=1.0, Ip=1.5
// Fp = 0.4 * 1.0 * 1.5 * 100 = 60 kg-force
const f1 = S.seismicLoad({ W_kg: 100, Sds: 1.0, Ip: 1.5 });
chk('seismicLoad({W_kg:100, Sds:1.0, Ip:1.5}) == 60', f1 === 60);

// 2) Farklı kütlenin sismik yükü: W_kg=250, Sds=0.8, Ip=1.0
// Fp = 0.4 * 0.8 * 1.0 * 250 = 80 kg-force
const f2 = S.seismicLoad({ W_kg: 250, Sds: 0.8, Ip: 1.0 });
chk('seismicLoad({W_kg:250, Sds:0.8, Ip:1.0}) == 80', f2 === 80);

// 3) Yüksek önem katsayısı: W_kg=50, Sds=1.2, Ip=2.0
// Fp = 0.4 * 1.2 * 2.0 * 50 = 48 kg-force
const f3 = S.seismicLoad({ W_kg: 50, Sds: 1.2, Ip: 2.0 });
chk('seismicLoad({W_kg:50, Sds:1.2, Ip:2.0}) == 48', f3 === 48);

// 4) Geçersiz girdi: negatif kütlenin -> NaN
chk('seismicLoad({W_kg:-100, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: -100, Sds: 1.0, Ip: 1.5 })));

// 5) Geçersiz girdi: negatif Sds -> NaN
chk('seismicLoad({Sds:-0.5, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 100, Sds: -0.5, Ip: 1.5 })));

// 6) Geçersiz girdi: negatif Ip -> NaN
chk('seismicLoad({Ip:-1.0, ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 100, Sds: 1.0, Ip: -1.0 })));

// 7) Geçersiz girdi: null/undefined -> NaN
chk('seismicLoad(null) -> NaN', Number.isNaN(S.seismicLoad(null)));
chk('seismicLoad({}) -> NaN', Number.isNaN(S.seismicLoad({})));

// 8) Geçersiz girdi: string değeri -> NaN (coerce başarısız)
chk('seismicLoad({W_kg:"abc", ...}) -> NaN', Number.isNaN(S.seismicLoad({ W_kg: 'abc', Sds: 1.0, Ip: 1.5 })));

// 9) Sonlu sayı kontrolü
chk('seismicLoad(valid) sonlu', isFinite(f1));
chk('seismicLoad(valid) sonlu', isFinite(f2));

// 10) Sıfır kütlesi (geçerli): W_kg=0 -> Fp=0
const f4 = S.seismicLoad({ W_kg: 0, Sds: 1.0, Ip: 1.5 });
chk('seismicLoad({W_kg:0, ...}) == 0', f4 === 0);

// ── seismicLoadASCE7: TAM ASCE7-22/TBDY2018 formülü (ap/Rp/yükseklik dahil) ──
// Fp = 0.4*ap*Sds*Ip*Wp/Rp * (1+2z/h), sınır: [0.3*Sds*Ip*Wp, 1.6*Sds*Ip*Wp]

// 11) Orta yükseklik (z/h=0.5), tipik değerler
// Fp = 0.4*1.0*1.0*1.0*1000/2.5 * (1+2*0.5) = 160*2 = 320
// Sınırlar: min=0.3*1*1*1000=300, max=1.6*1*1*1000=1600 -> 320 sınır içinde
const g1 = S.seismicLoadASCE7({ W_kg: 1000, Sds: 1.0, Ip: 1.0, ap: 1.0, Rp: 2.5, z_m: 6, h_m: 12 });
chk('seismicLoadASCE7 orta yükseklik (z/h=0.5) == 320', near(g1, 320, 0.5));

// 12) Taban seviyesi (z=0) -> Fp_min'e yakın/eşit olmalı (ratio=0 -> Fp=0.4*ap*Sds*Ip*Wp/Rp)
// Fp_ham = 0.4*1.0*1.0*1.0*1000/2.5 * 1 = 160 -> Fp_min=300'e KIRPILIR
const g2 = S.seismicLoadASCE7({ W_kg: 1000, Sds: 1.0, Ip: 1.0, ap: 1.0, Rp: 2.5, z_m: 0, h_m: 12 });
chk('seismicLoadASCE7 taban (z=0) alt sınıra (300) kırpılıyor', near(g2, 300, 0.5));

// 13) Çatı seviyesi (z=h) -> Fp = 0.4*ap*Sds*Ip*Wp/Rp * 3
// Esnek bileşen (ap=2.5, Rp=2.5): Fp_ham = 0.4*2.5*1.0*1.0*1000/2.5*3 = 400*3=1200 -> max=1600 sınırı içinde
const g3 = S.seismicLoadASCE7({ W_kg: 1000, Sds: 1.0, Ip: 1.0, ap: 2.5, Rp: 2.5, z_m: 12, h_m: 12 });
chk('seismicLoadASCE7 çatı (z=h), esnek bileşen == 1200', near(g3, 1200, 0.5));

// 14) z_m > h_m (geçersiz geometri) -> otomatik 1.0'a kırpılır, NaN DEĞİL (çatı ile aynı sonuç)
const g4 = S.seismicLoadASCE7({ W_kg: 1000, Sds: 1.0, Ip: 1.0, ap: 2.5, Rp: 2.5, z_m: 20, h_m: 12 });
chk('seismicLoadASCE7 z_m>h_m -> z/h=1.0 kırpması ile çatı sonucuna eşit', near(g4, g3, 0.01));

// 15) Geçersiz girdi: Rp<=0, ap<=0, h_m<=0, Ip<=0 -> NaN
chk('seismicLoadASCE7 Rp=0 -> NaN', Number.isNaN(S.seismicLoadASCE7({ W_kg: 1000, Sds: 1, Ip: 1, ap: 1, Rp: 0, z_m: 1, h_m: 12 })));
chk('seismicLoadASCE7 ap=0 -> NaN', Number.isNaN(S.seismicLoadASCE7({ W_kg: 1000, Sds: 1, Ip: 1, ap: 0, Rp: 2.5, z_m: 1, h_m: 12 })));
chk('seismicLoadASCE7 h_m=0 -> NaN', Number.isNaN(S.seismicLoadASCE7({ W_kg: 1000, Sds: 1, Ip: 1, ap: 1, Rp: 2.5, z_m: 1, h_m: 0 })));
chk('seismicLoadASCE7 Ip=0 -> NaN', Number.isNaN(S.seismicLoadASCE7({ W_kg: 1000, Sds: 1, Ip: 0, ap: 1, Rp: 2.5, z_m: 1, h_m: 12 })));

// 16) Eksik/null girdi -> NaN
chk('seismicLoadASCE7(null) -> NaN', Number.isNaN(S.seismicLoadASCE7(null)));
chk('seismicLoadASCE7({}) -> NaN', Number.isNaN(S.seismicLoadASCE7({})));

// 17) Eski basit fonksiyon (seismicLoad) hâlâ mevcut ve değişmemiş (geriye dönük uyumluluk)
chk('seismicLoad (eski, basit) hâlâ çalışıyor: 60', S.seismicLoad({ W_kg: 100, Sds: 1.0, Ip: 1.5 }) === 60);

R('\n' + (fail ? fail + ' KALDI' : 'seismic-hanger.js testleri GECTI'));
process.exit(fail ? 1 : 0);
