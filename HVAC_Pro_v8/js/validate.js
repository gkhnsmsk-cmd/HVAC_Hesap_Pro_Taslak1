// HVAC Hesap Pro — Excel/Mahal Girdi Dogrulamasi (validate.js)
// SAF fonksiyon (DOM yok). Tarayicida window.validateRooms olarak,
// Node testinde require ile kullanilabilir.
// Amac: ice aktarilan mahal verisinde eksik/bozuk/olagandisi degerleri
// YAKALAYIP uyari listesi dondurmek. Hesabi DEGISTIRMEZ; sadece bildirir.
(function () {
  function toNum(r, keys) {
    for (const k of keys) {
      const v = r[k];
      if (v !== undefined && v !== null && v !== '' && !isNaN(+v)) return +v;
    }
    return NaN;
  }
  function validateRooms(rows) {
    const issues = [];
    if (!Array.isArray(rows) || rows.length === 0) {
      issues.push({ seviye: 'hata', mahal: '-', mesaj: 'Mahal listesi bos veya okunamadi.' });
      return issues;
    }
    rows.forEach((r, i) => {
      const ad = r.mahalAdi || r['mahal adi'] || r['mahal adı'] || r.mahalNo || ('Satir ' + (i + 1));
      const alan = toNum(r, ['alan', 'yüzölçümü', 'yuzolcumu']);
      if (!(alan > 0)) issues.push({ seviye: 'hata', mahal: ad, mesaj: 'Alan (m2) eksik veya 0 — bu mahal hesaplanamaz.' });
      else if (alan > 10000) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Alan cok buyuk (' + alan + ' m2) — kontrol edin.' });

      const h = toNum(r, ['h', 'yükseklik', 'yukseklik']);
      if (isNaN(h)) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Yukseklik eksik — varsayilan 3 m kullanilacak.' });
      else if (h <= 0 || h > 15) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Yukseklik olagandisi (' + h + ' m).' });

      const uDuv = toNum(r, ['duvarU', 'duvar u değeri', 'duvar u degeri']);
      if (isNaN(uDuv)) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Duvar U-degeri eksik — varsayilan kullanilacak.' });
      else if (uDuv <= 0 || uDuv > 5) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Duvar U-degeri olagandisi (' + uDuv + ' W/m2K).' });

      const kisi = (toNum(r, ['oturan kişi', 'oturan kisi']) || 0) + (toNum(r, ['ayakta kişi', 'ayakta kisi']) || 0);
      if (kisi < 0) issues.push({ seviye: 'hata', mahal: ad, mesaj: 'Kisi sayisi negatif.' });

      if (!r.mahalNo && !r['mahal no'] && !r['mahal_no']) issues.push({ seviye: 'uyari', mahal: ad, mesaj: 'Mahal No eksik.' });
    });
    return issues;
  }
  if (typeof window !== 'undefined') window.validateRooms = validateRooms;
  if (typeof module !== 'undefined' && module.exports) module.exports = { validateRooms };
})();
