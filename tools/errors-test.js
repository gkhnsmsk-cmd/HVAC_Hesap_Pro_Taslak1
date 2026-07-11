const F = require('../HVAC_Pro_v8/js/errors.js')._pure.formatError;
const R = (m) => process.stdout.write(m + '\n');
let fail = 0; const chk = (a, k) => { R((k ? '  OK   ' : '  KALDI ') + a); if (!k) fail++; };
chk('mesaj + kaynak', F({ message: 'X patladi', filename: 'js/calc-engine.js', lineno: 42 }) === 'X patladi [calc-engine.js:42]');
chk('sade mesaj', F({ message: 'Basit hata' }) === 'Basit hata');
chk('promise reason', F({ reason: { message: 'Reddedildi' } }) === 'Reddedildi');
chk('bos -> bilinmeyen', F(null) === 'Bilinmeyen hata');
R('\n' + (fail ? fail + ' KALDI' : 'errors.js formatError testleri GECTI'));
process.exit(fail ? 1 : 0);
