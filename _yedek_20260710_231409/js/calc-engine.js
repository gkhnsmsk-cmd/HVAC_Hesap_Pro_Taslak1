// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — Hesap Motoru (calc-engine.js)
// ASHRAE CLTD/CLF + MTH yöntemi | 41°N referans
// Düzeltmeler: SC×1.15 kaldırıldı, döşeme dtK düzeltildi,
//   tavan CLTD×1.8, skylight SHGF×2.0, KONUT/MAĞAZA eklendi
// ═══════════════════════════════════════════════════════════

function hourlyExtTemp(t_, T_max, DR){
  return T_max - DR*(1-Math.cos(Math.PI*(t_-14)/12))/2;
}

// ─── Aylık ortalama dış sıcaklık peak değerleri (İstanbul 41°N) ──
// [Tmax_yaz°C, DR°C]
const AYLIK_TMAX = {
  1:[10.0,8], 2:[11.5,8], 3:[14.5,9], 4:[19.5,10], 5:[25.0,10], 6:[29.5,10],
  7:[32.0,10], 8:[31.5,10], 9:[27.5,10], 10:[21.0,10], 11:[15.0,9], 12:[10.5,8]
};

// ─── SHGF – Güneş Isı Kazanç Faktörü (W/m²) ─────────────────────
// Fizik tabanlı: ASHRAE clear-sky model, 41°N, yön × ay × saat (0-23)
// Formül: q = SHGF[ay][yön][saat] × SHGC × gölge_katsayısı


const SHGF = {
  1: {
    'kuzey':     [0,0,0,0,0,0,0,5,83,103,111,114,114,111,103,83,5,0,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,0,5,83,103,111,114,114,111,103,137,18,0,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,0,5,83,103,111,114,250,499,678,684,49,0,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,0,5,83,241,482,713,905,1031,1054,880,55,0,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,0,31,608,872,1024,1097,1097,1024,872,608,31,0,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,0,55,880,1054,1031,905,713,482,241,83,5,0,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,0,49,684,678,499,250,114,111,103,83,5,0,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,0,18,137,103,111,114,114,111,103,83,5,0,0,0,0,0,0,0],
  },
  2: {
    'kuzey':     [0,0,0,0,0,0,0,64,100,111,116,118,118,116,111,100,64,0,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,0,64,100,111,116,118,118,116,111,244,276,0,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,0,64,100,111,116,118,265,540,757,853,625,0,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,0,64,100,179,431,674,882,1030,1092,1020,645,0,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,0,324,648,852,985,1052,1052,985,852,648,324,0,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,0,645,1020,1092,1030,882,674,431,179,100,64,0,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,0,625,853,757,540,265,118,116,111,100,64,0,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,0,276,244,111,116,118,118,116,111,100,64,0,0,0,0,0,0,0],
  },
  3: {
    'kuzey':     [0,0,0,0,0,0,30,92,108,115,118,120,120,118,115,108,92,30,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,30,92,108,115,118,120,120,118,160,380,500,211,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,30,92,108,115,118,120,273,563,802,950,923,320,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,30,92,108,115,328,578,795,956,1042,1027,859,259,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,64,346,566,739,859,921,921,859,739,566,346,64,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,259,859,1027,1042,956,795,578,328,115,108,92,30,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,320,923,950,802,563,273,120,118,115,108,92,30,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,211,500,380,160,118,120,120,118,115,108,92,30,0,0,0,0,0,0],
  },
  4: {
    'kuzey':     [0,0,0,0,0,0,110,101,111,116,118,119,119,118,116,111,101,110,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,77,101,111,116,118,119,119,118,288,508,657,623,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,77,101,111,116,118,119,269,554,795,960,1005,816,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,77,101,111,116,193,436,648,810,904,915,824,576,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,77,220,399,551,660,717,717,660,551,399,220,77,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,576,824,915,904,810,648,436,193,116,111,101,77,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,816,1005,960,795,554,269,119,118,116,111,101,77,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,623,657,508,288,118,119,119,118,116,111,101,77,0,0,0,0,0,0],
  },
  5: {
    'kuzey':     [0,0,0,0,0,194,232,112,110,114,116,117,117,116,114,110,112,232,194,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,46,88,103,110,114,116,117,117,144,375,584,736,764,449,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,46,88,103,110,114,116,117,259,529,759,923,989,901,469,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,46,88,103,110,114,116,317,517,672,765,786,723,562,241,0,0,0,0,0],
    'güney':     [0,0,0,0,0,46,88,103,253,390,489,541,541,489,390,253,103,88,46,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,241,562,723,786,765,672,517,317,116,114,110,103,88,46,0,0,0,0,0],
    'batı':      [0,0,0,0,0,469,901,989,923,759,529,259,117,116,114,110,103,88,46,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,449,764,736,584,375,144,117,117,116,114,110,103,88,46,0,0,0,0,0],
  },
  6: {
    'kuzey':     [0,0,0,0,0,281,286,173,109,113,115,116,116,115,113,109,173,286,281,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,60,91,103,109,113,115,116,116,190,411,611,758,800,592,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,60,91,103,109,113,115,116,252,511,732,891,960,898,592,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,60,91,103,109,113,115,259,451,600,691,713,660,523,280,0,0,0,0,0],
    'güney':     [0,0,0,0,0,60,91,103,182,311,405,454,454,405,311,182,103,91,60,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,280,523,660,713,691,600,451,259,115,113,109,103,91,60,0,0,0,0,0],
    'batı':      [0,0,0,0,0,592,898,960,891,732,511,252,116,115,113,109,103,91,60,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,592,800,758,611,411,190,116,116,115,113,109,103,91,60,0,0,0,0,0],
  },
  7: {
    'kuzey':     [0,0,0,0,0,234,257,143,109,113,115,115,115,115,113,109,143,257,234,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,52,88,102,109,113,115,115,115,168,391,593,739,772,516,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,52,88,102,109,113,115,115,253,515,738,897,962,886,526,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,52,88,102,109,113,115,283,478,628,718,739,681,533,259,0,0,0,0,0],
    'güney':     [0,0,0,0,0,52,88,102,212,344,440,490,490,440,344,212,102,88,52,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,259,533,681,739,718,628,478,283,115,113,109,102,88,52,0,0,0,0,0],
    'batı':      [0,0,0,0,0,526,886,962,897,738,515,253,115,115,113,109,102,88,52,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,516,772,739,593,391,168,115,115,115,113,109,102,88,52,0,0,0,0,0],
  },
  8: {
    'kuzey':     [0,0,0,0,0,45,150,99,108,112,115,116,116,115,112,108,99,150,45,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,13,79,99,108,112,115,116,116,115,316,526,669,655,121,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,13,79,99,108,112,115,116,260,534,765,924,972,823,134,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,13,79,99,108,112,148,381,585,741,832,845,763,554,75,0,0,0,0,0],
    'güney':     [0,0,0,0,0,13,79,166,333,477,581,635,635,581,477,333,166,79,13,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,75,554,763,845,832,741,585,381,148,112,108,99,79,13,0,0,0,0,0],
    'batı':      [0,0,0,0,0,134,823,972,924,765,534,260,116,115,112,108,99,79,13,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,121,655,669,526,316,115,116,116,115,112,108,99,79,13,0,0,0,0,0],
  },
  9: {
    'kuzey':     [0,0,0,0,0,0,50,93,107,113,116,117,117,116,113,107,93,50,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,50,93,107,113,116,117,117,116,200,415,540,370,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,50,93,107,113,116,117,267,550,785,935,932,532,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,50,93,107,113,276,520,731,890,976,969,832,412,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,80,299,498,661,776,836,836,776,661,498,299,80,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,412,832,969,976,890,731,520,276,113,107,93,50,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,532,932,935,785,550,267,117,116,113,107,93,50,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,370,540,415,200,116,117,117,116,113,107,93,50,0,0,0,0,0,0],
  },
  10: {
    'kuzey':     [0,0,0,0,0,0,0,73,100,110,115,117,117,115,110,100,73,0,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,0,73,100,110,115,117,117,115,110,280,341,0,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,0,73,100,110,115,117,264,539,759,870,722,0,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,0,73,100,144,394,636,844,994,1062,1010,723,0,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,0,343,617,807,934,999,999,934,807,617,343,0,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,0,723,1010,1062,994,844,636,394,144,100,73,0,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,0,722,870,759,539,264,117,115,110,100,73,0,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,0,341,280,110,115,117,117,115,110,100,73,0,0,0,0,0,0,0],
  },
  11: {
    'kuzey':     [0,0,0,0,0,0,0,20,87,104,111,114,114,111,104,87,20,0,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,0,20,87,104,111,114,114,111,104,159,75,0,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,0,20,87,104,111,114,251,505,691,722,195,0,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,0,20,87,225,467,699,893,1023,1055,912,213,0,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,0,118,619,862,1007,1078,1078,1007,862,619,118,0,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,0,213,912,1055,1023,893,699,467,225,87,20,0,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,0,195,722,691,505,251,114,111,104,87,20,0,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,0,75,159,104,111,114,114,111,104,87,20,0,0,0,0,0,0,0],
  },
  12: {
    'kuzey':     [0,0,0,0,0,0,0,0,75,100,109,112,112,109,100,75,0,0,0,0,0,0,0,0],
    'kuzeydoğu': [0,0,0,0,0,0,0,0,75,100,109,112,112,109,100,108,0,0,0,0,0,0,0,0],
    'doğu':      [0,0,0,0,0,0,0,0,75,100,109,112,244,483,647,613,0,0,0,0,0,0,0,0],
    'güneydoğu': [0,0,0,0,0,0,0,0,75,251,489,715,901,1019,1025,804,0,0,0,0,0,0,0,0],
    'güney':     [0,0,0,0,0,0,0,0,567,861,1021,1097,1097,1021,861,567,0,0,0,0,0,0,0,0],
    'güneybatı': [0,0,0,0,0,0,0,0,804,1025,1019,901,715,489,251,75,0,0,0,0,0,0,0,0],
    'batı':      [0,0,0,0,0,0,0,0,613,647,483,244,112,109,100,75,0,0,0,0,0,0,0,0],
    'kuzeybatı': [0,0,0,0,0,0,0,0,108,100,109,112,112,109,100,75,0,0,0,0,0,0,0,0],
  },
};

// ─── CLTD – Aylık düzeltmeli dış duvar ısı kazancı ───────────────
// ASHRAE Grup D duvar, 40°N referans. Aylık Tmax farkı otomatik uygulanır.
// Tablo: yön × saat (W/m²·°C eşdeğeri)
const CLTD_BASE = {
  kuzey:    [5,4,4,4,4,4,5,6,7,8,9,9,10,10,10,10,9,8,7,7,6,6,6,5],
  güney:    [3,3,2,2,2,2,3,4,5,6,7,8,9,9,9,9,9,8,8,7,7,6,5,4],
  doğu:     [4,3,3,3,3,3,4,6,9,12,14,14,13,11,10,9,8,7,7,6,5,5,5,4],
  batı:     [4,3,3,3,3,3,3,4,5,6,7,8,9,10,11,13,15,14,13,11,9,8,6,5],
  kuzeydoğu:[4,3,3,3,3,3,4,6,8,10,11,11,10,9,8,7,7,6,6,5,5,5,5,4],
  güneydoğu:[3,3,2,2,2,2,3,5,8,11,13,13,12,10,9,8,7,7,6,5,5,4,4,3],
  güneybatı:[4,3,3,3,3,3,3,4,5,6,7,8,9,10,12,14,15,14,12,10,8,7,5,4],
  kuzeybatı:[5,4,4,4,4,4,4,5,6,7,8,9,9,9,10,11,12,12,11,9,8,7,6,5]
};

const YONLER = ['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];




// ─── CLF – Soğutma Yük Faktörü (ASHRAE 1997, Tablo 36) ──────────
// Medium yapı, gölgesiz cam. CLF[yön][saat(0-23)]
// İç gölgeli veya güneşten korumalı cam için CLF=1.0 (golge=1)
// SC = SHGC × 1.15 (ASHRAE dönüşüm)
const CLF_TBL = {
  'kuzey':     [0.87,0.87,0.87,0.87,0.87,0.87,0.87,0.87,0.87,0.85,0.83,0.82,0.80,0.79,0.78,0.77,0.76,0.76,0.75,0.83,0.86,0.87,0.87,0.87],
  'kuzeydoğu': [0.24,0.20,0.18,0.16,0.14,0.12,0.64,0.84,0.80,0.68,0.55,0.43,0.36,0.31,0.27,0.24,0.22,0.20,0.19,0.25,0.28,0.27,0.26,0.25],
  'doğu':      [0.24,0.20,0.18,0.16,0.14,0.12,0.38,0.77,0.87,0.85,0.75,0.62,0.49,0.40,0.34,0.29,0.26,0.23,0.21,0.26,0.29,0.28,0.27,0.26],
  'güneydoğu': [0.27,0.23,0.20,0.18,0.16,0.14,0.22,0.50,0.71,0.83,0.86,0.84,0.77,0.65,0.52,0.43,0.36,0.31,0.28,0.32,0.36,0.35,0.33,0.30],
  'güney':     [0.33,0.29,0.26,0.23,0.21,0.19,0.17,0.18,0.24,0.36,0.54,0.72,0.84,0.84,0.75,0.58,0.44,0.36,0.30,0.36,0.40,0.40,0.38,0.36],
  'güneybatı': [0.36,0.31,0.27,0.25,0.22,0.20,0.18,0.17,0.16,0.20,0.31,0.51,0.70,0.83,0.87,0.84,0.74,0.61,0.48,0.49,0.52,0.51,0.47,0.41],
  'batı':      [0.30,0.25,0.22,0.20,0.18,0.16,0.14,0.13,0.13,0.15,0.20,0.27,0.41,0.60,0.77,0.87,0.87,0.79,0.63,0.53,0.48,0.44,0.40,0.35],
  'kuzeybatı': [0.25,0.21,0.19,0.17,0.15,0.13,0.12,0.11,0.11,0.12,0.14,0.17,0.23,0.34,0.52,0.71,0.82,0.80,0.63,0.47,0.40,0.37,0.33,0.29],
};
// Cam radyasyon: ASHRAE CLTD/CLF yöntemi
// q = SHGF × A × SHGC × CLF   (Kullanıcı SHGC giriyor; SC→SHGC dönüşümü YAPILMAZ)
// NOT: ASHRAE SC = SHGC × 1.15 dönüşümü yalnızca ESKİ SC değerini SHGC'ye çevirirken kullanılır.
// Kullanıcı doğrudan SHGC girdiğinde 1.15 çarpmak solar yükü ~%15 şişirir — KALDIRILDI.
function camRad(yon, ay, saat, shgc, golge) {
  const shgf = (SHGF[ay] && SHGF[ay][yon]) ? SHGF[ay][yon][saat] : 0;
  const sc   = shgc;  // Kullanıcı SHGC giriyor; ayrıca 1.15 çarpmak YANLIŞ olur
  // Gölgeli cam (golge<1): CLF yaklaşık 1.0 (iç gölge anında ısı)
  // Gölgesiz cam (golge=1): ASHRAE CLF tablosundan
  const clf  = golge < 0.95 ? 1.0 : (CLF_TBL[yon] ? CLF_TBL[yon][saat] : 0.8);
  return shgf * sc * clf * golge;
}


// CLTD: ASHRAE düzeltme formülü – hem sıcaklık hem ay farkı hesaba katılır
function cltdD(yon, saat, ay, Tic, P) {
  const base = (CLTD_BASE[yon]||CLTD_BASE.kuzey)[saat];
  // Kullanıcının P.Tmax ve P.DR değerlerine göre ölçeklendirilmiş aylık Tmax
  const _tmax_ref_cltd = 32.0;
  const _pTmax_cltd = +((P&&P.Tmax)||32);
  const Tmax_ay = AYLIK_TMAX[ay][0] * (_pTmax_cltd / _tmax_ref_cltd);
  // ASHRAE CLTD düzeltme: (25.5 - Ti) + (Tmax - 29.4)
  // Tmax olarak kullanıcı şehrine göre ölçeklendirilmiş değeri kullan
  return base + (25.5 - Tic) + (Tmax_ay - 29.4);
}





function procFile(f, settings = null){
  const r=new FileReader();
  r.onload=e=>{
    try{
      const wb=XLSX.read(e.target.result,{type:'binary', cellFormula:false, cellNF:false});
      // raw:false → formüllü hücreleri hesaplanmış değerleriyle okur
      const data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{raw:false, defval:0});
      if(!data.length) throw new Error('Boş dosya');
      // Sayısal dönüşüm: string sayıları number'a çevir
      const cleaned = data.map(row=>{
        const out={};
        for(const [k,v] of Object.entries(row)){
          // Türkçe karakterli kolon adlarını normalize et
          let normalizedKey = k;
          if(k === 'mahal adı') normalizedKey = 'mahalAdi';
          else if(k === 'mahal no') normalizedKey = 'mahalNo';
          else if(k === 'yükseklik') normalizedKey = 'h';
          else if(k === 'duvar u değeri') normalizedKey = 'duvarU';
          else if(k === 'pencere u değeri') normalizedKey = 'pencereU';
          else if(k === 'skylight u değeri') normalizedKey = 'skylightU';
          else if(k === 'döşeme u değeri') normalizedKey = 'dösemeU';
          else if(k === 'çatı u değeri') normalizedKey = 'catiU';
          else if(k === 'İç Sıcaklık- Yaz') normalizedKey = 'Tic_yaz';
          else if(k === 'İç Sıcaklık- Kış') normalizedKey = 'Tic_kis';
          else if(k === 'tavan durumu' || k === 'Tavan Durumu' || k === 'tavan_durumu' || k === 'tavanDurumu') normalizedKey = 'tavanDurumu';
          
          if(v===''||v===null||v===undefined) out[normalizedKey]=0;
          else if(typeof v==='string' && v.trim()!=='' && !isNaN(v.replace(',','.'))) out[normalizedKey]=+v.replace(',','.');
          else out[normalizedKey]=v;
        }
        return out;
      });
      globalData=cleaned;
      document.getElementById('fileStatus').innerHTML=`<div class="file-loaded">✓ ${f.name} – <strong>${cleaned.length} mahal</strong></div>`;
      document.getElementById('runBtn').disabled=false;
      
      // Eğer ayarlar varsa uygula
      if(settings) {
        setTimeout(() => {
          if(settings.sehir) document.getElementById('p_sehir').value = settings.sehir;
          if(settings.sistem) document.getElementById('p_sistem').value = settings.sistem;
          if(settings.icUnite) document.getElementById('p_ic_unite').value = settings.icUnite;
          if(settings.yazKt) document.getElementById('p_yaz_kt').value = settings.yazKt;
          if(settings.yazYt) document.getElementById('p_yaz_yt').value = settings.yazYt;
          if(settings.kisKt) document.getElementById('p_kis_kt').value = settings.kisKt;
          if(settings.dr) document.getElementById('p_dr').value = settings.dr;
          if(settings.odaZam) document.getElementById('p_oda_zam').value = settings.odaZam;
          if(settings.effZam) document.getElementById('p_eff_zam').value = settings.effZam;
          if(settings.fayd) document.getElementById('p_fayd').value = settings.fayd;
          if(settings.shgc) document.getElementById('p_shgc').value = settings.shgc;
          if(settings.prjNo) document.getElementById('p_prjno').value = settings.prjNo;
          if(settings.kim) document.getElementById('p_kim').value = settings.kim;
          if(settings.prjAdi) document.getElementById('p_prjadi').value = settings.prjAdi;
        }, 100);
      }
    }catch(ex){alert(t.lang === 'en' ? 'File read error: '+ex.message : 'Dosya okuma hatası: '+ex.message); console.error(ex);}
  };
  r.readAsBinaryString(f);
}



// ══════════════════════════════════════════════════════
// HESAP ÇALIŞTIR
// ══════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════
// 81 İL VERİTABANI [YazKT, YazYT, KışKT, DR, Enlem]
// ══════════════════════════════════════════════════════
const SEHIR_DB = {
  'Adana':[35.0,26.0,-1.5,10,37.0],'Adıyaman':[37.0,25.0,-4.0,13,37.7],
  'Afyonkarahisar':[30.0,20.0,-10.0,13,38.7],'Ağrı':[28.0,18.0,-20.0,15,39.7],
  'Aksaray':[31.0,19.0,-9.0,14,38.4],'Amasya':[32.0,23.0,-8.0,12,40.7],
  'Ankara':[33.0,21.0,-9.0,13,39.9],'Antalya':[35.0,25.0,2.0,8,36.9],
  'Ardahan':[25.0,16.0,-25.0,14,41.1],'Artvin':[29.0,21.0,-5.0,10,41.2],
  'Aydın':[36.0,25.0,-1.0,10,37.8],'Balıkesir':[32.0,23.0,-4.0,10,39.6],
  'Bartın':[29.0,22.0,-4.0,9,41.6],'Batman':[38.0,24.0,-5.0,13,37.9],
  'Bayburt':[27.0,17.0,-18.0,14,40.3],'Bilecik':[30.0,21.0,-7.0,12,40.1],
  'Bingöl':[32.0,21.0,-9.0,13,38.9],'Bitlis':[27.0,18.0,-12.0,12,38.4],
  'Bolu':[28.0,19.0,-10.0,12,40.7],'Burdur':[31.0,21.0,-5.0,12,37.7],
  'Bursa':[32.0,23.0,-4.0,10,40.2],'Çanakkale':[31.0,23.0,-2.0,9,40.1],
  'Çankırı':[30.0,20.0,-10.0,13,40.6],'Çorum':[30.0,20.0,-10.0,13,40.5],
  'Denizli':[34.0,23.0,-2.0,11,37.8],'Diyarbakır':[38.0,24.0,-6.0,14,37.9],
  'Düzce':[29.0,22.0,-5.0,10,40.8],'Edirne':[32.0,23.0,-5.0,11,41.7],
  'Elazığ':[35.0,23.0,-7.0,13,38.7],'Erzincan':[30.0,20.0,-13.0,14,39.7],
  'Erzurum':[26.0,16.0,-22.0,14,39.9],'Eskişehir':[30.0,20.0,-11.0,13,39.8],
  'Gaziantep':[36.0,24.0,-3.0,13,37.1],'Giresun':[28.0,22.0,-1.0,9,40.9],
  'Gümüşhane':[27.0,18.0,-14.0,14,40.5],'Hakkari':[28.0,18.0,-12.0,14,37.6],
  'Hatay':[33.0,25.0,1.0,9,36.2],'Iğdır':[35.0,22.0,-12.0,14,39.9],
  'Isparta':[30.0,20.0,-7.0,12,37.8],'İstanbul':[33.0,24.0,-3.0,10,41.0],
  'İzmir':[34.0,24.0,1.0,9,38.4],'Kahramanmaraş':[36.0,24.0,-3.0,13,37.6],
  'Karabük':[28.0,20.0,-9.0,12,41.2],'Karaman':[31.0,20.0,-8.0,13,37.2],
  'Kars':[24.0,15.0,-25.0,14,40.6],'Kastamonu':[28.0,19.0,-12.0,12,41.4],
  'Kayseri':[30.0,19.0,-12.0,13,38.7],'Kırıkkale':[31.0,21.0,-10.0,13,39.8],
  'Kırklareli':[31.0,23.0,-6.0,11,41.7],'Kırşehir':[30.0,20.0,-10.0,13,39.1],
  'Kilis':[37.0,26.0,-1.0,12,36.7],'Kocaeli':[30.0,23.0,-3.0,10,40.8],
  'Konya':[31.0,20.0,-10.0,13,37.9],'Kütahya':[29.0,20.0,-10.0,13,39.4],
  'Malatya':[35.0,23.0,-7.0,13,38.4],'Manisa':[35.0,24.0,-1.0,10,38.6],
  'Mardin':[38.0,25.0,-4.0,13,37.3],'Mersin':[34.0,26.0,2.0,8,36.8],
  'Muğla':[34.0,24.0,0.0,10,37.2],'Muş':[30.0,20.0,-15.0,13,38.7],
  'Nevşehir':[29.0,19.0,-10.0,13,38.6],'Niğde':[29.0,19.0,-10.0,13,37.9],
  'Ordu':[28.0,22.0,-1.0,9,41.0],'Osmaniye':[35.0,25.0,-1.0,11,37.1],
  'Rize':[27.0,22.0,0.0,8,41.1],'Sakarya':[30.0,23.0,-4.0,10,40.7],
  'Samsun':[29.0,22.0,-2.0,9,41.3],'Siirt':[38.0,24.0,-5.0,13,37.9],
  'Sinop':[27.0,21.0,-2.0,9,42.0],'Sivas':[28.0,18.0,-14.0,14,39.7],
  'Şanlıurfa':[40.0,26.0,-2.0,14,37.2],'Şırnak':[37.0,23.0,-6.0,13,37.5],
  'Tekirdağ':[31.0,23.0,-4.0,10,40.9],'Tokat':[30.0,21.0,-10.0,12,40.3],
  'Trabzon':[27.0,22.0,1.0,8,41.0],'Tunceli':[31.0,21.0,-10.0,14,39.1],
  'Uşak':[32.0,22.0,-5.0,12,38.7],'Van':[28.0,18.0,-14.0,13,38.5],
  'Yalova':[30.0,23.0,-3.0,10,40.7],'Yozgat':[28.0,18.0,-13.0,13,39.8],
  'Zonguldak':[28.0,22.0,-3.0,9,41.5],
  // ═══ GLOBAL ŞEHİRLER (ASHRAE Standardı) ═══
  // AVRUPA
  'London, UK':[28.0,19.0,-2.0,8,51.5],'Paris, France':[32.0,21.0,-3.0,9,48.9],
  'Berlin, Germany':[30.0,20.0,-8.0,10,52.5],'Madrid, Spain':[37.0,22.0,-2.0,12,40.4],
  'Rome, Italy':[34.0,22.0,0.0,10,41.9],'Amsterdam, Netherlands':[28.0,19.0,-3.0,8,52.4],
  'Brussels, Belgium':[28.0,19.0,-4.0,8,50.8],'Vienna, Austria':[31.0,21.0,-8.0,10,48.2],
  'Athens, Greece':[35.0,24.0,2.0,10,38.0],'Lisbon, Portugal':[32.0,22.0,4.0,9,38.7],
  'Stockholm, Sweden':[26.0,18.0,-12.0,9,59.3],'Oslo, Norway':[25.0,17.0,-12.0,9,59.9],
  'Copenhagen, Denmark':[27.0,19.0,-6.0,8,55.7],'Helsinki, Finland':[26.0,18.0,-15.0,9,60.2],
  'Warsaw, Poland':[30.0,20.0,-10.0,10,52.2],'Prague, Czech Republic':[30.0,20.0,-10.0,10,50.1],
  'Budapest, Hungary':[32.0,22.0,-8.0,11,47.5],'Bucharest, Romania':[33.0,22.0,-10.0,12,44.4],
  'Sofia, Bulgaria':[32.0,21.0,-8.0,11,42.7],'Zurich, Switzerland':[29.0,20.0,-7.0,10,47.4],
  'Geneva, Switzerland':[30.0,20.0,-5.0,10,46.2],'Munich, Germany':[30.0,20.0,-10.0,11,48.1],
  'Barcelona, Spain':[32.0,24.0,2.0,9,41.4],'Milan, Italy':[33.0,23.0,-3.0,10,45.5],
  // KÖRFEZ & ORTA DOĞU
  'Dubai, UAE':[45.0,30.0,10.0,14,25.3],'Abu Dhabi, UAE':[45.0,31.0,11.0,13,24.5],
  'Doha, Qatar':[46.0,31.0,10.0,13,25.3],'Kuwait City, Kuwait':[48.0,30.0,4.0,15,29.4],
  'Riyadh, Saudi Arabia':[46.0,28.0,4.0,16,24.7],'Jeddah, Saudi Arabia':[42.0,32.0,14.0,10,21.5],
  'Mecca, Saudi Arabia':[44.0,30.0,12.0,12,21.4],'Medina, Saudi Arabia':[44.0,26.0,6.0,15,24.5],
  'Muscat, Oman':[44.0,32.0,14.0,12,23.6],'Manama, Bahrain':[45.0,32.0,10.0,12,26.2],
  'Tehran, Iran':[38.0,22.0,-4.0,16,35.7],'Baghdad, Iraq':[47.0,26.0,1.0,15,33.3],
  'Damascus, Syria':[38.0,22.0,-2.0,14,33.5],'Amman, Jordan':[34.0,20.0,0.0,13,31.9],
  'Beirut, Lebanon':[32.0,25.0,8.0,8,33.9],'Jerusalem, Israel':[32.0,20.0,2.0,12,31.8],
  'Tel Aviv, Israel':[32.0,25.0,6.0,9,32.1],'Cairo, Egypt':[40.0,24.0,8.0,12,30.0],
  'Alexandria, Egypt':[32.0,26.0,9.0,8,31.2],
  // ASYA
  'Tokyo, Japan':[34.0,27.0,-2.0,9,35.7],'Osaka, Japan':[35.0,27.0,-1.0,9,34.7],
  'Seoul, South Korea':[33.0,26.0,-12.0,10,37.6],'Beijing, China':[35.0,26.0,-10.0,11,39.9],
  'Shanghai, China':[35.0,28.0,-2.0,9,31.2],'Hong Kong':[33.0,29.0,10.0,7,22.3],
  'Singapore':[33.0,28.0,24.0,6,1.3],'Bangkok, Thailand':[36.0,29.0,18.0,8,13.8],
  'Manila, Philippines':[34.0,29.0,22.0,7,14.6],'Kuala Lumpur, Malaysia':[34.0,28.0,23.0,7,3.1],
  'Jakarta, Indonesia':[33.0,28.0,23.0,7,-6.2],'Hanoi, Vietnam':[36.0,29.0,10.0,10,21.0],
  'New Delhi, India':[43.0,28.0,4.0,14,28.6],'Mumbai, India':[35.0,30.0,15.0,8,19.1],
  'Bangalore, India':[34.0,24.0,12.0,10,13.0],'Karachi, Pakistan':[38.0,28.0,8.0,11,24.9],
  'Lahore, Pakistan':[43.0,28.0,2.0,14,31.5],'Dhaka, Bangladesh':[36.0,30.0,10.0,9,23.8],
  'Colombo, Sri Lanka':[33.0,28.0,22.0,6,6.9],
  // KUZEY AMERİKA
  'New York, USA':[32.0,24.0,-10.0,10,40.7],'Los Angeles, USA':[32.0,20.0,6.0,12,34.1],
  'Chicago, USA':[33.0,24.0,-18.0,11,41.9],'Houston, USA':[36.0,27.0,0.0,10,29.8],
  'Miami, USA':[33.0,28.0,10.0,7,25.8],'San Francisco, USA':[27.0,16.0,4.0,12,37.8],
  'Phoenix, USA':[45.0,25.0,2.0,18,33.4],'Las Vegas, USA':[43.0,22.0,0.0,18,36.2],
  'Seattle, USA':[29.0,18.0,-4.0,12,47.6],'Boston, USA':[31.0,23.0,-12.0,10,42.4],
  'Washington DC, USA':[33.0,25.0,-8.0,11,38.9],'Dallas, USA':[38.0,25.0,-4.0,12,32.8],
  'Atlanta, USA':[34.0,25.0,-4.0,11,33.7],'Denver, USA':[34.0,16.0,-16.0,15,39.7],
  'Toronto, Canada':[31.0,23.0,-18.0,11,43.7],'Montreal, Canada':[30.0,23.0,-22.0,11,45.5],
  'Vancouver, Canada':[26.0,18.0,-2.0,10,49.2],'Calgary, Canada':[28.0,16.0,-28.0,14,51.0],
  'Mexico City, Mexico':[28.0,16.0,4.0,13,19.4],
  // GÜNEY AMERİKA
  'São Paulo, Brazil':[32.0,22.0,8.0,10,-23.5],'Rio de Janeiro, Brazil':[35.0,27.0,14.0,9,-22.9],
  'Buenos Aires, Argentina':[32.0,22.0,0.0,12,-34.6],'Santiago, Chile':[32.0,18.0,0.0,14,-33.4],
  'Lima, Peru':[28.0,21.0,12.0,8,-12.0],'Bogotá, Colombia':[20.0,14.0,4.0,8,4.7],
  // AFRİKA
  'Johannesburg, South Africa':[28.0,16.0,-2.0,13,-26.2],'Cape Town, South Africa':[28.0,18.0,4.0,10,-33.9],
  'Lagos, Nigeria':[33.0,27.0,22.0,7,6.5],'Nairobi, Kenya':[26.0,16.0,10.0,11,-1.3],
  'Casablanca, Morocco':[30.0,22.0,6.0,9,33.6],'Algiers, Algeria':[32.0,23.0,4.0,10,36.8],
  'Tunis, Tunisia':[36.0,24.0,4.0,11,36.8],
  // OKYANUSYA
  'Sydney, Australia':[32.0,22.0,6.0,11,-33.9],'Melbourne, Australia':[32.0,19.0,2.0,12,-37.8],
  'Brisbane, Australia':[32.0,24.0,8.0,10,-27.5],'Perth, Australia':[37.0,21.0,4.0,14,-31.9],
  'Auckland, New Zealand':[24.0,18.0,4.0,9,-36.8]
};

// Şehir kategorileri (arama/filtreleme için)
const SEHIR_KATEGORILER = {
  'Türkiye': ['Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin','Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur','Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan','Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul','İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kırıkkale','Kırklareli','Kırşehir','Kilis','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş','Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Siirt','Sinop','Sivas','Şanlıurfa','Şırnak','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak'],
  'Avrupa': ['London, UK','Paris, France','Berlin, Germany','Madrid, Spain','Rome, Italy','Amsterdam, Netherlands','Brussels, Belgium','Vienna, Austria','Athens, Greece','Lisbon, Portugal','Stockholm, Sweden','Oslo, Norway','Copenhagen, Denmark','Helsinki, Finland','Warsaw, Poland','Prague, Czech Republic','Budapest, Hungary','Bucharest, Romania','Sofia, Bulgaria','Zurich, Switzerland','Geneva, Switzerland','Munich, Germany','Barcelona, Spain','Milan, Italy'],
  'Körfez & Orta Doğu': ['Dubai, UAE','Abu Dhabi, UAE','Doha, Qatar','Kuwait City, Kuwait','Riyadh, Saudi Arabia','Jeddah, Saudi Arabia','Mecca, Saudi Arabia','Medina, Saudi Arabia','Muscat, Oman','Manama, Bahrain','Tehran, Iran','Baghdad, Iraq','Damascus, Syria','Amman, Jordan','Beirut, Lebanon','Jerusalem, Israel','Tel Aviv, Israel','Cairo, Egypt','Alexandria, Egypt'],
  'Asya': ['Tokyo, Japan','Osaka, Japan','Seoul, South Korea','Beijing, China','Shanghai, China','Hong Kong','Singapore','Bangkok, Thailand','Manila, Philippines','Kuala Lumpur, Malaysia','Jakarta, Indonesia','Hanoi, Vietnam','New Delhi, India','Mumbai, India','Bangalore, India','Karachi, Pakistan','Lahore, Pakistan','Dhaka, Bangladesh','Colombo, Sri Lanka'],
  'Kuzey Amerika': ['New York, USA','Los Angeles, USA','Chicago, USA','Houston, USA','Miami, USA','San Francisco, USA','Phoenix, USA','Las Vegas, USA','Seattle, USA','Boston, USA','Washington DC, USA','Dallas, USA','Atlanta, USA','Denver, USA','Toronto, Canada','Montreal, Canada','Vancouver, Canada','Calgary, Canada','Mexico City, Mexico'],
  'Güney Amerika': ['São Paulo, Brazil','Rio de Janeiro, Brazil','Buenos Aires, Argentina','Santiago, Chile','Lima, Peru','Bogotá, Colombia'],
  'Afrika': ['Johannesburg, South Africa','Cape Town, South Africa','Lagos, Nigeria','Nairobi, Kenya','Casablanca, Morocco','Algiers, Algeria','Tunis, Tunisia'],
  'Okyanusya': ['Sydney, Australia','Melbourne, Australia','Brisbane, Australia','Perth, Australia','Auckland, New Zealand']
};

function onSehirChange(){
  const s=document.getElementById('p_sehir').value;
  const d=SEHIR_DB[s];
  if(!d) return;
  document.getElementById('p_yaz_kt').value=d[0];
  document.getElementById('p_yaz_yt').value=d[1];
  document.getElementById('p_kis_kt').value=d[2];
  document.getElementById('p_dr').value=d[3];
}

function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('act'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('act'));
  document.getElementById('tab-'+tab).classList.add('act');
  const panel = document.getElementById('panel-'+tab);
  if(panel) panel.classList.add('act');

  if(tab==='cihaz'){
    // Varsayılan: dış ünite panelini göster
    if(typeof secCihazTipi==='function') secCihazTipi('dis_unite');
  }
}

function secCihazTipi(tip) {
  const tipNorm = String(tip||'').replace(/_/g,'-');
  // Tüm butonları sıfırla
  document.querySelectorAll('.cihaz-tip-btn').forEach(btn => {
    btn.classList.remove('act');
    btn.style.background = 'var(--bg3)';
    btn.style.color = 'var(--tx)';
  });
  
  // Tüm panelleri gizle
  document.querySelectorAll('.cihaz-panel').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Seçili butonu aktif et
  const aktifBtn = document.getElementById('btn-' + tipNorm);
  if(aktifBtn) {
    aktifBtn.classList.add('act');
    aktifBtn.style.background = 'var(--cy)';
    aktifBtn.style.color = '#000';
  }
  
  // İlgili paneli göster
  const panel = document.getElementById(tipNorm + '-panel');
  if(panel) {
    panel.style.display = 'block';
  }
}

function updateDisUniteModeller() {
  const tip = document.getElementById('dis-unite-tipi').value;
  const marka = document.getElementById('dis-unite-marka').value;
  const modelSelect = document.getElementById('dis-unite-model');
  
  // Model verilerini buraya ekleyin (örnek)
  const modeller = {
    ahu: {
      carrier: ['39G 0400', '39G 0600', '39G 0800', '39G 1000'],
      trane: ['M0400', 'M0600', 'M0800', 'M1000'],
      york: ['YMAE 0400', 'YMAE 0600', 'YMAE 0800', 'YMAE 1000']
    },
    rooftops: {
      carrier: ['50HG 040', '50HG 060', '50HG 080'],
      trane: ['M040', 'M060', 'M080'],
      york: ['YCAE 040', 'YCAE 060', 'YCAE 080']
    }
  };
  
  modelSelect.innerHTML = '<option value="">Model seçin...</option>';
  
  if(tip && modeller[tip] && (!marka || modeller[tip][marka])) {
    const markalar = marka ? [marka] : Object.keys(modeller[tip]);
    markalar.forEach(m => {
      const modList = modeller[tip][m] || [];
      modList.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });
    });
  }
}

function hesaplaKapasite() {
  const toplamSogutma = parseFloat(document.getElementById('toplam-sogutma').value) || 0;
  const guvenlik = parseFloat(document.getElementById('guvenlik-katsayisi').value) || 20;
  // Function implementation here
}

// Veriyi güncelle - mevcut ayarları koruyarak veriyi yeniden işle
function updateData() {
  if (!window.lastLoadedFile) {
    alert(t.lang === 'en' ? 'No data file loaded yet. Please load an Excel file first.' : 'Henüz veri dosyası yüklenmedi. Lütfen önce Excel dosyası yükleyin.');
    return;
  }
  
  // Mevcut ayarları kaydet
  const currentSettings = {
    sehir: document.getElementById('p_sehir').value,
    sistem: document.getElementById('p_sistem').value,
    icUnite: document.getElementById('p_ic_unite').value,
    yazKt: document.getElementById('p_yaz_kt').value,
    yazYt: document.getElementById('p_yaz_yt').value,
    kisKt: document.getElementById('p_kis_kt').value,
    dr: document.getElementById('p_dr').value,
    odaZam: document.getElementById('p_oda_zam').value,
    effZam: document.getElementById('p_eff_zam').value,
    fayd: document.getElementById('p_fayd').value,
    shgc: document.getElementById('p_shgc').value,
    prjNo: document.getElementById('p_prjno').value,
    kim: document.getElementById('p_kim').value,
    prjAdi: document.getElementById('p_prjadi').value
  };
  
  // Veriyi yeniden işle
  procFile(window.lastLoadedFile, currentSettings);
}

// ══════════════════════════════════════════════════════
// HAFIZA SİSTEMİ - localStorage
// ══════════════════════════════════════════════════════
function kaydetParametreler() {
  try {
    const params = {
      // Tasarım parametreleri
      yazKt: document.getElementById('p_yaz_kt')?.value,
      yazYt: document.getElementById('p_yaz_yt')?.value,
      kisKt: document.getElementById('p_kis_kt')?.value,
      dr: document.getElementById('p_dr')?.value,
      shgc: document.getElementById('p_shgc')?.value,
      fAyd: document.getElementById('p_fayd')?.value,
      odaZam: document.getElementById('p_oda_zam')?.value,
      effZam: document.getElementById('p_eff_zam')?.value,
      ruzgar: document.getElementById('p_ruzgar')?.value,
      emSog: document.getElementById('p_em_sog')?.value,
      emIst: document.getElementById('p_em_ist')?.value,
      thK: document.getElementById('p_th_k')?.value,
      igk: document.getElementById('p_igk')?.value,
      icKtYaz: document.getElementById('p_ic_kt_yaz')?.value,
      icNem: document.getElementById('p_ic_nem')?.value,
      
      // Checkbox'lar
      thSogEkle: document.getElementById('p_th_sog_ekle')?.checked,
      thIstEkle: document.getElementById('p_th_ist_ekle')?.checked,
      infilEkle: document.getElementById('p_infil_ekle')?.checked,
      
      // Proje bilgileri
      sehir: document.getElementById('p_sehir')?.value,
      prjNo: document.getElementById('p_prjno')?.value,
      prjAdi: document.getElementById('p_prjadi')?.value,
      kim: document.getElementById('p_kim')?.value,
      sistem: document.getElementById('p_sistem')?.value,
      icUniteTip: document.getElementById('p_ic_unite')?.value,
      
      // Kayıt zamanı
      kaydedilmeTarihi: new Date().toISOString()
    };
    
    localStorage.setItem('hvac_parametreler', JSON.stringify(params));
    console.log('✓ Parametreler kaydedildi:', new Date().toLocaleTimeString());
  } catch(ex) {
    console.warn('localStorage kaydetme hatası:', ex);
  }
}

function yukleKaydedilmisParametreler() {
  try {
    const kayitli = localStorage.getItem('hvac_parametreler');
    if(!kayitli) {
      console.log('Kaydedilmiş parametre bulunamadı - varsayılanlar kullanılıyor');
      return;
    }
    
    const params = JSON.parse(kayitli);
    console.log('✓ Kaydedilmiş parametreler yükleniyor...');
    
    // Parametreleri yükle
    if(params.yazKt) document.getElementById('p_yaz_kt').value = params.yazKt;
    if(params.yazYt) document.getElementById('p_yaz_yt').value = params.yazYt;
    if(params.kisKt) document.getElementById('p_kis_kt').value = params.kisKt;
    if(params.dr) document.getElementById('p_dr').value = params.dr;
    if(params.shgc) document.getElementById('p_shgc').value = params.shgc;
    if(params.fAyd) document.getElementById('p_fayd').value = params.fAyd;
    if(params.odaZam) document.getElementById('p_oda_zam').value = params.odaZam;
    if(params.effZam) document.getElementById('p_eff_zam').value = params.effZam;
    if(params.ruzgar) document.getElementById('p_ruzgar').value = params.ruzgar;
    if(params.emSog) document.getElementById('p_em_sog').value = params.emSog;
    if(params.emIst) document.getElementById('p_em_ist').value = params.emIst;
    if(params.thK) document.getElementById('p_th_k').value = params.thK;
    if(params.igk) document.getElementById('p_igk').value = params.igk;
    if(params.icKtYaz) document.getElementById('p_ic_kt_yaz').value = params.icKtYaz;
    if(params.icNem) document.getElementById('p_ic_nem').value = params.icNem;
    
    // Checkbox'lar
    if(params.thSogEkle !== undefined) document.getElementById('p_th_sog_ekle').checked = params.thSogEkle;
    if(params.thIstEkle !== undefined) document.getElementById('p_th_ist_ekle').checked = params.thIstEkle;
    if(params.infilEkle !== undefined) document.getElementById('p_infil_ekle').checked = params.infilEkle;
    
    // Proje bilgileri
    if(params.sehir) document.getElementById('p_sehir').value = params.sehir;
    if(params.prjNo) document.getElementById('p_prjno').value = params.prjNo;
    if(params.prjAdi) document.getElementById('p_prjadi').value = params.prjAdi;
    if(params.kim) document.getElementById('p_kim').value = params.kim;
    if(params.sistem) document.getElementById('p_sistem').value = params.sistem;
    if(params.icUniteTip) document.getElementById('p_ic_unite').value = params.icUniteTip;
    
    console.log('✓ Parametreler yüklendi! Son kayıt:', params.kaydedilmeTarihi);
  } catch(ex) {
    console.warn('localStorage yükleme hatası:', ex);
  }
}

function temizleKayitliParametreler() {
  if(confirm(t.lang === 'en' ? 'All saved parameters will be deleted. Are you sure?' : 'Tüm kaydedilmiş parametreler silinecek. Emin misiniz?')) {
    localStorage.removeItem('hvac_parametreler');
    alert(t.lang === 'en' ? 'Saved parameters cleared. Page will reload.' : 'Kaydedilmiş parametreler temizlendi. Sayfa yenilenecek.');
    location.reload();
  }
}

// ══════════════════════════════════════════════════════
// ŞEHİR DROPDOWN DOLDURMA
// ══════════════════════════════════════════════════════
function doldurSehirDropdown() {
  const select = document.getElementById('p_sehir');
  if(!select) return;
  
  select.innerHTML = ''; // Temizle
  
  // Kategorilere göre şehirleri ekle
  for(const [kategori, sehirler] of Object.entries(SEHIR_KATEGORILER)) {
    // Kategori başlığı
    const optgroup = document.createElement('optgroup');
    optgroup.label = kategori;
    
    // Şehirleri ekle
    sehirler.forEach(sehir => {
      const option = document.createElement('option');
      option.value = sehir;
      option.textContent = sehir;
      
      // İstanbul'u varsayılan seç
      if(sehir === 'İstanbul') {
        option.selected = true;
      }
      
      optgroup.appendChild(option);
    });
    
    select.appendChild(optgroup);
  }
  
  console.log('✓ Şehir dropdown dolduruldu - Toplam:', Object.values(SEHIR_KATEGORILER).flat().length, 'şehir');
}

// ══════════════════════════════════════════════════════
// PROJE KAYDETME/YÜKLEME SİSTEMİ
// ══════════════════════════════════════════════════════

// Aktif dosya handle'ı – bir kez seçildi mi mevcut dosyaya yazar
window._hvacFileHandle = null;

function _btnKaydetGuncelle() {
  const btn = document.getElementById('btnKaydet');
  if (!btn) return;
  btn.innerHTML = window._hvacFileHandle
    ? '💾 Üzerine Kaydet (' + window._hvacFileHandle.name + ')'
    : '💾 Projeyi Kaydet (.hvac)';
}

function _projeDataOlustur() {
  const prjAdi = document.getElementById('p_prjadi')?.value || 'HVAC_Projesi';
  const prjNo  = document.getElementById('p_prjno')?.value  || 'Proje';
  return {
    version: '1.0',
    kaydedilmeTarihi: new Date().toISOString(),
    proje: {
      prjNo, prjAdi,
      kim:   document.getElementById('p_kim')?.value   || '',
      sehir: document.getElementById('p_sehir')?.value || 'İstanbul'
    },
    parametreler: {
      yazKt:    document.getElementById('p_yaz_kt')?.value,
      yazYt:    document.getElementById('p_yaz_yt')?.value,
      kisKt:    document.getElementById('p_kis_kt')?.value,
      dr:       document.getElementById('p_dr')?.value,
      shgc:     document.getElementById('p_shgc')?.value,
      fAyd:     document.getElementById('p_fayd')?.value,
      odaZam:   document.getElementById('p_oda_zam')?.value,
      effZam:   document.getElementById('p_eff_zam')?.value,
      ruzgar:   document.getElementById('p_ruzgar')?.value,
      emSog:    document.getElementById('p_em_sog')?.value,
      emIst:    document.getElementById('p_em_ist')?.value,
      thK:      document.getElementById('p_th_k')?.value,
      igk:      document.getElementById('p_igk')?.value,
      icKtYaz:  document.getElementById('p_ic_kt_yaz')?.value,
      icNem:    document.getElementById('p_ic_nem')?.value,
      thSogEkle:  document.getElementById('p_th_sog_ekle')?.checked,
      thIstEkle:  document.getElementById('p_th_ist_ekle')?.checked,
      infilEkle:  document.getElementById('p_infil_ekle')?.checked,
      sistem:     document.getElementById('p_sistem')?.value,
      icUniteTip: document.getElementById('p_ic_unite')?.value
    },
    mahalData:      globalData    || [],
    hesapSonuclari: globalResults || [],
    excelDosyaAdi:  window.lastLoadedFile ? window.lastLoadedFile.name : null
  };
}

async function _yazFileHandle(handle, jsonStr) {
  const writable = await handle.createWritable();
  await writable.write(jsonStr);
  await writable.close();
}

async function kaydetProje() {
  try {
    const projeData = _projeDataOlustur();
    const jsonStr   = JSON.stringify(projeData, null, 2);
    const prjAdi    = projeData.proje.prjAdi;
    const prjNo     = projeData.proje.prjNo;

    // ── File System Access API destekleniyorsa ──────────────────────
    if (window.showSaveFilePicker) {
      // Daha önce bir dosya seçildiyse doğrudan üzerine yaz
      if (window._hvacFileHandle) {
        await _yazFileHandle(window._hvacFileHandle, jsonStr);
        kaydetProjeLocalStorage(projeData);
        _btnKaydetGuncelle();
        _toast('✓ Proje kaydedildi: ' + window._hvacFileHandle.name);
        return;
      }
      // İlk kez → picker aç
      const tarih = new Date().toISOString().split('T')[0];
      const handle = await window.showSaveFilePicker({
        suggestedName: `${prjAdi}_${prjNo}_${tarih}.hvac`,
        types: [{ description: 'HVAC Proje Dosyası', accept: { 'application/json': ['.hvac'] } }]
      });
      window._hvacFileHandle = handle;
      await _yazFileHandle(handle, jsonStr);
      kaydetProjeLocalStorage(projeData);
      _btnKaydetGuncelle();
      _toast('✓ Proje kaydedildi: ' + handle.name);
      return;
    }

    // ── Eski tarayıcı fallback: klasik download ─────────────────────
    const tarih = new Date().toISOString().split('T')[0];
    const blob  = new Blob([jsonStr], { type: 'application/json' });
    const url   = URL.createObjectURL(blob);
    const a     = document.createElement('a');
    a.href      = url;
    a.download  = `${prjAdi}_${prjNo}_${tarih}.hvac`;
    a.click();
    URL.revokeObjectURL(url);
    kaydetProjeLocalStorage(projeData);
    alert(t.lang === 'en' ? `✓ Project saved!\n\nFile: ${prjAdi}_${prjNo}_${tarih}.hvac` : `✓ Proje kaydedildi!\n\nDosya: ${prjAdi}_${prjNo}_${tarih}.hvac`);

  } catch(ex) {
    if (ex.name === 'AbortError') return; // Kullanıcı picker'ı kapattı
    alert(t.lang === 'en' ? 'Project save error: ' + ex.message : 'Proje kaydetme hatası: ' + ex.message);
    console.error(ex);
  }
}

// Proje yüklendiğinde handle'ı sıfırla – yeni dosya üzerine yazılsın
function _hvacHandleTemizle() { window._hvacFileHandle = null; _btnKaydetGuncelle(); }

// Kısa bildirim toast'u
function _toast(msg) {
  let t = document.getElementById('_hvacToast');
  if (!t) {
    t = document.createElement('div');
    t.id = '_hvacToast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#10b981;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3);transition:opacity .4s';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

function kaydetProjeLocalStorage(projeData) {
  try {
    // Mevcut projeleri al
    let projeler = JSON.parse(localStorage.getItem('hvac_kayitli_projeler') || '[]');
    
    // Yeni projeyi başa ekle
    projeler.unshift({
      id: Date.now(),
      ad: projeData.proje.prjAdi,
      no: projeData.proje.prjNo,
      tarih: projeData.kaydedilmeTarihi,
      veri: projeData
    });
    
    // En fazla 10 proje sakla
    if(projeler.length > 10) {
      projeler = projeler.slice(0, 10);
    }
    
    localStorage.setItem('hvac_kayitli_projeler', JSON.stringify(projeler));
    console.log('✓ Proje localStorage\'a kaydedildi');
  } catch(ex) {
    console.warn('localStorage kaydetme hatası:', ex);
  }
}

function yukleProje() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.hvac,.json';
  
  input.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    // Yeni proje yüklendi → mevcut handle geçersiz, sonraki kaydet picker açsın
    _hvacHandleTemizle();
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const projeData = JSON.parse(event.target.result);
        yukleProjeVeri(projeData);
      } catch(ex) {
        alert(t.lang === 'en' ? 'Project load error: ' + ex.message : 'Proje yükleme hatası: ' + ex.message);
        console.error(ex);
      }
    };
    reader.readAsText(file);
  };
  
  input.click();
}

function yukleProjeVeri(projeData) {
  try {
    // Parametreleri yükle
    const p = projeData.parametreler;
    if(p.yazKt) document.getElementById('p_yaz_kt').value = p.yazKt;
    if(p.yazYt) document.getElementById('p_yaz_yt').value = p.yazYt;
    if(p.kisKt) document.getElementById('p_kis_kt').value = p.kisKt;
    if(p.dr) document.getElementById('p_dr').value = p.dr;
    if(p.shgc) document.getElementById('p_shgc').value = p.shgc;
    if(p.fAyd) document.getElementById('p_fayd').value = p.fAyd;
    if(p.odaZam) document.getElementById('p_oda_zam').value = p.odaZam;
    if(p.effZam) document.getElementById('p_eff_zam').value = p.effZam;
    if(p.ruzgar) document.getElementById('p_ruzgar').value = p.ruzgar;
    if(p.emSog) document.getElementById('p_em_sog').value = p.emSog;
    if(p.emIst) document.getElementById('p_em_ist').value = p.emIst;
    if(p.thK) document.getElementById('p_th_k').value = p.thK;
    if(p.igk) document.getElementById('p_igk').value = p.igk;
    if(p.icKtYaz) document.getElementById('p_ic_kt_yaz').value = p.icKtYaz;
    if(p.icNem) document.getElementById('p_ic_nem').value = p.icNem;
    
    if(p.thSogEkle !== undefined) document.getElementById('p_th_sog_ekle').checked = p.thSogEkle;
    if(p.thIstEkle !== undefined) document.getElementById('p_th_ist_ekle').checked = p.thIstEkle;
    if(p.infilEkle !== undefined) document.getElementById('p_infil_ekle').checked = p.infilEkle;
    
    if(p.sistem) document.getElementById('p_sistem').value = p.sistem;
    if(p.icUniteTip) document.getElementById('p_ic_unite').value = p.icUniteTip;
    
    // Proje bilgileri
    const prj = projeData.proje;
    if(prj.sehir) document.getElementById('p_sehir').value = prj.sehir;
    if(prj.prjNo) document.getElementById('p_prjno').value = prj.prjNo;
    if(prj.prjAdi) document.getElementById('p_prjadi').value = prj.prjAdi;
    if(prj.kim) document.getElementById('p_kim').value = prj.kim;
    
    // Global verileri yükle
    globalData = projeData.mahalData || [];
    globalResults = projeData.hesapSonuclari || [];
    
    // ÖNCE globalParams'ı INPUT'LARDAN oluştur (JSON field isimleri farklı!)
    globalParams = {
      Tmax:      +document.getElementById('p_yaz_kt').value,
      yazYT:     +document.getElementById('p_yaz_yt').value,
      DR:        +document.getElementById('p_dr').value||10,
      kisKt:     +document.getElementById('p_kis_kt').value,
      shgc:      +document.getElementById('p_shgc').value,
      fAyd:      +document.getElementById('p_fayd').value,
      odaZam:    +document.getElementById('p_oda_zam').value,
      effZam:    +document.getElementById('p_eff_zam').value,
      ruzgarZam: +document.getElementById('p_ruzgar').value,
      emSog:     +document.getElementById('p_em_sog').value||0,
      emIst:     +document.getElementById('p_em_ist').value||0,
      thKatsayi: +document.getElementById('p_th_k').value||1.0,
      igkVerim:  +document.getElementById('p_igk').value||0,
      icKtYaz:   +document.getElementById('p_ic_kt_yaz').value||24,
      icNem:     +document.getElementById('p_ic_nem').value||50,
      thSogEkle: document.getElementById('p_th_sog_ekle').checked,
      thIstEkle: document.getElementById('p_th_ist_ekle').checked,
      infilEkle: document.getElementById('p_infil_ekle').checked,
      sehir:     document.getElementById('p_sehir').value,
      prjNo:     document.getElementById('p_prjno').value,
      prjAdi:    document.getElementById('p_prjadi').value,
      kim:       document.getElementById('p_kim').value,
      sistem:    document.getElementById('p_sistem').value,
      icUniteTip:document.getElementById('p_ic_unite').value,
    };
    
    // Sonuçları göster
    if(globalResults && globalResults.length > 0) {
      enableExports(true);
      renderResults(globalResults, globalParams);

      alert(t.lang === 'en' ? `✓ Project loaded!\n\nProject: ${prj.prjAdi}\nProject No: ${prj.prjNo}\nNumber of zones: ${globalData.length}\n\nCalculations and all edits restored.` : `✓ Proje yüklendi!\n\nProje: ${prj.prjAdi}\nProje No: ${prj.prjNo}\nMahal sayısı: ${globalData.length}\n\nHesaplar ve tüm düzenlemeler geri yüklendi.`);
    } else {
      alert(t.lang === 'en' ? `✓ Project parameters loaded!\n\nProject: ${prj.prjAdi}\n\nLoad your Excel file and click "Run Calculation" button.` : `✓ Proje parametreleri yüklendi!\n\nProje: ${prj.prjAdi}\n\nExcel dosyanızı yükleyip "Hesabı Çalıştır" butonuna basın.`);
    }
    
    // Dosya yüklü işareti
    const fl = document.getElementById('fileLoaded');
    if(fl && globalData.length > 0) {
      fl.innerHTML = `✓ Proje yüklendi: ${prj.prjAdi} (${globalData.length} mahal)`;
      fl.style.display = 'flex';
    }
    
  } catch(ex) {
    alert(t.lang === 'en' ? 'Project data load error: ' + ex.message : 'Proje verisi yükleme hatası: ' + ex.message);
    console.error(ex);
  }
}

function gosterKayitliProjeler() {
  try {
    const projeler = JSON.parse(localStorage.getItem('hvac_kayitli_projeler') || '[]');
    
    if(projeler.length === 0) {
      alert(t.lang === 'en' ? 'No saved projects found.\n\nUse "Save Project" button to save a project.' : 'Kaydedilmiş proje bulunamadı.\n\nProje kaydetmek için "Projeyi Kaydet" butonunu kullanın.');
      return;
    }
    
    // Modal oluştur
    let html = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;" id="projeModal" onclick="this.remove()">
        <div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:12px;padding:24px;max-width:700px;width:90%;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h2 style="font-size:18px;color:var(--cy);margin:0;font-family:var(--mono);">💾 KAYDEDİLMİŞ PROJELER</h2>
            <button onclick="document.getElementById('projeModal').remove()" style="background:transparent;border:none;color:var(--mt);font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;">&times;</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
    `;
    
    projeler.forEach((prj, idx) => {
      const tarih = new Date(prj.tarih).toLocaleString(t.lang === 'en' ? 'en-US' : 'tr-TR');
      const mahalSayisi = prj.veri.mahalData ? prj.veri.mahalData.length : 0;
      
      html += `
        <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:8px;padding:16px;cursor:pointer;transition:.2s;" 
             onmouseover="this.style.borderColor='var(--bl)'" 
             onmouseout="this.style.borderColor='var(--bdr)'"
             onclick="yukleProjeVeri(${JSON.stringify(prj.veri).replace(/"/g, '&quot;')}); document.getElementById('projeModal').remove();">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--tx);margin-bottom:4px;">${prj.ad || 'İsimsiz Proje'}</div>
              <div style="font-size:11px;color:var(--mt);font-family:var(--mono);">Proje No: ${prj.no || '-'}</div>
            </div>
            <button onclick="event.stopPropagation(); silProje(${prj.id})" 
                    style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:var(--rd);padding:4px 8px;border-radius:4px;font-size:10px;cursor:pointer;">
              Sil
            </button>
          </div>
          <div style="font-size:10px;color:var(--mt);display:flex;gap:16px;">
            <span>📅 ${tarih}</span>
            <span>📊 ${mahalSayisi} mahal</span>
          </div>
        </div>
      `;
    });
    
    html += `
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--bdr);display:flex;gap:8px;">
            <button onclick="temizleTumProjeler()" style="flex:1;padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:var(--rd);border-radius:6px;font-size:11px;cursor:pointer;">
              🗑️ Tümünü Temizle
            </button>
            <button onclick="document.getElementById('projeModal').remove()" style="flex:1;padding:10px;background:var(--bg3);border:1px solid var(--bdr);color:var(--tx);border-radius:6px;font-size:11px;cursor:pointer;">
              Kapat
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
  } catch(ex) {
    alert(t.lang === 'en' ? 'Error displaying saved projects: ' + ex.message : 'Kaydedilmiş projeler gösterme hatası: ' + ex.message);
    console.error(ex);
  }
}

function silProje(id) {
  if(!confirm(t.lang === 'en' ? 'Are you sure you want to delete this project?' : 'Bu projeyi silmek istediğinize emin misiniz?')) return;
  
  try {
    let projeler = JSON.parse(localStorage.getItem('hvac_kayitli_projeler') || '[]');
    projeler = projeler.filter(p => p.id !== id);
    localStorage.setItem('hvac_kayitli_projeler', JSON.stringify(projeler));
    
    // Modal'ı kapat ve tekrar aç
    document.getElementById('projeModal')?.remove();
    gosterKayitliProjeler();
  } catch(ex) {
    alert(t.lang === 'en' ? 'Error deleting project: ' + ex.message : 'Proje silme hatası: ' + ex.message);
  }
}

function temizleTumProjeler() {
  if(!confirm(t.lang === 'en' ? 'ALL saved projects will be deleted!\n\nThis action cannot be undone. Are you sure?' : 'TÜM kaydedilmiş projeler silinecek!\n\nBu işlem geri alınamaz. Emin misiniz?')) return;

  localStorage.removeItem('hvac_kayitli_projeler');
  document.getElementById('projeModal')?.remove();
  alert(t.lang === 'en' ? 'All projects cleared.' : 'Tüm projeler temizlendi.');
}

// ══════════════════════════════════════════════════════
// HAVA DURUMU API ENTEGRASYONU
// ══════════════════════════════════════════════════════

async function getirCanliHavaDurumu(sehir) {
  try {
    // Visual Crossing Weather API (ücretsiz tier: 1000 istek/gün)
    // API Key: Kullanıcı kendi key'ini ekleyebilir
    const apiKey = localStorage.getItem('weather_api_key') || '';
    
    if(!apiKey) {
      if(confirm(t.lang === 'en' ? 'API key required for live weather.\n\nWould you like to get a free API key?\n\n(Visual Crossing Weather - 1000 requests/day free)' : 'Canlı hava durumu için API key gerekiyor.\n\nÜcretsiz API key almak ister misiniz?\n\n(Visual Crossing Weather - 1000 istek/gün ücretsiz)')) {
        window.open('https://www.visualcrossing.com/weather-api', '_blank');
        const yeniKey = prompt(t.lang === 'en' ? 'Enter your API Key:' : 'API Key\'inizi girin:');
        if(yeniKey) {
          localStorage.setItem('weather_api_key', yeniKey);
          return getirCanliHavaDurumu(sehir);
        }
      }
      return null;
    }
    
    // Şehir koordinatlarını al
    const sehirData = SEHIR_DB[sehir];
    if(!sehirData) {
      console.warn('Şehir veritabanında bulunamadı:', sehir);
      return null;
    }
    
    const enlem = sehirData[4];
    const boylam = 0; // Yaklaşık - tam koordinat için başka kaynak gerekir
    
    // API çağrısı
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${enlem},${boylam}/last30days?unitGroup=metric&key=${apiKey}&contentType=json`;
    
    const response = await fetch(url);
    if(!response.ok) throw new Error('API hatası: ' + response.status);
    
    const data = await response.json();
    
    // Son 30 günün max sıcaklıklarından en yükseğini bul
    const maxTemp = Math.max(...data.days.map(d => d.tempmax));
    const minTemp = Math.min(...data.days.map(d => d.tempmin));
    const avgHumidity = data.days.reduce((sum, d) => sum + d.humidity, 0) / data.days.length;
    
    return {
      maxTemp: Math.round(maxTemp * 10) / 10,
      minTemp: Math.round(minTemp * 10) / 10,
      humidity: Math.round(avgHumidity),
      rawData: data
    };
    
  } catch(ex) {
    console.error('Hava durumu API hatası:', ex);
    alert(t.lang === 'en' ? 'Could not fetch live weather.\n\nError: ' + ex.message : 'Canlı hava durumu alınamadı.\n\nHata: ' + ex.message);
    return null;
  }
}

async function kullCanliHavaDurumu() {
  const sehir = document.getElementById('p_sehir').value;
  const btn = event.target;
  const orgText = btn.textContent;
  
  btn.textContent = '⏳ Veriler alınıyor...';
  btn.disabled = true;
  
  const veri = await getirCanliHavaDurumu(sehir);
  
  if(veri) {
    // Tasarım sıcaklığını güncelle (max sıcaklığa +2°C güvenlik marjı)
    const tasarimSicaklik = veri.maxTemp + 2;
    document.getElementById('p_yaz_kt').value = tasarimSicaklik;
    
    // Yaş termometre tahmini (nem bazlı)
    const wbtTahmini = tasarimSicaklik - (100 - veri.humidity) / 5;
    document.getElementById('p_yaz_yt').value = Math.round(wbtTahmini * 10) / 10;
    
    kaydetParametreler();

    alert(t.lang === 'en' ? `✓ Live weather data applied!\n\n${sehir}:\n• Last 30 days max: ${veri.maxTemp}°C\n• Design temperature: ${tasarimSicaklik}°C\n• Average humidity: ${veri.humidity}%` : `✓ Canlı hava durumu verileri uygulandı!\n\n${sehir}:\n• Son 30 gün max: ${veri.maxTemp}°C\n• Tasarım sıcaklığı: ${tasarimSicaklik}°C\n• Ortalama nem: ${veri.humidity}%`);
  }
  
  btn.textContent = orgText;
  btn.disabled = false;
}

// ══════════════════════════════════════════════════════
// ÖZEL ŞEHİR EKLEME
// ══════════════════════════════════════════════════════

function ekleOzelSehir() {
  const html = `
    <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;" id="ozelSehirModal" onclick="this.remove()">
      <div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:12px;padding:24px;max-width:500px;width:90%;" onclick="event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h2 style="font-size:16px;color:var(--gd);margin:0;font-family:var(--mono);">➕ ÖZEL ŞEHİR EKLE</h2>
          <button onclick="document.getElementById('ozelSehirModal').remove()" style="background:transparent;border:none;color:var(--mt);font-size:24px;cursor:pointer;padding:0;width:32px;height:32px;">&times;</button>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">Şehir Adı</label>
            <input type="text" id="ozel_sehir_adi" placeholder="örn: Bodrum, Turkey" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">Yaz KT (°C)</label>
              <input type="number" id="ozel_yaz_kt" placeholder="35" step="0.1" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
            </div>
            <div>
              <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">Yaz YT (°C)</label>
              <input type="number" id="ozel_yaz_yt" placeholder="25" step="0.1" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">Kış KT (°C)</label>
              <input type="number" id="ozel_kis_kt" placeholder="-5" step="0.5" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
            </div>
            <div>
              <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">DR (°C)</label>
              <input type="number" id="ozel_dr" placeholder="10" step="0.5" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
            </div>
          </div>
          
          <div>
            <label style="font-size:10px;color:var(--mt);display:block;margin-bottom:4px;">Enlem (opsiyonel)</label>
            <input type="number" id="ozel_enlem" placeholder="40.5" step="0.1" style="width:100%;background:var(--bg3);border:1px solid var(--bdr);border-radius:4px;padding:8px;color:var(--tx);font-size:12px;">
          </div>
          
          <div style="font-size:9px;color:var(--mt);background:rgba(6,182,212,0.05);border:1px solid rgba(6,182,212,0.2);padding:8px;border-radius:4px;">
            💡 İpucu: Tasarım sıcaklıklarını ASHRAE/TS standardından veya yerel meteoroloji kayıtlarından alabilirsiniz.
          </div>
        </div>
        
        <div style="margin-top:20px;display:flex;gap:8px;">
          <button onclick="kaydetOzelSehir()" style="flex:1;padding:12px;background:var(--gd);color:#000;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
            ✓ Kaydet ve Kullan
          </button>
          <button onclick="document.getElementById('ozelSehirModal').remove()" style="flex:1;padding:12px;background:var(--bg3);border:1px solid var(--bdr);color:var(--tx);border-radius:6px;font-size:12px;cursor:pointer;">
            İptal
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
}

function kaydetOzelSehir() {
  const ad = document.getElementById('ozel_sehir_adi').value.trim();
  const yazKt = parseFloat(document.getElementById('ozel_yaz_kt').value);
  const yazYt = parseFloat(document.getElementById('ozel_yaz_yt').value);
  const kisKt = parseFloat(document.getElementById('ozel_kis_kt').value);
  const dr = parseFloat(document.getElementById('ozel_dr').value);
  const enlem = parseFloat(document.getElementById('ozel_enlem').value) || 40.0;
  
  if(!ad || isNaN(yazKt) || isNaN(yazYt) || isNaN(kisKt) || isNaN(dr)) {
    alert(t.lang === 'en' ? 'Please fill in all required fields!' : 'Lütfen tüm zorunlu alanları doldurun!');
    return;
  }
  
  // Veritabanına ekle
  SEHIR_DB[ad] = [yazKt, yazYt, kisKt, dr, enlem];
  
  // localStorage'a kaydet
  let ozelSehirler = JSON.parse(localStorage.getItem('hvac_ozel_sehirler') || '{}');
  ozelSehirler[ad] = [yazKt, yazYt, kisKt, dr, enlem];
  localStorage.setItem('hvac_ozel_sehirler', JSON.stringify(ozelSehirler));
  
  // Kategori listesine ekle
  if(!SEHIR_KATEGORILER['Özel Şehirler']) {
    SEHIR_KATEGORILER['Özel Şehirler'] = [];
  }
  if(!SEHIR_KATEGORILER['Özel Şehirler'].includes(ad)) {
    SEHIR_KATEGORILER['Özel Şehirler'].push(ad);
  }
  
  // Dropdown'u yeniden doldur
  doldurSehirDropdown();
  
  // Yeni şehri seç
  document.getElementById('p_sehir').value = ad;
  onSehirChange();
  
  // Modal'ı kapat
  document.getElementById('ozelSehirModal')?.remove();

  alert(t.lang === 'en' ? `✓ Custom city added: ${ad}\n\nSummer: ${yazKt}°C / ${yazYt}°C\nWinter: ${kisKt}°C\nDR: ${dr}°C` : `✓ Özel şehir eklendi: ${ad}\n\nYaz: ${yazKt}°C / ${yazYt}°C\nKış: ${kisKt}°C\nDR: ${dr}°C`);
}

// Sayfa yüklendiğinde özel şehirleri yükle
function yukleOzelSehirler() {
  try {
    const ozelSehirler = JSON.parse(localStorage.getItem('hvac_ozel_sehirler') || '{}');
    
    for(const [ad, veri] of Object.entries(ozelSehirler)) {
      SEHIR_DB[ad] = veri;
      
      if(!SEHIR_KATEGORILER['Özel Şehirler']) {
        SEHIR_KATEGORILER['Özel Şehirler'] = [];
      }
      if(!SEHIR_KATEGORILER['Özel Şehirler'].includes(ad)) {
        SEHIR_KATEGORILER['Özel Şehirler'].push(ad);
      }
    }
    
    if(Object.keys(ozelSehirler).length > 0) {
      console.log('✓ Özel şehirler yüklendi:', Object.keys(ozelSehirler).length);
    }
  } catch(ex) {
    console.warn('Özel şehirler yükleme hatası:', ex);
  }
}

// İlk yüklemede
document.addEventListener('DOMContentLoaded',()=>{
  // Özel şehirleri yükle
  yukleOzelSehirler();
  
  // Şehir dropdown'unu doldur
  doldurSehirDropdown();
  
  onSehirChange();
  onSistemChange();
  // Dosya seçimi
  const fi = document.getElementById('fileInput');
  if(fi) fi.onchange = e => { 
    if(e.target.files[0]) {
      window.lastLoadedFile = e.target.files[0];
      procFile(e.target.files[0]); 
    }
  };
  // Drag & drop
  const uz = document.getElementById('uploadZone');
  if(uz){
    uz.addEventListener('dragover', e=>{ e.preventDefault(); uz.style.borderColor='var(--bl)'; });
    uz.addEventListener('dragleave', ()=>{ uz.style.borderColor=''; });
    uz.addEventListener('drop', e=>{
      e.preventDefault(); uz.style.borderColor='';
      const f = e.dataTransfer.files[0];
      if(f && (f.name.endsWith('.xlsx')||f.name.endsWith('.xls'))) {
        window.lastLoadedFile = f;
        procFile(f);
      }
    });
  }
  // Ctrl+Z → Geri Al
  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape') {
      const nm = document.getElementById('yeniMahalModal');
      if(nm && nm.style.display !== 'none') { closeYeniMahalModal(); return; }
    }
    if((e.ctrlKey||e.metaKey) && e.key==='z' && !e.shiftKey){
      const active = document.activeElement;
      if(active && (active.tagName==='INPUT'||active.tagName==='TEXTAREA'||active.isContentEditable)) return;
      e.preventDefault();
      undoLast();
    }
  });
  
  // ═══ HAFIZA SİSTEMİ: Kaydedilmiş parametreleri yükle ═══
  yukleKaydedilmisParametreler();
  
  // Tüm input ve checkbox'lara otomatik kaydetme ekle
  document.querySelectorAll('#sidebar input, #sidebar select').forEach(elem => {
    elem.addEventListener('change', () => kaydetParametreler());
  });
});

// ══════════════════════════════════════════════════════
// PSİKOMETRİK & HAVALANDIRMA HESAP FONKSİYONLARI
// ══════════════════════════════════════════════════════
function doymaBasinci(T){ return 0.6105*Math.exp(17.27*T/(T+237.3)); } // kPa

function entalpHesap(Tkuru, nem, nemTipi){
  // nemTipi: 'RH' (%) veya 'YT' (ıslak termometre °C)
  const Patm=101.325;
  let W;
  if(nemTipi==='RH'){
    const Ps=doymaBasinci(Tkuru);
    W=Math.max(0, 0.622*(nem/100*Ps)/(Patm-nem/100*Ps));
  } else {
    const Ps_w=doymaBasinci(nem);
    const Ws=0.622*Ps_w/(Patm-Ps_w);
    W=Math.max(0, Ws-0.00066*(Tkuru-nem)*(1+0.00115*nem));
  }
  const h=1.006*Tkuru+W*(2501+1.86*Tkuru);
  return {h:+h.toFixed(3), W:+(W*1000).toFixed(2)}; // h kJ/kg, W g/kg
}

function mahalTipBelirle(adi){
  if(!adi) return 'OFİS';
  const a=adi.toString().toLowerCase();
  // Server / IT odaları → Hassas kontrollü klima, 1000W/m²
  if(/server|sunucu|it oda|bilgi işlem|data center|datacenter|data room|network server/.test(a)) return 'SERVER';
  // HUB / Elektrik / Pano / CCTV odaları → Kaset klima, 400W/m²
  if(/hub oda|hub ot|telekomünikasyon|telekom oda|elektrik oda|elektrik pano|pano oda|cctv|güvenlik oda|ups oda|trafo oda|enerji oda/.test(a)) return 'ELEKTRIK';
  if(/\bhub\b/.test(a) && /oda|room/.test(a)) return 'ELEKTRIK';
  // OUTDOOR → Teras, balkon, bahçe, peyzaj vb. → cihaz takılmaz
  if(/teras|balkon|bahçe|peyzaj|avlu|açık alan|dış alan|outdoor|terrace|balcony|garden|landscape|veranda/.test(a)) return 'OUTDOOR';
  // Kitchenette / Küçük mutfak → 5 ACH egzoz, taze = egzoz × 0.90
  if(/kitchenette|mutfakçık|küçük mutfak|mini mutfak|kafeterya|cafe mutfak|pantry/.test(a)) return 'KİTCHENETTE';
  // Mutfak / Kitchen → 30 ACH egzoz, taze = egzoz × 0.85
  if(/mutfak|kazan|pişirme|fırın|kitchen|cooking/.test(a)) return 'MUTFAK';
  // Depo / Storage
  if(/depo|arşiv|mahzen|bodrum|stok|anbar|storage|archive|warehouse|basement|stock/.test(a)) return 'DEPO';
  // WC / Bathroom
  if(/tuvalet|wc|lavabo|banyo|duş|toilet|bathroom|restroom|shower|lavatory/.test(a)) return 'WC';
  // Koridor / Circulation
  if(/koridor|antre|merdiven|asansör|corridor|stair|elevator|lift/.test(a)) return 'KORİDOR';
  // Lobi / Hol → cihaz takılır (TOPLU gibi)
  if(/hol|lobi|hall|lobby|foyer/.test(a)) return 'TOPLU';
  // Toplu / Assembly
  if(/toplant|seminer|konfer|amfi|sınıf|derslik|meeting|conference|seminar|classroom|auditorium|amphitheater/.test(a)) return 'TOPLU';
  // Konut / Residential (ASHRAE ACH: 0.5) – EKLENDI
  if(/daire|konut|yatak oda|oturma oda|salon|çocuk oda|banyo|ebeveyn|suite|bedroom|living room|apartment|flat|residence/.test(a)) return 'KONUT';
  // Mağaza / Retail (ASHRAE ACH: 0.4) – EKLENDI
  if(/mağaza|dükkan|market|showroom|perakende|satış ala|boutique|shop|retail|store/.test(a)) return 'MAĞAZA';
  return 'OFİS';
}


// 5'in katına yukarı yuvarla: örn. 33→35, 77→80, 35→35
function ceilTo5(v){ return Math.ceil(v/5)*5; }

function tazeHavaHesapla(r, P){
  const alan=r.alan||0, nKisi=r.nToplam||0, h_=r.h||3;
  const thK=P.thKatsayi||1.0, tip=r.mahalTip||'OFİS';
  let thFlow=0, exFlow=0, formul='', exFormul='', formulEN='', exFormulEN='';
  let thFlowRaw=0; // katsayı uygulanmadan önceki ham değer (TOPLU için gösterim)
  const hacim=alan*h_;

  if(tip==='WC'){
    // WC: Hesap yapılmaz – bina havalandırma sistemine dahil değil
    thFlow=0; exFlow=0; thFlowRaw=0;
    formul='WC – hesap yapılmaz (sisteme dahil edilmez)';
    exFormul='–';
    formulEN='WC – not calculated (not included in system)';
    exFormulEN='–';
  } else if(tip==='TOPLU'){
    // POZİTİF BASINÇ: Egzoz = Taze × 0.90
    thFlowRaw=(nKisi*3.8+alan*0.6);
    thFlow=thFlowRaw*thK;
    formul=`(${nKisi}k×3.8 + ${alan.toFixed(0)}m²×0.6) = ${thFlowRaw.toFixed(1)} L/s × TH_k=${thK} → ${thFlow.toFixed(1)} L/s`;
    exFormul='Egzoz = Taze Hava × %90 (pozitif basınç)';
    formulEN=`(${nKisi}p×3.8 + ${alan.toFixed(0)}m²×0.6) = ${thFlowRaw.toFixed(1)} L/s × OA_k=${thK} → ${thFlow.toFixed(1)} L/s`;
    exFormulEN='Exhaust = Fresh Air × 90% (positive pressure)';
  } else if(tip==='DEPO'){
    // NEGATİF BASINÇ: Egzoz = 5 ACH bazlı, Taze = Egzoz × 0.90
    exFlow=(hacim*5)/3600*1000;
    thFlow=exFlow*0.90;
    thFlowRaw=thFlow;
    formul=`Egzoz: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×5 ACH÷3600×1000 → Taze = Egzoz×0.90 (negatif basınç)`;
    exFormul='Egzoz = 5 ACH · Taze = Egzoz × %90 (negatif basınç)';
    formulEN=`Exhaust: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×5 ACH÷3600×1000 → Fresh Air = Exhaust×0.90 (negative pressure)`;
    exFormulEN='Exhaust = 5 ACH · Fresh Air = Exhaust × 90% (negative pressure)';
  } else if(tip==='KORİDOR'){
    // POZİTİF BASINÇ: Egzoz = Taze × 0.90
    thFlow=(hacim*2)/3600*1000;
    thFlowRaw=thFlow;
    formul=`${alan.toFixed(0)}m²×${h_.toFixed(1)}m×2 ACH÷3600×1000 (Koridor 2 hava değ/h)`;
    exFormul='Egzoz = Taze Hava × %90 (pozitif basınç)';
    formulEN=`${alan.toFixed(0)}m²×${h_.toFixed(1)}m×2 ACH÷3600×1000 (Corridor 2 air changes/h)`;
    exFormulEN='Exhaust = Fresh Air × 90% (positive pressure)';
  } else if(tip==='MUTFAK'){
    // MUTFAK (pişirme): Egzoz = 30 ACH, Taze = Egzoz × 0.85 (negatif basınç)
    exFlow=(hacim*30)/3600*1000;
    thFlow=exFlow*0.85;
    thFlowRaw=thFlow;
    formul=`Egzoz: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×30 ACH÷3600×1000 → Taze = Egzoz×0.85 (negatif basınç)`;
    exFormul='Egzoz = 30 ACH · Taze = Egzoz × %85 (negatif basınç)';
    formulEN=`Exhaust: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×30 ACH÷3600×1000 → Fresh Air = Exhaust×0.85 (negative pressure)`;
    exFormulEN='Exhaust = 30 ACH · Fresh Air = Exhaust × 85% (negative pressure)';
  } else if(tip==='KİTCHENETTE'){
    // KİTCHENETTE: Egzoz = 5 ACH, Taze = Egzoz × 0.90 (negatif basınç)
    exFlow=(hacim*5)/3600*1000;
    thFlow=exFlow*0.90;
    thFlowRaw=thFlow;
    formul=`Egzoz: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×5 ACH÷3600×1000 → Taze = Egzoz×0.90 (negatif basınç)`;
    exFormul='Egzoz = 5 ACH · Taze = Egzoz × %90 (negatif basınç)';
    formulEN=`Exhaust: ${alan.toFixed(0)}m²×${h_.toFixed(1)}m×5 ACH÷3600×1000 → Fresh Air = Exhaust×0.90 (negative pressure)`;
    exFormulEN='Exhaust = 5 ACH · Fresh Air = Exhaust × 90% (negative pressure)';
  } else if(tip==='OUTDOOR'){
    thFlow=0; exFlow=0; thFlowRaw=0;
    formul='Açık alan – mekanik havalandırma gerekmez';
    exFormul='–';
    formulEN='Open area – no mechanical ventilation required';
    exFormulEN='–';
  } else if(tip==='ELEKTRIK'||tip==='SERVER'){
    // Teknik odalar (Server, Hub, Pano, CCTV vb.): taze hava ve egzoz yok
    thFlow=0; exFlow=0; thFlowRaw=0;
    formul='Teknik oda – taze hava/egzoz sisteme dahil edilmez (sadece iç sirkülasyon)';
    exFormul='–';
    formulEN='Technical room – fresh air/exhaust not included in system (internal circulation only)';
    exFormulEN='–';
  } else { // OFİS (ve TOPLU fall-through)
    // POZİTİF BASINÇ: Egzoz = Taze × 0.90
    thFlowRaw=(nKisi*2.5+alan*0.3);
    thFlow=thFlowRaw*thK;
    formul=`(${nKisi}k×2.5 + ${alan.toFixed(0)}m²×0.3) = ${thFlowRaw.toFixed(1)} L/s × TH_k=${thK} → ${thFlow.toFixed(1)} L/s`;
    exFormul='Egzoz = Taze Hava × %90 (pozitif basınç)';
    formulEN=`(${nKisi}p×2.5 + ${alan.toFixed(0)}m²×0.3) = ${thFlowRaw.toFixed(1)} L/s × OA_k=${thK} → ${thFlow.toFixed(1)} L/s`;
    exFormulEN='Exhaust = Fresh Air × 90% (positive pressure)';
  }

  // Minimum debiler – sadece WC/OUTDOOR/MUTFAK/KİTCHENETTE/DEPO dışı tiplere uygulanır
  // (Bu tipler kendi mantıklarıyla exFlow'u zaten belirliyor)
  if(tip!=='WC' && tip!=='OUTDOOR' && tip!=='MUTFAK' && tip!=='KİTCHENETTE' && tip!=='DEPO' && tip!=='ELEKTRIK' && tip!=='SERVER'){
    // KİŞİ BAŞI MİNİMUM: 30 m³/h = 8.33 L/s
    const minPerPerson = nKisi > 0 ? nKisi * (30/3.6) : 0;
    if(minPerPerson > 0) thFlow = Math.max(thFlow, minPerPerson);
    // MAHAL MİNİMUM: Her mahalde en az 30 m³/h = 8.333 L/s taze hava
    const minMahal = 30/3.6;
    thFlow = Math.max(thFlow, minMahal);
    // Taze hava debisini 5'in katına yukarı yuvarla
    thFlow = ceilTo5(Math.max(0, thFlow));
    // POZİTİF BASINÇ: Egzoz = Taze × 0.90
    exFlow = Math.round(thFlow * 0.90 / 5) * 5; // 5'in katına yuvarla
  } else if(tip==='DEPO' || tip==='MUTFAK' || tip==='KİTCHENETTE'){
    // NEGATİF BASINÇ tipleri: exFlow zaten hesaplandı, yuvarla
    exFlow = ceilTo5(Math.max(0, exFlow));
    thFlow = Math.round(exFlow * (tip==='MUTFAK' ? 0.85 : 0.90) / 5) * 5;
  }

  const thPre = thFlow;
  const exPre = exFlow;
  if (r._thDisabled) thFlow = 0;
  if (r._exDisabled) exFlow = 0; else exFlow = exPre;

  // Psikometrik yükler
  const hDis=entalpHesap(P.Tmax, P.yazYT, 'YT');
  // Mahalin iç soğutma sıcaklığını kullan (r.Tic_yaz varsa onu, yoksa P.icKtYaz'ı kullan)
  const Tic_sog = r.Tic_yaz || P.icKtYaz || 24;
  const Tic_ist = r.Tic_kis || 20;
  const hIc =entalpHesap(Tic_sog, P.icNem, 'RH');
  const igk=P.igkVerim/100;
  const flowKgs=thFlow*1.2/1000; // L/s → kg/s (ρ≈1.2)

  // Soğutma: duyulur + gizli (her ikisi de POZİTİF yük olarak hesaplanır)
  const dT_sog=Math.max(0,(P.Tmax-Tic_sog)*(1-igk));
  // Gizli soğutma: dış nemin iç nemden fazla olması durumunda pozitif yük
  const dW_sog=Math.max(0,(hDis.W-hIc.W)/1000*(1-igk)); // kg/kg – mutlaka pozitif
  const thSogS=+(flowKgs*1006*dT_sog).toFixed(0);
  const thSogL=+(flowKgs*2501000*dW_sog).toFixed(0); // pozitif gizli yük
  const thSogT=thSogS+thSogL; // toplam = duyulur + gizli (her ikisi de pozitif)

  // Isıtma: yalnız duyulur (nem artışı ihmal)
  const dT_ist=Math.max(0,(Tic_ist-P.kisKt)*(1-igk));
  const thIst=+(flowKgs*1006*dT_ist).toFixed(0);

  return {
    tip,thFlow,exFlow,formul,exFormul,formulEN,exFormulEN,thFlowRaw:+thFlowRaw.toFixed(1),thKatsayi:thK,
    th:thFlow, egzoz:exFlow,
    hDis:hDis.h,WDis:hDis.W,hIc:hIc.h,WIc:hIc.W,
    thSogS,thSogL,thSogT,thIst
  };
}


// ══════════════════════════════════════════════════════
// HESAP MOTORU – güncellendi
// ══════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════
// CİHAZ VERİTABANI
// ══════════════════════════════════════════════════════

function infilACH(mahalTip){
  // TS 825 Tablo – standart infiltrasyon değerleri
  const tbl = {
    'KONUT':0.5, 'OFİS':0.3, 'TOPLU':0.4, 'MAĞAZA':0.4,
    'MUTFAK':0.5, 'KİTCHENETTE':0.4, 'WC':0.3, 'KORİDOR':0.2, 'DEPO':0.1,
    'SERVER':0.2, 'ELEKTRIK':0.2, 'OUTDOOR':0.0,
  };
  return tbl[mahalTip] || 0.3; // varsayılan ofis
}

function hesaplaMahalV5(row, P, korunanCihaz){
  const Ty=row.Tic_yaz||row['İç Sıcaklık- Yaz']||row['ic_sicaklik_yaz']||24;
  const Tk=row.Tic_kis||row['İç Sıcaklık- Kış']||row['ic_sicaklik_kis']||20;
  const alan=+row.alan||0, h_=+row.h||+row['yükseklik']||3;
  const hacim=alan*h_;
  const uDuv=+row.duvarU||+row['duvar u değeri']||0.45;
  const uPenc=+row.pencereU||+row['pencere u değeri']||2.1;
  const uTav=+row['tavan u değeri']||0.35;
  const uDos=+row.dösemeU||+row['döşeme u değeri']||0.50; // Döşeme U-değeri (varsayılan: 0.50 W/m²K)
  const golge=+row['pencere gölgeleme kaysayısı']||0.5;

  // ── Skylight verileri ──────────────────────────────────────
  const skylightA   = parseFloat(String(row['skylight alanı']||'0').replace(/\s/g, ''))||0;
  const uSkylight   = parseFloat(String(row.skylightU||row['skylight u değeri']||'2.8').replace(/\s/g, ''))||2.8;
  const scSkylight  = parseFloat(String(row['skylight gölgeleme kaysayısı']||'0.65').replace(/\s/g, ''))||0.65;

  const duv={},pen={};
  YONLER.forEach(y=>{
    duv[y]=+row[y+' dış duvar alanı']||0;
    pen[y]=+row[y+' dış pencere alanı']||0;
  });
  const tavanA=+row['tavan alanı']||0;
  const dosA=+row['döşeme alanı']||alan;
  const nO=+row['oturan kişi']||+row.nOturan||0,nA=+row['ayakta kişi']||+row.nAyakta||0,nD=+row['dans eden kişi']||+row.nDans||0;
  const nT=nO+nA+nD;
  const insDuy=nO*66+nA*64+nD*90;
  const insGiz=nO*60+nA*52+nD*150;
  const qTVwm2=+row['Televizyon']||0, qCihazwm2=+row['Cihazlar']||0;
  const qTV=alan*qTVwm2, qCihaz=alan*qCihazwm2;
  const aydW=+row['aydınlatma yükü']||20;
  const qAyd=alan*aydW*P.fAyd;
  const mahalTip=mahalTipBelirle(row.mahalAdi||row['mahal adı']||'');

  // ── 12 ay × saat tarama (Mayıs-Eylül soğutma sezonu) ─────────────────────────
  // Aylık Tmax değerlerini kullanıcının P.Tmax ve P.DR değerlerine göre ölçekle
  // Referans: İstanbul tablosunun Temmuz(7) değeri = 32.0°C
  const _tmax_ref = 32.0;
  const _pTmax = +P.Tmax || 33;
  const _pDR   = +P.DR   || 10;
  function getAylikTmax(ay){ return [AYLIK_TMAX[ay][0] * (_pTmax/_tmax_ref), _pDR]; }

  let bestLoad=-Infinity,bestSaat=14,bestAy=7,hourlyLoads={};
  for(let ay=1;ay<=12;ay++){
    hourlyLoads[ay]={};
    const [Tmax_ay,DR_ay]=getAylikTmax(ay);
    // Soğutma hesabı sadece Mayıs-Eylül (5-9)
    if(ay<5||ay>9) continue;
    for(let s=8;s<20;s++){
      const Td=hourlyExtTemp(s,Tmax_ay,DR_ay);
      const dt=Math.max(Td-Ty,0);

      // Cam radyasyonu
      let qC=0;
      YONLER.forEach(y=>{
        if(pen[y]>0) qC+=pen[y]*camRad(y,ay,s,P.shgc,golge);
      });

      // Duvar iletim
      let qD=0;
      YONLER.forEach(y=>{
        if(duv[y]>0) qD+=duv[y]*uDuv*Math.max(cltdD(y,s,ay,Ty,P),0);
      });

      // Pencere iletim
      let qPI=0;
      YONLER.forEach(y=>{if(pen[y]>0) qPI+=pen[y]*uPenc*dt;});

      // Tavan CLTD – ASHRAE çatı için duvar tablosundan farklıdır.
      // Düzeltme: çatı ısı kapasitesi duvara göre daha düşük → 1.5–2.0 kat daha yüksek CLTD.
      // Pratik yaklaşım: güney duvar CLTD × 1.8 (orta ağırlıklı çatı, ASHRAE Grup C/D arası)
      const cTav=cltdD('güney',s,ay,Ty,P)*1.8;
      const qTav=tavanA*uTav*Math.max(cTav,0);

      // Döşeme – zemin döşemesi için ASHRAE: iç–zemin ΔT genellikle 2–4°C kabul edilir.
      // DÜZELTME: uDos Excel'den okunur (varsayılan 0.50 W/m²K), ΔT=2°C (zemin sabit sıcaklık varsayımı)
      const qDos=dosA*uDos*2;

      // ── SKYLIGHT ──────────────────────────────────────────
      // Yatay yüzey → 41°N'de yatay/güney-dikey SHGF oranı Temmuz'da ~2.0 (güney ~490 W/m², yatay ~950 W/m²)
      // DÜZELTİLDİ: 1.3 yerine 2.0 katsayısı (ASHRAE 41°N yatay yüzey için daha gerçekçi)
      let qSkylight=0, qSkylightSolar=0, qSkylightIlet=0;
      if(skylightA>0){
        const shgfYatay=(SHGF[ay]&&SHGF[ay]['güney'])?SHGF[ay]['güney'][s]*2.0:0;
        const scVal=scSkylight; // Skylight gölgeleme katsayısı
        qSkylightSolar = skylightA * shgfYatay * scVal;           // Solar kazanç
        qSkylightIlet  = skylightA * uSkylight * dt;              // İletim kaybı/kazanç
        qSkylight = qSkylightSolar + qSkylightIlet;
      }

      const qIcD=insDuy+qTV+qCihaz+qAyd;
      const qIcG=insGiz;
      const ozK=1+P.odaZam/100, efK=1+P.effZam/100;
      const rsh=(qC+qD+qPI+qTav+qDos+qIcD+qSkylight)*ozK;
      const rlh=qIcG*ozK;
      const ersh=rsh*efK, erlh=rlh, erth=ersh+erlh;
      hourlyLoads[ay][s]={erth,ersh,erlh,rsh,rlh,
        qCam:qC,qDuvar:qD,qPencIlet:qPI,qTavan:qTav,qDoseme:qDos,
        qSkylight,qSkylightSolar,qSkylightIlet,
        qIcDuy:qIcD,qIcGiz:qIcG,Tdis:Td,dT:dt};
      if(erth>bestLoad){bestLoad=erth;bestSaat=s;bestAy=ay;}
    }
  }

  // ── Kış ─────────────────────────────────────────
  const dtK=Tk-P.kisKt;
  let qDK=0; YONLER.forEach(y=>qDK+=(duv[y]||0)*uDuv*dtK);
  let qPK=0; YONLER.forEach(y=>qPK+=(pen[y]||0)*uPenc*dtK);
  const qDoK=dosA*uDos*dtK,qTK=tavanA*uTav*dtK; // DÜZELTME: döşeme U değeri Excel'den + gerçek dtK
  // Skylight kış ısı kaybı
  const qSkylightKis = skylightA>0 ? skylightA*uSkylight*dtK : 0;
  const qKR=qDK+qPK+qDoK+qTK+qSkylightKis,qK=qKR*P.ruzgarZam;

  // ── Emniyet ──────────────────────────────────────
  const emSF=1+(P.emSog||0)/100, emIF=1+(P.emIst||0)/100;

  // ── Havalandırma ─────────────────────────────────
  const thData=tazeHavaHesapla({alan,h:h_,nToplam:nT,nOturan:nO,nAyakta:nA,nDans:nD,mahalTip,Tic_yaz:Ty,Tic_kis:Tk},P);

  // ── İNFİLTRASYON (TS 825 ACH yöntemi) ───────────────────────
  // Q_infil_sog = ρ × Cp × V̇_infil × ΔT  (duyulur, soğutma)
  // Q_infil_ist = ρ × Cp × V̇_infil × ΔT  (ısıtma)
  const ach = infilACH(mahalTip);
  const vInfil_m3h = hacim * ach;              // m³/h
  const vInfil_kgs = vInfil_m3h * 1.2 / 3600; // kg/s
  const dT_infil_sog = Math.max(0, P.Tmax - Ty);
  const dT_infil_ist = Math.max(0, Tk - P.kisKt);
  const infilSog = P.infilEkle ? Math.round(vInfil_kgs * 1006 * dT_infil_sog) : 0;
  const infilIst = P.infilEkle ? Math.round(vInfil_kgs * 1006 * dT_infil_ist) : 0;
  // Her durumda hesap değerini sakla (checkbox kapalıysa 0 gösterilir)
  const infilSogHam = Math.round(vInfil_kgs * 1006 * dT_infil_sog);
  const infilIstHam = Math.round(vInfil_kgs * 1006 * dT_infil_ist);

  // ── ELEKTRIK / SERVER odaları: soğutma yükü m² üzerinden override ──
  let bestLoadFinal, sogYukuAciklama='ASHRAE CLTD';
  if(mahalTip==='ELEKTRIK'){
    bestLoadFinal = alan * 400 * emSF;
    sogYukuAciklama = '400 W/m² (Teknik Oda)';
  } else if(mahalTip==='SERVER'){
    bestLoadFinal = alan * 1000 * emSF;
    sogYukuAciklama = '1000 W/m² (Server Odası)';
  } else {
    bestLoadFinal=(bestLoad*emSF)
      +(P.thSogEkle?Math.max(0,thData.thSogT):0)
      +infilSog;
  }
  const qKayipFinal=(qK*emIF)+(P.thIstEkle?Math.max(0,thData.thIst):0)+infilIst;

  // ── Cihaz seçimi ─────────────────────────────────────────
  // Cihaz seçim mantığı:
  // 1. Eğer row'da iptal bayrağı varsa → cihaz null
  // 2. Eğer korunanCihaz açıkça null geçildiyse → cihaz null (iptal edilmiş)
  // 3. Eğer korunanCihaz varsa → korunanCihaz kullan
  // 4. Eğer row'da cihaz varsa → row.cihaz kullan
  // 5. Hiçbiri yoksa → otomatik yeni cihaz seç
  //
  // NOT: Bu fonksiyon eskiden `korunanCihaz = null` varsayılan parametre değeri kullanıyordu.
  // Çağıran kod bazı yollarda `hesaplaMahalV5(row, P, undefined)` şeklinde (3 argümanla, değer
  // undefined) çağırıyordu — JS'in varsayılan parametre mekanizması bu durumda undefined'ı
  // sessizce null'a çeviriyordu, ve `arguments.length>=3` kontrolü bunu "kullanıcı cihazı bilerek
  // iptal etti" sanıp otomatik seçimi atlıyordu. Sonuç: hiçbir sistem/tip için otomatik cihaz
  // seçimi çalışmıyordu. Artık varsayılan parametre yok, bu yüzden korunanCihaz === undefined
  // (argüman verilmemiş ya da açıkça undefined geçilmiş) ile === null (bilerek iptal edilmiş)
  // güvenle ayırt edilebiliyor.
  let cihaz;
  if(row._cihazIptal) {
    // Kullanıcı cihazı açıkça iptal etti
    cihaz = null;
  } else if(korunanCihaz !== undefined && korunanCihaz !== null) {
    // Korunan cihaz var, onu kullan
    cihaz = korunanCihaz;
  } else if(korunanCihaz === null) {
    // korunanCihaz açıkça null geçildi (cihaz iptal edilmiş)
    cihaz = null;
  } else if(row._forceAutoCihaz) {
    // Bu mahal için cihaz otomatik yeniden seçilsin
    cihaz = typeof cihazSec === 'function'
      ? cihazSec(bestLoadFinal, P.icUniteTip||'FCU_ORTA_KANAL', mahalTip, alan)
      : null;
  } else if(row.cihaz) {
    // Satırda mevcut cihaz var, onu kullan
    cihaz = row.cihaz;
  } else {
    // Otomatik yeni cihaz seç
    cihaz = typeof cihazSec === 'function'
      ? cihazSec(bestLoadFinal, P.icUniteTip||'FCU_ORTA_KANAL', mahalTip, alan)
      : null;
  }

  // Return
  return {
    mahalNo:row.mahalNo||row['mahal no'],mahalAdi:row.mahalAdi||row['mahal adı'],
    alan,h:h_,hacim,nToplam:nT,nOturan:nO,nAyakta:nA,nDans:nD,
    Tic_yaz:Ty,Tic_kis:Tk,mahalTip,
    bestAy,bestSaat,bestLoad:bestLoadFinal,bestLoadBase:bestLoad,emSogFak:emSF,
    sogYukuAciklama,
    peak:hourlyLoads[bestAy]?hourlyLoads[bestAy][bestSaat]:{},hourlyLoads,
    // PDF için bileşen yükleri - Excel'den veya hesaplamadan
    pencereQ: parseFloat(row['Cam\n(W)'] || 0) + parseFloat(row['Penc.İlet\n(W)'] || 0),
    duvarQ: parseFloat(row['Duvar\n(W)'] || 0),
    tavanQ: parseFloat(row['Tavan\n(W)'] || 0),
    dosemeQ: parseFloat(row['Döşeme\n(W)'] || 0),
    skylightQ: 0, // Excel'de yok, hesaplamadan alsak bile genelde 0
    aydinlatmaQ: parseFloat(row['İç.Duy\n(W)'] || qAyd), // Excel'deki tüm iç yükler veya hesaplanan
    ekipmanQ: qTV + qCihaz,
    insanQ: insDuy,
    insanQLatent: parseFloat(row['İç.Giz\n(W)'] || insGiz),
    sizintiQ: 0, // Şu an sızıntı hesaplanmıyor
    // Alanlar - PDF için
    pencereAlan: YONLER.reduce((sum, y) => sum + (pen[y] || 0), 0),
    duvarAlan: YONLER.reduce((sum, y) => sum + (duv[y] || 0), 0),
    tavanAlan: tavanA,
    dosemeAlan: dosA,
    skylightAlan: skylightA,
    // U-değerleri
    pencereU: uPenc,
    duvarU: uDuv,
    tavanU: uTav,
    skylightU: uSkylight,
    // Gölgeleme katsayıları
    pencereG: golge,
    scSkylight: scSkylight,
    // Kış yükleri (iletim)
    pencereQis: qPK,
    duvarQis: qDK,
    tavanQis: qTK,
    dosemeQis: qDoK,
    skylightQis: qSkylightKis,
    qKayip:qKayipFinal,qKayipBase:qK,qKayipRaw:qKR,emIstFak:emIF,
    qDuvarKis:qDK,qPencKis:qPK,qDosKis:qDoK,qTavKis:qTK,qSkylightKis,dtKis:dtK,
    insDuy,insGiz,qAyd,qTV,qCihaz,aydW,
    uDuv,uPenc,uTav,uDos,duvarAlani:duv,pencAlani:pen,tavanA,dosA,
    skylightA,uSkylight,scSkylight,
    infilACH_val:ach,infilFlow_m3h:+vInfil_m3h.toFixed(1),
    infilSog,infilIst,infilSogHam,infilIstHam,
    ahuZon:(function(){const an=row['ahu/santral']||row['ahu santral']||row['santral']||''; return an&&an!=='–'&&an!==''?an:'AHU1';}()),
    tazeHavaCihazi:(row._thDisabled ? '' : (row.tazeHavaCihazi !== undefined ? row.tazeHavaCihazi : (function(){const an=row['ahu/santral']||row['ahu santral']||row['santral']||''; return an&&an!=='–'&&an!==''?an:'AHU1';}()))),
    egzozCihazi:(row._exDisabled ? '' : (row.egzozCihazi !== undefined ? row.egzozCihazi : (function(){const an=row['ahu/santral']||row['ahu santral']||row['santral']||''; return an&&an!=='–'&&an!==''?an:'AHU1';}()))),
    thData, cihaz,
    kisiSayisi: nT,
    _thDisabled: !!row._thDisabled,
    _exDisabled: !!row._exDisabled,
    tavanDurumu: row.tavanDurumu || ''
  };
}
