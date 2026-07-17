// cogeneration-energy.js icin headless test (Modul-Test tarzi).
const CE = require('../HVAC_Pro_v8/js/cogeneration-energy.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) outputs() test:
//    yakit_girdi_kW=100, elektrik_verimi=0.35, isil_verim=0.45
//    elektrik_kW = 100 * 0.35 = 35
//    isi_kW = 100 * 0.45 = 45
//    toplam_verim = 0.35 + 0.45 = 0.8
var out1 = CE.outputs({
  yakit_girdi_kW: 100,
  elektrik_verimi: 0.35,
  isil_verim: 0.45
});
chk('outputs yakit=100,e_eta=0.35,t_eta=0.45 -> elektrik_kW=35',
  out1 && near(out1.elektrik_kW, 35, 0.01));
chk('outputs yakit=100,e_eta=0.35,t_eta=0.45 -> isi_kW=45',
  out1 && near(out1.isi_kW, 45, 0.01));
chk('outputs yakit=100,e_eta=0.35,t_eta=0.45 -> toplam_verim=0.8',
  out1 && near(out1.toplam_verim, 0.8, 0.01));

// 2) primaryEnergySavingRatio() test:
//    ref_elektrik_verimi=0.45 (şebeke ortalaması), ref_isi_verimi=0.90 (kazan verimliği)
//    elektrik_verimi=0.35, isil_verim=0.45
//    denom = (0.35/0.45) + (0.45/0.90) = 0.7778 + 0.5 = 1.2778
//    PES = 1 - 1/1.2778 ≈ 0.218
var PES = CE.primaryEnergySavingRatio({
  ref_elektrik_verimi: 0.45,
  ref_isi_verimi: 0.90,
  elektrik_verimi: 0.35,
  isil_verim: 0.45
});
chk('primaryEnergySavingRatio sonlu değer döner',
  isFinite(PES));
chk('primaryEnergySavingRatio makul aralıkta (0 ile 1 arasında)',
  PES >= 0 && PES <= 1);

// 3) Hatalı veriler için NaN güvenli testleri

// 3a) outputs() - negatif yakıt girdisi
chk('outputs yakit_girdi<0 -> NaN',
  !isFinite(CE.outputs({
    yakit_girdi_kW: -100,
    elektrik_verimi: 0.35,
    isil_verim: 0.45
  })));

// 3b) outputs() - sıfır yakıt girdisi
chk('outputs yakit_girdi=0 -> NaN',
  !isFinite(CE.outputs({
    yakit_girdi_kW: 0,
    elektrik_verimi: 0.35,
    isil_verim: 0.45
  })));

// 3c) outputs() - NaN elektrik verimliliği
chk('outputs NaN elektrik_verimi -> NaN',
  !isFinite(CE.outputs({
    yakit_girdi_kW: 100,
    elektrik_verimi: NaN,
    isil_verim: 0.45
  })));

// 3d) outputs() - verimlilik > 1
chk('outputs elektrik_verimi>1 -> NaN',
  !isFinite(CE.outputs({
    yakit_girdi_kW: 100,
    elektrik_verimi: 1.5,
    isil_verim: 0.45
  })));

// 3e) primaryEnergySavingRatio() - NaN referans verimliliği
chk('primaryEnergySavingRatio NaN ref_elektrik_verimi -> NaN',
  !isFinite(CE.primaryEnergySavingRatio({
    ref_elektrik_verimi: NaN,
    ref_isi_verimi: 0.90,
    elektrik_verimi: 0.35,
    isil_verim: 0.45
  })));

// 3f) primaryEnergySavingRatio() - sıfır referans verimliliği
chk('primaryEnergySavingRatio ref_elektrik_verimi=0 -> NaN',
  !isFinite(CE.primaryEnergySavingRatio({
    ref_elektrik_verimi: 0,
    ref_isi_verimi: 0.90,
    elektrik_verimi: 0.35,
    isil_verim: 0.45
  })));

// 3g) primaryEnergySavingRatio() - negatif verimi
chk('primaryEnergySavingRatio elektrik_verimi<0 -> NaN',
  !isFinite(CE.primaryEnergySavingRatio({
    ref_elektrik_verimi: 0.45,
    ref_isi_verimi: 0.90,
    elektrik_verimi: -0.35,
    isil_verim: 0.45
  })));

// 4) Tüm girdiler sonlu olması ve geometrik olarak tutarlı sonuçlar testi
chk('outputs sonlu pozitif elektrik_kW',
  out1 && out1.elektrik_kW > 0);
chk('outputs sonlu pozitif isi_kW',
  out1 && out1.isi_kW > 0);
chk('outputs toplam_verim makul aralıkta',
  out1 && out1.toplam_verim > 0 && out1.toplam_verim <= 1.5);

R('\n' + (fail ? fail + ' KALDI' : 'cogeneration-energy.js testleri GECTI'));
process.exit(fail ? 1 : 0);
