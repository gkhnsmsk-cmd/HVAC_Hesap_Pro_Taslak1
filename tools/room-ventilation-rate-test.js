// room-ventilation-rate.js icin headless test (Modul-Test tarzi).
const R = require('../HVAC_Pro_v8/js/room-ventilation-rate.js');
const W = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { W((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };

// 1) ACH bazlı hacim hesabı: Q = V × ACH
chk('byACH({V_m3:200, ach:4}) == 800',
    R.byACH({V_m3:200, ach:4}) === 800);
chk('byACH({V_m3:500, ach:6}) == 3000',
    R.byACH({V_m3:500, ach:6}) === 3000);

// 2) Kişi başı taze hava: Q = kişi_sayısı × kişi_başı_m³h
chk('byOccupancy({kisi_sayisi:20, kisi_basi_m3h:36}) == 720',
    R.byOccupancy({kisi_sayisi:20, kisi_basi_m3h:36}) === 720);
chk('byOccupancy({kisi_sayisi:50, kisi_basi_m3h:40}) == 2000',
    R.byOccupancy({kisi_sayisi:50, kisi_basi_m3h:40}) === 2000);

// 3) Karşılaştırma: hangisinin büyük olduğu
chk('compare({Q_ach_m3h:800, Q_occupancy_m3h:720}).buyuk_olan == "ach"',
    R.compare({Q_ach_m3h:800, Q_occupancy_m3h:720}).buyuk_olan === 'ach');
chk('compare({Q_ach_m3h:500, Q_occupancy_m3h:900}).buyuk_olan == "occupancy"',
    R.compare({Q_ach_m3h:500, Q_occupancy_m3h:900}).buyuk_olan === 'occupancy');
chk('compare({Q_ach_m3h:600, Q_occupancy_m3h:600}).buyuk_olan == "esit"',
    R.compare({Q_ach_m3h:600, Q_occupancy_m3h:600}).buyuk_olan === 'esit');

// 4) Geçersiz girdi → NaN (güvenli):
chk('byACH(NaN) -> NaN', Number.isNaN(R.byACH(NaN)));
chk('byACH({V_m3:NaN, ach:4}) -> NaN',
    Number.isNaN(R.byACH({V_m3:NaN, ach:4})));
chk('byACH({V_m3:-100, ach:4}) -> NaN',
    Number.isNaN(R.byACH({V_m3:-100, ach:4})));
chk('byACH({}) -> NaN',
    Number.isNaN(R.byACH({})));

chk('byOccupancy(NaN) -> NaN', Number.isNaN(R.byOccupancy(NaN)));
chk('byOccupancy({kisi_sayisi:NaN, kisi_basi_m3h:36}) -> NaN',
    Number.isNaN(R.byOccupancy({kisi_sayisi:NaN, kisi_basi_m3h:36})));
chk('byOccupancy({kisi_sayisi:-5, kisi_basi_m3h:36}) -> NaN',
    Number.isNaN(R.byOccupancy({kisi_sayisi:-5, kisi_basi_m3h:36})));

chk('compare(NaN) -> NaN', Number.isNaN(R.compare(NaN)));
chk('compare({Q_ach_m3h:NaN, Q_occupancy_m3h:500}) -> NaN',
    Number.isNaN(R.compare({Q_ach_m3h:NaN, Q_occupancy_m3h:500})));

W('\n' + (fail ? fail + ' KALDI' : 'room-ventilation-rate.js testleri GECTI'));
process.exit(fail ? 1 : 0);
