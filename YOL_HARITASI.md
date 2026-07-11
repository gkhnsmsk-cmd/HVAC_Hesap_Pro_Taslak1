# Yol Haritası — Çok Disiplinli Mekanik Hesap + Raporlama Platformu

**Vizyon:** Yazılımı yalnız HVAC yük analizinden, tüm mekanik disiplinlerin hesabını yapan ve **tek "Rapor Al" ile bütünleşik, profesyonel, sunum kalitesinde bir hesap raporu** üreten bir platforma büyütmek. Her hesap bir **cetvel (schedule)** + rapor bölümü olacak. Hesaplar mevcut Excel'lerin birebir kopyası değil; **standartlara uygun, daha iyi** versiyonlar.

---

## 1. Cetvel Envanterinin 7 Başlığa Yerleşimi

| Disiplin | Senin Excel cetvellerin | Mevcut yazılımda karşılığı |
|---|---|---|
| **1. Kanal / Havalandırma** | Kanal basınç kaybı (sistem bazlı), VDI 2052 mutfak davlumbaz, kanal kesit, havalandırma miktarı, taze/egzoz, havuz havalandırma | DuctSizing, FanSelect (kısmi) |
| **2. Boru / Isıtma-Soğutma** | Boru çapı, net/pratik ısıtma-soğutma yükü, döşemeden ısıtma, FCU/radyatör/batarya seçimi, psikrometrik, genleşme tankı, kazan/brülör/boyler/baca | Yük motoru, PressureLoss, ChillerSelect, Psychro, UFHCalc, EnergyEstimate |
| **3. Yangın Tesisatı** | Yangın hidrolik hesap (3+ mükerrer versiyon) | — (yeni) |
| **4. Sıhhi Tesisat** | Pis su debileri (EN 12056), su deposu (TS 1258), DHW/boyler | — (yeni) |
| **5. Doğalgaz Tesisatı** | (Excel'de net yok — sıfırdan kurulacak) | — (yeni) |
| **6. Otomasyon Nokta/Kablo** | BMS Point List | — (yeni) |
| **7. Cihaz Elektrik Bilgileri** | Device List (Cihaz Elk.) | device-db.js (genişletilecek) |

> **Mükerrerlik:** Yük hesabı, yangın hidroliği, boru çapı ve havalandırma birden çok Excel'de tekrar ediyor. Bunlar **tek kaynağa** indirilecek (aşağıda).

---

## 2. Hedef Mimari

**Her disiplin = 3 katman** (mevcut `calc-engine.js` bunun ilk örneği):
1. `engine.js` — saf hesap (DOM'suz, headless test edilebilir, golden ile korunur).
2. `schedule.js` — cetvel tanımı (kolonlar, birimler, dipnotlar, standart referansı).
3. `report-section.js` — rapor bölümü üreticisi.

**Tek "Proje" veri modeli:** `project = { meta, mahaller[], sistemler[], cihazlar[], disiplinSonuçları{} }`. **Mahal listesi zaten var ve tüm disiplinlerin omurgası** — havalandırma debisi, pis su birimi, sprinkler alanı hepsi mahalden türer. **Cihaz listesi** elektrik + otomasyon cetvellerinin tek kaynağı.

**"Rapor Al" = Rapor Orkestratörü:** kapak + içindekiler + her disiplinin bölümü + izlenebilirlik eki. Her disiplin bir "reporter" kaydeder; orkestratör sırayla birleştirir. Hesabı yapılmamış disiplin otomatik atlanır. Mevcut HVAC raporu ilk kayıtlı bölüm olur.

---

## 3. Mükerrerlik Konsolidasyonu (tek kaynak kuralı)

- **Yük = tek kaynak:** mevcut yük motoru. Boru çapı, FCU/radyatör, kazan/genleşme tankı hep bundan beslenir; bağımsız Excel yük tabloları emekli olur.
- **Boru hidroliği = tek çekirdek:** Darcy-Weisbach tabanlı tek `pipe-hydraulics`; ısıtma/soğutma, yangın (Hazen-Williams), doğalgaz, sıhhi aynı çekirdeği farklı akışkan/parametreyle kullanır. 3+ yangın Excel'i tek modüle iner.
- **Havalandırma debisi = tek tablo:** mahal bazlı (kişi/alan/ACH); taze/egzoz, mutfak, havuz bunun özel durumları.
- **Cetvel = görünüm, hesap değil:** aynı motor birden çok cetvel besleyebilir; hesap asla iki yerde yazılmaz.

---

## 4. Fazlı Plan (sıra: mevcut varlık → değer → bağımlılık)

- **Faz 0 — Rapor iskeleti.** Orkestratör + kapak/içindekiler + mevcut yük raporunun "bölüm" olarak kaydı. *Neden ilk:* tüm fazlar buna takılır; vizyonun kanıtını ilk günden görürsün.
- **Faz 1 — Kanal/Havalandırma.** DuctSizing'i disipline terfi et + havalandırma debi cetveli + VDI 2052 mutfak. *Neden:* modal hazır, veri (mahal) hazır, değer yüksek.
- **Faz 2 — Boru/Isıtma-Soğutma.** `pipe-hydraulics` çekirdeği + boru çapı/genleşme tankı/kazan-boyler cetvelleri. *Neden:* yük motorundan doğrudan beslenir; yangın/gazın altyapısını kurar.
- **Faz 3 — Sıhhi.** EN 12056 pis su + TS 1258 depo + DHW. Bağımsız, orta zorluk.
- **Faz 4 — Yangın.** Hidrolik hesap (pipe-hydraulics üstüne). En yüksek risk; çekirdek olgunlaşınca.
- **Faz 5 — Doğalgaz.** Boru çapı + baca; dağıtım şirketi formatı gerektirir, geç kalabilir.
- **Faz 6 — Otomasyon + Elektrik.** Cihaz listesinden otomatik türetilen BMS nokta + elektrik cetvelleri. Hesap değil veri türetme; en kolay ama cihaz verisi ancak o zaman tam.

---

## 5. Disiplin Standartları

| Disiplin | Esas standart(lar) |
|---|---|
| Kanal/Havalandırma | EN 16798-1, ASHRAE 62.1, VDI 2052 (mutfak), VDI 2089 (havuz) |
| Boru/Isıtma-Soğutma | EN 12831, EN 12828 (genleşme), Darcy-Weisbach / ASHRAE |
| Yangın | NFPA 13 + TS EN 12845 (seçilebilir mod) |
| Sıhhi | EN 12056-2, TS 1258, EN 806 (DHW) |
| Doğalgaz | TS 7363 + dağıtım şirketi şartnamesi |
| Otomasyon/Elektrik | ISO 16484 (BMS adlandırma); üretici verisi + TS HD 60364 |

---

## 6. İlk Adım — Faz 0 (somut)

- **Ne:** `report-orchestrator.js` + disiplin kayıt arayüzü; mevcut HVAC raporu ilk kayıtlı bölüm; kapak + içindekiler + sayfa numarası.
- **Nasıl:** Additive — `export-pdf.js` bozulmaz, orkestratör onu sarar.
- **Doğrulama:** yeni test #8 — orkestratör 1 bölümle çalışır, çıktıda kapak+içindekiler+bölüm başlığı assert edilir; mevcut golden testler değişmeden geçer.

**Özet ilke:** *Önce rapor omurgası; sonra en hazır disiplinden başlayarak her fazda "motor → cetvel → rapora kayıt" döngüsü; hesaplar tek kaynakta, cetveller görünümde, yangın çekirdek olgunlaşmadan açılmaz.*
