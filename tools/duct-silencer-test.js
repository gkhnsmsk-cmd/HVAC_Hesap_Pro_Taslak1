// duct-silencer.js icin headless test (Modul-Test tarzi).
const DS = require('../HVAC_Pro_v8/js/duct-silencer.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel hesap test:
//    SWL=85 dB, hedef NC=35 dB, oda azaltması=10 dB
//    gerekli = 85 - 35 - 10 = 40 dB
chk('attenuationRequired SWL=85, NC=35, oda_az=10 === 40',
  DS.attenuationRequired({
    SWL_kaynak_dB: 85,
    hedef_NC_dB: 35,
    oda_azaltma_dB: 10
  }) === 40);

// 2) Negatif sonuç durumu test (susturucu gerekmiyor):
//    SWL=40 dB, hedef NC=35 dB, oda azaltması=10 dB
//    gerekli = 40 - 35 - 10 = -5 dB (negatif = susturucu gerekmiyor)
//    Bu durum normal ve beklenen, kırpma yapılmaz.
var negResult = DS.attenuationRequired({
  SWL_kaynak_dB: 40,
  hedef_NC_dB: 35,
  oda_azaltma_dB: 10
});
chk('attenuationRequired negatif sonuç (-5 dB): susturucu gerekmiyor',
  negResult === -5 && isFinite(negResult) && negResult < 0);

// 3) NaN girdisi güvenli test:
chk('attenuationRequired NaN input (SWL=NaN) -> NaN',
  !isFinite(DS.attenuationRequired({
    SWL_kaynak_dB: NaN,
    hedef_NC_dB: 35,
    oda_azaltma_dB: 10
  })));

chk('attenuationRequired NaN input (NC=NaN) -> NaN',
  !isFinite(DS.attenuationRequired({
    SWL_kaynak_dB: 85,
    hedef_NC_dB: NaN,
    oda_azaltma_dB: 10
  })));

chk('attenuationRequired NaN input (oda_az=NaN) -> NaN',
  !isFinite(DS.attenuationRequired({
    SWL_kaynak_dB: 85,
    hedef_NC_dB: 35,
    oda_azaltma_dB: NaN
  })));

// 4) Geçersiz/undefined girdiler -> NaN güvenli
chk('attenuationRequired undefined opts -> NaN',
  !isFinite(DS.attenuationRequired(undefined)));

chk('attenuationRequired hiç parametre -> NaN',
  !isFinite(DS.attenuationRequired()));

// 5) Başka bir örnek: pozitif sonuç (susturucu gerekli)
//    SWL=90 dB, hedef NC=35 dB, oda azaltması=5 dB
//    gerekli = 90 - 35 - 5 = 50 dB
chk('attenuationRequired SWL=90, NC=35, oda_az=5 === 50',
  DS.attenuationRequired({
    SWL_kaynak_dB: 90,
    hedef_NC_dB: 35,
    oda_azaltma_dB: 5
  }) === 50);

R('\n' + (fail ? fail + ' KALDI' : 'duct-silencer.js testleri GECTI'));
process.exit(fail ? 1 : 0);
