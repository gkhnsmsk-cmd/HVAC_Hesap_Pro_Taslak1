// fuel-tank.js icin headless test (Modul-Test tarzi).
const FT = require('../HVAC_Pro_v8/js/fuel-tank.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel depo hacmi hesabi:
//    debi=50 kg/h, calisma=24 saat, yogunluk=0.85 kg/L
//    V_L = 50 * 24 / 0.85 = 1200 / 0.85 ≈ 1411.765 L
chk('tankVolume debi=50 kg/h, calisma=24 h, yogunluk=0.85 kg/L ~= 1411.8',
  near(FT.tankVolume({
    debi_kg_h: 50,
    calisma_saat: 24,
    yogunluk_kg_L: 0.85
  }), 1411.8, 1));

// 2) Sıfıra bölme (yogunluk=0) -> NaN güvenli
chk('tankVolume yogunluk=0 -> NaN',
  !isFinite(FT.tankVolume({
    debi_kg_h: 50,
    calisma_saat: 24,
    yogunluk_kg_L: 0
  })));

// 3) Geçersiz girdiler -> NaN güvenli
chk('tankVolume NaN debi -> NaN',
  !isFinite(FT.tankVolume({
    debi_kg_h: NaN,
    calisma_saat: 24,
    yogunluk_kg_L: 0.85
  })));

chk('tankVolume NaN calisma -> NaN',
  !isFinite(FT.tankVolume({
    debi_kg_h: 50,
    calisma_saat: NaN,
    yogunluk_kg_L: 0.85
  })));

chk('tankVolume NaN yogunluk -> NaN',
  !isFinite(FT.tankVolume({
    debi_kg_h: 50,
    calisma_saat: 24,
    yogunluk_kg_L: NaN
  })));

// 4) Sifir girdi (mantıksız ama güvenli)
chk('tankVolume debi=0 -> 0',
  FT.tankVolume({
    debi_kg_h: 0,
    calisma_saat: 24,
    yogunluk_kg_L: 0.85
  }) === 0);

// 5) Motorin yoğunluğu ile test (0.85 kg/L)
chk('tankVolume motorin yogunluk=0.85',
  isFinite(FT.tankVolume({
    debi_kg_h: 100,
    calisma_saat: 12,
    yogunluk_kg_L: 0.85
  })));

R('\n' + (fail ? fail + ' KALDI' : 'fuel-tank.js testleri GECTI'));
process.exit(fail ? 1 : 0);
