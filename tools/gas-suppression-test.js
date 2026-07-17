// gas-suppression.js icin headless test (Modul-Test tarzi).
const G = require('../HVAC_Pro_v8/js/gas-suppression.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Ajan kütlesi: V=200 m3, konsantrasyon=8%, özgül hacim=0.65 m3/kg
// W = (200/0.65) * (8/(100-8)) = (200/0.65) * (8/92) ≈ 307.69 * 0.087 ≈ 26.75 kg
const w1 = G.agentMass({ V_m3: 200, tasarim_konsantrasyon_yuzde: 8, ozgul_hacim_m3_kg: 0.65 });
chk('agentMass({V_m3:200, tasarim_konsantrasyon_yuzde:8, ozgul_hacim_m3_kg:0.65}) ~= 26.75', near(w1, 26.75, 0.5));

// 2) Silindir sayısı tahmini: W=26.75 kg, kapasite=10 kg -> Math.ceil(26.75/10) = 3
const c1 = G.cylinderCountEstimate({ W_kg: 26.75, tup_kapasite_kg: 10 });
chk('cylinderCountEstimate({W_kg:26.75, tup_kapasite_kg:10}) == 3', c1 === 3);

// 3) Başka bir ajan kütlesi örneği: V=500 m3, konsantrasyon=6%, özgül hacim=0.8 m3/kg
const w2 = G.agentMass({ V_m3: 500, tasarim_konsantrasyon_yuzde: 6, ozgul_hacim_m3_kg: 0.8 });
chk('agentMass({V_m3:500, ...}) ~= 39.87', near(w2, 39.87, 0.5));

// 4) Silindir sayısı tahmini, farklı kapasite: W=39.87 kg, kapasite=15 kg -> 3
const c2 = G.cylinderCountEstimate({ W_kg: 39.87, tup_kapasite_kg: 15 });
chk('cylinderCountEstimate({W_kg:39.87, tup_kapasite_kg:15}) == 3', c2 === 3);

// 5) Geçersiz girdi: konsantrasyon >= 100 -> NaN
chk('agentMass(..., konsantrasyon=100) -> NaN', Number.isNaN(G.agentMass({ V_m3: 200, tasarim_konsantrasyon_yuzde: 100, ozgul_hacim_m3_kg: 0.65 })));
chk('agentMass(..., konsantrasyon=-5) -> NaN', Number.isNaN(G.agentMass({ V_m3: 200, tasarim_konsantrasyon_yuzde: -5, ozgul_hacim_m3_kg: 0.65 })));

// 6) Geçersiz girdi: null/undefined -> NaN
chk('agentMass(null) -> NaN', Number.isNaN(G.agentMass(null)));
chk('agentMass({}) -> NaN', Number.isNaN(G.agentMass({})));

// 7) Geçersiz girdi: silindir tahmini
chk('cylinderCountEstimate(null) -> NaN', Number.isNaN(G.cylinderCountEstimate(null)));
chk('cylinderCountEstimate({W_kg:-10, ...}) -> NaN', Number.isNaN(G.cylinderCountEstimate({ W_kg: -10, tup_kapasite_kg: 10 })));

// 8) Sonlu sayı kontrolü
chk('agentMass(valid) sonlu', isFinite(w1));
chk('cylinderCountEstimate(valid) sonlu', isFinite(c1));

R('\n' + (fail ? fail + ' KALDI' : 'gas-suppression.js testleri GECTI'));
process.exit(fail ? 1 : 0);
