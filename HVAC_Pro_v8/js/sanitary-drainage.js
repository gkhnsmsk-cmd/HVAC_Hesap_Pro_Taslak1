// Gsem Mep Pro — Pis Su (Atik Su) Debi Motoru (sanitary-drainage.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// EN 12056-2 esasli atik su debisi (Qww) ve basit min DN onerisi.
// MALZEME / DU (deşarj birimi) TABLOSU YOKTUR — sumDU KULLANICI GIRDISIDIR.
(function () {
  'use strict';

  // EN 12056-2 frekans faktoru K (teyit — standarttan dogrulanmali):
  //   K=0.5  duzensiz kullanim (konut, pansiyon, ofis)
  //   K=0.7  duzenli kullanim (hastane, okul, restoran, otel)
  //   K=1.0  sik kullanim (umumi tuvalet, dus)
  //   K=1.2  ozel kullanim (laboratuvar)
  var DEFAULT_K = 0.5;

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // Atik su debisi: Qww = K * sqrt(sumDU)  (L/s), EN 12056-2.
  // sumDU: toplam desarj birimi (DU) toplami (kullanici girdisi).
  // Gecersiz / negatif girdi -> guvenli 0 dondurur (NaN uretmez).
  function wasteFlow(sumDU, K) {
    var s = _num(sumDU);
    var k = (K === undefined || K === null) ? DEFAULT_K : _num(K);
    if (!isFinite(k) || k < 0) k = DEFAULT_K;
    if (!isFinite(s) || s < 0) return 0;
    var q = k * Math.sqrt(s);
    return Math.round(q * 1000) / 1000; // 3 ondalik
  }

  // Basit dolum orani ile min DN onerisi (teyit — proje esas alinacak):
  //   Qww < 0.5 -> DN50 ; < 1.5 -> DN70 ; < 2.5 -> DN100 ; aksi -> DN125
  function pipeMin(Qww) {
    var q = _num(Qww);
    if (!isFinite(q) || q < 0) return 'DN50';
    if (q < 0.5) return 'DN50';
    if (q < 1.5) return 'DN70';
    if (q < 2.5) return 'DN100';
    return 'DN125';
  }

  // ─────────────────────────────────────────────────────────────────
  // Eski pipeMin() SADECE Qww aralığına göre keyfi bir DN tablosu
  // kullanıyordu — EĞİM, DOLUM ORANI (havalandırma tipine göre EN
  // 12056-2'de değişir: havalandırmasız tekli boru sistemi max 0.5,
  // havalandırmalı sistem max 0.7) ve BORU MALZEMESİ (pürüzlülük)
  // hiç hesaba katılmıyordu — bu üç faktör gerçek kapasiteyi büyük
  // ölçüde değiştirir. Aşağıdaki fonksiyonlar Manning/kısmi-dolu
  // dairesel kesit yöntemiyle GERÇEK hidrolik kapasiteyi hesaplar.
  // Eski pipeMin() SİLİNMEDİ (geriye dönük uyumluluk) ama artık
  // ÖNERİLMEZ — yerine pipeCapacityManning/selectPipeDN kullanılmalı.

  // pipeCapacityManning: Kısmi dolu dairesel borunun Manning
  // formülüyle debi kapasitesi (L/s).
  //   DN_mm         : Boru nominal iç çapı (mm) — GİRDİ ZORUNLU
  //   egim_yuzde    : Boru eğimi (%) — GİRDİ ZORUNLU, proje/TEYİT
  //   dolum_orani   : h/D dolum oranı (0-1) — GİRDİ ZORUNLU.
  //                   EN 12056-2 TEYİT: havalandırmasız tekli boru
  //                   sistemi ≤0.5, havalandırmalı sistem ≤0.7 —
  //                   SABİT VERİLMEZ, çağıran taraf sağlar.
  //   manning_n     : Boru pürüzlülük katsayısı — GİRDİ ZORUNLU,
  //                   malzemeye göre değişir (PVC/PP ~0.009,
  //                   dökme demir ~0.013 — TEYİT, sabit VERİLMEZ).
  // Formül: theta=2*acos(1-2y); A=(D²/8)(theta-sin theta); P=(D/2)theta;
  //         R=A/P; Q=(1/n)*A*R^(2/3)*sqrt(egim)  [m³/s] -> L/s
  // Geçersiz/NaN/aralık-dışı (dolum_orani 0-1 dışı) girdi -> NaN
  function pipeCapacityManning(opt) {
    opt = opt || {};
    var dn = _num(opt.DN_mm);
    var egimYuzde = _num(opt.egim_yuzde);
    var y = _num(opt.dolum_orani);
    var n = _num(opt.manning_n);

    if (!isFinite(dn) || dn <= 0) return NaN;
    if (!isFinite(egimYuzde) || egimYuzde <= 0) return NaN;
    if (!isFinite(y) || y <= 0 || y > 1) return NaN;
    if (!isFinite(n) || n <= 0) return NaN;

    var D = dn / 1000; // m
    var S = egimYuzde / 100; // m/m
    // y=1 (tam dolu) özel durum: theta=2*pi
    var theta = (y >= 1) ? 2 * Math.PI : 2 * Math.acos(1 - 2 * y);
    var A = (D * D / 8) * (theta - Math.sin(theta)); // m²
    var P = (D / 2) * theta; // m (ıslak çevre)
    if (P <= 0) return NaN;
    var R = A / P; // m (hidrolik yarıçap)

    var Q_m3s = (1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);
    var Q_l_s = Q_m3s * 1000;
    return Math.round(Q_l_s * 1000) / 1000; // 3 ondalık
  }

  // selectPipeDN: Verilen aday DN listesinden, Qww_l_s debisini
  // karşılayan (kapasite >= debi) EN KÜÇÜK çapı seçer.
  //   Qww_l_s          : Tasarım atık su debisi (L/s) — wasteFlow() çıktısı
  //   egim_yuzde, dolum_orani, manning_n : pipeCapacityManning ile aynı, ZORUNLU
  //   candidate_DN_mm  : Aday DN listesi (mm) — GİRDİ ZORUNLU dizi
  //                      (EN 12056-2/yerel boru kataloğu TEYİT — bu
  //                      fonksiyon hiçbir listeyi VARSAYILAN DAYATMAZ)
  // Sonuç: { DN_mm, kapasite_l_s } — hiçbir aday yetmezse
  //   { DN_mm: NaN, kapasite_l_s: NaN } (daha büyük çap/branşlama gerekir)
  function selectPipeDN(opt) {
    opt = opt || {};
    var q = _num(opt.Qww_l_s);
    var candidates = opt.candidate_DN_mm;

    if (!isFinite(q) || q < 0) return { DN_mm: NaN, kapasite_l_s: NaN };
    if (!Array.isArray(candidates) || candidates.length === 0) return { DN_mm: NaN, kapasite_l_s: NaN };

    var sorted = candidates.map(_num).filter(function (d) { return isFinite(d) && d > 0; }).sort(function (a, b) { return a - b; });

    for (var i = 0; i < sorted.length; i++) {
      var cap = pipeCapacityManning({
        DN_mm: sorted[i],
        egim_yuzde: opt.egim_yuzde,
        dolum_orani: opt.dolum_orani,
        manning_n: opt.manning_n
      });
      if (isFinite(cap) && cap >= q) {
        return { DN_mm: sorted[i], kapasite_l_s: cap };
      }
    }
    return { DN_mm: NaN, kapasite_l_s: NaN };
  }

  var api = {
    DEFAULT_K: DEFAULT_K,
    wasteFlow: wasteFlow,
    pipeMin: pipeMin,                       // ESKİ, kaba tablo — geriye dönük uyumluluk
    pipeCapacityManning: pipeCapacityManning, // YENİ, gerçek hidrolik kapasite
    selectPipeDN: selectPipeDN                // YENİ, eğim+dolum oranı+malzemeye göre DN seçimi
  };
  if (typeof window !== 'undefined') window.SanitaryDrainage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
