// sanitary-drainage.js icin headless test (Modul-Test tarzi).
const S = require('../HVAC_Pro_v8/js/sanitary-drainage.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) EN 12056-2: Qww = K*sqrt(sumDU)
chk('wasteFlow(4, 0.5) ~= 1.0', near(S.wasteFlow(4, 0.5), 1.0, 0.01));
chk('wasteFlow(9, 0.7) ~= 2.1', near(S.wasteFlow(9, 0.7), 2.1, 0.05));

// 2) Varsayilan K (0.5) uygulanmali
chk('DEFAULT_K = 0.5', S.DEFAULT_K === 0.5);
chk('wasteFlow(4) varsayilan K ~= 1.0', near(S.wasteFlow(4), 1.0, 0.01));

// 3) Guvenli girdi: NaN / negatif -> 0 (NaN uretmez)
chk('wasteFlow(NaN) -> 0', S.wasteFlow(NaN) === 0);
chk('wasteFlow(-5) -> 0', S.wasteFlow(-5) === 0);
chk('wasteFlow(4, NaN) -> varsayilan K, ~=1.0', near(S.wasteFlow(4, NaN), 1.0, 0.01));

// 4) pipeMin esik kontrolu
chk('pipeMin(0.3) -> DN50', S.pipeMin(0.3) === 'DN50');
chk('pipeMin(1.0) -> DN70', S.pipeMin(1.0) === 'DN70');
chk('pipeMin(2.1) -> DN100', S.pipeMin(2.1) === 'DN100');
chk('pipeMin(3.0) -> DN125', S.pipeMin(3.0) === 'DN125');
chk('pipeMin(NaN) -> guvenli DN50', S.pipeMin(NaN) === 'DN50');

R('\n' + (fail ? fail + ' KALDI' : 'sanitary-drainage.js testleri GECTI'));
process.exit(fail ? 1 : 0);
