// ═══════════════════════════════════════════════════════════════════
// HVAC Hesap Pro — Ek Mühendislik Modülleri (modules.js)
//
//  1. PressureLoss   — Darcy-Weisbach boru çapı & basınç kaybı
//  2. EnergyEstimate — Yıllık enerji tüketim ve maliyet tahmini
//  3. TS825Check     — TS 825 / THKYY U-değeri uyumluluk kontrolü
//  4. Psychro        — Psikometrik diyagram verisi üretimi
// ═══════════════════════════════════════════════════════════════════

'use strict';

// ───────────────────────────────────────────────────────────────────
// 1. BASINÇ KAYBI & BORU ÇAPI (Darcy-Weisbach)
// ───────────────────────────────────────────────────────────────────
const PressureLoss = (() => {

  // Su özellikleri (10°C - tipik soğutma suyu)
  const RHO = 999.7;  // kg/m³ yoğunluk
  const MU  = 0.00131; // Pa·s dinamik viskozite (10°C)
  const CP  = 4187;    // J/kg·K özgül ısı

  // Standart ticari boru çapları (DN → iç çap mm)
  const PIPE_TABLE = [
    { dn:'DN15',  di:16.0 },  { dn:'DN20',  di:21.6 },
    { dn:'DN25',  di:27.3 },  { dn:'DN32',  di:36.0 },
    { dn:'DN40',  di:41.9 },  { dn:'DN50',  di:53.1 },
    { dn:'DN65',  di:68.8 },  { dn:'DN80',  di:82.5 },
    { dn:'DN100', di:105.3 }, { dn:'DN125', di:130.2 },
    { dn:'DN150', di:155.4 }, { dn:'DN200', di:206.5 },
  ];

  // Darcy-Weisbach sürtünme katsayısı (Colebrook-White yaklaşımı)
  // ε = 0.046 mm (ticari çelik boru)
  function frictionFactor(Re, Di_m, eps_m = 0.000046) {
    if (Re < 2300) return 64 / Re; // Laminar
    // Swamee-Jain yaklaşımı (Colebrook yerine explicit)
    const A = Math.log10(eps_m / (3.7 * Di_m) + 5.74 / Math.pow(Re, 0.9));
    return 0.25 / (A * A);
  }

  /**
   * Boru çapı seç ve basınç kaybı hesapla
   * @param {number} Q_kW    — devre ısıl yük (kW)
   * @param {number} dT      — gidiş-dönüş sıcaklık farkı (°C)
   * @param {number} L_m     — boru uzunluğu (m)
   * @param {number} v_max   — max hız (m/s), varsayılan 1.5
   * @returns {object}
   */
  function select(Q_kW, dT = 5, L_m = 10, v_max = 1.5) {
    if (Q_kW <= 0 || dT <= 0) return null;

    // Kütlesel debi kg/s
    const m_dot = (Q_kW * 1000) / (CP * dT);
    // Hacimsel debi m³/s
    const V_dot = m_dot / RHO;

    // En uygun çap: hız ≤ v_max sağlayan en küçük DN
    let selected = null;
    for (const pipe of PIPE_TABLE) {
      const Di   = pipe.di / 1000; // m
      const area = Math.PI * Di * Di / 4;
      const v    = V_dot / area;
      if (v <= v_max) { selected = { ...pipe, Di, area, v }; break; }
    }

    if (!selected) {
      // Hepsi aşılıyorsa en büyüğü al
      const p = PIPE_TABLE[PIPE_TABLE.length - 1];
      const Di = p.di / 1000;
      selected = { ...p, Di, area: Math.PI * Di * Di / 4,
                   v: V_dot / (Math.PI * Di * Di / 4) };
    }

    const Re  = (RHO * selected.v * selected.Di) / MU;
    const f   = frictionFactor(Re, selected.Di);
    // Basınç kaybı Pa/m (Darcy-Weisbach)
    const dP_pm = f * (1 / selected.Di) * (RHO * selected.v * selected.v / 2);
    // Toplam boru direnci (Pa) — 1.3 yerel direnç katsayısı
    const dP_total = dP_pm * L_m * 1.3;

    return {
      dn:      selected.dn,
      di_mm:   selected.di,
      v_ms:    +selected.v.toFixed(3),
      Re:      Math.round(Re),
      akis:    Re < 2300 ? 'Laminar' : Re < 4000 ? 'Geçiş' : 'Türbülanslı',
      f:       +f.toFixed(5),
      dP_pm:   +dP_pm.toFixed(1),    // Pa/m
      dP_tot:  +dP_total.toFixed(0), // Pa
      m_dot:   +m_dot.toFixed(4),    // kg/s
      dP_Pa_m: +dP_pm.toFixed(1),               // UI adaptor: Pa/m
      dP_total_kPa: +(dP_total/1000).toFixed(2),  // UI adaptor: Pa->kPa
      m_dot_kgh: +(m_dot*3600).toFixed(1),        // UI adaptor: kg/s->kg/h
      V_m3h:   +(V_dot * 3600).toFixed(2), // m³/h
    };
  }

  /**
   * Tüm mahaller için boru seçim tablosu
   * @param {Array}  results  — globalResults
   * @param {number} dT       — tasarım ΔT (°C)
   */
  function analyzeAll(results, dT = 5) {
    if (!results?.length) return [];
    return results.map(r => {
      const Q = (r.bestLoad || 0) / 1000; // W → kW
      const res = select(Q, dT, 20); // 20m varsayılan
      return {
        mahalNo:  r.mahalNo,
        mahalAdi: r.mahalAdi,
        Q_kW:     +Q.toFixed(2),
        ...( res || { dn:'–', di_mm:0, v_ms:0, dP_pm:0, dP_tot:0, V_m3h:0 })
      };
    });
  }

  /**
   * HTML tablo olarak göster
   */
  function renderTable(results, dT = 5) {
    const data = analyzeAll(results, dT);
    if (!data.length) return '<p style="color:var(--mt)">Önce hesabı çalıştırın.</p>';

    const rows = data.map(d => `
      <tr>
        <td style="font-family:var(--mono);color:var(--mt)">${d.mahalNo||'–'}</td>
        <td>${d.mahalAdi||'–'}</td>
        <td style="font-family:var(--mono);text-align:right">${d.Q_kW}</td>
        <td style="font-family:var(--mono);color:var(--cy);font-weight:700">${d.dn}</td>
        <td style="font-family:var(--mono);text-align:right">${d.V_m3h}</td>
        <td style="font-family:var(--mono);text-align:right;color:${d.v_ms>1.5?'var(--rd)':'var(--gr)'}">${d.v_ms}</td>
        <td style="font-family:var(--mono);text-align:right">${d.dP_pm}</td>
        <td style="font-family:var(--mono);text-align:right;color:${d.dP_tot>3000?'var(--gd)':'var(--gr)'}">${d.dP_tot}</td>
      </tr>`).join('');

    return `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:10px">
          <thead>
            <tr style="background:var(--bg4)">
              <th style="padding:6px 8px;text-align:left;color:var(--mt);font-family:var(--mono);font-size:8px">NO</th>
              <th style="padding:6px 8px;text-align:left;color:var(--mt);font-family:var(--mono);font-size:8px">MAHAL</th>
              <th style="padding:6px 8px;text-align:right;color:var(--mt);font-family:var(--mono);font-size:8px">Q (kW)</th>
              <th style="padding:6px 8px;text-align:center;color:var(--cy);font-family:var(--mono);font-size:8px">DN</th>
              <th style="padding:6px 8px;text-align:right;color:var(--mt);font-family:var(--mono);font-size:8px">Debi (m³/h)</th>
              <th style="padding:6px 8px;text-align:right;color:var(--mt);font-family:var(--mono);font-size:8px">v (m/s)</th>
              <th style="padding:6px 8px;text-align:right;color:var(--mt);font-family:var(--mono);font-size:8px">ΔP/m (Pa)</th>
              <th style="padding:6px 8px;text-align:right;color:var(--mt);font-family:var(--mono);font-size:8px">ΔP_top (Pa)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:8px;font-size:9px;color:var(--mt);font-family:var(--mono)">
          * v > 1.5 m/s → kırmızı (gürültü riski) | ΔP > 3000 Pa → sarı (pompa boyutlama)
          | ΔT = ${dT}°C | ε = 0.046 mm çelik boru | yerel direnç katsayısı = 1.3
        </div>
      </div>`;
  }

  return { select, analyzeAll, renderTable };
})();


// ───────────────────────────────────────────────────────────────────
// 2. YILLIK ENERJİ TÜKETİM TAHMİNİ
// ───────────────────────────────────────────────────────────────────
const EnergyEstimate = (() => {

  // Tipik COP/EER değerleri sistem türüne göre
  const COP_DB = {
    fancoil: { eerSog: 3.2, copIst: 3.8 },
    wlhp:    { eerSog: 4.5, copIst: 5.0 },
    vrf:     { eerSog: 3.8, copIst: 4.2 },
    split:   { eerSog: 3.0, copIst: 3.2 },
    hassas:  { eerSog: 2.0, copIst: 2.5 },
  };

  // Aylık eşdeğer tam yük saati (ETYS) — İstanbul referans
  const ETYS = {
    sog: { 5:80,  6:160, 7:240, 8:220, 9:140 },          // Mayıs-Eylül
    ist: { 1:300, 2:260, 3:160, 4:40, 10:60, 11:180, 12:280 } // Kış
  };

  /**
   * @param {Array}  results  — globalResults
   * @param {string} sistem   — sistem türü ('fancoil', 'vrf' ...)
   * @param {number} tarife   — kWh birim fiyatı (₺)
   */
  function calculate(results, sistem = 'fancoil', tarife = 4.5) {
    if (!results?.length) return null;

    const cops = COP_DB[sistem] || COP_DB.fancoil;
    const topSog = results.reduce((s, r) => s + (r.bestLoad || 0), 0) / 1000; // kW
    const topIst = results.reduce((s, r) => s + (r.qKayip   || 0), 0) / 1000; // kW

    // Yıllık enerji (kWh) = Σ (Yük × ETYS_ay / EER)
    let kWhSog = 0, kWhIst = 0;
    Object.entries(ETYS.sog).forEach(([, h]) => { kWhSog += topSog * h / cops.eerSog; });
    Object.entries(ETYS.ist).forEach(([, h]) => { kWhIst += topIst * h / cops.copIst; });
    const kWhToplam = kWhSog + kWhIst;

    // CO₂ — Türkiye elektrik şebekesi: 0.523 kg CO₂/kWh (TEİAŞ 2024)
    const co2 = kWhToplam * 0.523 / 1000; // ton

    return {
      topSog_kW:   +topSog.toFixed(1),
      topIst_kW:   +topIst.toFixed(1),
      eer:         cops.eerSog,
      cop:         cops.copIst,
      kWhSog:      Math.round(kWhSog),
      kWhIst:      Math.round(kWhIst),
      kWhToplam:   Math.round(kWhToplam),
      maliyetSog:  Math.round(kWhSog  * tarife),
      maliyetIst:  Math.round(kWhIst  * tarife),
      maliyetToplam: Math.round(kWhToplam * tarife),
      co2_ton:     +co2.toFixed(2),
      tarife,
      sistem,
    };
  }

  function renderCard(results, sistem, tarife) {
    const d = calculate(results, sistem, tarife);
    const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
    if (!d) return '<p style="color:var(--mt)">' + (_isEN ? 'No calculation data.' : 'Hesap verisi yok.') + '</p>';
    const fmt = v => Math.round(v).toLocaleString(_isEN ? 'en-US' : 'tr-TR');

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div style="background:var(--bg3);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:14px">
          <div style="font-size:9px;color:var(--mt);font-family:var(--mono);letter-spacing:1px;margin-bottom:6px">SOĞUTMA</div>
          <div style="font-family:var(--mono)">
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">Zirve Yük</span><span style="color:var(--rd);font-weight:700">${d.topSog_kW} kW</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">EER</span><span>${d.eer}</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0;border-top:1px solid var(--bdr);margin-top:4px"><span style="color:var(--mt)">Yıllık tüketim</span><span style="color:var(--cy);font-weight:700">${fmt(d.kWhSog)} kWh</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">Maliyet</span><span style="color:var(--gd);font-weight:700">${fmt(d.maliyetSog)} ₺</span></div>
          </div>
        </div>
        <div style="background:var(--bg3);border:1px solid rgba(59,130,246,.25);border-radius:8px;padding:14px">
          <div style="font-size:9px;color:var(--mt);font-family:var(--mono);letter-spacing:1px;margin-bottom:6px">ISITMA</div>
          <div style="font-family:var(--mono)">
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">Zirve Yük</span><span style="color:var(--bl);font-weight:700">${d.topIst_kW} kW</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">COP</span><span>${d.cop}</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0;border-top:1px solid var(--bdr);margin-top:4px"><span style="color:var(--mt)">Yıllık tüketim</span><span style="color:var(--cy);font-weight:700">${fmt(d.kWhIst)} kWh</span></div>
            <div style="display:flex;justify-content:space-between;padding:2px 0"><span style="color:var(--mt)">Maliyet</span><span style="color:var(--gd);font-weight:700">${fmt(d.maliyetIst)} ₺</span></div>
          </div>
        </div>
        <div style="grid-column:1/-1;background:var(--bg3);border:1px solid rgba(16,185,129,.25);border-radius:8px;padding:14px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:9px;color:var(--mt);font-family:var(--mono);letter-spacing:1px;margin-bottom:4px">YILLIK TOPLAM</div>
              <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--gr)">${fmt(d.kWhToplam)} kWh</div>
              <div style="font-size:10px;color:var(--gd);font-family:var(--mono);margin-top:2px">${fmt(d.maliyetToplam)} ₺/yıl</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:9px;color:var(--mt);font-family:var(--mono);margin-bottom:4px">CO₂ AYAK İZİ</div>
              <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--mt)">${d.co2_ton} ton</div>
              <div style="font-size:8px;color:var(--mt);margin-top:2px">0.523 kg/kWh (TEİAŞ)</div>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:8px;color:var(--mt);font-family:var(--mono)">
        * Sistem: ${d.sistem} | Tarife: ${d.tarife} ₺/kWh | ETYS İstanbul referans | Tahmini değerler
      </div>`;
  }

  return { calculate, renderCard };
})();


// ───────────────────────────────────────────────────────────────────
// 3. TS 825 / THKYY U-DEĞERİ UYUMLULUK KONTROLÜ
// ───────────────────────────────────────────────────────────────────
const TS825Check = (() => {

  // TS 825 iklim bölgelerine göre maksimum U-değerleri (W/m²K)
  // Bölge 1: Akdeniz | 2: Ege/Marmara | 3: İç Anadolu | 4: Doğu Anadolu
  const LIMITS = {
    1: { duvar:0.70, tavan:0.45, doseme:0.70, pencere:2.40 },
    2: { duvar:0.60, tavan:0.40, doseme:0.60, pencere:2.40 },
    3: { duvar:0.50, tavan:0.30, doseme:0.50, pencere:2.00 },
    4: { duvar:0.40, tavan:0.25, doseme:0.40, pencere:1.60 },
  };

  // Şehir → bölge
  const SEHIR_BOLGE = {
    'İstanbul':2,'Ankara':3,'İzmir':1,'Bursa':2,'Antalya':1,'Adana':1,
    'Konya':3,'Kayseri':3,'Gaziantep':2,'Mersin':1,'Erzurum':4,'Trabzon':2,
    'Samsun':2,'Eskişehir':3,'Diyarbakır':3,'Kars':4,'Van':4,'Ağrı':4,
  };

  function getBolge(sehir) {
    if (!sehir) return 3;
    for (const [k, b] of Object.entries(SEHIR_BOLGE)) {
      if (sehir.includes(k)) return b;
    }
    return 3; // İç Anadolu varsayılan
  }

  /**
   * @param {Array}  results — globalResults
   * @param {string} sehir  — P.sehir
   * @returns {object}
   */
  function check(results, sehir) {
    if (!results?.length) return null;
    const bolge  = getBolge(sehir);
    const limits = LIMITS[bolge];

    const mahaller = results.map(r => {
      const uyarilar = [];
      if ((r.uDuv  || 0) > limits.duvar)  uyarilar.push({ eleman:'Dış Duvar',   U: r.uDuv, limit: limits.duvar });
      if ((r.uTav  || 0) > limits.tavan)  uyarilar.push({ eleman:'Tavan/Çatı',  U: r.uTav, limit: limits.tavan });
      if ((r.uDos  || 0) > limits.doseme) uyarilar.push({ eleman:'Döşeme',      U: r.uDos, limit: limits.doseme });
      if ((r.uPenc || 0) > limits.pencere)uyarilar.push({ eleman:'Pencere',     U: r.uPenc,limit: limits.pencere });
      return { mahalNo: r.mahalNo, mahalAdi: r.mahalAdi, uyarilar };
    });

    const hatalı = mahaller.filter(m => m.uyarilar.length > 0);

    return { bolge, limits, mahaller, hatalı, toplamHata: hatalı.length };
  }

  function renderReport(results, sehir) {
    const data = check(results, sehir);
    const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
    if (!data) return '<p style="color:var(--mt)">' + (_isEN ? 'No calculation data.' : 'Hesap verisi yok.') + '</p>';

    const bolgeRenk = ['','var(--gd)','var(--cy)','var(--bl)','var(--rd)'][data.bolge] || 'var(--mt)';
    const header = `
      <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:8px 14px">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono)">İKLİM BÖLGESİ</div>
          <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:${bolgeRenk}">Bölge ${data.bolge}</div>
          <div style="font-size:9px;color:var(--mt)">${sehir || '–'}</div>
        </div>
        ${Object.entries(data.limits).map(([k, v]) =>
          `<div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:8px 12px;min-width:80px">
            <div style="font-size:7px;color:var(--mt);font-family:var(--mono);letter-spacing:.5px">${k.toUpperCase()}</div>
            <div style="font-family:var(--mono);font-size:15px;font-weight:700;color:var(--tx)">≤${v}</div>
            <div style="font-size:7px;color:var(--mt)">W/m²K</div>
          </div>`).join('')}
        <div style="background:${data.toplamHata > 0 ? 'rgba(239,68,68,.08)' : 'rgba(16,185,129,.08)'};border:1px solid ${data.toplamHata > 0 ? 'rgba(239,68,68,.3)' : 'rgba(16,185,129,.3)'};border-radius:6px;padding:8px 14px">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono)">UYUMSUZ MAHAL</div>
          <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:${data.toplamHata > 0 ? 'var(--rd)' : 'var(--gr)'}">${data.toplamHata}</div>
        </div>
      </div>`;

    if (!data.hatalı.length) {
      return header + `<div style="padding:16px;text-align:center;color:var(--gr);font-family:var(--mono)">✔ Tüm mahaller TS 825 Bölge ${data.bolge} sınırları içinde</div>`;
    }

    const rows = data.hatalı.flatMap(m =>
      m.uyarilar.map(u => `
        <tr>
          <td style="font-family:var(--mono);color:var(--mt);padding:5px 8px">${m.mahalNo||'–'}</td>
          <td style="padding:5px 8px">${m.mahalAdi||'–'}</td>
          <td style="padding:5px 8px;font-family:var(--mono)">${u.eleman}</td>
          <td style="padding:5px 8px;font-family:var(--mono);color:var(--rd);font-weight:700;text-align:right">${u.U?.toFixed(3) ?? '–'}</td>
          <td style="padding:5px 8px;font-family:var(--mono);color:var(--gr);text-align:right">≤${u.limit}</td>
          <td style="padding:5px 8px;font-family:var(--mono);color:var(--gd);text-align:right">${u.U > 0 ? '+' + ((u.U - u.limit) * 100 / u.limit).toFixed(0) + '%' : '–'}</td>
        </tr>`)
    ).join('');

    return header + `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:10px">
          <thead>
            <tr style="background:var(--bg4)">
              ${['NO','MAHAL','ELEMAN','U (W/m²K)','LİMİT','AŞIM'].map(h =>
                `<th style="padding:6px 8px;text-align:left;color:var(--mt);font-family:var(--mono);font-size:8px">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  return { check, renderReport, getBolge };
})();


// ───────────────────────────────────────────────────────────────────
// 4. PSİKOMETRİK VERİ ÜRETİCİ (Mollier diyagramı için)
// ───────────────────────────────────────────────────────────────────
const Psychro = (() => {

  function doymaBasinci(T) {
    return 0.6105 * Math.exp(17.27 * T / (T + 237.3)); // kPa
  }

  /**
   * Kuru termometre sıcaklığı + bağıl nem → psikometrik değerler
   */
  function stateFromRH(T_kuru, RH_pct, P_atm = 101.325) {
    const Ps = doymaBasinci(T_kuru);
    const W  = Math.max(0, 0.622 * (RH_pct / 100 * Ps) / (P_atm - RH_pct / 100 * Ps));
    const h  = 1.006 * T_kuru + W * (2501 + 1.86 * T_kuru);
    const T_cig = 243.5 * Math.log(RH_pct / 100 * Ps / 0.6105) /
                  (17.27 - Math.log(RH_pct / 100 * Ps / 0.6105));
    return {
      T:   T_kuru,
      RH:  RH_pct,
      W:   +(W * 1000).toFixed(2),    // g/kg
      h:   +h.toFixed(2),             // kJ/kg
      T_cig: +T_cig.toFixed(1),       // °C
    };
  }

  /**
   * İki durum arası ısıl süreç verisini üret (soğutma/ısıtma/nem)
   */
  function process(from, to) {
    const dh  = to.h  - from.h;
    const dW  = to.W  - from.W;
    const dT  = to.T  - from.T;
    const tip = dh > 0
      ? (dW > 0.1 ? 'Nemlendir+Isıt' : 'Duyulur Isıtma')
      : (dW < -0.1 ? 'Soğut+Kurut'   : 'Duyulur Soğutma');
    return { from, to, dh: +dh.toFixed(2), dW: +dW.toFixed(2), dT: +dT.toFixed(2), tip };
  }

  /**
   * Proje için iç/dış koşul özetini döndür
   */
  function projectSummary(P) {
    if (!P) return null;
    const dis_yaz = stateFromRH(P.Tmax || 32, 55); // Dış yazın yaklaşık nem %55
    const ic_yaz  = stateFromRH(P.icKtYaz || 24, P.icNem || 50);
    const dis_kis = stateFromRH(P.kisKt || -3, 80);
    const ic_kis  = stateFromRH(20, 40);
    return {
      dis_yaz, ic_yaz, dis_kis, ic_kis,
      sog: process(ic_yaz, dis_yaz),
      ist: process(ic_kis, dis_kis),
    };
  }

  function renderSummaryCard(P) {
    const d = projectSummary(P);
    if (!d) return '';
    const row = (lbl, st, c='var(--tx)') =>
      `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(36,48,72,.3)">
        <span style="color:var(--mt);font-size:9px">${lbl}</span>
        <span style="font-family:var(--mono);font-size:10px;color:${c}">${st.T}°C · %${st.RH} RH · W=${st.W}g/kg · h=${st.h}kJ/kg · T<sub>çiğ</sub>=${st.T_cig}°C</span>
      </div>`;

    return `
      <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:8px;padding:14px">
        <div style="font-size:10px;font-weight:700;color:var(--cy);margin-bottom:10px">PSİKOMETRİK DURUM NOKTALARI</div>
        ${row('Dış — Yaz Tasarım', d.dis_yaz, 'var(--rd)')}
        ${row('İç  — Yaz Tasarım', d.ic_yaz,  'var(--cy)')}
        ${row('Dış — Kış Tasarım', d.dis_kis, 'var(--bl)')}
        ${row('İç  — Kış Tasarım', d.ic_kis,  'var(--gr)')}
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);border-radius:6px;padding:8px">
            <div style="font-size:8px;color:var(--mt);font-family:var(--mono)">SOĞUTMA SÜRECİ</div>
            <div style="font-family:var(--mono);color:var(--rd);font-weight:700">${d.sog.tip}</div>
            <div style="font-size:9px;color:var(--mt)">Δh = ${d.sog.dh} kJ/kg | ΔW = ${d.sog.dW} g/kg</div>
          </div>
          <div style="background:rgba(59,130,246,.07);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:8px">
            <div style="font-size:8px;color:var(--mt);font-family:var(--mono)">ISITMA SÜRECİ</div>
            <div style="font-family:var(--mono);color:var(--bl);font-weight:700">${d.ist.tip}</div>
            <div style="font-size:9px;color:var(--mt)">Δh = ${d.ist.dh} kJ/kg | ΔW = ${d.ist.dW} g/kg</div>
          </div>
        </div>
      </div>`;
  }

  return { stateFromRH, process, projectSummary, renderSummaryCard };
})();

// Global erişim (ilk 4 modül)
window.PressureLoss   = PressureLoss;
window.EnergyEstimate = EnergyEstimate;
window.TS825Check     = TS825Check;
window.Psychro        = Psychro;

// ───────────────────────────────────────────────────────────────────
// 5. HAVA KANALI BOYUTLANDIRMA — Eşit Sürtünme Yöntemi
// ───────────────────────────────────────────────────────────────────
const DuctSizing = (() => {
  'use strict';

  // Dairesel kanal eşdeğer çap → dikdörtgen boyutlandırma
  // ASHRAE referans: R_f = 0.1 Pa/m (tipik ofis/konut)
  const MATERIAL = {
    'galvaniz': { eps: 0.00009, label: 'Galvaniz Sac' },
    'paslanmaz': { eps: 0.00015, label: 'Paslanmaz Çelik' },
    'spiral':   { eps: 0.00009, label: 'Spiral Kanal' },
    'fibro':    { eps: 0.0009,  label: 'Fibro / Flex' },
  };

  // Darcy-Weisbach — hava için (ρ=1.2 kg/m³, μ=1.81e-5 Pa·s)
  function frictionFactor(Re) {
    if (Re < 2300) return 64 / Re;
    const eps_D = 0.00009 / 0.3; // tipik çap 300 mm
    const A = Math.log10(eps_D / 3.7 + 5.74 / Math.pow(Re, 0.9));
    return 0.25 / (A * A);
  }

  /**
   * Dairesel kanal boyutlandır
   * @param {number} Q_ls   — debi (L/s)
   * @param {number} R_Pa_m — hedef basınç kaybı (Pa/m), varsayılan 0.8
   * @param {string} mat    — malzeme
   */
  function calcCircular(Q_ls, R_Pa_m = 0.8, mat = 'galvaniz') {
    const RHO = 1.2; const MU = 1.81e-5;
    const Q = Q_ls / 1000; // m³/s
    const eps = MATERIAL[mat]?.eps || 0.00009;

    // Çap iterasyonu (Pa/m hedefinden)
    // R = f * L/D * ρv²/2 → D^5 = f*ρ*Q² / (2*R*π²/4²)
    let D = 0.1; // başlangıç m
    for (let i = 0; i < 20; i++) {
      const v = Q / (Math.PI * D * D / 4);
      const Re = RHO * v * D / MU;
      const f = (Re < 2300) ? 64 / Re : 0.25 / Math.pow(Math.log10(eps / (3.7 * D) + 5.74 / Math.pow(Re, 0.9)), 2);
      const R_calc = f * RHO * v * v / (2 * D);
      D = D * Math.pow(R_calc / R_Pa_m, 0.2);
    }

    // Standart çap seç (50mm adım)
    const D_mm = Math.ceil((D * 1000) / 50) * 50;
    const D_std = D_mm / 1000;
    const v_std = Q / (Math.PI * D_std * D_std / 4);
    const Re_std = RHO * v_std * D_std / MU;
    const f_std = 0.25 / Math.pow(Math.log10(eps / (3.7 * D_std) + 5.74 / Math.pow(Re_std, 0.9)), 2);
    const R_std = f_std * RHO * v_std * v_std / (2 * D_std);

    // Eşdeğer dikdörtgen (a/b = 1.5 oranı)
    const A_req = Math.PI * D_std * D_std / 4;
    const a = Math.ceil(Math.sqrt(A_req * 1.5) * 1000 / 50) * 50; // mm
    const b = Math.ceil((A_req * 1e6 / a) / 50) * 50; // mm

    return {
      Q_ls, R_target: R_Pa_m,
      D_calc_mm: Math.round(D * 1000),
      D_std_mm: D_mm,
      v: +v_std.toFixed(2),
      R_actual: +R_std.toFixed(3),
      Re: Math.round(Re_std),
      akis: Re_std > 4000 ? 'Türbülanslı' : Re_std > 2300 ? 'Geçiş' : 'Laminer',
      rect_a: a, rect_b: b,
      mat: MATERIAL[mat]?.label || mat,
    };
  }

  /**
   * Kanal ağı hesabı — her bölüm için
   */
  function calcNetwork(sections) {
    return sections.map((s, i) => ({
      no: i + 1,
      label: s.label || `Bölüm ${i + 1}`,
      ...calcCircular(s.Q_ls, s.R_Pa_m || 0.8, s.mat || 'galvaniz'),
      L_m: s.L_m || 0,
      dP_total: +((calcCircular(s.Q_ls, s.R_Pa_m || 0.8, s.mat || 'galvaniz').R_actual) * (s.L_m || 0) * 1.5).toFixed(1),
    }));
  }

  function renderTable(res) {
    if (!res) return '<div style="color:var(--rd);padding:10px;">Hesap yapılamadı.</div>';
    const r = res;
    return `
    <div class="mod-result-card" style="border-color:rgba(6,182,212,.3);">
      <div class="mod-result-hd" style="color:var(--cy);">💨 KANAL BOYUTLANDIRMA SONUCU</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:10px;">
        <div style="background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">DAİRESEL KANAL (STD)</div>
          <div style="font-size:22px;font-weight:700;color:var(--cy);font-family:var(--mono);">⌀${r.D_std_mm}</div>
          <div style="font-size:9px;color:var(--mt);">mm</div>
        </div>
        <div style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">DİKDÖRTGEN EŞDEĞERİ</div>
          <div style="font-size:18px;font-weight:700;color:var(--pu);font-family:var(--mono);">${r.rect_a}×${r.rect_b}</div>
          <div style="font-size:9px;color:var(--mt);">mm</div>
        </div>
        <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">KANAL HIZI</div>
          <div style="font-size:22px;font-weight:700;color:var(--gr);font-family:var(--mono);">${r.v}</div>
          <div style="font-size:9px;color:var(--mt);">m/s</div>
        </div>
        <div style="background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">ÖZGÜL BASINÇ KAYBI</div>
          <div style="font-size:22px;font-weight:700;color:var(--gd);font-family:var(--mono);">${r.R_actual}</div>
          <div style="font-size:9px;color:var(--mt);">Pa/m</div>
        </div>
      </div>
      <div style="font-size:9px;color:var(--mt);font-family:var(--mono);display:flex;gap:16px;flex-wrap:wrap;">
        <span>` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Calculated diameter: ' : 'Hesaplanan çap: ') + `<strong style="color:var(--tx);">⌀${r.D_calc_mm} mm</strong></span>
        <span>` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Reynolds: ' : 'Reynolds: ') + `<strong style="color:var(--tx);">${r.Re.toLocaleString((typeof LANG !== 'undefined' && LANG === 'en') ? 'en-US' : 'tr-TR')}</strong></span>
        <span>` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Flow type: ' : 'Akış tipi: ') + `<strong style="color:var(--cy);">${r.akis}</strong></span>
        <span>` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Material: ' : 'Malzeme: ') + `<strong style="color:var(--tx);">${r.mat}</strong></span>
      </div>
      <div style="margin-top:8px;padding:6px 10px;border-radius:5px;font-size:9px;font-family:var(--mono);
        background:${r.v > 8 ? 'rgba(239,68,68,.08)' : r.v > 5 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)'};
        border:1px solid ${r.v > 8 ? 'rgba(239,68,68,.3)' : r.v > 5 ? 'rgba(245,158,11,.3)' : 'rgba(16,185,129,.3)'};">
        ${r.v > 8 ? '⚠ Hız çok yüksek — gürültü riski. Bir büyük çap kullanın.' :
          r.v > 5 ? '⚡ Hız kabul edilebilir sınırda.' : '✅ Hız ideal aralıkta (≤ 5 m/s).'}
      </div>
    </div>`;
  }

  return { calcCircular, calcNetwork, renderTable, MATERIAL };
})();
window.DuctSizing = DuctSizing;

// ───────────────────────────────────────────────────────────────────
// 6. YERDEN ISITMA (UFH) — Devre & Özgül Isı Hesabı
// ───────────────────────────────────────────────────────────────────
const UFHCalc = (() => {
  'use strict';

  // Su ısıl özellikleri (ortalama sıcaklıkta)
  const RHO_W = 990; const CP_W = 4180; // 40°C için

  /**
   * Tek oda UFH hesabı
   * @param {object} p
   *   alan     m²     — oda alanı
   *   qLoad    W/m²   — özgül ısı yükü
   *   TG       °C     — gidiş suyu
   *   TD       °C     — dönüş suyu
   *   aralik   mm     — boru aralığı (100–300)
   *   uZemin   W/m²K  — zemin ısı geçirgenliği (iletim)
   */
  function calc(p) {
    const { alan = 20, qLoad = 50, TG = 35, TD = 28, aralik = 150, uZemin = 0.15 } = p;
    const Tm = (TG + TD) / 2;   // Ortalama su sıcaklığı
    const Ti = 20;               // İç sıcaklık (standart)

    // Özgül ısı çıkışı (VDI 4640 T2 basitleştirilmiş)
    const qOzgul = (Tm - Ti) / (aralik / 1000 / (2 * Math.PI * 0.35) + 1 / (11.0 + 0));
    // 11 W/m²K konvektif + radyatif yüzey ısı iletim katsayısı

    // Gerekli alan (aktif)
    const alanAktif = alan * 0.85; // %85 boru alanı
    const Q_total = qLoad * alanAktif; // W

    // Devre uzunluğu
    const boruUzunluk = (alanAktif / (aralik / 1000)); // m

    // Debi
    const mDot = Q_total / (CP_W * (TG - TD)); // kg/s
    const debi_lh = mDot / RHO_W * 3600 * 1000; // L/h

    // Basınç kaybı (yaklaşık - PE-Xa 16x2mm)
    const vBoru = mDot / RHO_W / (Math.PI * 0.012 * 0.012 / 4); // 12mm iç çap
    const dpBoru = (0.025 * boruUzunluk / 0.012 * RHO_W * vBoru * vBoru / 2) / 1000; // kPa

    // Kontrol: qOzgul ≥ qLoad?
    const yeterli = qOzgul >= qLoad;

    return {
      alan, qLoad, TG, TD, aralik, Tm,
      qOzgul: +qOzgul.toFixed(1),
      Q_total: +Q_total.toFixed(0),
      boruUzunluk: +boruUzunluk.toFixed(1),
      debi_lh: +debi_lh.toFixed(1),
      dpBoru: +dpBoru.toFixed(2),
      vBoru: +vBoru.toFixed(3),
      yeterli,
    };
  }

  function renderCard(r) {
    const durum = r.yeterli
      ? `<span style="color:var(--gr);">✅ Yeterli (${r.qOzgul} W/m² ≥ ${r.qLoad} W/m²)</span>`
      : `<span style="color:var(--rd);">⚠ Yetersiz! (${r.qOzgul} W/m² < ${r.qLoad} W/m²) — Aralığı küçültün veya sıcaklığı artırın</span>`;
    return `
    <div class="mod-result-card" style="border-color:rgba(249,115,22,.3);">
      <div class="mod-result-hd" style="color:#f97316;">🔥 YERDEN ISITMA HESAP SONUCU</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin-bottom:10px;">
        <div style="background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">TOPLAM ISI ÇIKTISI</div>
          <div style="font-size:20px;font-weight:700;color:#f97316;font-family:var(--mono);">${(r.Q_total/1000).toFixed(2)}</div>
          <div style="font-size:9px;color:var(--mt);">kW</div>
        </div>
        <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">ÖZGÜL ISI ÇIKTISI</div>
          <div style="font-size:20px;font-weight:700;color:var(--gr);font-family:var(--mono);">${r.qOzgul}</div>
          <div style="font-size:9px;color:var(--mt);">W/m²</div>
        </div>
        <div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">BORU UZUNLUĞU</div>
          <div style="font-size:20px;font-weight:700;color:var(--bl);font-family:var(--mono);">${r.boruUzunluk}</div>
          <div style="font-size:9px;color:var(--mt);">m / devre</div>
        </div>
        <div style="background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">DEBİ</div>
          <div style="font-size:20px;font-weight:700;color:var(--cy);font-family:var(--mono);">${r.debi_lh}</div>
          <div style="font-size:9px;color:var(--mt);">L/h</div>
        </div>
        <div style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">BASINÇ KAYBI</div>
          <div style="font-size:20px;font-weight:700;color:var(--pu);font-family:var(--mono);">${r.dpBoru}</div>
          <div style="font-size:9px;color:var(--mt);">kPa</div>
        </div>
      </div>
      <div style="padding:6px 10px;border-radius:5px;font-size:9px;font-family:var(--mono);
        background:${r.yeterli ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)'};
        border:1px solid ${r.yeterli ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'};">
        ${durum}
        <span style="margin-left:12px;color:var(--mt);">Ort. su T: ${r.Tm}°C | Boru hızı: ${r.vBoru} m/s | Aralık: ${r.aralik} mm</span>
      </div>
    </div>`;
  }

  return { calc, renderCard };
})();
window.UFHCalc = UFHCalc;

// ───────────────────────────────────────────────────────────────────
// 7. CHİLLER / SOĞUTMA GRUBU SEÇİMİ
// ───────────────────────────────────────────────────────────────────
const ChillerSelect = (() => {
  'use strict';

  // Referans chiller veritabanı (kapasite aralıkları kW)
  const CHILLER_DB = [
    { model:'Mini Chiller – Scroll',  minKW:15,  maxKW:100,  tip:'scroll',  COP:3.2, IPLV:4.1, sogutici:'R410A', besleme:'3×380V', notlar:'Küçük ofis/ticari' },
    { model:'Scroll Chiller',         minKW:50,  maxKW:300,  tip:'scroll',  COP:3.5, IPLV:4.5, sogutici:'R410A', besleme:'3×380V', notlar:'Orta ölçekli bina' },
    { model:'Vidalı (Screw) Chiller', minKW:200, maxKW:1200, tip:'screw',   COP:4.2, IPLV:5.8, sogutici:'R134a', besleme:'3×400V', notlar:'Büyük ticari/endüstriyel' },
    { model:'Manyetik Levitation',    minKW:300, maxKW:2000, tip:'centrifugal', COP:5.5, IPLV:9.2, sogutici:'R134a', besleme:'3×400V', notlar:'Premium enerji tasarrufu' },
    { model:'Santrifüj Chiller',      minKW:500, maxKW:5000, tip:'centrifugal', COP:4.8, IPLV:6.5, sogutici:'R134a', besleme:'3×400V', notlar:'Büyük ölçekli' },
    { model:'Absorbsiyonlu Chiller',  minKW:100, maxKW:5000, tip:'absorption', COP:0.7, IPLV:1.1, sogutici:'LiBr/Su', besleme:'Atık ısı/Doğalgaz', notlar:'Kojenerasyon uyumlu' },
    { model:'Isı Pompası Chiller',    minKW:30,  maxKW:500,  tip:'heat-pump', COP:3.8, IPLV:5.2, sogutici:'R32', besleme:'3×380V', notlar:'Soğutma + Isıtma' },
  ];

  // Enerji sınıflandırması (EUROVENT / EN 14511)
  function energyClass(COP) {
    if (COP >= 5.5) return { cls: 'A+++', color: '#10b981' };
    if (COP >= 4.8) return { cls: 'A++',  color: '#34d399' };
    if (COP >= 4.2) return { cls: 'A+',   color: '#6ee7b7' };
    if (COP >= 3.5) return { cls: 'A',    color: '#fbbf24' };
    if (COP >= 3.0) return { cls: 'B',    color: '#f97316' };
    return               { cls: 'C',    color: '#ef4444' };
  }

  /**
   * @param {number} Q_kW — toplam soğutma yükü (kW)
   * @param {number} sf   — emniyet faktörü (varsayılan 1.15)
   * @param {string} tip  — tercih: 'scroll'|'screw'|'centrifugal'|'absorption'|'heat-pump'|'auto'
   */
  function select(Q_kW, sf = 1.15, tip = 'auto') {
    const Q_design = Q_kW * sf;
    const Q_TR = Q_kW / 3.517; // Ton Refrigeration

    const candidates = CHILLER_DB.filter(c => {
      if (tip !== 'auto' && c.tip !== tip) return false;
      return c.minKW <= Q_design && c.maxKW >= Q_design;
    });

    if (!candidates.length) {
      // Kapasiteye en yakın bul
      candidates.push(...CHILLER_DB.filter(c => c.maxKW >= Q_design)
        .sort((a, b) => a.minKW - b.minKW).slice(0, 2));
    }

    return {
      Q_kW, Q_TR: +Q_TR.toFixed(1), Q_design: +Q_design.toFixed(1), sf,
      candidates: candidates.map(c => ({
        ...c,
        ec: energyClass(c.COP),
        yillikEnerji: +(Q_kW / c.COP * 2200).toFixed(0), // kWh/yıl (2200h/yıl)
        yillikMaliyet: +(Q_kW / c.COP * 2200 * 3.5).toFixed(0), // TL (3.5 TL/kWh)
      })),
    };
  }

  function renderCard(res) {
    if (!res?.candidates?.length) return '<div style="color:var(--rd);padding:10px;">Uygun chiller bulunamadı.</div>';
    const rows = res.candidates.map(c => `
      <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:7px;padding:10px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-weight:700;font-size:11px;color:var(--tx);">${c.model}</div>
          <span style="padding:3px 8px;border-radius:12px;font-size:10px;font-weight:700;background:${c.ec.color}22;color:${c.ec.color};border:1px solid ${c.ec.color}44;">${c.ec.cls}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:9px;font-family:var(--mono);">
          <div><div style="color:var(--mt);">KAPASİTE</div><div style="color:var(--cy);font-weight:700;">${c.minKW}–${c.maxKW} kW</div></div>
          <div><div style="color:var(--mt);">COP</div><div style="color:var(--gr);font-weight:700;">${c.COP}</div></div>
          <div><div style="color:var(--mt);">IPLV</div><div style="color:var(--bl);font-weight:700;">${c.IPLV}</div></div>
          <div><div style="color:var(--mt);">SOĞUTUCU</div><div style="color:var(--tx);font-weight:700;">${c.sogutici}</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9px;font-family:var(--mono);">
          <div><span style="color:var(--mt);">` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Annual energy: ' : 'Yıllık enerji: ') + `</span><span style="color:var(--gd);">${c.yillikEnerji.toLocaleString((typeof LANG !== 'undefined' && LANG === 'en') ? 'en-US' : 'tr-TR')} kWh</span></div>
          <div><span style="color:var(--mt);">` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'Est. cost: ' : 'Est. maliyet: ') + `</span><span style="color:var(--rd);">${c.yillikMaliyet.toLocaleString((typeof LANG !== 'undefined' && LANG === 'en') ? 'en-US' : 'tr-TR')} ` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'TL/year' : 'TL/yıl') + `</span></div>
        </div>
        <div style="font-size:8px;color:var(--mt);">${c.notlar} | ${c.besleme}</div>
      </div>`).join('');

    return `
    <div class="mod-result-card" style="border-color:rgba(59,130,246,.3);">
      <div class="mod-result-hd" style="color:var(--bl);">❄ CHİLLER SEÇİM SONUCU</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
        <div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">TASARIM YÜKÜ</div>
          <div style="font-size:20px;font-weight:700;color:var(--bl);font-family:var(--mono);">${res.Q_design}</div>
          <div style="font-size:9px;color:var(--mt);">kW (×${res.sf} em.)</div>
        </div>
        <div style="background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">SOĞUTMA GÜCÜ</div>
          <div style="font-size:20px;font-weight:700;color:var(--cy);font-family:var(--mono);">${res.Q_kW}</div>
          <div style="font-size:9px;color:var(--mt);">kW (${res.Q_TR} TR)</div>
        </div>
        <div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">UYGUN SEÇENEK</div>
          <div style="font-size:20px;font-weight:700;color:var(--gr);font-family:var(--mono);">${res.candidates.length}</div>
          <div style="font-size:9px;color:var(--mt);">adet model</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
    </div>`;
  }

  return { select, renderCard, energyClass };
})();
window.ChillerSelect = ChillerSelect;

// ───────────────────────────────────────────────────────────────────
// 8. FAN SEÇİMİ & AKUSTİK
// ───────────────────────────────────────────────────────────────────
const FanSelect = (() => {
  'use strict';

  // Fan veritabanı (kaba seçim referans tablosu)
  const FAN_DB = [
    { tip:'Aksiyel (Pervane)',    minQ:500,  maxQ:50000, minSP:20,  maxSP:200,  eta:0.55, Lw_ref:78, notlar:'Düşük basınç, yüksek debi' },
    { tip:'Eksenel Yüksek Bsn.', minQ:1000, maxQ:30000, minSP:200, maxSP:800,  eta:0.65, Lw_ref:82, notlar:'Sanayi egzoz, kanal' },
    { tip:'Santrifüj (Geri Eğr)',minQ:500,  maxQ:80000, minSP:50,  maxSP:2000, eta:0.75, Lw_ref:76, notlar:'Kanal sistemleri (AHU)' },
    { tip:'Santrifüj (İleri Eğr)',minQ:200, maxQ:20000, minSP:30,  maxSP:500,  eta:0.55, Lw_ref:80, notlar:'Radyal, kompakt' },
    { tip:'Çapraz Akışlı',       minQ:100,  maxQ:2000,  minSP:10,  maxSP:100,  eta:0.35, Lw_ref:68, notlar:'Fan-coil, klima santrali' },
    { tip:'Karışık Akışlı',      minQ:500,  maxQ:40000, minSP:100, maxSP:1000, eta:0.70, Lw_ref:74, notlar:'Yüksek verimli AHU fanı' },
    { tip:'Köşegen (Diagonal)',   minQ:1000, maxQ:25000, minSP:50,  maxSP:600,  eta:0.68, Lw_ref:72, notlar:'Kompakt kanal fanı' },
  ];

  /**
   * Fan seç ve akustik hesapla
   * @param {number} Q_m3h   — debi (m³/h)
   * @param {number} SP_Pa   — statik basınç (Pa)
   * @param {number} rho     — hava yoğunluğu (kg/m³), std: 1.2
   */
  function select(Q_m3h, SP_Pa, rho = 1.2) {
    const Q_m3s = Q_m3h / 3600;

    const candidates = FAN_DB.filter(f =>
      f.minQ <= Q_m3h && f.maxQ >= Q_m3h &&
      f.minSP <= SP_Pa && f.maxSP >= SP_Pa
    );

    const results = (candidates.length ? candidates : FAN_DB).map(f => {
      // Motor gücü (W) = Q × SP / (η × 1000)
      const P_motor_kW = (Q_m3s * SP_Pa) / (f.eta * 1000);
      // Seçilen motor gücü (standart IEC kW)
      const iecSizes = [0.09,0.12,0.18,0.25,0.37,0.55,0.75,1.1,1.5,2.2,3,4,5.5,7.5,11,15,18.5,22,30,37,45,55,75,90,110,132,160,200];
      const P_iec = iecSizes.find(s => s >= P_motor_kW * 1.2) || P_motor_kW * 1.3;

      // Özgül güç sayısı (SFP — W/(m³/h))
      const SFP = (P_iec * 1000) / Q_m3h;

      // Ses gücü seviyesi (VDI 2081 basitleştirilmiş)
      // Lw = Lw_ref + 10·log(Q/Q_ref) + 20·log(SP/SP_ref)
      const Lw = f.Lw_ref + 10 * Math.log10(Q_m3h / 1000) + 20 * Math.log10(SP_Pa / 100);

      // Fan özgül hız (dimensionless)
      const n = 1500; // rpm (4 kutuplu)
      const ns = n * Math.sqrt(Q_m3s) / Math.pow(SP_Pa / rho, 0.75);

      return {
        tip: f.tip,
        eta: f.eta,
        notlar: f.notlar,
        P_motor_kW: +P_motor_kW.toFixed(3),
        P_iec_kW: P_iec,
        SFP: +SFP.toFixed(1),
        Lw_dB: +Lw.toFixed(1),
        sfpSinif: SFP < 500 ? 'SFP 1 (Çok İyi)' : SFP < 750 ? 'SFP 2 (İyi)' : SFP < 1250 ? 'SFP 3 (Normal)' : 'SFP 4+',
        sfpColor: SFP < 500 ? 'var(--gr)' : SFP < 750 ? 'var(--cy)' : SFP < 1250 ? 'var(--gd)' : 'var(--rd)',
      };
    });

    return { Q_m3h, SP_Pa, results,
      // UI uyum adaptoru: en iyi fani duz alanlara da koy (results[] korunur)
      tip: results[0] ? results[0].tip : null,
      q_m3h: Q_m3h,
      motor_kW: results[0] ? results[0].P_iec_kW : null,
      verim: results[0] ? results[0].eta : null };
  }

  function renderCard(res) {
    if (!res?.results?.length) return '<div style="color:var(--rd);padding:10px;">Hesap yapılamadı.</div>';
    const rows = res.results.map(f => `
      <tr style="border-bottom:1px solid var(--bdr);">
        <td style="padding:6px 8px;font-size:10px;font-weight:600;color:var(--tx);">${f.tip}</td>
        <td style="padding:6px 8px;font-family:var(--mono);font-size:10px;text-align:center;color:var(--gr);">${(f.eta*100).toFixed(0)}%</td>
        <td style="padding:6px 8px;font-family:var(--mono);font-size:10px;text-align:center;color:var(--gd);">${f.P_iec_kW} kW</td>
        <td style="padding:6px 8px;font-family:var(--mono);font-size:10px;text-align:center;color:${f.sfpColor};">${f.SFP}</td>
        <td style="padding:6px 8px;font-family:var(--mono);font-size:10px;text-align:center;color:var(--cy);">${f.Lw_dB} dB(A)</td>
        <td style="padding:6px 8px;font-size:9px;color:var(--mt);">${f.notlar}</td>
      </tr>`).join('');

    return `
    <div class="mod-result-card" style="border-color:rgba(139,92,246,.3);">
      <div class="mod-result-hd" style="color:var(--pu);">💨 FAN SEÇİM & AKUSTİK SONUCU</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px;">
        <div style="background:rgba(139,92,246,.06);border:1px solid rgba(139,92,246,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">` + ((typeof LANG !== 'undefined' && LANG === 'en') ? 'FLOW RATE' : 'DEBİ') + `</div>
          <div style="font-size:18px;font-weight:700;color:var(--pu);font-family:var(--mono);">${res.Q_m3h.toLocaleString((typeof LANG !== 'undefined' && LANG === 'en') ? 'en-US' : 'tr-TR')}</div>
          <div style="font-size:9px;color:var(--mt);">m³/h</div>
        </div>
        <div style="background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:6px;padding:8px;text-align:center;">
          <div style="font-size:8px;color:var(--mt);font-family:var(--mono);">STATİK BASINÇ</div>
          <div style="font-size:18px;font-weight:700;color:var(--cy);font-family:var(--mono);">${res.SP_Pa}</div>
          <div style="font-size:9px;color:var(--mt);">Pa</div>
        </div>
      </div>
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:10px;">
          <thead>
            <tr style="background:var(--bg3);border-bottom:2px solid var(--bdr);">
        
              <th style="padding:6px 8px;text-align:left;font-size:9px;color:var(--mt);">Fan Tipi</th>
              <th style="padding:6px 8px;text-align:center;font-size:9px;color:var(--mt);">Verim &eta;</th>
              <th style="padding:6px 8px;text-align:center;font-size:9px;color:var(--mt);">Motor</th>
              <th style="padding:6px 8px;text-align:center;font-size:9px;color:var(--mt);">SFP</th>
              <th style="padding:6px 8px;text-align:center;font-size:9px;color:var(--mt);">Ses</th>
              <th style="padding:6px 8px;text-align:left;font-size:9px;color:var(--mt);">Notlar</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
  }

  return { select, renderCard };
})();
window.FanSelect = FanSelect;
