// shelter-ventilation.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/shelter-ventilation.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Kişi başı taze hava: Q = kişi_sayısı × kişi_başı_m³h
chk('freshAirRequired({kisi_sayisi:100, kisi_basi_m3h:30}) == 3000',
    S.freshAirRequired({kisi_sayisi:100, kisi_basi_m3h:30}) === 3000);
chk('freshAirRequired({kisi_sayisi:50, kisi_basi_m3h:40}) == 2000',
    S.freshAirRequired({kisi_sayisi:50, kisi_basi_m3h:40}) === 2000);

// 2) ACH bazlı hacim hesabı: Q = V × ACH
chk('achFromVolume({V_m3:500, ach:6}) == 3000',
    S.achFromVolume({V_m3:500, ach:6}) === 3000);
chk('achFromVolume({V_m3:1000, ach:4}) == 4000',
    S.achFromVolume({V_m3:1000, ach:4}) === 4000);

// 3) Fan seçimi yardımcısı: m³/h → m³/s
chk('fanSelect(3600) == 1.0',
    near(S.fanSelect(3600), 1.0, 0.0001));
chk('fanSelect(3000) ~= 0.833',
    near(S.fanSelect(3000), 0.8333, 0.001));

// 4) Varsayılan değer kontrol
chk('DEFAULT_PERSON_M3H = 30', S.DEFAULT_PERSON_M3H === 30);

// 5) Geçersiz girdi → NaN (güvenli):
chk('freshAirRequired(NaN) -> NaN', Number.isNaN(S.freshAirRequired(NaN)));
chk('freshAirRequired({kisi_sayisi:NaN, kisi_basi_m3h:30}) -> NaN',
    Number.isNaN(S.freshAirRequired({kisi_sayisi:NaN, kisi_basi_m3h:30})));
chk('freshAirRequired({kisi_sayisi:-5, kisi_basi_m3h:30}) -> NaN',
    Number.isNaN(S.freshAirRequired({kisi_sayisi:-5, kisi_basi_m3h:30})));
chk('freshAirRequired({}) -> NaN',
    Number.isNaN(S.freshAirRequired({})));

chk('achFromVolume(NaN) -> NaN', Number.isNaN(S.achFromVolume(NaN)));
chk('achFromVolume({V_m3:NaN, ach:6}) -> NaN',
    Number.isNaN(S.achFromVolume({V_m3:NaN, ach:6})));
chk('achFromVolume({V_m3:-100, ach:6}) -> NaN',
    Number.isNaN(S.achFromVolume({V_m3:-100, ach:6})));

chk('fanSelect(NaN) -> NaN', Number.isNaN(S.fanSelect(NaN)));
chk('fanSelect(-100) -> NaN', Number.isNaN(S.fanSelect(-100)));

R('\n' + (fail ? fail + ' KALDI' : 'shelter-ventilation.js testleri GECTI'));
process.exit(fail ? 1 : 0);
