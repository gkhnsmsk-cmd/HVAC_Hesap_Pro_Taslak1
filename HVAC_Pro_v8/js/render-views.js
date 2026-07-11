// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — Görünüm Render Fonksiyonları (render-views.js)
// Isı kaybı, ısı kazancı, EK-1, EK-2 mahal kartları
// ═══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// TAB NAVİGASYON
// ══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// ISI KAYBI ÇİZELGESİ – MAHAL BAZLI KART
// ══════════════════════════════════════════════════════
function renderIsiKaybi(R, P){
  const n = v => isNaN(+v)?0:(+v||0);
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const fmt = (v,d=0) => n(v).toLocaleString(_isEN?'en-US':'tr-TR',{maximumFractionDigits:d});
  const ruz = n(P.ruzgarZam)||1.07;
  const emF = 1+n(P.emIst)/100;

  let totalKayip = R.reduce((s,r)=>s+n(r.qKayip),0);

  let hdr = `<div style="padding:12px 16px;background:var(--bg3);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:13px;font-weight:700;color:var(--rd);">🔵 ISI KAYBI ÇİZELGESİ – KIŞ ISINMA HESABI</div>
      <div style="font-size:10px;color:var(--mt);font-family:var(--mono);margin-top:4px;">${P.sehir||'–'} · Kış KT: ${P.kisKt}°C · Rüzgar: ×${ruz} · Isıtma Em: %${n(P.emIst)} · Hesaplayan: ${P.kim||'–'}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--rd);">${fmt(totalKayip/1000,1)} kW</div>
      <div style="font-size:9px;color:var(--mt);">Toplam Isıtma Kaybı · ${R.length} mahal</div>
    </div>
  </div>`;

  let cards = R.map(r=>{
    const dtK = n(r.dtKis)||Math.max(0,n(r.Tic_kis||20)-n(P.kisKt));
    const qDuv = n(r.qDuvarKis);
    const qPen = n(r.qPencKis);
    const qDos = n(r.qDosKis);
    const qTav = n(r.qTavKis);
    const ham = qDuv+qPen+qDos+qTav;
    const withRuz = ham*ruz;
    const final = n(r.qKayip);
    const pencA = r.pencAlani?Object.values(r.pencAlani).reduce((a,v)=>a+n(v),0):0;
    const duvA = r.duvarAlani?Object.values(r.duvarAlani).reduce((a,v)=>a+n(v),0):0;
    const td = r.thData||{};
    const thIstYuk = P.thIstEkle ? Math.round(n(td.thIst)) : 0;
    const finalPlusTh = final + thIstYuk;

    // Yön bazlı duvar ve pencere detayları
    let yonDetay = '';
    const YONLER_TR = ['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
    const yonLabel = {'kuzey':'K','güney':'G','doğu':'D','batı':'B','kuzeydoğu':'KD','güneydoğu':'GD','güneybatı':'GB','kuzeybatı':'KB'};
    YONLER_TR.forEach(y=>{
      const da = r.duvarAlani?n(r.duvarAlani[y]):0;
      const pa = r.pencAlani?n(r.pencAlani[y]):0;
      if(da>0||pa>0){
        yonDetay += `<div class="rc-row"><span class="rc-lbl">${yonLabel[y]} Duvar</span><span class="rc-val">${fmt(da,1)} m² × ${fmt(r.uDuv||0.45,3)} × ${fmt(dtK,1)}°C = <strong>${fmt(da*(r.uDuv||0.45)*dtK,0)} W</strong></span></div>`;
        if(pa>0) yonDetay += `<div class="rc-row"><span class="rc-lbl">${yonLabel[y]} Pencere</span><span class="rc-val">${fmt(pa,1)} m² × ${fmt(r.uPenc||2.1,2)} × ${fmt(dtK,1)}°C = <strong>${fmt(pa*(r.uPenc||2.1)*dtK,0)} W</strong></span></div>`;
      }
    });

    return `<div class="room-card">
      <div class="room-card-hd" style="border-left:4px solid var(--rd);">
        <span class="room-card-no">${r.mahalNo||'–'}</span>
        <span class="room-card-name">${r.mahalAdi||'–'}</span>
        <span style="font-size:9px;color:var(--mt);font-family:var(--mono);">${r.mahalTip||''} · ${fmt(r.alan)} m² · İç ${n(r.Tic_kis)||20}°C · ΔT ${fmt(dtK,1)}°C</span>
        <span class="room-card-total" style="color:var(--rd);">${fmt(final)} W</span>
      </div>
      <div style="padding:10px 14px;">
        <div style="font-size:8px;color:var(--rd);font-family:var(--mono);letter-spacing:1px;margin-bottom:8px;">YÜZEYLERDEKİ ISI KAYIPLARI (Q = U × A × ΔT)</div>
        ${yonDetay}
        <div class="rc-row"><span class="rc-lbl">Döşeme (U=${fmt(r.uDos||0.50,3)})</span><span class="rc-val">${fmt(r.dosA||r.alan,1)} m² × ${fmt(r.uDos||0.50,3)} × ${fmt(dtK,1)}°C = <strong>${fmt(qDos,0)} W</strong></span></div>
        <div class="rc-row"><span class="rc-lbl">Tavan (U=${fmt(r.uTav||0.35,3)})</span><span class="rc-val">${fmt(r.tavanA||0,1)} m² × ${fmt(r.uTav||0.35,3)} × ${fmt(dtK,1)}°C = <strong>${fmt(qTav,0)} W</strong></span></div>
        <div style="height:1px;background:var(--bdr);margin:8px 0;"></div>
        <div class="rc-row"><span class="rc-lbl" style="font-weight:700;">Ham Toplam</span><span class="rc-val" style="font-weight:700;">${fmt(ham,0)} W</span></div>
        <div class="rc-row"><span class="rc-lbl">× Rüzgar Katsayısı</span><span class="rc-val">× ${fmt(ruz,2)} → ${fmt(withRuz,0)} W</span></div>
        ${emF>1?`<div class="rc-row"><span class="rc-lbl">× Emniyet (${n(P.emIst)}%)</span><span class="rc-val">× ${fmt(emF,2)} → ${fmt(final,0)} W</span></div>`:''}
        <div style="height:1px;background:var(--bdr);margin:6px 0;"></div>
        <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1px;margin-bottom:4px;">HAVALANDIRMA ISI KAYBI</div>
        <div class="rc-row"><span class="rc-lbl">TH Isıtma Yükü</span><span class="rc-val" style="color:${P.thIstEkle?'var(--gd)':'var(--mt)'};">${fmt(n(td.thIst),0)} W ${P.thIstEkle?'✔ (eklendi)':'(seçilmedi)'}</span></div>
        ${P.thIstEkle?`<div class="rc-row"><span class="rc-lbl" style="color:var(--rd);font-weight:700;">ISINMA Q + HVL. TOPLAM</span><span class="rc-val" style="color:var(--rd);font-weight:700;">${fmt(finalPlusTh,0)} W</span></div>`:''}
      </div>
      <div class="room-summary-bar">
        <div class="rsb-item"><div class="rsb-lbl">ISINMA KAYBI</div><div class="rsb-val" style="color:var(--rd);">${fmt(final,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">kW</div><div class="rsb-val" style="color:var(--rd);">${fmt(final/1000,2)}</div></div>
        <div class="rsb-item"><div class="rsb-lbl">W/m²</div><div class="rsb-val">${r.alan>0?fmt(final/n(r.alan),0):'–'}</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Duvar Q</div><div class="rsb-val">${fmt(qDuv,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Pencere Q</div><div class="rsb-val">${fmt(qPen,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Döşeme Q</div><div class="rsb-val">${fmt(qDos,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Tavan Q</div><div class="rsb-val">${fmt(qTav,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Hvl. Isı Kayb.</div><div class="rsb-val" style="color:${P.thIstEkle?'var(--gd)':'var(--mt)'};">${fmt(thIstYuk,0)} W</div></div>
      </div>
    </div>`;
  }).join('');

  const _ikEl = document.getElementById('ik-content'); if (_ikEl) _ikEl.innerHTML = hdr + `<div class="room-cards-grid">${cards}</div>`;
}

// ══════════════════════════════════════════════════════
// ISI KAZANCI ÇİZELGESİ – MAHAL BAZLI KART
// ══════════════════════════════════════════════════════
function renderIsiKazanci(R, P){
  const n = v => isNaN(+v)?0:(+v||0);
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const fmt = (v,d=0) => n(v).toLocaleString(_isEN?'en-US':'tr-TR',{maximumFractionDigits:d});
  const AY_AD=['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const emF = 1+(n(P.emSog))/100;

  let totalSog = R.reduce((s,r)=>s+n(r.bestLoad),0);

  let hdr = `<div style="padding:12px 16px;background:var(--bg3);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:13px;font-weight:700;color:var(--cy);">🔴 ISI KAZANCI ÇİZELGESİ – YAZ SOĞUTMA HESABI</div>
      <div style="font-size:10px;color:var(--mt);font-family:var(--mono);margin-top:4px;">${P.sehir||'–'} · Yaz KT: ${P.Tmax}°C · SHGC: ${P.shgc} · Soğ.Em: %${n(P.emSog)} · ASHRAE CLTD/CLF · Peak ay: Mayıs–Eylül</div>
    </div>
    <div style="text-align:right;">
      <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--cy);">${fmt(totalSog/1000,1)} kW</div>
      <div style="font-size:9px;color:var(--mt);">Toplam Soğutma Yükü · ${R.length} mahal</div>
    </div>
  </div>`;

  let cards = R.map(r=>{
    const pk = r.peak||{};
    const qCam = n(pk.qCam);
    const qDuv = n(pk.qDuvar);
    const qPencIlet = n(pk.qPencIlet);
    const qTav = n(pk.qTavan);
    const qDos = n(pk.qDoseme);
    const qIcDuy = n(pk.qIcDuy);
    const qIcGiz = n(pk.qIcGiz);
    const rsh = n(pk.rsh);
    const rlh = n(pk.rlh);
    const ersh = n(pk.ersh);
    const erlh = n(pk.erlh);
    const gth = n(r.bestLoad);
    const Tdis = n(pk.Tdis)||n(P.Tmax);
    const dT = Math.max(0, Tdis - n(r.Tic_yaz||24));
    const td = r.thData||{};
    const thSogYuk = P.thSogEkle ? Math.round(n(td.thSogT)) : 0;

    // Yön bazlı cam detayları
    let camDetay = '';
    const YONLER_TR = ['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
    const yonLabel = {'kuzey':'K','güney':'G','doğu':'D','batı':'B','kuzeydoğu':'KD','güneydoğu':'GD','güneybatı':'GB','kuzeybatı':'KB'};
    let hasCam = false;
    YONLER_TR.forEach(y=>{
      const pa = r.pencAlani?n(r.pencAlani[y]):0;
      if(pa>0){ hasCam=true; camDetay += `<div class="rc-row"><span class="rc-lbl">${yonLabel[y]} Cam Rad</span><span class="rc-val">${fmt(pa,1)} m² · SHGF×SC×CLF</span></div>`; }
    });
    if(!hasCam) camDetay = `<div class="rc-row"><span class="rc-lbl">Cam Radyasyonu</span><span class="rc-val">Cam yok / 0 W</span></div>`;

    return `<div class="room-card">
      <div class="room-card-hd" style="border-left:4px solid var(--cy);">
        <span class="room-card-no">${r.mahalNo||'–'}</span>
        <span class="room-card-name">${r.mahalAdi||'–'}</span>
        <span style="font-size:9px;color:var(--mt);font-family:var(--mono);">${r.mahalTip||''} · ${fmt(r.alan)} m² · Peak: ${AY_AD[r.bestAy]||'–'} ${r.bestSaat||'–'}:00 · Dış ${fmt(Tdis,1)}°C / İç ${n(r.Tic_yaz||24)}°C</span>
        <span class="room-card-total" style="color:var(--cy);">${fmt(gth,0)} W</span>
      </div>
      <div style="padding:10px 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div>
          <div style="font-size:8px;color:var(--cy);font-family:var(--mono);letter-spacing:1px;margin-bottom:6px;">DIŞ KAYNAKLI KAZANIMLAR</div>
          ${camDetay}
          <div class="rc-row"><span class="rc-lbl">Cam Rad TOPLAM (SHGF×SC×CLF)</span><span class="rc-val" style="color:var(--gd);font-weight:700;">${fmt(qCam,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Dış Duvar CLTD (U×A×CLTD)</span><span class="rc-val">${fmt(n(r.duvarAlani?(()=>{let s=0;YONLER_TR.forEach(y=>s+=n(r.duvarAlani[y]));return s;})():0),1)} m² → ${fmt(qDuv,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Pencere İletim (U×A×ΔT)</span><span class="rc-val">${fmt(n(r.pencAlani?(()=>{let s=0;YONLER_TR.forEach(y=>s+=n(r.pencAlani[y]));return s;})():0),1)} m² → ${fmt(qPencIlet,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Tavan CLTD</span><span class="rc-val">${fmt(r.tavanA||0,1)} m² → ${fmt(qTav,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Döşeme</span><span class="rc-val">${fmt(r.dosA||r.alan||0,1)} m² → ${fmt(qDos,0)} W</span></div>
        </div>
        <div>
          <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1px;margin-bottom:6px;">İÇ YÜKLER</div>
          <div class="rc-row"><span class="rc-lbl">İnsanlar Duyulur</span><span class="rc-val">${r.nOturan||0}×66 + ${r.nAyakta||0}×64 = ${fmt(r.insDuy,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Cihazlar + TV</span><span class="rc-val">${n(r.alan)>0?fmt((n(r.qTV)+n(r.qCihaz))/n(r.alan),1):'0'} W/m² × ${fmt(n(r.alan),1)}m² = ${fmt(n(r.qTV)+n(r.qCihaz),0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Aydınlatma</span><span class="rc-val">${fmt(r.alan,1)}m²×${r.aydW||20}W/m²×${fmt(P.fAyd,2)} = ${fmt(r.qAyd,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">İnsanlar Gizli</span><span class="rc-val">${r.nOturan||0}×60 + ${r.nAyakta||0}×52 = ${fmt(r.insGiz,0)} W</span></div>
          <div style="height:1px;background:var(--bdr);margin:6px 0;"></div>
          <div style="font-size:8px;color:var(--pu);font-family:var(--mono);letter-spacing:1px;margin-bottom:4px;">SOĞUTMA HESAP AŞAMALARI</div>
          <div class="rc-row"><span class="rc-lbl">Rsh (Oda Duy. ×Oda Zam)</span><span class="rc-val" style="font-weight:600;">${fmt(rsh,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Rlh (Oda Gizli ×Oda Zam)</span><span class="rc-val">${fmt(rlh,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Ersh (×Eff Zam)</span><span class="rc-val">${fmt(ersh,0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">Erlh</span><span class="rc-val">${fmt(erlh,0)} W</span></div>
          <div style="height:1px;background:var(--bdr);margin:6px 0;"></div>
          <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1px;margin-bottom:4px;">HAVALANDIRMA ISI YÜKÜ</div>
          <div class="rc-row"><span class="rc-lbl">TH Duy. Soğ.</span><span class="rc-val">${fmt(n(td.thSogS),0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl">TH Gizli Soğ.</span><span class="rc-val">${fmt(n(td.thSogL),0)} W</span></div>
          <div class="rc-row"><span class="rc-lbl" style="color:${P.thSogEkle?'var(--pu)':'var(--mt)'};">TH Soğ. Toplam</span><span class="rc-val" style="color:${P.thSogEkle?'var(--pu)':'var(--mt)'};">${fmt(n(td.thSogT),0)} W ${P.thSogEkle?'✔':'(seçilmedi)'}</span></div>
        </div>
      </div>
      <div class="room-summary-bar" style="border-top:2px solid var(--cy);">
        <div class="rsb-item"><div class="rsb-lbl">SOĞUTMA Gth</div><div class="rsb-val" style="color:var(--cy);">${fmt(gth,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">kW</div><div class="rsb-val" style="color:var(--cy);">${fmt(gth/1000,2)}</div></div>
        <div class="rsb-item"><div class="rsb-lbl">TR</div><div class="rsb-val">${fmt(gth/3517,2)}</div></div>
        <div class="rsb-item"><div class="rsb-lbl">W/m²</div><div class="rsb-val">${r.alan>0?fmt(gth/n(r.alan),0):'–'}</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Cam Rad</div><div class="rsb-val" style="color:var(--gd);">${fmt(qCam,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">Duvar</div><div class="rsb-val">${fmt(qDuv,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">İç Yük (Duy)</div><div class="rsb-val">${fmt(qIcDuy,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl">İç Yük (Giz)</div><div class="rsb-val">${fmt(qIcGiz,0)} W</div></div>
        <div class="rsb-item"><div class="rsb-lbl" style="color:${P.thSogEkle?'var(--pu)':'var(--mt)'};">Hvl. Soğ. Yük</div><div class="rsb-val" style="color:${P.thSogEkle?'var(--pu)':'var(--mt)'};">${fmt(thSogYuk,0)} W</div></div>
      </div>
    </div>`;
  }).join('');

  const _igEl = document.getElementById('ig-content'); if (_igEl) _igEl.innerHTML = hdr + `<div class="room-cards-grid">${cards}</div>`;
}

// ══════════════════════════════════════════════════════
// EK-1: ISI KAYBI MAHAL KARTLARI (Tek mahal – tam detay)
// ══════════════════════════════════════════════════════
function renderEk1MahalKartlari(R, P){
  const n = v => isNaN(+v)?0:(+v||0);
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const fmt = (v,d=0) => n(v).toLocaleString(_isEN?'en-US':'tr-TR',{maximumFractionDigits:d});
  const ruz = n(P.ruzgarZam)||1.07;
  const emF = 1+n(P.emIst)/100;
  const totalKayip = R.reduce((s,r)=>s+n(r.qKayip),0);
  const YONLER_TR = ['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
  const yonLabel = {'kuzey':'Kuzey','güney':'Güney','doğu':'Doğu','batı':'Batı','kuzeydoğu':'K.Doğu','güneydoğu':'G.Doğu','güneybatı':'G.Batı','kuzeybatı':'K.Batı'};

  let hdr = `<div style="padding:12px 16px;background:linear-gradient(135deg,rgba(239,68,68,.15),rgba(239,68,68,.05));border-bottom:2px solid var(--rd);display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:14px;font-weight:800;color:var(--rd);letter-spacing:1px;">EK-1 – ISI KAYBI MAHAL KARTLARI</div>
      <div style="font-size:10px;color:var(--mt);font-family:var(--mono);margin-top:4px;">${P.sehir||'–'} · Kış KT: ${P.kisKt}°C · Rüzgar: ×${ruz} · Isıtma Em: %${n(P.emIst)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--rd);">${fmt(totalKayip/1000,1)} kW</div>
      <div style="font-size:9px;color:var(--mt);">Toplam Isıtma Yükü · ${R.length} mahal</div>
    </div>
  </div>`;

  const cards = R.map((r,idx)=>{
    const dtK = n(r.dtKis)||Math.max(0,n(r.Tic_kis||20)-n(P.kisKt));
    const qDuv = Math.round(n(r.qDuvarKis));
    const qPen = Math.round(n(r.qPencKis));
    const qDos = Math.round(n(r.qDosKis));
    const qTav = Math.round(n(r.qTavKis));
    const ham = qDuv+qPen+qDos+qTav;
    const withRuz = Math.round(ham*ruz);
    const final = Math.round(withRuz*emF);
    const alan = n(r.alan);
    const td = r.thData||{};
    const thFlow = n(td.th);
    const exFlow = n(td.egzoz);

    let yuzeyRows = '';
    YONLER_TR.forEach(y=>{
      const da = r.duvarAlani?n(r.duvarAlani[y]):0;
      const pa = r.pencAlani?n(r.pencAlani[y]):0;
      if(da>0) yuzeyRows += `<tr><td>${yonLabel[y]} Duvar</td><td>${fmt(da,1)} m²</td><td>${fmt(r.uDuv||0.45,3)}</td><td>${fmt(dtK,1)}°C</td><td style="color:var(--rd);font-weight:600;">${fmt(da*(r.uDuv||0.45)*dtK,0)} W</td></tr>`;
      if(pa>0) yuzeyRows += `<tr><td>${yonLabel[y]} Pencere</td><td>${fmt(pa,1)} m²</td><td>${fmt(r.uPenc||2.1,2)}</td><td>${fmt(dtK,1)}°C</td><td style="color:var(--rd);font-weight:600;">${fmt(pa*(r.uPenc||2.1)*dtK,0)} W</td></tr>`;
    });
    yuzeyRows += `<tr><td>Döşeme</td><td>${fmt(r.dosA||alan,1)} m²</td><td>${fmt(r.uDos||0.50,3)}</td><td>${fmt(dtK,1)}°C</td><td style="color:var(--rd);font-weight:600;">${fmt(qDos,0)} W</td></tr>`;
    yuzeyRows += `<tr><td>Tavan</td><td>${fmt(r.tavanA||0,1)} m²</td><td>${fmt(r.uTav||0.35,3)}</td><td>${fmt(dtK,1)}°C</td><td style="color:var(--rd);font-weight:600;">${fmt(qTav,0)} W</td></tr>`;

    return `<div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:10px;overflow:hidden;margin-bottom:2px;">
      <!-- Kart Başlık -->
      <div style="background:linear-gradient(90deg,rgba(239,68,68,.18),var(--bg3));padding:10px 16px;border-bottom:2px solid var(--rd);display:flex;align-items:center;gap:12px;">
        <span style="background:var(--rd);color:#fff;font-family:var(--mono);font-size:11px;font-weight:700;padding:4px 10px;border-radius:5px;min-width:60px;text-align:center;">${r.mahalNo||'–'}</span>
        <span style="font-size:13px;font-weight:800;flex:1;">${r.mahalAdi||'–'}</span>
        <span style="font-family:var(--mono);font-size:10px;color:var(--mt);background:var(--bg4);padding:3px 8px;border-radius:4px;">${r.mahalTip||'OFİS'}</span>
        <span style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--rd);">${fmt(final,0)} W</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--mt);">${fmt(final/1000,2)} kW</span>
      </div>
      <!-- İki Kolon -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;">
        <!-- Sol: Mahal Bilgileri + Yüzeyler -->
        <div style="padding:12px 14px;border-right:1px solid var(--bdr);">
          <div style="font-size:8px;color:var(--rd);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Mahal Bilgileri</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);margin-bottom:12px;">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Alan</td><td style="font-weight:600;text-align:right;">${fmt(alan,1)} m²</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Yükseklik</td><td style="font-weight:600;text-align:right;">${fmt(r.h||3,1)} m</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Hacim</td><td style="font-weight:600;text-align:right;">${fmt(alan*(r.h||3),1)} m³</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İç KT (Kış)</td><td style="font-weight:600;text-align:right;">${n(r.Tic_kis)||20}°C</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Dış KT (Kış)</td><td style="font-weight:600;text-align:right;">${P.kisKt}°C</td></tr>
            <tr><td style="color:var(--gd);padding:3px 0;font-weight:700;">ΔT</td><td style="font-weight:700;color:var(--gd);text-align:right;">${fmt(dtK,1)}°C</td></tr>
          </table>
          <div style="font-size:8px;color:var(--rd);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Yüzey Isı Kayıpları (Q = U × A × ΔT)</div>
          <table style="width:100%;border-collapse:collapse;font-size:9px;font-family:var(--mono);">
            <tr style="background:var(--bg4);"><th style="text-align:left;padding:3px 4px;color:var(--mt);">Yüzey</th><th style="padding:3px 4px;color:var(--mt);">Alan</th><th style="padding:3px 4px;color:var(--mt);">U</th><th style="padding:3px 4px;color:var(--mt);">ΔT</th><th style="padding:3px 4px;color:var(--mt);">Q</th></tr>
            ${yuzeyRows}
          </table>
        </div>
        <!-- Sağ: Hesap Aşamaları + Havalandırma -->
        <div style="padding:12px 14px;">
          <div style="font-size:8px;color:var(--rd);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Isı Kaybı Hesap Aşamaları</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);margin-bottom:12px;">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Duvar Toplam</td><td style="text-align:right;">${fmt(qDuv,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Pencere Toplam</td><td style="text-align:right;">${fmt(qPen,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Döşeme</td><td style="text-align:right;">${fmt(qDos,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Tavan</td><td style="text-align:right;">${fmt(qTav,0)} W</td></tr>
            <tr style="border-bottom:2px solid var(--bdr);"><td style="color:var(--mt);padding:3px 0;">Ham Toplam</td><td style="font-weight:700;text-align:right;">${fmt(ham,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">× Rüzgar (${fmt(ruz,2)})</td><td style="text-align:right;">${fmt(withRuz,0)} W</td></tr>
            ${emF>1?`<tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">× Emniyet (%${n(P.emIst)})</td><td style="text-align:right;">${fmt(final,0)} W</td></tr>`:''}
            <tr style="background:rgba(239,68,68,.08);border-top:2px solid var(--rd);"><td style="color:var(--rd);font-weight:700;padding:4px 0;">ISINMA Q TOPLAM</td><td style="color:var(--rd);font-weight:700;text-align:right;font-size:13px;">${fmt(final,0)} W</td></tr>
          </table>
          <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Havalandırma</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Taze Hava</td><td style="font-weight:600;color:var(--gr);text-align:right;">${fmt(thFlow,1)} L/s (${ceilTo5(Math.round(thFlow*3.6))} m³/h)</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Egzoz</td><td style="font-weight:600;color:var(--cy);text-align:right;">${fmt(exFlow,1)} L/s (${ceilTo5(Math.round(exFlow*3.6))} m³/h)</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Hvl. Isı Kaybı</td><td style="font-weight:700;color:${P.thIstEkle?'var(--gd)':'var(--mt)'};text-align:right;">${fmt(td.thIst||0,0)} W ${P.thIstEkle?'✔ (eklendi)':'(seçilmedi)'}</td></tr>
            ${P.thIstEkle?`<tr style="background:rgba(239,68,68,.08);border-top:1px solid var(--rd);"><td style="color:var(--rd);font-weight:700;padding:3px 0;">ISINMA Q + HVL.</td><td style="color:var(--rd);font-weight:700;text-align:right;">${fmt(final+n(td.thIst||0),0)} W</td></tr>`:''}
          </table>
          <!-- Özet Bar -->
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--rd);font-family:var(--mono);">kW</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--rd);">${fmt(final/1000,2)}</div>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--mt);font-family:var(--mono);">W/m²</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;">${alan>0?fmt(final/alan,0):'–'}</div>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--mt);font-family:var(--mono);">TH L/s</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gr);">${fmt(thFlow,0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  const _ek1El = document.getElementById('ek1-content'); if (_ek1El) _ek1El.innerHTML = hdr + `<div style="padding:12px;display:flex;flex-direction:column;gap:10px;">${cards}</div>`;
}

// ══════════════════════════════════════════════════════
// EK-2: ISI KAZANCI MAHAL KARTLARI (Tek mahal – tam detay)
// ══════════════════════════════════════════════════════
function renderEk2MahalKartlari(R, P){
  const n = v => isNaN(+v)?0:(+v||0);
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const fmt = (v,d=0) => n(v).toLocaleString(_isEN?'en-US':'tr-TR',{maximumFractionDigits:d});
  const AY_AD=['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const YONLER_TR = ['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
  const yonLabel = {'kuzey':'Kuzey','güney':'Güney','doğu':'Doğu','batı':'Batı','kuzeydoğu':'K.Doğu','güneydoğu':'G.Doğu','güneybatı':'G.Batı','kuzeybatı':'K.Batı'};
  const totalSog = R.reduce((s,r)=>s+n(r.bestLoad),0);

  let hdr = `<div style="padding:12px 16px;background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(6,182,212,.05));border-bottom:2px solid var(--cy);display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:14px;font-weight:800;color:var(--cy);letter-spacing:1px;">EK-2 – ISI KAZANCI MAHAL KARTLARI</div>
      <div style="font-size:10px;color:var(--mt);font-family:var(--mono);margin-top:4px;">${P.sehir||'–'} · Yaz KT: ${P.Tmax}°C · SHGC: ${P.shgc} · Soğ.Em: %${n(P.emSog)} · ASHRAE CLTD/CLF</div>
    </div>
    <div style="text-align:right;">
      <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--cy);">${fmt(totalSog/1000,1)} kW</div>
      <div style="font-size:9px;color:var(--mt);">Toplam Soğutma Yükü · ${R.length} mahal</div>
    </div>
  </div>`;

  const cards = R.map((r,idx)=>{
    const pk = r.peak||{};
    const qCam = n(pk.qCam);
    const qDuv = n(pk.qDuvar);
    const qPencIlet = n(pk.qPencIlet);
    const qTav = n(pk.qTavan);
    const qDos = n(pk.qDoseme);
    const qIcDuy = n(pk.qIcDuy);
    const qIcGiz = n(pk.qIcGiz);
    const rsh = n(pk.rsh);
    const rlh = n(pk.rlh);
    const ersh = n(pk.ersh);
    const erlh = n(pk.erlh);
    const gth = n(r.bestLoad);
    const Tdis = n(pk.Tdis)||n(P.Tmax);
    const alan = n(r.alan);
    const td = r.thData||{};
    const thFlow = n(td.th);
    const exFlow = n(td.egzoz);

    let camRows = '';
    YONLER_TR.forEach(y=>{
      const pa = r.pencAlani?n(r.pencAlani[y]):0;
      if(pa>0) camRows += `<tr><td>${yonLabel[y]} Cam</td><td>${fmt(pa,1)} m²</td><td style="font-size:8px;color:var(--mt);">SHGF×SC×CLF</td></tr>`;
    });
    if(!camRows) camRows = `<tr><td colspan="3" style="color:var(--mt);">Cam yok</td></tr>`;

    return `<div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:10px;overflow:hidden;margin-bottom:2px;">
      <!-- Kart Başlık -->
      <div style="background:linear-gradient(90deg,rgba(6,182,212,.18),var(--bg3));padding:10px 16px;border-bottom:2px solid var(--cy);display:flex;align-items:center;gap:12px;">
        <span style="background:var(--cy);color:#000;font-family:var(--mono);font-size:11px;font-weight:700;padding:4px 10px;border-radius:5px;min-width:60px;text-align:center;">${r.mahalNo||'–'}</span>
        <span style="font-size:13px;font-weight:800;flex:1;">${r.mahalAdi||'–'}</span>
        <span style="font-family:var(--mono);font-size:10px;color:var(--mt);background:var(--bg4);padding:3px 8px;border-radius:4px;">${r.mahalTip||'OFİS'}</span>
        <span style="font-family:var(--mono);font-size:10px;color:var(--mt);">Peak: ${AY_AD[r.bestAy]||'–'} ${r.bestSaat||'–'}:00</span>
        <span style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--cy);">${fmt(gth,0)} W</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--mt);">${fmt(gth/1000,2)} kW</span>
      </div>
      <!-- İki Kolon -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;">
        <!-- Sol: Dış Kaynaklar -->
        <div style="padding:12px 14px;border-right:1px solid var(--bdr);">
          <div style="font-size:8px;color:var(--cy);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Mahal Bilgileri</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);margin-bottom:12px;">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Alan</td><td style="font-weight:600;text-align:right;">${fmt(alan,1)} m²</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Yükseklik</td><td style="font-weight:600;text-align:right;">${fmt(r.h||3,1)} m</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Kişi</td><td style="font-weight:600;text-align:right;">${r.nToplam||0} kişi</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İç KT (Yaz)</td><td style="font-weight:600;text-align:right;">${n(r.Tic_yaz)||24}°C</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Dış KT (Peak)</td><td style="font-weight:600;text-align:right;">${fmt(Tdis,1)}°C</td></tr>
            <tr><td style="color:var(--gd);padding:3px 0;font-weight:700;">ΔT</td><td style="font-weight:700;color:var(--gd);text-align:right;">${fmt(Math.max(0,Tdis-n(r.Tic_yaz||24)),1)}°C</td></tr>
          </table>
          <div style="font-size:8px;color:var(--cy);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Dış Kaynaklar</div>
          <table style="width:100%;border-collapse:collapse;font-size:9px;font-family:var(--mono);margin-bottom:10px;">
            <tr style="background:var(--bg4);"><th style="text-align:left;padding:3px 4px;color:var(--mt);">Bileşen</th><th style="padding:3px 4px;color:var(--mt);">Detay</th><th style="padding:3px 4px;color:var(--cy);">W</th></tr>
            ${camRows}
            <tr style="border-top:1px solid var(--bdr2);"><td style="font-weight:600;">Cam Rad. Toplam</td><td></td><td style="color:var(--gd);font-weight:700;">${fmt(qCam,0)}</td></tr>
            <tr><td style="color:var(--mt);">Dış Duvar CLTD</td><td style="font-size:8px;color:var(--mt);">U×A×CLTD</td><td>${fmt(qDuv,0)}</td></tr>
            <tr><td style="color:var(--mt);">Pencere İletim</td><td style="font-size:8px;color:var(--mt);">U×A×ΔT</td><td>${fmt(qPencIlet,0)}</td></tr>
            <tr><td style="color:var(--mt);">Tavan</td><td style="font-size:8px;color:var(--mt);">U×A×CLTD</td><td>${fmt(qTav,0)}</td></tr>
            <tr><td style="color:var(--mt);">Döşeme</td><td></td><td>${fmt(qDos,0)}</td></tr>
          </table>
          <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Havalandırma</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Taze Hava</td><td style="font-weight:600;color:var(--gr);text-align:right;">${fmt(thFlow,1)} L/s (${ceilTo5(Math.round(thFlow*3.6))} m³/h)</td></tr>
            <tr><td style="color:var(--mt);padding:3px 0;">Egzoz</td><td style="font-weight:600;color:var(--cy);text-align:right;">${fmt(exFlow,1)} L/s (${ceilTo5(Math.round(exFlow*3.6))} m³/h)</td></tr>
          </table>
          <div style="font-size:8px;color:var(--pu);font-family:var(--mono);letter-spacing:1.5px;margin:10px 0 6px;text-transform:uppercase;">▶ Hvl. Isı Kazancı Yükü</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Duy. TH Soğ.</td><td style="text-align:right;">${fmt(n(td.thSogS),0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Giz. TH Soğ.</td><td style="text-align:right;">${fmt(n(td.thSogL),0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);background:rgba(139,92,246,.07);"><td style="color:var(--pu);font-weight:700;padding:3px 0;">TH Soğ. Toplam</td><td style="color:var(--pu);font-weight:700;text-align:right;">${fmt(n(td.thSogT),0)} W ${P.thSogEkle?'✔':'(seçilmedi)'}</td></tr>
            <tr><td style="color:var(--mt);padding:3px 0;">TH Isıtma Yükü</td><td style="text-align:right;">${fmt(n(td.thIst),0)} W</td></tr>
          </table>
        </div>
        <!-- Sağ: İç Yükler + Hesap Aşamaları -->
        <div style="padding:12px 14px;">
          <div style="font-size:8px;color:var(--gr);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ İç Yükler</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);margin-bottom:12px;">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İnsanlar Duyulur</td><td style="text-align:right;">${r.nOturan||0}×66 + ${r.nAyakta||0}×64 = ${fmt(r.insDuy||0,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İnsanlar Gizli</td><td style="text-align:right;">${r.nOturan||0}×60 + ${r.nAyakta||0}×52 = ${fmt(r.insGiz||0,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Cihazlar + TV</td><td style="text-align:right;">${n(r.alan)>0?fmt((n(r.qTV)+n(r.qCihaz))/n(r.alan),1):'0'} W/m² × ${fmt(n(r.alan),1)}m² = ${fmt(n(r.qTV)+n(r.qCihaz),0)} W</td></tr>
            <tr><td style="color:var(--mt);padding:3px 0;">Aydınlatma</td><td style="text-align:right;">${fmt(alan,1)}m²×${r.aydW||20}W/m²×${fmt(n(P.fAyd)||1.25,2)} = ${fmt(r.qAyd||0,0)} W</td></tr>
          </table>
          <div style="font-size:8px;color:var(--pu);font-family:var(--mono);letter-spacing:1.5px;margin-bottom:8px;text-transform:uppercase;">▶ Soğutma Hesap Aşamaları</div>
          <table style="width:100%;border-collapse:collapse;font-size:10px;font-family:var(--mono);">
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İç Duyulur (qIcDuy)</td><td style="text-align:right;">${fmt(qIcDuy,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">İç Gizli (qIcGiz)</td><td style="text-align:right;">${fmt(qIcGiz,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Rsh (Oda Duy. ×Oda Zam)</td><td style="font-weight:600;text-align:right;">${fmt(rsh,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Rlh (Oda Gizli ×Oda Zam)</td><td style="text-align:right;">${fmt(rlh,0)} W</td></tr>
            <tr style="border-bottom:1px solid var(--bdr2);"><td style="color:var(--mt);padding:3px 0;">Ersh (×Eff Zam)</td><td style="text-align:right;">${fmt(ersh,0)} W</td></tr>
            <tr style="border-bottom:2px solid var(--bdr);"><td style="color:var(--mt);padding:3px 0;">Erlh</td><td style="text-align:right;">${fmt(erlh,0)} W</td></tr>
            <tr style="background:rgba(6,182,212,.08);"><td style="color:var(--cy);font-weight:700;padding:4px 0;">SOĞUTMA Gth TOPLAM</td><td style="color:var(--cy);font-weight:700;text-align:right;font-size:13px;">${fmt(gth,0)} W</td></tr>
            ${P.thSogEkle?`<tr style="background:rgba(139,92,246,.1);"><td style="color:var(--pu);font-weight:700;padding:4px 0;">Gth + TH Soğ.</td><td style="color:var(--pu);font-weight:700;text-align:right;font-size:13px;">${fmt(gth+n(td.thSogT),0)} W ✔</td></tr>`:''}
          </table>
          <!-- Özet Bar -->
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <div style="background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.3);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--cy);font-family:var(--mono);">kW</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--cy);">${fmt(gth/1000,2)}</div>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--mt);font-family:var(--mono);">TR</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;">${fmt(gth/3517,2)}</div>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--mt);font-family:var(--mono);">W/m²</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;">${alan>0?fmt(gth/alan,0):'–'}</div>
            </div>
            <div style="background:var(--bg3);border:1px solid var(--bdr);border-radius:6px;padding:6px 10px;text-align:center;min-width:70px;">
              <div style="font-size:7px;color:var(--mt);font-family:var(--mono);">TH L/s</div>
              <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gr);">${fmt(thFlow,0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  const _ek2El = document.getElementById('ek2-content'); if (_ek2El) _ek2El.innerHTML = hdr + `<div style="padding:12px;display:flex;flex-direction:column;gap:10px;">${cards}</div>`;
}

// ══════════════════════════════════════════════════════
// GROK AI – MASTER CONTROLLER & REPORT EDITOR
// ══════════════════════════════════════════════════════

// ASHRAE 62.1 ve TS EN 12831 standart katsayıları kütüphanesi
const STANDARTLAR = {
  ASHRAE_621: {
    ofis:          { kisi_ls: 2.5, alan_ls: 0.3 },
    toplanti:      { kisi_ls: 2.5, alan_ls: 0.3 },
    sinif:         { kisi_ls: 3.8, alan_ls: 0.3 },
    mutfak:        { kisi_ls: 7.5, alan_ls: 0.9 },
    koridor:       { kisi_ls: 0,   alan_ls: 0.15 },
    wc:            { kisi_ls: 0,   alan_ls: 0.3 },
    depo:          { kisi_ls: 0,   alan_ls: 0.15 },
    lobi:          { kisi_ls: 2.5, alan_ls: 0.3 },
    restoran:      { kisi_ls: 3.8, alan_ls: 0.9 },
    otel_oda:      { kisi_ls: 2.5, alan_ls: 0.3 },
    default:       { kisi_ls: 2.5, alan_ls: 0.3 }
  },
  TS_EN_12831: {
    ofis:      { min_hava_kisi: 30 },
    toplanti:  { min_hava_kisi: 30 },
    sinif:     { min_hava_kisi: 15 },
    mutfak:    { min_hava_kisi: 10 },
    default:   { min_hava_kisi: 20 }
  }
};
