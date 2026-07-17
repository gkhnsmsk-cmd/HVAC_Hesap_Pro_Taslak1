// compressed-air.js icin headless test (Modul-Test tarzi).
const CA = require('../HVAC_Pro_v8/js/compressed-air.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Basit test: Q_total=500 m3/h, es_zamanlilik_faktoru=0.6
//    Q_m3h = 500 * 0.6 = 300
chk('airDemand Q_total=500,factor=0.6 = 300',
  near(CA.airDemand({
    toplam_alet_debisi_m3h: 500,
    es_zamanlilik_faktoru: 0.6
  }), 300, 0.001));

// 2) NaN girdi -> NaN güvenli
chk('airDemand NaN Q_total -> NaN',
  !isFinite(CA.airDemand({
    toplam_alet_debisi_m3h: NaN,
    es_zamanlilik_faktoru: 0.6
  })));
chk('airDemand NaN factor -> NaN',
  !isFinite(CA.airDemand({
    toplam_alet_debisi_m3h: 500,
    es_zamanlilik_faktoru: NaN
  })));

// 3) Factor > 1 girilse bile sadece çarpar (sınır kontrolü YAPMAZ)
chk('airDemand factor=1.5 icin sadece carpma yapilir',
  near(CA.airDemand({
    toplam_alet_debisi_m3h: 500,
    es_zamanlilik_faktoru: 1.5
  }), 750, 0.001));

// 4) Negatif factor girilse bile sadece çarpar
chk('airDemand factor=-0.5 icin sadece carpma yapilir',
  near(CA.airDemand({
    toplam_alet_debisi_m3h: 500,
    es_zamanlilik_faktoru: -0.5
  }), -250, 0.001));

// 5) Sıfır debi
chk('airDemand Q_total=0 -> 0',
  near(CA.airDemand({
    toplam_alet_debisi_m3h: 0,
    es_zamanlilik_faktoru: 0.6
  }), 0, 0.001));

// 6) Boş input
chk('airDemand() -> NaN',
  !isFinite(CA.airDemand({})));

R('\n' + (fail ? fail + ' KALDI' : 'compressed-air.js testleri GECTI'));
process.exit(fail ? 1 : 0);
