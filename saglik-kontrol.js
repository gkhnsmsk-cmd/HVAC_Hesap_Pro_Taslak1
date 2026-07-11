// HVAC Hesap Pro — Sağlık Kontrolü
// Amaç: bir dosya yarıda kesilmiş / sözdizimi bozuk mu, ANINDA yakala.
// Kullanım: "Saglik-Kontrol.bat" dosyasına çift tıkla (ya da: node saglik-kontrol.js)

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const jsDir = path.join(root, 'HVAC_Pro_v8', 'js');
let bad = 0, ok = 0;

console.log('HVAC Hesap Pro — Saglik Kontrolu\n' + '='.repeat(40));

// 1) HVAC_Pro_v8/js altindaki tum .js dosyalari (yedek/bozuk kopyalar haric)
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

console.log('='.repeat(40));
if (bad > 0) {
  console.log('*** ' + bad + ' BOZUK DOSYA VAR! Bu haliyle YUKLEMEYIN/PAYLASMAYIN. ***');
} else {
  console.log('Tum dosyalar saglikli (' + ok + ' kontrol gecti).');
}
process.exit(bad > 0 ? 1 : 0);
