// condensate-drain.js icin headless test (Modul-Test tarzi).
const C_mod = require('../HVAC_Pro_v8/js/condensate-drain.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Kondens debisi: L_h = Q_soguk_kW * kg_kondens_kWh
// condensateFlow({Q_soguk_kW: 50, kg_kondens_kWh: 0.3}) = 50 * 0.3 = 15
const cf1 = C_mod.condensateFlow({ Q_soguk_kW: 50, kg_kondens_kWh: 0.3 });
chk('condensateFlow({Q_soguk_kW:50, kg_kondens_kWh:0.3}) ~= 15', near(cf1, 15, 0.1));

// 2) Kapasite sinir testleri (DN tahmini)
chk('drainPipeDN(5) -> DN15', C_mod.drainPipeDN(5) === 'DN15');
chk('drainPipeDN(10) -> DN20', C_mod.drainPipeDN(10) === 'DN20');
chk('drainPipeDN(15) -> DN20', C_mod.drainPipeDN(15) === 'DN20');
chk('drainPipeDN(25) -> DN25', C_mod.drainPipeDN(25) === 'DN25');
chk('drainPipeDN(30) -> DN25', C_mod.drainPipeDN(30) === 'DN25');
chk('drainPipeDN(50) -> DN32', C_mod.drainPipeDN(50) === 'DN32');
chk('drainPipeDN(100) -> DN40', C_mod.drainPipeDN(100) === 'DN40');
chk('drainPipeDN(150) -> DN40', C_mod.drainPipeDN(150) === 'DN40');

// 3) Cesitli basarili hesaplamalar
const cf2 = C_mod.condensateFlow({ Q_soguk_kW: 100, kg_kondens_kWh: 0.2 });
chk('condensateFlow({Q_soguk_kW:100, kg_kondens_kWh:0.2}) ~= 20', near(cf2, 20, 0.01));

const cf3 = C_mod.condensateFlow({ Q_soguk_kW: 10, kg_kondens_kWh: 0.15 });
chk('condensateFlow({Q_soguk_kW:10, kg_kondens_kWh:0.15}) ~= 1.5', near(cf3, 1.5, 0.01));

// 4) Guvenli girdi: NaN / gecersiz -> NaN dondurur (patlamaz)
chk('condensateFlow(null) -> NaN', Number.isNaN(C_mod.condensateFlow(null)));
chk('condensateFlow(undefined) -> NaN', Number.isNaN(C_mod.condensateFlow(undefined)));
chk('condensateFlow({}) -> NaN', Number.isNaN(C_mod.condensateFlow({})));
chk('condensateFlow({Q_soguk_kW:NaN, kg_kondens_kWh:0.3}) -> NaN', Number.isNaN(C_mod.condensateFlow({ Q_soguk_kW: NaN, kg_kondens_kWh: 0.3 })));
chk('condensateFlow({Q_soguk_kW:-10, kg_kondens_kWh:0.3}) -> NaN', Number.isNaN(C_mod.condensateFlow({ Q_soguk_kW: -10, kg_kondens_kWh: 0.3 })));
chk('condensateFlow({Q_soguk_kW:50, kg_kondens_kWh:-0.1}) -> NaN', Number.isNaN(C_mod.condensateFlow({ Q_soguk_kW: 50, kg_kondens_kWh: -0.1 })));

chk('drainPipeDN(NaN) -> NaN', Number.isNaN(C_mod.drainPipeDN(NaN)));
chk('drainPipeDN(-5) -> NaN', Number.isNaN(C_mod.drainPipeDN(-5)));
chk('drainPipeDN("abc") -> NaN', Number.isNaN(C_mod.drainPipeDN('abc')));

// 5) Sonlu sayi kontrol
chk('condensateFlow sonuc sonlu', isFinite(cf1) && cf1 === 15);
chk('drainPipeDN(15) string dondur', typeof C_mod.drainPipeDN(15) === 'string');

R('\n' + (fail ? fail + ' KALDI' : 'condensate-drain.js testleri GECTI'));
process.exit(fail ? 1 : 0);
