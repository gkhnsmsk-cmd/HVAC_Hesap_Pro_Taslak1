// HVAC Hesap Pro — Yangın Pompası Boyutlandırması
// SAF (DOM'suz) IIFE modül; headless test edilebilir.
// Yangın söndürme sisteminde gerekli debinin hesaplanması.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Yangın Pompası Boyutlandırması: calc
  // Girdi: { Q_sprinkler_m3h, Q_hidrant_m3h, Q_dolap_m3h, es_zamanlilik_faktoru, P_gerekli_bar }
  //   Q_sprinkler_m3h        : Sprinkler sistemi debi (m³/h) — OPSIYONEL, varsayı 0
  //   Q_hidrant_m3h          : Hidrant sistemi debi (m³/h) — OPSIYONEL, varsayı 0
  //   Q_dolap_m3h            : Dolap/yangın musluğu debi (m³/h) — OPSIYONEL, varsayı 0
  //   es_zamanlilik_faktoru  : Eşzamanlılık faktörü — OPSIYONEL, varsayı 1.0
  //                            NOT: NFPA13/EN12845 proje bazlı TEYİT — hardcode standart-veri değil
  //   P_gerekli_bar          : Gerekli pompa basıncı (bar) — OPSIYONEL, pass-through
  //
  // Formül:
  //   Q_toplam_m3h = (Q_sprinkler_m3h + Q_hidrant_m3h + Q_dolap_m3h) * es_zamanlilik_faktoru  [m³/h]
  //   P_gerekli_bar: eğer sağlanmışsa, aynen döner (pass-through, hesap yok)
  //
  // Cikti: { Q_toplam_m3h, P_gerekli_bar (eğer varsa) }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif -> NaN (patlamaz).
  // En az bir Q_* girdi olmalı (hepsi 0 ise geçersiz).
  function calc(opt) {
    opt = opt || {};
    var Q_sprinkler_m3h = _num(opt.Q_sprinkler_m3h);
    var Q_hidrant_m3h = _num(opt.Q_hidrant_m3h);
    var Q_dolap_m3h = _num(opt.Q_dolap_m3h);
    var es_zamanlilik_faktoru = _num(opt.es_zamanlilik_faktoru);
    var P_gerekli_bar = _num(opt.P_gerekli_bar);

    // Opsiyonel parametreler: varsayılan değerler
    // Q parametreleri varsayılan 0
    if (!isFinite(Q_sprinkler_m3h)) Q_sprinkler_m3h = 0;
    if (!isFinite(Q_hidrant_m3h)) Q_hidrant_m3h = 0;
    if (!isFinite(Q_dolap_m3h)) Q_dolap_m3h = 0;

    // es_zamanlilik_faktoru varsayılan 1.0
    if (!isFinite(es_zamanlilik_faktoru)) {
      if (opt.es_zamanlilik_faktoru !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { Q_toplam_m3h: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      es_zamanlilik_faktoru = 1.0;
    }

    var out = { Q_toplam_m3h: NaN };

    // Validasyon: Q değerleri negatif olmamalı
    if (Q_sprinkler_m3h < 0 || Q_hidrant_m3h < 0 || Q_dolap_m3h < 0) {
      return out;
    }

    // Validasyon: es_zamanlilik_faktoru pozitif olmalı
    if (es_zamanlilik_faktoru <= 0) {
      return out;
    }

    // Validasyon: en az bir Q_* girdi olmalı (toplam > 0)
    var Q_toplam_kaynak = Q_sprinkler_m3h + Q_hidrant_m3h + Q_dolap_m3h;
    if (Q_toplam_kaynak <= 0) {
      return out;
    }

    // Toplam debi hesabı
    var Q_toplam_m3h = Q_toplam_kaynak * es_zamanlilik_faktoru;
    out.Q_toplam_m3h = Math.round(Q_toplam_m3h * 100) / 100;

    // P_gerekli_bar: eğer sağlanmışsa, pass-through
    if (isFinite(P_gerekli_bar)) {
      out.P_gerekli_bar = Math.round(P_gerekli_bar * 100) / 100;
    }

    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.FirePumpSizing = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
