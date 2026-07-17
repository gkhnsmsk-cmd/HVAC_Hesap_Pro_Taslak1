// Gsem Mep Pro — Kondens/Drenaj Hatti Boyutlandirma (condensate-drain.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Kondens debisi (L/h) ve basit min DN onerisi.
// MALZEME / HAVA KUSULARI KUTUPHANESI YOKTUR — Q_soguk_kW, kg_kondens_kWh KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // Kondens akisi hesaplama (tipik uygulamalar icin basitlestirilmis).
  // Kondanse su miktari: nem entalpi cikisina baglidir.
  // Tipik konfor soğutma (T_disarı ~32°C, nem ~60%) icin 0.15-0.4 kg/kWh araligi,
  // hümid iklimde daha yüksek, kuru iklimde daha düşük. TEYIT edilmeli.
  // Fonksiyon: L_h = Q_soguk_kW * kg_kondens_kWh
  //   Q_soguk_kW: Soğutma kapasitesi (kW)
  //   kg_kondens_kWh: kondense su orani (kg/kWh) — GIRDI ZORUNLU, varsayilan VERME

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kondens debisi: L_h = Q_soguk_kW * kg_kondens_kWh
  // Q_soguk_kW: soğutma yükü (kW)
  // kg_kondens_kWh: kondense su orani (kg/kWh) — iklim/nem kosuluna gore, TEYIT
  // Gecersiz / negatif girdi -> guvenli NaN dondurur.
  function condensateFlow(opt) {
    if (!opt || typeof opt !== 'object') return NaN;
    var q = _num(opt.Q_soguk_kW);
    var k = _num(opt.kg_kondens_kWh);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(k) || k < 0) return NaN;
    var l_h = q * k;
    return Math.round(l_h * 100) / 100; // 2 ondalik (L/h)
  }

  // Basit kapasite tablosuyla min DN onerisi.
  // Drenaj borularının dinamik kapasite degerleri (egim, su ustunü, hiz, vb. faktore baglidir,
  // basitlestirilmis referans degerler; detay CAD asamasinda kontrol edilmeli).
  // Yaklaşık kapasite (L/h):
  //   DN15: < 10 L/h
  //   DN20: < 25 L/h
  //   DN25: < 50 L/h
  //   DN32: < 100 L/h
  //   else: DN40
  // (Basitlestirilmis egim/kapasite yaklasik degeri. Proje esas alinacak.)
  function drainPipeDN(L_h) {
    var l = _num(L_h);
    if (!isFinite(l) || l < 0) return NaN;
    if (l < 10) return 'DN15';
    if (l < 25) return 'DN20';
    if (l < 50) return 'DN25';
    if (l < 100) return 'DN32';
    return 'DN40';
  }

  var api = {
    condensateFlow: condensateFlow,
    drainPipeDN: drainPipeDN
  };
  if (typeof window !== 'undefined') window.CondensateDrain = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
