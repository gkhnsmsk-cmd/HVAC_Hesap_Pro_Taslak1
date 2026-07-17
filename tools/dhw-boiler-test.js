/**
 * dhw-boiler-test.js
 * DHW Boiler modülü (js/dhw-boiler.js) birim test suite.
 * Standart: EN 12831, ASHRAE Handbook — Fundamentals
 * Formüller: kW = (debiLpm/60) * yogunluk * cp * ΔT
 *            hacimL = gunlukIhtiyacL * esZamanlilikFaktor
 */

const DhwBoiler = require('../HVAC_Pro_v8/js/dhw-boiler.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('✓ ' + message);
    testsPassed++;
  } else {
    console.log('✗ ' + message);
    testsFailed++;
  }
}

function assertClose(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log('✓ ' + message + ' (gerçek: ' + actual.toFixed(2) + ')');
    testsPassed++;
  } else {
    console.log('✗ ' + message + ' (beklenen: ' + expected.toFixed(2) + ', gerçek: ' + actual.toFixed(2) + ')');
    testsFailed++;
  }
}

console.log('=== DHW Boiler Modülü Testleri ===\n');

// Test 1: calc() — Standart ısıtma yükü hesabı
console.log('Test 1: calc() — Standart ısıtma yükü');
var result1 = DhwBoiler.calc({
  debiLpm: 20,      // 20 L/dak
  tGiris_C: 10,     // 10°C girişi
  tCikis_C: 60,     // 60°C çıkışı
  cp: 4.186,        // su için
  yogunluk: 1.0     // su yoğunluğu
});
// Beklenen: (20/60) * 1.0 * 4.186 * 50 = 69.767 kW
assertClose(result1.kW, 69.77, 0.5, 'debiLpm:20, ΔT:50°C → kW≈69.77');

// Test 2: calc() — Sıfır yük (giriş = çıkış)
console.log('\nTest 2: calc() — Sıfır yük');
var result2 = DhwBoiler.calc({
  debiLpm: 20,
  tGiris_C: 20,
  tCikis_C: 20,
  cp: 4.186,
  yogunluk: 1.0
});
assertClose(result2.kW, 0, 0.01, 'ΔT:0°C → kW=0');

// Test 3: calc() — Negatif sıcaklık farkı (soğutma, kabul edilir)
console.log('\nTest 3: calc() — Soğutma (negatif yük)');
var result3 = DhwBoiler.calc({
  debiLpm: 10,
  tGiris_C: 50,
  tCikis_C: 30,
  cp: 4.186,
  yogunluk: 1.0
});
// (10/60) * 1.0 * 4.186 * (-20) = -13.953 kW
assertClose(result3.kW, -13.95, 0.5, 'ΔT:-20°C → kW≈-13.95 (soğutma)');

// Test 4: calc() — Geçersiz debi (negatif)
console.log('\nTest 4: calc() — Geçersiz girdi (debi < 0)');
var result4 = DhwBoiler.calc({
  debiLpm: -5,
  tGiris_C: 10,
  tCikis_C: 60
});
assert(result4.error !== undefined, 'Negatif debi → error object döndür');

// Test 5: calc() — Geçersiz sıcaklık (NaN)
console.log('\nTest 5: calc() — Geçersiz sıcaklık');
var result5 = DhwBoiler.calc({
  debiLpm: 20,
  tGiris_C: NaN,
  tCikis_C: 60
});
assert(result5.error !== undefined, 'NaN sıcaklık → error object döndür');

// Test 6: calc() — Varsayılan değerler (cp ve yogunluk)
console.log('\nTest 6: calc() — Varsayılan cp ve yogunluk');
var result6 = DhwBoiler.calc({
  debiLpm: 20,
  tGiris_C: 10,
  tCikis_C: 60
  // cp ve yogunluk verilmemiş → varsayılan 4.186 ve 1.0 kullanılmalı
});
assertClose(result6.kW, 69.77, 0.5, 'Varsayılan cp/yogunluk → kW≈69.77');

// Test 7: calc() — Özel cp değeri (örn. farklı sıvı)
console.log('\nTest 7: calc() — Özel cp değeri');
var result7 = DhwBoiler.calc({
  debiLpm: 20,
  tGiris_C: 10,
  tCikis_C: 60,
  cp: 3.5,          // farklı sıvı
  yogunluk: 0.8
});
// (20/60) * 0.8 * 3.5 * 50 = 46.667 kW
assertClose(result7.kW, 46.67, 0.5, 'cp:3.5, yogunluk:0.8 → kW≈46.67');

// Test 8: depolamaHacmi() — Standart depolama hacmi
console.log('\nTest 8: depolamaHacmi() — Standart hesap');
var result8 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: 1000,         // 1000 L/gün
  esZamanlilikFaktor: 0.5       // sistem kapasitesi günde 2 kez yenilenebilir
});
// 1000 * 0.5 = 500 L
assertClose(result8.hacimL, 500, 0.1, 'gunlukIhtiyac:1000L, faktor:0.5 → hacim=500L');

// Test 9: depolamaHacmi() — Tam kapasiteli sistem (faktor=1.0)
console.log('\nTest 9: depolamaHacmi() — Tam kapasiteli sistem');
var result9 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: 2000,
  esZamanlilikFaktor: 1.0
});
assertClose(result9.hacimL, 2000, 0.1, 'faktor:1.0 → hacim=gunlukIhtiyac');

// Test 10: depolamaHacmi() — Varsayılan faktor
console.log('\nTest 10: depolamaHacmi() — Varsayılan faktor (1.0)');
var result10 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: 1500
  // faktor verilmemiş → 1.0
});
assertClose(result10.hacimL, 1500, 0.1, 'Varsayılan faktor:1.0 → hacim=1500L');

// Test 11: depolamaHacmi() — Geçersiz ihtiyaç (negatif)
console.log('\nTest 11: depolamaHacmi() — Geçersiz ihtiyaç (negatif)');
var result11 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: -100,
  esZamanlilikFaktor: 0.5
});
assert(result11.error !== undefined, 'Negatif ihtiyaç → error object döndür');

// Test 12: depolamaHacmi() — Geçersiz faktor (negatif)
console.log('\nTest 12: depolamaHacmi() — Geçersiz faktor (negatif)');
var result12 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: 1000,
  esZamanlilikFaktor: -0.5
});
assert(result12.error !== undefined, 'Negatif faktor → error object döndür');

// Test 13: depolamaHacmi() — Sıfır ihtiyaç
console.log('\nTest 13: depolamaHacmi() — Sıfır ihtiyaç');
var result13 = DhwBoiler.depolamaHacmi({
  gunlukIhtiyacL: 0,
  esZamanlilikFaktor: 0.5
});
assertClose(result13.hacimL, 0, 0.1, 'gunlukIhtiyac:0 → hacim=0');

// Test 14: calc() — Büyük debi
console.log('\nTest 14: calc() — Büyük debi');
var result14 = DhwBoiler.calc({
  debiLpm: 100,
  tGiris_C: 10,
  tCikis_C: 60,
  cp: 4.186,
  yogunluk: 1.0
});
// (100/60) * 1.0 * 4.186 * 50 = 348.833 kW
assertClose(result14.kW, 348.83, 1.0, 'debiLpm:100 → kW≈348.83');

// Test 15: Edge case — Sıfır debi
console.log('\nTest 15: calc() — Sıfır debi');
var result15 = DhwBoiler.calc({
  debiLpm: 0,
  tGiris_C: 10,
  tCikis_C: 60,
  cp: 4.186,
  yogunluk: 1.0
});
assertClose(result15.kW, 0, 0.01, 'debiLpm:0 → kW=0');

// Sonuç raporu
console.log('\n=== TEST SONUCU ===');
console.log('Geçen testler: ' + testsPassed);
console.log('Başarısız testler: ' + testsFailed);

if (testsFailed === 0) {
  console.log('✓ Tüm testler başarılı!');
  process.exit(0);
} else {
  console.log('✗ ' + testsFailed + ' test başarısız.');
  process.exit(1);
}
