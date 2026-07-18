// GSEM MEP PRO — Proje Haritasi
// Amac: "Hangi dosya ASIL calisan yazilim, hangileri arsiv/eski?" sorusunu
//   TEK komutla, dosyalari elle grep/read etmeden cevaplamak. 2026-07-18'deki
//   index.html/gsem-mep-pro.html/ana-yapi-mockup.html karisikligi buna ornek.
//
// Kullanim: node tools/project-map.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const pro8 = path.join(root, 'HVAC_Pro_v8');

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return fallback; }
}

const decisions = readJSON(path.join(__dirname, 'decisions.json'), {});
const R = (m) => console.log(m);

R('='.repeat(55));
R('GSEM MEP PRO — Proje Haritasi');
R('='.repeat(55));

R('\n--- Marka / Tema (decisions.json) ---');
R('İsim: ' + (decisions.brand_name || '?'));
R('Tema: ' + (decisions.theme || '?'));
R('Gece otomasyonu: ' + (decisions.night_automation || '?'));

R('\n--- Kanonik uygulama dosyasi ---');
const canonical = decisions.canonical_app_file || 'HVAC_Pro_v8/index.html';
const canonicalPath = path.join(root, canonical);
if (fs.existsSync(canonicalPath)) {
  const html = fs.readFileSync(canonicalPath, 'utf8');
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const stat = fs.statSync(canonicalPath);
  R('Dosya: ' + canonical + '  (VAR, ' + (stat.size / 1024).toFixed(1) + ' KB, son degisim: ' + stat.mtime.toISOString().slice(0, 16) + ')');
  R('<title>: ' + (titleMatch ? titleMatch[1] : '(bulunamadi)'));
  const tabs = [...html.matchAll(/data-tab="([a-z-]+)"/g)].map(m => m[1]);
  R('Ribbon sekmeleri: ' + [...new Set(tabs)].join(', '));
} else {
  R('!!! Dosya bulunamadi: ' + canonical);
}

R('\n--- Dondurulmus / arsiv dosyalar (DOKUNMA) ---');
(decisions.frozen_files || []).forEach(f => {
  const p = path.join(root, f);
  R('  ' + (fs.existsSync(p) ? 'VAR' : 'YOK') + '  ' + f);
});

R('\n--- Hesap modulleri (HVAC_Pro_v8/js) ---');
const jsDir = path.join(pro8, 'js');
if (fs.existsSync(jsDir)) {
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  R('Toplam js dosyasi: ' + files.length);
}

R('\n--- Gorev kuyrugu (TASK_QUEUE.json) ---');
const tq = readJSON(path.join(root, 'TASK_QUEUE.json'), null);
if (tq && Array.isArray(tq.gorevler)) {
  const done = tq.gorevler.filter(g => g.status === 'done').length;
  const pending = tq.gorevler.filter(g => g.status === 'pending').length;
  R('Toplam: ' + tq.gorevler.length + '  |  Done: ' + done + '  |  Pending: ' + pending);
  if (pending) {
    R('Bekleyenler: ' + tq.gorevler.filter(g => g.status === 'pending').map(g => g.id).join(', '));
  }
} else {
  R('TASK_QUEUE.json okunamadi.');
}

R('\n--- Git durumu (ozet) ---');
try {
  const status = execSync('git status --short', { cwd: root, encoding: 'utf8' });
  const lines = status.split('\n').filter(Boolean);
  R('Uncommitted degisiklik sayisi: ' + lines.length);
  if (lines.length && lines.length <= 15) lines.forEach(l => R('  ' + l));
} catch (e) {
  R('git status calisamadi: ' + e.message);
}

R('\n--- Paylasilan altyapi (DOKUNULMAMASI gereken) ---');
(decisions.shared_infra_no_touch || []).forEach(f => R('  ' + f));

R('\n' + '='.repeat(55));
