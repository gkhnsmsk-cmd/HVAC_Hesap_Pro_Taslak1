const PS = require('../HVAC_Pro_v8/js/project-schema.js');
const R = m => process.stdout.write(m + '\n');
let fail = 0; const ok = (a, k) => { R((k ? '  OK   ' : '  KALDI ') + a); if (!k) fail++; };

const p = PS.createProject({ meta: { proje_adi: 'Forum One' }, mahaller: [{ mahalNo: 'G01', alan: 20 }, { mahalNo: 'G02', alan: 10 }] });
ok('schema sürümü', p.schema === PS.SCHEMA_SURUM);
ok('meta birleşti', p.meta.proje_adi === 'Forum One' && p.meta.sehir === 'İstanbul');
ok('mahaller kopyalandı', p.mahaller.length === 2);
ok('boş diziler var', Array.isArray(p.sistemler) && Array.isArray(p.hatlar));

const g = PS.fromGlobalData([{ mahalNo: 'A', alan: 26.5 }], { prjAdi: 'Proje X', sehir: 'Ankara', Tmax: 35, kisKt: -6 });
ok('adaptör: mahal aktarıldı', g.mahaller.length === 1 && g.mahaller[0].alan === 26.5);
ok('adaptör: meta aktarıldı', g.meta.proje_adi === 'Proje X' && g.meta.sehir === 'Ankara');
ok('adaptör: params aktarıldı', g.params.yaz_db === 35 && g.params.kis_db === -6);

const ctx = PS.toReportContext(g);
ok('rapor bağlamı: alan toplamı', ctx.alan_m2 === '27' || ctx.alan_m2 === '26');
ok('rapor bağlamı: mahal sayısı', ctx.mahal_sayisi === 1);

const iss = PS.validateProject(PS.createProject({}));
ok('doğrulama: boş proje uyarı verir', iss.length >= 1);

// round-trip (JSON güvenli)
const rt = JSON.parse(JSON.stringify(p));
ok('round-trip: JSON güvenli', rt.mahaller[0].mahalNo === 'G01');

R('\n' + (fail ? fail + ' KALDI' : 'project-schema testleri GECTI'));
process.exit(fail ? 1 : 0);
