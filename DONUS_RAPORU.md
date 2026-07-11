# Dönüş Raporu — Sen Yokken Yapılanlar

Merhaba Gökhan. Fable önderliğinde, tarayıcı QA'sı gerektirmeyen güvenli işleri yaptım. **Tüm 7 test yeşil**, motora dokunulmadı, her şey eklemeli/geri-alınabilir.

## Yapılanlar
1. **Golden test genişletildi (5 gerçek mahal).** Senin `HVAC_MTH_PRJ_2026-07-11_EN` raporundaki doğrulanmış değerler (Entrance Hall, Electrical Room, Women's Locker, Deep Freezer, Cooking Area) motora kilitlendi — çatı/döşeme/duvar transmisyonu + rüzgâr ×1.00. Artık biri motoru bozarsa 5 gerçek mahalde anında yakalanır.
2. **Modül denetimi + gizli hata düzeltmeleri.** Tüm mühendislik modüllerinin canlı UI çağrılarını denetledim. FanSelect ve PressureLoss'ta sonuçlar sessizce '-' görünüyordu (alan adı uyumsuzluğu) → düzeltildi. ChillerSelect, Psychro, EnergyEstimate temiz çıktı. Hepsi modül testine kilitlendi.
3. **DuctSizing UI'ye bağlandı.** "Pipe & Duct" aracına Kanal Boyutlandırma bölümü eklendi (Ø std çap, eşdeğer dikdörtgen, hız, Reynolds).

## Sen dönünce yapman gerekenler
1. **Commit** (GitHub Desktop): tüm bu batch'i tek commit'le kilitle. Özet öneri:
   `Golden 5 mahal + modül denetimi (FanSelect/PressureLoss düzeltme) + DuctSizing UI`
2. **Tarayıcı testi** (benim yapamadığım QA):
   - Sağ alt **Pipe & Duct** → alttaki **Kanal Boyutlandırma** → *Size Duct* → sonuç geliyor mu.
   - **Chiller & Fan** → Fan sonucunda artık Tip/Motor/Verim dolu mu (önce '-' idi).
   - **Basınç Kaybı** → Lineer/Toplam Basınç Kaybı ve Kütlesel Debi dolu mu.
3. **Radikal UI kararları** (senin onayın gerekiyor):
   - **Psikrometrik SVG diyagram** — Fable'ın sıradaki paketi; görsel olduğu için önce sana önizleme göstereceğim.
   - **UFHCalc (yerden ısıtma)** — mevcut 4 araca sığmıyor; yeni bir tool butonu/yeri gerekiyor (nereye koyalım?).

## Testleri çalıştırma
Klasördeki `.bat`'lara çift tıkla: `Saglik-Kontrol.bat`, `Motor-Test.bat`, `Golden-Test.bat`, `Modul-Test.bat`. Hepsi yeşil olmalı.

Hazır olduğunda "devam" de; psikrometrik diyagram önizlemesiyle sürerim.
