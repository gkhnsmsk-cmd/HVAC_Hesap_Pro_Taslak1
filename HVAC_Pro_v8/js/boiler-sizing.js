// Gsem Mep Pro — Kombi Boyutlandırması
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Isıtma sisteminin ihtiyacı olan kombi gücünün hesaplanması (emniyet faktörü ile).
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Kombi Boyutlandırması: calc
  // Girdi: { Q_isitma_yuku_kW, emniyet_faktoru }
  //   Q_isitma_yuku_kW  : Isıtma yükü (kW) — GIRDI ZORUNLU
  //   emniyet_faktoru   : Emniyet faktörü — OPSIYONEL, varsayı 1.2
  //                       (tasarım pratiği: 1.15-1.3 aralığı, sistem kalitesine göre)
  //
  // Formül:
  //   P_kombi_kW = Q_isitma_yuku_kW * emniyet_faktoru  [kW]
  //
  // Cikti: { P_kombi_kW }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var Q_isitma_yuku_kW = _num(opt.Q_isitma_yuku_kW);
    var emniyet_faktoru = _num(opt.emniyet_faktoru);

    // Opsiyonel parametre: emniyet_faktoru varsayılan 1.2
    // Eğer sağlanmışsa ama geçersizse, hata dön
    if (!isFinite(emniyet_faktoru)) {
      if (opt.emniyet_faktoru !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { P_kombi_kW: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      emniyet_faktoru = 1.2;
    }

    var out = { P_kombi_kW: NaN };

    // Validasyon: Q_isitma_yuku_kW sonlu ve pozitif
    if (!isFinite(Q_isitma_yuku_kW)) return out;
    if (Q_isitma_yuku_kW < 0) return out;
    if (emniyet_faktoru <= 0) return out;  // Faktör pozitif olmalı

    // Kombi gücü
    var P_kombi_kW = Q_isitma_yuku_kW * emniyet_faktoru;

    out.P_kombi_kW = Math.round(P_kombi_kW * 100) / 100;
    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.BoilerSizing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
