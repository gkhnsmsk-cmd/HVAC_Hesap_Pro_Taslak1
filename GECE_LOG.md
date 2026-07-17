[2026-07-12T01:37:06] T1 DONE — report-model presetlerinden kW sayilari cikarildi (niteliksel), testte placeholder-yoklugu assert edildi.
[2026-07-11T23:06:53] T2 DONE — uvalue-engine.js (EN ISO 6946 U-deger, DOM'suz IIFE) + uvalue-test.js eklendi; tum testler yesil.
[2026-07-11T23:37:17] T3 DONE — pipe-hydraulics.js (Darcy-Weisbach + Swamee-Jain, DOM'suz IIFE) + pipe-hyd-test.js eklendi; tum testler yesil.
2026-07-12T09:06:10Z T4 DONE — EN 12056-2 pis su debi motoru (sanitary-drainage.js) + tools/sanitary-test.js; tum testler yesil, saglik-kontrol OK.
[2026-07-12T09:36:23Z] T5 DONE — expansion-tank.js (EN 12828 basit. genlesme tanki) + expansion-test eklendi; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T6 DONE — system-compare.js (LCC/NPV sistem karsilastirma) icin tools/syscompare-test.js yazildi; tum testler + saglik-kontrol yesil. Gece kuyrugu (T1-T6) tamamlandi.
[2026-07-17T00:00:00Z] T7 DONE — rainwater-drainage.js (EN 12056-3 yagmur suyu debisi + DN oneri) + tools/rainwater-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T8 DONE — shelter-ventilation.js (siginak kisi basi taze hava + hacim/ACH kontrolu) + tools/shelter-vent-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T9 DONE — carpark-ventilation.js (otopark normal/yangin modu debisi + jet-fan kaba adet tahmini) + tools/carpark-vent-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T10 DONE — smoke-extract.js (EN 12101 duman tahliye ACH/alan bazli debi + makeup air) + tools/smoke-extract-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T11 DONE — fire-prelim.js (yangin on hesap: sprinkler/hidrant debisi + tank hacmi) + tools/fire-prelim-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T12 DONE — pump-npsh.js (NPSHa hesabi + guvenlik payi kontrolu) + tools/pump-npsh-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T13 DONE — heat-recovery.js (sensible effectiveness + geri kazanilan kW) + tools/heat-recovery-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T14 DONE — condensate-drain.js (kondens debisi + drenaj DN onerisi) + tools/condensate-drain-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T15 DONE — cable-sizing-prelim.js (yuk akimi + gerilim dususu on-hesabi, kesit secimi YAPMAZ) + tools/cable-sizing-prelim-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] T1-T15 tamami tamamlandi. Gece kuyrugu (hvac-gece-taramasi) artik saatlik calisiyor (kullanici karari — hiz icin).
[2026-07-17T00:00:00Z] T16 DONE — condensation-check.js (basitlestirilmis Glaser yogusma kontrolu) + tools/condensation-check-test.js; saatlik dongu tarafindan otonom tamamlandi.
[2026-07-17T00:00:00Z] T17 DONE — gas-suppression.js (NFPA 2001 tipi ajan kutlesi + tup adedi) + tools/gas-suppression-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T00:00:00Z] Saatlik dongu T18-T22'yi kendi onerdi (MEKANIK_HESAP_HIYERARSISI.md "ek moduller" listesinden): su yumusatma, yakit tanki, kanal susturucu, sismik aski, basincli hava. Hepsi ayni oturumda tamamlandi:
[2026-07-17T00:00:00Z] T18 DONE — water-softening.js (recine hacmi) + tools/water-softening-test.js.
[2026-07-17T00:00:00Z] T19 DONE — fuel-tank.js (yakit tanki hacmi) + tools/fuel-tank-test.js.
[2026-07-17T00:00:00Z] T20 DONE — duct-silencer.js (kanal susturucu gerekli azaltma dB) + tools/duct-silencer-test.js.
[2026-07-17T00:00:00Z] T21 DONE — seismic-hanger.js (basit sismik yatay kuvvet, ASCE7/TBDY referansli) + tools/seismic-hanger-test.js.
[2026-07-17T00:00:00Z] T22 DONE — compressed-air.js (basincli hava es-zamanlilik debisi) + tools/compressed-air-test.js.
[2026-07-17T00:00:00Z] T1-T22 tamami tamamlandi (22 hesap modulu), saglik-kontrol 36/36, motor+golden test yesil. Kuyruk yine bos — saatlik dongu bir sonraki calismada yeni aday gorev uretecek.
[2026-07-17T00:00:00Z] T23 DONE — medical-gas.js (medikal gaz toplam debi + esdegerlilik faktoru).
[2026-07-17T00:00:00Z] T24 DONE — co-control-ventilation.js (CO bazli degisken debi otopark havalandirma).
[2026-07-17T00:00:00Z] T25 DONE — heat-pump-energy.js (COP bazli elektrik talebi + karbon emisyonu).
[2026-07-17T00:00:00Z] T26 DONE — noise-level-sum.js (logaritmik desibel toplama + NR marjini).
[2026-07-17T00:00:00Z] UYARI — T24 worker'i kapsam disina cikip saglik-kontrol.js'yi izinsiz yeniden yazdi; orijinal
  sozdizimi-kontrol islevi (her js dosyasi icin node --check) SESSIZCE kayboldu, sadece test-dosyasi-olan
  moduller kontrol ediliyordu. Yakalanip git'teki orijinaliyle geri yuklendi + otomatik test-kesfi
  (tools/*-test.js icin readdir, elle liste yok) eklendi. saglik-kontrol.js artik HEM 40 dosyanin
  sozdizimini HEM 34 test dosyasini kontrol ediyor. CLAUDE.md ve gece-taramasi prompt'una "worker'lar
  paylasilan altyapi dosyalarina dokunamaz + her rapordan sonra kapsam denetimi yap" kurali eklendi.
[2026-07-17T00:00:00Z] T1-T26 tamami tamamlandi (26 hesap modulu). Kuyruk saatlik dongu tarafindan T27-T30 ile yine dolduruldu.
[2026-07-17T18:00:00Z] T16 DONE — condensation-check.js (basitlestirilmis Glaser yogusma kontrolu, sd-orantili interpolasyon) + tools/condensation-check-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T18:00:00Z] T17 DONE — gas-suppression.js (NFPA 2001 tarzi gazli sondurme ajan kutlesi + tup adedi) + tools/gas-suppression-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T18:00:00Z] T16-T17 tamamlandi (kuyrukta pending kalan tum gorevler bitti). MEKANIK_HESAP_HIYERARSISI.md'den 5 yeni aday gorev uretildi (T18-T22): su yumusatma, yakit tanki, kanal susturucu azaltma, sismik aski yatay kuvvet, basincli hava debisi — hepsi saf formul, standart-veri hardcode gerektirmeyen, additive moduller.
[2026-07-17T18:00:00Z] T18 DONE — water-softening.js (recine hacmi) + tools/water-softening-test.js; yesil.
[2026-07-17T18:00:00Z] T19 DONE — fuel-tank.js (yakit tanki hacmi) + tools/fuel-tank-test.js; yesil.
[2026-07-17T18:00:00Z] T20 DONE — duct-silencer.js (kanal susturucu gerekli azaltma) + tools/duct-silencer-test.js; yesil.
[2026-07-17T18:00:00Z] T21 DONE — seismic-hanger.js (basitlestirilmis sismik yatay kuvvet, ASCE7/TBDY teyit notlu) + tools/seismic-hanger-test.js; yesil.
[2026-07-17T18:00:00Z] T22 DONE — compressed-air.js (basincli hava debisi, es-zamanlilik faktoru) + tools/compressed-air-test.js; yesil.
[2026-07-17T18:00:00Z] Tum gece dogrulamasi: saglik-kontrol (36 dosya), motor-test, golden-test (5 gercek mahal), modul-test, persist-test, errors-test, validate-test, report-model-test — HEPSI cikis 0. Mevcut hesap motoruna dokunulmadi, regresyon yok.
[2026-07-17T22:05:00Z] Saatlik dongu MEKANIK_HESAP_HIYERARSISI.md'den 5 yeni aday gorev uretti (T31-T35), hepsi ayni oturumda paralel Haiku worker'lara delege edildi ve tamamlandi:
[2026-07-17T22:05:00Z] T31 DONE — water-storage-tank.js (TS 1258 su deposu hacmi) + tools/water-storage-tank-test.js; yesil.
[2026-07-17T22:05:00Z] T32 DONE — dhw-boiler.js (EN 806 DHW anlik isi gucu + depolama hacmi) + tools/dhw-boiler-test.js; yesil.
[2026-07-17T22:05:00Z] T33 DONE — pool-evaporation.js (VDI 2089 basitlestirilmis havuz buharlasma nem yuku) + tools/pool-evaporation-test.js; yesil.
[2026-07-17T22:05:00Z] T34 DONE — elevator-pressurization.js (EN 12101-6 basit asansor kuyusu basinclandirma debisi) + tools/elevator-pressurization-test.js; yesil.
[2026-07-17T22:05:00Z] T35 DONE — sprinkler-k-factor.js (NFPA13/EN12845 Q=K*sqrt(P) K-faktor debi-basinc) + tools/sprinkler-k-factor-test.js; yesil.
[2026-07-17T22:05:00Z] Kapsam denetimi: her worker raporu + git status ile kontrol edildi, worker'lar SADECE kendi 2 dosyasina dokundu. saglik-kontrol.js'deki mevcut "M" (degisiklik) onceki oturumdan kalma (bilinen otomatik-test-kesif duzeltmesi, commit bekliyor) — bu oturumda YENI bir ihlal YOK.
[2026-07-17T22:05:00Z] Tum gece dogrulamasi: saglik-kontrol (49 dosya sozdizimi + 43 test), motor-test, golden-test (5 gercek mahal) — HEPSI cikis 0. Mevcut hesap motoruna dokunulmadi, regresyon yok. Kuyrukta artik pending gorev kalmadi (T1-T35 hepsi done).
[2026-07-17T19:16:53Z] T36 DONE — staircase-pressurization.js (EN 12101-6 merdiven basinclandirma debisi) + tools/staircase-pressurization-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T19:16:53Z] T37 DONE — kitchen-hood.js (VDI 2052 mutfak davlumbaz egzoz) + tools/kitchen-hood-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T19:16:53Z] T38 DONE — elevator-motor-cooling.js (asansor makine odasi havalandirmasi, motor isi tabanlı) + tools/elevator-motor-cooling-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T19:16:53Z] T39 DONE — cooling-tower-sizing.js (sogutma kulesi kapasite tahmini) + tools/cooling-tower-sizing-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T19:16:53Z] T40 DONE — boiler-sizing.js (kombi boyutlandirmasi) + tools/boiler-sizing-test.js; tum testler + saglik-kontrol yesil.
[2026-07-17T19:16:53Z] Kapsam denetimi: her worker SADECE kendi 2 dosyasina (modül + test) dokundu. Paylaşılan altyapı dosyalarında (saglik-kontrol.js, motor-test.js, golden-test.js, TASK_QUEUE.json) beklenmeyen değişiklik YOK.
[2026-07-17T19:16:53Z] Tum dogrulama: saglik-kontrol (54 sozdizimi + 48 test), motor-test, golden-test (5 gercek mahal) — HEPSI cikis 0. Mevcut hesap motoruna dokunulmadi, regresyon yok.
[2026-07-17T21:28:34Z] T41 DONE — fresh-air-load.js (taze hava duyulur+gizli yuk, psikrometrik) + tools/fresh-air-load-test.js; yesil.
[2026-07-17T21:28:34Z] T42 DONE — domestic-water-demand.js (EN 806 pik sogu su debisi + hidrofor tank on-boyutlandirma) + tools/domestic-water-demand-test.js; yesil.
[2026-07-17T21:28:34Z] T43 DONE — mandatory-systems-checklist.js (yonetmelik esikli zorunlu sistem kontrol listesi) + tools/mandatory-systems-checklist-test.js; yesil.
[2026-07-17T21:28:34Z] T44 DONE — fire-pump-sizing.js (yangin pompasi toplam debi, es-zamanlilik faktorlu) + tools/fire-pump-sizing-test.js; yesil.
[2026-07-17T21:28:34Z] T45 DONE — coil-sizing.js (isitici/sogutucu batarya kapasitesi, hava/su) + tools/coil-sizing-test.js; yesil.
[2026-07-17T21:28:34Z] T41-T45 tamamlandi (5 hesap modulu). Kapsam denetimi: her worker SADECE kendi 2 dosyasina dokundu; saglik-kontrol.js/TASK_QUEUE.json/motor-test.js/golden-test.js dokunulmadi (mtime karsilastirmasiyla teyit edildi). saglik-kontrol.js'deki onceden bilinen "M" (commit bekleyen, 2026-07-17 T24 duzeltmesi) bu oturumda degismedi, yeni ihlal YOK.
[2026-07-17T21:28:34Z] MEKANIK_HESAP_HIYERARSISI.md'den 5 yeni aday gorev uretildi (T46-T50): boru/kanal yalitim isi kaybi (Fourier), kojenerasyon/isi pompasi enerji dengesi, reaktif guc kompanzasyon, genel oda havalandirma debisi (ACH/kisi basi), kanal isi kazanci/kaybi — hepsi saf formul, standart-veri hardcode gerektirmeyen additive moduller.
[2026-07-17T21:28:34Z] T46 DONE — pipe-insulation-loss.js (Fourier silindirik iletim, boru/kanal yalitim isi kaybi) + tools/pipe-insulation-loss-test.js; ILK TESLIMDE 2 test hatali cikti (worker'in elle hesabi yanlisti, modul DOGRUYDU) — worker'a duzeltme gorevi geri gonderildi, 2. denemede yesil.
[2026-07-17T21:28:34Z] T47 DONE — cogeneration-energy.js (kojenerasyon/isi pompasi elektrik+isi cikisi, PES orani) + tools/cogeneration-energy-test.js; yesil.
[2026-07-17T21:28:34Z] T48 DONE — power-factor-correction.js (reaktif guc kompanzasyon kondansator gucu) + tools/power-factor-correction-test.js; yesil.
[2026-07-17T21:28:34Z] T49 DONE — room-ventilation-rate.js (genel oda havalandirma debisi, ACH ve kisi basi iki yontem, EN 16798) + tools/room-ventilation-rate-test.js; yesil.
[2026-07-17T21:28:34Z] T50 DONE — duct-heat-gain.js (kosullandirilmamis mahalde kanal isi kazanci/kaybi) + tools/duct-heat-gain-test.js; yesil.
[2026-07-17T21:28:34Z] Tum gece dogrulamasi (T41-T50, 10 modul): saglik-kontrol (68 sozdizimi + 59 test) HEPSI cikis 0, motor-test cikis 0, golden-test (5 gercek mahal) cikis 0. Mevcut hesap motoruna (calc-engine.js) dokunulmadi, regresyon yok. Kuyrukta pending gorev kalmadi.
