// Gsem Mep Pro — Proje Veri Modeli / Omurga (project-schema.js)
// Tüm disiplinlerin ortak "Proje" JSON'u. SAF (DOM'suz), headless test edilebilir.
// Manuel/menü girişiyle bugün dolar; CAD katmanı sonra AYNI şemayı doldurur (yeniden yazma yok).
(function () {
  var SCHEMA_SURUM = 1;

  function createProject(over) {
    over = over || {};
    var p = {
      schema: SCHEMA_SURUM,
      meta: { proje_adi: '', proje_no: '', sehir: 'İstanbul', bina_tipi: '', kim: '', tarih: '' },
      params: { yaz_db: 33, yaz_wb: 24, kis_db: -3, ic_yaz: 24, ic_kis: 22, ic_nem: 50 },
      mahaller: [],          // {mahalNo, mahalAdi, alan, h, mahalTip, ...}
      sistemler: [],         // {disiplin, tip, ...}  (ör. {disiplin:'isitma_sogutma', tip:'vrf'})
      cihazlar: [],          // {ad, tip, kapasite, elektrik:{kW,V,faz}}
      hatlar: [],            // {disiplin, tip, dn, uzunluk, ...}  (CAD sonra doldurur)
      disiplinSonuclari: {}  // {yuk:{...}, uvalue:[...], basinc:[...], ...}
    };
    // sığ birleştir
    ['meta', 'params'].forEach(function (k) { if (over[k]) for (var x in over[k]) p[k][x] = over[k][x]; });
    ['mahaller', 'sistemler', 'cihazlar', 'hatlar'].forEach(function (k) { if (Array.isArray(over[k])) p[k] = over[k].slice(); });
    if (over.disiplinSonuclari) p.disiplinSonuclari = over.disiplinSonuclari;
    return p;
  }

  // Mevcut uygulama durumundan (globalData + globalParams) Proje kur — ADAPTÖR
  function fromGlobalData(globalData, globalParams) {
    var gp = globalParams || {};
    return createProject({
      meta: { proje_adi: gp.prjAdi || '', proje_no: gp.prjNo || '', sehir: gp.sehir || 'İstanbul', kim: gp.kim || '' },
      params: { yaz_db: gp.Tmax, kis_db: gp.kisKt, ic_yaz: gp.icKtYaz, ic_kis: gp.icKtKis, ic_nem: gp.icNem },
      mahaller: (globalData || []).slice()
    });
  }

  // report-model yer tutucuları için bağlam çıkar
  function toReportContext(p) {
    p = p || {};
    var m = p.meta || {}, mh = p.mahaller || [];
    return {
      proje_adi: m.proje_adi || '—', sehir: m.sehir || '—', tarih: m.tarih || '—',
      alan_m2: mh.reduce(function (s, r) { return s + (+r.alan || 0); }, 0).toFixed(0),
      mahal_sayisi: mh.length, kat_bilgisi: m.bina_tipi || '—',
      yaz_db: (p.params || {}).yaz_db, kis_db: (p.params || {}).kis_db,
      ic_yaz: (p.params || {}).ic_yaz, ic_kis: (p.params || {}).ic_kis, ic_nem: (p.params || {}).ic_nem
    };
  }

  function validateProject(p) {
    var issues = [];
    if (!p || p.schema !== SCHEMA_SURUM) issues.push({ seviye: 'hata', mesaj: 'Şema sürümü uyumsuz.' });
    if (!p || !(p.meta && p.meta.proje_adi)) issues.push({ seviye: 'uyari', mesaj: 'Proje adı boş.' });
    if (!p || !Array.isArray(p.mahaller) || p.mahaller.length === 0) issues.push({ seviye: 'uyari', mesaj: 'Mahal listesi boş.' });
    return issues;
  }

  var api = { SCHEMA_SURUM: SCHEMA_SURUM, createProject: createProject, fromGlobalData: fromGlobalData, toReportContext: toReportContext, validateProject: validateProject };
  if (typeof window !== 'undefined') window.ProjectSchema = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
