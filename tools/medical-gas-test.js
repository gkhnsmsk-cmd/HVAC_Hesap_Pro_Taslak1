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

// ── pipeVelocity / velocityCheck / selectPipeDiameter (YENİ) ──
// Test 9: pipeVelocity — 100 L/min, DN 22mm (iç çap ~22mm örnek)
// v = (100/60000) / (pi/4*(0.022)^2) = 0.001667 / 0.0003801 = 4.386 m/s
const v9 = MedicalGas.pipeVelocity({ flow_l_min: 100, pipe_id_mm: 22 });
assert(Math.abs(v9 - 4.386) < 0.01, `pipeVelocity 100L/min DN22 should be ~4.386 m/s, got ${v9}`);

// Test 10: pipeVelocity — geçersiz girdi (pipe_id_mm<=0) -> NaN
assert(isNaN(MedicalGas.pipeVelocity({ flow_l_min: 100, pipe_id_mm: 0 })), 'pipeVelocity pipe_id_mm=0 should be NaN');
assert(isNaN(MedicalGas.pipeVelocity({ flow_l_min: -5, pipe_id_mm: 22 })), 'pipeVelocity negative flow should be NaN');

// Test 11: velocityCheck — uygun (v < vmax)
const vc11 = MedicalGas.velocityCheck({ flow_l_min: 100, pipe_id_mm: 22, max_velocity_m_s: 6 });
assert(vc11.uygun === true, `velocityCheck should be uygun=true (v~4.39 < 6), got ${JSON.stringify(vc11)}`);

// Test 12: velocityCheck — uygun değil (v > vmax)
const vc12 = MedicalGas.velocityCheck({ flow_l_min: 100, pipe_id_mm: 10, max_velocity_m_s: 3 });
assert(vc12.uygun === false, `velocityCheck should be uygun=false (small pipe, high velocity), got ${JSON.stringify(vc12)}`);

// Test 13: velocityCheck — max_velocity_m_s eksik -> uygun=null (karar veremez, NaN değil)
const vc13 = MedicalGas.velocityCheck({ flow_l_min: 100, pipe_id_mm: 22 });
assert(vc13.uygun === null, `velocityCheck without max_velocity should have uygun=null, got ${JSON.stringify(vc13)}`);

// Test 14: selectPipeDiameter — uygun en küçük çapı seçer
const sp14 = MedicalGas.selectPipeDiameter({ flow_l_min: 100, max_velocity_m_s: 6, candidate_ids_mm: [10, 15, 22, 28, 35] });
assert(sp14.pipe_id_mm === 22, `selectPipeDiameter should pick 22mm (smallest satisfying v<=6), got ${JSON.stringify(sp14)}`);

// Test 15: selectPipeDiameter — hiçbir aday yetmezse NaN
const sp15 = MedicalGas.selectPipeDiameter({ flow_l_min: 100, max_velocity_m_s: 0.5, candidate_ids_mm: [10, 15, 22] });
assert(Number.isNaN(sp15.pipe_id_mm), `selectPipeDiameter should return NaN if no candidate satisfies limit, got ${JSON.stringify(sp15)}`);

// Test 16: selectPipeDiameter — geçersiz/boş aday listesi -> NaN
const sp16 = MedicalGas.selectPipeDiameter({ flow_l_min: 100, max_velocity_m_s: 6, candidate_ids_mm: [] });
assert(Number.isNaN(sp16.pipe_id_mm), `selectPipeDiameter empty candidates should be NaN, got ${JSON.stringify(sp16)}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
