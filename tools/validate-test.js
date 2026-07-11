// validate.js icin birim testi
const { validateRooms } = require('../HVAC_Pro_v8/js/validate.js');
const R = (m) => process.stdout.write(m + '\n');

const rows = [
  { mahalNo: 'G01-001', mahalAdi: 'Ofis 101', alan: 20, h: 3, duvarU: 0.45, 'oturan kişi': 2 }, // temiz
  { mahalNo: 'G01-002', mahalAdi: 'Bozuk Oda', alan: 0, h: 3 },                                    // alan 0 -> hata
  { mahalAdi: 'Eksik No', alan: 15 },                                                              // no yok, h yok, uDuv yok
  { mahalNo: 'G01-004', mahalAdi: 'Absurd', alan: 20, h: 40, duvarU: 12 },                         // h ve uDuv olagandisi
];
const issues = validateRooms(rows);
R('validateRooms — ' + issues.length + ' bulgu:');
issues.forEach(x => R('  [' + x.seviye + '] ' + x.mahal + ': ' + x.mesaj));

const hata = issues.filter(x => x.seviye === 'hata').length;
const uyari = issues.filter(x => x.seviye === 'uyari').length;
// beklenti: en az 1 hata (alan 0) ve birkac uyari
const ok = hata >= 1 && uyari >= 3;
R('\nBeklenen: >=1 hata, >=3 uyari.  Bulunan: ' + hata + ' hata, ' + uyari + ' uyari.  ' + (ok ? 'GECTI' : 'KALDI'));
process.exit(ok ? 0 : 1);
