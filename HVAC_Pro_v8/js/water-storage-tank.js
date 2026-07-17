// HVAC Hesap Pro — Su Depolama Tanki Hacmi (water-storage-tank.js)
// SAF (DOM'suz) IIFE modul; headless test edilebilir.
// Su depo hacmi hesabi: TS 1258 standart temel varsayimlarini KULLANICI girdisi olarak kabul et.
(function () {
  'use strict';

  function _num(x) {
    var n = Number(x);
    return (isFinite(n)) ? n : NaN;
  }

  // calc: Gereken su depo hacmini hesapla.
  // Girdi: { gunlukTuketimL, depolamaSuresiSaat, esZamanlilikFaktor=1, yanginRezerviL=0 }
  //   gunlukTuketimL        : günlük su tüketimi (L) — KULLANICI GIRDISI (TS 1258 tablo)
  //   depolamaSuresiSaat    : depolama süresi (saat) — KULLANICI GIRDISI (endüstri türüne göre)
  //   esZamanlilikFaktor    : eşzamanlılık/kullanım faktörü (birimsiz, 0..1) — OPT, varsayılan=1
  //   yanginRezerviL        : yangın söndürme rezervi (L) — OPT, varsayılan=0
  //
  // Cikti: { gerekliHacimL, gerekliHacimM3 } (1 ondalik)
  //   gerekliHacimL = gunlukTuketimL * (depolamaSuresiSaat/24) * esZamanlilikFaktor + yanginRezerviL
  //   gerekliHacimM3 = gerekliHacimL / 1000
  //
  // Guvenli girdi: gecersiz/sifir-bolme -> NaN alanlarla doner (patlamaz).
  function calc(opts) {
    opts = opts || {};
    var gunlukTuketim = _num(opts.gunlukTuketimL);
    var depolamaSuresi = _num(opts.depolamaSuresiSaat);
    var esZamanlilık = _num(opts.esZamanlilikFaktor);
    var yanginRezervü = _num(opts.yanginRezerviL);

    // Varsayılan değerler
    if (!isFinite(esZamanlilık) || esZamanlilık < 0) esZamanlilık = 1;
    if (!isFinite(yanginRezervü) || yanginRezervü < 0) yanginRezervü = 0;

    var out = { gerekliHacimL: NaN, gerekliHacimM3: NaN };

    // Zorunlu girdiler (negatif/NaN -> güvenli NaN dönüş)
    if (!isFinite(gunlukTuketim) || gunlukTuketim < 0) return out;
    if (!isFinite(depolamaSuresi) || depolamaSuresi < 0) return out;

    // Hacim hesabi
    var gerekliHacimL = gunlukTuketim * (depolamaSuresi / 24) * esZamanlilık + yanginRezervü;
    out.gerekliHacimL = Math.round(gerekliHacimL * 10) / 10;
    out.gerekliHacimM3 = Math.round((gerekliHacimL / 1000) * 100) / 100;

    return out;
  }

  var api = {
    calc: calc
  };
  if (typeof window !== 'undefined') window.WaterStorageTank = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
