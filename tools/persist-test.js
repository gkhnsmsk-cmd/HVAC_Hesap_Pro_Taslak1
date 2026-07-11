const P = require('../HVAC_Pro_v8/js/persist.js')._pure;
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
function chk(ad, kosul) { R((kosul ? '  OK   ' : '  KALDI ') + ad); if (!kosul) fail++; }

// 1) halka rotasyonu: 7 it -> son 5 kalir
let ring = [];
for (let i = 1; i <= 7; i++) ring = P.pushSnapshot(ring, { t: '' + i, data: i }, 5);
chk('halka en fazla 5 tutar', ring.length === 5);
chk('en eski dusuruldu (ilk=3)', ring[0].data === 3);
chk('en yeni korundu (son=7)', ring[6 - 2].data === 7);

// 2) sema surum reddi
chk('bozuk JSON -> temiz store', P.readStore('{bozuk').ring.length === 0);
chk('yanlis sema -> temiz store', P.readStore(JSON.stringify({ schema: 999, ring: [1] })).ring.length === 0);
chk('dogru sema -> okunur', P.readStore(JSON.stringify({ schema: P.SCHEMA, ring: [{ data: 1 }] })).ring.length === 1);

// 3) write->read round-trip (proje-durumu benzeri nesne)
const state = { version: '1.0', proje: { prjAdi: 'Test', sehir: 'İstanbul' }, parametreler: { kisKt: '-6', shgc: '0.6' }, mahalData: [{ mahalNo: 'G01', alan: 20 }], hesapSonuclari: [{ qKayip: 1766 }] };
let store = { schema: P.SCHEMA, ring: [] };
store.ring = P.pushSnapshot(store.ring, { t: 'x', data: state }, 5);
const roundtrip = P.readStore(P.writeStore(store));
chk('round-trip: mahal alani korundu', roundtrip.ring[0].data.mahalData[0].alan === 20);
chk('round-trip: parametre korundu', roundtrip.ring[0].data.parametreler.kisKt === '-6');
chk('round-trip: Turkce karakter korundu', roundtrip.ring[0].data.proje.sehir === 'İstanbul');
chk('round-trip: derin esitlik', JSON.stringify(roundtrip.ring[0].data) === JSON.stringify(state));

R('\n' + (fail === 0 ? 'SONUC: persist.js saf mantik testleri GECTI.' : 'SONUC: ' + fail + ' test KALDI.'));
process.exit(fail ? 1 : 0);
