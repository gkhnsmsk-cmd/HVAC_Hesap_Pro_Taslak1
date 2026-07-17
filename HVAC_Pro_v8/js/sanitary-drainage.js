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

  var api = {
    DEFAULT_K: DEFAULT_K,
    wasteFlow: wasteFlow,
    pipeMin: pipeMin
  };
  if (typeof window !== 'undefined') window.SanitaryDrainage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
