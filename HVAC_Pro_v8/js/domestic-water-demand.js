// Gsem Mep Pro — Evsel Su Talebı ve Hidrofor Boyutlandırması
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Günlük su talebinden pik debi ve hidrofor tank hacmi hesaplanması.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Evsel Su Talebı: calc
  // Girdi: { gunluk_ortalama_debi_m3gun, pik_katsayisi, calisma_saati, pompa_devre_dakika }
  //   gunluk_ortalama_debi_m3gun  : Günlük ortalama su talebi (m³/gün) — GIRDI ZORUNLU
  //   pik_katsayisi               : Pik debi / ortalama debi oranı — OPSIYONEL, varsayı 3
  //                                (tesis tipine göre değişir: konut 2-3, ofis 2-4, TEYİT gerekir)
  //   calisma_saati               : Pompa çalışma saati (h/gün) — OPSIYONEL, varsayı 10
  //                                (tasarım pratiği: 8-12h, TEYİT gerekir)
  //   pompa_devre_dakika          : Pompa devre zamanı (dakika) — OPSIYONEL, varsayı 15
  //                                (kuru çalışma koruması için tipik 10-20 dakika)
  //
  // Formüller:
  //   Pik_debi_m3h = (gunluk_ortalama_debi_m3gun * pik_katsayisi) / calisma_saati  [m³/h]
  //   Hidrofor_tank_hacmi_m3 = Pik_debi_m3h * (pompa_devre_dakika/60) * 0.25        [m³]
  //   (0.25 faktörü: kaba kural — TEYİT gerekir; gerçek tasarımda presyon marjı ve
  //    sistem kalitesi dikkate alınır)
  //
  // Cikti: { Pik_debi_m3h, Hidrofor_tank_hacmi_m3 }  (2 ondalik)
  // Guvenli girdi: gecersiz/negatif -> NaN (patlamaz).
  function calc(opt) {
    opt = opt || {};
    var gunluk_ortalama_debi_m3gun = _num(opt.gunluk_ortalama_debi_m3gun);
    var pik_katsayisi = _num(opt.pik_katsayisi);
    var calisma_saati = _num(opt.calisma_saati);
    var pompa_devre_dakika = _num(opt.pompa_devre_dakika);

    // Opsiyonel parametreler: varsayılan değerler
    if (!isFinite(pik_katsayisi)) {
      if (opt.pik_katsayisi !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { Pik_debi_m3h: NaN, Hidrofor_tank_hacmi_m3: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      pik_katsayisi = 3;
    }

    if (!isFinite(calisma_saati)) {
      if (opt.calisma_saati !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { Pik_debi_m3h: NaN, Hidrofor_tank_hacmi_m3: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      calisma_saati = 10;
    }

    if (!isFinite(pompa_devre_dakika)) {
      if (opt.pompa_devre_dakika !== undefined) {
        // Kullanıcı sağladı ama geçersiz
        return { Pik_debi_m3h: NaN, Hidrofor_tank_hacmi_m3: NaN };
      }
      // Sağlanmadı, varsayılan kullan
      pompa_devre_dakika = 15;
    }

    var out = { Pik_debi_m3h: NaN, Hidrofor_tank_hacmi_m3: NaN };

    // Validasyon: gunluk_ortalama_debi_m3gun sonlu ve pozitif (ZORUNLU)
    if (!isFinite(gunluk_ortalama_debi_m3gun)) return out;
    if (gunluk_ortalama_debi_m3gun < 0) return out;

    // Opsiyonel parametreler de pozitif olmalı
    if (pik_katsayisi <= 0) return out;
    if (calisma_saati <= 0) return out;
    if (pompa_devre_dakika < 0) return out;

    // Pik debi (m³/h)
    var Pik_debi_m3h = (gunluk_ortalama_debi_m3gun * pik_katsayisi) / calisma_saati;

    // Hidrofor tank hacmi (m³)
    // Kaba kural: pik debinin pompa devre zamanı içinde sağlanacağı hacim × 0.25 marj
    var Hidrofor_tank_hacmi_m3 = Pik_debi_m3h * (pompa_devre_dakika / 60) * 0.25;

    out.Pik_debi_m3h = Math.round(Pik_debi_m3h * 100) / 100;
    out.Hidrofor_tank_hacmi_m3 = Math.round(Hidrofor_tank_hacmi_m3 * 100) / 100;
    return out;
  }

  var api = { calc: calc };
  if (typeof window !== 'undefined') window.DomesticWaterDemand = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
