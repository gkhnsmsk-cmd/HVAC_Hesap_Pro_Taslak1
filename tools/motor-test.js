// HVAC Hesap Pro — Hesap Motoru Regresyon / Saglik Testi
// Amac: calc-engine.js'i tarayicisiz (Node) calistirip motorun
//   (1) yuklenirken cokmedigini, (2) hesaplaMahalV5'in calistigini,
//   (3) urettigi yuk/kayip degerlerinin SONLU sayi oldugunu,
//   (4) is kaybi formulunun ic tutarliligini (asagida) dogrular.
// Golden deger KILITLEMEZ; mevcut ciktilari raporlar (sen onaylayinca golden'a cevrilir).
// Kullanim: node tools/motor-test.js   (ya da "Motor-Test.bat")

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const jsDir = path.join(__dirname, '..', 'HVAC_Pro_v8', 'js');
const R = (m) => process.stdout.write(m + '\n');

const noop = () => {};
function fakeEl() {
  return new Proxy(function () {}, {
    get(t, k) {
      if (k === 'style') return {};
      if (k === 'classList') return { add: noop, remove: noop, toggle: noop, contains: () => false };
      if (k === 'value') return '';
      if (k === 'checked') return false;
      if (k === 'options') return [];
      if (k === 'children' || k === 'childNodes') return [];
      return () => null;
    },
    set() { return true; },
    apply() { return null; },
  });
}
const ctx = {
  document: {
    getElementById: () => fakeEl(), querySelector: () => fakeEl(),
    querySelectorAll: () => [], createElement: () => fakeEl(),
    addEventListener: noop, body: fakeEl(), documentElement: fakeEl(),
  },
  console: { log: noop, warn: noop, error: noop, info: noop },
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop, clear: noop },
  XLSX: {}, navigator: { language: 'tr-TR' },
  alert: noop, confirm: () => true, prompt: () => null,
  setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop,
  requestAnimationFrame: noop, fetch: () => Promise.reject(new Error('no-net')),
  LANG: 'tr', location: { href: '', search: '' },
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);

let loadErr = 0;
for (const f of ['device-db.js', 'calc-engine.js']) {
  try { vm.runInContext(fs.readFileSync(path.join(jsDir, f), 'utf8'), ctx, { filename: f }); }
  catch (e) { R('YUKLEME HATASI  ' + f + '  -> ' + e.message); loadErr++; }
}
if (loadErr) { R('\n*** Motor yuklenemedi. ***'); process.exit(1); }
if (typeof ctx.hesaplaMahalV5 !== 'function') { R('*** hesaplaMahalV5 tanimli degil. ***'); process.exit(1); }

const P = {
  Tmax: 35, yazYT: 24, DR: 10, kisKt: -6, icKtYaz: 24, icKtKis: 22, icNem: 50,
  shgc: 0.6, emSog: 10, emIst: 10, ruzgarZam: 1.07, thKatsayi: 1.5,
  thSogEkle: true, thIstEkle: true, infilEkle: true,
  icUniteTip: 'FCU_ORTA_KANAL', igkVerim: 0, effZam: 1, odaZam: 1, fAyd: 1,
};

const mahaller = [
  { ad: 'Ofis (guney cepheli, ust kat)', row: {
    mahalNo: 'G01-001', mahalAdi: 'Ofis 101', alan: 20, h: 3,
    duvarU: 0.45, pencereU: 2.1, 'tavan u değeri': 0.35, 'döşeme u değeri': 0.5,
    'pencere gölgeleme kaysayısı': 0.5,
    'güney dış duvar alanı': 10, 'güney dış pencere alanı': 4,
    'tavan alanı': 20, 'döşeme alanı': 20,
    'oturan kişi': 2, 'aydınlatma yükü': 12, Tic_yaz: 24, Tic_kis: 22 } },
  { ad: 'Ic mahal (WC, penceresiz)', row: {
    mahalNo: 'G01-002', mahalAdi: 'WC', alan: 6, h: 3,
    duvarU: 0.45, pencereU: 2.1, 'tavan u değeri': 0.35, 'döşeme u değeri': 0.5,
    'tavan alanı': 6, 'döşeme alanı': 6,
    'oturan kişi': 0, 'aydınlatma yükü': 8, Tic_yaz: 26, Tic_kis: 20 } },
];

const num = (v) => (typeof v === 'number' && isFinite(v));
const fmt = (v) => (num(v) ? v.toFixed(1) : ('!!' + String(v) + '!!'));
let fail = 0;

R('HVAC Hesap Pro — Motor Testi');
R('='.repeat(60));

for (const m of mahaller) {
  R('\n# ' + m.ad);
  let res;
  try { res = ctx.hesaplaMahalV5(m.row, P, null); }
  catch (e) { R('  COKTU: ' + e.message); fail++; continue; }
  if (!res || typeof res !== 'object') { R('  Sonuc nesne degil.'); fail++; continue; }

  const kritik = ['qKayip','qKayipBase','duvarQis','tavanQis','dosemeQis','pencereQis','insanQ','insanQLatent','aydinlatmaQ'];
  const bozuk = kritik.filter(k => (k in res) && !num(res[k]));
  if (bozuk.length) { R('  NaN/Infinity: ' + bozuk.join(', ')); fail++; }

  R('  Isi kaybi toplam (qKayip)    : ' + fmt(res.qKayip) + ' W');
  R('  - Duvar/Tavan/Doseme/Pencere : ' + fmt(res.duvarQis) + ' / ' + fmt(res.tavanQis) + ' / ' + fmt(res.dosemeQis) + ' / ' + fmt(res.pencereQis) + ' W');
  R('  - Kis iletim tabani (qKayipBase): ' + fmt(res.qKayipBase) + ' W');
  R('  Insan duyulur/gizli          : ' + fmt(res.insanQ) + ' / ' + fmt(res.insanQLatent) + ' W');
  R('  Aydinlatma                   : ' + fmt(res.aydinlatmaQ) + ' W');
  if ('bestLoad' in res) R('  Sogutma tepe yuku (bestLoad) : ' + fmt(res.bestLoad) + ' W  (Ay ' + (res.bestAy||'-') + ', Saat ' + (res.bestSaat||'-') + ')');

  const trToplam = (res.duvarQis||0)+(res.tavanQis||0)+(res.dosemeQis||0)+(res.pencereQis||0)+(res.skylightQis||0);
  const ruz = P.ruzgarZam || 1;
  if (num(res.qKayipBase) && res.qKayipBase > 0) {
    const s1 = Math.abs(trToplam*ruz - res.qKayipBase) / res.qKayipBase * 100;
    R('  Tutarlilik-1 (Xtransmisyon*ruzgar = taban): %' + s1.toFixed(2) + (s1 < 1 ? '  OK' : '  !! KONTROL ET'));
    if (s1 >= 1) fail++;
  }
  if (num(res.qKayip) && res.qKayip > 0) {
    const venIst = P.thIstEkle ? Math.max(0, (res.thData && res.thData.thIst) || 0) : 0;
    const beklenenTotal = (res.qKayipBase||0)*(res.emIstFak||1) + venIst + (res.infilIst||0);
    const s2 = Math.abs(beklenenTotal - res.qKayip) / res.qKayip * 100;
    R('  Tutarlilik-2 (taban*emniyet+vent+infil = toplam): %' + s2.toFixed(2) + (s2 < 1 ? '  OK' : '  !! KONTROL ET'));
    if (s2 >= 1) fail++;
  }
}

R('\n' + '='.repeat(60));
if (fail === 0) {
  R('SONUC: Motor saglikli, tum degerler sonlu ve formul tutarli.');
  R('(Bu sayilari goz kontrolu yapip onaylarsan kalici golden regresyon kilidine ceviririz.)');
  process.exit(0);
} else {
  R('SONUC: ' + fail + ' SORUN bulundu — motor ciktisi gozden gecirilmeli.');
  process.exit(1);
}
