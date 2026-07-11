const RM = require('../HVAC_Pro_v8/js/report-model.js');
const RO = require('../HVAC_Pro_v8/js/report-orchestrator.js');
const R = m => process.stdout.write(m + '\n');
let fail = 0; const ok = (a, k) => { R((k ? '  OK   ' : '  KALDI ') + a); if (!k) fail++; };

const proj = { proje_adi: 'Forum One Ofis', sehir: 'İstanbul', tarih: '11.07.2026', toplam_sogutma_kW: 64, toplam_isitma_kW: 51 };
const nar = RM.buildNarrative(proj, 'vrf');
const app = [{ title: 'HVAC Yük Hesabı (Carrier HAP)', html: '<table><tr><td>ENTRANCE HALL 1906 W</td></tr></table>' }];
const doc = RO.buildFullDoc(proj, nar, app);

ok('kapakta marka var', doc.indexOf('Gsem Mep Pro') > -1);
ok('proje adı kapakta', doc.indexOf('Forum One Ofis') > -1);
ok('içindekiler var', doc.indexOf('İÇİNDEKİLER') > -1);
ok('bölüm başlığı (RAPORUN KONUSU)', doc.indexOf('RAPORUN KONUSU') > -1);
ok('VRF anlatımı gövdede', doc.indexOf('VRF/VRV') > -1);
ok('EK-1 başlığı', doc.indexOf('EK-1: HVAC Yük Hesabı') > -1);
ok('EK içeriği gömülü', doc.indexOf('ENTRANCE HALL 1906 W') > -1);
ok('geçerli HTML iskeleti', doc.indexOf('<!DOCTYPE html>') === 0 && doc.indexOf('</html>') > -1);

R('\n' + (fail ? fail + ' KALDI' : 'report-orchestrator testleri GECTI'));
process.exit(fail ? 1 : 0);
