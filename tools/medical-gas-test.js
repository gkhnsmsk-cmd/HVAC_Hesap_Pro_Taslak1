// tools/medical-gas-test.js
const MedicalGas = require('../HVAC_Pro_v8/js/medical-gas.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failed++;
  } else {
    console.log(`PASS: ${message}`);
    passed++;
  }
}

// Test 1: totalFlow — iki nokta tipi
const result1 = MedicalGas.totalFlow({
  noktalar: [{adet: 10, debi_l_min_nokta: 6}, {adet: 5, debi_l_min_nokta: 10}]
});
assert(result1 === 110, `totalFlow should return 110, got ${result1}`);

// Test 2: simultaneityFactor — basit
const result2 = MedicalGas.simultaneityFactor({toplam_l_min: 110, faktor: 0.5});
assert(result2 === 55, `simultaneityFactor should return 55, got ${result2}`);

// Test 3: totalFlow — boş dizi
const result3 = MedicalGas.totalFlow({noktalar: []});
assert(result3 === 0, `totalFlow with empty array should return 0, got ${result3}`);

// Test 4: totalFlow — NaN girdisi
const result4 = MedicalGas.totalFlow({noktalar: [{adet: NaN, debi_l_min_nokta: 5}]});
assert(isNaN(result4), `totalFlow with NaN should return NaN, got ${result4}`);

// Test 5: totalFlow — undefined noktalar
const result5 = MedicalGas.totalFlow({});
assert(result5 === 0, `totalFlow with undefined noktalar should return 0, got ${result5}`);

// Test 6: simultaneityFactor — NaN toplam
const result6 = MedicalGas.simultaneityFactor({toplam_l_min: NaN, faktor: 0.5});
assert(isNaN(result6), `simultaneityFactor with NaN should return NaN, got ${result6}`);

// Test 7: simultaneityFactor — NaN faktor
const result7 = MedicalGas.simultaneityFactor({toplam_l_min: 100, faktor: NaN});
assert(isNaN(result7), `simultaneityFactor with NaN faktor should return NaN, got ${result7}`);

// Test 8: totalFlow — tek nokta
const result8 = MedicalGas.totalFlow({noktalar: [{adet: 3, debi_l_min_nokta: 7}]});
assert(result8 === 21, `totalFlow single point should return 21, got ${result8}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
