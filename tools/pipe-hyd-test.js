// pipe-hydraulics.js icin headless test (Modul-Test tarzi).
const P = require('../HVAC_Pro_v8/js/pipe-hydraulics.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Bilinen vaka: su, Q=3.6 m3/h (1 L/s), D=50mm, L=10m
//    El hesabi: A=pi*(0.05)^2/4=0.0019635 m2 ; v=(3.6/3600)/A=0.5093 m/s
const r = P.pressureDrop({ Q_m3h: 3.6, D_mm: 50, L_m: 10 });
const A = Math.PI * Math.pow(0.05, 2) / 4;
const v_el = (3.6 / 3600) / A;                 // el hesabi hiz
chk('v ~= el hesabi (%2)', near(r.v_ms, v_el, v_el * 0.02));
chk('v ~= 0.51 m/s', near(r.v_ms, 0.51, 0.01));
chk('Re turbulansli (>2300)', typeof r.Re === 'number' && r.Re > 2300);
chk('f makul (0.015..0.05)', r.f > 0.015 && r.f < 0.05);
chk('dP_pm > 0', r.dP_Pa_m > 0);
chk('dP_pm < 500 Pa/m', r.dP_Pa_m < 500);
chk('dP_total_kPa = dP_pm*L/1000', near(r.dP_total_kPa, r.dP_Pa_m * 10 / 1000, 1e-3));
chk('tum alanlar sonlu', ['v_ms','Re','f','dP_Pa_m','dP_total_kPa'].every(k => isFinite(r[k])));

// 2) Laminer rejim: cok dusuk debi -> Re<2300, f=64/Re
const lam = P.pressureDrop({ Q_m3h: 0.05, D_mm: 50, L_m: 5 });
chk('laminer Re < 2300', lam.Re > 0 && lam.Re < 2300);
chk('laminer f = 64/Re', near(lam.f, 64 / lam.Re, 1e-3));

// 3) Sifir debi -> hiz/kayip 0, sonlu.
const z = P.pressureDrop({ Q_m3h: 0, D_mm: 50, L_m: 10 });
chk('Q=0 -> v=0', z.v_ms === 0);
chk('Q=0 -> dP_total=0', z.dP_total_kPa === 0);

// 4) Guvenli girdi: gecersiz cap -> NaN alanlar (patlamaz).
const bad = P.pressureDrop({ Q_m3h: 3.6, D_mm: 0, L_m: 10 });
chk('D=0 -> v_ms NaN (guvenli)', Number.isNaN(bad.v_ms));
const bad2 = P.pressureDrop({ Q_m3h: -1, D_mm: 50, L_m: 10 });
chk('negatif debi -> v_ms NaN (guvenli)', Number.isNaN(bad2.v_ms));
chk('opt yok -> patlamaz', (() => { try { P.pressureDrop(); return true; } catch (e) { return false; } })());

// 5) Buyukluk mertebesi: daha buyuk cap -> ayni debide daha dusuk hiz.
const big = P.pressureDrop({ Q_m3h: 3.6, D_mm: 100, L_m: 10 });
chk('buyuk cap -> daha dusuk hiz', big.v_ms < r.v_ms);

R('\n' + (fail ? fail + ' KALDI' : 'pipe-hydraulics.js testleri GECTI'));
process.exit(fail ? 1 : 0);
