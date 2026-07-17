// HVAC Hesap Pro — Ses Seviyesi Toplama Hesabı (noise-level-sum.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Birden fazla ses kaynağının (örn. difüzor, cihaz) toplam ses basınç seviyesini hesaplar.
(function () {
  'use strict';

  // Sayı doğrulama helper: isFinite kontrol
  // Geçersiz/NaN girdiler -> NaN döndür (güvenli, patlamadan)
  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // sumDecibels: Birden fazla ses kaynağının (veya difüzor/cihaz) toplam ses basınç
  // seviyesini logaritmik toplama ile hesapla.
  // NOT: Bu, standart akustik formülü (VDI 2078, ASHRAE) kullanarak fiziksel enerji
  // toplamını gerçekleştirir; aritmmetik toplama değil, logaritmiktir.
  //
  // arr: Ses basınç seviyeleri dizisi (dB cinsinden)
  //      Örn: [50, 50] -> toplamda ~53 dB (iki eşit kaynak +3 dB katkı)
  //      Boş dizi [] -> 0 dB (veya -Infinity; 0 güvenli seçildi)
  //      NaN/Infinity girdileri yoksayılır / filtrelenir
  //
  // Formül: L_toplam = 10 * log₁₀(Σ(10^(Lᵢ/10)))
  //
  // Sonuç: Toplam ses basınç seviyesi (dB)
  //        Boş dizi: 0 (sessizlik)
  // Geçersiz girdilerde: NaN döndür (panik-patlamadan).
  function sumDecibels(arr) {
    // Boş veya null dizi -> 0 dB (sessizlik)
    if (!arr || arr.length === 0) {
      return 0;
    }

    // Dizinin her elemanını denetle: sonlu sayılara çevir
    var sum = 0;
    var count = 0;
    for (var i = 0; i < arr.length; i++) {
      var dB = _num(arr[i]);
      if (isFinite(dB)) {
        // Logaritmik toplama: 10^(dB/10) enerji oranı
        sum += Math.pow(10, dB / 10);
        count++;
      }
    }

    // Tüm girdiler geçersizse: 0 dön
    if (count === 0) {
      return 0;
    }

    // Enerji toplamından toplam dB seviyesine dön
    var total_dB = 10 * Math.log10(sum);
    return Math.round(total_dB * 10) / 10; // 1 ondalık (dB)
  }

  // nrMargin: Toplam ses basınç seviyesi ile hedef NR (Noise Rating) / NC (Noise Criteria)
  // arasındaki farkı hesapla.
  // NOT: Bu fonksiyon SADECE farkı hesaplar; tasarım kararı VERMEZ.
  // Pozitif sonuç: Hedefi aşıyor (aşırıdır)
  // Negatif sonuç: Hedefin altında (iyidir)
  // VDI 2081 veya ISO 3382 / EN 16798 oda NR/NC hedef tablosu TEYIT:
  // Örn. Özel oda (tiyatro, anestezi): NR 25-30
  //      Ofis/Konfor oda: NR 35-40
  //      Endüstri/Teknik: NR 45-50
  //
  // opts.L_toplam_dB: Toplam ses basınç seviyesi (dB) — GIRDI ZORUNLU
  //                   Genellikle sumDecibels() çıktısı
  // opts.hedef_NR_dB: Hedef oda gürültü kriteri / sınıfı (dB) — GIRDI ZORUNLU
  //                   Oda tasarımına ve kullanımına göre seçilir (sabit VERME)
  //
  // Sonuç: Fark (dB) = L_toplam_dB - hedef_NR_dB
  //        Pozitif: Hedefi aşıyor
  //        Sıfır: Hedefi karşılıyor
  //        Negatif: Hedefin altında (iyi)
  // Geçersiz/NaN girdilerde: NaN döndür (panik-patlamadan).
  function nrMargin(opts) {
    opts = opts || {};
    var L_toplam = _num(opts.L_toplam_dB);
    var hedef_NR = _num(opts.hedef_NR_dB);

    if (!isFinite(L_toplam) || !isFinite(hedef_NR)) return NaN;

    var fark = L_toplam - hedef_NR;
    return Math.round(fark * 10) / 10; // 1 ondalık (dB)
  }

  var api = {
    sumDecibels: sumDecibels,
    nrMargin: nrMargin
  };
  if (typeof window !== 'undefined') window.NoiseLevelSum = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
