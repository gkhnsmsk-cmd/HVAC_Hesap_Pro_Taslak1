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

// ── pipeCapacityManning / selectPipeDN (YENİ — gerçek hidrolik kapasite) ──
// DN110, egim 2%, dolum 0.5 (havalandırmasız), PVC n=0.009 -> ~6.80 L/s
chk('pipeCapacityManning DN110 y=0.5 PVC ~= 6.80 L/s', near(S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009 }), 6.80, 0.02));
// DN160, aynı koşullar -> daha büyük kapasite
chk('pipeCapacityManning DN160 y=0.5 ~= 18.48 L/s', near(S.pipeCapacityManning({ DN_mm: 160, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009 }), 18.48, 0.05));
// Dolum oranı 0.7 (havalandırmalı) -> DAHA YÜKSEK kapasite (aynı DN)
const capY5 = S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009 });
const capY7 = S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 2, dolum_orani: 0.7, manning_n: 0.009 });
chk('pipeCapacityManning: dolum orani 0.7 > 0.5 icin daha yuksek kapasite', capY7 > capY5);
chk('pipeCapacityManning DN110 y=0.7 ~= 11.39 L/s', near(capY7, 11.39, 0.05));

// Geçersiz girdi -> NaN
chk('pipeCapacityManning DN<=0 -> NaN', Number.isNaN(S.pipeCapacityManning({ DN_mm: 0, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009 })));
chk('pipeCapacityManning dolum_orani>1 -> NaN', Number.isNaN(S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 2, dolum_orani: 1.5, manning_n: 0.009 })));
chk('pipeCapacityManning egim<=0 -> NaN', Number.isNaN(S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 0, dolum_orani: 0.5, manning_n: 0.009 })));
chk('pipeCapacityManning manning_n<=0 -> NaN', Number.isNaN(S.pipeCapacityManning({ DN_mm: 110, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0 })));
chk('pipeCapacityManning({}) -> NaN', Number.isNaN(S.pipeCapacityManning({})));

// selectPipeDN: 5 L/s debiyi karşılayan en küçük DN'i seçmeli (DN110 karşılıyor, 6.80>=5)
const sel1 = S.selectPipeDN({ Qww_l_s: 5, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009, candidate_DN_mm: [50, 75, 110, 160, 200] });
chk('selectPipeDN 5 L/s icin DN110 secmeli', sel1.DN_mm === 110);
chk('selectPipeDN kapasite raporluyor (>=5)', sel1.kapasite_l_s >= 5);

// selectPipeDN: hiçbir aday yetmezse NaN
const sel2 = S.selectPipeDN({ Qww_l_s: 1000, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009, candidate_DN_mm: [50, 75, 110] });
chk('selectPipeDN asiri debi icin NaN doner (hicbir aday yetmiyor)', Number.isNaN(sel2.DN_mm));

// selectPipeDN: boş/geçersiz aday listesi -> NaN
const sel3 = S.selectPipeDN({ Qww_l_s: 5, egim_yuzde: 2, dolum_orani: 0.5, manning_n: 0.009, candidate_DN_mm: [] });
chk('selectPipeDN bos aday listesi -> NaN', Number.isNaN(sel3.DN_mm));

R('\n' + (fail ? fail + ' KALDI' : 'sanitary-drainage.js testleri GECTI'));
process.exit(fail ? 1 : 0);
