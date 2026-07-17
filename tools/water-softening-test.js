// water-softening.js icin headless test (Modul-Test tarzi).
const WS = require('../HVAC_Pro_v8/js/water-softening.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Temel test: debi=2 m3/h, sertlik=20°F, sure=8h, kapasite=50 gr/L
//    yuk_gr = 2 * 8 * 20 * 10 = 3200
//    V_L = 3200 / 50 = 64
chk('resinVolume debi=2,sertlik=20,sure=8,kap=50 yuk_gr === 3200',
  WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: 20,
    sure_h: 8,
    recine_kapasite_gr_L: 50
  }).yuk_gr === 3200);

chk('resinVolume debi=2,sertlik=20,sure=8,kap=50 V_L ≈ 64',
  near(WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: 20,
    sure_h: 8,
    recine_kapasite_gr_L: 50
  }).V_L, 64, 0.1));

// 2) Sıfıra bölme (recine_kapasite_gr_L = 0) -> V_L NaN güvenli
chk('resinVolume kap=0 V_L -> NaN',
  !isFinite(WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: 20,
    sure_h: 8,
    recine_kapasite_gr_L: 0
  }).V_L));

// 3) NaN girdisi -> sonuç NaN güvenli
chk('resinVolume debi=NaN -> V_L NaN',
  !isFinite(WS.resinVolume({
    debi_m3h: NaN,
    sertlik_delta_F: 20,
    sure_h: 8,
    recine_kapasite_gr_L: 50
  }).V_L));

chk('resinVolume sertlik=NaN -> V_L NaN',
  !isFinite(WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: NaN,
    sure_h: 8,
    recine_kapasite_gr_L: 50
  }).V_L));

chk('resinVolume sure=NaN -> V_L NaN',
  !isFinite(WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: 20,
    sure_h: NaN,
    recine_kapasite_gr_L: 50
  }).V_L));

chk('resinVolume kap=NaN -> V_L NaN',
  !isFinite(WS.resinVolume({
    debi_m3h: 2,
    sertlik_delta_F: 20,
    sure_h: 8,
    recine_kapasite_gr_L: NaN
  }).V_L));

// 4) Constant
chk('HARDNESS_CONVERSION_FACTOR = 10', WS.HARDNESS_CONVERSION_FACTOR === 10);

// 5) Dönüş tipi kontrol
chk('resinVolume sonuç { yuk_gr, V_L } object',
  (result => result && typeof result.yuk_gr === 'number' && typeof result.V_L === 'number')(
    WS.resinVolume({
      debi_m3h: 2,
      sertlik_delta_F: 20,
      sure_h: 8,
      recine_kapasite_gr_L: 50
    })
  ));

R('\n' + (fail ? fail + ' KALDI' : 'water-softening.js testleri GECTI'));
process.exit(fail ? 1 : 0);
