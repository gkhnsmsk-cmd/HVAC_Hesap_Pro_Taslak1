// GSEM MEP PRO — Kalici Karar Deposu
// Amac: Oturumlar arasi kaybolan "biz buna zaten karar vermistik" bilgisini
//   tek bir git-tracked JSON dosyada tutmak, grep/read yerine tek komutla okumak.
// Kullanim:
//   node tools/decisions.js                 -> tum kararlari yazdirir
//   node tools/decisions.js get <key>        -> tek bir alani yazdirir
//   node tools/decisions.js set <key> <val>  -> bir alani gunceller (string) ve kaydeder
//   node tools/decisions.js note "<metin>"   -> notes[] dizisine tarihli bir not ekler

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'decisions.json');

function load() {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function save(obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

const [, , cmd, a, b] = process.argv;

if (!cmd) {
  console.log(JSON.stringify(load(), null, 2));
} else if (cmd === 'get') {
  const d = load();
  if (!(a in d)) { console.error('Bilinmeyen alan: ' + a); process.exit(1); }
  console.log(typeof d[a] === 'string' ? d[a] : JSON.stringify(d[a], null, 2));
} else if (cmd === 'set') {
  const d = load();
  d[a] = b;
  save(d);
  console.log('Kaydedildi: ' + a + ' = ' + b);
} else if (cmd === 'note') {
  const d = load();
  const stamp = new Date().toISOString().slice(0, 10);
  d.notes = d.notes || [];
  d.notes.push(stamp + ': ' + a);
  save(d);
  console.log('Not eklendi.');
} else {
  console.error('Bilinmeyen komut. Kullanim: get <key> | set <key> <val> | note "<metin>"');
  process.exit(1);
}
