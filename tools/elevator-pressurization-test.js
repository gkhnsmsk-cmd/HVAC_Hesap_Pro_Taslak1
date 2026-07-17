// Test: elevator-pressurization.js
// Başarılıysa: process.exit(0)
// Başarısızsa: process.exit(1)
const ElevatorPressurization = require('../HVAC_Pro_v8/js/elevator-pressurization.js');

function assertClose(actual, expected, tolerance, label) {
  if (Math.abs(actual - expected) > tolerance) {
    console.error(`FAIL: ${label}`);
    console.error(`  Expected: ${expected} (±${tolerance})`);
    console.error(`  Got: ${actual}`);
    return false;
  }
  console.log(`PASS: ${label}`);
  return true;
}

function assert(cond, label) {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    return false;
  }
  console.log(`PASS: ${label}`);
  return true;
}

let pass = true;

// Test 1: Temel hesaplama
// Girdi: sizdirmazlikAlaniM2=1.0, hizKatsayi=0.83, hedefBasincFarkiPa=50, hava_yogunluk=1.2
// Beklenen:
//   hizMs = 0.83 * sqrt(2*50/1.2) = 0.83 * sqrt(83.333...) = 0.83 * 9.1287... ≈ 7.577 m/s
//   debiM3s = 1.0 * 7.577 = 7.577 m³/s
//   debiM3h = 7.577 * 3600 = 27277 m³/h
const result1 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: 1.0,
  hizKatsayi: 0.83,
  hedefBasincFarkiPa: 50,
  hava_yogunluk: 1.2
});

console.log('\n=== Test 1: Temel Hesaplama ===');
console.log('Result:', result1);

pass = assertClose(result1.hizMs, 7.58, 0.05, 'hizMs ≈ 7.58 (±0.05)') && pass;
pass = assertClose(result1.debiM3s, 7.58, 0.05, 'debiM3s ≈ 7.58 (±0.05)') && pass;
pass = assertClose(result1.debiM3h, 27288, 100, 'debiM3h ≈ 27288 (±100)') && pass;

// Test 2: Geçersiz girdi — sizdirmazlik eksik
console.log('\n=== Test 2: Geçersiz Girdi (sizdirmazlik eksik) ===');
const result2 = ElevatorPressurization.calc({
  hizKatsayi: 0.83,
  hedefBasincFarkiPa: 50
});
console.log('Result:', result2);
pass = assert(result2.error !== undefined, 'Hata dönülüyor (sizdirmazlik eksik)') && pass;

// Test 3: Geçersiz girdi — basınç eksik
console.log('\n=== Test 3: Geçersiz Girdi (basınç eksik) ===');
const result3 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: 1.0,
  hizKatsayi: 0.83
});
console.log('Result:', result3);
pass = assert(result3.error !== undefined, 'Hata dönülüyor (basınç eksik)') && pass;

// Test 4: Negatif sizdirmazlik
console.log('\n=== Test 4: Geçersiz Girdi (negatif sizdirmazlik) ===');
const result4 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: -0.5,
  hedefBasincFarkiPa: 50
});
console.log('Result:', result4);
pass = assert(result4.error !== undefined, 'Hata dönülüyor (negatif sizdirmazlik)') && pass;

// Test 5: Negatif basınç
console.log('\n=== Test 5: Geçersiz Girdi (negatif basınç) ===');
const result5 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: 1.0,
  hedefBasincFarkiPa: -50
});
console.log('Result:', result5);
pass = assert(result5.error !== undefined, 'Hata dönülüyor (negatif basınç)') && pass;

// Test 6: Null opts
console.log('\n=== Test 6: Geçersiz Girdi (null opts) ===');
const result6 = ElevatorPressurization.calc(null);
console.log('Result:', result6);
pass = assert(result6.error !== undefined, 'Hata dönülüyor (null opts)') && pass;

// Test 7: Varsayılan parametreler ile hesaplama
console.log('\n=== Test 7: Varsayılan Parametreler ===');
const result7 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: 2.0,
  hedefBasincFarkiPa: 50
  // hizKatsayi ve hava_yogunluk varsayılan
});
console.log('Result:', result7);
pass = assert(result7.debiM3h !== undefined && result7.debiM3h > 0, 'Varsayılan parametrelerle hesaplama başarılı') && pass;

// Test 8: Yüksek basınç
console.log('\n=== Test 8: Yüksek Basınç (100 Pa) ===');
const result8 = ElevatorPressurization.calc({
  sizdirmazlikAlaniM2: 0.5,
  hedefBasincFarkiPa: 100
});
console.log('Result:', result8);
pass = assert(result8.debiM3h !== undefined && result8.debiM3h > 0, 'Yüksek basınç hesaplaması başarılı') && pass;

console.log('\n' + '='.repeat(50));
if (pass) {
  console.log('ALL TESTS PASSED');
  process.exit(0);
} else {
  console.log('SOME TESTS FAILED');
  process.exit(1);
}
