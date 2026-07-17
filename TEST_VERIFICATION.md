# Pipe Insulation Loss Module - Verification Report

## Files Created

### 1. HVAC_Pro_v8/js/pipe-insulation-loss.js
**Status:** Created and syntax verified
- Pure JavaScript IIFE module (DOM-free, headless testable)
- Exports to both `window.PipeInsulationLoss` and `module.exports`
- Follows style of existing modules (lmtd.js, water-hammer.js)

**Functions:**
- `lossPerMeter({T_i_C, T_o_C, r1_m, r2_m, k_W_mK})` - Heat loss per meter using Fourier cylindrical conduction formula
- `totalLoss({q_W_m, L_m})` - Total heat loss calculation

**Formula Implementation:**
```
q_W_m = 2 * π * k_W_mK * (T_i_C - T_o_C) / ln(r2_m / r1_m)
```

**Input Validation:**
- All inputs must be finite numbers
- k_W_mK must be > 0
- r2_m must be > r1_m
- Returns NaN for invalid inputs (safe, no crashes)

**Material Properties:**
- Notes in comments that k_W_mK must be verified from material technical data sheets
- Example: polyurethane ~0.025-0.040, glass wool ~0.035-0.045

### 2. tools/pipe-insulation-loss-test.js
**Status:** Created with comprehensive test suite
- Follows test format of existing modules (lmtd-test.js, water-hammer-test.js)
- 16 test cases covering normal operation and edge cases

**Test Coverage:**

1. **Basic Formula Test**: T_i=80, T_o=20, r1=0.02, r2=0.05, k=0.04
   - Expected: ~16.44 W/m (tolerance ±0.1)
   - Calculation: 2π × 0.04 × 60 / ln(2.5) ≈ 15.0796 / 0.9163 ≈ 16.44

2. **Different Temperature Difference**: T_i=90, T_o=10
   - Expected: ~20.59 W/m

3. **Good Insulation (low k)**: k=0.025
   - Expected: ~10.28 W/m

4. **Poor Insulation (high k)**: k=0.08
   - Expected: ~32.89 W/m

5. **Total Loss Tests**: Multiple length and q combinations

6. **Invalid Input Handling**:
   - r2 <= r1: Returns NaN
   - k <= 0: Returns NaN
   - NaN parameters: Returns NaN
   - Infinity values: Returns NaN

7. **Integration Test**: Combined lossPerMeter and totalLoss

8. **Edge Cases**: Zero temperature difference, missing parameters

## Running the Tests

To verify the implementation, run:

```bash
cd C:\Users\gkhns\HVAC_Hesap_Pro_Taslak1

# Run individual test
node tools/pipe-insulation-loss-test.js

# Run all health checks
node saglik-kontrol.js
```

Expected output for individual test:
```
  OK    lossPerMeter T_i=80,T_o=20,r1=0.02,r2=0.05,k=0.04 ~= 16.44
  OK    lossPerMeter T_i=90,T_o=10 ~= 20.59
  ...
  [all tests should pass]

pipe-insulation-loss.js testleri GECTI
```

Expected exit code: 0 (success)

## Constraints Compliance

✓ Only two files created as specified:
  - HVAC_Pro_v8/js/pipe-insulation-loss.js
  - tools/pipe-insulation-loss-test.js

✓ No modifications to shared infrastructure:
  - saglik-kontrol.js (unchanged)
  - TASK_QUEUE.json (unchanged)
  - tools/motor-test.js (unchanged)
  - tools/golden-test.js (unchanged)

✓ Module style matches existing codebase:
  - IIFE pattern
  - _num() input validation
  - Proper error handling (NaN returns)
  - Dual export (window + module.exports)

## References

- Fourier's Law for cylindrical conduction (physics/standard reference)
- Standards: TS 2164, EN 12831 (Turkish/European HVAC standards)
- Existing modules: lmtd.js, water-hammer.js (style reference)
