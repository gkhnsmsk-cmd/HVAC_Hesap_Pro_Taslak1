// mandatory-systems-checklist.js icin headless test.
const M = require('../HVAC_Pro_v8/js/mandatory-systems-checklist.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };

R('mandatory-systems-checklist.js Test');
R('=====================================\n');

// 1) Esik-üstü senaryo: TÜM PARAMETRELER ESIK DEGERLERIN UESINDE veya EsİT
//    Tüm sonuclar TRUE olmali
const above_thresholds = M.calc({
  bina_yuksekligi_m: 50,              // >= 24 (sprinkler eşiği)
  kat_sayisi: 15,                     // >= 5 (sığınak eşiği)
  toplam_insaat_alani_m2: 20000,      // >= 5000 (hidrant ve duman tahliye eşiği)
  esik_sprinkler_yukseklik_m: 24,
  esik_hidrant_alan_m2: 5000,
  esik_siginak_kat_sayisi: 5,
  esik_asansor_basinclandirma_yukseklik_m: 30,
  esik_duman_tahliye_alan_m2: 5000
});

chk('Esik-üstü: sprinkler_gerekli = true', above_thresholds.sprinkler_gerekli === true);
chk('Esik-üstü: hidrant_gerekli = true', above_thresholds.hidrant_gerekli === true);
chk('Esik-üstü: siginak_havalandirma_gerekli = true', above_thresholds.siginak_havalandirma_gerekli === true);
chk('Esik-üstü: asansor_basinclandirma_gerekli = true', above_thresholds.asansor_basinclandirma_gerekli === true);
chk('Esik-üstü: duman_tahliye_gerekli = true', above_thresholds.duman_tahliye_gerekli === true);

R('');

// 2) Esik-altı senaryo: TÜM PARAMETRELER ESIK DEGERLERIN ALTINDA
//    Tüm sonuclar FALSE olmali
const below_thresholds = M.calc({
  bina_yuksekligi_m: 10,              // < 24 (sprinkler eşiği)
  kat_sayisi: 2,                      // < 5 (sığınak eşiği)
  toplam_insaat_alani_m2: 1000,       // < 5000 (hidrant ve duman tahliye eşiği)
  esik_sprinkler_yukseklik_m: 24,
  esik_hidrant_alan_m2: 5000,
  esik_siginak_kat_sayisi: 5,
  esik_asansor_basinclandirma_yukseklik_m: 30,
  esik_duman_tahliye_alan_m2: 5000
});

chk('Esik-altı: sprinkler_gerekli = false', below_thresholds.sprinkler_gerekli === false);
chk('Esik-altı: hidrant_gerekli = false', below_thresholds.hidrant_gerekli === false);
chk('Esik-altı: siginak_havalandirma_gerekli = false', below_thresholds.siginak_havalandirma_gerekli === false);
chk('Esik-altı: asansor_basinclandirma_gerekli = false', below_thresholds.asansor_basinclandirma_gerekli === false);
chk('Esik-altı: duman_tahliye_gerekli = false', below_thresholds.duman_tahliye_gerekli === false);

R('');

// 3) Eksik girdi senaryo: BAZI PARAMETRELER EKSIK/NaN
//    İlgili alanlar NULL olmali (crash yok)
const missing_inputs = M.calc({
  bina_yuksekligi_m: undefined,       // missing -> null expected
  kat_sayisi: NaN,                    // NaN -> null expected
  toplam_insaat_alani_m2: 5000,       // valid
  esik_sprinkler_yukseklik_m: 24,     // eşik var ama bina_h eksik
  esik_hidrant_alan_m2: 5000,         // eşik var, alan var -> false (5000 >= 5000)
  esik_siginak_kat_sayisi: 5,         // eşik var ama kat_n eksik
  esik_asansor_basinclandirma_yukseklik_m: 30,  // eşik var ama bina_h eksik
  esik_duman_tahliye_alan_m2: 5000    // eşik var, alan var -> true (5000 >= 5000)
});

chk('Eksik girdi: sprinkler_gerekli = null (bina_h eksik)', missing_inputs.sprinkler_gerekli === null);
chk('Eksik girdi: hidrant_gerekli = true (alan var)', missing_inputs.hidrant_gerekli === true);
chk('Eksik girdi: siginak_havalandirma_gerekli = null (kat_n eksik)', missing_inputs.siginak_havalandirma_gerekli === null);
chk('Eksik girdi: asansor_basinclandirma_gerekli = null (bina_h eksik)', missing_inputs.asansor_basinclandirma_gerekli === null);
chk('Eksik girdi: duman_tahliye_gerekli = true (alan var)', missing_inputs.duman_tahliye_gerekli === true);

R('');

// 4) Secim testi: opsiyonlar tamamen yok -> tum alanlar null
const no_options = M.calc();
chk('No-options: sprinkler_gerekli = null', no_options.sprinkler_gerekli === null);
chk('No-options: hidrant_gerekli = null', no_options.hidrant_gerekli === null);
chk('No-options: siginak_havalandirma_gerekli = null', no_options.siginak_havalandirma_gerekli === null);
chk('No-options: asansor_basinclandirma_gerekli = null', no_options.asansor_basinclandirma_gerekli === null);
chk('No-options: duman_tahliye_gerekli = null', no_options.duman_tahliye_gerekli === null);

R('\n' + (fail ? fail + ' KALDI' : 'mandatory-systems-checklist.js testleri GECTI'));
process.exit(fail ? 1 : 0);
