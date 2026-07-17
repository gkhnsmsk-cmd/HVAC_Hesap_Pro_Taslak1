// water-storage-tank.js icin headless test (Modul-Test tarzi).
const WST = require('../HVAC_Pro_v8/js/water-storage-tank.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel depo hacmi hesabi:
//    gunlukTuketim=5000 L/gün, depolamaSüresi=24 h, esZamanlılık=1, yangınRezervü=2000 L
//    gerekliHacimL = 5000 * (24/24) * 1 + 2000 = 5000 + 2000 = 7000 L
//    gerekliHacimM3 = 7000 / 1000 = 7.0 m³
chk('calc gunlukTuketim=5000, depolamaSuresi=24, esZamanlilик=1, yanginRezervü=2000 -> gerekliHacimL~=7000',
  near(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 2000
  }).gerekliHacimL, 7000, 0.1));

chk('calc gunlukTuketim=5000, depolamaSuresi=24, esZamanlilик=1, yanginRezervü=2000 -> gerekliHacimM3~=7.0',
  near(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 2000
  }).gerekliHacimM3, 7.0, 0.01));

// 2) Yarım günlük depolama:
//    gunlukTuketim=5000 L/gün, depolamaSüresi=12 h, esZamanlılık=1, yangınRezervü=0
//    gerekliHacimL = 5000 * (12/24) * 1 + 0 = 5000 * 0.5 = 2500 L
//    gerekliHacimM3 = 2500 / 1000 = 2.5 m³
chk('calc yarım gün depolama -> gerekliHacimL~=2500',
  near(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: 12,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL, 2500, 0.1));

chk('calc yarım gün depolama -> gerekliHacimM3~=2.5',
  near(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: 12,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimM3, 2.5, 0.01));

// 3) Eşzamanlılık faktörü uygulanmış:
//    gunlukTuketim=1000 L/gün, depolamaSüresi=24 h, esZamanlılık=0.8, yangınRezervü=0
//    gerekliHacimL = 1000 * 1 * 0.8 = 800 L
chk('calc esZamanlilик=0.8 -> gerekliHacimL~=800',
  near(WST.calc({
    gunlukTuketimL: 1000,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 0.8,
    yanginRezerviL: 0
  }).gerekliHacimL, 800, 0.1));

// 4) Sıfır girdi (başlangıç yapısı, mantıksız ama güvenli)
chk('calc gunlukTuketim=0 -> gerekliHacimL=0',
  WST.calc({
    gunlukTuketimL: 0,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL === 0);

// 5) Negatif girdi -> NaN güvenli
chk('calc gunlukTuketim negatif -> NaN',
  !isFinite(WST.calc({
    gunlukTuketimL: -5000,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL));

chk('calc depolamaSuresi negatif -> NaN',
  !isFinite(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: -12,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL));

// 6) NaN girdi -> NaN güvenli
chk('calc gunlukTuketim NaN -> NaN',
  !isFinite(WST.calc({
    gunlukTuketimL: NaN,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL));

chk('calc depolamaSuresi NaN -> NaN',
  !isFinite(WST.calc({
    gunlukTuketimL: 5000,
    depolamaSuresiSaat: NaN,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL));

// 7) Varsayılan parametreler (esZamanlılık=1, yangınRezervü=0)
chk('calc varsayılan parametre esZamanlilик -> kullanılan=1',
  near(WST.calc({
    gunlukTuketimL: 1000,
    depolamaSuresiSaat: 24
  }).gerekliHacimL, 1000, 0.1));

chk('calc varsayılan parametre yanginRezervü -> kullanılan=0',
  WST.calc({
    gunlukTuketimL: 1000,
    depolamaSuresiSaat: 24
  }).gerekliHacimL === 1000);

// 8) Büyük değerler
chk('calc büyük değer gunlukTuketim=1000000 L',
  isFinite(WST.calc({
    gunlukTuketimL: 1000000,
    depolamaSuresiSaat: 24,
    esZamanlilikFaktor: 1,
    yanginRezerviL: 0
  }).gerekliHacimL));

R('\n' + (fail ? fail + ' KALDI' : 'water-storage-tank.js testleri GECTI'));
process.exit(fail ? 1 : 0);
