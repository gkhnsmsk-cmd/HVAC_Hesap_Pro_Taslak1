// GSEM MEP PRO — Worker Kapsam Dogrulayici
// Amac: Bir worker/agent gorevi bittiginde, SADECE izin verilen dosyalarin
//   degistigini otomatik dogrulamak (elle git diff okuyup unutma riskini azaltir).
//   Referans olay: GELISTIRICI_NOTLARI.md "-1. Worker kapsam siniri" (2026-07-17,
//   bir worker saglik-kontrol.js'yi izinsiz yeniden yazmisti).
//
// Kullanim:
//   node tools/verify-scope.js "HVAC_Pro_v8/js/yeni-modul.js" "tools/yeni-modul-test.js"
//
// Cikis: 0 = sadece izin verilen dosyalar degisti (veya hic degisiklik yok).
//        1 = izin verilmeyen dosya(lar) degisti -> BASARISIZ, listeler.
// Ayrica decisions.json > shared_infra_no_touch listesindeki dosyalarin
//   DEGISMIS OLMASI durumunda -- izin listesinde olsa bile -- ozel bir UYARI basar.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const allowed = process.argv.slice(2).map(p => p.replace(/\\/g, '/'));

if (allowed.length === 0) {
  console.error('Kullanim: node tools/verify-scope.js <izinli-dosya-1> <izinli-dosya-2> ...');
  process.exit(1);
}

let decisions = {};
try { decisions = JSON.parse(fs.readFileSync(path.join(__dirname, 'decisions.json'), 'utf8')); } catch (e) {}
const noTouch = (decisions.shared_infra_no_touch || []).map(p => p.replace(/\\/g, '/'));

let statusOut = '';
try {
  statusOut = execSync('git status --short', { cwd: root, encoding: 'utf8' });
} catch (e) {
  console.error('git status calistirilamadi: ' + e.message);
  process.exit(1);
}

const changed = statusOut
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean)
  .map(l => l.replace(/^[\?\?ADMR!]+\s+/, '').replace(/\\/g, '/'));

const unexpected = changed.filter(f => !allowed.some(a => f === a || f.endsWith('/' + a) || a.endsWith('/' + f)));
const infraViolations = changed.filter(f => noTouch.some(nt => f === nt || f.endsWith('/' + nt)));

console.log('='.repeat(50));
console.log('Kapsam Dogrulama');
console.log('='.repeat(50));
console.log('Izinli dosyalar (' + allowed.length + '):');
allowed.forEach(a => console.log('  - ' + a));
console.log('\nGit\'te degisen dosyalar (' + changed.length + '):');
changed.forEach(c => console.log('  * ' + c));

let bad = 0;
if (infraViolations.length) {
  console.log('\n*** KRITIK: Paylasilan altyapi dosyasi degismis! ***');
  infraViolations.forEach(f => console.log('  !!! ' + f));
  bad = 1;
}
if (unexpected.length) {
  console.log('\n*** KAPSAM IHLALI: Izin verilmeyen dosya(lar) degismis! ***');
  unexpected.forEach(f => console.log('  !!! ' + f));
  bad = 1;
}

if (!bad) {
  console.log('\nOK — sadece izin verilen dosyalar degisti.');
}
process.exit(bad);
