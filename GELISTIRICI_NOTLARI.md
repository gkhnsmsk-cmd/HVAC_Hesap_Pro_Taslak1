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

## Değişiklik günlüğü
- **2026-07-11 — KRİTİK rüzgâr hatası düzeltmesi (TS 2164/825).**
  - HATA: Motor, transmisyon ısı kaybını `p_wind` (×1.00/1.07 maruziyet FAKTÖRÜ) yerine `p_ruzgar`
    (rüzgâr HIZI, m/s, varsayılan 3.5) ile çarpıyordu → ısıtma yükleri ~%57 şişik.
  - DÜZELTME: P-builder'larda (calc-engine.js + index.html) `ruzgarZam` artık `p_wind`'den okunuyor;
    ayrıca `ruzgarHiz` = `p_ruzgar` olarak eklendi.
  - YENİ: İnfiltrasyon rüzgâr hızıyla ölçekleniyor: `ach_eff = ach_base × (v/3.5)^1.33`, [0.7–1.6] kırpma.
    v_ref=3.5 seçildiği için varsayılan projelerde infiltrasyon DEĞİŞMEZ (yalnız transmisyon hatası düzelir).
  - AYRIM: p_wind → yalnız transmisyon zammı; p_ruzgar (m/s) → yalnız infiltrasyon.
  - Demo/doğrulama: `node tools/ruzgar-demo.js`.
  - GERİYE UYUM: Eski projeler yeniden hesaplanmalı; eski ısıtma sonuçları güvenli tarafta fazla boyutluydu.
  - TODO (opsiyonel): UI'da p_wind ve p_ruzgar etiketlerine rollerini açıkça yaz (Fable önerisi).

- **2026-07-11 — P2 (merkezî hata yakalama) + P3 (golden test) — Fable önderliğinde.**
  - `errors.js`: window hata/promise-red yakalama, okunur hata bandı, persist varsa "son taslağı geri yükle".
    En önce yüklenir + install edilir. Test: `tools/errors-test.js`.
  - `persist.js`: otomatik kayıt (5'li snapshot halkası) + undo + yükleme-anı "Geri Yükle" bandı. Test: `tools/persist-test.js`.
  - `tools/golden-test.js` (+ Golden-Test.bat): kullanıcının GERÇEK raporundan (ENTRANCE HALL) alınan
    doğrulanmış değerleri kilitler — roof 213.3, floor 274.3, qKayipBase 487.6, infil 245 + RÜZGÂR ×1.00 kilidi.
  - Test seti (hepsi çıkış 0 olmalı): saglik-kontrol, motor-test, golden-test, persist-test, errors-test, validate-test.

- **2026-07-11 — Faz 4 P1: Modül sözleşme uyumu (Fable önderliğinde).**
  - Canlı modül UI'si `mod_*` / `_showModResult`; eski `run*` fonksiyonları (`pl-result/en-result/ts-result` id'leri YOK) ölü kod.
  - FanSelect.select: UI-uyum düz alanları eklendi (tip, q_m3h, motor_kW, verim) — results[] korundu.
  - PressureLoss.select: UI-uyum alanları eklendi (dP_Pa_m, dP_total_kPa [Pa→kPa], m_dot_kgh [kg/s→kg/h]).
  - ChillerSelect: alanlar zaten uyumlu. EnergyEstimate çift-imza yalnız ölü kodda.
  - Yeni test: `tools/modul-test.js` (+ Modul-Test.bat) — modül sözleşmelerini + UI-uyum alanlarını kilitler.
  - Test seti artık 7: saglik, motor, golden, modul, persist, errors, validate.
  - SIRADAKI (Fable): DuctSizing + UFHCalc'ı UI'ye bağla (kod hazır, hiç çağrılmıyor); sonra psikrometrik SVG diyagram.

- **2026-07-11 — Faz 4 P2: DuctSizing UI'ye bağlandı.**
  - "Pipe & Duct" moduna (type==='pressure') ikinci bölüm: Kanal Boyutlandırma (mod_duct_q/r/mat) + _runDuct() → DuctSizing.calcCircular → Ø std çap, eşdeğer dikdörtgen, hız, sürtünme, Reynolds.
  - UFHCalc henüz bağlı değil — ayrı bir tool butonu/UI yeri gerektiriyor (tasarım kararı, sonraki adım).

- **2026-07-11 — Batch (kullanıcı yokken): golden genişletme + modül denetimi.**
  - Golden test 5 GERÇEK mahale çıkarıldı (Entrance Hall, Electrical, Women's Locker, Deep Freezer, Cooking) —
    çatı/döşeme/duvar transmisyonu + rüzgâr×1.00 kilidi, hepsi kullanıcının gerçek raporundan.
  - Modül denetimi: canlı UI'de yalnız FanSelect + PressureLoss gerçek uyumsuzdu (düzeltildi). ChillerSelect,
    Psychro, EnergyEstimate canlı çağrıları TEMİZ. TS825Check/eski run* fonksiyonları ölü kod (pl/en/ts-result id'leri yok).
  - modul-test.js'e "5) Canli UI sozlesme alanlari" bölümü: tüm modüllerin UI-okuduğu alanlar kilitlendi.
  - AÇIK: UFHCalc UI'ye bağlı değil (yeni tool yeri gerek); psikrometrik SVG diyagram (radikal UI) kullanıcı onayı bekliyor.

## Marka / İsim
- Yeni yazılım adı: **Gsem Mep Pro** (çok disiplinli MEP hesap + raporlama platformu).
- Uygulanacak yerler: rapor kapağı, uygulama başlığı (eski "HVAC HESAP PRO v8.0" → "Gsem Mep Pro").
- Yol haritası: YOL_HARITASI.md. Referans rapor yapısı: anlatım gövdesi (editlenebilir, sistem-tipi presetli) + EKLER (motor cetvelleri) → tek "Rapor Al" orkestratörü.

## Rapor ilkeleri (kullanıcı kararı — ÖNEMLİ)
- Anlatım metninde DEĞİŞKEN SAYISAL DEĞER OLMAZ (56 kW vb.). Sayılar sürekli revize olur → EKLER'de.
- Anlatım = mevcut durum, adres, kullanım amacı, bina tipi, kat/m² bilgisi, hangi sistemler düşünüldü, hangileri ZORUNLU (sprinkler, yangın dolabı, hidrant, sığınak havalandırma, asansör/merdiven basınçlandırma, duman atım).
- report-model.js REVİZE edilecek: preset metinlerindeki {{toplam_sogutma_kW}}/{{toplam_isitma_kW}} çıkarılıp anlatım niteliksel yapılacak; sayılar EK cetvellere.

## Gerçek proje iş akışı (omurga)
Konsept/sistem kararı → sıhhi → TS825 U-değeri/ısı yalıtımı → ısı kaybı/kazancı → cihaz seçimi → çizim → basınç kaybı (pompa/fan Pa) → yangın ön hesap→çizim→hidrolik → ekipman elektrik listesi → otomasyon nokta/kablo → hesap raporu → teknik şartname → metraj/keşif.
Paket: (1) çizim+hesap raporu, (2) keşif listesi, (3) teknik şartname.

## Yeni modüller (kullanıcı)
- TS 825 U-değeri + ısı yalıtımı (2024 rev., ısıtma+soğutma, EN ISO 52016 yakın; katman→U=1/(Rsi+Σd/λ+Rse); malzeme/iklim kütüphanesi). Datası yok, sıfırdan pro yapılacak.
- Merdiven basınçlandırma, Asansör basınçlandırma, Duman atım/tahliye, Sığınak havalandırma, Sistem karşılaştırma.
