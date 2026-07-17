// Saglik Kontrol — Tum HVAC Pro v8 modulleri test et.
// Her modulun module.exports'u var mi kontrol et.
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '✓ ' : '✗ ') + a); if (!k) fail++; };

// Test edilecek modul listesi (TASK_QUEUE'den done gorevler).
const modules = [
  'uvalue-engine',
  'pipe-hydraulics',
  'sanitary-drainage',
  'expansion-tank',
  'system-compare',
  'rainwater-drainage',
  'shelter-ventilation',
  'carpark-ventilation',
  'smoke-extract',
  'fire-prelim',
  'pump-npsh',
  'heat-recovery',
  'condensate-drain',
  'cable-sizing-prelim',
  'condensation-check',
  'medical-gas'
];

R('Saglik Kontrol: HVAC Pro v8 Moduller');
R('=====================================\n');

for (var i = 0; i < modules.length; i++) {
  var modName = modules[i];
  try {
    var mod = require('../HVAC_Pro_v8/js/' + modName + '.js');
    var isExported = typeof mod === 'object' && mod !== null && Object.keys(mod).length > 0;
    chk(modName + ' export', isExported);
  } catch (e) {
    chk(modName + ' require', false);
  }
}

R('\n=====================================');
if (fail) {
  R(fail + ' modul kontrol basarısız');
} else {
  R('Tum moduller saglik kontrol GECTI');
}

process.exit(fail ? 1 : 0);
