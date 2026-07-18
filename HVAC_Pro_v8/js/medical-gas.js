// HVAC Hesap Pro — Tıbbi Gaz Sistemleri (medical-gas.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Tıbbi gaz (O2, vakum, basınçlı hava, N2O) debi hesaplamaları.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // totalFlow: Tıbbi gaz sistemi toplam debisi (L/min)
  // noktalar = [{adet, debi_l_min_nokta}, ...]
  // Her nokta tipi ve gaz türüne göre debi_l_min_nokta değişir (GİRDİ ZORUNLU)
  //   - Gaz tipi (O2/vakum/basınçlı hava/N2O) göre TEYİT edilmeli
  //   - Nokta tipi (anestezi, acil, ameliyat vb.) göre TEYİT edilmeli
  //   - ISO 7396-1 / yönetmelik nokta debisi tablosu TEYIT
  // Sonuç: Σ(adet * debi_l_min_nokta) [L/min]
  // Güvenli: geçersiz/NaN girdi -> NaN
  function totalFlow(opts) {
    opts = opts || {};
    var noktalar = opts.noktalar || [];

    if (!Array.isArray(noktalar)) return NaN;

    var total = 0;
    for (var i = 0; i < noktalar.length; i++) {
      var nokta = noktalar[i];
      var adet = _num(nokta.adet);
      var debi = _num(nokta.debi_l_min_nokta);

      if (!isFinite(adet) || !isFinite(debi)) return NaN;

      total += adet * debi;
    }

    return total;
  }

  // simultaneityFactor: Eş-zamanlılık faktörü uygulanmış debi (L/min)
  // toplam_l_min: toplam L/min (totalFlow çıktısı veya manuel)
  // faktor: eş-zamanlılık/çeşitlilik faktörü (tipik 0-1, GİRDİ ZORUNLU)
  //   - ISO 7396-1 Ek tabloları / yönetmelik TEYIT edilmeli
  //   - Sistemin eş zamanlı kullanım oranını belirtir
  //   - Bu fonksiyon tasarım kararı vermez: sabit VERMEZ, girdiye bağlı
  // Sonuç: toplam_l_min * faktor [L/min]
  // Güvenli: geçersiz/NaN girdi -> NaN
  function simultaneityFactor(opts) {
    opts = opts || {};
    var toplam_l_min = _num(opts.toplam_l_min);
    var faktor = _num(opts.faktor);

    if (!isFinite(toplam_l_min) || !isFinite(faktor)) return NaN;

    return toplam_l_min * faktor;
  }

  // ─────────────────────────────────────────────────────────────────
  // pipeVelocity: Boru içi gaz hızı (m/s) — ISO 7396-1 hız sınırı
  // kontrolü için TEMEL girdi. Eski modül SADECE debi hesaplıyordu,
  // boru çapı seçimi/hız kontrolü YOKTU — can güvenliği açısından
  // eksikti (aşırı hız → gürültü, erozyon, basınç kaybı riski).
  //
  // flow_l_min : Tasarım debisi (L/min) — totalFlow×simultaneityFactor sonucu
  // pipe_id_mm : Boru iç çapı (mm) — GİRDİ ZORUNLU (üretici/standart tablosu TEYİT)
  // Sonuç: v [m/s] = (flow_l_min/60000) / (π/4 * (pipe_id_mm/1000)^2)
  // Geçersiz/NaN/<=0 girdi -> NaN
  function pipeVelocity(opts) {
    opts = opts || {};
    var q = _num(opts.flow_l_min);
    var d = _num(opts.pipe_id_mm);
    if (!isFinite(q) || q < 0) return NaN;
    if (!isFinite(d) || d <= 0) return NaN;

    var q_m3s = q / 60000;
    var area_m2 = (Math.PI / 4) * Math.pow(d / 1000, 2);
    if (area_m2 <= 0) return NaN;
    return q_m3s / area_m2;
  }

  // velocityCheck: Hız sınırı kontrolü (ISO 7396-1 / HTM 02-01 TEYİT).
  // max_velocity_m_s GİRDİ ZORUNLU — sabit VERİLMEZ, gaz tipine ve
  // yerel yönetmeliğe göre değişir (tipik tasarım pratiği 3–6 m/s
  // besleme hatları için, vakumda farklı olabilir — TEYİT edilmeli).
  // Sonuç: { velocity_m_s, uygun: bool, asim_orani } — TASARIM KARARI
  // VERMEZ, sadece girilen sınırla karşılaştırır.
  function velocityCheck(opts) {
    opts = opts || {};
    var v = pipeVelocity(opts);
    var vmax = _num(opts.max_velocity_m_s);
    if (!isFinite(v)) return { velocity_m_s: NaN, uygun: null, asim_orani: NaN };
    if (!isFinite(vmax) || vmax <= 0) return { velocity_m_s: v, uygun: null, asim_orani: NaN };

    return {
      velocity_m_s: Math.round(v * 1000) / 1000,
      uygun: v <= vmax,
      asim_orani: Math.round((v / vmax) * 1000) / 1000
    };
  }

  // selectPipeDiameter: Verilen aday boru çapları arasından, hızı
  // max_velocity_m_s sınırını AŞMAYAN EN KÜÇÜK çapı seçer.
  // candidate_ids_mm: aday iç çap listesi (mm) — GİRDİ ZORUNLU dizi
  //   (yaygın bakır tıbbi gaz boru anma iç çapları için TEYİT: yerel
  //   standart/tedarikçi kataloğu — bu fonksiyon HİÇBİR ÇAP LİSTESİNİ
  //   VARSAYILAN OLARAK DAYATMAZ, çağıran taraf sağlamalı).
  // Sonuç: { pipe_id_mm, velocity_m_s } uygun çap bulunamazsa
  //   { pipe_id_mm: NaN, velocity_m_s: NaN } (en büyük aday bile
  //   sınırı aşıyor demektir — daha büyük çap/branşlama gerekir).
  function selectPipeDiameter(opts) {
    opts = opts || {};
    var q = _num(opts.flow_l_min);
    var vmax = _num(opts.max_velocity_m_s);
    var candidates = opts.candidate_ids_mm;

    if (!isFinite(q) || q < 0) return { pipe_id_mm: NaN, velocity_m_s: NaN };
    if (!isFinite(vmax) || vmax <= 0) return { pipe_id_mm: NaN, velocity_m_s: NaN };
    if (!Array.isArray(candidates) || candidates.length === 0) return { pipe_id_mm: NaN, velocity_m_s: NaN };

    var sorted = candidates.map(_num).filter(function (d) { return isFinite(d) && d > 0; }).sort(function (a, b) { return a - b; });

    for (var i = 0; i < sorted.length; i++) {
      var v = pipeVelocity({ flow_l_min: q, pipe_id_mm: sorted[i] });
      if (isFinite(v) && v <= vmax) {
        return { pipe_id_mm: sorted[i], velocity_m_s: Math.round(v * 1000) / 1000 };
      }
    }
    return { pipe_id_mm: NaN, velocity_m_s: NaN }; // en büyük aday bile yetersiz
  }

  var api = {
    totalFlow: totalFlow,
    simultaneityFactor: simultaneityFactor,
    pipeVelocity: pipeVelocity,
    velocityCheck: velocityCheck,
    selectPipeDiameter: selectPipeDiameter
  };
  if (typeof window !== 'undefined') window.MedicalGas = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
