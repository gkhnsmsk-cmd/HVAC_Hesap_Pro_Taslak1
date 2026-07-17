// HVAC Hesap Pro — Saglik Kontrolu
// Amac: (1) bir dosya yarida kesilmis / sozdizimi bozuk mu ANINDA yakala,
//       (2) tum modul test dosyalarini (tools/*-test.js) calistirip dogrula.
// Kullanim: "Saglik-Kontrol.bat" dosyasina cift tikla (ya da: node saglik-kontrol.js)

const { execFileSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const jsDir = path.join(root, 'HVAC_Pro_v8', 'js');
let bad = 0, ok = 0;

console.log('HVAC Hesap Pro — Saglik Kontrolu\n' + '='.repeat(40));

// 1) HVAC_Pro_v8/js altindaki TUM .js dosyalarinin sozdizimi (yedek/bozuk kopyalar haric)
let files = [];
try {
  files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && !/\.bak|\.broken/.test(f));
} catch (e) {
  console.log('HVAC_Pro_v8/js klasoru okunamadi: ' + e.message);
}

for (const f of files) {
  const p = path.join(jsDir, f);
  try {
    execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
    console.log('  OK    js/' + f);
    ok++;
  } catch (e) {
    const msg = String(e.stderr || e.message || e).split('\n').find(l => /SyntaxError|Error/.test(l)) || 'sozdizimi hatasi';
    console.log('  BOZUK js/' + f + '   -> ' + msg.trim());
    bad++;
  }
}

// 2) index.html icindeki satir-ici <script> bloklari
try {
  const html = fs.readFileSync(path.join(root, 'HVAC_Pro_v8', 'index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  let ib = 0;
  blocks.forEach((s, i) => {
    try { new Function(s[1]); }
    catch (e) { console.log('  BOZUK index.html inline #' + (i + 1) + '  -> ' + e.message); ib++; }
  });
  if (ib === 0) { console.log('  OK    index.html (' + blocks.length + ' satir-ici script)'); ok++; }
  else bad += ib;
} catch (e) {
  console.log('  index.html okunamadi: ' + e.message);
}

// 3) tools/ altindaki TUM *-test.js dosyalarini calistir (otomatik kesif — elle liste tutma)
console.log('\n' + '='.repeat(40));
console.log('Modul testleri calistiriliyor...\n');
const toolsDir = path.join(root, 'tools');
let testFiles = [];
try {
  testFiles = fs.readdirSync(toolsDir).filter(f => f.endsWith('-test.js')).sort();
} catch (e) {
  console.log('tools/ klasoru okunamadi: ' + e.message);
}

let testPass = 0, testFail = 0;
for (const tf of testFiles) {
  const fullPath = path.join(toolsDir, tf);
  try {
    execSync(`node "${fullPath}"`, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    console.log('  OK    tools/' + tf);
    testPass++;
  } catch (e) {
    console.log('  BAŞARISIZ tools/' + tf);
    if (e.stdout) console.log('    ' + String(e.stdout).trim().split('\n').join('\n    '));
    testFail++;
    bad++;
  }
}

console.log('\n' + '='.repeat(40));
console.log('Sozdizimi: ' + ok + ' OK, ' + (bad - testFail) + ' bozuk. Testler: ' + testPass + ' basarili, ' + testFail + ' basarisiz.');
if (bad > 0) {
  console.log('*** ' + bad + ' SORUN VAR! Bu haliyle YUKLEMEYIN/PAYLASMAYIN. ***');
} else {
  console.log('Tum dosyalar saglikli, tum testler GECTI (' + ok + ' sozdizimi + ' + testPass + ' test).');
}
process.exit(bad > 0 ? 1 : 0);
