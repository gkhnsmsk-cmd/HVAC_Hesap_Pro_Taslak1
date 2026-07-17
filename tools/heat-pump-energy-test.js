// heat-pump-energy.js icin headless test (Modul-Test tarzi).
const HPE = require('../HVAC_Pro_v8/js/heat-pump-energy.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Electricity demand test:
//    Q_isi_kWh=1000, COP=3.5
//    kWh_elektrik = 1000 / 3.5 ≈ 285.714
chk('electricityDemand Q_isi=1000,COP=3.5 ~= 285.7',
  near(HPE.electricityDemand({
    Q_isi_kWh: 1000,
    COP: 3.5
  }), 285.7, 0.5));

// 2) Carbon emission test:
//    kWh_elektrik=285.7, emisyon_faktoru=0.4
//    kgCO2 = 285.7 * 0.4 ≈ 114.28
chk('carbonEmission kWh=285.7,emis_fak=0.4 ~= 114.3',
  near(HPE.carbonEmission({
    kWh_elektrik: 285.7,
    emisyon_faktoru_kgCO2_kWh: 0.4
  }), 114.3, 0.5));

// 3) COP = 0 -> NaN güvenli
chk('electricityDemand COP=0 -> NaN',
  !isFinite(HPE.electricityDemand({
    Q_isi_kWh: 1000,
    COP: 0
  })));

// 4) COP < 0 -> NaN güvenli
chk('electricityDemand COP=-1 -> NaN',
  !isFinite(HPE.electricityDemand({
    Q_isi_kWh: 1000,
    COP: -1
  })));

// 5) Geçersiz girdi (NaN) -> NaN güvenli
chk('electricityDemand NaN Q_isi -> NaN',
  !isFinite(HPE.electricityDemand({
    Q_isi_kWh: NaN,
    COP: 3.5
  })));
chk('electricityDemand NaN COP -> NaN',
  !isFinite(HPE.electricityDemand({
    Q_isi_kWh: 1000,
    COP: NaN
  })));

// 6) Geçersiz girdi carbonEmission -> NaN güvenli
chk('carbonEmission NaN kWh -> NaN',
  !isFinite(HPE.carbonEmission({
    kWh_elektrik: NaN,
    emisyon_faktoru_kgCO2_kWh: 0.4
  })));
chk('carbonEmission NaN emisyon_fak -> NaN',
  !isFinite(HPE.carbonEmission({
    kWh_elektrik: 285.7,
    emisyon_faktoru_kgCO2_kWh: NaN
  })));

// 7) Pozitif değerler sonlu olması testi
chk('electricityDemand sonlu pozitif',
  HPE.electricityDemand({
    Q_isi_kWh: 1000,
    COP: 3.5
  }) > 0);
chk('carbonEmission sonlu pozitif',
  HPE.carbonEmission({
    kWh_elektrik: 285.7,
    emisyon_faktoru_kgCO2_kWh: 0.4
  }) > 0);

R('\n' + (fail ? fail + ' KALDI' : 'heat-pump-energy.js testleri GECTI'));
process.exit(fail ? 1 : 0);
