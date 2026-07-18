// HVAC Pro v8 — Ek Hesaplar (Additional Calculations) Modülleri Konfigürasyonu
// Her modülün UI'dan çağrılacak parametreleri ve işlevleri tanımlar
// JENERİK form üreticisi (ek-hesaplar-ui.js) bu config'i kullanır

(function () {
  'use strict';

  const modules = [
    {
      id: 'uvalue',
      category: 'heating-cooling',
      nameTr: 'U-Değeri Hesabı',
      windowName: 'UValue',
      mainFunc: 'uValue',
      description: 'Tabakali yapı bileşenlerinin ısı geçişkenlik katsayısı',
      params: [
        { name: 'katmanSayisi', label: 'Katman Sayısı', unit: 'adet', type: 'number', default: 2, min: 1, max: 10 },
        { name: 'kalinlik1', label: 'Katman 1 Kalınlığı', unit: 'm', type: 'number', default: 0.2, min: 0.01, step: 0.01 },
        { name: 'lambda1', label: 'Katman 1 İletkenlik', unit: 'W/mK', type: 'number', default: 0.5, min: 0.01, step: 0.01 }
      ]
    },
    {
      id: 'pipe-hydraulics',
      category: 'plumbing',
      nameTr: 'Boru Basınç Kaybı',
      windowName: 'PipeHydraulics',
      mainFunc: 'pressureDrop',
      description: 'Dolu kesitli boru sisteminde Darcy-Weisbach ile basınç kaybı',
      params: [
        { name: 'Q_m3h', label: 'Debi', unit: 'm³/h', type: 'number', default: 3.6, min: 0, step: 0.1 },
        { name: 'D_mm', label: 'Boru İç Çapı', unit: 'mm', type: 'number', default: 50, min: 10, max: 500, step: 5 },
        { name: 'L_m', label: 'Boru Uzunluğu', unit: 'm', type: 'number', default: 10, min: 1, step: 1 }
      ]
    },
    {
      id: 'sanitary-drainage',
      category: 'plumbing',
      nameTr: 'Kanalizasyon Debisi',
      windowName: 'SanitaryDrainage',
      mainFunc: 'wasteFlow',
      description: 'EN 12056-2: Atık su debisi hesabı (DU cinsinden)',
      params: [
        { name: 'sumDU', label: 'Toplam DU (Drain Unit)', unit: 'adet', type: 'number', default: 4, min: 1, max: 100 },
        { name: 'K', label: 'Debi Katsayısı', unit: 'adim', type: 'number', default: 0.5, min: 0.1, max: 1.0, step: 0.1 }
      ]
    },
    {
      id: 'expansion-tank',
      category: 'heating-cooling',
      nameTr: 'Genleşme Tankı Hacmi',
      windowName: 'ExpansionTank',
      mainFunc: 'nominalVolume',
      description: 'Isıtma sisteminde kapalı genleşme tankı nominal hacmi',
      params: [
        { name: 'V_sistem_L', label: 'Sistem Hacmi', unit: 'L', type: 'number', default: 1000, min: 100, max: 10000, step: 100 },
        { name: 'e', label: 'Genleşme Katsayısı', unit: 'frak', type: 'number', default: 0.0359, min: 0.01, max: 0.1, step: 0.01 },
        { name: 'Pmax_bar', label: 'Maks. Basınç', unit: 'bar', type: 'number', default: 3, min: 1, max: 10, step: 0.5 },
        { name: 'Pon_bar', label: 'Ön Basınç', unit: 'bar', type: 'number', default: 1, min: 0.5, max: 5, step: 0.5 }
      ]
    },
    {
      id: 'rainwater-drainage',
      category: 'plumbing',
      nameTr: 'Yağmur Suyu Drenajı',
      windowName: 'RainwaterDrainage',
      mainFunc: 'designFlow',
      description: 'Çatı yağmur suyu drenaj debisi (EN 12056-3)',
      params: [
        { name: 'area_m2', label: 'Çatı Alanı', unit: 'm²', type: 'number', default: 100, min: 10, max: 5000, step: 10 },
        { name: 'rainfall_mm_h', label: 'Tasarım Yağış Şiddeti', unit: 'mm/h', type: 'number', default: 150, min: 50, max: 300, step: 10 }
      ]
    },
    {
      id: 'shelter-ventilation',
      category: 'ventilation',
      nameTr: 'Barınak Taze Hava Hesabı',
      windowName: 'ShelterVentilation',
      mainFunc: 'freshAirRequired',
      description: 'Barınak/sığınak alanı için gerekli taze hava debisi',
      params: [
        { name: 'kisi_sayisi', label: 'Kişi Sayısı', unit: 'adet', type: 'number', default: 100, min: 1, max: 1000, step: 10 },
        { name: 'kisi_basi_m3h', label: 'Kişi Başına Taze Hava', unit: 'm³/h/kişi', type: 'number', default: 30, min: 10, max: 100, step: 5 }
      ]
    },
    {
      id: 'carpark-ventilation',
      category: 'ventilation',
      nameTr: 'Otopark Havalandırması',
      windowName: 'CarparkVentilation',
      mainFunc: 'normalVentFlow',
      description: 'Otopark normal/yangın modu havalandırma debisi (VDI 3757)',
      params: [
        { name: 'parkVeri_alanM2', label: 'Otopark Alanı', unit: 'm²', type: 'number', default: 2000, min: 100, max: 20000, step: 100 },
        { name: 'parkVeri_seviye', label: 'Kat Sayısı', unit: 'adet', type: 'number', default: 2, min: 1, max: 10, step: 1 }
      ]
    },
    {
      id: 'smoke-extract',
      category: 'ventilation',
      nameTr: 'Duman Tahliyesi',
      windowName: 'SmokeExtract',
      mainFunc: 'achExtract',
      description: 'Yangın tahliyesi için gerekli hava değişim sayısı (ACH)',
      params: [
        { name: 'volum_m3', label: 'Hacim', unit: 'm³', type: 'number', default: 500, min: 50, max: 5000, step: 50 },
        { name: 'tahliyeSure_dak', label: 'Tahliye Süresi', unit: 'dakika', type: 'number', default: 10, min: 2, max: 60, step: 1 }
      ]
    },
    {
      id: 'fire-prelim',
      category: 'fire',
      nameTr: 'Yangın Sistemi (Ön Hesap)',
      windowName: 'FirePrelim',
      mainFunc: 'sprinklerDemand',
      description: 'Sprinkler ve yangın hidrantı taleplerinin ön tahmini',
      params: [
        { name: 'bina_alanM2', label: 'Bina Alanı', unit: 'm²', type: 'number', default: 5000, min: 100, max: 50000, step: 100 },
        { name: 'riskSeviyesi', label: 'Risk Seviyesi (1-3)', unit: 'level', type: 'number', default: 1, min: 1, max: 3, step: 1 }
      ]
    },
    {
      id: 'pump-npsh',
      category: 'plumbing',
      nameTr: 'Pompa NPSH Kontrolü',
      windowName: 'PumpNPSH',
      mainFunc: 'npshAvailable',
      description: 'Pompa emme tarafında kullanılabilir net pozitif başlık',
      params: [
        { name: 'P_atm_kPa', label: 'Atmosfer Basıncı', unit: 'kPa', type: 'number', default: 101.325, min: 50, max: 150, step: 1 },
        { name: 'h_m', label: 'Yükseklik Farkı', unit: 'm', type: 'number', default: 2, min: -5, max: 10, step: 0.5 },
        { name: 'Pv_kPa', label: 'Buhar Basıncı (su için ~2.3)', unit: 'kPa', type: 'number', default: 2.3, min: 0.1, max: 10, step: 0.1 }
      ]
    },
    {
      id: 'heat-recovery',
      category: 'ventilation',
      nameTr: 'Isı Geri Kazanımı',
      windowName: 'HeatRecovery',
      mainFunc: 'recoveredHeat',
      description: 'Taze ve atık hava arasında isı geri kazanımı',
      params: [
        { name: 'Q_m3h', label: 'Hava Debisi', unit: 'm³/h', type: 'number', default: 3000, min: 100, max: 20000, step: 100 },
        { name: 'T_disi', label: 'Dış Hava Sıcaklığı', unit: '°C', type: 'number', default: -5, min: -30, max: 50, step: 1 },
        { name: 'T_ici', label: 'İç Hava Sıcaklığı', unit: '°C', type: 'number', default: 20, min: 10, max: 30, step: 1 },
        { name: 'eta', label: 'Geri Kazanım Verimi', unit: 'frak', type: 'number', default: 0.7, min: 0.4, max: 0.9, step: 0.05 }
      ]
    },
    {
      id: 'condensate-drain',
      category: 'ventilation',
      nameTr: 'Yoğunlaşma Drenajı',
      windowName: 'CondensateDrain',
      mainFunc: 'condensateFlow',
      description: 'Klima ve soğutma sistemi yoğunlaşma suyu debisi',
      params: [
        { name: 'Q_m3h', label: 'Soğutma Kapasitesi (m³/h hava)', unit: 'm³/h', type: 'number', default: 3000, min: 100, max: 20000, step: 100 },
        { name: 'dT_K', label: 'Sıcaklık Düşüşü', unit: 'K', type: 'number', default: 8, min: 3, max: 15, step: 1 },
        { name: 'RH_dis', label: 'Dış Bağıl Nem', unit: '%', type: 'number', default: 70, min: 30, max: 95, step: 5 }
      ]
    },
    {
      id: 'cable-sizing-prelim',
      category: 'other',
      nameTr: 'Kablo Tespit (Ön Tasarım)',
      windowName: 'CableSizingPrelim',
      mainFunc: 'loadCurrent',
      description: 'Elektrik motor/yük akımı ve genel hattı ön tahmini',
      params: [
        { name: 'P_kW', label: 'Güç', unit: 'kW', type: 'number', default: 10, min: 1, max: 100, step: 1 },
        { name: 'V_volt', label: 'Voltaj', unit: 'V', type: 'number', default: 400, min: 100, max: 600, step: 10 },
        { name: 'pf', label: 'Güç Faktörü', unit: 'adim', type: 'number', default: 0.9, min: 0.7, max: 1.0, step: 0.05 }
      ]
    },
    {
      id: 'condensation-check',
      category: 'heating-cooling',
      nameTr: 'Yoğunlaşma Kontrolü',
      windowName: 'CondensationCheck',
      mainFunc: 'vaporPressureProfile',
      description: 'Yapı elemanında buhar basıncı profili ve yoğunlaşma riski',
      params: [
        { name: 'T_ici', label: 'İç Hava Sıcaklığı', unit: '°C', type: 'number', default: 20, min: 10, max: 30, step: 1 },
        { name: 'RH_ici', label: 'İç Bağıl Nem', unit: '%', type: 'number', default: 50, min: 20, max: 80, step: 5 },
        { name: 'T_disi', label: 'Dış Hava Sıcaklığı', unit: '°C', type: 'number', default: -5, min: -30, max: 50, step: 1 }
      ]
    },
    {
      id: 'gas-suppression',
      category: 'fire',
      nameTr: 'Gaz Söndürme Sistemi',
      windowName: 'GasSuppression',
      mainFunc: 'agentMass',
      description: 'FM-200 veya CO₂ söndürme ajanı kütlesi hesabı',
      params: [
        { name: 'volum_m3', label: 'Oda Hacmi', unit: 'm³', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
        { name: 'ajanTuru', label: 'Ajan Türü (0=FM200, 1=CO2)', unit: 'enum', type: 'number', default: 0, min: 0, max: 1, step: 1 },
        { name: 'kat_yuksekligi', label: 'Kat Yüksekliği', unit: 'm', type: 'number', default: 3, min: 2, max: 10, step: 0.5 }
      ]
    },
    {
      id: 'water-softening',
      category: 'plumbing',
      nameTr: 'Su Yumuşatma Tesisi',
      windowName: 'WaterSoftening',
      mainFunc: 'resinVolume',
      description: 'Sertlik giderme için gereken çeşnileme katı hacmi',
      params: [
        { name: 'gunlukDebi_m3', label: 'Günlük Su Tüketimi', unit: 'm³', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'sertlik_ppm', label: 'Su Sertliği (CaCO3 eşdeğeri)', unit: 'ppm', type: 'number', default: 300, min: 50, max: 1000, step: 50 },
        { name: 'regeneration_gün', label: 'Regenerasyon Süresi', unit: 'gün', type: 'number', default: 3, min: 1, max: 10, step: 1 }
      ]
    },
    {
      id: 'fuel-tank',
      category: 'heating-cooling',
      nameTr: 'Yakıt Tankı Hacmi',
      windowName: 'FuelTank',
      mainFunc: 'tankVolume',
      description: 'Isıtma sistemi yakıt (mazot/gaz) tankı hacmi',
      params: [
        { name: 'Q_kW', label: 'Kazan Termal Güç', unit: 'kW', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'autonomi_gun', label: 'Otonom Gün Sayısı', unit: 'gün', type: 'number', default: 30, min: 1, max: 90, step: 5 },
        { name: 'yakitTuru', label: 'Yakıt Türü (0=Mazot, 1=Gaz)', unit: 'enum', type: 'number', default: 0, min: 0, max: 1, step: 1 }
      ]
    },
    {
      id: 'duct-silencer',
      category: 'ventilation',
      nameTr: 'Kanal Savcı (Silencer)',
      windowName: 'DuctSilencer',
      mainFunc: 'attenuationRequired',
      description: 'Fan gürültüsü için gereken kanal savcı zayıflatması',
      params: [
        { name: 'fan_noise_dBA', label: 'Fan Ses Basıncı', unit: 'dBA', type: 'number', default: 85, min: 70, max: 95, step: 1 },
        { name: 'hedef_dBA', label: 'Hedef Ses Basıncı', unit: 'dBA', type: 'number', default: 70, min: 50, max: 80, step: 1 },
        { name: 'frekans_Hz', label: 'Frekans (analiz için)', unit: 'Hz', type: 'number', default: 500, min: 100, max: 4000, step: 100 }
      ]
    },
    {
      id: 'seismic-hanger',
      category: 'other',
      nameTr: 'Deprem Kütlesi Taşıyıcısı',
      windowName: 'SeismicHanger',
      mainFunc: 'seismicLoad',
      description: 'Deprem bölgesi için borular/kanallar için taşıyıcı yükü',
      params: [
        { name: 'system_mass_kg', label: 'Sistem Kütlesi', unit: 'kg', type: 'number', default: 500, min: 50, max: 5000, step: 50 },
        { name: 'seismic_accel_g', label: 'Deprem İvmesi (g cinsinden)', unit: 'g', type: 'number', default: 0.3, min: 0.1, max: 1.0, step: 0.05 },
        { name: 'damping_factor', label: 'Sönüm Faktörü', unit: 'frak', type: 'number', default: 1.2, min: 0.8, max: 2.0, step: 0.1 }
      ]
    },
    {
      id: 'compressed-air',
      category: 'ventilation',
      nameTr: 'Sıkıştırılmış Hava Talep Tahmini',
      windowName: 'CompressedAir',
      mainFunc: 'airDemand',
      description: 'Klima/test ekipmanları için gerekli sıkıştırılmış hava debisi',
      params: [
        { name: 'sistem_sayisi', label: 'Sistem Sayısı', unit: 'adet', type: 'number', default: 5, min: 1, max: 50, step: 1 },
        { name: 'debi_per_sistem_m3h', label: 'Sistem Başına Debi', unit: 'm³/h', type: 'number', default: 10, min: 1, max: 50, step: 1 },
        { name: 'basinci_bar', label: 'İş Basıncı', unit: 'bar', type: 'number', default: 6, min: 3, max: 10, step: 0.5 }
      ]
    },
    {
      id: 'medical-gas',
      category: 'other',
      nameTr: 'Tıbbi Gaz Sistemi',
      windowName: 'MedicalGas',
      mainFunc: 'totalFlow',
      description: 'Hastane tıbbi gaz (O2, N2O, Vac) taleplerinin toplamı',
      params: [
        { name: 'yatakSayisi', label: 'Yatak Sayısı', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'dolulukOrani', label: 'Yatak Doluluğu', unit: 'frak', type: 'number', default: 0.75, min: 0.2, max: 1.0, step: 0.05 },
        { name: 'gazTuru', label: 'Gaz Türü (0=O2, 1=N2O, 2=Vac)', unit: 'enum', type: 'number', default: 0, min: 0, max: 2, step: 1 }
      ]
    },
    {
      id: 'co-control-ventilation',
      category: 'ventilation',
      nameTr: 'CO Kontrolü ile Havalandırma',
      windowName: 'COControlVentilation',
      mainFunc: 'coBasedFlow',
      description: 'Otopark CO seviyesine göre dinamik havalandırma debisi',
      params: [
        { name: 'volum_m3', label: 'Hacim', unit: 'm³', type: 'number', default: 5000, min: 500, max: 50000, step: 500 },
        { name: 'co_limit_ppm', label: 'CO Sınır (ppm)', unit: 'ppm', type: 'number', default: 100, min: 50, max: 300, step: 10 },
        { name: 'co_emissionRate', label: 'CO Üretim Hızı', unit: 'ppm/dak', type: 'number', default: 0.5, min: 0.1, max: 2.0, step: 0.1 }
      ]
    },
    {
      id: 'heat-pump-energy',
      category: 'heating-cooling',
      nameTr: 'Isı Pompası Enerji Tahmini',
      windowName: 'HeatPumpEnergy',
      mainFunc: 'electricityDemand',
      description: 'Isı pompası soğutma/ısıtma yüküne göre elektrik talebinin tahmini',
      params: [
        { name: 'Q_kW', label: 'Isıl Yük', unit: 'kW', type: 'number', default: 100, min: 10, max: 500, step: 10 },
        { name: 'cop', label: 'COP (Performans Katsayısı)', unit: 'adim', type: 'number', default: 3.0, min: 1.5, max: 5.0, step: 0.5 },
        { name: 'kapasite_orani', label: 'Kapasite Oranı', unit: 'frak', type: 'number', default: 0.7, min: 0.3, max: 1.0, step: 0.1 }
      ]
    },
    {
      id: 'noise-level-sum',
      category: 'other',
      nameTr: 'Sesler Toplamı (dB Toplama)',
      windowName: 'NoiseLevelSum',
      mainFunc: 'sumDecibels',
      description: 'Çeşitli ses kaynaklarının logaritmik toplamı',
      params: [
        { name: 'L1_dBA', label: 'Kaynak 1 Ses Basıncı', unit: 'dBA', type: 'number', default: 80, min: 50, max: 100, step: 1 },
        { name: 'L2_dBA', label: 'Kaynak 2 Ses Basıncı', unit: 'dBA', type: 'number', default: 75, min: 50, max: 100, step: 1 },
        { name: 'L3_dBA', label: 'Kaynak 3 Ses Basıncı', unit: 'dBA', type: 'number', default: 70, min: 50, max: 100, step: 1 }
      ]
    },
    {
      id: 'pipe-thermal-expansion',
      category: 'plumbing',
      nameTr: 'Boru Isıl Genleşmesi',
      windowName: 'PipeThermalExpansion',
      mainFunc: 'linearExpansion',
      description: 'Sıcaklık değişimine göre boru doğrusal genleşmesi',
      params: [
        { name: 'L_m', label: 'Boru Boyu', unit: 'm', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'dT_K', label: 'Sıcaklık Değişimi', unit: 'K', type: 'number', default: 50, min: 10, max: 100, step: 5 },
        { name: 'material', label: 'Malzeme (0=Çelik, 1=Bakır, 2=PVC)', unit: 'enum', type: 'number', default: 0, min: 0, max: 2, step: 1 }
      ]
    },
    {
      id: 'water-hammer',
      category: 'plumbing',
      nameTr: 'Su Çekici (Water Hammer)',
      windowName: 'WaterHammer',
      mainFunc: 'joukowskyPressureRise',
      description: 'Hızlı kapanış sırasında boru sisteminde basınç artışı (Joukowsky)',
      params: [
        { name: 'v_ms', label: 'Akış Hızı', unit: 'm/s', type: 'number', default: 2.0, min: 0.5, max: 5.0, step: 0.1 },
        { name: 'c_ms', label: 'Ses Hızı (suda ~1480)', unit: 'm/s', type: 'number', default: 1480, min: 1000, max: 2000, step: 50 },
        { name: 'kapanisZamani_ms', label: 'Kapanış Süresi', unit: 'ms', type: 'number', default: 100, min: 10, max: 1000, step: 10 }
      ]
    },
    {
      id: 'lmtd',
      category: 'heating-cooling',
      nameTr: 'LMTD (Logaritmik Ortalama Sıcaklık Farkı)',
      windowName: 'LMTD',
      mainFunc: 'lmtd',
      description: 'Isıl değiştirici tasarımı için LMTD ve gerekli alan hesabı',
      params: [
        { name: 'T1_in', label: 'Sıcak Giriş Sıcaklığı', unit: '°C', type: 'number', default: 90, min: 30, max: 150, step: 1 },
        { name: 'T1_out', label: 'Sıcak Çıkış Sıcaklığı', unit: '°C', type: 'number', default: 70, min: 30, max: 150, step: 1 },
        { name: 'T2_in', label: 'Soğuk Giriş Sıcaklığı', unit: '°C', type: 'number', default: 15, min: -5, max: 50, step: 1 },
        { name: 'T2_out', label: 'Soğuk Çıkış Sıcaklığı', unit: '°C', type: 'number', default: 30, min: -5, max: 50, step: 1 }
      ]
    },
    {
      id: 'affinity-laws',
      category: 'heating-cooling',
      nameTr: 'Pompa Benzerlik Kanunları',
      windowName: 'AffinityLaws',
      mainFunc: 'scaleBySpeed',
      description: 'Pompa/fan debi, yükseklik ve güç ölçekleme (benzerlik kanunları)',
      params: [
        { name: 'Q_nominal', label: 'Nominal Debi', unit: 'm³/h', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
        { name: 'n1', label: 'Nominal Hız', unit: 'rpm', type: 'number', default: 1500, min: 500, max: 3600, step: 100 },
        { name: 'n2', label: 'Yeni Hız', unit: 'rpm', type: 'number', default: 1200, min: 500, max: 3600, step: 100 }
      ]
    },
    {
      id: 'system-compare',
      category: 'other',
      nameTr: 'Sistem Ekonomik Karşılaştırması',
      windowName: 'SystemCompare',
      mainFunc: 'npv',
      description: 'İki sistem arasında Net Bugünkü Değer (NPV) ve geri ödeme süresi',
      params: [
        { name: 'capex_A', label: 'Sistem A Başlangıç Maliyeti', unit: 'EUR', type: 'number', default: 100000, min: 10000, max: 1000000, step: 10000 },
        { name: 'opex_A_yil', label: 'Sistem A Yıllık İşletme Maliyeti', unit: 'EUR/yıl', type: 'number', default: 5000, min: 1000, max: 50000, step: 1000 },
        { name: 'capex_B', label: 'Sistem B Başlangıç Maliyeti', unit: 'EUR', type: 'number', default: 80000, min: 10000, max: 1000000, step: 10000 },
        { name: 'opex_B_yil', label: 'Sistem B Yıllık İşletme Maliyeti', unit: 'EUR/yıl', type: 'number', default: 7000, min: 1000, max: 50000, step: 1000 }
      ]
    },
    {
      id: 'water-storage-tank',
      category: 'plumbing',
      nameTr: 'Su Depolama Tankı Hacmi',
      windowName: 'WaterStorageTank',
      mainFunc: 'calc',
      description: 'Dönemsel su depolama tankı (yağmur, geri kazanım) hacmi',
      params: [
        { name: 'gunlukTuketim_m3', label: 'Günlük Tüketim', unit: 'm³', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'guvenlikFaktoru', label: 'Güvenlik Faktörü', unit: 'frak', type: 'number', default: 1.2, min: 1.0, max: 2.0, step: 0.1 },
        { name: 'depolama_gun', label: 'Depolama Süresi', unit: 'gün', type: 'number', default: 3, min: 1, max: 30, step: 1 }
      ]
    },
    {
      id: 'dhw-boiler',
      category: 'heating-cooling',
      nameTr: 'Sıcak Su Katlı Isıtıcı',
      windowName: 'DhwBoiler',
      mainFunc: 'depolamaHacmi',
      description: 'Sıcak kullanım suyu için katlı isıtıcı depolama hacmi',
      params: [
        { name: 'tepe_talep_L_h', label: 'Saatlik Tepe Talep', unit: 'L/h', type: 'number', default: 1000, min: 100, max: 5000, step: 100 },
        { name: 'ortalama_talep_L_h', label: 'Saatlik Ortalama Talep', unit: 'L/h', type: 'number', default: 500, min: 50, max: 2500, step: 50 },
        { name: 'T_max', label: 'Maks. Sıcaklık', unit: '°C', type: 'number', default: 60, min: 40, max: 80, step: 1 }
      ]
    },
    {
      id: 'pool-evaporation',
      category: 'ventilation',
      nameTr: 'Yüzme Havuzu Buharlaşması',
      windowName: 'PoolEvaporation',
      mainFunc: 'calc',
      description: 'Yüzme havuzundan sıcaklık ve nem farkına göre buharlaşma debisi',
      params: [
        { name: 'poolAlan_m2', label: 'Havuz Alanı', unit: 'm²', type: 'number', default: 200, min: 20, max: 2000, step: 20 },
        { name: 'T_su', label: 'Su Sıcaklığı', unit: '°C', type: 'number', default: 28, min: 20, max: 35, step: 1 },
        { name: 'T_hava', label: 'Hava Sıcaklığı', unit: '°C', type: 'number', default: 25, min: 15, max: 35, step: 1 },
        { name: 'RH_hava', label: 'Hava Bağıl Nemi', unit: '%', type: 'number', default: 60, min: 30, max: 90, step: 5 }
      ]
    },
    {
      id: 'elevator-pressurization',
      category: 'ventilation',
      nameTr: 'Asansör Basınçlandırması',
      windowName: 'ElevatorPressurization',
      mainFunc: 'calc',
      description: 'Acil durumda asansör şaftı ve lobisinin basınçlandırması debisi',
      params: [
        { name: 'shaftVolume_m3', label: 'Şaft Hacmi', unit: 'm³', type: 'number', default: 100, min: 20, max: 500, step: 10 },
        { name: 'pressurizationTime_min', label: 'Basınçlandırma Süresi', unit: 'dak', type: 'number', default: 5, min: 1, max: 15, step: 1 },
        { name: 'targetPressure_Pa', label: 'Hedef Basınç', unit: 'Pa', type: 'number', default: 50, min: 10, max: 200, step: 10 }
      ]
    },
    {
      id: 'sprinkler-k-factor',
      category: 'fire',
      nameTr: 'Sprinkler K-Faktörü',
      windowName: 'SprinklerKFactor',
      mainFunc: 'debiFromBasinc',
      description: 'Sprinkler K-faktörü ile basınçtan debi hesabı: Q = K√P',
      params: [
        { name: 'K', label: 'K-Faktörü', unit: 'L/min/√bar', type: 'number', default: 80, min: 50, max: 160, step: 5 },
        { name: 'basincBar', label: 'Çalışma Basıncı', unit: 'bar', type: 'number', default: 1, min: 0.5, max: 5, step: 0.5 }
      ]
    },
    {
      id: 'disiplin-sistem-secimi',
      category: 'other',
      nameTr: 'Disiplin Sistem Seçimi',
      windowName: null,
      mainFunc: null,
      description: 'HVAC sistem disiplinlerine göre uygun sistem seçenekleri',
      params: [
        { name: 'disiplin', label: 'Disiplin (Heating/Cooling/etc)', unit: 'text', type: 'string', default: 'heating' }
      ]
    },
    {
      id: 'elevator-motor-cooling',
      category: 'ventilation',
      nameTr: 'Asansör Motor Soğutması',
      windowName: 'ElevatorMotorCooling',
      mainFunc: 'calc',
      description: 'Asansör makine odasında motor soğutması için gerekli hava debisi',
      params: [
        { name: 'motor_kW', label: 'Motor Gücü', unit: 'kW', type: 'number', default: 10, min: 1, max: 50, step: 1 },
        { name: 'verim_yuzde', label: 'Motor Verimi', unit: '%', type: 'number', default: 90, min: 70, max: 99, step: 1 },
        { name: 'hedef_temp_artisi_K', label: 'Hedef Sıcaklık Artışı', unit: 'K', type: 'number', default: 10, min: 3, max: 20, step: 1 }
      ]
    },
    {
      id: 'cooling-tower-sizing',
      category: 'heating-cooling',
      nameTr: 'Soğutma Kulesi Kapasitesi',
      windowName: 'CoolingTowerSizing',
      mainFunc: 'calc',
      description: 'Soğutma sisteminin pompa ısısını dikkate alarak kulesi kapasitesi tahmini',
      params: [
        { name: 'Q_sogutma_kW', label: 'Soğutma Yükü', unit: 'kW', type: 'number', default: 500, min: 50, max: 5000, step: 50 },
        { name: 'pompVerimi_yuzde', label: 'Pompa Isı Oranı', unit: '%', type: 'number', default: 3, min: 1, max: 10, step: 0.5 }
      ]
    },
    {
      id: 'boiler-sizing',
      category: 'heating-cooling',
      nameTr: 'Kombi Boyutlandırması',
      windowName: 'BoilerSizing',
      mainFunc: 'calc',
      description: 'Isıtma sisteminin ihtiyacı olan kombi gücünün hesaplanması (emniyet faktörü ile)',
      params: [
        { name: 'Q_isitma_yuku_kW', label: 'Isıtma Yükü', unit: 'kW', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
        { name: 'emniyet_faktoru', label: 'Emniyet Faktörü', unit: 'frak', type: 'number', default: 1.2, min: 1.0, max: 1.5, step: 0.05 }
      ]
    },
    {
      id: 'staircase-pressurization',
      category: 'ventilation',
      nameTr: 'Merdiven Basınçlandırması',
      windowName: 'StaircasePressurization',
      mainFunc: 'calc',
      description: 'Yangın tahliyesinde merdiven şaftının basınçlandırması debisi',
      params: [
        { name: 'shaftVolume_m3', label: 'Şaft Hacmi', unit: 'm³', type: 'number', default: 200, min: 50, max: 1000, step: 50 },
        { name: 'pressurizationTime_min', label: 'Basınçlandırma Süresi', unit: 'dak', type: 'number', default: 5, min: 1, max: 15, step: 1 },
        { name: 'targetPressure_Pa', label: 'Hedef Basınç', unit: 'Pa', type: 'number', default: 50, min: 10, max: 200, step: 10 }
      ]
    },
    {
      id: 'kitchen-hood',
      category: 'ventilation',
      nameTr: 'Mutfak Davlumbazı (Hood)',
      windowName: 'KitchenHood',
      mainFunc: 'calc',
      description: 'Mutfak davlumbazının gerekli hava debisi hesaplaması',
      params: [
        { name: 'alanM2', label: 'Davlumba Alanı', unit: 'm²', type: 'number', default: 5, min: 1, max: 50, step: 1 },
        { name: 'izgara_eni_m', label: 'İzgara Genişliği', unit: 'm', type: 'number', default: 2, min: 0.5, max: 10, step: 0.1 },
        { name: 'hava_hizi_ms', label: 'Hava Hızı', unit: 'm/s', type: 'number', default: 1.5, min: 0.5, max: 3.0, step: 0.1 }
      ]
    },
    {
      id: 'domestic-water-demand',
      category: 'plumbing',
      nameTr: 'Evsel Su Talebı ve Hidrofor',
      windowName: 'DomesticWaterDemand',
      mainFunc: 'calc',
      description: 'Günlük su talebinden pik debi ve hidrofor tank hacmi hesaplanması',
      params: [
        { name: 'gunluk_ortalama_debi_m3gun', label: 'Günlük Ortalama Su Talebi', unit: 'm³/gün', type: 'number', default: 50, min: 5, max: 500, step: 5 },
        { name: 'pik_katsayisi', label: 'Pik Debi Katsayısı', unit: 'frak', type: 'number', default: 3, min: 1, max: 5, step: 0.5 },
        { name: 'calisma_saati', label: 'Pompa Çalışma Saati', unit: 'h/gün', type: 'number', default: 10, min: 4, max: 24, step: 1 }
      ]
    },
    {
      id: 'fresh-air-load',
      category: 'ventilation',
      nameTr: 'Taze Hava Yükü (Sensible + Latent)',
      windowName: 'FreshAirLoad',
      mainFunc: 'calc',
      description: 'Taze havadan kaynaklanan duyulur ve gizli soğutma/ısıtma yükü',
      params: [
        { name: 'debi_m3h', label: 'Hava Debisi', unit: 'm³/h', type: 'number', default: 1000, min: 100, max: 20000, step: 100 },
        { name: 'T_dis_C', label: 'Dış Hava Sıcaklığı', unit: '°C', type: 'number', default: 35, min: -30, max: 50, step: 1 },
        { name: 'T_ic_C', label: 'İç Hava Sıcaklığı', unit: '°C', type: 'number', default: 24, min: 10, max: 30, step: 1 },
        { name: 'x_dis_g_kg', label: 'Dış Nem Oranı', unit: 'g/kg', type: 'number', default: 18, min: 0, max: 30, step: 1 }
      ]
    },
    {
      id: 'fire-pump-sizing',
      category: 'fire',
      nameTr: 'Yangın Pompa Boyutlandırması',
      windowName: 'FirePumpSizing',
      mainFunc: 'calc',
      description: 'Sprinkler, hidrant ve dolaptan toplam debi talepleri',
      params: [
        { name: 'Q_sprinkler_m3h', label: 'Sprinkler Debisi', unit: 'm³/h', type: 'number', default: 54, min: 10, max: 500, step: 10 },
        { name: 'Q_hidrant_m3h', label: 'Hidrant Debisi', unit: 'm³/h', type: 'number', default: 30, min: 10, max: 200, step: 10 },
        { name: 'Q_dolap_m3h', label: 'Dolap Debisi', unit: 'm³/h', type: 'number', default: 10, min: 5, max: 50, step: 5 }
      ]
    },
    {
      id: 'coil-sizing',
      category: 'heating-cooling',
      nameTr: 'Isı Değiştirici Bobin Boyutlandırması',
      windowName: 'CoilSizing',
      mainFunc: 'calc',
      description: 'Isıl bobin (heat/cool coil) tasarımı ve alan hesabı',
      params: [
        { name: 'Q_kW', label: 'Isıl Yük', unit: 'kW', type: 'number', default: 100, min: 10, max: 500, step: 10 },
        { name: 'debi_m3h', label: 'Hava Debisi', unit: 'm³/h', type: 'number', default: 3000, min: 500, max: 20000, step: 100 },
        { name: 'dT_C', label: 'Sıcaklık Düşüşü', unit: 'K', type: 'number', default: 5, min: 1, max: 15, step: 0.5 }
      ]
    },
    {
      id: 'room-ventilation-rate',
      category: 'ventilation',
      nameTr: 'Oda Havalandırma Hızı (ACH)',
      windowName: 'RoomVentilationRate',
      mainFunc: 'calc',
      description: 'Mekan hacmine ve kullanım türüne göre gerekli hava değişim sayısı',
      params: [
        { name: 'volume_m3', label: 'Hacim', unit: 'm³', type: 'number', default: 50, min: 10, max: 1000, step: 10 },
        { name: 'ach_target', label: 'Hedef ACH', unit: '1/h', type: 'number', default: 6, min: 2, max: 20, step: 1 }
      ]
    },
    {
      id: 'cogeneration-energy',
      category: 'heating-cooling',
      nameTr: 'Kojenerasyon Enerji Tahmini',
      windowName: 'CogenerationEnergy',
      mainFunc: 'calc',
      description: 'Kombineli ısı ve elektrik üretim verimliliği analizi',
      params: [
        { name: 'toplam_yakit_kW', label: 'Toplam Yakıt Enerjisi', unit: 'kW', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
        { name: 'elektrik_verim', label: 'Elektrik Verimi', unit: 'frak', type: 'number', default: 0.3, min: 0.1, max: 0.5, step: 0.05 },
        { name: 'isil_verim', label: 'Isıl Verimi', unit: 'frak', type: 'number', default: 0.4, min: 0.2, max: 0.6, step: 0.05 }
      ]
    },
    {
      id: 'power-factor-correction',
      category: 'other',
      nameTr: 'Güç Faktörü Düzeltmesi',
      windowName: 'PowerFactorCorrection',
      mainFunc: 'calc',
      description: 'Reaktif güç ve kondansatör kapasitesi hesabı',
      params: [
        { name: 'P_kW', label: 'Aktif Güç', unit: 'kW', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
        { name: 'pf_current', label: 'Mevcut Güç Faktörü', unit: 'frak', type: 'number', default: 0.75, min: 0.3, max: 1.0, step: 0.05 },
        { name: 'pf_target', label: 'Hedef Güç Faktörü', unit: 'frak', type: 'number', default: 0.95, min: 0.7, max: 1.0, step: 0.05 }
      ]
    },
    {
      id: 'duct-heat-gain',
      category: 'ventilation',
      nameTr: 'Kanal Isı Kazancı/Kaybı',
      windowName: 'DuctHeatGain',
      mainFunc: 'calc',
      description: 'Hava kanallarında dış ortam sıcaklığı nedeniyle isı transfer hesabı',
      params: [
        { name: 'debi_m3h', label: 'Hava Debisi', unit: 'm³/h', type: 'number', default: 3000, min: 500, max: 20000, step: 100 },
        { name: 'T_hava_C', label: 'Kanal İçi Hava Sıcaklığı', unit: '°C', type: 'number', default: 15, min: -10, max: 40, step: 1 },
        { name: 'T_ortam_C', label: 'Dış Ortam Sıcaklığı', unit: '°C', type: 'number', default: 35, min: -30, max: 50, step: 1 }
      ]
    }
  ];

  // Export
  if (typeof window !== 'undefined') {
    window.EkHesaplarConfig = modules;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = modules;
  }
})();
