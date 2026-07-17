/**
 * Disiplin-Sistem Seçimi Modülü — Test Suite
 *
 * 12 test case'i ile modülü doğrular.
 * Exit code 0 başarılı, exit code 1 başarısız
 */

const module_path = '../HVAC_Pro_v8/js/disiplin-sistem-secimi.js';
const {
  getDisciplines,
  getSystemsForDiscipline,
  selectSystem,
  isValidCombination
} = require(module_path);

let testsPassed = 0;
let testsFailed = 0;

/**
 * Test helper
 */
function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    testsFailed++;
  }
}

/**
 * Assertion helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Deep equality helper
 */
function deepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// TEST CASES (12 total)
// ============================================================================

// Test 1: getDisciplines() döndürür 5 disiplini
test('getDisciplines() returns 5 disciplines', () => {
  const disciplines = getDisciplines();
  assert(Array.isArray(disciplines), 'Result should be an array');
  assert(disciplines.length === 5, `Expected 5 disciplines, got ${disciplines.length}`);
  
  const names = disciplines.map(d => d.name);
  deepEqual(names, ['Heating', 'Cooling', 'Ventilation', 'Sanitary', 'Fire'],
    'Discipline names mismatch');
});

// Test 2: getDisciplines() denetim - her disiplinin id'si var
test('getDisciplines() - all have ids', () => {
  const disciplines = getDisciplines();
  disciplines.forEach(d => {
    assert(d.id, `Discipline missing id: ${d.name}`);
    assert(d.name, `Discipline missing name: ${d.id}`);
  });
});

// Test 3: Heating disiplini 4 sistem ile gelir
test('Heating discipline has 4 systems', () => {
  const systems = getSystemsForDiscipline('heating');
  assert(Array.isArray(systems), 'Result should be an array');
  assert(systems.length === 4, `Expected 4 systems, got ${systems.length}`);
});

// Test 4: Cooling disiplini 4 sistem ile gelir
test('Cooling discipline has 4 systems', () => {
  const systems = getSystemsForDiscipline('cooling');
  assert(Array.isArray(systems), 'Result should be an array');
  assert(systems.length === 4, `Expected 4 systems, got ${systems.length}`);
});

// Test 5: Ventilation disiplini 4 sistem ile gelir
test('Ventilation discipline has 4 systems', () => {
  const systems = getSystemsForDiscipline('ventilation');
  assert(Array.isArray(systems), 'Result should be an array');
  assert(systems.length === 4, `Expected 4 systems, got ${systems.length}`);
});

// Test 6: Sanitary disiplini 1 sistem ile gelir
test('Sanitary discipline has 1 system', () => {
  const systems = getSystemsForDiscipline('sanitary');
  assert(Array.isArray(systems), 'Result should be an array');
  assert(systems.length === 1, `Expected 1 system, got ${systems.length}`);
});

// Test 7: Fire disiplini 3 sistem ile gelir
test('Fire discipline has 3 systems', () => {
  const systems = getSystemsForDiscipline('fire');
  assert(Array.isArray(systems), 'Result should be an array');
  assert(systems.length === 3, `Expected 3 systems, got ${systems.length}`);
});

// Test 8: Geçersiz disiplin null döner
test('getSystemsForDiscipline() returns null for invalid discipline', () => {
  const systems = getSystemsForDiscipline('invalid-discipline');
  assert(systems === null, 'Expected null for invalid discipline');
});

// Test 9: selectSystem() başarılı seçim döner tam nesne ile
test('selectSystem() returns full object for valid combination', () => {
  const result = selectSystem('heating', 'radiator-boiler');
  assert(result !== null, 'Result should not be null');
  assert(result.disciplineId === 'heating', 'disciplineId mismatch');
  assert(result.disciplineName === 'Heating', 'disciplineName mismatch');
  assert(result.systemId === 'radiator-boiler', 'systemId mismatch');
  assert(result.systemName === 'Radiator with Boiler', 'systemName mismatch');
  assert(result.initialCost, 'initialCost missing');
  assert(result.operatingCost, 'operatingCost missing');
  assert(result.comfort, 'comfort missing');
  assert(result.flexibility, 'flexibility missing');
});

// Test 10: selectSystem() geçersiz disiplin null döner
test('selectSystem() returns null for invalid discipline', () => {
  const result = selectSystem('invalid', 'radiator-boiler');
  assert(result === null, 'Expected null for invalid discipline');
});

// Test 11: selectSystem() geçersiz sistem null döner
test('selectSystem() returns null for invalid system in valid discipline', () => {
  const result = selectSystem('heating', 'invalid-system');
  assert(result === null, 'Expected null for invalid system');
});

// Test 12: isValidCombination() geçerli kombinasyonları tespit eder
test('isValidCombination() validates correctly', () => {
  assert(isValidCombination('heating', 'radiator-boiler') === true, 
    'heating + radiator-boiler should be valid');
  assert(isValidCombination('cooling', 'vrf') === true,
    'cooling + vrf should be valid');
  assert(isValidCombination('heating', 'invalid-system') === false,
    'heating + invalid-system should be invalid');
  assert(isValidCombination('invalid-discipline', 'any-system') === false,
    'invalid discipline should be invalid');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(60));

process.exit(testsFailed === 0 ? 0 : 1);
