# Gsem Mep Pro — Mekanik Tesisat Hesap Hiyerarşisi

Amaç: bir mekanik tesisat projesinin TÜM hesaplarının başlık + sırasını, gerçek proje iş akışına göre tanımlamak. Önce iskelet, sonra içi doldurulur.
Durum etiketi: **[M]** mevcut · **[K]** kısmi/var ama geliştirilecek · **[Y]** yeni (sıfırdan).

---

## 0. KONSEPT / SİSTEM KARARLARI  *(projenin başı)*
- 0.1 Disiplin-sistem seçimi (hangi disipline hangi sistem) — anlatım + karar tablosu **[Y]**
- 0.2 Sistem karşılaştırması (VRF vs chiller-kazan-fancoil vs split; ilk yatırım/işletme/LCC) **[K]** (Sistem karşılaştırmaları.xlsx)
- 0.3 Zorunlu sistem kontrol listesi (yönetmelik): sprinkler, yangın dolabı, hidrant, sığınak havalandırma, asansör/merdiven basınçlandırma, duman tahliye — bina tipi/yüksekliğine göre "zorunlu mu?" **[Y]**

## 1. SIHHİ TESİSAT
- 1.1 Atık (pis) su debileri ve kolon/hat boyutlandırma — EN 12056-2 **[K]** (MEKANİK: PİS SU DEBİLERİ)
- 1.2 Yağmur suyu — EN 12056-3 **[Y]**
- 1.3 Kullanım soğuk suyu: debi, hidrofor, boru çapı — EN 806 **[K]**
- 1.4 Su deposu hacmi — TS 1258 **[K]** (MEKANİK: SU DEPOSU TS1258)
- 1.5 Kullanım sıcak suyu (DHW) / boyler — EN 806 **[K]** (MEKANİK: BOYLER)

## 2. ISI YALITIMI / U-DEĞERİ  *(yükten ÖNCE)*
- 2.1 Yapı elemanı U-değeri: katman→U = 1/(Rsi+Σd/λ+Rse) — TS 825 (2024) **[Y]**
- 2.2 Malzeme (λ) + iklim (derece-gün) + limit U kütüphaneleri **[Y]**
- 2.3 Bina ısı yalıtımı / yıllık ısıtma-soğutma enerji ihtiyacı (TS 825 2024, EN ISO 52016 yakın) **[Y]**
- 2.4 Yoğuşma (Glaser) kontrolü **[Y]**
> Çıktı: U-değerleri → doğrudan 3. adıma (yük motoruna) beslenir.

## 3. ISI KAYBI / ISI KAZANCI (YÜK)
- 3.1 Isı kaybı — EN 12831 / TS 2164 **[M]** (motor)
- 3.2 Isı kazancı (soğutma) — VDI 2078 / ASHRAE CLTD **[M]** (motor)
- 3.3 Taze hava / havalandırma yükü + psikrometri — EN 16798 / ASHRAE 62.1 **[M/K]**
- 3.4 Mahal cetveli (yük özeti) — HAP tarzı **[M]**

## 4. CİHAZ SEÇİMLERİ  *(yüke göre)*
- 4.1 Fan-coil / iç ünite seçimi **[K]** (MEKANİK: FCU SEÇİM)
- 4.2 Radyatör / panel seçimi **[K]**
- 4.3 Chiller / VRF dış ünite / kazan-brülör / boyler seçimi **[K]** (ChillerSelect + MEKANİK)
- 4.4 Isıtıcı/soğutucu batarya, genleşme tankı (EN 12828) **[K]**
- 4.5 Döşemeden ısıtma **[K]** (UFHCalc)

## 5. BASINÇ KAYBI  *(çizimden sonra → pompa/fan Pa kesinleşir)*
- 5.1 Boru (ısıtma/soğutma) basınç kaybı + pompa Pa — Darcy-Weisbach **[M]** (PressureLoss)
- 5.2 Kanal basınç kaybı + fan Pa — eşit sürtünme **[M/K]** (DuctSizing + KANAL_BASINC)
- 5.3 Pompa/fan seçimi kesinleştirme (debi + Pa) **[K]** (FanSelect)

## 6. HAVALANDIRMA (özel sistemler)
- 6.1 Havalandırma miktarı (taze/egzoz, ACH) — EN 16798 **[K]**
- 6.2 Mutfak davlumbaz egzoz — VDI 2052 **[K]** (Hood_VDI2052)
- 6.3 Havuz havalandırma / nem alma — VDI 2089 **[K]**
- 6.4 Otopark jet-fan + CO kontrol **[Y]**
- 6.5 Sığınak havalandırma (sivil savunma) **[Y]**

## 7. DUMAN KONTROL / BASINÇLANDIRMA
- 7.1 Merdiven basınçlandırma — EN 12101-6 **[K]** (Merdiven Basınçlandırma.xlsx)
- 7.2 Asansör kuyusu basınçlandırma **[K]** (asansör basınçlandırma.xls)
- 7.3 Duman tahliye / egzoz (atrium, kapalı otopark) — EN 12101 **[Y]**

## 8. YANGIN TESİSATI
- 8.1 Tasarım ön hesabı (tehlike sınıfı, debi/alan) — NFPA 13 / EN 12845 **[Y]**
- 8.2 Sprinkler/hidrant/dolap hidrolik hesabı (çizim sonrası) — pompa debi+basınç **[K]** (Yangın hidrolik, 3 versiyon → tek modül)
- 8.3 Gazlı söndürme (elektrik/sistem odaları) **[Y]**

## 9. EKİPMAN ELEKTRİK GÜCÜ LİSTESİ  *(tüm cihazlar seçilince)*
- 9.1 Cihaz elektrik bilgileri (kW, V, faz, akım, koruma) **[K]** (TAV Device List)

## 10. OTOMASYON NOKTA + KABLO LİSTESİ  *(ekipman listesinden türer)*
- 10.1 BMS I/O nokta listesi (AI/AO/DI/DO) — ISO 16484 **[K]** (TAV BMS Point List)
- 10.2 Kablo listesi (tip/kesit/uzunluk) **[Y]**

## 11. PROJE HESAP RAPORU  *(orkestratör)*
- Anlatım gövdesi (niteliksel, editlenebilir, sistem-presetli) + EKLER = 1-10 cetvelleri. **[K]** (report-orchestrator — Faz 0)

## 12. TEKNİK ŞARTNAME  *(imalat/malzeme tanımları)* **[Y]**
## 13. METRAJ / KEŞİF LİSTESİ  *(şartname+projeye göre)* **[Y]**

---

## Nihai teslim paketi
1. Mekanik tesisat çizimleri + **hesap raporu** (11)
2. **Keşif listesi** (13)
3. **Teknik şartname** (12)

## Rapor ilkesi (önemli)
Anlatım metni NİTELİKSEL: mevcut durum, adres, kullanım amacı, bina tipi, kat/m² alanları, düşünülen/zorunlu sistemler. Değişken SAYILAR (kW, debi, çap) yalnız EKLER cetvellerinde — revizyonlarda anlatım bozulmaz.

## Aklıma gelen ek modüller (öneri)
- Kondens/drenaj hattı, yumuşatma/su arıtma, yakıt hattı/tankı
- Akustik (NR/NC oda gürültüsü, kanal susturucu), sismik askı/kompansatör
- Isı geri kazanım verimi & yıllık enerji/karbon (LEED/BREEAM kredisi)
- Medikal gaz (hastane), basınçlı hava (endüstri)
- Pompa NPSH, kojenerasyon/ısı pompası opsiyon analizi
