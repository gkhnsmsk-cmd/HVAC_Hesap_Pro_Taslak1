# Geliştirici Notları — HVAC Hesap Pro (proje hafızası)

Bu dosya, projenin "belleği". Claude oturumlar arası hafıza taşımaz; her yeni oturum
buradan devam etmeli. Önemli kararlar, mimari ve tuzaklar burada.

## ⚠ KRİTİK TUZAKLAR (önce bunları oku)
1. **Edit/Write dosya aracı bu bağlı klasörde büyük dosyaları KESİYOR (truncate).**
   Belirti: dosya sonu yarıda kalır, `node --check` "Unexpected end of input" verir.
   → **Tüm dosya düzenlemelerini `mcp__workspace__bash` içinden `python`/`sed`/`cat` ile yap.**
   bash yazma güvenilir; Edit/Write kullanma.
2. **Mount silmeye izin vermiyor** (`rm` → "Operation not permitted"). Dosya oluşturulur,
   üzerine yazılır ama silinemez. Silme/taşıma/`git` kullanıcının kendi bilgisayarında (native) yapılmalı.
3. **Her değişiklikten sonra doğrula:** `node saglik-kontrol.js` ve `node tools/motor-test.js`.
   İkisi de yeşil (çıkış 0) olmadan "bitti" deme.

## Proje yapısı
- `HVAC_Pro_v8/` — güncel sürüm (Node sunucu + index.html + js/ + css/ + data/).
- `HVAC_Pro_v8/index.html` — ana UI + inline scriptler + i18n sözlüğü (T.tr / T.en).
- `HVAC_Hesap_Pro_v7.html` — eski tek-dosya sürüm (kurtarma referansı olarak değerli).
- `LISP/` — AutoCAD yerden ısıtma lisp'leri.
- `_yedek_*/` — otomatik güvenlik yedekleri.

## js/ modül haritası (index.html'de bu sırayla yükleniyor)
- `calc-engine.js` — hesap motoru. Ana fonksiyon `hesaplaMahalV5(row, P, korunanCihaz)` **SAF** (DOM kullanmaz).
- `device-db.js` — cihaz veritabanı + `cihazSec(...)`. (calc-engine'den önce yüklenir.)
- `render-views.js` — ekran render fonksiyonları + `STANDARTLAR` sabiti (dosya sonunda).
- `export-rtf.js` / `export-pdf.js` / `export-excel.js` — Word / PDF(HAP tarzı) / Excel çıktıları.
- `modules.js` — mühendislik modülleri: PressureLoss, EnergyEstimate, TS825Check, Psychro,
  DuctSizing, UFHCalc, ChillerSelect, FanSelect (her biri IIFE, `window.X = X`).
- `api.js` — AI/asistan ve yardımcılar.
- `validate.js` — (YENİ) Excel girdi doğrulaması `window.validateRooms(rows)`. Henüz bağlı değil.

## Hesap motoru — ısı kaybı formülü (doğrulanmış)
- Ham transmisyon: `qKR = duvarQis + pencereQis + dosemeQis(qDoK) + tavanQis(qTK) + skylightQis`
- Rüzgâr/maruziyet: `qKayipBase (qK) = qKR × P.ruzgarZam`  (varsayılan 1.07 → ~%7)
- Emniyet: `emIF = 1 + P.emIst/100`
- Toplam: `qKayip = qK × emIF + (thIstEkle ? thData.thIst : 0) + infilIst`
- Yani rapordaki Table 1.1.D satırları: bileşenler → **Wind/Exposure** → Infiltration →
  Ventilation → (Internal Gains: ignored) → Safety Factor → **Total = qKayip**. Toplam birebir tutar.
- Rapor (export-pdf.js / HAP tarzı) her zaman **İngilizce** (LANG'a bakmaz) — kullanıcı kararı.

## i18n mekanizması
- Global `LANG` ('tr'/'en'), sözlük `T.tr`/`T.en`, `t = T[LANG]`.
- `applyI18n()`: `data-i18n`, `data-i18n-ph` (placeholder), `data-i18n-title` (title) + bazı
  select option'larını `opt.value` eşleştirmesiyle çevirir.
- Sızıntı = data-i18n'e bağlanmamış sabit metin veya `'tr-TR'` locale sabiti. Kod içinde
  `t.lang==='en' ? 'EN' : 'TR'` kalıbı ile bağlanır.

## Test / araç envanteri
- `saglik-kontrol.js` (+ `Saglik-Kontrol.bat`) — tüm js + index.html sözdizimi sağlığı.
- `tools/motor-test.js` (+ `Motor-Test.bat`) — motoru headless çalıştırır, formül tutarlılığı denetler.
- `tools/validate-test.js` — validate.js birim testi.

## Doğrulama modülünü bağlama (kullanıcı test edince)
1. `index.html`'de diğer `<script src="js/...">` satırlarının yanına ekle:
   `<script src="js/validate.js?v=1"></script>`  (calc-engine'den sonra olması yeterli)
2. Excel yükleme/hesap tetikleyen yerde (ör. `procFile` veya "Hesabı Çalıştır"), veriyi aldıktan sonra:
   `try { const u = window.validateRooms(rows); if (u && u.length) { /* uyarıları göster */ } } catch(e){}`
   (try-catch şart: doğrulama bir hata verse bile hesap akışı bozulmasın.)
3. Bağladıktan sonra `Saglik-Kontrol.bat` çalıştır, uygulamayı aç, bozuk bir Excel ile dene.

## Yol haritası (öncelik)
1. Sağlamlaştırma — git (kullanıcı), sağlık+motor testi ✅, Excel doğrulama (modül hazır, bağlama bekliyor), otomatik kayıt/geri-al.
2. İzlenebilirlik — rapora formül/standart dayanağı.
3. Arayüz cilası + onboarding.
4. Çekirdek modüller (kanal ağı, boru+pompa, AHU, psikrometrik diyagram).
5. Ticari altyapı (hesap/lisans, bulut). 6. Niş modüller.

## Model politikası (kullanıcı onayı)
- Günlük iş: Opus+Haiku. Yüksek risk (hesap motoru/refactor/sürüm): Fable+Haiku. Yığın ucuz iş: Sonnet+Haiku.
