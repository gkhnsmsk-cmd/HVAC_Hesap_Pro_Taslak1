# HVAC Hesap Pro — Ticarileşme Değerlendirmesi

*Hazırlayan: kod tabanının tamamı incelenerek. Tarih: 10 Temmuz 2026.*

Bu belge üç başlıkta ilerliyor: (1) ticari ürüne geçiş için teknik eksiklikler, (2) eklenebilecek modül önerileri, (3) arayüz değerlendirmesi ve dürüst bir "satın alır mıydım" yanıtı. Değerlendirme, mevcut kod tabanında bizzat gördüğüm durumlara dayanıyor; bu yüzden övgü de eleştiri de somut.

---

## 1. Teknik Eksiklikler (ticari ürüne geçiş için)

### 1.1 Güvenilirlik ve veri bütünlüğü — *en kritik başlık*

Bu oturumda dört ana JS dosyasının (`render-views.js`, `modules.js`, `calc-engine.js`, `export-excel.js`) yarıda kesilmiş/bozuk halde olduğunu ve uygulamanın bu bozuk dosyalarla **sessizce** çalıştığını gördük. Ticari bir üründe bu kabul edilemez.

- **Sürüm kontrolü yok (git yok).** Yedek stratejisi elle alınmış `.bak_...` dosyaları. Bir dosya bozulduğunda geri dönüş neredeyse imkânsız; nitekim bir dosyanın v6/v7'de bile karşılığı olmadığı için kurtarması zor oldu. → **Git zorunlu.** Her sürüm etiketlenmeli.
- **Sessiz hata (silent failure).** Sözdizimi hatalı bir `<script>` yüklenemiyor, ilgili fonksiyonlar tanımsız kalıyor ama uygulama "çalışıyormuş gibi" görünüyor. Kullanıcı yanlış/eksik sonuç alabilir ve fark etmez. → Global hata yakalama, "modül yüklenemedi" uyarıları, sağlık kontrolü (health-check) gerekli.
- **Otomatik test yok.** Hesap motorunun (ısı kaybı/kazancı) doğruluğunu koruyan hiçbir regresyon testi yok. Küçük bir düzenleme sessizce sonuçları bozabilir. → Bilinen mahaller için birim/altın-değer (golden-value) testleri.
- **Girdi doğrulaması zayıf.** Excel içe aktarımında bozuk/eksik satır, yanlış birim, boş U-değeri gibi durumlar için savunma yok (`+row.alan||0` tarzı sessiz varsayılanlar sonucu bozar ama uyarmaz). → Şema doğrulama + kullanıcıya "şu satırda şu alan eksik" geri bildirimi.

### 1.2 Mimari ve kod kalitesi

- **Devasa tek dosyalar.** `index.html` binlerce satır, eski `v7` tek dosyada ~10.700 satır/615 KB. Bakımı, test edilmesi ve ekip çalışması çok zor. → Modüler yapı (ES modülleri/bundler), bileşen ayrımı.
- **Global değişken bağımlılığı.** `globalResults`, `globalParams`, `LANG`, `t` gibi global durum her yere yayılmış. Bir modül diğerinin global'ini bekliyor; kırılgan. → Açık veri akışı, durum yönetimi.
- **Kopuk API sözleşmeleri.** Örn. `FanSelect.select()` `{Q_m3h, SP_Pa, results[]}` döndürüyor ama arayüz `res.tip / res.motor_kW / res.verim` bekliyor — modül ile çağrı yeri uyumsuz. Bu tür sessiz uyumsuzluklar üründe yanlış çıktı demektir.
- **Kod tekrarı ve "büyülü sayılar".** Katsayılar, standart değerleri kodun içine gömülü ve birden çok yerde tekrar ediyor. → Tek kaynak (config/veri tablosu).

### 1.3 Hesap doğruluğu, izlenebilirlik ve standart uyumu

- **Hesap izlenebilirliği (audit trail) yok.** Ticari HVAC yazılımının en kritik satış argümanı: "bu sonuç şu formül + şu standart + şu katsayı ile çıktı." Şu an ara adımlar kullanıcıya şeffaf değil. → Her mahal için formül dökümü/denklem izi.
- **Standart sürümü ve referansı belirsiz.** EN 12831, VDI 2078, ASHRAE, TS 825 — hangi yıl/sürüm, hangi tablo? Ticari üründe bu belgelenmeli ve raporda kaynak gösterilmeli.
- **Doğrulama/sertifikasyon.** Rakip ürünler (Carrier HAP, DesignBuilder, HAP vb.) sonuçlarını referans vakalarla doğrulamış. → ASHRAE 140 benzeri kıyas/doğrulama seti.
- **Isı köprüleri, gölgeleme, termal kütle** gibi ileri etkiler basitleştirilmiş; ticari iddia için sınırların açıkça yazılması gerekir.

### 1.4 Güvenlik

- **İstemci tarafında API anahtarı.** Groq/LLM entegrasyonu tarayıcıda çalışıyorsa anahtar sızma riski var; `.env` dosyası repoda görünüyor. → Anahtarlar sunucu tarafında, proxy üzerinden.
- **Lisanslama/DRM yok.** Ticari ürün için kopyalanmaya karşı koruma, lisans anahtarı/aktivasyon, kullanıcı hesapları gerekli.
- **Girdi kaçışı (sanitizasyon).** Kullanıcı verisi doğrudan HTML string'lerine gömülüyor (`innerHTML`); XSS ve bozuk çıktı riski. → Kaçış/şablonlama.

### 1.5 Çıktı ve entegrasyon

- **PDF üretimi kırılgan.** `window.open` + `window.print` yöntemi pop-up engelleyiciye takılıyor ve tarayıcıya göre değişiyor. → Gerçek bir PDF motoru (sunucu tarafı veya headless).
- **Rapor tutarlılığı.** Excel/PDF/RTF çıktıları arasında alan/etiket tutarlılığı garanti değil; ortak bir "rapor veri modeli" yok.
- **Dışa aktarım eksikleri:** DXF/DWG, IFC/BIM, proje dosyası paylaşımı, bulut kaydı.

### 1.6 Ticari altyapı (ürünleşme)

- Kullanıcı hesapları, rol/yetki, çok kullanıcılı proje paylaşımı.
- Otomatik güncelleme, sürüm notları, geri bildirim/hata bildirimi.
- Telemetri/loglama (çökme raporları) — gizlilik dengesiyle.
- Dokümantasyon, örnek projeler, eğitim içerikleri.
- Yedekleme/otomatik kayıt (autosave) ve proje geçmişi.
- Performans: büyük projelerde (yüzlerce mahal) hız ve bellek testi.
- Erişilebilirlik (klavye, kontrast) ve tarayıcı uyumluluğu matrisi.

---

## 2. Modül Önerileri (30 öneri)

Mevcut güçlü temel (mahal bazlı ısıtma/soğutma yükü + HAP tarzı rapor) üzerine, HVAC tasarım iş akışını uçtan uca kapsayacak modüller:

**Yük ve konfor**
1. **İnteraktif psikrometrik diyagram** — nokta/işlem çizimi, karışım, ısıtma/soğutma/nemlendirme süreçleri.
2. **Yıllık enerji simülasyonu (8760 saat)** — bin/TMY hava verisiyle saatlik yük ve tüketim.
3. **Konfor analizi (PMV/PPD, EN 16798 / VDI 6020)** — iç hava kalitesi ve konfor puanı.
4. **Detaylı güneş kazancı & gölgeleme** — SHGC, cephe yönü, komşu bina/çıkma gölgesi.
5. **Termal kütle / dinamik yük** — yapı ataletiyle tepe yükü kaydırma.

**Hava tarafı**
6. **Tam kanal ağı tasarımı** — statik geri kazanım, eşit sürtünme, basınç dengeleme.
7. **AHU (klima santrali) seçimi** — psikrometrik süreç + bileşen boyutlandırma.
8. **Isı geri kazanım (HRV/ERV) seçimi ve verim** — mevcut altyapı genişletilir.
9. **Difüzör/menfez seçimi** — atış mesafesi, gürültü (NC), hava dağıtımı.
10. **Duman/basınçlandırma (yangın)** — merdiven/yangın kaçış basınçlandırma.
11. **Mutfak egzozu & taze hava dengesi.**

**Su tarafı**
12. **Hidronik boru boyutlandırma** — Darcy-Weisbach, hız/basınç limitleri.
13. **Pompa seçimi & sistem eğrisi** — çalışma noktası, VFD, enerji.
14. **Soğutma grubu + kazan santral boyutlandırma** (mevcut chiller modülü genişletilir).
15. **Soğutma kulesi / kuru soğutucu seçimi.**
16. **Genleşme tankı, kolektör, denge kabı hesapları.**

**Sistem tipi özel**
17. **VRF/VRV sistem tasarımı** — soğutucu boru boyutlandırma, branşman, eş zamanlılık.
18. **Yerden ısıtma/soğutma tam tasarımı** (mevcut UFH genişletilir; LISP çıktısıyla entegre).
19. **Radyant tavan/panel** tasarımı.
20. **Havuz nem alma** yükü ve ekipman seçimi.
21. **Veri merkezi soğutma** (raf bazlı, sıcak/soğuk koridor).
22. **Temiz oda / farmasötik** (hava değişimi, filtre sınıfı, basınç kademesi).

**Uyum, maliyet, çıktı**
23. **Havalandırma uyum kontrolü** — ASHRAE 62.1 / EN 16798 otomatik doğrulama.
24. **TS 825 / enerji kimlik belgesi** tam raporu (mevcut TS825Check genişletilir).
25. **Yaşam döngüsü maliyeti (LCC) & ROI** — ilk yatırım + işletme.
26. **Karbon ayak izi / emisyon** raporu.
27. **Ekipman listesi (BOQ) & maliyet tahmini** — otomatik metraj.
28. **Akustik modülü** — oda NC, kanal susturma, ekipman ses gücü (mevcut fan gürültüsü genişletilir).
29. **Kontrol/otomasyon (BMS) nokta listesi & sekans şablonları.**
30. **CAD/BIM köprüsü** — DXF/IFC dışa aktarımı, AutoCAD LISP entegrasyonu (mevcut LISP klasörüyle).

> Öncelik önerisi: önce ürünü sağlamlaştıran çekirdek (kanal ağı, boru+pompa, AHU, psikrometrik diyagram, uyum kontrolü), sonra niş modüller (veri merkezi, temiz oda, havuz).

---

## 3. Arayüz Değerlendirmesi ve "Satın alır mıydım?"

### Güçlü yanlar
- **Kapsam gerçekten iyi.** Mahal bazlı yük + çok sayıda mühendislik modülü + HAP tarzı çıktı, tek üründe. Bu, birçok mühendisin ihtiyaç duyduğu bir birleşim.
- **HAP tarzı rapor tanıdık.** Sektör Carrier HAP çıktısını bilir; bu format güven verir ve öğrenme eğrisini düşürür.
- **İki dillilik (TR/EN)** ve Excel içe/dışa aktarımı pratik.
- **AI asistanı** doğru kurgulanırsa gerçek bir farklılaştırıcı olabilir.

### İyileştirme gereken yanlar (arayüz)
- **Yoğunluk ve hiyerarşi.** Çok sayıda parametre/sekme aynı anda; yeni kullanıcı için bunaltıcı. → Aşamalı açığa çıkarma (progressive disclosure), "sihirbaz" akışı, akıllı varsayılanlar.
- **Geri bildirim eksikliği.** Hesap çalışırken/başarısızken durum, doğrulama uyarıları, "şu alan eksik" ipuçları zayıf. → Satır içi doğrulama ve net durum göstergeleri.
- **Güven ve şeffaflık.** Sonuç sayılarının nasıl çıktığını gösteren "detayı gör/formül izi" olmalı; mühendis sayıya körlemesine güvenmez.
- **Görsel dil.** Modern, sade, tutarlı bir tasarım sistemi (tipografi, boşluk, renk kodları) ürünü "ciddi/ticari" gösterir. Şu an fonksiyon önde, cila arkada.
- **Onboarding.** İlk açılışta örnek proje, kısa tur, şablonlar.
- **Hata dayanıklılığı hissi.** Kullanıcı çökme/kayıp yaşamamalı: otomatik kayıt, geri al/yinele, proje geçmişi.

### Satın alır mıydım? — dürüst yanıt
Bir HVAC mühendisi gözüyle: **bugünkü haliyle "evet, ama henüz değil."** Kapsam ve HAP tarzı çıktı beni cezbederdi; bir aracın onlarca hesabı tek yerde toplaması ciddi zaman kazandırır. Ancak satın almadan önce şu üçünü şart koşardım:

1. **Güvenilirlik kanıtı** — sonuçların referans vakalarla doğrulanmış olması ve yazılımın veri kaybı/sessiz hata yaşatmaması. (Bu oturumda gördüğümüz bozuk-dosya durumu tam da bu güveni zedeleyen şey.)
2. **İzlenebilirlik** — her sonucun formül/standart dayanağını gösterebilmesi (denetim ve müşteriye savunma için).
3. **Destek ve süreklilik** — güncelleme, dokümantasyon, hata giderme sözü.

Bunlar sağlandığında, özellikle Türkiye/EN pazarında uygun fiyatlı, TS 825 + EN/ASHRAE'yi bir arada sunan, HAP tarzı çıktı veren bir araç için **net bir alıcı kitlesi var** ve ben de o kitledeyim. Yani ürünün "ne" yaptığı beni ikna ediyor; "ne kadar güvenilir yaptığı" henüz kanıtlanmalı. Ticarileşme yol haritasının 1 numaralı maddesi bu yüzden yeni modül değil, **sağlamlaştırma (güvenilirlik + izlenebilirlik + test)** olmalı.

---

### Özet öncelik sırası
1. **Sağlamlaştırma:** git, testler, hata yakalama, girdi doğrulama, otomatik kayıt.
2. **İzlenebilirlik & standart belgeleme:** formül izi, kaynak gösterimi, doğrulama seti.
3. **Arayüz cilası & onboarding:** sihirbaz akışı, satır içi doğrulama, tasarım sistemi.
4. **Çekirdek modül genişletme:** kanal ağı, boru+pompa, AHU, psikrometrik diyagram, uyum kontrolü.
5. **Ticari altyapı:** hesap/lisans, bulut kayıt, güncelleme, destek.
6. **Niş modüller & entegrasyon:** VRF, veri merkezi, BIM/DXF köprüsü.
