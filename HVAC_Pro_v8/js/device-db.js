// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — Cihaz Veritabanı (device-db.js)
// Fancoil, WSHP, VRF, Split — kapasite tabloları
// ═══════════════════════════════════════════════════════════

const DEVICE_DB = {

// ─── FANCOİL ─────────────────────────────────────────
// Kapasiteler (FCUOS FF serisi): 04=1230W, 05=1380W, 06=2210W, 08=2590W, 10=3200W, 12=3310W, 14=5000W, 16=5070W, 20=5600W
// Tüm fancoil tipleri (duvar, döşeme, kaset, orta/yüksek kanal) aynı kapasite değerlerini kullanır
fancoil: {
  'FCU_DUVAR': {
    label:'Fancoil – Duvar Tipi',
    grup:'FANCOIL',
    tip:'FC',
    models:[
      {kod:'FCUOS04FF', sogDuy:1090, sogTop:1230, ist:1880, debi:211, pa:0},
      {kod:'FCUOS05FF', sogDuy:1190, sogTop:1380, ist:1930, debi:304, pa:0},
      {kod:'FCUOS06FF', sogDuy:1930, sogTop:2210, ist:2650, debi:517, pa:0},
      {kod:'FCUOS08FF', sogDuy:2230, sogTop:2590, ist:3740, debi:620, pa:0},
      {kod:'FCUOS10FF', sogDuy:2760, sogTop:3200, ist:4660, debi:724, pa:0},
      {kod:'FCUOS12FF', sogDuy:2890, sogTop:3310, ist:4530, debi:1062, pa:0},
      {kod:'FCUOS14FF', sogDuy:4400, sogTop:5000, ist:7030, debi:1203, pa:0},
      {kod:'FCUOS16FF', sogDuy:4490, sogTop:5070, ist:7130, debi:1285, pa:0},
      {kod:'FCUOS20FF', sogDuy:4610, sogTop:5600, ist:7710, debi:1903, pa:0},
    ]
  },
  'FCU_DOSEME': {
    label:'Fancoil – Döşeme Tipi',
    grup:'FANCOIL',
    tip:'FC',
    models:[
      {kod:'FCUOS04FF', sogDuy:1090, sogTop:1230, ist:1880, debi:211, pa:30},
      {kod:'FCUOS05FF', sogDuy:1190, sogTop:1380, ist:1930, debi:304, pa:30},
      {kod:'FCUOS06FF', sogDuy:1930, sogTop:2210, ist:2650, debi:517, pa:30},
      {kod:'FCUOS08FF', sogDuy:2230, sogTop:2590, ist:3740, debi:620, pa:30},
      {kod:'FCUOS10FF', sogDuy:2760, sogTop:3200, ist:4660, debi:724, pa:30},
      {kod:'FCUOS12FF', sogDuy:2890, sogTop:3310, ist:4530, debi:1062, pa:30},
      {kod:'FCUOS14FF', sogDuy:4400, sogTop:5000, ist:7030, debi:1203, pa:30},
      {kod:'FCUOS16FF', sogDuy:4490, sogTop:5070, ist:7130, debi:1285, pa:30},
      {kod:'FCUOS20FF', sogDuy:4610, sogTop:5600, ist:7710, debi:1903, pa:30},
    ]
  },
  'FCU_ORTA_KANAL': {
    label:'Fancoil – Orta ESP Kanallı',
    grup:'FANCOIL',
    tip:'FC',
    models:[
      {kod:'FCUOS04FF', sogDuy:1090, sogTop:1230, ist:1880, debi:211, pa:30},
      {kod:'FCUOS05FF', sogDuy:1190, sogTop:1380, ist:1930, debi:304, pa:30},
      {kod:'FCUOS06FF', sogDuy:1930, sogTop:2210, ist:2650, debi:517, pa:30},
      {kod:'FCUOS08FF', sogDuy:2230, sogTop:2590, ist:3740, debi:620, pa:30},
      {kod:'FCUOS10FF', sogDuy:2760, sogTop:3200, ist:4660, debi:724, pa:40},
      {kod:'FCUOS12FF', sogDuy:2890, sogTop:3310, ist:4530, debi:1062, pa:40},
      {kod:'FCUOS14FF', sogDuy:4400, sogTop:5000, ist:7030, debi:1203, pa:40},
      {kod:'FCUOS16FF', sogDuy:4490, sogTop:5070, ist:7130, debi:1285, pa:40},
      {kod:'FCUOS20FF', sogDuy:4610, sogTop:5600, ist:7710, debi:1903, pa:40},
    ]
  },
  'FCU_YUK_KANAL': {
    label:'Fancoil – Yüksek ESP Kanallı',
    grup:'FANCOIL',
    tip:'FC',
    models:[
      {kod:'FCUOS04FF', sogDuy:1090, sogTop:1230, ist:1880, debi:211, pa:80},
      {kod:'FCUOS05FF', sogDuy:1190, sogTop:1380, ist:1930, debi:304, pa:80},
      {kod:'FCUOS06FF', sogDuy:1930, sogTop:2210, ist:2650, debi:517, pa:80},
      {kod:'FCUOS08FF', sogDuy:2230, sogTop:2590, ist:3740, debi:620, pa:80},
      {kod:'FCUOS10FF', sogDuy:2760, sogTop:3200, ist:4660, debi:724, pa:100},
      {kod:'FCUOS12FF', sogDuy:2890, sogTop:3310, ist:4530, debi:1062, pa:100},
      {kod:'FCUOS14FF', sogDuy:4400, sogTop:5000, ist:7030, debi:1203, pa:100},
      {kod:'FCUOS16FF', sogDuy:4490, sogTop:5070, ist:7130, debi:1285, pa:100},
      {kod:'FCUOS20FF', sogDuy:4610, sogTop:5600, ist:7710, debi:1903, pa:100},
    ]
  },
  'FCU_KASET': {
    label:'Fancoil – 4 Yön Kaset',
    grup:'FANCOIL',
    tip:'FC',
    models:[
      {kod:'FCUOS04FF', sogDuy:1090, sogTop:1230, ist:1880, debi:211, pa:0},
      {kod:'FCUOS05FF', sogDuy:1190, sogTop:1380, ist:1930, debi:304, pa:0},
      {kod:'FCUOS06FF', sogDuy:1930, sogTop:2210, ist:2650, debi:517, pa:0},
      {kod:'FCUOS08FF', sogDuy:2230, sogTop:2590, ist:3740, debi:620, pa:0},
      {kod:'FCUOS10FF', sogDuy:2760, sogTop:3200, ist:4660, debi:724, pa:0},
      {kod:'FCUOS12FF', sogDuy:2890, sogTop:3310, ist:4530, debi:1062, pa:0},
      {kod:'FCUOS14FF', sogDuy:4400, sogTop:5000, ist:7030, debi:1203, pa:0},
      {kod:'FCUOS16FF', sogDuy:4490, sogTop:5070, ist:7130, debi:1285, pa:0},
      {kod:'FCUOS20FF', sogDuy:4610, sogTop:5600, ist:7710, debi:1903, pa:0},
    ]
  },
  // ── SU KAYNAKLI ISI POMPALARI (WSHP) – Atlantik EWH Serisi – 9 Model Tipi ──
  // Kaynak: Atlantik EWH Yatay Tip WSHP Teknik Kataloğu
  // Her tip tek bir modeli temsil eder; kapasite yetersizse adet otomatik artar
  // Soğutma: Net kW | Isıtma: Net kW | EER/COP değerleri katalog nominal şartlarında
  'WSHP03H': {
    label:'WSHP03H – 2.50 kW Soğ. / 2.90 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP03H', sogDuy:1800, sogTop:2500, ist:2900, debi:450, pa:20,
       eer:4.63, cop:4.83, gucSog:540, gucIst:600, suDebi:0.54, sesH:35, sesM:33, sesL:31}
    ]
  },
  'WSHP04H': {
    label:'WSHP04H – 4.10 kW Soğ. / 5.25 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP04H', sogDuy:3080, sogTop:4100, ist:5250, debi:800, pa:60,
       eer:4.02, cop:4.82, gucSog:1020, gucIst:1090, suDebi:0.88, sesH:41, sesM:37, sesL:36}
    ]
  },
  'WSHP07H': {
    label:'WSHP07H – 7.40 kW Soğ. / 8.50 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP07H', sogDuy:5460, sogTop:7400, ist:8500, debi:1260, pa:60,
       eer:4.20, cop:4.80, gucSog:1760, gucIst:1770, suDebi:1.59, sesH:49, sesM:45, sesL:42}
    ]
  },
  'WSHP10H': {
    label:'WSHP10H – 10.56 kW Soğ. / 11.96 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP10H', sogDuy:8650, sogTop:10560, ist:11960, debi:2030, pa:80,
       eer:4.74, cop:5.41, gucSog:2230, gucIst:2210, suDebi:2.27, sesH:49, sesM:46, sesL:43}
    ]
  },
  'WSHP13H': {
    label:'WSHP13H – 12.50 kW Soğ. / 16.05 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP13H', sogDuy:9380, sogTop:12500, ist:16050, debi:2340, pa:80,
       eer:4.50, cop:5.63, gucSog:2780, gucIst:2850, suDebi:2.69, sesH:55, sesM:52, sesL:49}
    ]
  },
  'WSHP15H': {
    label:'WSHP15H – 15.88 kW Soğ. / 20.90 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP15H', sogDuy:11020, sogTop:15880, ist:20900, debi:2650, pa:80,
       eer:4.10, cop:4.95, gucSog:3870, gucIst:4220, suDebi:3.41, sesH:55, sesM:52, sesL:49}
    ]
  },
  'WSHP22H': {
    label:'WSHP22H – 22.00 kW Soğ. / 29.00 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP22H', sogDuy:16500, sogTop:22000, ist:29000, debi:4300, pa:120,
       eer:4.15, cop:5.18, gucSog:5300, gucIst:5600, suDebi:4.73, sesH:58, sesM:55, sesL:52}
    ]
  },
  'WSHP30H': {
    label:'WSHP30H – 30.97 kW Soğ. / 37.90 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP30H', sogDuy:22830, sogTop:30970, ist:37900, debi:4664, pa:120,
       eer:4.12, cop:4.61, gucSog:7510, gucIst:8230, suDebi:6.47, sesH:59, sesM:56, sesL:53}
    ]
  },
  'WSHP45H': {
    label:'WSHP45H – 43.00 kW Soğ. / 58.00 kW Isı (Atlantik)',
    grup:'ISI_POMPASI', tip:'FC',
    models:[
      {kod:'WSHP45H', sogDuy:32400, sogTop:43000, ist:58000, debi:8000, pa:150,
       eer:4.50, cop:4.79, gucSog:9550, gucIst:12100, suDebi:9.25, sesH:62, sesM:62, sesL:62}
    ]
  },
},

// ─── KLİMA (VRF/SPLİT/HASSAS) ──────────────────────
// VRF Kapasiteler: 22=1900W, 28=2400W, 36=3100W, 45=3900W, 56=4800W, 71=6100W, 90=7800W, 112=9700W, 140=12200W, 160=13600W, 224=19040W, 280=23800W
// Split: SPTDU22=1900W, SPTDU28=2400W | SPTKT71=6100W, SPTKT140=14000W
klima: {
  'HASSAS': {
    label:'Hassas Kontrollü Klima',
    grup:'HASSAS',
    tip:'IDX',
    models:[
      {model:'HKIU300', tipAdi:'Hassas Klima', debi:1170, pa:40, sogTop:30000, ist:30000, index:300},
      {model:'HKIU450', tipAdi:'Hassas Klima', debi:1170, pa:40, sogTop:14500, ist:14500, index:450},
    ]
  },

  // ── SPLIT TİPLERİ ──────────────────────────────────
  'SPLIT_DUVAR': {
    label:'Split – Duvar Tipi',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTDU22', tipAdi:'Split Duvar', debi:540, pa:25, sogTop:1900, ist:1900, index:22},
      {model:'SPTDU28', tipAdi:'Split Duvar', debi:660, pa:30, sogTop:2400, ist:2400, index:28},
      {model:'SPTDU36', tipAdi:'Split Duvar', debi:720, pa:35, sogTop:3100, ist:3100, index:36},
      {model:'SPTDU45', tipAdi:'Split Duvar', debi:960, pa:40, sogTop:3900, ist:3900, index:45},
      {model:'SPTDU56', tipAdi:'Split Duvar', debi:960, pa:40, sogTop:4800, ist:4800, index:56},
      {model:'SPTDU71', tipAdi:'Split Duvar', debi:1170, pa:40, sogTop:6100, ist:6100, index:71},
    ]
  },
  'SPLIT_DOSEME': {
    label:'Split – Döşeme Tipi',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTDU22', tipAdi:'Split Döşeme', debi:540, pa:40, sogTop:1900, ist:1900, index:22},
      {model:'SPTDU28', tipAdi:'Split Döşeme', debi:540, pa:40, sogTop:2400, ist:2400, index:28},
      {model:'SPTDU36', tipAdi:'Split Döşeme', debi:720, pa:40, sogTop:3100, ist:3100, index:36},
      {model:'SPTDU45', tipAdi:'Split Döşeme', debi:960, pa:40, sogTop:3900, ist:3900, index:45},
      {model:'SPTDU56', tipAdi:'Split Döşeme', debi:960, pa:40, sogTop:4800, ist:4800, index:56},
      {model:'SPTDU71', tipAdi:'Split Döşeme', debi:1170, pa:40, sogTop:6100, ist:6100, index:71},
    ]
  },
  'SPLIT_KASET': {
    label:'Split – 4 Yön Kaset',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTDU22',  tipAdi:'Split Kaset', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'SPTDU28',  tipAdi:'Split Kaset', debi:540,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'SPTKT71',  tipAdi:'Split Kaset', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'SPTKT140', tipAdi:'Split Kaset', debi:2340, pa:80, sogTop:14000, ist:14000, index:140},
    ]
  },
  'SPLIT_4YON_KASET': {
    label:'Split – 4 Yön Kaset (Standart)',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTKT71',  tipAdi:'Split 4Yön Kaset', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'SPTKT140', tipAdi:'Split 4Yön Kaset', debi:2340, pa:80, sogTop:14000, ist:14000, index:140},
    ]
  },
  'SPLIT_ORTA_KANAL': {
    label:'Split – Orta ESP Kanallı',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTDU22',  tipAdi:'Split Orta Kanal', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'SPTDU28',  tipAdi:'Split Orta Kanal', debi:540,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'SPTKT71',  tipAdi:'Split Orta Kanal', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'SPTKT140', tipAdi:'Split Orta Kanal', debi:2340, pa:80, sogTop:14000, ist:14000, index:140},
    ]
  },
  'SPLIT_YUK_KANAL': {
    label:'Split – Yüksek ESP Kanallı',
    grup:'SPLIT',
    tip:'IDX',
    models:[
      {model:'SPTDU22',  tipAdi:'Split Yük.Kanal', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'SPTDU28',  tipAdi:'Split Yük.Kanal', debi:540,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'SPTKT71',  tipAdi:'Split Yük.Kanal', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'SPTKT140', tipAdi:'Split Yük.Kanal', debi:2340, pa:80, sogTop:14000, ist:14000, index:140},
    ]
  },

  // ── VRF TİPLERİ ────────────────────────────────────
  // VRF Duvar ve Döşeme → VRFOT/VRFKT kapasiteleri esas alınır
  'VRF_DUVAR': {
    label:'VRF – Duvar Tipi',
    grup:'VRF',
    tip:'IDX',
    models:[
      {model:'vrfdv22',  tipAdi:'VRF Duvar', debi:540,  pa:25, sogTop:2200,  ist:2200,  index:22},
      {model:'vrfdv28',  tipAdi:'VRF Duvar', debi:660,  pa:30, sogTop:2800,  ist:2800,  index:28},
      {model:'vrfdv35',  tipAdi:'VRF Duvar', debi:720,  pa:35, sogTop:3550,  ist:3550,  index:35},
      {model:'vrfdv45',  tipAdi:'VRF Duvar', debi:960,  pa:40, sogTop:3900,  ist:3900,  index:45},
      {model:'vrfdv56',  tipAdi:'VRF Duvar', debi:960,  pa:40, sogTop:4800,  ist:4800,  index:56},
      {model:'vrfdv71',  tipAdi:'VRF Duvar', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
    ]
  },
  'VRF_DOSEME': {
    label:'VRF – Döşeme Tipi',
    grup:'VRF',
    tip:'IDX',
    models:[
      {model:'vrfdo22',  tipAdi:'VRF Döşeme', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'vrfdo28',  tipAdi:'VRF Döşeme', debi:540,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'vrfdo36',  tipAdi:'VRF Döşeme', debi:600,  pa:40, sogTop:3100,  ist:3100,  index:36},
      {model:'vrfdo45',  tipAdi:'VRF Döşeme', debi:960,  pa:40, sogTop:3900,  ist:3900,  index:45},
      {model:'vrfdo56',  tipAdi:'VRF Döşeme', debi:960,  pa:40, sogTop:4800,  ist:4800,  index:56},
      {model:'vrfdo71',  tipAdi:'VRF Döşeme', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
    ]
  },
  'VRF_KASET': {
    label:'VRF – 4 Yön Kaset',
    grup:'VRF',
    tip:'IDX',
    models:[
      {model:'VRFKT22',  tipAdi:'VRF Kaset', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'VRFKT28',  tipAdi:'VRF Kaset', debi:660,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'VRFKT36',  tipAdi:'VRF Kaset', debi:600,  pa:40, sogTop:3100,  ist:3100,  index:36},
      {model:'VRFKT45',  tipAdi:'VRF Kaset', debi:960,  pa:40, sogTop:3900,  ist:3900,  index:45},
      {model:'VRFKT56',  tipAdi:'VRF Kaset', debi:960,  pa:40, sogTop:4800,  ist:4800,  index:56},
      {model:'VRFKT71',  tipAdi:'VRF Kaset', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'VRFKT90',  tipAdi:'VRF Kaset', debi:1500, pa:40, sogTop:7800,  ist:7800,  index:90},
      {model:'VRFKT112', tipAdi:'VRF Kaset', debi:1920, pa:40, sogTop:9700,  ist:9700,  index:112},
      {model:'VRFKT140', tipAdi:'VRF Kaset', debi:2160, pa:40, sogTop:12200, ist:12200, index:140},
    ]
  },
  'VRF_ORTA_KANAL': {
    label:'VRF – Orta ESP Kanallı',
    grup:'VRF',
    tip:'IDX',
    models:[
      {model:'VRFOT22',  tipAdi:'VRF Orta Kanal', debi:540,  pa:40, sogTop:1900,  ist:1900,  index:22},
      {model:'VRFOT28',  tipAdi:'VRF Orta Kanal', debi:540,  pa:40, sogTop:2400,  ist:2400,  index:28},
      {model:'VRFOT36',  tipAdi:'VRF Orta Kanal', debi:600,  pa:40, sogTop:3100,  ist:3100,  index:36},
      {model:'VRFOT45',  tipAdi:'VRF Orta Kanal', debi:960,  pa:40, sogTop:3900,  ist:3900,  index:45},
      {model:'VRFOT56',  tipAdi:'VRF Orta Kanal', debi:960,  pa:40, sogTop:4800,  ist:4800,  index:56},
      {model:'VRFOT71',  tipAdi:'VRF Orta Kanal', debi:1170, pa:40, sogTop:6100,  ist:6100,  index:71},
      {model:'VRFOT90',  tipAdi:'VRF Orta Kanal', debi:1500, pa:40, sogTop:7800,  ist:7800,  index:90},
      {model:'VRFOT112', tipAdi:'VRF Orta Kanal', debi:1920, pa:40, sogTop:9700,  ist:9700,  index:112},
      {model:'VRFOT140', tipAdi:'VRF Orta Kanal', debi:2160, pa:40, sogTop:12200, ist:12200, index:140},
      {model:'VRFOT160', tipAdi:'VRF Orta Kanal', debi:2340, pa:40, sogTop:13600, ist:13600, index:160},
    ]
  },
  'VRF_YUK_KANAL': {
    label:'VRF – Yüksek ESP Kanallı',
    grup:'VRF',
    tip:'IDX',
    models:[
      {model:'VRFYS56',  tipAdi:'VRF Yük.Kanal', debi:1080, pa:80,  sogTop:4800,  ist:4800,  index:56},
      {model:'VRFYS71',  tipAdi:'VRF Yük.Kanal', debi:1170, pa:80,  sogTop:6100,  ist:6100,  index:71},
      {model:'VRFYS90',  tipAdi:'VRF Yük.Kanal', debi:1500, pa:80,  sogTop:7800,  ist:7800,  index:90},
      {model:'VRFYS112', tipAdi:'VRF Yük.Kanal', debi:1920, pa:80,  sogTop:9700,  ist:9700,  index:112},
      {model:'VRFYS140', tipAdi:'VRF Yük.Kanal', debi:2340, pa:80,  sogTop:12200, ist:12200, index:140},
      {model:'VRFYS224', tipAdi:'VRF Yük.Kanal', debi:3480, pa:100, sogTop:19040, ist:19040, index:224},
      {model:'VRFYS280', tipAdi:'VRF Yük.Kanal', debi:4320, pa:100, sogTop:23800, ist:23800, index:280},
    ]
  },
},

// ─── Sistem → Varsayılan iç ünite tip eşleşmesi ─────
sistemDefault: {
  'fancoil':   'FCU_ORTA_KANAL',
  'wlhp':      'WSHP07H',
  'vrf':       'VRF_KASET',
  'split':     'SPLIT_ORTA_KANAL',
  'hassas':    'HASSAS',
},
};

// ══════════════════════════════════════════════════════
// ELEKTRİK VERİLERİ (Katalog bazlı, IEC standartları)
// Voltage: 220V/1~/50Hz (tek faz) veya 380V/3~/50Hz (üç faz)
// ══════════════════════════════════════════════════════
const ELEC_DB = {
  // ── VRF Duvar ──
  'vrfdv22':  {volt:'220V / 1~ / 50Hz', watt:95},
  'vrfdv28':  {volt:'220V / 1~ / 50Hz', watt:120},
  'vrfdv35':  {volt:'220V / 1~ / 50Hz', watt:135},
  'vrfdv45':  {volt:'220V / 1~ / 50Hz', watt:151},
  'vrfdv56':  {volt:'220V / 1~ / 50Hz', watt:154},
  'vrfdv71':  {volt:'220V / 1~ / 50Hz', watt:188},
  // ── VRF Döşeme ──
  'vrfdo22':  {volt:'220V / 1~ / 50Hz', watt:95},
  'vrfdo28':  {volt:'220V / 1~ / 50Hz', watt:120},
  'vrfdo36':  {volt:'220V / 1~ / 50Hz', watt:135},
  'vrfdo45':  {volt:'220V / 1~ / 50Hz', watt:151},
  'vrfdo56':  {volt:'220V / 1~ / 50Hz', watt:154},
  'vrfdo71':  {volt:'220V / 1~ / 50Hz', watt:188},
  // ── VRF Kaset (tüm kapasiteler) ──
  'VRFKT22': {volt:'220V / 1~ / 50Hz', watt:90},
  'VRFKT28': {volt:'220V / 1~ / 50Hz', watt:90},
  'VRFKT36': {volt:'220V / 1~ / 50Hz', watt:96},
  'VRFKT45': {volt:'220V / 1~ / 50Hz', watt:151},
  'VRFKT56': {volt:'220V / 1~ / 50Hz', watt:154},
  // ── VRF Kaset ──
  'VRFKT71':  {volt:'220V / 1~ / 50Hz', watt:188},
  'VRFKT90':  {volt:'220V / 1~ / 50Hz', watt:213},
  'VRFKT112': {volt:'220V / 1~ / 50Hz', watt:290},
  'VRFKT140': {volt:'220V / 1~ / 50Hz', watt:331},
  // ── VRF Orta Kanal ──
  'VRFOT22':  {volt:'220V / 1~ / 50Hz', watt:90},
  'VRFOT28':  {volt:'220V / 1~ / 50Hz', watt:90},
  'VRFOT36':  {volt:'220V / 1~ / 50Hz', watt:96},
  'VRFOT45':  {volt:'220V / 1~ / 50Hz', watt:151},
  'VRFOT56':  {volt:'220V / 1~ / 50Hz', watt:154},
  'VRFOT71':  {volt:'220V / 1~ / 50Hz', watt:188},
  'VRFOT90':  {volt:'220V / 1~ / 50Hz', watt:213},
  'VRFOT112': {volt:'220V / 1~ / 50Hz', watt:290},
  'VRFOT140': {volt:'220V / 1~ / 50Hz', watt:331},
  'VRFOT160': {volt:'220V / 1~ / 50Hz', watt:386},
  // ── VRF Yüksek Kanal ──
  'VRFYS56':  {volt:'220V / 1~ / 50Hz', watt:110},
  'VRFYS71':  {volt:'220V / 1~ / 50Hz', watt:120},
  'VRFYS90':  {volt:'220V / 1~ / 50Hz', watt:171},
  'VRFYS112': {volt:'220V / 1~ / 50Hz', watt:176},
  'VRFYS140': {volt:'220V / 1~ / 50Hz', watt:241},
  'VRFYS224': {volt:'380V / 3~ / 50Hz', watt:895},
  'VRFYS280': {volt:'380V / 3~ / 50Hz', watt:1185},
  // ── Split Duvar ──
  'SPTDU22':  {volt:'220V / 1~ / 50Hz', watt:90},
  'SPTDU28':  {volt:'220V / 1~ / 50Hz', watt:90},
  'SPTDU36':  {volt:'220V / 1~ / 50Hz', watt:120},
  'SPTDU45':  {volt:'220V / 1~ / 50Hz', watt:151},
  'SPTDU56':  {volt:'220V / 1~ / 50Hz', watt:154},
  'SPTDU71':  {volt:'220V / 1~ / 50Hz', watt:188},
  // ── Split Kaset ──
  'SPTKT71':  {volt:'220V / 1~ / 50Hz', watt:188},
  'SPTKT140': {volt:'220V / 1~ / 50Hz', watt:241},
  // ── Fancoil (FCUOS FF serisi) - tüm tipler ──
  'FCUOS04FF': {volt:'220V / 1~ / 50Hz', watt:30},
  'FCUOS05FF': {volt:'220V / 1~ / 50Hz', watt:38},
  'FCUOS06FF': {volt:'220V / 1~ / 50Hz', watt:50},
  'FCUOS08FF': {volt:'220V / 1~ / 50Hz', watt:60},
  'FCUOS10FF': {volt:'220V / 1~ / 50Hz', watt:72},
  'FCUOS12FF': {volt:'220V / 1~ / 50Hz', watt:85},
  'FCUOS14FF': {volt:'220V / 1~ / 50Hz', watt:100},
  'FCUOS16FF': {volt:'220V / 1~ / 50Hz', watt:115},
  'FCUOS20FF': {volt:'220V / 1~ / 50Hz', watt:130},
  // ── WSHP – Atlantik EWH Serisi (Su Kaynaklı Isı Pompaları) ──
  // Güç değerleri: Soğutmada çekilen güç (katalog nominal değerleri)
  // WSHP03H–10H: 220-240V/1Ph, WSHP13H–45H: 380-415V/3N~
  'WSHP03H': {volt:'220-240V / 1~ / 50Hz',   watt:540},
  'WSHP04H': {volt:'220-240V / 1~ / 50Hz',   watt:1020},
  'WSHP07H': {volt:'220-240V / 1~ / 50Hz',   watt:1760},
  'WSHP10H': {volt:'220-240V / 1~ / 50Hz',   watt:2230},
  'WSHP13H': {volt:'380-415V / 3N~ / 50Hz',  watt:2780},
  'WSHP15H': {volt:'380-415V / 3N~ / 50Hz',  watt:3870},
  'WSHP22H': {volt:'380-415V / 3N~ / 50Hz',  watt:5300},
  'WSHP30H': {volt:'380-415V / 3N~ / 50Hz',  watt:7510},
  'WSHP45H': {volt:'380-415V / 3N~ / 50Hz',  watt:9550},
  // ── Hassas Klima ──
  'HKIU300':   {volt:'380V / 3~ / 50Hz', watt:188},
  'HKIU450':   {volt:'380V / 3~ / 50Hz', watt:188},
};
function getElec(model){return ELEC_DB[model]||{volt:'220V / 1~ / 50Hz', watt:'-'};}

// ══════════════════════════════════════════════════════
// VRF DIŞ ÜNİTE VERİTABANI & SEÇİM FONKSİYONU
// ══════════════════════════════════════════════════════
const VRF_DIS_UNITE_DB = [
  {model:'RXYQ4U',  hp:4,  sogKw:12.1,  istKw:14.2,  volt:'380V / 50Hz', powerKw:3.10},
  {model:'RXYQ5U',  hp:5,  sogKw:14.0,  istKw:16.0,  volt:'380V / 50Hz', powerKw:3.85},
  {model:'RXYQ6U',  hp:6,  sogKw:16.0,  istKw:18.0,  volt:'380V / 50Hz', powerKw:4.60},
  {model:'RXYQ8U',  hp:8,  sogKw:22.4,  istKw:25.0,  volt:'380V / 50Hz', powerKw:7.10},
  {model:'RXYQ10U', hp:10, sogKw:28.0,  istKw:31.5,  volt:'380V / 50Hz', powerKw:8.20},
  {model:'RXYQ12U', hp:12, sogKw:33.5,  istKw:37.5,  volt:'380V / 50Hz', powerKw:10.40},
  {model:'RXYQ14U', hp:14, sogKw:40.0,  istKw:45.0,  volt:'380V / 50Hz', powerKw:12.80},
  {model:'RXYQ16U', hp:16, sogKw:45.0,  istKw:50.0,  volt:'380V / 50Hz', powerKw:14.30},
  {model:'RXYQ18U', hp:18, sogKw:50.4,  istKw:56.5,  volt:'380V / 50Hz', powerKw:16.20},
  {model:'RXYQ20U', hp:20, sogKw:55.9,  istKw:63.0,  volt:'380V / 50Hz', powerKw:18.50},
  {model:'RXYQ24U', hp:24, sogKw:68.0,  istKw:76.5,  volt:'380V / 50Hz', powerKw:22.10},
  {model:'RXYQ28U', hp:28, sogKw:78.5,  istKw:88.0,  volt:'380V / 50Hz', powerKw:26.40},
  {model:'RXYQ32U', hp:32, sogKw:90.0,  istKw:100.0, volt:'380V / 50Hz', powerKw:30.50},
  {model:'RXYQ36U', hp:36, sogKw:101.0, istKw:113.0, volt:'380V / 50Hz', powerKw:34.20},
  {model:'RXYQ42U', hp:42, sogKw:118.0, istKw:132.0, volt:'380V / 50Hz', powerKw:39.80},
  {model:'RXYQ48U', hp:48, sogKw:135.0, istKw:150.0, volt:'380V / 50Hz', powerKw:45.10},
  {model:'RXYQ54U', hp:54, sogKw:151.0, istKw:169.0, volt:'380V / 50Hz', powerKw:51.30},
];
const VRF_MAX_INDEKS = 1510; // sistem başına maksimum indeks

// İndekse göre dış ünite seç: indeksi 10'a böl → kW, o kW'ı karşılayan en küçük model
function vrfDisUniteSec(idxPerSistem){
  const hedefKw = idxPerSistem / 10;
  const du = VRF_DIS_UNITE_DB.find(u => u.sogKw >= hedefKw);
  return du || VRF_DIS_UNITE_DB[VRF_DIS_UNITE_DB.length-1];
}

// Global VRF özet hesabı
function vrfOzetHesapla(R){
  let toplamIdx = 0, toplamSogKw = 0;
  R.forEach(r=>{
    const c = r.cihaz || {};
    // Sadece VRF grubu iç üniteler dış ünite indeksine dahil edilir
    // SPLIT, HASSAS, Fancoil → dış ünite indeksi hesabına girmez
    if(c.grup !== 'VRF') return;
    const idx = (c.vrfIndex || 0) * (c.adet || 1);
    toplamIdx += idx;
    toplamSogKw += (r.bestLoad || 0) / 1000;
  });

  // Sistem sayısı: ceil(toplamIdx / 1510)
  const sistemSayisi = Math.max(1, toplamIdx > 0 ? Math.ceil(toplamIdx / VRF_MAX_INDEKS) : 1);

  const idxPerSistem = Math.ceil(toplamIdx / sistemSayisi);
  const sogPerSistem = toplamSogKw / sistemSayisi;

  // Dış ünite: idxPerSistem / 10 = hedef kW, o kW'ı karşılayan en küçük model
  const secilen = vrfDisUniteSec(idxPerSistem);

  return {
    toplamIdx,
    toplamSogKw: +toplamSogKw.toFixed(1),
    sistemSayisi,
    idxPerSistem,
    idxPerSistemKw: +(idxPerSistem / 10).toFixed(1),
    sogPerSistem: +sogPerSistem.toFixed(1),
    secilen
  };
}
// Global katCikar fonksiyonu
function katCikar(no){
  if(!no) return '–';
  const str=String(no);
  const m=str.match(/^([A-Za-z]+\d*)/);
  if(m) return m[1];
  const num=parseInt(str);
  if(!isNaN(num)) return Math.floor(num/100)+'00';
  return str.split('-')[0]||str;
}

// Kat bazında VRF indeks toplamı ve dış ünite seçimi
function vrfKatAnaliz(R){
  const katMap={};
  R.forEach(r=>{
    const k=katCikar(r.mahalNo);
    if(!katMap[k]) katMap[k]={mahaller:[],toplamIdx:0,toplamSogKw:0};
    const c=r.cihaz||{};
    // Sadece VRF grubu iç üniteler dış ünite indeksine dahil edilir
    if(c.grup !== 'VRF') return;
    const idx=(c.vrfIndex||0)*(c.adet||1);
    katMap[k].mahaller.push(r);
    katMap[k].toplamIdx+=idx;
    katMap[k].toplamSogKw+=(r.bestLoad||0)/1000;
  });
  // Her kat için dış ünite seç (1500 indeks sınırı)
  Object.keys(katMap).forEach(k=>{
    const kat=katMap[k];
    const toplamSog=kat.toplamSogKw;
    // 1500 indeks sınırını aşıyorsa böl
    const sistemSayisi=Math.ceil(kat.toplamIdx/VRF_MAX_INDEKS)||1;
    const sogPerSistem=toplamSog/sistemSayisi;
    const du=vrfDisUniteSec(sogPerSistem);
    kat.sistemSayisi=sistemSayisi;
    kat.disUnite=du;
    kat.toplamSogKwFinal=toplamSog;
  });
  return katMap;
}

// Cihaz seçim motoru
function cihazSec(sogYuku_W, tipKey, mahalTip, alan) {
  alan = alan || 0;
  // OUTDOOR, Depo, WC, Koridor → klima/fancoil takılmaz
  if(['OUTDOOR','DEPO','WC','KORİDOR'].includes(mahalTip)) return null;

  // ELEKTRIK odaları (HUB, CCTV, Pano vb.) → zorunlu olarak kaset klima
  if(mahalTip==='ELEKTRIK'){
    tipKey = 'SPLIT_KASET'; // Kaset tipi klima
  }
  // SERVER / IT odaları → zorunlu olarak hassas kontrollü klima
  if(mahalTip==='SERVER'){
    tipKey = 'HASSAS';
  }

  const allGroups = {...DEVICE_DB.fancoil, ...DEVICE_DB.klima};
  const grp = allGroups[tipKey];
  if(!grp) return null;

  // VRFOT160, VRFYS224, VRFYS280 otomatik seçimden çıkar (kullanıcı manuel seçebilir)
  const AUTO_EXCLUDE = ['VRFOT160','VRFYS224','VRFYS280'];
  const models = [...grp.models]
    .filter(m => !AUTO_EXCLUDE.includes(m.kod||m.model))
    .sort((a,b) => a.sogTop - b.sogTop);
  if(!models.length) return null;

  // ── Alan bazlı minimum cihaz adedi (her 40m²'de en az 1 cihaz) ──
  const minAdetByArea = alan > 0 ? Math.ceil(alan / 40) : 1;

  // ── En küçük yeterli modeli seç ─────────────────────────────────
  // Kapasiteyi karşılayan en küçük model → alan bazlı minimum adet
  const sogPerUnit = sogYuku_W / minAdetByArea;
  const single = models.find(x => x.sogTop >= sogPerUnit);
  let m, adet;
  if(single) {
    m = single;
    adet = minAdetByArea;
  } else {
    // Hiçbir tek cihaz yetmiyor → en büyük modeli çoğalt, alan minimumunu da gözetle
    m = models[models.length-1];
    adet = Math.max(Math.ceil(sogYuku_W / m.sogTop), minAdetByArea);
  }

  // ── Boru yükü: Mahal Gth / adet ────────────────────────────
  const boruSogPerCihaz = Math.round(sogYuku_W / adet);
  const istOran = m.ist && m.sogTop ? m.ist / m.sogTop : 1.0;
  const boruIstPerCihaz = Math.round(boruSogPerCihaz * istOran);

  return {
    tipKey, label:grp.label, grup:grp.grup, tipCihaz:grp.tip,
    model: grp.tip==='FC' ? m.kod : m.model,
    adet,
    sogTop:m.sogTop, sogDuy:m.sogDuy||0, ist:m.ist||0, debi:m.debi||0, index:m.index||0,
    sogKap:m.sogTop, istKap:m.ist||0, kapasite_W:m.sogTop, kapasite_BTU:Math.round(m.sogTop*3.412),
    fcBoruSog: grp.tip==='FC' ? boruSogPerCihaz : 0,
    fcBoruIst: grp.tip==='FC' ? boruIstPerCihaz : 0,
    vrfIndex:  grp.tip==='IDX' ? (m.index||0) : 0,
    mahalGth:  sogYuku_W,
  };
}



// ══════════════════════════════════════════════════════
// GLOBAL STATE
// ══════════════════════════════════════════════════════
let globalData=[], globalResults=[], globalParams={};
let selIdx = 0;  // FIX: selIdx tanımlandı

// ══════════════════════════════════════════════════════
// SİSTEM & CIHAZ YÖNETİMİ
// ══════════════════════════════════════════════════════
function onSistemChange(){
  const sis = document.getElementById('p_sistem').value;
  const defTip = DEVICE_DB.sistemDefault[sis] || 'FCU_ORTA_KANAL';
  document.getElementById('p_ic_unite').value = defTip;
}

// En küçük modeli bul, yetmiyorsa çoğalt

function renderCihazRow(mahIdx){
  const r = globalResults[mahIdx];
  if(!r || !r.cihaz) return;

  const c = r.cihaz;
  const el = document.getElementById('cihaz_info_'+mahIdx);
  if(!el) return;
  el.innerHTML = `
    <span class="ci-model">${c.model}</span> ×${c.adet}
    <span class="ci-cap">❄️ ${(c.sogTop/1000).toFixed(1)}kW ${c.ist?'🔥'+(c.ist/1000).toFixed(1)+'kW':''}</span>
    ${c.grup==='VRF'||c.grup==='SPLIT'||c.grup==='HASSAS'
      ? `<span class="ci-idx">IDX:${c.vrfIndex}×${c.adet}=${c.vrfIndex*c.adet}</span>`
      : `<span class="ci-boru">Boru:${(c.fcBoruSog/1000).toFixed(1)}kW×${c.adet}</span>`
    }`;
}
