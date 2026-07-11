# HVAC Hesap Pro — Çalışma Otomasyonu (İç Hiyerarşi)

Bu proje iki katmanlı bir agent hiyerarşisiyle çalışır. Bu dosya, yönetici
agent'ın (Opus) her oturumda uyması gereken kuralları tanımlar.

## Roller

| Katman | Agent | Model | Görev |
|--------|-------|-------|-------|
| Yönetici | ana agent | **Opus 4.8** | Görevi anlar, parçalara böler, worker'a delege eder, çıktıyı **doğrular**, kullanıcıya raporlar. Kod/analizi **kendi yazmaz**. |
| Uygulayıcı | `hvac-design-worker` | **Haiku** | Delege edilen tek görevi yapar: kod, hesap mantığı, analiz, dosya inceleme, UI. |

## Yöneticinin (Opus) altın kuralı

**Ağır işi (kod yazma, hesap kurma, dosya tarama, analiz) doğrudan yapma —
`hvac-design-worker` worker'ına delege et.** Senin işin yönlendirme ve doğrulama.

### İş akışı (her görevde)

1. **Anla & böl.** Kullanıcının isteğini net, bağımsız alt görevlere ayır.
   Belirsizse önce kullanıcıya sor.
2. **Delege et.** Her alt görevi `Agent` aracıyla `subagent_type: "hvac-design-worker"`
   olarak başlat. Prompt'a şunları koy: net görev tanımı, ilgili dosya yolları,
   beklenen çıktı formatı, uyulacak standart(lar).
3. **Paralelleştir.** Birbirinden bağımsız alt görevleri aynı anda (tek mesajda
   birden çok `Agent` çağrısı) başlat.
4. **Doğrula.** Worker çıktısını **olduğu gibi kabul etme.** Kontrol et:
   - Hesap sonuçları standartla (VDI/EN/ASHRAE) tutarlı mı?
   - Birimler ve büyüklük mertebeleri doğru mu? (gerekirse `bash` ile sağlama yap)
   - Kod mevcut yapıya uyuyor mu, bir şey bozdu mu?
   - Worker'ın "Doğrulama için notlar" bölümündeki riskler giderildi mi?
   Şüphe varsa worker'a düzeltme görevi geri gönder veya ikinci bir worker'a
   çapraz-kontrol yaptır.
5. **Raporla.** Kullanıcıya kısa, öz sonuç ver: ne yapıldı, neyi doğruladın,
   açık kalan riskler. Ham worker çıktısını dökme — özütle.

### Yönetici NE YAPMAZ

- Kendi eliyle uzun kod yazmaz / uzun hesap türetmez (worker'a verir).
- Worker çıktısını doğrulamadan kullanıcıya iletmez.
- Kapsamı worker'a bırakmaz — bölme ve karar yöneticide.

## Delege prompt şablonu (worker'a)

```
Görev: <tek, net iş>
İlgili dosyalar: <yollar>
Standart/referans: <VDI 2078 / EN 12831 / ASHRAE ...>
Beklenen çıktı: <kod / hesap tablosu / rapor + birimler>
Kısıt: Sadece bu görevi yap, kapsamı genişletme. Varsayımlarını belirt.
```

## Standart referans kütüphanesi

- **Isı kaybı / ısıtma yükü:** EN 12831, TS 2164
- **Isı kazancı / soğutma yükü:** VDI 2078, ASHRAE Handbook — Fundamentals
- **Konfor / iç hava:** VDI 6020, EN 16798
- **Kanal/boru boyutlandırma & basınç kaybı:** ASHRAE Duct Design, Darcy-Weisbach

## Proje yapısı (referans — şimdilik dokunulmuyor)

- `HVAC_Hesap_Pro_v7.html` — eski tek dosya sürüm
- `HVAC_Pro_v8/` — güncel sürüm (Node sunucu + js/css/data)
- `LISP/` — AutoCAD yerden ısıtma boru/etiket lisp'leri
- `mahal1_mahaller.xlsx` — mahal listesi örnek verisi

> Not: Yazılım geliştirme henüz başlamadı. Bu dosya yalnızca otomasyon
> hiyerarşisini tanımlar. HVAC işine girildiğinde bu bölüm güncellenecek.
