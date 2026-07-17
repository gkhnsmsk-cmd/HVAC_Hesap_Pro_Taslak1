// ═══════════════════════════════════════════════════════════════════════════
// HVAC Hesap Pro — Havuz Buharlaşması Testi (pool-evaporation-test.js)
// ═══════════════════════════════════════════════════════════════════════════

const { calc } = require('../HVAC_Pro_v8/js/pool-evaporation.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`✗ ${message}`);
    testsFailed++;
  }
}

function assertClose(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected);
  const pass = diff <= tolerance;
  if (pass) {
    console.log(`✓ ${message} (gerçek: ${actual}, beklenen: ${expected} ±${tolerance})`);
    testsPassed++;
  } else {
    console.error(`✗ ${message} (gerçek: ${actual}, beklenen: ${expected} ±${tolerance}, fark: ${diff})`);
    testsFailed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Standart senaryosu (100m² havuz, 4245 Pa su, 1500 Pa hava)
// Beklenen: 0.09 × 100 × (4245 - 1500) / 1000 × 1 = 24.705 kg/h
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 1] Standart senaryo (el hesabı: 24.705 kg/h)');
const result1 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: 0.09
});

assert(!result1.error, 'Hata yok');
assertClose(result1.buharlas_kg_per_h, 24.705, 1.0, 'Buharlaşma oranı ~24.7 kg/h (±1)');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Sıfır alan
// Beklenen: 0 kg/h
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 2] Sıfır havuz alanı');
const result2 = calc({
  havuzAlaniM2: 0,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: 0.09
});

assert(!result2.error, 'Hata yok');
assert(result2.buharlas_kg_per_h === 0, 'Sonuç 0 kg/h');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Sıfır basınç farkı (doymuş hava)
// Beklenen: 0 kg/h
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 3] Sıfır basınç farkı (doymuş hava)');
const result3 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 4245,
  aktiviteFaktor: 1,
  konvKatsayi: 0.09
});

assert(!result3.error, 'Hata yok');
assert(result3.buharlas_kg_per_h === 0, 'Sonuç 0 kg/h');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Aktivite faktörü etkisi
// Aynı parametreler ama aktiviteFaktor=2
// Beklenen: 24.705 × 2 = 49.41 kg/h
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 4] Aktivite faktörü=2');
const result4 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 2,
  konvKatsayi: 0.09
});

assert(!result4.error, 'Hata yok');
assertClose(result4.buharlas_kg_per_h, 49.41, 1.0, 'Buharlaşma oranı ~49.4 kg/h (aktivite ×2)');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5: Konveksiyon katsayısı etkisi
// Aynı parametreler ama konvKatsayi=0.18 (2×)
// Beklenen: 24.705 × 2 = 49.41 kg/h
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 5] Konveksiyon katsayısı=0.18 (2× default)');
const result5 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: 0.18
});

assert(!result5.error, 'Hata yok');
assertClose(result5.buharlas_kg_per_h, 49.41, 1.0, 'Buharlaşma oranı ~49.4 kg/h (konvKatsayi ×2)');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6: Geçersiz girdi — opts null
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 6] Geçersiz girdi: null');
const result6 = calc(null);

assert(result6.error !== undefined, 'Hata nesnesinde error alanı var');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 7: Geçersiz girdi — negatif alan
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 7] Geçersiz girdi: negatif alan');
const result7 = calc({
  havuzAlaniM2: -10,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: 0.09
});

assert(result7.error !== undefined, 'Hata nesnesinde error alanı var');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 8: Geçersiz girdi — negatif konvKatsayi
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 8] Geçersiz girdi: negatif konvKatsayi');
const result8 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: -0.05
});

assert(result8.error !== undefined, 'Hata nesnesinde error alanı var');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 9: Varsayımlar nesnesi kontrol
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[TEST 9] Varsayımlar nesnesi');
const result9 = calc({
  havuzAlaniM2: 100,
  buharBasinciSu_Pa: 4245,
  buharBasinciHava_Pa: 1500,
  aktiviteFaktor: 1,
  konvKatsayi: 0.09
});

assert(result9.varsayimlar !== undefined, 'Varsayımlar nesnesi var');
assert(result9.varsayimlar.konvKatsayi === 0.09, 'konvKatsayi doğru kaydedilmiş');
assert(result9.varsayimlar.dipNot !== undefined, 'VDI 2089 dipnotu var');

// ─────────────────────────────────────────────────────────────────────────────
// SONUÇ
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(80));
console.log(`SONUÇ: ${testsPassed} başarılı, ${testsFailed} başarısız`);
console.log('='.repeat(80));

if (testsFailed > 0) {
  console.error('\nTestler başarısız.');
  process.exit(1);
} else {
  console.log('\nTüm testler başarılı!');
  process.exit(0);
}
