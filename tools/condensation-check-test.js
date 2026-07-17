// condensation-check.js icin headless test (Modul-Test tarzi).
const CC = require('../HVAC_Pro_v8/js/condensation-check.js');
const R = (m) => process.stdout.write(m + '\n');
let fail = 0;
const chk = (a, k) => { R((k ? '  OK    ' : '  KALDI ') + a); if (!k) fail++; };
const near = (x, t, tol) => (typeof x === 'number' && isFinite(x) && Math.abs(x - t) <= tol);

// 1) Basit 2 katmanlı örnek: duvar + yalıtım
//    katman1: d=0.2m, sd=5m (duvar)
//    katman2: d=0.05m, sd=50m (yalıtım)
//    Ti_C=20, Tdis_C=-5, RHi=50, RHdis=80
var profil = CC.vaporPressureProfile({
  katmanlar: [
    { d_m: 0.2, sd_m: 5 },
    { d_m: 0.05, sd_m: 50 }
  ],
  Ti_C: 20,
  Tdis_C: -5,
  RHi: 50,
  RHdis: 80
});

// Profil 3 nokta olmalı (katman sayısı + 1)
chk('Profil dizisi uzunluğu === 3 (katman sayısı + 1)',
  Array.isArray(profil) && profil.length === 3);

// Her elemanda gerekli alanlar
chk('Profil[0] risk field boolean',
  typeof profil[0].risk === 'boolean');
chk('Profil[1] risk field boolean',
  profil.length > 1 && typeof profil[1].risk === 'boolean');
chk('Profil[2] risk field boolean',
  profil.length > 2 && typeof profil[2].risk === 'boolean');

// Sıcaklık iç'ten dış'a azalmalı (20 -> -5)
chk('Profil[0].T_C = 20 (iç ortam)',
  near(profil[0].T_C, 20, 0.1));
chk('Profil[2].T_C = -5 (dış ortam)',
  profil.length > 2 && near(profil[2].T_C, -5, 0.1));
chk('Sıcaklık azalan sırası (T[0] >= T[1] >= T[2])',
  profil[0].T_C >= profil[1].T_C && profil[1].T_C >= profil[2].T_C);

// konum_sd artan sırası
chk('konum_sd artan sırası',
  profil[0].konum_sd <= profil[1].konum_sd && profil[1].konum_sd <= profil[2].konum_sd);

// Tüm alanlar sonlu sayılar
chk('Profil[0] tüm alanlar isFinite',
  isFinite(profil[0].T_C) && isFinite(profil[0].P_buhar_Pa) && isFinite(profil[0].P_sat_Pa));
chk('Profil[1] tüm alanlar isFinite',
  isFinite(profil[1].T_C) && isFinite(profil[1].P_buhar_Pa) && isFinite(profil[1].P_sat_Pa));
chk('Profil[2] tüm alanlar isFinite',
  isFinite(profil[2].T_C) && isFinite(profil[2].P_buhar_Pa) && isFinite(profil[2].P_sat_Pa));

// 2) Geçersiz girdiler -> boş dizi dön (patlama yok)
chk('vaporPressureProfile katmanlar=[] -> []',
  Array.isArray(CC.vaporPressureProfile({ katmanlar: [] })) &&
  CC.vaporPressureProfile({ katmanlar: [] }).length === 0);

chk('vaporPressureProfile Ti_C=NaN -> []',
  Array.isArray(CC.vaporPressureProfile({
    katmanlar: [{ d_m: 0.2, sd_m: 5 }],
    Ti_C: NaN,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  })) &&
  CC.vaporPressureProfile({
    katmanlar: [{ d_m: 0.2, sd_m: 5 }],
    Ti_C: NaN,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  }).length === 0);

chk('vaporPressureProfile sd_m=NaN -> []',
  Array.isArray(CC.vaporPressureProfile({
    katmanlar: [{ d_m: 0.2, sd_m: NaN }],
    Ti_C: 20,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  })) &&
  CC.vaporPressureProfile({
    katmanlar: [{ d_m: 0.2, sd_m: NaN }],
    Ti_C: 20,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  }).length === 0);

chk('vaporPressureProfile null katmanlar -> []',
  Array.isArray(CC.vaporPressureProfile({
    katmanlar: null,
    Ti_C: 20,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  })) &&
  CC.vaporPressureProfile({
    katmanlar: null,
    Ti_C: 20,
    Tdis_C: -5,
    RHi: 50,
    RHdis: 80
  }).length === 0);

R('\n' + (fail ? fail + ' KALDI' : 'condensation-check.js testleri GECTI'));
process.exit(fail ? 1 : 0);
