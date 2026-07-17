// HVAC Hesap Pro — Sprinkler K-Faktörü Testi
// Amac: sprinkler-k-factor.js'in temel fonksiyonlarini test etmek
// Kullanim: node tools/sprinkler-k-factor-test.js

const path = require('path');
const jsDir = path.join(__dirname, '..', 'HVAC_Pro_v8', 'js');
const SprinklerKFactor = require(path.join(jsDir, 'sprinkler-k-factor.js'));

const R = (m) => process.stdout.write(m + '\n');
const num = (v) => (typeof v === 'number' && isFinite(v));
const fmt = (v, dp) => (num(v) ? v.toFixed(dp || 2) : ('!!' + String(v) + '!!'));
const aeq = (actual, expected, tol, name) => {
  if (!num(actual) || !num(expected)) {
    R('  FAIL: ' + name + ' -> NaN/Infinity');
    return false;
  }
  const diff = Math.abs(actual - expected);
  const ok = diff <= tol;
  const status = ok ? 'OK' : 'FAIL';
  R('  [' + status + '] ' + name + ': ' + fmt(actual) + ' (beklenen ~' + fmt(expected) + ', tol±' + tol + ')');
  return ok;
};

let pass = 0;
let fail = 0;

R('HVAC Hesap Pro — Sprinkler K-Faktörü Testi');
R('='.repeat(60));

// Test 1: debiFromBasinc({K:80, basincBar:1}) -> 80
R('\nTest 1: debiFromBasinc(K=80, P=1 bar)');
if (aeq(SprinklerKFactor.debiFromBasinc({ K: 80, basincBar: 1 }), 80, 0.01, 'Q = K√P = 80×√1 = 80')) pass++; else fail++;

// Test 2: debiFromBasinc({K:80, basincBar:2}) -> ~113.14
R('\nTest 2: debiFromBasinc(K=80, P=2 bar)');
if (aeq(SprinklerKFactor.debiFromBasinc({ K: 80, basincBar: 2 }), 113.14, 0.01, 'Q = 80×√2 ≈ 113.14')) pass++; else fail++;

// Test 3: basincFromDebi({K:80, debiLpm:80}) -> 1
R('\nTest 3: basincFromDebi(K=80, Q=80 L/min)');
if (aeq(SprinklerKFactor.basincFromDebi({ K: 80, debiLpm: 80 }), 1, 0.01, 'P = (Q/K)² = (80/80)² = 1')) pass++; else fail++;

// Test 4: basincFromDebi({K:80, debiLpm:113.14}) -> ~2
R('\nTest 4: basincFromDebi(K=80, Q≈113.14 L/min)');
if (aeq(SprinklerKFactor.basincFromDebi({ K: 80, debiLpm: 113.14 }), 2, 0.05, 'P = (113.14/80)² ≈ 2')) pass++; else fail++;

// Test 5: toplamDebi({sprinklerSayisi:12, debiLpmHer:80}) -> 960
R('\nTest 5: toplamDebi(N=12, Q_her=80)');
if (aeq(SprinklerKFactor.toplamDebi({ sprinklerSayisi: 12, debiLpmHer: 80 }), 960, 0.01, 'Q_toplam = 12×80 = 960')) pass++; else fail++;

// Test 6: toplamDebi({sprinklerSayisi:20, debiLpmHer:113.14}) -> ~2262.8
R('\nTest 6: toplamDebi(N=20, Q_her≈113.14)');
if (aeq(SprinklerKFactor.toplamDebi({ sprinklerSayisi: 20, debiLpmHer: 113.14 }), 2262.8, 0.1, 'Q_toplam = 20×113.14 = 2262.8')) pass++; else fail++;

// Test 7: Invalid K (K <= 0) -> NaN
R('\nTest 7: Geçersiz K (K=0)');
const badK = SprinklerKFactor.debiFromBasinc({ K: 0, basincBar: 1 });
if (!num(badK)) { R('  OK: K <= 0 -> NaN'); pass++; } else { R('  FAIL: K <= 0 should return NaN, got ' + badK); fail++; }

// Test 8: Invalid basincBar (negative) -> NaN
R('\nTest 8: Geçersiz basınç (P < 0)');
const badP = SprinklerKFactor.debiFromBasinc({ K: 80, basincBar: -1 });
if (!num(badP)) { R('  OK: P < 0 -> NaN'); pass++; } else { R('  FAIL: P < 0 should return NaN, got ' + badP); fail++; }

// Test 9: Invalid debiLpm (negative) -> NaN
R('\nTest 9: Geçersiz debi (Q < 0)');
const badQ = SprinklerKFactor.basincFromDebi({ K: 80, debiLpm: -10 });
if (!num(badQ)) { R('  OK: Q < 0 -> NaN'); pass++; } else { R('  FAIL: Q < 0 should return NaN, got ' + badQ); fail++; }

// Test 10: sprinklerSayisi = 0 -> 0
R('\nTest 10: sprinklerSayisi=0');
if (aeq(SprinklerKFactor.toplamDebi({ sprinklerSayisi: 0, debiLpmHer: 80 }), 0, 0.01, 'N=0 -> Q_toplam=0')) pass++; else fail++;

// Test 11: Null option -> NaN
R('\nTest 11: Null seçenek');
const nullRes = SprinklerKFactor.debiFromBasinc(null);
if (!num(nullRes)) { R('  OK: null -> NaN'); pass++; } else { R('  FAIL: null should return NaN, got ' + nullRes); fail++; }

// Test 12: Different K value (K=115) -> Q = 115√1 = 115
R('\nTest 12: Farklı K faktörü (K=115, P=1 bar)');
if (aeq(SprinklerKFactor.debiFromBasinc({ K: 115, basincBar: 1 }), 115, 0.01, 'Q = 115×√1 = 115')) pass++; else fail++;

R('\n' + '='.repeat(60));
R('SONUC: ' + pass + ' GECTI, ' + fail + ' BASARISIZ');
if (fail === 0) {
  R('✓ Tüm testler başarılı — debi, basınç ve toplam hesaplamalar doğru.');
  process.exit(0);
} else {
  R('✗ ' + fail + ' test başarısız — lütfen kodları kontrol edin.');
  process.exit(1);
}
