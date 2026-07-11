// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — Excel Export (export-excel.js)
// 6 sayfalı tam Excel raporu (XLSX)
// ═══════════════════════════════════════════════════════════

async function exportExcel(){
  var _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  if(!globalResults||!globalResults.length){ alert(_isEN ? 'Run the calculation first.' : 'Önce hesabı çalıştırın.'); return; }

  // "Excel TR" butonu — arayüz dili ne olursa olsun her zaman Türkçe etiketli çıktı üretmeli
  // (tıpkı exportExcelEN'in her zaman İngilizce üretmesi gibi). Önceden LANG'ı zorlamıyordu,
  // bu yüzden arayüz İngilizce moddayken bu buton da İngilizce Excel üretiyordu.
  const prevLang = LANG;
  LANG = 'tr';
  async function doExport() {
    try { await _hvacBuildWorkbook(); }
    catch(e){ console.error(e); alert((_isEN ? 'Excel error: ' : 'Excel hatası: ')+e.message+' | '+e.stack); }
  }

  try {
    // Direkt export - JSZip ile stil enjeksiyonu yapılıyor
    await doExport();
  } finally {
    LANG = prevLang;
  }
}

async function exportExcelEN(){
  var _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  if(!globalResults||!globalResults.length){ alert(_isEN ? 'Run the calculation first.' : 'Önce hesabı çalıştırın.'); return; }
  const prevLang = LANG;
  LANG = 'en';
  try { await _hvacBuildWorkbook(); }
  catch(e){ console.error(e); alert((_isEN ? 'Excel error: ' : 'Excel hatası: ')+e.message); }
  finally { LANG = prevLang; }
}

function exportExcelXmlWorkbook(){
  console.log('=== XML WORKBOOK EXPORT START ===');
  const R = globalResults || [];
  const P = globalParams || {};
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  console.log('Results count:', R.length);
  console.log('Params:', P);

  const now = new Date().toLocaleDateString(_isEN ? 'en-GB' : 'tr-TR');
  const lang = LANG || 'tr';
  const t = T[lang];
  console.log('Language:', lang, 'Translations:', t);

  // Helper functions
  const s = v => v||'';
  const n = v => isNaN(+v)?0:(+v||0);
  const ceilTo5 = x => Math.ceil(x/5)*5;
  function katCikar(no){
    if(!no) return '–';
    const str=String(no);
    const m=str.match(/^([A-Za-z]+\d*)/);
    if(m) return m[1];
    const num=parseInt(str);
    if(!isNaN(num)) return Math.floor(num/100)+'00';
    return str.split('-')[0]||str;
  }
  function xesc(v){
    if (typeof v !== 'string') return v;
    return v
      .replace(/&/g, '&amp;')  // Önce tüm & karakterlerini escape et
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const prjInfo = lang === 'en' 
    ? `Project No: ${s(P.prjNo)} | City: ${s(P.sehir)} | Date: ${now} | Engineer: ${s(P.kim)} | System: ${s(P.sistem).toUpperCase()} | Indoor Unit: ${s(P.icUniteTip)}`
    : `Proje No: ${s(P.prjNo)} | Şehir: ${s(P.sehir)} | Tarih: ${now} | Hazırlayan: ${s(P.kim)} | Sistem: ${s(P.sistem).toUpperCase()} | İç Ünite: ${s(P.icUniteTip)}`;
  const AY_SHORT = lang === 'en' 
    ? ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    : ['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

  // Styles
  const styles = `
    <Styles>
      <Style ss:ID="Default" ss:Name="Normal">
        <Alignment ss:Vertical="Center"/>
        <Borders/>
        <Font ss:FontName="Calibri" ss:Size="11"/>
      </Style>
      <Style ss:ID="sLeft"><Alignment ss:Horizontal="Left" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/></Borders></Style>
      <Style ss:ID="sCell"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/></Borders></Style>
      <Style ss:ID="sHdrBlue"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#2F5597" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
      <Style ss:ID="sHdrRed"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#7F1D1D" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
      <Style ss:ID="sHdrCyan"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#155E75" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
      <Style ss:ID="sHdrGreen"><Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#065F46" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
      <Style ss:ID="sTotal"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#0F5132" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
      <Style ss:ID="sBlueNum"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#2563EB"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/></Borders></Style>
      <Style ss:ID="sRedNum"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#DC2626"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/></Borders></Style>
      <Style ss:ID="sSkylight"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Font ss:Bold="1" ss:Color="#92400E"/><Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/></Borders></Style>
    </Styles>`;

  function cell(v, type, styleId){
    const t = type || (typeof v === 'number' ? 'Number' : 'String');
    const st = styleId ? ` ss:StyleID="${styleId}"` : '';
    // Escape XML special characters
    const escapeXml = (text) => {
      if (typeof text !== 'string') return text;
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    const val = (t==='String') ? escapeXml(v) : (isNaN(+v)?0:+v);
    return `<Cell${st}><Data ss:Type="${t}">${val}</Data></Cell>`;
  }

  function ws(name, data){
    return `<Worksheet ss:Name="${xesc(name)}">
    <Table ss:ExpandedColumnCount="${data[0]?data[0].length:1}" ss:ExpandedRowCount="${data.length}" x:FullColumns="1" x:FullRows="1" ss:DefaultColumnWidth="60">
      ${data.join('\n      ')}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <PageSetup>
        <Header x:Margin="0.3"/>
        <Footer x:Margin="0.3"/>
        <PageMargins x:Bottom="0.7" x:Left="0.7" x:Right="0.7" x:Top="0.7"/>
      </PageSetup>
      <Print>
        <ValidPrinterInfo/>
        <HorizontalResolution>600</HorizontalResolution>
        <VerticalResolution>600</VerticalResolution>
      </Print>
      <Selected/>
      <Panes>
        <Pane>
          <Number>3</Number>
          <ActiveRow>0</ActiveRow>
          <ActiveCol>0</ActiveCol>
        </Pane>
      </Panes>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
  </Worksheet>`;
}  

  function row(cells){
    return `<Row>${cells.join('')}</Row>`;
  }

  // ── Worksheet: ÖZET
  let sumSog=0,sumKayip=0,sumAlan=0,sumKisi=0,sumTH=0,sumEg=0;
  const ozet = [];
  ozet.push(row([cell(lang === 'en' ? 'SUMMARY SCHEDULE' : 'ÖZET ÇİZELGESİ','String','sLeft')]));
  ozet.push(row([cell(prjInfo,'String','sLeft')]));
  ozet.push(row([cell('', 'String', 'sLeft')]));
  ozet.push(row([
    cell(lang === 'en' ? 'No' : 'No','String','sHdrBlue'),cell(lang === 'en' ? 'Room Name' : 'Mahal Adı','String','sHdrBlue'),cell(lang === 'en' ? 'Type' : 'Tip','String','sHdrBlue'),cell(lang === 'en' ? 'Area' : 'Alan','String','sHdrBlue'),cell(lang === 'en' ? 'People' : 'Kişi','String','sHdrBlue'),
    cell(lang === 'en' ? 'Peak Mo' : 'Peak Ay','String','sHdrBlue'),cell(lang === 'en' ? 'Peak Hr' : 'Peak Saat','String','sHdrBlue'),cell(lang === 'en' ? 'Indoor DB' : 'İç KT','String','sHdrBlue'),
    cell(lang === 'en' ? 'Glass' : 'Cam','String','sHdrBlue'),cell(lang === 'en' ? 'Wall' : 'Duvar','String','sHdrBlue'),cell(lang === 'en' ? 'Window Cond' : 'Penc.İlet','String','sHdrBlue'),cell(lang === 'en' ? 'Roof' : 'Tavan','String','sHdrBlue'),cell(lang === 'en' ? 'Floor' : 'Döşeme','String','sHdrBlue'),
    cell(lang === 'en' ? 'Int.Sens' : 'İç.Duy','String','sHdrBlue'),cell(lang === 'en' ? 'Int.Lat' : 'İç.Giz','String','sHdrBlue'),cell(lang === 'en' ? 'Rsh' : 'Rsh','String','sHdrBlue'),cell(lang === 'en' ? 'Rlh' : 'Rlh','String','sHdrBlue'),cell(lang === 'en' ? 'Ersh' : 'Ersh','String','sHdrBlue'),cell(lang === 'en' ? 'Erlh' : 'Erlh','String','sHdrBlue'),
    cell(lang === 'en' ? 'Cooling' : 'SOĞUTMA','String','sHdrBlue'),cell(lang === 'en' ? 'Heating' : 'ISINMA','String','sHdrBlue'),
    cell(lang === 'en' ? 'Area' : 'Alan','String','sHdrBlue'),cell(lang === 'en' ? 'People' : 'Kişi','String','sHdrBlue'),cell(lang === 'en' ? 'W/m²' : 'W/m²','String','sHdrBlue'),
    cell(lang === 'en' ? 'Device Type' : 'Cihaz Tipi','String','sHdrBlue'),cell(lang === 'en' ? 'Model' : 'Model','String','sHdrBlue'),cell(lang === 'en' ? 'Qty' : 'Adet','String','sHdrBlue'),
    cell(lang === 'en' ? 'TH L/s' : 'TH L/s','String','sHdrBlue'),cell(lang === 'en' ? 'TH m³/h' : 'TH m³/h','String','sHdrBlue'),cell(lang === 'en' ? 'Exhaust L/s' : 'Egzoz L/s','String','sHdrBlue'),cell(lang === 'en' ? 'Exhaust m³/h' : 'Egzoz m³/h','String','sHdrBlue'),
    cell(lang === 'en' ? 'TH Sens' : 'TH Duy','String','sHdrBlue'),cell(lang === 'en' ? 'TH Lat' : 'TH Giz','String','sHdrBlue'),cell(lang === 'en' ? 'TH Total' : 'TH Top','String','sHdrBlue'),cell(lang === 'en' ? 'TH Heat' : 'TH Ist','String','sHdrBlue'),
    cell(lang === 'en' ? 'ACH' : 'ACH','String','sHdrBlue'),cell(lang === 'en' ? 'Infil m³/h' : 'İnfil m³/h','String','sHdrBlue'),
    cell(lang === 'en' ? 'Fresh Air Unit' : 'Taze Hava Cihazı','String','sHdrBlue'),cell(lang === 'en' ? 'Exhaust Unit' : 'Egzoz Cihazı','String','sHdrBlue')
  ]));
  R.forEach(r=>{
    const pk=r.peak||{};
    const td=r.thData||{};
    const c=r.cihaz||{};
    const sog=Math.round(n(r.bestLoad));
    const kip=Math.round(n(r.qKayip));
    sumSog+=sog; sumKayip+=kip; sumAlan+=n(r.alan); sumKisi+=n(r.nToplam);
    sumTH+=n(td.th); sumEg+=n(td.egzoz);
    const wm2 = n(r.alan)>0 ? Math.round(sog/n(r.alan)) : 0;
    const skyStyle = n(r.skylightA)>0 ? 'sSkylight' : 'sCell';
    ozet.push(row([
      cell(xesc(s(r.mahalNo)),'String','sLeft'),cell(xesc(s(r.mahalAdi)),'String','sLeft'),cell(xesc(s(r.mahalTip||'')),'String','sCell'),cell(xesc(katCikar(r.mahalNo)),'String','sCell'),
      cell(xesc(s(AY_SHORT[r.bestAy]||r.bestAy)),'String','sCell'),cell(`${s(r.bestSaat||0)}:00`,'String','sCell'),cell(n(r.Tic_yaz)||24,'Number','sCell'),
      cell(Math.round(n(pk.qCam)),'Number','sCell'),cell(Math.round(n(pk.qDuvar)),'Number','sCell'),cell(Math.round(n(pk.qPencIlet)),'Number','sCell'),cell(Math.round(n(pk.qTavan)),'Number','sCell'),cell(Math.round(n(pk.qDoseme)),'Number','sCell'),
      cell(Math.round(n(pk.qIcDuy)),'Number','sCell'),cell(Math.round(n(pk.qIcGiz)),'Number','sCell'),cell(Math.round(n(pk.rsh)),'Number','sCell'),cell(Math.round(n(pk.rlh)),'Number','sCell'),cell(Math.round(n(pk.ersh)),'Number','sCell'),cell(Math.round(n(pk.erlh)),'Number','sCell'),
      cell(sog,'Number','sBlueNum'),cell(kip,'Number','sRedNum'),
      cell(n(r.alan)||0,'Number','sCell'),cell(n(r.nToplam)||0,'Number','sCell'),cell(wm2,'Number','sCell'),
      cell(xesc(s(c.label||c.tip||'')),'String','sCell'),cell(xesc(s(c.model||'')),'String','sCell'),cell(n(c.adet)||1,'Number','sCell'),
      cell(+n(td.th).toFixed(1),'Number','sCell'),cell(ceilTo5(Math.round(n(td.th)*3.6)),'Number','sCell'),cell(+n(td.egzoz).toFixed(1),'Number','sCell'),cell(ceilTo5(Math.round(n(td.egzoz)*3.6)),'Number','sCell'),
      cell(Math.round(n(td.thSogT)),'Number','sCell'),cell(Math.round(n(td.thIst)),'Number','sCell'),
      cell(+n(r.skylightA).toFixed(2),'Number',skyStyle),cell(xesc(s(r._thDisabled ? '–' : (r.tazeHavaCihazi||r.ahuZon||'AHU1'))),'String','sCell'),cell(xesc(s(r._exDisabled ? '–' : (r.egzozCihazi||r.ahuZon||'AHU1'))),'String','sCell'),cell(xesc(s(r.tavanDurumu||'')),'String','sCell')
    ]));
  });
  const totalWm2 = sumAlan>0 ? Math.round(sumSog/sumAlan) : 0;
  ozet.push(row([
    cell('GENEL TOPLAM','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),
    cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),
    cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),
    cell(sumSog,'Number','sTotal'),cell(sumKayip,'Number','sTotal'),
    cell(+sumAlan.toFixed(1),'Number','sTotal'),cell(sumKisi,'Number','sTotal'),cell(totalWm2,'Number','sTotal'),
    cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),
    cell(+sumTH.toFixed(1),'Number','sTotal'),cell(ceilTo5(Math.round(sumTH*3.6)),'Number','sTotal'),cell(+sumEg.toFixed(1),'Number','sTotal'),cell(ceilTo5(Math.round(sumEg*3.6)),'Number','sTotal'),
    cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal')
  ]));

  // ── Worksheet: ISI KAYBI
  const ik = [];
  ik.push(row([cell(lang === 'en' ? 'HEAT LOSS SCHEDULE' : 'ISI KAYBI ÇİZELGESİ','String','sLeft')]));
  ik.push(row([cell(prjInfo,'String','sLeft')]));
  ik.push(row([cell('','String','sLeft')]));
  ik.push(row([
    cell(lang === 'en' ? 'No' : 'No','String','sHdrRed'),cell(lang === 'en' ? 'Room Name' : 'Mahal Adı','String','sHdrRed'),cell(lang === 'en' ? 'Indoor DB Winter' : 'İç KT Kış','String','sHdrRed'),cell(lang === 'en' ? 'ΔT' : 'ΔT','String','sHdrRed'),
    cell(lang === 'en' ? 'Wall Q(W)' : 'Duvar Q(W)','String','sHdrRed'),cell(lang === 'en' ? 'Window Q(W)' : 'Pencere Q(W)','String','sHdrRed'),cell(lang === 'en' ? 'Floor Q(W)' : 'Döşeme Q(W)','String','sHdrRed'),cell(lang === 'en' ? 'Roof Q(W)' : 'Tavan Q(W)','String','sHdrRed'),
    cell(lang === 'en' ? 'Sub-Total(W)' : 'Ham Top.(W)','String','sHdrRed'),cell(lang === 'en' ? 'TOTAL HEATING Q(W)' : 'TOPLAM ISINMA Q(W)','String','sHdrRed'),cell(lang === 'en' ? 'kW' : 'kW','String','sHdrRed')
  ]));
  let ikSum=0;
  R.forEach(r=>{
    const td=r.thData||{};
    ikSum+=n(r.qKayip);
    const skyStyle = n(r.skylightA)>0 ? 'sSkylight' : 'sCell';
    ik.push(row([
      cell(xesc(s(r.mahalNo)),'String','sLeft'),cell(xesc(s(r.mahalAdi)),'String','sLeft'),cell(Math.round(n(r.qKayip)),'Number','sRedNum'),
      cell(Math.round(n(r.qDuvarKis)),'Number','sCell'),cell(Math.round(n(r.qPencKis)),'Number','sCell'),cell(Math.round(n(r.qDosKis)),'Number','sCell'),cell(Math.round(n(r.qTavKis)),'Number','sCell'),
      cell(Math.round(n(r.qSkylightKis)),'Number',skyStyle),cell(Math.round(n(r.infilIst)),'Number','sCell'),cell(Math.round(n(td.thIst)),'Number','sCell'),cell(n(P.kisKt)||0,'Number','sCell')
    ]));
  });
  ik.push(row([cell('TOPLAM','String','sTotal'),cell('','String','sTotal'),cell(Math.round(ikSum),'Number','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal')]));

  // ── Worksheet: ISI KAZANCI
  const ig = [];
  ig.push(row([cell(lang === 'en' ? 'COOLING LOAD SCHEDULE' : 'ISI KAZANCI ÇİZELGESİ','String','sLeft')]));
  ig.push(row([cell(prjInfo,'String','sLeft')]));
  ig.push(row([cell('','String','sLeft')]));
  ig.push(row([
    cell(lang === 'en' ? 'No' : 'No','String','sHdrCyan'),cell(lang === 'en' ? 'Room Name' : 'Mahal Adı','String','sHdrCyan'),cell(lang === 'en' ? 'Peak Mo/Hr' : 'Peak Ay/Saat','String','sHdrCyan'),cell(lang === 'en' ? 'Indoor DB' : 'İç KT','String','sHdrCyan'),
    cell(lang === 'en' ? 'Glass Rad.Sh(W)' : 'Cam Rad.Sh(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Ext.Wall(W)' : 'Dış Duvar(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Conductive(W)' : 'İletimsel(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Int.Sens.(W)' : 'İç Duy.(W)','String','sHdrCyan'),
    cell(lang === 'en' ? 'Int.Lat.(W)' : 'İç Giz.(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Rsh(W)' : 'Rsh(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Rlh(W)' : 'Rlh(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Ersh(W)' : 'Ersh(W)','String','sHdrCyan'),
    cell(lang === 'en' ? 'Erlh(W)' : 'Erlh(W)','String','sHdrCyan'),cell(lang === 'en' ? 'COOLING Gth(W)' : 'SOĞUTMA Gth(W)','String','sHdrCyan'),cell(lang === 'en' ? 'HEATING Q(W)' : 'ISINMA Q(W)','String','sHdrCyan'),cell(lang === 'en' ? 'Area(m²)' : 'Alan(m²)','String','sHdrCyan'),
    cell(lang === 'en' ? 'People' : 'Kişi','String','sHdrCyan'),cell(lang === 'en' ? 'W/m²' : 'W/m²','String','sHdrCyan')
  ]));
  let igSum=0;
  R.forEach(r=>{
    const pk=r.peak||{};
    const td=r.thData||{};
    igSum+=n(r.bestLoad);
    const skyStyle = n(r.skylightA)>0 ? 'sSkylight' : 'sCell';
    ig.push(row([
      cell(xesc(s(r.mahalNo)),'String','sLeft'),cell(xesc(s(r.mahalAdi)),'String','sLeft'),cell(`${xesc(s(AY_SHORT[r.bestAy]||r.bestAy))} ${s(r.bestSaat||0)}:00`,'String','sCell'),cell(Math.round(n(r.bestLoad)),'Number','sBlueNum'),
      cell(Math.round(n(pk.qCam)),'Number','sCell'),cell(Math.round(n(pk.qDuvar)),'Number','sCell'),cell(Math.round(n(pk.qPencIlet)),'Number','sCell'),cell(Math.round(n(pk.qTavan)),'Number','sCell'),cell(Math.round(n(pk.qDoseme)),'Number','sCell'),
      cell(Math.round(n(pk.qIcDuy)),'Number','sCell'),cell(Math.round(n(pk.qIcGiz)),'Number','sCell'),cell(Math.round(n(td.thSogT)),'Number','sCell'),cell(Math.round(n(r.infilSog)),'Number','sCell'),
      cell(+n(r.skylightA).toFixed(2),'Number',skyStyle)
    ]));
  });
  ig.push(row([cell(lang === 'en' ? 'TOTAL' : 'TOPLAM','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell(Math.round(igSum),'Number','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal')]));

  // ── Worksheet: HAVALANDIRMA (Formüller ile)
  const hv = [];
  hv.push(row([cell(lang === 'en' ? 'VENTILATION & INFILTRATION' : 'HAVALANDIRMA & İNFİLTRASYON','String','sLeft')]));
  hv.push(row([cell(prjInfo,'String','sLeft')]));
  hv.push(row([cell('','String','sLeft')]));
  hv.push(row([
    cell(lang === 'en' ? 'No' : 'No','String','sHdrGreen'),cell(lang === 'en' ? 'Room Name' : 'Mahal Adı','String','sHdrGreen'),
    cell(lang === 'en' ? 'Area (m²)' : 'Alan (m²)','String','sHdrGreen'),cell(lang === 'en' ? 'Height (m)' : 'Yükseklik (m)','String','sHdrGreen'),
    cell(lang === 'en' ? 'People' : 'Kişi','String','sHdrGreen'),cell(lang === 'en' ? 'ACH' : 'ACH','String','sHdrGreen'),
    cell(lang === 'en' ? 'TH L/s' : 'TH L/s','String','sHdrGreen'),cell(lang === 'en' ? 'TH m³/h' : 'TH m³/h','String','sHdrGreen'),
    cell(lang === 'en' ? 'Exhaust L/s' : 'Egzoz L/s','String','sHdrGreen'),cell(lang === 'en' ? 'Exhaust m³/h' : 'Egzoz m³/h','String','sHdrGreen'),
    cell(lang === 'en' ? 'Fresh Air Unit' : 'Taze Hava Cihazı','String','sHdrGreen'),cell(lang === 'en' ? 'Exhaust Unit' : 'Egzoz Cihazı','String','sHdrGreen'),
    cell(lang === 'en' ? 'TH Sens' : 'TH Duy','String','sHdrGreen'),cell(lang === 'en' ? 'TH Lat' : 'TH Giz','String','sHdrGreen'),cell(lang === 'en' ? 'TH Total' : 'TH Top','String','sHdrGreen'),cell(lang === 'en' ? 'TH Heat' : 'TH Ist','String','sHdrGreen')
  ]));
  
  R.forEach((r, idx) => {
    const td=r.thData||{};
    const rowIdx = idx + 5; // Excel satır indeksi (başlıklar + 1)
    hv.push(row([
      cell(xesc(s(r.mahalNo)),'String','sLeft'),cell(xesc(s(r.mahalAdi)),'String','sLeft'),
      cell(n(r.alan),'Number','sCell'),cell(n(r.tavanYukseklik || 3),'Number','sCell'),
      cell(n(r.nToplam),'Number','sCell'),cell(n(r.infilACH_val || 0.5),'Number','sCell'),
      cell(`=IF(F${rowIdx}>0, E${rowIdx}*8.3/1000, 0)`,'String','sFormula'),cell(`=G${rowIdx}*3.6`,'String','sFormula'),
      cell(`=IF(F${rowIdx}>0, E${rowIdx}*8.3/1000, 0)`,'String','sFormula'),cell(`=I${rowIdx}*3.6`,'String','sFormula'),
      cell(xesc(s(r.tazeHavaCihazi||'–')),'String','sCell'),cell(xesc(s(r.egzozCihazi||'–')),'String','sCell'),
      cell(`=IF(G${rowIdx}>0, G${rowIdx}*1.2*1.005*(24-20), 0)`,'String','sFormula'),cell(`=IF(G${rowIdx}>0, G${rowIdx}*1.2*50, 0)`,'String','sFormula'),
      cell(`=M${rowIdx}+N${rowIdx}`,'String','sFormula'),cell(`=IF(G${rowIdx}>0, G${rowIdx}*1.2*1.005*(20-(-5)), 0)`,'String','sFormula')
    ]));
  });

  // AHU Pivot Özeti
  hv.push(row([cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft')]));
  hv.push(row([cell(lang === 'en' ? 'AHU PIVOT SUMMARY' : 'AHU PİVOT ÖZETİ','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal')]));
  
  // Başlık satırı
  hv.push(row([
    cell(lang === 'en' ? 'Unit' : 'Cihaz','String','sHdrGreen'),
    cell(lang === 'en' ? 'Room Count' : 'Mahal Sayısı','String','sHdrGreen'),
    cell(lang === 'en' ? 'Total TH (L/s)' : 'Toplam TH (L/s)','String','sHdrGreen'),
    cell(lang === 'en' ? 'Total TH (m³/h)' : 'Toplam TH (m³/h)','String','sHdrGreen'),
    cell(lang === 'en' ? 'Total Exhaust (L/s)' : 'Toplam Egzoz (L/s)','String','sHdrGreen'),
    cell(lang === 'en' ? 'Total Exhaust (m³/h)' : 'Toplam Egzoz (m³/h)','String','sHdrGreen'),
    cell(lang === 'en' ? 'Net Air' : 'Net Hava (L/s)','String','sHdrGreen'),
    cell(lang === 'en' ? 'TH Cooling (W)' : 'TH Soğ Yükü (W)','String','sHdrGreen'),
    cell(lang === 'en' ? 'TH Heating (W)' : 'TH Isı Yükü (W)','String','sHdrGreen'),
    cell('','String','sLeft'),cell('','String','sLeft')
  ]));
  
  const ahuMap = {};
  R.forEach(r => {
    const td = r.thData || {};
    
    // Taze hava cihazı
    const thCihaz = r.tazeHavaCihazi;
    if (thCihaz && thCihaz !== '–') {
      if (!ahuMap[thCihaz]) ahuMap[thCihaz] = { taze: 0, egzoz: 0, thSog: 0, thIst: 0, count: 0, mahaller: [] };
      ahuMap[thCihaz].taze += td.th || 0;
      ahuMap[thCihaz].thSog += td.thSogT || 0;
      ahuMap[thCihaz].thIst += td.thIst || 0;
      ahuMap[thCihaz].mahaller.push({ no: r.mahalNo, ad: r.mahalAdi, tip: 'TH' });
      ahuMap[thCihaz].count++;
    }
    
    // Egzoz cihazı (ayrı grupla)
    const egzozCihaz = r.egzozCihazi;
    if (egzozCihaz && egzozCihaz !== '–') {
      if (!ahuMap[egzozCihaz]) ahuMap[egzozCihaz] = { taze: 0, egzoz: 0, thSog: 0, thIst: 0, count: 0, mahaller: [] };
      ahuMap[egzozCihaz].egzoz += td.egzoz || 0;
      ahuMap[egzozCihaz].mahaller.push({ no: r.mahalNo, ad: r.mahalAdi, tip: 'EX' });
      ahuMap[egzozCihaz].count++;
    }
  });
  
  // Cihazları alfabetik sırala
  const sortedAhuKeys = Object.keys(ahuMap).sort();
  
  const ahuStartRow = sortedAhuKeys.length + 9; // Başlangıç satırını hesapla
  sortedAhuKeys.forEach((ahu, idx) => {
    const data = ahuMap[ahu];
    const rowIdx = ahuStartRow + idx;
    
    // Her cihazın satırını ekle
    hv.push(row([
      cell(ahu,'String','sLeft'),
      cell(data.mahaller.length,'Number','sCell'), // Mahal sayısı
      cell(data.taze,'Number','sCell'), // Toplam TH L/s
      cell(data.taze * 3.6,'Number','sCell'), // Toplam TH m³/h
      cell(data.egzoz,'Number','sCell'), // Toplam Egzoz L/s
      cell(data.egzoz * 3.6,'Number','sCell'), // Toplam Egzoz m³/h
      cell(data.taze - data.egzoz,'Number','sCell'), // Net hava
      cell(data.thSog,'Number','sCell'), // TH Soğ yükü
      cell(data.thIst,'Number','sCell'), // TH Ist yükü
      cell('','String','sLeft'),cell('','String','sLeft')
    ]));
    
    // Alt detay satırları - bu cihazı kullanan mahalleri göster
    data.mahaller.forEach(m => {
      hv.push(row([
        cell(`  └ ${m.no}`,'String','sLeft'),
        cell(m.ad,'String','sLeft'),
        cell(m.tip === 'TH' ? 'Taze Hava' : 'Egzoz','String','sLeft'),
        cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),
        cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),
        cell('','String','sLeft'),cell('','String','sLeft')
      ]));
    });
  });
  
  // Özet cihaz debileri
  hv.push(row([cell('','String','sLeft')]));
  hv.push(row([cell(lang === 'en' ? 'FRESH AIR DEVICES (m³/h)' : 'TAZE HAVA CİHAZLARI (m³/h)','String','sTotal')]));
  sortedAhuKeys.forEach(ahu=>{
    const d = ahuMap[ahu];
    const val = (d.taze*3.6).toFixed(0);
    if(d.taze>0) hv.push(row([cell(`${ahu} - ${val} m³/h`,'String','sLeft')]));
  });
  hv.push(row([cell('','String','sLeft')]));
  hv.push(row([cell(lang === 'en' ? 'EXHAUST DEVICES (m³/h)' : 'EGZOZ CİHAZLARI (m³/h)','String','sTotal')]));
  sortedAhuKeys.forEach(ahu=>{
    const d = ahuMap[ahu];
    const val = (d.egzoz*3.6).toFixed(0);
    if(d.egzoz>0) hv.push(row([cell(`${ahu} - ${val} m³/h`,'String','sLeft')]));
  });

  // ── Worksheet: KAT BAZINDA ÖZET (Formüller ile)
  const katOzet = [];
  katOzet.push(row([cell(lang === 'en' ? 'FLOOR SUMMARY' : 'KAT BAZINDA ÖZET','String','sLeft')]));
  katOzet.push(row([cell(prjInfo,'String','sLeft')]));
  katOzet.push(row([cell('','String','sLeft')]));
  katOzet.push(row([
    cell(lang === 'en' ? 'Floor' : 'Kat','String','sHdrBlue'),cell(lang === 'en' ? 'Room Count' : 'Mahal Sayısı','String','sHdrBlue'),cell(lang === 'en' ? 'Total Area' : 'Toplam Alan','String','sHdrBlue'),cell(lang === 'en' ? 'Total People' : 'Toplam Kişi','String','sHdrBlue'),
    cell(lang === 'en' ? 'Total Cooling' : 'Toplam Soğutma','String','sHdrBlue'),cell(lang === 'en' ? 'Total Heating' : 'Toplam Isıtma','String','sHdrBlue'),cell(lang === 'en' ? 'Cooling W/m²' : 'Soğ. W/m²','String','sHdrBlue'),
    cell(lang === 'en' ? 'VRF Index' : 'VRF İndeks','String','sHdrBlue'),cell(lang === 'en' ? 'VRF Systems' : 'VRF Sistem','String','sHdrBlue'),cell(lang === 'en' ? 'VRF Model' : 'VRF Model','String','sHdrBlue'),cell(lang === 'en' ? 'VRF HP' : 'VRF HP','String','sHdrBlue'),cell(lang === 'en' ? 'VRF kW' : 'VRF kW','String','sHdrBlue')
  ]));
  
  const katMap = {};
  R.forEach(r => {
    const kat = r.mahalNo ? r.mahalNo.toString().substring(0, 1) : 'X';
    if (!katMap[kat]) {
      katMap[kat] = {
        rooms: 0,
        area: 0,
        people: 0,
        sog: 0,
        ist: 0,
        vrfIdx: 0
      };
    }
    katMap[kat].rooms++;
    katMap[kat].area += n(r.alan);
    katMap[kat].people += n(r.nToplam);
    katMap[kat].sog += n(r.bestLoad);
    katMap[kat].ist += n(r.qKayip);
    katMap[kat].vrfIdx += (r.cihaz?.grup === 'VRF') ? n(r.cihaz?.vrfIndex || 0) : 0;
  });

  const katStartRow = Object.keys(katMap).length + 5;
  Object.entries(katMap).forEach(([kat, data], idx) => {
    const rowIdx = katStartRow + idx;
    // VRF sistem sayısı ve dış ünite seçimi
    let vrfSistem = 1, vrfModel = '-';
    if (data.vrfIdx > 0) {
      while (data.vrfIdx / vrfSistem > VRF_MAX_INDEKS && vrfSistem < 10) {
        vrfSistem++;
      }
      const kwPerSistem = (data.sog / vrfSistem) / 1000;
      const du = vrfDisUniteSec(kwPerSistem);
      vrfModel = du.model;
    }
    
    katOzet.push(row([
      cell(kat,'String','sLeft'),
      cell(`=COUNTIF(A:A,"${kat}*")`,'String','sFormula'),
      cell(`=SUMIF(A:A,"${kat}*",'C:C)`,'String','sFormula'),
      cell(`=SUMIF(A:A,"${kat}*",'E:E)`,'String','sFormula'),
      cell(`=SUMIF(A:A,"${kat}*",'F:F)`,'String','sFormula'),
      cell(`=SUMIF(A:A,"${kat}*",'G:G)`,'String','sFormula'),
      cell(`=IF(D${rowIdx}>0, E${rowIdx}/D${rowIdx}, 0)`,'String','sFormula'),
      cell(data.vrfIdx,'Number','sCell'),
      cell(vrfSistem,'Number','sCell'),
      cell(vrfModel,'String','sCell'),
      cell(vrfSistem > 1 ? vrfSistem + '×' + vrfModel : vrfModel,'String','sCell'),
      cell(`=IF(H${rowIdx}>0, E${rowIdx}/I${rowIdx}, 0)`,'String','sFormula')
    ]));
  });

  // Toplam satırı
  const toplamKat = Object.values(katMap).reduce((acc, k) => ({
    rooms: acc.rooms + k.rooms,
    area: acc.area + k.area,
    people: acc.people + k.people,
    count: acc.count + k.count,
    alan: acc.alan + k.alan,
    kisi: acc.kisi + k.kisi,
    sog: acc.sog + k.sog,
    isit: acc.isit + k.isit,
    vrfIdx: acc.vrfIdx + k.vrfIdx,
    tazeHava: acc.tazeHava + k.tazeHava,
    egzoz: acc.egzoz + k.egzoz
  }), {count:0, alan:0, kisi:0, sog:0, isit:0, vrfIdx:0, tazeHava:0, egzoz:0});
  
  const toplamWm2 = toplamKat.alan > 0 ? (toplamKat.sog / toplamKat.alan).toFixed(1) : '0';
  let toplamVrfSistem = 1, toplamVrfModel = '-';
  if (toplamKat.vrfIdx > 0) {
    while (toplamKat.vrfIdx / toplamVrfSistem > VRF_MAX_INDEKS && toplamVrfSistem < 10) {
      toplamVrfSistem++;
    }
    const kwPerSistem = (toplamKat.sog / toplamVrfSistem) / 1000;
    const secilen = vrfDisUniteSec(kwPerSistem);
    toplamVrfModel = secilen.model;
  }
  
  katOzet.push(row([
    cell(lang === 'en' ? 'TOTAL' : 'TOPLAM','String','sTotal'),cell(toplamKat.count,'Number','sTotal'),cell(toplamKat.alan.toFixed(1),'Number','sTotal'),cell(toplamKat.kisi,'Number','sTotal'),
    cell(Math.round(toplamKat.sog),'Number','sTotal'),cell(Math.round(toplamKat.isit),'Number','sTotal'),cell(toplamWm2,'Number','sTotal'),
    cell(Math.round(toplamKat.vrfIdx),'Number','sTotal'),cell(toplamVrfSistem,'Number','sTotal'),cell(toplamVrfModel,'String','sTotal'),
    cell(toplamKat.tazeHava.toFixed(1),'Number','sTotal'),cell(toplamKat.egzoz.toFixed(1),'Number','sTotal')
  ]));

  // ── Worksheet: CİHAZ
  const cz = [];
  cz.push(row([cell(lang === 'en' ? 'DEVICE LIST' : 'CİHAZ LİSTESİ','String','sLeft')]));
  cz.push(row([cell(prjInfo,'String','sLeft')]));
  cz.push(row([cell('','String','sLeft')]));
  cz.push(row([
    cell(lang === 'en' ? 'No' : 'No','String','sHdrBlue'),cell(lang === 'en' ? 'Room Name' : 'Mahal Adı','String','sHdrBlue'),cell(lang === 'en' ? 'Device Type' : 'Cihaz Tipi','String','sHdrBlue'),cell(lang === 'en' ? 'Model' : 'Model','String','sHdrBlue'),cell(lang === 'en' ? 'Qty' : 'Adet','String','sHdrBlue'),
    cell(lang === 'en' ? 'Cap.(kW)' : 'Kap.(kW)','String','sHdrBlue'),cell(lang === 'en' ? 'VRF Index' : 'VRF Index','String','sHdrBlue'),cell(lang === 'en' ? 'Voltage' : 'Volt','String','sHdrBlue'),cell(lang === 'en' ? 'Watt' : 'Watt','String','sHdrBlue')
  ]));
  R.forEach(r=>{
    const c=r.cihaz||{};
    const e = (typeof getElec==='function') ? getElec(c.model) : {volt:'',watt:''};
    const deviceLabel = t.cihaz_tipleri[c.tipKey] || c.label || c.tip || '';
    const hasDevice = c.model && c.model.trim() !== '';
    cz.push(row([
      cell(xesc(s(r.mahalNo)),'String','sLeft'),cell(xesc(s(r.mahalAdi)),'String','sLeft'),
      cell(hasDevice ? xesc(deviceLabel) : '-','String','sCell'),cell(hasDevice ? xesc(s(c.model||'')) : '-','String','sCell'),cell(hasDevice ? n(c.adet)||1 : 0,'Number','sCell'),
      cell(hasDevice ? +((n(c.kapasite_W))/1000).toFixed(2) : 0,'Number','sCell'),cell(hasDevice ? n(c.vrfIndex||r.vrfIndex||0) : 0,'Number','sCell'),cell(hasDevice ? xesc(s(e.volt||'')) : '-','String','sCell'),cell(hasDevice ? (isNaN(+e.watt)?0:+e.watt) : 0,'Number','sCell')
    ]));
  });

  // VRF Dış Ünite Özeti
  const vrf = vrfOzetHesapla(R);
  cz.push(row([cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft')]));
  cz.push(row([cell(lang === 'en' ? 'VRF OUTDOOR UNIT SUMMARY' : 'VRF DIŞ ÜNİTE ÖZETİ','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal')]));
  cz.push(row([
    cell(lang === 'en' ? 'Total VRF Index' : 'Toplam VRF İndeks','String','sLeft'),cell(vrf.toplamIdx,'Number','sCell'),cell(lang === 'en' ? 'System Count' : 'Sistem Sayısı','String','sLeft'),cell(vrf.sistemSayisi,'Number','sCell'),cell(lang === 'en' ? 'Index/System' : 'İndeks/Sistem','String','sLeft'),cell(vrf.idxPerSistem,'Number','sCell'),cell(lang === 'en' ? 'kW/System' : 'kW/Sistem','String','sLeft'),cell(vrf.sogPerSistem.toFixed(1),'Number','sCell'),cell('','String','sLeft'),cell('','String','sLeft')
  ]));
  cz.push(row([
    cell(lang === 'en' ? 'Selected Model' : 'Seçilen Model','String','sLeft'),cell(vrf.secilen.model,'String','sCell'),cell(lang === 'en' ? 'HP' : 'HP','String','sLeft'),cell(vrf.secilen.hp,'Number','sCell'),cell(lang === 'en' ? 'Cooling (kW)' : 'Soğ. (kW)','String','sLeft'),cell(vrf.secilen.sogKw.toFixed(1),'Number','sCell'),cell(lang === 'en' ? 'Heating (kW)' : 'Isı (kW)','String','sLeft'),cell(vrf.secilen.istKw.toFixed(1),'Number','sCell'),cell('','String','sLeft'),cell('','String','sLeft')
  ]));
  cz.push(row([
    cell(lang === 'en' ? 'Power Supply' : 'Güç Kaynağı','String','sLeft'),cell(vrf.secilen.volt,'String','sCell'),cell(lang === 'en' ? 'Power (kW)' : 'Çekilen Güç (kW)','String','sLeft'),cell(vrf.secilen.powerKw.toFixed(2),'Number','sCell'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft'),cell('','String','sLeft')
  ]));

  // MODEL LİSTESİ
  const modelRows = [];
  modelRows.push(row([cell(lang === 'en' ? 'MODEL LIST' : 'MODEL LİSTESİ','String','sLeft')]));
  modelRows.push(row([cell(prjInfo,'String','sLeft')]));
  modelRows.push(row([
    cell('Grup','String','sHdrBlue'),cell('Tip Key','String','sHdrBlue'),cell('Etiket','String','sHdrBlue'),cell('Model','String','sHdrBlue'),
    cell('Debi (L/s)','String','sHdrBlue'),cell('Soğ.Top (W)','String','sHdrBlue'),cell('Soğ.Duy (W)','String','sHdrBlue'),cell('Isıtma (W)','String','sHdrBlue'),
    cell('VRF Index','String','sHdrBlue'),cell('Volt','String','sHdrBlue'),cell('Watt','String','sHdrBlue')
  ]));
  const addModelRow = (grupLabel, tipKey, label, modelKod, debi, sogTop, sogDuy, ist, vrfIndex)=>{
    const e = (typeof getElec==='function') ? getElec(modelKod) : {volt:'',watt:''};
    modelRows.push(row([
      cell(grupLabel,'String','sLeft'),cell(tipKey,'String','sCell'),cell(label,'String','sCell'),cell(modelKod,'String','sCell'),
      cell(+((debi)||0),'Number','sCell'),cell(+((sogTop)||0),'Number','sCell'),cell(+((sogDuy)||0),'Number','sCell'),cell(+((ist)||0),'Number','sCell'),
      cell(+((vrfIndex)||0),'Number','sCell'),cell(e.volt||'','String','sCell'),cell((isNaN(+e.watt)?0:+e.watt),'Number','sCell')
    ]));
  };
  const allFC = DEVICE_DB.fancoil || {};
  Object.entries(allFC).forEach(([tipKey, grp])=>{
    (grp.models||[]).forEach(m=>{
      addModelRow(grp.grup, tipKey, grp.label, m.kod, m.debi, m.sogTop, m.sogDuy, m.ist, 0);
    });
  });
  const allAC = DEVICE_DB.klima || {};
  Object.entries(allAC).forEach(([tipKey, grp])=>{
    (grp.models||[]).forEach(m=>{
      addModelRow(grp.grup, tipKey, grp.label, m.model, m.debi, m.sogTop, m.sogDuy, m.ist, m.index||0);
    });
  });
  const wsModel = XLSX.utils.aoa_to_sheet(modelRows.map(r=>r.match(/<Data ss:Type="[^"]*">([\s\S]*?)<\/Data>/g)?r:[]));
  // Yukarıdaki dönüşüm XLSX utils için ham AOArray gerektirir, alternatif olarak doğrudan AOArray kur
  (function(){
    const rows=[];
    rows.push([lang === 'en' ? 'MODEL LIST' : 'MODEL LİSTESİ']);
    rows.push([prjInfo]);
    rows.push(['Grup','Tip Key','Etiket','Model','Debi (L/s)','Soğ.Top (W)','Soğ.Duy (W)','Isıtma (W)','VRF Index','Volt','Watt']);
    const pushRow = (grupLabel, tipKey, label, modelKod, debi, sogTop, sogDuy, ist, vrfIndex)=>{
      const e = (typeof getElec==='function') ? getElec(modelKod) : {volt:'',watt:''};
      rows.push([grupLabel, tipKey, label, modelKod, +(debi||0), +(sogTop||0), +(sogDuy||0), +(ist||0), +(vrfIndex||0), e.volt||'', (isNaN(+e.watt)?0:+e.watt)]);
    };
    Object.entries(DEVICE_DB.fancoil||{}).forEach(([tipKey, grp])=>{
      (grp.models||[]).forEach(m=>pushRow(grp.grup, tipKey, grp.label, m.kod, m.debi, m.sogTop, m.sogDuy, m.ist, 0));
    });
    Object.entries(DEVICE_DB.klima||{}).forEach(([tipKey, grp])=>{
      (grp.models||[]).forEach(m=>pushRow(grp.grup, tipKey, grp.label, m.model, m.debi, m.sogTop, m.sogDuy, m.ist, m.index||0));
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const _mlName = lang === 'en' ? 'MODEL LIST' : 'MODEL LİSTESİ';
    applySheetStyle(ws, rows, _mlName, 3);
    ws['!cols']=[{wch:12},{wch:16},{wch:22},{wch:16},{wch:12},{wch:12},{wch:12},{wch:12},{wch:10},{wch:18},{wch:10}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:32}];
    XLSX.utils.book_append_sheet(wb, ws, _mlName);
  })();
  // ── Worksheet: MAHAL DETAY KARTLARI (Isı Kaybı)
  const detayKayip = [];
  detayKayip.push(row([cell(lang === 'en' ? 'ROOM HEAT LOSS DETAIL CARDS' : 'MAHAL ISI KAYBI DETAY KARTLARI','String','sLeft')]));
  detayKayip.push(row([cell(prjInfo,'String','sLeft')]));
  detayKayip.push(row([cell('','String','sLeft')]));
  
  R.forEach(r => {
    const td = r.thData || {};
    detayKayip.push(row([cell(`${r.mahalNo} - ${r.mahalAdi}`,'String','sTotal')]));
    detayKayip.push(row([cell('','String','sLeft')]));
    detayKayip.push(row([
      cell(lang === 'en' ? 'Component' : 'Bileşen','String','sHdrRed'),cell(lang === 'en' ? 'Area (m²)' : 'Alan (m²)','String','sHdrRed'),cell(lang === 'en' ? 'U-Value' : 'U-Değeri','String','sHdrRed'),cell(lang === 'en' ? 'ΔT (K)' : 'ΔT (K)','String','sHdrRed'),cell(lang === 'en' ? 'Heat Loss (W)' : 'Isı Kaybı (W)','String','sHdrRed'),cell(lang === 'en' ? 'Percentage' : 'Yüzde (%)','String','sHdrRed')
    ]));
    
    const kayipToplam = n(r.qKayip);
    let detaylar = [];
    
    // Duvarlar
    if (n(r.qDuvarKis) > 0) {
      const duvarAlan = n(r.alan) * 0.6; // Tahmini duvar alanı
      const yuzde = (n(r.qDuvarKis) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'External Walls' : 'Dış Duvarlar', duvarAlan.toFixed(1), '2.4', n(P.kisKt - P.icKtKis), Math.round(n(r.qDuvarKis)), yuzde]);
    }
    // Pencereler
    if (n(r.qPencKis) > 0) {
      const yuzde = (n(r.qPencKis) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Windows' : 'Pencereler', n(r.camAlan).toFixed(1), '2.8', n(P.kisKt - P.icKtKis), Math.round(n(r.qPencKis)), yuzde]);
    }
    // Döşeme
    if (n(r.qDosKis) > 0) {
      const yuzde = (n(r.qDosKis) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Floor' : 'Döşeme', n(r.alan).toFixed(1), '1.2', n(P.kisKt - P.icKtKis), Math.round(n(r.qDosKis)), yuzde]);
    }
    // Tavan
    if (n(r.qTavKis) > 0) {
      const yuzde = (n(r.qTavKis) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Roof/Ceiling' : 'Tavan/Tavan', n(r.alan).toFixed(1), '0.6', n(P.kisKt - P.icKtKis), Math.round(n(r.qTavKis)), yuzde]);
    }
    // Skylight
    if (n(r.qSkylightKis) > 0) {
      const yuzde = (n(r.qSkylightKis) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Skylight' : 'Skylight', n(r.skylightA).toFixed(2), '2.8', n(P.kisKt - P.icKtKis), Math.round(n(r.qSkylightKis)), yuzde]);
    }
    // İnfiltrasyon
    if (n(r.infilIst) > 0) {
      const yuzde = (n(r.infilIst) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Infiltration' : 'İnfiltrasyon', '-', '-', '-', Math.round(n(r.infilIst)), yuzde]);
    }
    // Havalandırma
    if (n(td.thIst) > 0) {
      const yuzde = (n(td.thIst) / kayipToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Ventilation Heating' : 'Havalandırma Isıtma', '-', '-', '-', Math.round(n(td.thIst)), yuzde]);
    }
    
    detaylar.forEach(detay => {
      detayKayip.push(row([
        cell(detay[0],'String','sLeft'),cell(detay[1],'Number','sCell'),cell(detay[2],'Number','sCell'),cell(detay[3],'Number','sCell'),cell(detay[4],'Number','sCell'),cell(detay[5],'Number','sCell')
      ]));
    });
    
    detayKayip.push(row([cell('','String','sLeft')]));
    detayKayip.push(row([
      cell(lang === 'en' ? 'TOTAL HEAT LOSS' : 'TOPLAM ISI KAYBI','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell('','String','sTotal'),cell(Math.round(kayipToplam),'Number','sTotal'),cell('100.0','Number','sTotal')
    ]));
    
    // Ek bilgiler
    detayKayip.push(row([cell('','String','sLeft')]));
    detayKayip.push(row([cell(lang === 'en' ? 'Additional Info:' : 'Ek Bilgiler:','String','sLeft')]));
    detayKayip.push(row([
      cell(lang === 'en' ? 'Room Volume' : 'Mahal Hacmi','String','sCell'),cell(`${(n(r.alan) * n(r.tavanYukseklik || 3)).toFixed(1)} m³`,'String','sCell'),cell('','String','sCell'),cell('','String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKayip.push(row([
      cell(lang === 'en' ? 'ACH' : 'ACH','String','sCell'),cell(n(r.infilACH_val).toFixed(2),'String','sCell'),cell('','String','sCell'),cell('','String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKayip.push(row([cell('','String','sLeft')]));
    detayKayip.push(row([cell('','String','sLeft')]));
  });

  // ── Worksheet: MAHAL DETAY KARTLARI (Isı Kazancı)
  const detayKazanc = [];
  detayKazanc.push(row([cell(lang === 'en' ? 'ROOM COOLING LOAD DETAIL CARDS' : 'MAHAL ISI KAZANCI DETAY KARTLARI','String','sLeft')]));
  detayKazanc.push(row([cell(prjInfo,'String','sLeft')]));
  detayKazanc.push(row([cell('','String','sLeft')]));
  
  R.forEach(r => {
    const pk = r.peak || {};
    const td = r.thData || {};
    detayKazanc.push(row([cell(`${r.mahalNo} - ${r.mahalAdi}`,'String','sTotal')]));
    detayKazanc.push(row([cell('','String','sLeft')]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'Component' : 'Bileşen','String','sHdrBlue'),cell(lang === 'en' ? 'Value (W)' : 'Değer (W)','String','sHdrBlue'),cell(lang === 'en' ? 'Percentage' : 'Yüzde (%)','String','sHdrBlue'),cell(lang === 'en' ? 'Description' : 'Açıklama','String','sHdrBlue')
    ]));
    
    const kazancToplam = n(r.bestLoad);
    let detaylar = [];
    
    // Cam Radyasyon
    if (n(pk.qCam) > 0) {
      const yuzde = (n(pk.qCam) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Glass Radiation' : 'Cam Radyasyonu', Math.round(n(pk.qCam)), yuzde, `${lang === 'en' ? 'Peak: ' : 'Peak: '}${s(AY_SHORT[r.bestAy]||r.bestAy)} ${r.bestSaat}:00`]);
    }
    // Dış Duvar
    if (n(pk.qDuvar) > 0) {
      const yuzde = (n(pk.qDuvar) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'External Wall' : 'Dış Duvar', Math.round(n(pk.qDuvar)), yuzde, `CLTD: ${Math.round(n(pk.cltdDuvar)||0)}K`]);
    }
    // Pencere İletim
    if (n(pk.qPencIlet) > 0) {
      const yuzde = (n(pk.qPencIlet) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Window Conduction' : 'Pencere İletimi', Math.round(n(pk.qPencIlet)), yuzde, `U: 2.8 W/m²K`]);
    }
    // Tavan
    if (n(pk.qTavan) > 0) {
      const yuzde = (n(pk.qTavan) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Roof/Ceiling' : 'Tavan', Math.round(n(pk.qTavan)), yuzde, `CLTD: ${Math.round(n(pk.cltdTavan)||0)}K`]);
    }
    // Döşeme
    if (n(pk.qDoseme) > 0) {
      const yuzde = (n(pk.qDoseme) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Floor' : 'Döşeme', Math.round(n(pk.qDoseme)), yuzde, `ΔT: ${Math.round(n(P.Tmax - P.icKtYaz))}K`]);
    }
    // İnsanlar
    if (n(pk.qInsan) > 0) {
      const yuzde = (n(pk.qInsan) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'People' : 'İnsanlar', Math.round(n(pk.qInsan)), yuzde, `${n(r.nToplam)} × ${n(r.sensiblePerPerson||70)}W`]);
    }
    // Aydınlatma
    if (n(pk.qAydinlatma) > 0) {
      const yuzde = (n(pk.qAydinlatma) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Lighting' : 'Aydınlatma', Math.round(n(pk.qAydinlatma)), yuzde, `${n(r.alan)}m² × ${n(r.aydinlatmaWm2||10)}W/m²`]);
    }
    // Cihazlar
    if (n(pk.qCihaz) > 0) {
      const yuzde = (n(pk.qCihaz) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Equipment' : 'Cihazlar', Math.round(n(pk.qCihaz)), yuzde, `${n(r.alan)}m² × ${n(r.cihazWm2||0)}W/m²`]);
    }
    // İç Duyulur
    if (n(pk.qIcDuy) > 0) {
      const yuzde = (n(pk.qIcDuy) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Internal Sensible' : 'İç Duyulur', Math.round(n(pk.qIcDuy)), yuzde, lang === 'en' ? 'From people & equipment' : 'İnsan ve cihazlardan']);
    }
    // İç Gizli
    if (n(pk.qIcGiz) > 0) {
      const yuzde = (n(pk.qIcGiz) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Internal Latent' : 'İç Gizli', Math.round(n(pk.qIcGiz)), yuzde, lang === 'en' ? 'From people' : 'İnsanlardan']);
    }
    // İnfiltrasyon
    if (n(r.infilSog) > 0) {
      const yuzde = (n(r.infilSog) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Infiltration' : 'İnfiltrasyon', Math.round(n(r.infilSog)), yuzde, `${n(r.infilACH_val)} ACH`]);
    }
    // Havalandırma
    if (n(td.thSogT) > 0) {
      const yuzde = (n(td.thSogT) / kazancToplam * 100).toFixed(1);
      detaylar.push([lang === 'en' ? 'Ventilation Cooling' : 'Havalandırma Soğutma', Math.round(n(td.thSogT)), yuzde, `${n(td.th)} L/s`]);
    }
    
    detaylar.forEach(detay => {
      detayKazanc.push(row([
        cell(detay[0],'String','sLeft'),cell(detay[1],'Number','sCell'),cell(detay[2],'Number','sCell'),cell(detay[3],'String','sCell')
      ]));
    });
    
    detayKazanc.push(row([cell('','String','sLeft')]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'TOTAL COOLING LOAD' : 'TOPLAM ISI KAZANCI','String','sTotal'),cell(Math.round(kazancToplam),'Number','sTotal'),cell('100.0','Number','sTotal'),cell(`${lang === 'en' ? 'Peak: ' : 'Peak: '}${s(AY_SHORT[r.bestAy]||r.bestAy)} ${r.bestSaat}:00`,'String','sTotal')
    ]));
    
    // Ek bilgiler
    detayKazanc.push(row([cell('','String','sLeft')]));
    detayKazanc.push(row([cell(lang === 'en' ? 'Additional Info:' : 'Ek Bilgiler:','String','sLeft')]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'Room Volume' : 'Mahal Hacmi','String','sCell'),cell(`${(n(r.alan) * n(r.tavanYukseklik || 3)).toFixed(1)} m³`,'String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'Air Changes' : 'Hava Değişimi','String','sCell'),cell(`${n(r.infilACH_val).toFixed(2)} ACH`,'String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'Fresh Air' : 'Taze Hava','String','sCell'),cell(`${n(td.th)} L/s (${(n(td.th)*3.6).toFixed(1)} m³/h)`,'String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKazanc.push(row([
      cell(lang === 'en' ? 'W/m²' : 'W/m²','String','sCell'),cell(`${(kazancToplam/n(r.alan)).toFixed(1)} W/m²`,'String','sCell'),cell('','String','sCell'),cell('','String','sCell')
    ]));
    detayKazanc.push(row([cell('','String','sLeft')]));
    detayKazanc.push(row([cell('','String','sLeft')]));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
${styles}
${ws(lang === 'en' ? 'SUMMARY' : 'ÖZET', ozet)}
${ws(lang === 'en' ? 'HEAT LOSS' : 'ISI KAYBI', ik)}
${ws(lang === 'en' ? 'COOLING LOAD' : 'ISI KAZANCI', ig)}
${ws(lang === 'en' ? 'VENTILATION' : 'HAVALANDIRMA', hv)}
${ws(lang === 'en' ? 'FLOOR SUMMARY' : 'KAT BAZINDA ÖZET', katOzet)}
${ws(lang === 'en' ? 'DEVICES' : 'CİHAZ', cz)}
${ws(lang === 'en' ? 'HEAT LOSS DETAILS' : 'ISI KAYBI DETAYLARI', detayKayip)}
${ws(lang === 'en' ? 'COOLING LOAD DETAILS' : 'ISI KAZANCI DETAYLARI', detayKazanc)}
</Workbook>`;

  // Global ampersand fix - replace ALL & with &amp; then fix the ones we broke
  console.log('Before fix - ampersand count:', (xml.match(/&/g) || []).length);
  let fixedXml = xml;
  
  // Multiple passes to catch all ampersands
  fixedXml = fixedXml.replace(/&/g, '&amp;');
  fixedXml = fixedXml.replace(/&/g, '&amp;'); // Second pass for any missed ones
  
  // Fix the ones we accidentally broke
  fixedXml = fixedXml.replace(/&amp;lt;/g, '&lt;')
                     .replace(/&amp;gt;/g, '&gt;')
                     .replace(/&amp;quot;/g, '&quot;')
                     .replace(/&amp;apos;/g, '&apos;');
  
  console.log('After fix - ampersand count:', (fixedXml.match(/&/g) || []).length);
  console.log('After fix - escaped ampersand count:', (fixedXml.match(/&amp;/g) || []).length);

  console.log('XML length:', fixedXml.length);
  console.log('XML preview (first 500 chars):', fixedXml.substring(0, 500));
  
  // Basic XML validation
  if (!fixedXml.startsWith('<?xml')) {
    console.error('ERROR: Invalid XML - missing declaration');
  }
  if (!fixedXml.includes('</Workbook>')) {
    console.error('ERROR: Invalid XML - missing Workbook closing tag');
  }
  
  // Check for common XML issues
  const issues = [];
  if (fixedXml.includes('&')) {
    const ampCount = (fixedXml.match(/&/g) || []).length;
    const escapedAmpCount = (fixedXml.match(/&amp;/g) || []).length;
    if (ampCount > escapedAmpCount) {
      issues.push(`Unescaped ampersands: ${ampCount - escapedAmpCount}`);
    }
  }
  
  if (issues.length > 0) {
    console.error('XML Issues found:', issues);
  } else {
    console.log('✅ XML validation passed - No ampersand issues!');
  }

  const blob = new Blob([fixedXml], {type: 'application/vnd.ms-excel;charset=utf-8'});
  console.log('Blob created, size:', blob.size, 'bytes');
  
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  console.log('Object URL created:', url);
  
  a.href = url;
  a.download = `HVAC_Rapor_${now.replace(/[\/\\:*?"<>|]/g,'-')}.xlsx`;
  console.log('Download filename:', a.download);
  console.log('File extension changed to .xlsx for better compatibility');
  
  document.body.appendChild(a);
  console.log('Element added to DOM');
  
  a.click();
  console.log('Click triggered');
  a.remove();
  console.log('Element removed from DOM');
  
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  console.log('=== XML WORKBOOK EXPORT END ===');
}

function exportCSV(){
  const R = globalResults || [];
  const P = globalParams || {};
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const now = new Date().toLocaleDateString(_isEN ? 'en-GB' : 'tr-TR');
  
  let csv = '\ufeff'; // BOM for UTF-8
  csv += 'Mahal No,Mahal Adı,Alan (m²),Kişi,Soğutma (W),Isıtma (W),W/m²,Cihaz Tipi,Model,Adet,TH L/s,TH m³/h,ACH\n';
  
  R.forEach(r => {
    const c = r.cihaz || {};
    const td = r.thData || {};
    const hasDevice = c.model && c.model.trim() !== '';
    const wm2 = r.alan > 0 ? (r.bestLoad/r.alan).toFixed(1) : 0;
    
    csv += `${r.mahalNo},"${r.mahalAdi}",${r.alan},${r.nToplam},${Math.round(r.bestLoad)},${Math.round(r.qKayip)},${wm2},"${hasDevice ? (c.label || c.tip || '') : '-'}","${hasDevice ? c.model : '-'}",${hasDevice ? (c.adet || 1) : 0},${td.th || 0},${(td.th || 0) * 3.6},${r.infilACH_val || 0.5}\n`;
  });
  
  const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `HVAC_Rapor_${now.replace(/[\/\\:*?"<>|]/g,'-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function exportExcelHtmlXls(){
  const R = globalResults || [];
  const P = globalParams || {};
  const _isEN = (typeof LANG !== 'undefined' && LANG === 'en');
  const now = new Date().toLocaleDateString(_isEN ? 'en-GB' : 'tr-TR');
  
  console.log('=== HTML EXPORT DEBUG ===');
  console.log('globalResults length:', R.length);
  if(R.length > 0) {
    console.log('İlk mahal keys:', Object.keys(R[0]).sort());
    console.log('İlk mahal qAyd:', R[0].qAyd);
    console.log('İlk mahal qCihaz:', R[0].qCihaz);
    console.log('İlk mahal insDuy:', R[0].insDuy);
  }

  function n(v){ return isNaN(+v)?0:(+v||0); }
  function s(v){ return v==null?'':String(v); }
  function fmt(v,d=0){ return n(v).toLocaleString(_isEN?'en-US':'tr-TR',{maximumFractionDigits:d}); }
  function katCikar(no){
    if(!no) return '–';
    const str=String(no);
    const m=str.match(/^([A-Za-z]+\d*)/);
    if(m) return m[1];
    const num=parseInt(str);
    if(!isNaN(num)) return Math.floor(num/100)+'00';
    return str.split('-')[0]||str;
  }

  const prjInfo = `Proje No: ${s(P.prjNo)} | Şehir: ${s(P.sehir)} | Tarih: ${now} | Hazırlayan: ${s(P.kim)} | Sistem: ${s(P.sistem).toUpperCase()} | İç Ünite: ${s(P.icUniteTip)}`;

  const AY_SHORT=['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

  const headStyle = 'background:#2F5597;color:#FFFFFF;font-weight:700;border:1px solid #000000;text-align:center;vertical-align:middle;white-space:nowrap;';
  const cellStyle = 'border:1px solid #E5E7EB;text-align:center;vertical-align:middle;';
  const leftStyle = 'border:1px solid #E5E7EB;text-align:left;vertical-align:middle;';
  const totalStyle = 'background:#0F5132;color:#FFFFFF;font-weight:700;border:1px solid #000000;text-align:center;vertical-align:middle;';

  let sumSog=0,sumKayip=0,sumAlan=0,sumKisi=0;
  const rowsHtml = R.map(r=>{
    // Peak objesi - hourlyLoads'tan al (JSON'da key'ler string!)
    const pk = (r.hourlyLoads && r.bestAy && r.bestSaat) 
      ? (r.hourlyLoads[String(r.bestAy)] && r.hourlyLoads[String(r.bestAy)][String(r.bestSaat)]) 
        ? r.hourlyLoads[String(r.bestAy)][String(r.bestSaat)]
        : (r.peak || {})
      : (r.peak || {});
    const td=r.thData||{};
    const c=r.cihaz||{};
    const sog=Math.round(n(r.bestLoad));
    const kip=Math.round(n(r.qKayip));
    sumSog+=sog; sumKayip+=kip; sumAlan+=n(r.alan); sumKisi+=n(r.nToplam);
    const wm2 = n(r.alan)>0 ? Math.round(sog/n(r.alan)) : 0;
    const skylightFill = (n(r.skylightA)>0) ? 'background:#FEF3C7;color:#92400E;' : '';
    const negColor = (v)=> (n(v)<0 ? 'color:#DC2626;font-weight:700;' : '');
    return `
      <tr>
        <td style="${leftStyle}">${s(r.mahalNo)}</td>
        <td style="${leftStyle}">${s(r.mahalAdi)}</td>
        <td style="${cellStyle}">${s(r.mahalTip||'')}</td>
        <td style="${cellStyle}">${katCikar(r.mahalNo)}</td>
        <td style="${cellStyle}">${s(AY_SHORT[r.bestAy]||r.bestAy)}</td>
        <td style="${cellStyle}">${s(r.bestSaat||0)}:00</td>
        <td style="${cellStyle}">${fmt(r.Tic_yaz||24,1)}</td>
        <td style="${cellStyle}${negColor(pk.qCam)}">${fmt(pk.qCam||0,0)}</td>
        <td style="${cellStyle}${negColor(pk.qDuvar)}">${fmt(pk.qDuvar||0,0)}</td>
        <td style="${cellStyle}${negColor(pk.qPencIlet)}">${fmt(pk.qPencIlet||0,0)}</td>
        <td style="${cellStyle}${negColor(pk.qTavan)}">${fmt(pk.qTavan||0,0)}</td>
        <td style="${cellStyle}${negColor(pk.qDoseme)}">${fmt(pk.qDoseme||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.qIcDuy||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.qIcGiz||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.rsh||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.rlh||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.ersh||0,0)}</td>
        <td style="${cellStyle}">${fmt(pk.erlh||0,0)}</td>
        <td style="${cellStyle};color:#2563EB;font-weight:700;">${fmt(sog,0)}</td>
        <td style="${cellStyle};color:#DC2626;font-weight:700;">${fmt(kip,0)}</td>
        <td style="${cellStyle}">${fmt(r.alan||0,1)}</td>
        <td style="${cellStyle}">${fmt(r.nToplam||0,0)}</td>
        <td style="${cellStyle}">${fmt(wm2,0)}</td>
        <td style="${cellStyle}">${s(c.label||c.tip||'')}</td>
        <td style="${cellStyle}">${s(c.model||'')}</td>
        <td style="${cellStyle}">${fmt(c.adet||1,0)}</td>
        <td style="${cellStyle}">${fmt(td.th||0,1)}</td>
        <td style="${cellStyle}">${fmt(Math.round(n(td.th)*3.6),0)}</td>
        <td style="${cellStyle}">${fmt(td.egzoz||0,1)}</td>
        <td style="${cellStyle}">${fmt(Math.round(n(td.egzoz)*3.6),0)}</td>
        <td style="${cellStyle}">${fmt(td.thSogT||0,0)}</td>
        <td style="${cellStyle}">${fmt(td.thIst||0,0)}</td>
        <td style="${cellStyle}${skylightFill}">${fmt(r.skylightA||0,2)}</td>
        <td style="${cellStyle}">${s(r.ahuZon||'–')}</td>
      </tr>`;
  }).join('');

  const totalWm2 = sumAlan>0 ? Math.round(sumSog/sumAlan) : 0;

  // ═══════════════════════════════════════════════════════
  // DETAYLI YÜK BİLEŞENLERİ TABLOLARI (HAP STİLİ)
  // ═══════════════════════════════════════════════════════
  const detayTabloHtml = R.map((r,idx)=>{
    // DEBUG: İlk 3 mahal için field'ları kontrol et
    if(idx < 3) {
      console.log(`\nHTML Export - Mahal ${idx}: ${r.mahalAdi}`);
      console.log('  qAyd:', r.qAyd);
      console.log('  qCihaz:', r.qCihaz);
      console.log('  insDuy:', r.insDuy);
      console.log('  insGiz:', r.insGiz);
      console.log('  infilSogHam:', r.infilSogHam);
      console.log('  bestLoad:', r.bestLoad);
    }
    
    const pk = (r.hourlyLoads && r.bestAy && r.bestSaat) 
      ? (r.hourlyLoads[String(r.bestAy)] && r.hourlyLoads[String(r.bestAy)][String(r.bestSaat)]) 
        ? r.hourlyLoads[String(r.bestAy)][String(r.bestSaat)]
        : (r.peak || {})
      : (r.peak || {});
    
    const sog = Math.round(n(r.bestLoad));
    const kip = Math.round(n(r.qKayip));
    
    return `
    <div style="page-break-before:${idx>0?'always':'auto'};margin:20px;">
      <table style="border-collapse:collapse;font-family:Calibri,Arial;font-size:10px;width:100%;margin-bottom:20px;">
        <tr>
          <td colspan="4" style="background:#2F5597;color:#FFF;font-weight:700;padding:8px;font-size:12px;">
            TABLE 1.1.A. COMPONENT LOADS FOR SPACE "${s(r.mahalAdi)}" IN ZONE "ZONE ${katCikar(r.mahalNo)}"
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:6px;border:1px solid #ccc;">Room: ${s(r.mahalNo)}</td>
          <td colspan="2" style="padding:6px;border:1px solid #ccc;text-align:right;">Area: ${fmt(r.alan,2)} m²</td>
        </tr>
        <tr>
          <td colspan="4" style="padding:6px;border:1px solid #ccc;">Occupancy: ${r.nToplam||0} persons</td>
        </tr>
        <tr><td colspan="4" style="padding:10px;"></td></tr>
        
        <!-- DESIGN COOLING -->
        <tr>
          <td colspan="4" style="background:#2F5597;color:#FFF;font-weight:700;padding:6px;border:1px solid #000;">
            DESIGN COOLING
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">COOLING DATA AT</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">${AY_SHORT[r.bestAy]||''} ${r.bestSaat}:00</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">COOLING OA DB/WB</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(P.Tmax,1)}°C / ${fmt(P.yazYT,1)}°C</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">OCCUPIED T-STAT</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.Tic_yaz||24,1)}°C</td>
        </tr>
        <tr><td colspan="4" style="padding:6px;"></td></tr>
        
        <!-- DESIGN HEATING -->
        <tr>
          <td colspan="4" style="background:#2F5597;color:#FFF;font-weight:700;padding:6px;border:1px solid #000;">
            DESIGN HEATING
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">HEATING DATA AT</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">DES HTG</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">HEATING OA DB/WB</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(P.kisKt,1)}°C / ${fmt(P.kisKt-2,1)}°C</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">OCCUPIED T-STAT</td>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.Tic_kis||20,1)}°C</td>
        </tr>
        <tr><td colspan="4" style="padding:10px;"></td></tr>
        
        <!-- SPACE LOADS -->
        <tr>
          <td colspan="4" style="background:#2F5597;color:#FFF;font-weight:700;padding:6px;border:1px solid #000;">
            SPACE LOADS
          </td>
        </tr>
        <tr>
          <td colspan="2" style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;">DETAILS</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">SENSIBLE (W)</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">LATENT (W)</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Window & Skylight Solar Loads</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(pk.qCam||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Wall Transmission</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(pk.qDuvar||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Roof Transmission</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(pk.qTavan||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Floor Transmission</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(pk.qDoseme||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Overhead Lighting</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.qAyd||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Electric Equipment</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.qCihaz||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">People</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.insDuy||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.insGiz||0,1)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;">Infiltration</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">${fmt(r.infilSogHam||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #ccc;background:#D0E0F0;font-weight:600;">Safety Factor</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;background:#D0E0F0;font-weight:600;">${P.odaZam||10}%+${P.effZam||10}%</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:right;background:#D0E0F0;font-weight:600;">0.0</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:4px;border:1px solid #000;background:#0F5132;color:#FFF;font-weight:700;">Total Zone Loads</td>
          <td style="padding:4px;border:1px solid #000;background:#0F5132;color:#FFF;font-weight:700;text-align:right;">${fmt(sog,1)}</td>
          <td style="padding:4px;border:1px solid #000;background:#0F5132;color:#FFF;font-weight:700;text-align:right;">0.0</td>
        </tr>
      </table>
      
      <!-- ENVELOPE LOADS TABLE -->
      <table style="border-collapse:collapse;font-family:Calibri,Arial;font-size:10px;width:100%;">
        <tr>
          <td colspan="7" style="background:#2F5597;color:#FFF;font-weight:700;padding:8px;font-size:12px;">
            TABLE 1.1.B. ENVELOPE LOADS FOR SPACE "${s(r.mahalAdi)}" IN ZONE "ZONE ${katCikar(r.mahalNo)}"
          </td>
        </tr>
        <tr>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;">SURFACE</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">AREA (M²)</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">U-VALUE (W/M²·K)</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">SHADE COEFF</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">COOLING TRANS (W)</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">COOLING SOLAR (W)</td>
          <td style="background:#4472C4;color:#FFF;font-weight:700;padding:4px;border:1px solid #000;text-align:center;">HEATING TRANS (W)</td>
        </tr>
        <tr>
          <td style="padding:4px;border:1px solid #ccc;">Window</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt((r.penKuzey||0)+(r.penGuney||0)+(r.penDogu||0)+(r.penBati||0),2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.uPenc||2.8,2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(P.shgc||0.6,2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(pk.qPencIlet||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(pk.qCam||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.qPencKis||0,1)}</td>
        </tr>
        <tr>
          <td style="padding:4px;border:1px solid #ccc;">Wall</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt((r.duvKuzey||0)+(r.duvGuney||0)+(r.duvDogu||0)+(r.duvBati||0),2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.uDuv||0.5,2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">-</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(pk.qDuvar||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">0.0</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.qDuvarKis||0,1)}</td>
        </tr>
        <tr>
          <td style="padding:4px;border:1px solid #ccc;">Roof</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.tavanA||0,2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.uTav||0.4,2)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">-</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(pk.qTavan||0,1)}</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">0.0</td>
          <td style="padding:4px;border:1px solid #ccc;text-align:center;">${fmt(r.qTavKis||0,1)}</td>
        </tr>
      </table>
    </div>
    `;
  }).join('');

  const html = `
  <html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
    <table style="border-collapse:collapse;font-family:Calibri,Arial;font-size:11px;">
      <tr><td colspan="31" style="font-size:16px;font-weight:700;padding:8px 6px;">ISI YÜK HESABI – ÖZET ÇİZELGESİ   ${s(P.prjAdi)}</td></tr>
      <tr><td colspan="31" style="padding:4px 6px;color:#374151;">${prjInfo}</td></tr>
      <tr><td colspan="31" style="padding:4px 6px;"></td></tr>
      <tr>
        <th style="${headStyle}">No</th>
        <th style="${headStyle}">Mahal Adı</th>
        <th style="${headStyle}">Tip</th>
        <th style="${headStyle}">Kat</th>
        <th style="${headStyle}">Peak Ay</th>
        <th style="${headStyle}">Peak Saat</th>
        <th style="${headStyle}">İç KT (°C)</th>
        <th style="${headStyle}">Cam (W)</th>
        <th style="${headStyle}">Duvar (W)</th>
        <th style="${headStyle}">Penc.İlet (W)</th>
        <th style="${headStyle}">Tavan (W)</th>
        <th style="${headStyle}">Döşeme (W)</th>
        <th style="${headStyle}">İç.Duy (W)</th>
        <th style="${headStyle}">İç.Giz (W)</th>
        <th style="${headStyle}">Rsh (W)</th>
        <th style="${headStyle}">Rlh (W)</th>
        <th style="${headStyle}">Ersh (W)</th>
        <th style="${headStyle}">Erlh (W)</th>
        <th style="${headStyle}">SOĞUTMA Gth (W)</th>
        <th style="${headStyle}">ISINMA Q (W)</th>
        <th style="${headStyle}">Alan (m²)</th>
        <th style="${headStyle}">Kişi</th>
        <th style="${headStyle}">W/m²</th>
        <th style="${headStyle}">Cihaz Tipi</th>
        <th style="${headStyle}">Model</th>
        <th style="${headStyle}">Adet</th>
        <th style="${headStyle}">TH (L/s)</th>
        <th style="${headStyle}">TH (m³/h)</th>
        <th style="${headStyle}">Egzoz (L/s)</th>
        <th style="${headStyle}">Egzoz (m³/h)</th>
        <th style="${headStyle}">Skylight (m²)</th>
        <th style="${headStyle}">AHU/SAN</th>
      </tr>
      ${rowsHtml}
      <tr>
        <td colspan="18" style="${totalStyle};text-align:right;">GENEL TOPLAM</td>
        <td style="${totalStyle}">${fmt(sumSog,0)}</td>
        <td style="${totalStyle}">${fmt(sumKayip,0)}</td>
        <td style="${totalStyle}">${fmt(sumAlan,1)}</td>
        <td style="${totalStyle}">${fmt(sumKisi,0)}</td>
        <td style="${totalStyle}">${fmt(totalWm2,0)}</td>
        <td colspan="9" style="${totalStyle}"></td>
      </tr>
    </table>
    
    <!-- DETAYLI YÜK BİLEŞENLERİ TABLOLARI -->
    ${detayTabloHtml}
    
  </body>
  </html>`;

  const blob = new Blob([html], {type: 'application/vnd.ms-excel;charset=utf-8'});
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `HVAC_Rapor_${now.replace(/\./g,'-')}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

// ═══════════════════════════════════════════════════════
// XLSX STİL YARDIMCI FONKSİYONLARI (JSZip ile çalışır)
// ═══════════════════════════════════════════════════════

function _hex(rgb) {
  if (!rgb) return 'FF000000';
  rgb = String(rgb).replace('#','');
  return rgb.length === 6 ? 'FF' + rgb.toUpperCase() : rgb.toUpperCase();
}

function _collectStyleInfo(wb) {
  const fonts = [{ sz:10, name:'Calibri', color:{rgb:'FF1F2937'} }];
  const fills = [
    { patternType:'none' },
    { patternType:'gray125' }
  ];
  const borders = [{ left:{}, right:{}, top:{}, bottom:{} }];
  const xfs   = [{ fontId:0, fillId:0, borderId:0 }];

  const fontMap={}, fillMap={}, borderMap={}, xfMap={'0|0|0|':0};
  const cellStyleMap = {}; // cellAddr -> xfIndex, per sheet

  function addFont(f) {
    if (!f) return 0;
    const k = JSON.stringify(f);
    if (fontMap[k]!==undefined) return fontMap[k];
    const i = fonts.length; fonts.push(f); fontMap[k]=i; return i;
  }
  function addFill(f) {
    if (!f || !f.fgColor) return 0;
    const k = JSON.stringify(f);
    if (fillMap[k]!==undefined) return fillMap[k];
    const i = fills.length; fills.push(f); fillMap[k]=i; return i;
  }
  function addBorder(b) {
    if (!b) return 0;
    const k = JSON.stringify(b);
    if (borderMap[k]!==undefined) return borderMap[k];
    const i = borders.length; borders.push(b); borderMap[k]=i; return i;
  }
  function addXf(fontId, fillId, borderId, alignment) {
    const k = `${fontId}|${fillId}|${borderId}|${JSON.stringify(alignment||'')}`;
    if (xfMap[k]!==undefined) return xfMap[k];
    const i = xfs.length;
    xfs.push({ fontId, fillId, borderId, alignment });
    xfMap[k]=i; return i;
  }

  wb.SheetNames.forEach((sname, si) => {
    const ws = wb.Sheets[sname];
    if (!ws) return;
    cellStyleMap[si] = {};
    Object.keys(ws).forEach(addr => {
      if (addr[0]==='!') return;
      const cell = ws[addr];
      if (!cell || !cell.s) return;
      const s = cell.s;
      const fontId   = addFont(s.font || null);
      const fillId   = addFill(s.fill || null);
      const borderId = addBorder(s.border || null);
      const xfIdx    = addXf(fontId, fillId, borderId, s.alignment || null);
      cellStyleMap[si][addr] = xfIdx;
    });
  });

  return { fonts, fills, borders, xfs, cellStyleMap };
}

function _buildStylesXml(info) {
  const { fonts, fills, borders, xfs } = info;

  const numFmts = '<numFmts count="0"/>';

  let fontsXml = `<fonts count="${fonts.length}">`;
  fonts.forEach(f => {
    fontsXml += '<font>';
    if (f.bold)   fontsXml += '<b/>';
    if (f.italic) fontsXml += '<i/>';
    fontsXml += `<sz val="${f.sz||10}"/>`;
    const c = f.color && f.color.rgb ? _hex(f.color.rgb) : 'FF000000';
    fontsXml += `<color rgb="${c}"/>`;
    fontsXml += `<name val="${f.name||'Calibri'}"/>`;
    fontsXml += '</font>';
  });
  fontsXml += '</fonts>';

  let fillsXml = `<fills count="${fills.length}">`;
  fills.forEach((f, i) => {
    fillsXml += '<fill>';
    if (i < 2) {
      fillsXml += `<patternFill patternType="${i===0?'none':'gray125'}"/>`;
    } else {
      fillsXml += `<patternFill patternType="${f.patternType||'solid'}">`;
      if (f.fgColor && f.fgColor.rgb) {
        fillsXml += `<fgColor rgb="${_hex(f.fgColor.rgb)}"/>`;
      }
      fillsXml += '</patternFill>';
    }
    fillsXml += '</fill>';
  });
  fillsXml += '</fills>';

  let bordersXml = `<borders count="${borders.length}">`;
  borders.forEach(b => {
    bordersXml += '<border>';
    ['left','right','top','bottom','diagonal'].forEach(side => {
      const s = b[side];
      if (s && s.style) {
        bordersXml += `<${side} style="${s.style}">`;
        if (s.color && s.color.rgb) bordersXml += `<color rgb="${_hex(s.color.rgb)}"/>`;
        bordersXml += `</${side}>`;
      } else {
        bordersXml += `<${side}/>`;
      }
    });
    bordersXml += '</border>';
  });
  bordersXml += '</borders>';

  const cellStyleXfs = '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>';

  let cellXfsXml = `<cellXfs count="${xfs.length}">`;
  xfs.forEach(xf => {
    let attrs = `numFmtId="0" fontId="${xf.fontId||0}" fillId="${xf.fillId||0}" borderId="${xf.borderId||0}" xfId="0"`;
    if (xf.fontId > 0)  attrs += ' applyFont="1"';
    if (xf.fillId > 1)  attrs += ' applyFill="1"';
    if (xf.borderId > 0) attrs += ' applyBorder="1"';
    if (xf.alignment)   attrs += ' applyAlignment="1"';
    cellXfsXml += `<xf ${attrs}>`;
    if (xf.alignment) {
      let al = '';
      if (xf.alignment.horizontal) al += ` horizontal="${xf.alignment.horizontal}"`;
      if (xf.alignment.vertical)   al += ` vertical="${xf.alignment.vertical}"`;
      if (xf.alignment.wrapText)   al += ` wrapText="1"`;
      cellXfsXml += `<alignment${al}/>`;
    }
    cellXfsXml += '</xf>';
  });
  cellXfsXml += '</cellXfs>';

  const cellStyles = '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`+
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`+
    numFmts + fontsXml + fillsXml + bordersXml + cellStyleXfs + cellXfsXml + cellStyles +
    `</styleSheet>`;
}

function _patchSheetXml(sheetXml, ws, styleInfo, sheetIndex) {
  const styleMap = styleInfo.cellStyleMap[sheetIndex] || {};
  if (Object.keys(styleMap).length === 0) return sheetXml;

  // Her <c r="ADDR" ...> tag'ine s="N" ekle
  return sheetXml.replace(/<c r="([A-Z]+\d+)"([^>]*?)>/g, (match, addr, rest) => {
    const xfIdx = styleMap[addr];
    if (xfIdx === undefined || xfIdx === 0) return match;
    // Mevcut s="..." varsa değiştir, yoksa ekle
    if (/\bs="[^"]*"/.test(rest)) {
      rest = rest.replace(/\bs="[^"]*"/, `s="${xfIdx}"`);
    } else {
      rest = ` s="${xfIdx}"` + rest;
    }
    return `<c r="${addr}"${rest}>`;
  });
}

async function _hvacBuildWorkbook(){
  const R=globalResults, P=globalParams;
  const _isEN = (LANG === 'en');
  const now=new Date().toLocaleDateString(_isEN ? 'en-GB' : 'tr-TR');
  const wb=XLSX.utils.book_new();
  const AY_SHORT=['','Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  const AY_FULL =['','Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  // ─── DİL DESTEĞİ ──────────────────────────────────────────────────────────
  // Cihaz etiketi çevirici (DEVICE_DB label → EN)
  // Sıralama önemli: uzun/spesifik eşleşmeler önce gelir
  const _LABEL_MAP = [
    // label alanları (uzun formlar önce)
    ['Hassas Klima',           'Precision AC'],
    ['Duvar Tipi',             'Wall Type'],
    ['Döşeme Tipi',            'Floor Type'],
    ['Orta ESP Kanallı',       'Med. Static Ducted'],
    ['Yüksek ESP Kanallı',     'High Static Ducted'],
    ['4 Yön Kaset (Standart)', '4-Way Cassette (Standard)'],
    ['4 Yön Kaset',            '4-Way Cassette'],
    ['Gizli Tavan',            'Concealed Ceiling'],
    ['Yerden Isıtma',          'Underfloor'],
    ['Salon Tipi',             'Console Type'],
    // tipAdi alanları (kısa formlar)
    ['Orta Kanal',             'Med. Ducted'],
    ['Yük.Kanal',              'High Static Ducted'],
    ['4Yön Kaset',             '4-Way Cassette'],
    ['Kaset',                  'Cassette'],
    ['Döşeme',                 'Floor'],
    ['Duvar',                  'Wall'],
    // WSHP label içindeki Türkçe birimler
    [' kW Soğ. / ',            ' kW Cool. / '],
    [' kW Soğ.',               ' kW Cool.'],
    [' kW Isı ',               ' kW Heat '],
    [' Soğ. /',                ' Cool. /'],
    [' Isı ',                  ' Heat '],
  ];
  function _trLabel(lbl) {
    if (!_isEN || !lbl) return lbl || '';
    let out = lbl;
    _LABEL_MAP.forEach(([tr, en]) => { out = out.split(tr).join(en); });
    return out;
  }

  // İç ünite tipi key → EN etiket (FCU_ORTA_KANAL → "Fancoil – Med. Static Ducted")
  function _trIcUnite(key) {
    if (!key) return '';
    // T.tr.cihaz_tipleri'nden TR etiketi al, sonra _trLabel ile EN'e çevir
    const trLabel = (typeof T !== 'undefined' && T.tr && T.tr.cihaz_tipleri)
      ? (T.tr.cihaz_tipleri[key] || key)
      : key;
    return _isEN ? _trLabel(trLabel) : trLabel;
  }

  // Mahal tipi kodu → EN (OFİS→OFFICE, KORİDOR→CORRIDOR vb.)
  const _MAHALTIP_EN = {
    'OFİS':'OFFICE', 'DEPO':'STORAGE', 'KORİDOR':'CORRIDOR',
    'TOPLU':'ASSEMBLY', 'MUTFAK':'KITCHEN', 'KİTCHENETTE':'KITCHENETTE',
    'ELEKTRİK':'ELECTRICAL', 'SERVER':'SERVER', 'WC':'WC', 'OUTDOOR':'OUTDOOR',
  };
  function _trMahalTip(tip) {
    if (!_isEN || !tip) return tip || '';
    return _MAHALTIP_EN[tip] || tip;
  }

  const _AY_S = _isEN ? ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : AY_SHORT;
  const _AY_F = _isEN ? ['','January','February','March','April','May','June','July','August','September','October','November','December'] : AY_FULL;
  const L = {
    // Sayfa adları
    sh: {
      ozet:  _isEN ? 'SUMMARY SCHEDULE'   : 'ÖZET ÇİZELGESİ',
      kazanc:_isEN ? 'COOLING LOAD'       : 'ISI KAZANCI',
      kayip: _isEN ? 'HEAT LOSS'          : 'ISI KAYBI',
      aylik: _isEN ? 'MONTHLY PEAK'       : 'AYLIK PİK',
      hava:  _isEN ? 'VENTILATION'        : 'HAVA İHTİYACI',
      hesap: _isEN ? 'CALC METHOD'        : 'HESAP YÖNTEMİ',
      cihaz: _isEN ? 'EQUIPMENT LIST'     : 'CİHAZ LİSTESİ',
      ahu:   _isEN ? 'AHU PIVOT'          : 'AHU PİVOT',
      icmal: _isEN ? 'EQUIP SUMMARY'      : 'CİHAZ İCMAL',
      model: _isEN ? 'MODEL LIST'         : 'MODEL LİSTESİ',
      ek1:   _isEN ? 'APP1-HEAT LOSS'     : 'EK-1 ISI KAYBI KARTLARI',
      ek2:   _isEN ? 'APP2-COOLING'       : 'EK-2 ISI KAZANCI KARTLARI',
      ufh:   _isEN ? 'UFH DESIGN'         : 'YERDEN ISITMA',
    },
    // Ortak etiketler
    grand_total:  _isEN ? 'GRAND TOTAL'            : 'GENEL TOPLAM',
    yes:          _isEN ? 'Yes'                    : 'Evet',
    no_str:       _isEN ? 'No'                     : 'Hayır',
    not_incl:     _isEN ? 'Not Included (0 W)'     : 'Dahil Değil (0 W)',
    included:     _isEN ? 'INCLUDED'               : 'DAHİL EDİLDİ',
    no_device:    _isEN ? 'No device'              : 'Cihaz takılmaz',
    not_selected: _isEN ? 'Not selected'           : 'Seçim yapılmadı',
    floor_total:  _isEN ? '  FLOOR TOTAL'          : '  KAT TOPLAM',
    ou_select:    _isEN ? '  ▶ OUTDOOR UNIT'       : '  ▶ DIŞ ÜNİTE SEÇİMİ',
    floor:        _isEN ? 'Floor'                  : 'Kat',
    total_equip:  _isEN ? 'TOTAL EQUIPMENT COUNT'  : 'TOPLAM CİHAZ ADEDİ',
    notes:        _isEN ? 'NOTES:'                 : 'NOTLAR:',
    desc:         _isEN ? 'LEGEND:'                : 'AÇIKLAMA:',
    no_vrf:       _isEN ? 'No VRF system selected or index not calculated.' : 'VRF sistemi seçilmemiş veya indeks hesabı yapılmamış.',
    // Proje bilgi etiketi
    prjInfo: (P) => _isEN
      ? `Project No: ${P.prjNo||''} | City: ${P.sehir||''} | Date: ${now} | Engineer: ${P.kim||''} | System: ${(P.sistem||'').toUpperCase()} | Indoor Unit: ${_trIcUnite(P.icUniteTip)}`
      : `Proje No: ${P.prjNo||''} | Şehir: ${P.sehir||''} | Tarih: ${now} | Hazırlayan: ${P.kim||''} | Sistem: ${(P.sistem||'').toUpperCase()} | İç Ünite: ${P.icUniteTip||''}`,
    klimaInfo: (P) => _isEN
      ? `Summer: ${P.Tmax}°C DB / ${P.yazYT||'–'}°C WB | Winter: ${P.kisKt}°C | DR: ${P.DR||'–'}°C | SHGC: ${P.shgc} | f_light: ${P.fAyd} | Room Addn: %${P.odaZam} | Eff: %${P.effZam} | Cool SF: %${P.emSog} | Heat SF: %${P.emIst}`
      : `Yaz: ${P.Tmax}°C KT / ${P.yazYT||'–'}°C YT | Kış: ${P.kisKt}°C | DR: ${P.DR||'–'}°C | SHGC: ${P.shgc} | f_ayd: ${P.fAyd} | Oda Zam: %${P.odaZam} | Eff: %${P.effZam} | Soğ.Em: %${P.emSog} | Ist.Em: %${P.emIst}`,
    // Yön etiketleri (duvar/pencere)
    yon: _isEN ? {
      kuzey:'North Wall', güney:'South Wall', doğu:'East Wall', batı:'West Wall',
      kuzeydoğu:'NE Wall', güneydoğu:'SE Wall', güneybatı:'SW Wall', kuzeybatı:'NW Wall'
    } : {
      kuzey:'Kuzey Duvar', güney:'Güney Duvar', doğu:'Doğu Duvar', batı:'Batı Duvar',
      kuzeydoğu:'K.Doğu Duvar', güneydoğu:'G.Doğu Duvar', güneybatı:'G.Batı Duvar', kuzeybatı:'K.Batı Duvar'
    },
    yon_penc: _isEN ? {
      kuzey:'North Window', güney:'South Window', doğu:'East Window', batı:'West Window',
      kuzeydoğu:'NE Window', güneydoğu:'SE Window', güneybatı:'SW Window', kuzeybatı:'NW Window'
    } : {
      kuzey:'Kuzey Pencere', güney:'Güney Pencere', doğu:'Doğu Pencere', batı:'Batı Pencere',
      kuzeydoğu:'K.Doğu Pencere', güneydoğu:'G.Doğu Pencere', güneybatı:'G.Batı Pencere', kuzeybatı:'K.Batı Pencere'
    },
    // Bölüm başlıkları – Sayfa 1 (ÖZET)
    sh1_title: _isEN ? 'THERMAL LOAD CALCULATION – SUMMARY SCHEDULE' : 'ISI YÜK HESABI – ÖZET ÇİZELGESİ',
    sh1_cols: _isEN
      ? ['No','Room Name','Type','Floor','Peak\nMonth','Peak\nHour','Indoor DB\n(°C)',
         'Glass\n(W)','Wall\n(W)','Window Cond\n(W)','Roof\n(W)','Floor\n(W)',
         'Int.Sens\n(W)','Int.Lat\n(W)','Rsh\n(W)','Rlh\n(W)','Ersh\n(W)','Erlh\n(W)',
         'COOLING\nGth (W)','HEATING\nQ (W)','Area\n(m²)','People','W/m²',
         'Device Type','Model','Qty','OA\n(L/s)','OA\n(m³/h)','Exh\n(L/s)','Exh\n(m³/h)',
         'OA Cool\n(W)','OA Heat\n(W)','FCU Pipe\nCool (W)','FCU Pipe\nHeat (W)','VRF\nIndex','OA Unit','Exh Unit','Ceiling']
      : ['No','Mahal Adı','Tip','Kat','Peak\nAy','Peak\nSaat','İç KT\n(°C)',
         'Cam\n(W)','Duvar\n(W)','Penc.İlet\n(W)','Tavan\n(W)','Döşeme\n(W)',
         'İç.Duy\n(W)','İç.Giz\n(W)','Rsh\n(W)','Rlh\n(W)','Ersh\n(W)','Erlh\n(W)',
         'SOĞUTMA\nGth (W)','ISINMA\nQ (W)','Alan\n(m²)','Kişi','W/m²',
         'Cihaz Tipi','Model','Adet','TH\n(L/s)','TH\n(m³/h)','Egzoz\n(L/s)','Egzoz\n(m³/h)',
         'TH Soğ\n(W)','TH Ist\n(W)','FC Boru\nSoğ (W)','FC Boru\nIsı (W)','VRF\nIndex','Taze Hava\nCihazı','Egzoz\nCihazı','Tavan\nDurumu'],
    // Sayfa 2 (ISI KAZANCI / COOLING LOAD)
    sh2_title: _isEN ? 'COOLING LOAD CALCULATION   ' : 'ISI KAZANCI – SOĞUTMA HESABI   ',
    sh2_info1: (P) => _isEN
      ? `ASHRAE CLTD/CLF Method | ${P.sehir||''} | Summer: ${P.Tmax}°C DB / ${P.yazYT||'–'}°C WB | ${now} | ${P.kim||''}`
      : `ASHRAE CLTD/CLF Yöntemi | ${P.sehir||''} | Yaz: ${P.Tmax}°C KT / ${P.yazYT||'–'}°C YT | ${now} | ${P.kim||''}`,
    sh2_info2: (P) => _isEN
      ? `SHGC: ${P.shgc} | f_light: ${P.fAyd} | Room Addn: %${P.odaZam} | Eff Addn: %${P.effZam} | Cooling SF: %${P.emSog} | Season: May–Sep`
      : `SHGC: ${P.shgc} | f_ayd: ${P.fAyd} | Oda Zam: %${P.odaZam} | Eff Zam: %${P.effZam} | Soğutma Em: %${P.emSog} | Soğutma sezonu: Mayıs–Eylül`,
    sh2_cols: _isEN
      ? ['No','Room Name','Type','Floor','Peak\nMonth','Peak\nHour',
         'Outdoor\nDB (°C)','Indoor\nDB (°C)','ΔT\n(°C)',
         'Glass Rad\nSh(W)','Ext.Wall\nSh(W)','Window\nCond.(W)','Roof\nSh(W)','Floor\n(W)',
         'Skylight\nSolar(W)','Skylight\nCond.(W)','Skylight\nTotal(W)',
         'People\nSens(W)','People\nLat(W)','Equip+TV\n(W)','Light\n(W)',
         'Rsh\n(W)','Rlh\n(W)','Rth\n(W)','Ersh\n(W)','Erlh\n(W)',
         'Infiltr.\nCool(W)','Infiltr.\nACH',
         'COOLING\nGth(W)','Area\n(m²)','W/m²','Calc\nMethod',
         'OA\nSelected?','OA Cool\nLoad (W)','COOLING\nGth+OA(W)']
      : ['No','Mahal Adı','Tip','Kat','Peak\nAy','Peak\nSaat',
         'Dış KT\n(°C)','İç KT\n(°C)','ΔT\n(°C)',
         'Cam Rad\nSh(W)','Dış Duvar\nSh(W)','Penc.İlet\n(W)','Tavan\nSh(W)','Döşeme\n(W)',
         'Skylight\nSolar(W)','Skylight\nİletim(W)','Skylight\nToplam(W)',
         'İnsan\nDuy(W)','İnsan\nGiz(W)','Cihaz+TV\n(W)','Ayd.\n(W)',
         'Rsh\n(W)','Rlh\n(W)','Rth\n(W)','Ersh\n(W)','Erlh\n(W)',
         'İnfil.\nSoğ(W)','İnfil.\nACH',
         'SOĞUTMA\nGth(W)','Alan\n(m²)','W/m²','Hesap\nYöntemi',
         'TH Seçili\n?','TH Soğ.\nYükü (W)','SOĞUTMA\nGth+TH(W)'],
    // Sayfa 3 (ISI KAYBI / HEAT LOSS)
    sh3_title: _isEN ? 'HEAT LOSS – WINTER HEATING CALCULATION   ' : 'ISI KAYBI – KIŞ ISINMA HESABI   ',
    sh3_info1: (P,ruz) => _isEN
      ? `${P.sehir||''} | Winter DB: ${P.kisKt}°C | Wind Factor: ×${ruz} | Heating SF: %${P.emIst} | ${now} | ${P.kim||''}`
      : `${P.sehir||''} | Kış KT: ${P.kisKt}°C | Rüzgar: ×${ruz} | Isıtma Em: %${P.emIst} | ${now} | ${P.kim||''}`,
    sh3_cols: _isEN
      ? ['No','Room Name','Type','Floor',
         'Indoor DB\nWinter(°C)','Winter ΔT\n(°C)',
         'U Wall\n(W/m²K)','Wall A\n(m²)','Wall Q\n(W)',
         'U Window\n(W/m²K)','Window A\n(m²)','Window Q\n(W)',
         'U Floor\n(W/m²K)','Floor A\n(m²)','Floor Q\n(W)',
         'U Roof\n(W/m²K)','Roof A\n(m²)','Roof Q\n(W)',
         'U Skylight\n(W/m²K)','Sky A\n(m²)','Sky Q\n(W)',
         'Sub-Total\n(W)','×Wind','HEATING\nQ (W)','SF Factor','HEATING\nFinal(W)',
         'Infiltr. ACH','Infiltr.\nQ (W)',
         'OA\nSelected?','Vent. Heat\nLoss (W)','HEATING\nFinal+OA+Inf(W)']
      : ['No','Mahal Adı','Tip','Kat',
         'İç KT\nKış(°C)','Kış ΔT\n(°C)',
         'U Duvar\n(W/m²K)','Duvar A\n(m²)','Duvar Q\n(W)',
         'U Penc\n(W/m²K)','Penc A\n(m²)','Penc Q\n(W)',
         'U Döş\n(W/m²K)','Döş A\n(m²)','Döş Q\n(W)',
         'U Tavan\n(W/m²K)','Tavan A\n(m²)','Tavan Q\n(W)',
         'U Skylight\n(W/m²K)','Sky A\n(m²)','Sky Q\n(W)',
         'Ham Top\n(W)','×Rüzgar','ISINMA\nQ (W)','Em Kat','ISINMA\nFinal(W)',
         'İnfil ACH','İnfil Q\n(W)',
         'TH Seçili\n?','Hvl. Isı\nKayb. (W)','ISINMA\nFinal+TH+İnfil(W)'],
    // Sayfa 4 (AYLIK PİK / MONTHLY PEAK)
    sh4_title: _isEN ? 'MONTHLY PEAK ANALYSIS – ' : 'AYLIK PİK ANALİZİ – ',
    sh4_info1: (P) => _isEN
      ? `12 months × hourly scan | ${P.sehir||''} | ${now} | ${P.kim||''}`
      : `12 ay × saat taraması | ${P.sehir||''} | ${now} | ${P.kim||''}`,
    sh4_peak_col: _isEN ? 'Annual\nPeak(W)' : 'Yıllık\nPeak(W)',
    // Sayfa 5 (HAVA İHTİYACI / VENTILATION)
    sh5_title: _isEN ? 'VENTILATION & CONDITIONING – ' : 'HAVA İHTİYACI & ŞARTLANDIRMA – ',
    sh5_info2: (P) => _isEN
      ? `HRV Efficiency: %${P.igkVerim||70} | OA Factor: ${P.thKatsayi||1} | Device Type: ${P.icUniteTip||''} | OA Cool Add: ${P.thSogEkle?'Yes':'No'} | OA Heat Add: ${P.thIstEkle?'Yes':'No'}`
      : `IGK Verimi: %${P.igkVerim||70} | TH Katsayısı: ${P.thKatsayi||1} | Cihaz Tipi: ${P.icUniteTip||''} | TH Soğ Ekleme: ${P.thSogEkle?'Evet':'Hayır'} | TH Ist Ekleme: ${P.thIstEkle?'Evet':'Hayır'}`,
    sh5_ashrae_note: _isEN
      ? 'ASHRAE 62.1 NOTE: Office: 2.5 L/s·person + 0.3 L/s·m² | Assembly: 3.8 L/s·person + 0.6 L/s·m² | Kitchen: Exh=30 ACH, OA=85% | Storage/Archive: Exh=5 ACH, OA=90% | Corridor: OA=2 ACH, Exh=90% | WC: Not included | Positive/Negative pressure balance applied'
      : 'ASHRAE 62.1 NOTU: Ofis/Normal: 2.5 L/s·kişi + 0.3 L/s·m² | TOPLU: 3.8 L/s·kişi + 0.6 L/s·m² | Mutfak: Egzoz=30 ACH, Taze=%85 | Kitchenette: Egzoz=5 ACH, Taze=%90 | Depo/Arşiv: Egzoz=5 ACH, Taze=%90 | Koridor: TH=2 ACH, Egzoz=%90 | WC: Sisteme dahil değil | Pozitif/Negatif basınç dengesi uygulanır',
    sh5_cols: _isEN
      ? ['No','Room Name','Type','Floor','Area\n(m²)','H\n(m)','Volume\n(m³)','People',
         'Raw OA\n(no factor)\n(L/s)','OA\nFactor','OA Result\n(factored)\n(L/s)',
         'OA\n(m³/h)','Exh\n(L/s)','Exh\n(m³/h)',
         'Formula\n(ASHRAE 62.1)',
         'h_Out\n(kJ/kg)','h_In\n(kJ/kg)','W_Out\n(g/kg)','W_In\n(g/kg)',
         'Sens.OA\nCool(W)','Lat.OA\nCool(W)','OA Cool\nTotal(W)','OA Heat\n(W)',
         'OA Unit','Exh Unit']
      : ['No','Mahal Adı','Tip','Kat','Alan\n(m²)','Yük.\n(m)','Hacim\n(m³)','Kişi',
         'Ham TH\n(katsayısız)\n(L/s)','TH\nKatsayısı','TH Sonuç\n(katsayılı)\n(L/s)',
         'TH\n(m³/h)','Egzoz\n(L/s)','Egzoz\n(m³/h)',
         'Hesap Formülü\n(ASHRAE 62.1)',
         'h_Dış\n(kJ/kg)','h_İç\n(kJ/kg)','W_Dış\n(g/kg)','W_İç\n(g/kg)',
         'Duy.TH\nSoğ(W)','Giz.TH\nSoğ(W)','TH Soğ\nTop.(W)','TH Isıtma\n(W)',
         'Taze Hava\nCihazı','Egzoz\nCihazı'],
    // Sayfa 7 (CİHAZ LİSTESİ / EQUIPMENT LIST)
    sh7_title: _isEN ? 'EQUIPMENT LIST & SELECTION   ' : 'CİHAZ LİSTESİ & SEÇİMİ   ',
    sh7_info1: (P) => _isEN
      ? `System: ${(P.sistem||'').toUpperCase()} | Indoor Unit: ${P.icUniteTip||''} | ${now} | ${P.kim||''}`
      : `Sistem: ${(P.sistem||'').toUpperCase()} | İç Ünite: ${P.icUniteTip||''} | ${now} | ${P.kim||''}`,
    sh7_cols: _isEN
      ? ['No','Room Name','Type','Floor',
         'COOLING\nGth(W)','HEATING\nQ(W)',
         'Model','Qty','Device\nCool Cap(W)','Device\nHeat Cap(W)','Airflow\n(m³/h)',
         'Coverage\nRatio Cool','Coverage\nRatio Heat',
         'Elec.\nVoltage/Ph/Hz','Power\n(W)',
         'OA\n(L/s)','Exh\n(L/s)',
         'FCU Pipe\nCool(W)','FCU Pipe\nHeat(W)',
         'VRF\nIndex/Qty','Room\nTotal IDX',
         'OK','Note']
      : ['No','Mahal Adı','Tip','Kat',
         'SOĞUTMA\nGth(W)','ISINMA\nQ(W)',
         'Model','Adet','Cihaz\nSoğ Kap(W)','Cihaz\nIst Kap(W)','Debi\n(m³/h)',
         'Karşılama\nOranı Soğ','Karşılama\nOranı Ist',
         'Elektrik\nGerilim/Faz/Hz','Güç\n(W)',
         'TH\n(L/s)','Egzoz\n(L/s)',
         'FC Boru\nSoğ(W)','FC Boru\nIsı(W)',
         'VRF\nIndex/Adet','Mahal\nToplamı IDX',
         'Onay','Not'],
    sh7_notes: _isEN
      ? [
          '• ✓ = Device capacity sufficient (Coverage Ratio ≥ 1.00)',
          '• ! = Device capacity insufficient or device not selected',
          '• VRF Index: Index value of each indoor unit model',
          '• Room Total IDX: Total index of all indoor units in room (model index × qty)',
          '• Floor Total IDX: Sum of all room indices on floor → used for outdoor unit selection',
          '• If max system index exceeds 1500, floor is split into multiple outdoor units',
          '• Electrical data are catalog values; consult manufacturer technical docs for final values.',
        ]
      : [
          '• ✓ = Cihaz kapasitesi yeterli (Karşılama Oranı ≥ 1.00)',
          '• ! = Cihaz kapasitesi yetersiz veya cihaz seçilmemiş',
          '• VRF İndeks: Her iç ünite modelinin indeks değeri (vrfot22→22, vrfkt71→71, vb.)',
          '• Mahal Toplamı IDX: O mahaldeki tüm iç ünitelerin indeks toplamı (model indeks × adet)',
          '• Kat Toplam IDX: Kattaki tüm mahallerin indeks toplamı → dış ünite seçiminde kullanılır',
          '• Max sistem indeksi 1500 aşılırsa kat birden fazla dış üniteye bölünür',
          '• Elektrik bilgileri katalog değerleridir, kesin değerler için üretici teknik dokümanına başvurunuz.',
        ],
    // Sayfa 8 (AHU PİVOT)
    sh8_title: _isEN ? 'AHU / AHU ZONING & PIVOT TABLE   ' : 'AHU / SANTRAL ZONLAMA & PİVOT TABLOSU   ',
    sh8_info1: (P) => _isEN
      ? `Auto-grouped from room AHU references | ${now} | ${P.kim||''}`
      : `Mahal adlarındaki AHU bilgisinden otomatik gruplandırma | ${now} | ${P.kim||''}`,
    sh8_cols: _isEN
      ? ['AHU/Unit','Rooms','Total OA\n(L/s)','Total OA\n(m³/h)',
         'Total Exh\n(L/s)','Net Air\n(OA-Exh L/s)',
         'OA Cool\nLoad(W)','OA Heat\nLoad(W)',
         'Total Cool\nGth(W)','Total Heat\nQ(W)',
         'Ceiling\nStatus']
      : ['AHU/Santral','Mahal\nSayısı','Toplam TH\n(L/s)','Toplam TH\n(m³/h)',
         'Toplam Egzoz\n(L/s)','Net Hava\n(TH-Egzoz L/s)',
         'TH Soğ\nYükü(W)','TH Ist\nYükü(W)',
         'Toplam Soğutma\nGth(W)','Toplam Isıtma\nQ(W)',
         'Tavan\nDurumu'],
    // Sayfa 9 (CİHAZ İCMAL / EQUIP SUMMARY)
    sh9_title: _isEN ? 'EQUIPMENT SUMMARY – MODEL BASED   ' : 'CİHAZ İCMAL – MODEL BAZLI ÖZET   ',
    sh9_info1: (P) => _isEN
      ? `Model-based count summary of all selected devices | ${now} | ${P.kim||''}`
      : `Tüm seçilen cihazların model bazında sayım özeti | ${now} | ${P.kim||''}`,
    sh9_cols: _isEN
      ? ['Model Code','Device Type Name','Group','Cool Cap\n(W)','Heat Cap\n(W)','Qty',
         'Unit\nIDX','Total\nIDX','Total Cool\n(W)','Elec.\nVoltage','Power\n(W/unit)']
      : ['Model Kodu','Cihaz Tipi Adı','Grup','Soğ.Kap\n(W)','Ist.Kap\n(W)','Adet',
         'Birim\nIDX','Toplam\nIDX','Toplam Soğ\n(W)','Elektrik\nGerilim','Güç\n(W/ünite)'],
    sh9_vrf_title: _isEN ? 'VRF OUTDOOR UNIT SELECTION – PER FLOOR SUMMARY' : 'VRF DIŞ ÜNİTE SEÇİMİ – KAT BAZLI ÖZET',
    sh9_vrf_cols: _isEN
      ? ['Floor','Total\nIDX','Total Cool\n(kW)','No. of\nSystems',
         'Selected OU\n(HP)','Module\nCombin.',
         'Cool Cap\n(kW/sys)','Heat Cap\n(kW/sys)','Total\nCoolCap(kW)']
      : ['Kat','Toplam\nIDX','Toplam Soğ\n(kW)','Sistem\nSayısı',
         'Seçilen Dış\nÜnite (HP)','Modül\nKombin.',
         'Soğ.Kap\n(kW/sistem)','Isı.Kap\n(kW/sistem)','Toplam\nSoğKap(kW)'],
    sh9_notes: _isEN
      ? [
          '• Unit IDX: Index value of indoor unit model (vrfot22=22, vrfkt71=71 etc.)',
          '• Total IDX: Unit IDX × Qty',
          '• Floor index total is divided by systems based on max 1500 index limit',
          '• Outdoor unit selected by cooling capacity (dominant)',
        ]
      : [
          '• Birim IDX: İç ünite modeline ait indeks değeri (vrfot22=22, vrfkt71=71 vb.)',
          '• Toplam IDX: Birim IDX × Adet',
          '• Kat indeks toplamı maks. 1500 indeks sınırına göre sistem sayısına bölünür',
          '• Dış ünite soğutma kapasitesine göre seçilir (dominant)',
        ],
    // Sayfa 10 (MODEL LİSTESİ / MODEL LIST)
    sh10_title: _isEN ? 'MODEL LIST – DROPDOWN REFERENCE' : 'MODEL LİSTESİ – DROPDOWN REFERANS',
    sh10_info1: _isEN
      ? 'This sheet contains all valid model codes. Model columns in SUMMARY and EQUIPMENT LIST sheets reference this list.'
      : 'Bu sayfa tüm geçerli model kodlarını içerir. ÖZET ve CİHAZ LİSTESİ sayfalarındaki Model sütunları bu listeye referans verir.',
    sh10_cols: _isEN
      ? ['Model Code','Device Type Name','Group','Cool Cap\n(W)','Heat Cap\n(W)','Airflow\n(m³/h)','Static P\n(Pa)','Index','Voltage/Ph/Hz','Power\n(W)']
      : ['Model Kodu','Cihaz Tipi Adı','Grup','Soğutma Kap\n(W)','Isıtma Kap\n(W)','Debi\n(m³/h)','Basınç\n(Pa)','Index','Gerilim/Faz/Hz','Güç\n(W)'],
    sh10_nodata: _isEN ? 'DEVICE_DB data not found' : 'DEVICE_DB verisi bulunamadı',
    // EK-1 (ISI KAYBI KARTLARI / HEAT LOSS CARDS)
    ek1_title: (P) => _isEN
      ? `APP-1 – HEAT LOSS ROOM CARDS   ${P.prjAdi||''}`
      : `EK-1 – ISI KAYBI MAHAL KARTLARI   ${P.prjAdi||''}`,
    ek1_info1: (P,ruz) => _isEN
      ? `${P.sehir||''} | Winter DB: ${P.kisKt}°C | Wind: ×${ruz} | Heating SF: %${P.emIst||0} | ${now} | ${P.kim||''}`
      : `${P.sehir||''} | Kış KT: ${P.kisKt}°C | Rüzgar: ×${ruz} | Isıtma Em: %${P.emIst||0} | ${now} | ${P.kim||''}`,
    ek1_col_hdr: _isEN
      ? ['Surface','Area (m²)','U (W/m²K)','ΔT (°C)','Q (W)','','Area (m²)','Volume (m³)','OA (L/s)','OA (m³/h)','Exh (L/s)','OA Heat (W)']
      : ['Yüzey','Alan (m²)','U (W/m²K)','ΔT (°C)','Q (W)','','Alan (m²)','Hacim (m³)','TH (L/s)','TH (m³/h)','Egzoz (L/s)','TH Isıtma (W)'],
    ek1_floor:  _isEN ? 'Floor'    : 'Döşeme',
    ek1_roof:   _isEN ? 'Roof'     : 'Tavan',
    ek1_sky:    _isEN ? '▣ Skylight' : '▣ Skylight',
    ek1_sub:    _isEN ? 'Sub-Total:' : 'Ham Toplam:',
    ek1_wind:   _isEN ? '× Wind:'  : '× Rüzgar:',
    ek1_sf:     _isEN ? '× SF:'    : '× Emniyet:',
    ek1_heat_q: _isEN ? 'HEATING Q TOTAL (W):' : 'ISINMA Q TOPLAM (W):',
    ek1_vent_sec: _isEN ? 'VENTILATION HEAT LOSS' : 'HAVALANDIRMA ISI KAYBI',
    ek1_oa_flow:  _isEN ? '  OA Flow Rate' : '  Taze Hava Debisi',
    ek1_oa_heat:  _isEN ? '  Ventilation Heat Loss (OA)' : '  Havalandırma Isı Kaybı (TH)',
    ek1_infil_sec: _isEN ? 'INFILTRATION (ACH Method)' : 'İNFİLTRASYON (TS 825)',
    ek1_infil_ach: _isEN ? '  Infiltration ACH' : '  İnfiltrasyon ACH',
    ek1_heat_tot: _isEN ? '  HEATING TOTAL (Fabric+OA+Infiltr.)' : '  ISINMA TOPLAM (Yapı+TH+İnfil)',
    ek1_oa_add:   _isEN ? 'OA Add: ' : 'TH Ekleme: ',
    ek1_infil_add: _isEN ? 'Included' : 'Dahil',
    ek1_infil_excl: _isEN ? 'Excluded (0 W)' : 'Dahil Değil (0 W)',
    ek1_not_add:  _isEN ? 'Not Added (0 W)' : 'Hayır (0 W alındı)',
    ek1_card: (r,P,dtK) => _isEN
      ? `▓ ${r.mahalNo||'–'}  |  ${r.mahalAdi||'–'}  |  ${_trMahalTip(r.mahalTip||'')}  |  Area: ${r.alan||0} m²  |  Indoor: ${r.Tic_kis||20}°C  |  Outdoor: ${P.kisKt}°C  |  ΔT: ${dtK.toFixed(1)}°C`
      : `▓ ${r.mahalNo||'–'}  |  ${r.mahalAdi||'–'}  |  ${r.mahalTip||''}  |  Alan: ${r.alan||0} m²  |  İç: ${r.Tic_kis||20}°C  |  Dış: ${P.kisKt}°C  |  ΔT: ${dtK.toFixed(1)}°C`,
    // EK-2 (ISI KAZANCI KARTLARI / COOLING CARDS)
    ek2_title: _isEN ? 'APP-2 – DETAILED ROOM COOLING LOAD CARDS (AT VARIOUS TIMES)' : 'EK-2 – ÇEŞİTLİ ZAMANLARDA EN BÜYÜK MAHAL YÜKLERİ (DETAYLI)',
    ek2_info1: (P) => _isEN
      ? `Project: ${P.prjAdi||''}   |   No: ${P.prjNo||''}   |   ${now}   |   Engineer: ${P.kim||''}`
      : `Proje: ${P.prjAdi||''}   |   Proje No: ${P.prjNo||''}   |   ${now}   |   Hazırlayan: ${P.kim||''}`,
    ek2_info2: (P) => _isEN
      ? `Region: ${P.sehir||''} | Summer DB: ${P.Tmax}°C · WB: ${P.yazYT||'–'}°C | Indoor DB: ${P.icKtYaz||24}°C | SHGC: ${P.shgc} | Room Addn: %${P.odaZam||0} | Eff Addn: %${P.effZam||0} | Cool SF: %${P.emSog||0}`
      : `Bölge: ${P.sehir||''} | Yaz KT: ${P.Tmax}°C · YT: ${P.yazYT||'–'}°C | İç KT: ${P.icKtYaz||24}°C | SHGC: ${P.shgc} | Oda Zam: %${P.odaZam||0} | Eff Zam: %${P.effZam||0} | Soğ.Em: %${P.emSog||0}`,
    ek2_card: (r,Tdis,Tic,dT) => _isEN
      ? `ROOM: ${r.mahalNo||'–'}   ${r.mahalAdi||'–'}   (${_trMahalTip(r.mahalTip||'OFFICE')})   Area: ${r.alan||0} m²   Height: ${r.h||3} m   People: ${r.nToplam||0}`
      : `MAHAL: ${r.mahalNo||'–'}   ${r.mahalAdi||'–'}   (${r.mahalTip||'OFİS'})   Alan: ${r.alan||0} m²   Yükseklik: ${r.h||3} m   Kişi: ${r.nToplam||0}`,
    ek2_peak: (r,Tdis,Tic,dT) => _isEN
      ? `Peak Month: ${_AY_F[r.bestAy]||'–'}   Hour: ${r.bestSaat||'–'}:00   Outdoor DB: ${Tdis}°C   Indoor DB: ${Tic}°C   ΔT: ${dT}°C`
      : `Peak Ayı: ${_AY_F[r.bestAy]||'–'}   Saati: ${r.bestSaat||'–'}:00   Dış KT: ${Tdis}°C   İç KT: ${Tic}°C   ΔT: ${dT}°C`,
    ek2_sec_glass: _isEN ? 'GLASS SOLAR RADIATION LOADS' : 'CAMLARDAN GÜNEŞ RADYASYONU YÜKLERİ',
    ek2_no_glass:  _isEN ? '  (No glass)' : '  (Cam yok)',
    ek2_glass_tot: _isEN ? 'Total glass solar radiation loads (Sh)' : 'Camlardan güneş radyasyonu yükleri toplamı (Sh)',
    ek2_sec_wall: _isEN ? 'EXTERNAL WALL & ROOF SOLAR AND CONDUCTIVE LOADS' : 'DIŞ DUVAR ve ÇATILARIN GÜNEŞ RADYASYONU ve İLETİMSEL YÜKLERİ',
    ek2_wall_tot: _isEN ? 'Total external wall and roof loads (Sh)' : 'Dış duvar ve çatılardan yükler toplamı (Sh)',
    ek2_no_wall:   _isEN ? '  (No external wall / roof)' : '  (Dış duvar / çatı yok)',
    ek2_sec_cond: _isEN ? 'CONDUCTIVE LOADS' : 'İLETİMSEL YÜKLER',
    ek2_window_cond: _isEN ? '  Window Conduction (U×A×ΔT)' : '  Pencere İletim (U×A×ΔT)',
    ek2_floor_cond:  _isEN ? '  Floor' : '  Döşeme',
    ek2_cond_tot: _isEN ? 'Total conductive loads (Sh)' : 'İletimsel yükler toplamı (Sh)',
    ek2_sec_sky: _isEN ? '▣ SKYLIGHT LOADS' : '▣ SKYLIGHT (TAVAN PENCERESİ) YÜKLERİ',
    ek2_sky_solar: _isEN ? '  Skylight Solar Gain (SC×SHGF_horiz×A)' : '  Skylight Solar Kazancı (SC×SHGF_yatay×A)',
    ek2_sky_cond: _isEN ? '  Skylight Conduction (U×A×ΔT)' : '  Skylight İletim (U×A×ΔT)',
    ek2_sky_tot: _isEN ? 'Skylight total load (Solar+Cond)' : 'Skylight toplam yükü (Solar+İletim)',
    ek2_sec_int_s: _isEN ? 'INTERNAL SENSIBLE HEAT' : 'İÇ DUYULUR ISILAR',
    ek2_ppl_sit: _isEN ? '  People (Sh) – Sitting' : '  İnsanlar (Sh) – Oturan',
    ek2_ppl_std: _isEN ? '  People (Sh) – Standing' : '  İnsanlar (Sh) – Ayakta',
    ek2_ppl_gen: _isEN ? '  People (Sh)' : '  İnsanlar (Sh)',
    ek2_tv:      _isEN ? '  TV / Screen' : '  Televizyon / Ekran',
    ek2_equip:   _isEN ? '  Electrical Equipment' : '  Elektrikli Cihazlar',
    ek2_equip_tot: _isEN ? '  Total electrical equipment (Sh)' : '  Elektrikli cihazlar toplamı (Sh)',
    ek2_light:   _isEN ? '  Lighting (Sh)' : '  Aydınlatmalar (Sh)',
    ek2_int_s_tot: _isEN ? 'Total internal sensible heat (Sh)' : 'İç duyulur ısılar toplamı (Sh)',
    ek2_sec_int_l: _isEN ? 'INTERNAL LATENT HEAT' : 'İÇ GİZLİ ISILAR',
    ek2_ppl_sit_l: _isEN ? '  People (Lh) – Sitting' : '  İnsanlar (Lh) – Oturan',
    ek2_ppl_std_l: _isEN ? '  People (Lh) – Standing' : '  İnsanlar (Lh) – Ayakta',
    ek2_ppl_gen_l: _isEN ? '  People (Lh)' : '  İnsanlar (Lh)',
    ek2_int_l_tot: _isEN ? 'Total internal latent heat (Lh)' : 'İç gizli ısılar toplamı (Lh)',
    ek2_sec_room: _isEN ? 'ROOM HEAT' : 'ODA ISILARI',
    ek2_rsh: _isEN ? '  Room sensible heat (Rsh)' : '  Oda duyulur ısısı (Rsh)',
    ek2_rlh: _isEN ? '  Room latent heat (Rlh)' : '  Oda gizli ısısı (Rlh)',
    ek2_rth: _isEN ? '  Room total heat (Rth)' : '  Oda toplam ısısı (Rth)',
    ek2_sec_eff: _isEN ? 'EFFECTIVE ROOM SENSIBLE HEAT' : 'EFEKTİF ODA DUYULUR ISISI',
    ek2_ersh_addn: (effZam) => _isEN ? `  Addition (Rsh × Eff Addn %${effZam})` : `  Zam (Oda Duy. × Eff Zam %${effZam})`,
    ek2_ersh: _isEN ? '  Effective room sensible heat (Ersh)' : '  Efektif oda duyulur ısısı (Ersh)',
    ek2_sec_eff_l: _isEN ? 'EFFECTIVE ROOM LATENT HEAT' : 'EFEKTİF ODA GİZLİ ISISI',
    ek2_erlh: _isEN ? '  Effective room latent heat (Erlh)' : '  Efektif oda gizli ısısı (Erlh)',
    ek2_erth: _isEN ? '  Effective room total heat (Erth)' : '  Efektif oda toplam ısısı (Erth)',
    ek2_sec_total: _isEN ? 'TOTAL COOLING LOADS' : 'TOPLAM SOĞUTMA YÜKLERİ',
    ek2_tsh: _isEN ? '  Total sensible Tsh (Ersh)' : '  Toplam duyulur ısı Tsh (Ersh)',
    ek2_tlh: _isEN ? '  Total latent Tlh (Erlh)' : '  Toplam gizli ısı Tlh (Erlh)',
    ek2_gth: _isEN ? '  TOTAL COOLING LOAD Gth (Tsh+Tlh)' : '  TOPLAM SOĞUTMA YÜKÜ Gth (Tsh + Tlh)',
    ek2_gth_kw: _isEN ? '  Gth (kW)' : '  Gth (kW)',
    ek2_gth_tr: _isEN ? '  Gth (TR)' : '  Gth (TR)',
    ek2_unit_load: _isEN ? '  Unit Load' : '  Birim Yük',
    ek2_sec_infil: _isEN ? 'INFILTRATION (ACH METHOD)' : 'İNFİLTRASYON (TS 825 ACH YÖNTEMİ)',
    ek2_infil_ach: _isEN ? '  Infiltration ACH' : '  İnfiltrasyon ACH',
    ek2_infil_flow: _isEN ? '  Infiltration Airflow' : '  İnfiltrasyon Debisi',
    ek2_infil_cool: _isEN ? '  Infiltration Cooling Load' : '  İnfiltrasyon Soğutma Yükü',
    ek2_sec_vent: _isEN ? 'VENTILATION (ASHRAE 62.1)' : 'HAVALANDIRMA (ASHRAE 62.1)',
    ek2_oa:  _isEN ? '  Outside Air' : '  Taze Hava',
    ek2_exh: _isEN ? '  Exhaust' : '  Egzoz',
    ek2_oa_rounded: _isEN ? '(rounded to nearest 5 L/s)' : '(5\'in katına yuvarlanmış)',
    ek2_exh_bal: _isEN ? '(pressure balance applied)' : '(Basınç dengesi uygulandı)',
    ek2_sec_oa_cool: _isEN ? 'VENTILATION COOLING LOAD (OA Cooling)' : 'HAVALANDIRMADAN GELEN ISI YÜKÜ (TH Soğutma)',
    ek2_oa_sens: _isEN ? '  Sensible OA Cooling' : '  Duyulur TH Soğutma',
    ek2_oa_lat:  _isEN ? '  Latent OA Cooling' : '  Gizli TH Soğutma',
    ek2_oa_tot:  _isEN ? '  TOTAL OA COOLING LOAD' : '  TOPLAM TH SOĞUTMA YÜKü',
    ek2_oa_heat: _isEN ? '  OA Heating Load (info)' : '  TH Isıtma Yükü (bilgi)',
    ek2_gth_plus: _isEN ? '  *** COOLING Gth + OA TOTAL' : '  *** SOĞUTMA Gth + TH TOPLAM',
    ek2_oa_add: _isEN ? 'OA Add: ' : 'TH Ekleme: ',
    ek2_infil_add: _isEN ? 'INCLUDED IN COOLING' : 'SOĞUTMAYA EKLENDİ',
    ek2_infil_excl: _isEN ? 'Excluded (0)' : 'Dahil Değil (0)',
    // Sayfa 6 (HESAP YÖNTEMİ / CALC METHOD)
    sh6_rows: _isEN ? [
      ['CALCULATION METHOD AND REFERENCE FORMULAS'],
      ['ASHRAE 1997 Fundamentals, Chapter 28 | ASHRAE 62.1 Ventilation Standard'],
      ['1. COOLING LOADS (ASHRAE CLTD/CLF Method)','','',''],
      ['','Glass Solar Radiation Sh','q = SHGF × A × SC × CLF   |   SC=SHGC×1.15  |  Unshaded: CLF=ASHRAE Table 36  |  Shaded: CLF=1.0','W'],
      ['','External Wall Sh','q = U × A × CLTD_adj   |   CLTD_adj = CLTD_table + (25.5−Ti) + (Tmax_month−29.4)','W'],
      ['','Window Conduction','q = U × A × ΔT_inst  (instantaneous: Tout_hour − Tin)','W'],
      ['','Roof/Ceiling','q = U × A × CLTD_roof × 1.2','W'],
      ['','People Sensible','Seated: 66 W | Standing: 64 W | Dancing: 90 W / person (ASHRAE Table 3)','W'],
      ['','People Latent','Seated: 60 W | Standing: 52 W | Dancing: 150 W / person','W'],
      ['','Lighting','q = Area × W/m² × f_light','W'],
      ['','Room Total Rsh','Rsh = (ΣHeat gains) × (1+%roomAddn/100)','W'],
      ['','Effective Sensible','Ersh = Rsh × (1+%effAddn/100)','W'],
      ['','COOLING Gth','Gth = (Ersh+Erlh) × (1+%coolSF/100)   [max of 12 month × hourly scan]','W'],
      ['2. WINTER HEAT LOSS','','',''],
      ['','Wall/Window/Roof/Floor','Q = U × A × ΔT_winter   |   ΔT_winter = Tin_winter − Tout_winter','W'],
      ['','HEATING Total','Q_final = Q_raw × wind_factor × (1+%heatSF/100)','W'],
      ['3. VENTILATION – ASHRAE 62.1','','',''],
      ['','Office / Normal','OA = (people×2.5 + area×0.3) × OAFactor  L/s  |  Exh = OA×0.90  (Positive Pressure)','L/s'],
      ['','Assembly (ASSEMBLY)','OA = (people×3.8 + area×0.6) × OAFactor  L/s  |  Exh = OA×0.90  (Positive Pressure)','L/s'],
      ['','Storage/Archive','Exh = vol×5 ACH÷3600×1000 L/s  |  OA = Exh×0.90  (Negative Pressure)  |  No HVAC device','L/s'],
      ['','Kitchen (KITCHEN)','Exh = vol×30 ACH÷3600×1000 L/s  |  OA = Exh×0.85  (Negative Pressure)  |  No HVAC device','L/s'],
      ['','Kitchenette','Exh = vol×5 ACH÷3600×1000 L/s  |  OA = Exh×0.90  (Negative Pressure)  |  No HVAC device','L/s'],
      ['','WC/Bathroom','Not calculated – not included in system  |  No HVAC device','–'],
      ['','Corridor','OA = vol×2 ACH÷3600×1000 L/s  |  Exh = OA×0.90  (Positive Pressure)  |  No HVAC device','L/s'],
      ['','OA Rounding','All OA flows rounded up to nearest 5 L/s (e.g. 33→35, 77→80)','L/s'],
      ['','Exhaust = OA','In all types, exhaust flow equals supply OA flow','L/s'],
      ['6. SPECIAL ROOM RULES','','',''],
      ['','HUB / Electrical / Panel / CCTV Rooms (ELECTRICAL)','Cooling load = Area × 400 W/m²  |  Selected device: Cassette type (SPLIT_KASET)  |  No ASHRAE CLTD calc','W/m²'],
      ['','Server / IT Rooms (SERVER)','No OA/Exhaust – internal circulation only (precision cooling)  |  1000 W/m² cooling load  |  24/7 operation','W/m²'],
      ['','Detection keywords (ELECTRICAL)','hub room, electrical room, electrical panel, panel room, cctv, security room, UPS room, transformer room, telecom',''],
      ['','Detection keywords (SERVER)','server, server room, IT room, data processing, data center, datacenter, network server',''],
      ['4. PSYCHROMETRIC CALCULATION','','',''],
      ['','Enthalpy','h = 1.006×T + W×(2501+1.86×T)  [kJ/kg]  (Antoine equation + psychrometric calc)','kJ/kg'],
      ['','Sensible OA Cooling','q_s = (Q_L/s × 1.2/1000) × 1006 × ΔT × (1−HRV_efficiency)','W'],
      ['','Latent OA Cooling','q_l = (Q_L/s × 1.2/1000) × 2501000 × ΔW[kg/kg] × (1−HRV_efficiency)','W'],
      ['','OA Heating','q_heat = (Q_L/s × 1.2/1000) × 1006 × (Tin−Tout) × (1−HRV_efficiency)','W'],
      ['5. DEVICE SELECTION LOGIC','','',''],
      ['','Fancoil/WSHP','Largest model meeting capacity alone → 1 unit',''],
      ['','VRF/Split','Largest model meeting capacity alone → 1 unit',''],
      ['','Storage/WC/Corridor','No HVAC device → no device selection',''],
      ['','Time Scan','May–Sep: 08:00–20:00 | Other months: 08:00–19:00',''],
    ] : [
      ['HESAP YÖNTEMİ VE REFERANS FORMÜLLER'],
      ['ASHRAE 1997 Fundamentals, Chapter 28 | ASHRAE 62.1 Havalandırma Standardı'],
      ['1. SOĞUTMA YÜKLERİ (ASHRAE CLTD/CLF Yöntemi)','','',''],
      ['','Cam Radyasyon Sh','q = SHGF × A × SC × CLF   |   SC=SHGC×1.15  |  Gölgesiz: CLF=ASHRAE Tablo 36  |  Gölgeli: CLF=1.0','W'],
      ['','Dış Duvar Sh','q = U × A × CLTD_düz   |   CLTD_düz = CLTD_tablo + (25.5−Ti) + (Tmax_ay−29.4)','W'],
      ['','Pencere İletim','q = U × A × ΔT_an  (anlık: Tdış_saat − Tiç)','W'],
      ['','Tavan/Çatı','q = U × A × CLTD_tavan × 1.2','W'],
      ['','İnsanlar Duyulur','Oturan: 66 W | Ayakta: 64 W | Dans: 90 W / kişi (ASHRAE Tablo 3)','W'],
      ['','İnsanlar Gizli','Oturan: 60 W | Ayakta: 52 W | Dans: 150 W / kişi','W'],
      ['','Aydınlatma','q = Alan × W/m² × f_ayd','W'],
      ['','Oda Toplam Rsh','Rsh = (ΣIsı kazanımları) × (1+%odaZam/100)','W'],
      ['','Efektif Duyulur','Ersh = Rsh × (1+%effZam/100)','W'],
      ['','SOĞUTMA Gth','Gth = (Ersh+Erlh) × (1+%emSog/100)   [12 ay × saat taramasından en büyük değer]','W'],
      ['2. KIŞ ISI KAYBI','','',''],
      ['','Duvar/Pencere/Tavan/Döşeme','Q = U × A × ΔT_kış   |   ΔT_kış = Tiç_kış − Tdış_kış','W'],
      ['','ISINMA Toplam','Q_final = Q_ham × rüzgar_katsayısı × (1+%emIst/100)','W'],
      ['3. HAVALANDIRMA – ASHRAE 62.1','','',''],
      ['','Ofis / Normal (OFİS)','TH = (kişi×2.5 + alan×0.3) × thKatsayı  L/s  |  Egzoz = TH×0.90  (Pozitif Basınç)','L/s'],
      ['','Toplu (TOPLU)','TH = (kişi×3.8 + alan×0.6) × thKatsayı  L/s  |  Egzoz = TH×0.90  (Pozitif Basınç)','L/s'],
      ['','Depo/Arşiv (DEPO)','Egzoz = hacim×5 ACH÷3600×1000 L/s  |  Taze = Egzoz×0.90  (Negatif Basınç)  |  Klima/FCU takılmaz','L/s'],
      ['','Mutfak/Pişirme (MUTFAK)','Egzoz = hacim×30 ACH÷3600×1000 L/s  |  Taze = Egzoz×0.85  (Negatif Basınç)  |  Klima/FCU takılmaz','L/s'],
      ['','Kitchenette (KİTCHENETTE)','Egzoz = hacim×5 ACH÷3600×1000 L/s  |  Taze = Egzoz×0.90  (Negatif Basınç)  |  Klima/FCU takılmaz','L/s'],
      ['','WC/Banyo (WC)','Hesap yapılmaz – sisteme dahil edilmez  |  Klima/FCU takılmaz','–'],
      ['','Koridor (KORİDOR)','TH = hacim×2 ACH÷3600×1000 L/s  |  Egzoz = TH×0.90  (Pozitif Basınç)  |  Klima/FCU takılmaz','L/s'],
      ['','Taze Hava Yuvarlama','Tüm taze hava debileri 5 L/s\'nin katına yukarı yuvarlanır (örn. 33→35, 77→80)','L/s'],
      ['','Egzoz = Taze Hava','Tüm tip ve mekânlarda egzoz debisi taze hava debisine eşit alınır','L/s'],
      ['6. ÖZEL ODA KURALLARI','','',''],
      ['','HUB / Elektrik / Pano / CCTV Odaları (ELEKTRİK)','Soğutma yükü = Alan × 400 W/m²  |  Seçilen cihaz: Kaset tipi klima (SPLIT_KASET)  |  ASHRAE CLTD hesabı yapılmaz','W/m²'],
      ['','Hub / Elektrik / Pano (ELEKTRIK)','Taze hava ve egzoz YOK – sadece iç sirkülasyon (kaset klima)  |  400 W/m² soğutma yükü','W/m²'],
      ['','Server / Sunucu / IT Odaları (SERVER)','Taze hava ve egzoz YOK – sadece iç sirkülasyon (hassas klima)  |  1000 W/m² soğutma yükü  |  24/7 çalışma','W/m²'],
      ['','Tespit için kullanılan anahtar kelimeler (ELEKTRİK)','hub oda, elektrik oda, elektrik pano, pano oda, cctv, güvenlik oda, UPS oda, trafo oda, telekomünikasyon',''],
      ['','Tespit için kullanılan anahtar kelimeler (SERVER)','server, sunucu, it oda, bilgi işlem, data center, datacenter, network server',''],
      ['4. PSİKOMETRİK HESAP','','',''],
      ['','Entalpi','h = 1.006×T + W×(2501+1.86×T)  [kJ/kg]  (Antoine denklemi + psikrometrik hesap)','kJ/kg'],
      ['','Duyulur TH Soğutma','q_s = (Q_L/s × 1.2/1000) × 1006 × ΔT × (1−IGK_verimi)','W'],
      ['','Gizli TH Soğutma','q_l = (Q_L/s × 1.2/1000) × 2501000 × ΔW[kg/kg] × (1−IGK_verimi)','W'],
      ['','Isıtma TH','q_ist = (Q_L/s × 1.2/1000) × 1006 × (Tiç−Tdış) × (1−IGK_verimi)','W'],
      ['5. CİHAZ SEÇİM MANTIĞI','','',''],
      ['','Fancoil/WLHP','Kapasiteyi tek başına karşılayan en büyük model → 1 adet',''],
      ['','VRF/Split','Kapasiteyi tek başına karşılayan en büyük model → 1 adet',''],
      ['','Depo/WC/Koridor','Klima/FCU takılmaz → cihaz seçimi yapılmaz',''],
      ['','Saat Taraması','May–Eyl: 08:00–20:00 | Diğer aylar: 08:00–19:00',''],
    ],
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ─── STİL YARDIMCILAR ─────────────────────────────────────────────────────

  // Renk paleti
  const CLR = {
    // Başlıklar (her sayfa farklı renk) – TR + EN
    headers: {
      'ÖZET ÇİZELGESİ':  { bg:'1E3A5F', fg:'FFFFFF' },
      'ISI KAZANCI':      { bg:'7C2D12', fg:'FFFFFF' },
      'ISI KAYBI':        { bg:'1E40AF', fg:'FFFFFF' },
      'AYLIK PİK':        { bg:'4C1D95', fg:'FFFFFF' },
      'HAVA İHTİYACI':    { bg:'065F46', fg:'FFFFFF' },
      'HESAP YÖNTEMİ':   { bg:'374151', fg:'FFFFFF' },
      'CİHAZ LİSTESİ':   { bg:'7F1D1D', fg:'FFFFFF' },
      'AHU PİVOT':        { bg:'0C4A6E', fg:'FFFFFF' },
      'CİHAZ İCMAL':      { bg:'3B0764', fg:'FFFFFF' },
      'MODEL LİSTESİ':    { bg:'14532D', fg:'FFFFFF' },
      'EK-1 ISI KAYBI KARTLARI': { bg:'1E3A5F', fg:'FFFFFF' },
      'EK-2 ISI KAZANCI KARTLARI': { bg:'7C2D12', fg:'FFFFFF' },
      // English equivalents
      'SUMMARY SCHEDULE': { bg:'1E3A5F', fg:'FFFFFF' },
      'COOLING LOAD':     { bg:'7C2D12', fg:'FFFFFF' },
      'HEAT LOSS':        { bg:'1E40AF', fg:'FFFFFF' },
      'MONTHLY PEAK':     { bg:'4C1D95', fg:'FFFFFF' },
      'VENTILATION':      { bg:'065F46', fg:'FFFFFF' },
      'CALC METHOD':      { bg:'374151', fg:'FFFFFF' },
      'EQUIPMENT LIST':   { bg:'7F1D1D', fg:'FFFFFF' },
      'AHU PIVOT':        { bg:'0C4A6E', fg:'FFFFFF' },
      'EQUIP SUMMARY':    { bg:'3B0764', fg:'FFFFFF' },
      'MODEL LIST':       { bg:'14532D', fg:'FFFFFF' },
      'APP1-HEAT LOSS':   { bg:'1E3A5F', fg:'FFFFFF' },
      'APP2-COOLING':     { bg:'7C2D12', fg:'FFFFFF' },
      'YERDEN ISITMA':    { bg:'78350F', fg:'FFFFFF' },
      'UFH DESIGN':       { bg:'78350F', fg:'FFFFFF' },
    },
    rowEven:    'EFF6FF',  // çift satır açık mavi
    rowOdd:     'FFFFFF',  // tek satır beyaz
    total:      'D1FAE5',  // toplam satırı açık yeşil
    totalFont:  '065F46',  // toplam satır font rengi
    titleBg:    'F0F9FF',  // proje başlık satırı
    titleFont:  '1E3A5F',
    border:     'CBD5E1',
  };

  // Genel sayfa stili uygulayan fonksiyon
  // headerRows: kaç satır başlık (proje adı + bilgi + kolon başlığı)
  // headerRowIdx: kolon başlığı satırının indeksi (0-based), default son başlık satırı
  function applySheetStyle(ws, rows, sheetName, headerRows) {
    headerRows = headerRows || 3;
    const colHdrIdx = headerRows - 1; // kolon başlığı satır indeksi
    const range = XLSX.utils.decode_range(ws['!ref']);
    const palette = CLR.headers[sheetName] || { bg:'1E3A5F', fg:'FFFFFF' };

    for(let R = range.s.r; R <= range.e.r; R++) {
      for(let C = range.s.c; C <= range.e.c; C++) {
        const addr = XLSX.utils.encode_cell({r:R, c:C});
        if(!ws[addr]) { ws[addr] = {t:'s', v:''}; }
        
        const isColHeader = (R === colHdrIdx);
        const isTitle     = (R < colHdrIdx);
        const isTotal     = (R === rows.length - 1);
        const isEven      = ((R - headerRows) % 2 === 0);

        let bgColor, fontColor, bold=false, fontSize=9, wrapText=false;

        if(isTitle && R===0) {
          bgColor   = CLR.titleBg;
          fontColor = CLR.titleFont;
          bold      = true;
          fontSize  = 11;
        } else if(isTitle) {
          bgColor   = 'F8FAFC';
          fontColor = '475569';
          fontSize  = 8;
        } else if(isColHeader) {
          bgColor   = palette.bg;
          fontColor = palette.fg;
          bold      = true;
          wrapText  = true;
          fontSize  = 8;
        } else if(isTotal) {
          bgColor   = CLR.total;
          fontColor = CLR.totalFont;
          bold      = true;
          fontSize  = 9;
        } else {
          bgColor   = isEven ? CLR.rowEven : CLR.rowOdd;
          fontColor = '1F2937';
        }

        ws[addr].s = {
          font: { bold, sz: fontSize, color: { rgb: fontColor }, name: 'Calibri' },
          fill: { fgColor: { rgb: bgColor }, patternType: 'solid' },
          alignment: { horizontal: C<=3?'left':'center', vertical:'center', wrapText },
          border: {
            top:    { style:'thin', color:{ rgb: CLR.border } },
            bottom: { style:'thin', color:{ rgb: CLR.border } },
            left:   { style:'thin', color:{ rgb: CLR.border } },
            right:  { style:'thin', color:{ rgb: CLR.border } },
          }
        };

        // Toplam satırında kalın border
        if(isTotal) {
          ws[addr].s.border.top = { style:'medium', color:{ rgb:'059669' } };
        }

        // Negatif sayılar kırmızı
        if(!isColHeader && !isTitle && !isTotal) {
          if(ws[addr].t==='n' && ws[addr].v < 0) {
            ws[addr].s.font.color = { rgb:'DC2626' };
            ws[addr].s.fill.fgColor = { rgb:'FEE2E2' };
          }
        }
      }
    }
    // Başlık satırlarını birleştir (kolon başlığı satırı HARİÇ)
    if(!ws['!merges']) ws['!merges'] = [];
    // colHdrIdx = headerRows-1 = kolon başlığı satırı -> birleştirme
    // Ondan önceki tüm satırlar (proje adı, bilgi) birleştirilir
    for(let ri = 0; ri < colHdrIdx; ri++) {
      ws['!merges'].push({ s:{r:ri,c:0}, e:{r:ri,c:range.e.c} });
    }
  }

  function n(v){ return isNaN(+v)?0:(+v||0); }
  function s(v){ return v==null?'':String(v); }
  function pct(v,d){ d=d||1; return (n(v)*100).toFixed(d)+'%'; }
  
  // XML escape function
  function xesc(v){
    if (typeof v !== 'string') return v;
    return v
      .replace(/&/g, '&amp;')  // Önce tüm & karakterlerini escape et
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Kat bilgisi çıkar
  function katCikar(no){
    if(!no) return '–';
    const str=String(no);
    const m=str.match(/^([A-Za-z]+\d*)/);
    if(m) return m[1];
    const num=parseInt(str);
    if(!isNaN(num)) return Math.floor(num/100)+'00';
    return str.split('-')[0]||str;
  }

  // Peak yük değerleri (bestLoad zaten emniyet dahil)
  function peakAy(r, ay){
    if(!r.hourlyLoads||!r.hourlyLoads[ay]) return 0;
    const ld=r.hourlyLoads[ay];
    let mx=0;
    Object.values(ld).forEach(v=>{ if(v&&v.erth>mx) mx=v.erth; });
    return Math.round(mx*(r.emSogFak||1));
  }

  // Boşluk satırı helper
  function emptyRow(cols){ return Array(cols).fill(''); }

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 1: ÖZET ÇİZELGESİ / SUMMARY SCHEDULE
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh1_title+'   '+s(P.prjAdi)]);
    rows.push([L.prjInfo(P)]);
    rows.push([L.klimaInfo(P)]);
    rows.push(L.sh1_cols);

    let sumSog=0,sumKayip=0,sumAlan=0,sumKisi=0,sumTH_oz=0,sumEg_oz=0;
    R.forEach(r=>{
      const p=r.peak||{}, c=r.cihaz||{}, td=r.thData||{};
      const sog=Math.round(n(r.bestLoad));
      const kip=Math.round(n(r.qKayip));
      sumSog+=sog; sumKayip+=kip; sumAlan+=n(r.alan); sumKisi+=n(r.nToplam);
      sumTH_oz+=n(td.th); sumEg_oz+=n(td.egzoz);
      rows.push([
        s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip||'')), katCikar(r.mahalNo),
        s(_AY_S[r.bestAy]||r.bestAy), s(r.bestSaat||0)+':00',
        n(r.Tic_yaz)||24,
        Math.round(n(p.qCam)), Math.round(n(p.qDuvar)), Math.round(n(p.qPencIlet)),
        Math.round(n(p.qTavan)), Math.round(n(p.qDoseme)),
        Math.round(n(p.qIcDuy)), Math.round(n(p.qIcGiz)),
        Math.round(n(p.rsh)), Math.round(n(p.rlh)),
        Math.round(n(p.ersh)), Math.round(n(p.erlh)),
        sog, kip,
        n(r.alan), n(r.nToplam),
        r.alan>0?Math.round(sog/n(r.alan)):0,
        _trLabel(s(c.label||c.tip||'')), s(c.model||''), c.model ? n(c.adet||1) : '',
        +n(td.th).toFixed(1), ceilTo5(Math.round(n(td.th)*3.6)), +n(td.egzoz).toFixed(1), ceilTo5(Math.round(n(td.egzoz)*3.6)),
        Math.round(n(td.thSogT)), Math.round(n(td.thIst)),
        Math.round(n(r.fcBoruSog||c.fcBoruSog)), Math.round(n(r.fcBoruIst||c.fcBoruIst)),
        n(c.vrfIndex||r.vrfIndex), s(r._thDisabled ? '–' : (r.tazeHavaCihazi||r.ahuZon||'AHU1')), s(r._exDisabled ? '–' : (r.egzozCihazi||r.ahuZon||'AHU1')), s(r.tavanDurumu||'')
      ]);
    });
    rows.push([L.grand_total,'','','','','','','','','','','','','','','','','',
      sumSog, sumKayip, +sumAlan.toFixed(1), sumKisi,
      sumAlan>0?Math.round(sumSog/sumAlan):0,'','','',
      +sumTH_oz.toFixed(1),ceilTo5(Math.round(sumTH_oz*3.6)),+sumEg_oz.toFixed(1),ceilTo5(Math.round(sumEg_oz*3.6)),
      '','','','','','','','']);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    applySheetStyle(ws, rows, L.sh.ozet, 4);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:7},{wch:7},{wch:7},
      {wch:8},{wch:8},{wch:9},{wch:8},{wch:8},{wch:8},{wch:8},
      {wch:10},{wch:9},{wch:10},{wch:9},{wch:12},{wch:11},
      {wch:7},{wch:6},{wch:6},{wch:20},{wch:12},{wch:6},
      {wch:8},{wch:9},{wch:8},{wch:9},{wch:9},{wch:9},{wch:10},{wch:10},{wch:8},{wch:10},{wch:18}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:15},{hpt:38}];
    XLSX.utils.book_append_sheet(wb,ws,L.sh.ozet);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 2: ISI KAZANCI
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    const hDis=R[0]&&R[0].thData?+(R[0].thData.hDis||52.5).toFixed(3):52.5;
    const hIc=R[0]&&R[0].thData?+(R[0].thData.hIc||47.8).toFixed(3):47.8;
    rows.push([L.sh2_title+s(P.prjAdi)]);
    rows.push([L.sh2_info1(P)]);
    rows.push([L.sh2_info2(P)]);
    rows.push(L.sh2_cols);

    let sumGth=0, sumAlan=0, sumThSogKaz=0;
    R.forEach(r=>{
      const p=r.peak||{};
      const td=r.thData||{};
      const Tdis=+(n(r.Tic_yaz)+(n(P.Tmax)-n(r.Tic_yaz))*0.5).toFixed(1);
      const dT=+(n(Tdis)-n(r.Tic_yaz)).toFixed(1);
      const sog=Math.round(n(r.bestLoad));
      const thSogKaz=P.thSogEkle?Math.round(n(td.thSogT)):0;
      const sogPlusTh=sog+thSogKaz;
      sumGth+=sog; sumAlan+=n(r.alan); sumThSogKaz+=thSogKaz;
      rows.push([
        s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip||'')), katCikar(r.mahalNo),
        s(_AY_S[r.bestAy]||r.bestAy), s(r.bestSaat||0)+':00',
        +(n(p.Tdis||Tdis)).toFixed(1), n(r.Tic_yaz)||24, +Math.abs(dT).toFixed(1),
        Math.round(n(p.qCam)), Math.round(n(p.qDuvar)), Math.round(n(p.qPencIlet)),
        Math.round(n(p.qTavan)), Math.round(n(p.qDoseme)),
        Math.round(n(p.qSkylightSolar||0)), Math.round(n(p.qSkylightIlet||0)), Math.round(n(p.qSkylight||0)),
        Math.round(n(p.qIcDuy)), Math.round(n(p.qIcGiz)),
        Math.round(n(r.qCihaz)||0), Math.round(n(r.qAyd)||n(r.alan)*n(P.fAyd||1.25)*10),
        Math.round(n(p.rsh)), Math.round(n(p.rlh)), Math.round(n(p.rsh)+n(p.rlh)),
        Math.round(n(p.ersh)), Math.round(n(p.erlh)),
        n(r.infilSog)||0, r.infilACH_val||0,
        sog,
        n(r.alan), r.alan>0?Math.round(sog/n(r.alan)):0,
        s(r.sogYukuAciklama||'ASHRAE CLTD'),
        P.thSogEkle?L.yes:L.no_str, thSogKaz, sogPlusTh
      ]);
    });
    rows.push([L.grand_total,'','','','','','','','','','','','','','','','','','','','','','',
      sumGth, +sumAlan.toFixed(1), sumAlan>0?Math.round(sumGth/sumAlan):0,'',
      '',sumThSogKaz,sumGth+sumThSogKaz]);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:7},{wch:7},{wch:8},{wch:8},{wch:7},
      {wch:9},{wch:10},{wch:9},{wch:9},{wch:8},{wch:9},{wch:9},{wch:9},{wch:8},
      {wch:10},{wch:9},{wch:9},{wch:10},{wch:9},{wch:12},{wch:7},{wch:7},{wch:18},
      {wch:9},{wch:12},{wch:14}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:15},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.kazanc, 3);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.kazanc);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 3: ISI KAYBI
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    const ruz=n(P.ruzgarZam)||1.07;
    rows.push([L.sh3_title+s(P.prjAdi)]);
    rows.push([L.sh3_info1(P,ruz)]);
    rows.push(L.sh3_cols);

    let sumFinal=0, sumThIstKaybi=0;
    R.forEach(r=>{
      const dtK=n(r.dtKis)||Math.max(0,n(r.Tic_kis||20)-n(P.kisKt));
      const qDuv=Math.round(n(r.qDuvarKis));
      const qPen=Math.round(n(r.qPencKis));
      const qDos=Math.round(n(r.qDosKis));
      const qTav=Math.round(n(r.qTavKis));
      const qSkyK=Math.round(n(r.qSkylightKis||0));
      const ham=qDuv+qPen+qDos+qTav+qSkyK;
      const withRuz=Math.round(ham*ruz);
      const emF=1+n(P.emIst)/100;
      const final=Math.round(withRuz*emF);
      const td=r.thData||{};
      const thIstKaybi=P.thIstEkle?Math.round(n(td.thIst)):0;
      const infilIstV=Math.round(n(r.infilIst||0));
      const finalPlusTh=final+thIstKaybi+infilIstV;
      sumFinal+=final; sumThIstKaybi+=thIstKaybi;

      // toplam pencere alanı
      const pencA=r.pencAlani?Object.values(r.pencAlani).reduce((a,v)=>a+n(v),0):0;

      rows.push([
        s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip||'')), katCikar(r.mahalNo),
        n(r.Tic_kis)||20, +dtK.toFixed(1),
        n(r.uDuv)||0.45, +n(r.duvarAlani||0).toFixed(1), qDuv,
        n(r.uPenc)||2.1, +pencA.toFixed(1), qPen,
        0.45, +n(r.dosA||r.alan||0).toFixed(1), qDos,
        n(r.uTav)||0.35, +n(r.tavanA||0).toFixed(1), qTav,
        n(r.uSkylight||2.8), +n(r.skylightA||0).toFixed(1), Math.round(n(r.qSkylightKis||0)),
        ham, ruz, withRuz, +emF.toFixed(2), final,
        r.infilACH_val||0, Math.round(n(r.infilIst||0)),
        P.thIstEkle?L.yes:L.no_str, thIstKaybi, finalPlusTh
      ]);
    });
    rows.push([L.grand_total,'','','','','','','','','','','','','','','','','','','','','',sumFinal,'',sumThIstKaybi,sumFinal+sumThIstKaybi]);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:8},{wch:8},
      {wch:9},{wch:8},{wch:9},{wch:9},{wch:8},{wch:9},
      {wch:9},{wch:8},{wch:9},{wch:9},{wch:8},{wch:9},
      {wch:10},{wch:8},{wch:10},{wch:7},{wch:12},
      {wch:9},{wch:12},{wch:14}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.kayip, 3);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.kayip);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 4: AYLIK PİK
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh4_title+s(P.prjAdi)]);
    rows.push([L.sh4_info1(P)]);
    rows.push(['No',_isEN?'Room Name':'Mahal Adı',_isEN?'Type':'Tip',L.floor,_isEN?'Area\n(m²)':'Alan\n(m²)',
      ..._AY_S.slice(1).map(m=>m+'\n(W)'),
      L.sh4_peak_col,_isEN?'Peak\nMonth':'Peak\nAy',_isEN?'Peak\nHour':'Peak\nSaat']);

    const sumByMonth=Array(13).fill(0);
    R.forEach(r=>{
      const row=[s(r.mahalNo),s(r.mahalAdi),_trMahalTip(s(r.mahalTip||'')),katCikar(r.mahalNo),n(r.alan)];
      for(let ay=1;ay<=12;ay++){
        const v=peakAy(r,ay);
        row.push(v||0);
        sumByMonth[ay]+=v||0;
      }
      row.push(Math.round(n(r.bestLoad)));
      row.push(s(_AY_S[r.bestAy]||r.bestAy));
      row.push(s(r.bestSaat||0)+':00');
      rows.push(row);
    });
    // Toplam satırı
    const totRow=[L.grand_total,'','','',''];
    let maxSum=0; let maxAy=0;
    for(let ay=1;ay<=12;ay++){
      totRow.push(Math.round(sumByMonth[ay]));
      if(sumByMonth[ay]>maxSum){maxSum=sumByMonth[ay];maxAy=ay;}
    }
    totRow.push(Math.round(maxSum), s(_AY_S[maxAy]), '');
    rows.push(totRow);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:7},
      {wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},
      {wch:8},{wch:8},{wch:8},{wch:8},{wch:8},{wch:8},
      {wch:11},{wch:8},{wch:8}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.aylik, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.aylik);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 5: HAVA İHTİYACI
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    const r0=R[0]||{}, td0=r0.thData||{};
    const hDis=+(n(td0.hDis||52.498)).toFixed(3);
    const hIc=+(n(td0.hIc||47.795)).toFixed(3);
    const wDis=+(n(td0.WDis||7.53)).toFixed(2);
    const wIc=+(n(td0.WIc||9.29)).toFixed(2);
    rows.push([L.sh5_title+s(P.prjAdi)]);
    rows.push([_isEN
      ? `Outdoor: ${P.Tmax}°C / WB:${P.yazYT||'–'}°C → h=${hDis} kJ/kg  W=${wDis} g/kg | Indoor: ${P.icKtYaz||24}°C / %${P.icNem||50} → h=${hIc} kJ/kg  W=${wIc} g/kg`
      : `Dış: ${P.Tmax}°C / YT:${P.yazYT||'–'}°C → h=${hDis} kJ/kg  W=${wDis} g/kg | İç: ${P.icKtYaz||24}°C / %${P.icNem||50} → h=${hIc} kJ/kg  W=${wIc} g/kg`]);
    rows.push([L.sh5_info2(P)]);
    rows.push([L.sh5_ashrae_note]);
    rows.push(L.sh5_cols);

    let sumTH=0,sumEgzoz=0,sumThSog=0,sumThIst=0;
    R.forEach(r=>{
      const td=r.thData||{}, c=r.cihaz||{};
      const th=+n(td.th).toFixed(1);
      const egzoz=+n(td.egzoz).toFixed(1);
      const thRaw=+n(td.thFlowRaw||th).toFixed(1);
      const thK=n(td.thKatsayi||P.thKatsayi||1.0);
      sumTH+=n(th); sumEgzoz+=n(egzoz);
      sumThSog+=n(td.thSogT); sumThIst+=n(td.thIst);
      rows.push([
        s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip||'')), katCikar(r.mahalNo),
        n(r.alan), n(r.h||3), +( n(r.alan)*n(r.h||3) ).toFixed(1), n(r.nToplam),
        thRaw, thK, th,
        ceilTo5(Math.round(th*3.6)), egzoz, ceilTo5(Math.round(egzoz*3.6)),
        s(td.formul||''),
        hDis, hIc, wDis, wIc,
        Math.round(n(td.thSogS)), Math.round(n(td.thSogL)), Math.round(n(td.thSogT)), Math.round(n(td.thIst)),
        s(r._thDisabled ? '–' : (r.tazeHavaCihazi||r.ahuZon||'AHU1')), 
        s(r._exDisabled ? '–' : (r.egzozCihazi||r.ahuZon||'AHU1'))
      ]);
    });
    rows.push([L.grand_total,'','','','','','','','','',
      +sumTH.toFixed(1),ceilTo5(Math.round(sumTH*3.6)),+sumEgzoz.toFixed(1),ceilTo5(Math.round(sumEgzoz*3.6)),
      '','','','','',
      '','',Math.round(sumThSog),Math.round(sumThIst),
      '','']);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:7},{wch:6},{wch:8},{wch:6},
      {wch:11},{wch:9},{wch:11},{wch:8},{wch:8},{wch:8},
      {wch:45},
      {wch:9},{wch:9},{wch:8},{wch:8},
      {wch:10},{wch:10},{wch:10},{wch:10},
      {wch:13},{wch:13}];
    ws['!rows']=[{hpt:24},{hpt:18},{hpt:15},{hpt:20},{hpt:52}];
    applySheetStyle(ws, rows, L.sh.hava, 3);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.hava);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 6: HESAP YÖNTEMİ
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows = L.sh6_rows;
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:4},{wch:28},{wch:80},{wch:8}];
    ws['!rows']=[{hpt:24},{hpt:15}];
    applySheetStyle(ws, rows, L.sh.hesap, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.hesap);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 7: CİHAZ LİSTESİ (birleşik – kapasite karşılama + elektrik)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh7_title+s(P.prjAdi)]);
    rows.push([L.sh7_info1(P)]);
    rows.push(L.sh7_cols);

    // Kat grupla
    const katMap2={};
    R.forEach(r=>{ const k=katCikar(r.mahalNo); if(!katMap2[k]) katMap2[k]=[]; katMap2[k].push(r); });
    const vrfKat = vrfKatAnaliz(R);

    let sumSog=0, sumKayip=0;
    Object.keys(katMap2).sort().forEach(kat=>{
      rows.push(['■ '+kat+(_isEN?' FLOOR':' KATI'),'','','','','','','','','','','','','','','','','','','','','','','']);
      let katToplamIdx=0, katToplamSogW=0;
      katMap2[kat].forEach(r=>{
        const c=r.cihaz||{}, td=r.thData||{};
        const sog=Math.round(n(r.bestLoad));
        const kip=Math.round(n(r.qKayip));
        sumSog+=sog; sumKayip+=kip;
        katToplamSogW+=sog;
        const sogKap=Math.round(n(c.sogKap||0)*n(c.adet||1));
        const istKap=Math.round(n(c.istKap||0)*n(c.adet||1));
        const ratioSog=sog>0&&sogKap>0?+(sogKap/sog).toFixed(2):'-';
        const ratioIst=kip>0&&istKap>0?+(istKap/kip).toFixed(2):'-';
        const onay=(typeof ratioSog==='number'&&ratioSog>=1.0)?'✓':'!';
        const not=c.model?'':(r.mahalTip==='WC'||r.mahalTip==='KORİDOR'||r.mahalTip==='DEPO'||r.mahalTip==='OUTDOOR')?L.no_device:L.not_selected;
        const elec=c.model && typeof getElec==='function'?getElec(c.model):{volt:'',watt:''};
        const vrfIdxPerUnit=n(c.vrfIndex||r.vrfIndex||0);
        const adet = c.model ? n(c.adet||1) : '';
        const vrfIdxMahal=vrfIdxPerUnit*(adet || 0);
        // Sadece VRF grubu iç üniteler kat indeks toplamına dahil
        if(c.grup === 'VRF') katToplamIdx+=vrfIdxMahal;
        rows.push([
          s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip||'')), kat,
          sog, kip,
          s(c.model||'–'), adet,
          sogKap, istKap, Math.round(n(c.debi||0)),
          ratioSog, ratioIst,
          c.model ? s(elec.volt||'-') : '', c.model ? (elec.watt||'') : '',
          +n(td.th).toFixed(1), +n(td.egzoz).toFixed(1),
          Math.round(n(r.fcBoruSog||c.fcBoruSog||0)), Math.round(n(r.fcBoruIst||c.fcBoruIst||0)),
          vrfIdxPerUnit>0?`${vrfIdxPerUnit}×${n(c.adet||1)}`:'-',
          vrfIdxMahal>0?vrfIdxMahal:'-',
          onay, not
        ]);
      });
      // Kat dip toplamı + dış ünite seçimi
      const vk=vrfKat[kat]||{};
      const du=vk.disUnite||null;
      const katSogKw=(katToplamSogW/1000).toFixed(1);
      rows.push([
        L.floor_total,'','','',Math.round(katToplamSogW),'','','','','','','','','','',
        '','','',(_isEN?'FLOOR IDX: ':'KAT IDX: ')+katToplamIdx,
        '',
        '','',''
      ]);
      if(du&&katToplamIdx>0){
        const sistemSayisi=vk.sistemSayisi||1;
        rows.push([
          L.ou_select,`${kat} ${_isEN?'FLOOR':'KATI'}`,
          du.kombin,'',
          `${katSogKw} kW`,`${du.sogKw} kW/${_isEN?'sys':'sistem'}`,
          `${du.hp} HP (${du.kombin})`,sistemSayisi,
          Math.round(du.sogKw*1000*sistemSayisi),'','','','','','',
          '','','','',
          `${katToplamIdx} IDX / ${sistemSayisi} ${_isEN?'sys':'sistem'}`,
          `${Math.ceil(katToplamIdx/sistemSayisi)} IDX/${_isEN?'sys':'sistem'}`,
          '','',''
        ]);
      }
      rows.push(['']);
    });
    rows.push([L.grand_total,'','','',sumSog,sumKayip,'','','','','','','','','','','','','','','','','','']);
    rows.push(['']);
    rows.push([L.desc]);
    L.sh7_notes.forEach(n=>rows.push([n]));

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:9},{wch:28},{wch:10},{wch:7},{wch:12},{wch:11},
      {wch:12},{wch:6},{wch:14},{wch:14},{wch:9},
      {wch:12},{wch:12},
      {wch:20},{wch:8},
      {wch:8},{wch:8},
      {wch:10},{wch:10},{wch:14},{wch:14},{wch:10},{wch:6},{wch:22}];
    ws['!rows']=[{hpt:24},{hpt:15},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.cihaz, 3);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.cihaz);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 9: AHU PİVOT
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh8_title+s(P.prjAdi)]);
    rows.push([L.sh8_info1(P)]);
    rows.push(L.sh8_cols);

    // AHU gruplama - tazeHavaCihazi ve egzozCihazi bazlı
    const ahuMap={};
    R.forEach(r=>{
      const td=r.thData||{}, c=r.cihaz||{};
      
      // Taze hava cihazı
      const thCihaz = r.tazeHavaCihazi;
      if(thCihaz && thCihaz !== '–') {
        if(!ahuMap[thCihaz]) ahuMap[thCihaz]={mahaller:[],th:0,egzoz:0,thSog:0,thIst:0,sog:0,ist:0,idx:0};
        ahuMap[thCihaz].th += n(td.th);
        ahuMap[thCihaz].thSog += n(td.thSogT);
        ahuMap[thCihaz].thIst += n(td.thIst);
        ahuMap[thCihaz].sog += n(r.bestLoad);
        ahuMap[thCihaz].ist += n(r.qKayip);
        ahuMap[thCihaz].idx += (c.grup==='VRF') ? n(c.vrfIndex||r.vrfIndex||0) : 0;
        ahuMap[thCihaz].mahaller.push({...r, _cihazTip: 'TH'});
      }
      
      // Not: Egzoz cihazı Taze Hava'ya eklenmiş olarak sayılır
      // Ayrı entry oluşturma (egzoz cihazları yalnız tipli olmakla birlikte)
    });

    Object.keys(ahuMap).sort().forEach(zon=>{
      const g=ahuMap[zon];
      rows.push([
        zon, g.mahaller.length,
        +g.th.toFixed(1), ceilTo5(Math.round(g.th*3.6)),
        +g.egzoz.toFixed(1), +(g.th-g.egzoz).toFixed(1),
        Math.round(g.thSog), Math.round(g.thIst),
        Math.round(g.sog), Math.round(g.ist),
        ''
      ]);
      // alt satırlar (mahal detay)
      g.mahaller.forEach(r=>{
        const td=r.thData||{}, c=r.cihaz||{};
        const tip = r._cihazTip || '?';
        rows.push([
          '  └ '+s(r.mahalNo), s(r.mahalAdi) + ` (${tip})`, '',
          tip === 'TH' ? +n(td.th).toFixed(1) : 0, 
          tip === 'TH' ? ceilTo5(Math.round(n(td.th)*3.6)) : 0,
          tip === 'EX' ? +n(td.egzoz).toFixed(1) : 0, 
          tip === 'TH' ? +(n(td.th)-n(td.egzoz)).toFixed(1) : (tip === 'EX' ? -n(td.egzoz).toFixed(1) : 0),
          tip === 'TH' ? Math.round(n(td.thSogT)) : 0, 
          tip === 'TH' ? Math.round(n(td.thIst)) : 0,
          Math.round(n(r.bestLoad)), Math.round(n(r.qKayip)),
          s(r.tavanDurumu||'')
        ]);
      });
    });

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:14},{wch:28},{wch:10},{wch:11},{wch:11},{wch:12},{wch:13},
      {wch:11},{wch:11},{wch:14},{wch:13},{wch:20}];
    ws['!rows']=[{hpt:24},{hpt:15},{hpt:46}];
    applySheetStyle(ws, rows, L.sh.ahu, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.ahu);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 10: CİHAZ İCMAL (model bazlı)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh9_title+s(P.prjAdi)]);
    rows.push([L.sh9_info1(P)]);
    rows.push(L.sh9_cols);

    const modelMap={};
    R.forEach(r=>{
      const c=r.cihaz||{};
      if(!c.model) return;
      const k=s(c.model);
      if(!modelMap[k]) modelMap[k]={label:c.label||c.tip||'',tip:c.tip||'',grup:c.grup||'',
        sogKap:c.sogKap||0,istKap:c.istKap||0,adet:0,totSog:0,vrfIndex:c.vrfIndex||0};
      modelMap[k].adet+=n(c.adet)||1;
      modelMap[k].totSog+=n(r.bestLoad);
    });

    const grupMap={};
    Object.entries(modelMap).forEach(([k,v])=>{
      const g=v.tip||(_isEN?'GENERAL':'GENEL');
      if(!grupMap[g]) grupMap[g]=[];
      grupMap[g].push([k,v]);
    });

    let totAdet=0, totIdx=0;
    Object.keys(grupMap).sort().forEach(g=>{
      rows.push(['▶ '+g,'','','','','','','','','','']);
      grupMap[g].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([k,v])=>{
        const birimIdx=v.vrfIndex||0;
        const toplamIdx=birimIdx*v.adet;
        rows.push([k, xesc(_trLabel(v.label)), g, Math.round(n(v.sogKap)), Math.round(n(v.istKap)), v.adet,
          birimIdx>0?birimIdx:'-', toplamIdx>0?toplamIdx:'-',
          Math.round(v.totSog),
          typeof getElec==='function'?getElec(k).volt:'-',
          typeof getElec==='function'?getElec(k).watt:'-']);
        totAdet+=v.adet;
        // Sadece VRF grubu iç üniteler toplam IDX'e dahil
        if(v.grup==='VRF') totIdx+=toplamIdx;
      });
    });
    rows.push([L.total_equip,'','','','',totAdet,'',totIdx>0?totIdx:'-','','','']);
    rows.push(['']);

    // VRF DIŞ ÜNİTE İCMALİ
    rows.push([L.sh9_vrf_title]);
    rows.push(L.sh9_vrf_cols);

    const vrfKatMap=vrfKatAnaliz(R);
    let hasVRF=false;
    Object.keys(vrfKatMap).sort().forEach(kat=>{
      const vk=vrfKatMap[kat];
      if(vk.toplamIdx<=0) return;
      hasVRF=true;
      const du=vk.disUnite||{};
      rows.push([
        kat, vk.toplamIdx, +vk.toplamSogKwFinal.toFixed(1),
        vk.sistemSayisi||1,
        du.hp?`${du.hp} HP`:'–', s(du.kombin||'–'),
        du.sogKw||0, du.istKw||0,
        du.sogKw?(du.sogKw*(vk.sistemSayisi||1)).toFixed(1):0
      ]);
    });
    if(!hasVRF) rows.push([L.no_vrf,'','','','','','','','']);

    rows.push(['']);
    rows.push([L.notes]);
    L.sh9_notes.forEach(n=>rows.push([n]));

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:14},{wch:26},{wch:12},{wch:12},{wch:12},{wch:8},{wch:10},{wch:10},{wch:14},{wch:22},{wch:12}];
    ws['!rows']=[{hpt:24},{hpt:15},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.icmal, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.icmal);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 11: MODEL LİSTESİ (DEVICE_DB referansı)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    rows.push([L.sh10_title]);
    rows.push([L.sh10_info1]);
    rows.push(L.sh10_cols);

    if(typeof DEVICE_DB!=='undefined'){
      // DEVICE_DB yapısı: {fancoil: {FCU_DUVAR: {models:[...]}}, klima: {SPLIT_DUVAR: {models:[...]}}}
      Object.keys(DEVICE_DB).forEach(dbGrupKey=>{
        const dbGrup=DEVICE_DB[dbGrupKey];
        Object.keys(dbGrup).sort().forEach(tipKey=>{
          const tip=dbGrup[tipKey];
          const grupAdı = dbGrupKey==='fancoil'?'FANCOIL':(dbGrupKey==='klima'?'KLIMA':'DEFAULT');
          
          // Her tip'in models array'i var
          if(tip.models && Array.isArray(tip.models)){
            tip.models.forEach(m=>{
              const modelKod = m.model || m.kod || tipKey;
              const elec = typeof getElec === 'function' ? getElec(modelKod) : {volt: '–', watt: '–'};
              rows.push([
                modelKod,
                _trLabel(m.tipAdi || tip.label || tipKey),
                grupAdı,
                Math.round(n(m.sogTop||m.sogDuy||m.sog||0)),
                Math.round(n(m.ist||0)),
                Math.round(n(m.debi||0)),
                Math.round(n(m.pa||0)),
                n(m.index||0),
                s(elec.volt||'–'),
                elec.watt || '–'
              ]);
            });
          }
        });
      });
    } else {
      rows.push([L.sh10_nodata,'','','','','','']);
    }

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:14},{wch:26},{wch:12},{wch:13},{wch:12},{wch:9},{wch:9},{wch:7},{wch:18},{wch:9}];
    ws['!rows']=[{hpt:24},{hpt:15},{hpt:38}];
    applySheetStyle(ws, rows, L.sh.model, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.model);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // EK-1: ISI KAYBI MAHAL KARTLARI (Excel – detaylı)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    const ruz=n(P.ruzgarZam)||1.07;
    const emF=1+n(P.emIst)/100;
    const YONLER_TR=['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
    const yonLabel=L.yon;
    const yonPencLabel=L.yon_penc;
    rows.push([L.ek1_title(P)]);
    rows.push([L.ek1_info1(P,ruz)]);
    rows.push(['']);
    R.forEach(r=>{
      const dtK=n(r.dtKis)||Math.max(0,n(r.Tic_kis||20)-n(P.kisKt));
      const qDuv=Math.round(n(r.qDuvarKis));
      const qPen=Math.round(n(r.qPencKis));
      const qDos=Math.round(n(r.qDosKis));
      const qTav=Math.round(n(r.qTavKis));
      const qSkyK=Math.round(n(r.qSkylightKis||0));
      const ham=qDuv+qPen+qDos+qTav+qSkyK;
      const withRuz=Math.round(ham*ruz);
      const final=Math.round(withRuz*emF);
      const td=r.thData||{};
      // Kart başlık
      rows.push([L.ek1_card(r,P,dtK)]);
      rows.push(L.ek1_col_hdr);
      const pencA=r.pencAlani?Object.values(r.pencAlani).reduce((a,v)=>a+n(v),0):0;
      YONLER_TR.forEach(y=>{
        const da=r.duvarAlani?n(r.duvarAlani[y]):0;
        const pa=r.pencAlani?n(r.pencAlani[y]):0;
        if(da>0) rows.push([yonLabel[y], +da.toFixed(1), +(r.uDuv||0.45).toFixed(3), +dtK.toFixed(1), Math.round(da*(r.uDuv||0.45)*dtK)]);
        if(pa>0) rows.push([yonPencLabel[y], +pa.toFixed(1), +(r.uPenc||2.1).toFixed(2), +dtK.toFixed(1), Math.round(pa*(r.uPenc||2.1)*dtK)]);
      });
      rows.push([L.ek1_floor, +(n(r.dosA||r.alan)||0).toFixed(1), +(r.uDos||0.50).toFixed(3), +dtK.toFixed(1), qDos]);
      rows.push([L.ek1_roof, +(n(r.tavanA)||0).toFixed(1), +(r.uTav||0.35).toFixed(3), +dtK.toFixed(1), qTav]);
      if(n(r.skylightA)>0) rows.push([L.ek1_sky, +(n(r.skylightA)).toFixed(1), +(r.uSkylight||2.8).toFixed(2), +dtK.toFixed(1), qSkyK]);
      rows.push(['','',L.ek1_sub, '', ham, '', n(r.alan), +( n(r.alan)*n(r.h||3) ).toFixed(1), +n(td.th).toFixed(1), ceilTo5(Math.round(n(td.th)*3.6)), +n(td.egzoz).toFixed(1), Math.round(n(td.thIst))]);
      rows.push(['','',L.ek1_wind, ruz, withRuz]);
      rows.push(['','',L.ek1_sf, emF.toFixed(2), final]);
      rows.push(['','',L.ek1_heat_q, '', final, '', '', '', '', '', '', '']);
      // Havalandırma ısı kaybı satırı
      const thIstV=Math.round(n(td.thIst));
      const thIstEkleV=P.thIstEkle;
      const infilIstV=Math.round(n(r.infilIst||0));
      rows.push([L.ek1_vent_sec, '', '', '', '', '', '', '', '', '', '', '']);
      rows.push([L.ek1_oa_flow, +n(td.th).toFixed(1)+' L/s', '/', ceilTo5(Math.round(n(td.th)*3.6))+' m³/h', '', '', '', '', '', '', '', '']);
      rows.push([L.ek1_oa_heat, 'Q = V̇ × ρ × Cp × ΔT', '=', thIstV+' W', '', L.ek1_oa_add+(thIstEkleV?L.yes:L.ek1_not_add), '', '', '', '', '', '']);
      rows.push([L.ek1_infil_sec, '', '', '', '', '', '', '', '', '', '', '']);
      rows.push([L.ek1_infil_ach, r.infilACH_val||0, 'h⁻¹', n(r.infilFlow_m3h||0).toFixed(1)+' m³/h', infilIstV+' W', P.infilEkle?L.ek1_infil_add:L.ek1_infil_excl, '', '', '', '', '', '']);
      const totalFinal=final+(thIstEkleV?thIstV:0)+infilIstV;
      rows.push([L.ek1_heat_tot, '', '', '', totalFinal, '', '', '', '', '', '', '']);
      rows.push(['']);
    });
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:20},{wch:10},{wch:12},{wch:9},{wch:12},{wch:3},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:14}];
    applySheetStyle(ws, rows, L.sh.ek1, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.ek1);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // EK-2: ISI KAZANCI MAHAL KARTLARI (Excel – PDF formatlı detaylı çıktı)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    const rows=[];
    const YONLER_TR=['kuzey','güney','doğu','batı','kuzeydoğu','güneydoğu','güneybatı','kuzeybatı'];
    const yonLabel=L.yon;
    const yonPencLabel2=L.yon_penc;
    // Başlık sayfası
    rows.push([L.ek2_title]);
    rows.push([L.ek2_info1(P)]);
    rows.push([L.ek2_info2(P)]);
    rows.push(['']);
    R.forEach((r,idx)=>{
      const pk=r.peak||{};
      const qCam=Math.round(n(pk.qCam));
      const qDuv=Math.round(n(pk.qDuvar));
      const qPencIlet=Math.round(n(pk.qPencIlet));
      const qTav=Math.round(n(pk.qTavan));
      const qDos=Math.round(n(pk.qDoseme));
      const qIcDuy=Math.round(n(pk.qIcDuy));
      const qIcGiz=Math.round(n(pk.qIcGiz));
      const rsh=Math.round(n(pk.rsh));
      const rlh=Math.round(n(pk.rlh));
      const ersh=Math.round(n(pk.ersh));
      const erlh=Math.round(n(pk.erlh));
      const gth=Math.round(n(r.bestLoad));
      const Tdis=+(n(pk.Tdis)||n(P.Tmax)).toFixed(1);
      const Tic=+(n(r.Tic_yaz)||24);
      const dT=+(Tdis-Tic).toFixed(1);
      const td=r.thData||{};
      const alan=n(r.alan);
      const h_=n(r.h||3);
      const nToplam=n(r.nToplam)||0;
      const insDuy=Math.round(n(r.insDuy)||0);
      const insGiz=Math.round(n(r.insGiz)||0);
      const qCihaz=Math.round(n(r.qCihaz)||0);
      const qTV=Math.round(n(r.qTV)||0);
      const qAyd=Math.round(n(r.qAyd)||0);
      const thFlow=+n(td.th).toFixed(1);
      const thM3h=ceilTo5(Math.round(thFlow*3.6));
      const exFlow=+n(td.egzoz).toFixed(1);
      const exM3h=ceilTo5(Math.round(exFlow*3.6));
      const odaZamF=1+n(P.odaZam)/100;
      const effZamF=1+n(P.effZam)/100;
      const emF=1+n(P.emSog)/100;

      // ── MAHAL BAŞLIK ──
      rows.push([`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`]);
      rows.push([L.ek2_card(r,Tdis,Tic,dT)]);
      rows.push([L.ek2_peak(r,Tdis,Tic,dT)]);
      rows.push(['']);

      // ── CAMLARDAN GÜNEŞ RADYASYONU ──
      rows.push([L.ek2_sec_glass, '', '', '', '', '', '']);
      let camYok=true;
      YONLER_TR.forEach(y=>{
        const pa=r.pencAlani?n(r.pencAlani[y]):0;
        if(pa>0){
          camYok=false;
          rows.push(['  '+yonPencLabel2[y], pa.toFixed(1)+' m²', '×', 'SHGF×SC×CLF', '=', '', '(Watt)']);
        }
      });
      if(camYok) rows.push([L.ek2_no_glass]);
      rows.push([L.ek2_glass_tot, '', '', '', ':', qCam, '(Watt)']);
      rows.push(['']);

      // ── DIŞ DUVAR VE ÇATILAR ──
      rows.push([L.ek2_sec_wall, '', '', '', '', '', '']);
      let duvYok=true;
      YONLER_TR.forEach(y=>{
        const da=r.duvarAlani?n(r.duvarAlani[y]):0;
        if(da>0){
          duvYok=false;
          rows.push(['  '+yonLabel[y]+' (Dd1)', da.toFixed(1)+' m²', '×', (r.uDuv||0.45).toFixed(3)+' W/m²K', '×', 'CLTD', '(Watt)']);
        }
      });
      if(qTav>0) rows.push([_isEN?'  Roof/Ceiling':'  Tavan/Çatı', (r.tavanA||alan).toFixed(1)+' m²', '×', (r.uTav||0.35).toFixed(3)+' W/m²K', '×', 'CLTD×1.2', '(Watt)']);
      if(duvYok && qTav===0) rows.push([L.ek2_no_wall]);
      rows.push([L.ek2_wall_tot, '', '', '', ':', qDuv+qTav, '(Watt)']);
      rows.push(['']);

      // ── İLETİMSEL YÜKLER ──
      rows.push([L.ek2_sec_cond, '', '', '', '', '', '']);
      if(qPencIlet>0) rows.push([L.ek2_window_cond, alan.toFixed(1)+' m²', '×', (r.uPenc||2.1).toFixed(2)+' W/m²K', '×', dT+'°C', '= '+qPencIlet+' (Watt)']);
      if(qDos>0) rows.push([L.ek2_floor_cond, (r.dosA||alan).toFixed(1)+' m²', '×', '0.676 W/m²K', '×', dT+'°C', '= '+qDos+' (Watt)']);
      const ileTotal=qPencIlet+qDos;
      rows.push([L.ek2_cond_tot, '', '', '', ':', ileTotal, '(Watt)']);
      rows.push(['']);

      // ── SKYLIGHT ──
      const qSkySolar=Math.round(n(pk.qSkylightSolar||0));
      const qSkyIlet=Math.round(n(pk.qSkylightIlet||0));
      const qSkyTot=Math.round(n(pk.qSkylight||0));
      if(n(r.skylightA)>0){
        rows.push([L.ek2_sec_sky, '', '', '', '', '', '']);
        rows.push([L.ek2_sky_solar, n(r.skylightA).toFixed(1)+' m²', '×', 'SC='+n(r.scSkylight||0.65).toFixed(2), '×', _isEN?'SHGF×1.3 (horiz)':'SHGF×1.3 (yatay)', '= '+qSkySolar+' (Watt)']);
        rows.push([L.ek2_sky_cond, n(r.skylightA).toFixed(1)+' m²', '×', n(r.uSkylight||2.8).toFixed(2)+' W/m²K', '×', dT+'°C', '= '+qSkyIlet+' (Watt)']);
        rows.push([L.ek2_sky_tot, '', '', '', ':', qSkyTot, '(Watt)']);
        rows.push(['']);
      }

      // ── İÇ DUYULUR ISILAR ──
      rows.push([L.ek2_sec_int_s, '', '', '', '', '', '']);
      if(n(r.nOturan)>0) rows.push([L.ek2_ppl_sit, r.nOturan+(_isEN?' People':' Kişi'), '×', '66 Watt', '×', '100%', '= '+Math.round(n(r.nOturan)*66)+' (Watt)']);
      if(n(r.nAyakta)>0) rows.push([L.ek2_ppl_std, r.nAyakta+(_isEN?' People':' Kişi'), '×', '64 Watt', '×', '100%', '= '+Math.round(n(r.nAyakta)*64)+' (Watt)']);
      if(nToplam>0 && !n(r.nOturan) && !n(r.nAyakta)) rows.push([L.ek2_ppl_gen, nToplam+(_isEN?' People':' Kişi'), '×', Math.round(insDuy/Math.max(1,nToplam))+' Watt', '×', '100%', '= '+insDuy+' (Watt)']);
      if(qTV>0) rows.push([L.ek2_tv, alan.toFixed(1)+' m²', '×', (alan>0?(qTV/alan).toFixed(1):'0')+' W/m²', '=', qTV, '(Watt)']);
      if(qCihaz>0) rows.push([L.ek2_equip, alan.toFixed(1)+' m²', '×', (alan>0?(qCihaz/alan).toFixed(1):'0')+' W/m²', '=', qCihaz, '(Watt)']);
      rows.push([L.ek2_equip_tot, '', '', '', ':', qTV+qCihaz, '(Watt)']);
      rows.push([L.ek2_light, alan.toFixed(1)+' m²', '×', (r.aydW||20)+' W/m²', '×', (n(P.fAyd)||1.25)+' (f)', '= '+qAyd+' (Watt)']);
      rows.push([L.ek2_int_s_tot, '', '', '', ':', qIcDuy, '(Watt)']);
      rows.push(['']);

      // ── İÇ GİZLİ ISILAR ──
      rows.push([L.ek2_sec_int_l, '', '', '', '', '', '']);
      if(n(r.nOturan)>0) rows.push([L.ek2_ppl_sit_l, r.nOturan+(_isEN?' People':' Kişi'), '×', '60 Watt', '×', '100%', '= '+Math.round(n(r.nOturan)*60)+' (Watt)']);
      if(n(r.nAyakta)>0) rows.push([L.ek2_ppl_std_l, r.nAyakta+(_isEN?' People':' Kişi'), '×', '52 Watt', '×', '100%', '= '+Math.round(n(r.nAyakta)*52)+' (Watt)']);
      if(nToplam>0 && !n(r.nOturan) && !n(r.nAyakta)) rows.push([L.ek2_ppl_gen_l, nToplam+(_isEN?' People':' Kişi'), '×', Math.round(insGiz/Math.max(1,nToplam))+' Watt', '×', '100%', '= '+insGiz+' (Watt)']);
      rows.push([L.ek2_int_l_tot, '', '', '', ':', qIcGiz, '(Watt)']);
      rows.push(['']);

      // ── ODA ISILARI ──
      rows.push([L.ek2_sec_room, '', '', '', '', '', '']);
      const qSkyTot2=Math.round(n(pk.qSkylight||0));
      const rshBase=qCam+qDuv+qTav+ileTotal+qIcDuy+qSkyTot2;
      rows.push([L.ek2_rsh, rshBase+' W', '×', odaZamF.toFixed(2)+' ('+(Math.round(n(P.odaZam))+(_isEN?'% Addn':'% Zam'))+')', '=', rsh, '(Watt)']);
      rows.push([L.ek2_rlh, qIcGiz+' W', '×', odaZamF.toFixed(2), '=', rlh, '(Watt)']);
      rows.push([L.ek2_rth, '', '', '', ':', rsh+rlh, '(Watt)']);
      rows.push(['']);

      // ── EFEKTİF ODA ISILARI ──
      rows.push([L.ek2_sec_eff, '', '', '', '', '', '']);
      rows.push([L.ek2_ersh_addn(Math.round(n(P.effZam))), rsh+' W', '×', (n(P.effZam)/100).toFixed(2), '=', Math.round(rsh*n(P.effZam)/100), '(Watt)']);
      rows.push([L.ek2_ersh, '', '', '', ':', ersh, '(Watt)']);
      rows.push([L.ek2_sec_eff_l, '', '', '', '', '', '']);
      rows.push([L.ek2_erlh, '', '', '', ':', erlh, '(Watt)']);
      rows.push([L.ek2_erth, '', '', '', ':', ersh+erlh, '(Watt)']);
      rows.push(['']);

      // ── TOPLAM SOĞUTMA ──
      rows.push([L.ek2_sec_total, '', '', '', '', '', '']);
      rows.push([L.ek2_tsh, '', '', '', ':', ersh, '(Watt)']);
      rows.push([L.ek2_tlh, '', '', '', ':', erlh, '(Watt)']);
      rows.push([L.ek2_gth, '', '', '', ':', gth, '(Watt)']);
      rows.push([L.ek2_gth_kw, '', '', '', ':', +(gth/1000).toFixed(2), '(kW)']);
      rows.push([L.ek2_gth_tr, '', '', '', ':', +(gth/3517).toFixed(2), '(TR)']);
      rows.push([L.ek2_unit_load, alan>0?+(gth/alan).toFixed(0)+'':' –', '', '', ':', alan>0?+(gth/alan).toFixed(0):'–', '(W/m²)']);
      rows.push(['']);

      // ── İNFİLTRASYON ──
      rows.push([L.ek2_sec_infil, '', '', '', '', '', '']);
      const infilACHv=r.infilACH_val||0;
      const infilFlow=+(n(r.infilFlow_m3h||0)).toFixed(1);
      const infilSogV=Math.round(n(r.infilSog||0));
      rows.push([L.ek2_infil_ach, r.mahalTip?_trMahalTip(r.mahalTip):(_isEN?'OFFICE':'OFİS'), '→', infilACHv+' h⁻¹', '', '', '']);
      rows.push([L.ek2_infil_flow, n(r.hacim||r.alan*3).toFixed(1)+' m³ × '+infilACHv, '=', infilFlow+' m³/h', '', '', '']);
      rows.push([L.ek2_infil_cool, 'Q = V̇ × ρ × Cp × ΔT', '=', infilSogV+' W', '', P.infilEkle?L.ek2_infil_add:L.ek2_infil_excl, '']);
      rows.push(['']);

      // ── HAVALANDIRMA ──
      rows.push([L.ek2_sec_vent, '', '', '', '', '', '']);
      rows.push([L.ek2_oa, thFlow+' L/s', '/', thM3h+' m³/h', '', '', L.ek2_oa_rounded]);
      rows.push([L.ek2_exh, exFlow+' L/s', '/', exM3h+' m³/h', '', '', L.ek2_exh_bal]);
      rows.push(['']);
      rows.push([L.ek2_sec_oa_cool, '', '', '', '', '', '']);
      const thSogSV=Math.round(n(td.thSogS));
      const thSogLV=Math.round(n(td.thSogL));
      const thSogTV=Math.round(n(td.thSogT));
      const thIstV2=Math.round(n(td.thIst));
      rows.push([L.ek2_oa_sens, 'Q_s = V̇[kg/s] × Cp × ΔT × (1-HRV)', '=', thSogSV+' W', '', L.ek2_oa_add+(P.thSogEkle?L.yes:L.no_str), '']);
      rows.push([L.ek2_oa_lat, 'Q_l = V̇[kg/s] × 2501000 × ΔW × (1-HRV)', '=', thSogLV+' W', '', '', '']);
      rows.push([L.ek2_oa_tot, '', '', P.thSogEkle?thSogTV+' W ('+L.ek2_infil_add+')':('0 W ('+(_isEN?'Not selected':'Seçilmedi, eklenmedi')+')'), '', '', '']);
      rows.push([L.ek2_oa_heat, '', '', thIstV2+' W', '', '', '']);
      if(P.thSogEkle) rows.push([L.ek2_gth_plus, '', '', '', gth, '(Watt)', _isEN?'(OA incl.)':'(TH dahil)']);
      rows.push(['']);
      rows.push(['']);
    });
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:42},{wch:14},{wch:5},{wch:18},{wch:4},{wch:12},{wch:18}];
    applySheetStyle(ws, rows, L.sh.ek2, 2);
    XLSX.utils.book_append_sheet(wb,ws,L.sh.ek2);
  })();

  // ═══════════════════════════════════════════════════════════════════════
  // SAYFA 13: YERDEN ISITMA / UFH DESIGN  (EN 1264, 16×2 PE-Xa)
  // ═══════════════════════════════════════════════════════════════════════
  (function(){
    // K_H tablosu: boru adımı mm → ısı geçiş katsayısı W/m²K
    // Kaynak: EN 1264-2, 16×2 PE-Xa, çimento şap 45 mm
    // (widest → narrowest, algorithm picks widest spacing that satisfies load)
    const KH_TABLE = [
      {s:300, k:4.2},
      {s:250, k:4.8},
      {s:200, k:5.6},
      {s:150, k:6.7},
      {s:100, k:8.1},
    ];
    const MAX_CIRC_M = 60; // efektif maks. devre boyu (m)

    const rows = [];

    // ── Başlık satırları (3 satır → kolon başlığı 3. satır) ──
    rows.push([L.sh.ufh + '   ' + s(P.prjAdi)]);
    rows.push([L.prjInfo(P)]);

    const colH = _isEN
      ? ['No','Room Name','Type','Floor',
         'Area\nm²','Heat Loss\nW','Eff.Area\nm²','q_req\nW/m²',
         'T_room\n°C','TG*\n°C','TD*\n°C','Tm\n°C','ΔT_H\n°C',
         'Spacing\nmm','K_H\nW/m²K','q_ach\nW/m²','Capacity\nW','Cover.\n%',
         'T_floor\n°C','Floor\nCheck','Total\nPipe m','Circuits','Pipe/Circ\nm','Flow\nL/h']
      : ['No','Mahal Adı','Tip','Kat',
         'Alan\nm²','Isı Kaybı\nW','Etk.Alan\nm²','q_ger\nW/m²',
         'T_oda\n°C','TG*\n°C','TD*\n°C','Tm\n°C','ΔT_H\n°C',
         'Adım\nmm','K_H\nW/m²K','q_sağ\nW/m²','Kapasite\nW','Karşl.\n%',
         'T_döş.\n°C','Döşeme\nKontrol','Top.Boru\nm','Devre','Boru/Devre\nm','Akış\nL/s'];
    rows.push(colH);

    let totQ = 0, totPipe = 0, totCircuits = 0;

    R.forEach(r => {
      const Q = Math.round(n(r.qKayip));
      if (Q <= 0) return; // ısıtılmayan mahaller atla
      const alan = n(r.alan) || 0;
      if (alan <= 0) return;

      const tRoom = n(r.Tic_kis) || 20;
      const TG = UFH_TG; // kullanıcı tarafından ayarlanan gidiş sıcaklığı
      const TD = UFH_TD; // kullanıcı tarafından ayarlanan dönüş sıcaklığı
      const Tm  = (TG + TD) / 2;                    // ortalama su sıcaklığı
      const dTH = +(Tm - tRoom).toFixed(1);          // ΔT_H = Tm − T_oda

      const effArea = +(alan * 0.85).toFixed(2);     // efektif ısıtma alanı (%85)
      const qReq    = effArea > 0 ? +(Q / effArea).toFixed(1) : 0; // gerekli yüzey ısı akısı

      // Geniş adımdan dara doğru: koşulu sağlayan en geniş adımı seç
      let sel = KH_TABLE[KH_TABLE.length - 1]; // fallback: 100 mm
      for (const entry of KH_TABLE) {          // 300 → 250 → 200 → 150 → 100
        if (entry.k * dTH >= qReq) { sel = entry; break; }
      }

      const spacingM = sel.s / 1000;
      const kh     = sel.k;
      const qAch   = +(kh * dTH).toFixed(1);         // sağlanan yüzey ısı akısı
      const capW   = Math.round(qAch * effArea);      // sağlanan kapasite
      const cover  = +(capW / Math.max(1, Q) * 100).toFixed(0); // karşılama %

      // Döşeme yüzey sıcaklığı: T_floor = T_room + q_ach / α  (α≈10.8 W/m²K)
      const tFloor = +(tRoom + qAch / 10.8).toFixed(1);
      const isWet  = /WC|BANYO|BATH/i.test(r.mahalTip || '');
      const tLim   = isWet ? 33 : UFH_TLIM;
      const floorCheck = tFloor <= tLim
        ? (_isEN ? 'OK' : 'UYGUN')
        : (_isEN ? '⚠ WARN' : '⚠ UYARI');

      const totPipeRoom  = +(effArea / spacingM).toFixed(1); // toplam boru uzunluğu
      const circuits     = Math.ceil(totPipeRoom / MAX_CIRC_M);
      const pipePerCirc  = +(totPipeRoom / circuits).toFixed(1);
      const flowLh       = +(Q / (1.163 * (TG - TD))).toFixed(1); // L/h toplam debi
      const flowPerCirc  = +(flowLh / circuits).toFixed(1);

      totQ        += Q;
      totPipe     += totPipeRoom;
      totCircuits += circuits;

      rows.push([
        s(r.mahalNo), s(r.mahalAdi), _trMahalTip(s(r.mahalTip || '')), katCikar(r.mahalNo),
        +alan.toFixed(2), Q, +effArea.toFixed(2), qReq,
        tRoom, TG, TD, +Tm.toFixed(1), dTH,
        sel.s, kh, qAch, capW, +cover,
        tFloor, floorCheck,
        totPipeRoom, circuits, pipePerCirc, flowPerCirc,
      ]);
    });

    // Toplam satırı
    rows.push([
      _isEN ? 'TOTAL' : 'TOPLAM', '', '', '', '', totQ, '', '',
      '', '', '', '', '', '', '', '', '', '',
      '', '', +totPipe.toFixed(1), totCircuits, '', '',
    ]);

    // ── Notlar ──────────────────────────────────────────────────────────
    rows.push(['']);
    rows.push([_isEN
      ? '* TG / TD: Default supply / return temperatures = 35 / 28 °C. Adjust per project requirements.'
      : '* TG / TD: Varsayılan gidiş / dönüş sıcaklıkları = 35 / 28 °C. Projeye göre güncelleyiniz.']);
    rows.push([_isEN
      ? 'Pipe: 16×2 mm PE-Xa | Eff.Area = Room Area × 0.85 | Max circuit: 60 m effective'
      : 'Boru: 16×2 mm PE-Xa | Etk.Alan = Mahal Alanı × 0.85 | Maks. devre: 60 m efektif']);
    rows.push([_isEN
      ? 'K_H [W/m²K]: 100mm→8.1 | 150mm→6.7 | 200mm→5.6 | 250mm→4.8 | 300mm→4.2  (EN 1264-2, cement screed 45mm)'
      : 'K_H [W/m²K]: 100mm→8.1 | 150mm→6.7 | 200mm→5.6 | 250mm→4.8 | 300mm→4.2  (EN 1264-2, çimento şap 45mm)']);
    rows.push([_isEN
      ? `T_floor = T_room + q_ach / 10.8  |  Limits: living areas ≤${UFH_TLIM}°C, wet rooms ≤33°C`
      : `T_döşeme = T_oda + q_sağ / 10.8  |  Sınırlar: yaşam alanları ≤${UFH_TLIM}°C, ıslak hacimler ≤33°C`]);
    rows.push([_isEN
      ? 'Flow per circuit [L/h] = Q_room / (1.163 × ΔT_w) / circuits  |  Spacing auto-selected (widest that meets load)'
      : 'Devre debisi [L/s] = Q_mahal / (1.163 × ΔT_su) / devre sayısı  |  Adım otomatik seçilir (yükü karşılayan en geniş)']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      {wch:10}, {wch:22}, {wch:10}, {wch:7},
      {wch:7},  {wch:9},  {wch:8},  {wch:8},
      {wch:7},  {wch:6},  {wch:6},  {wch:6},  {wch:7},
      {wch:8},  {wch:8},  {wch:7},  {wch:9},  {wch:7},
      {wch:8},  {wch:9},  {wch:9},  {wch:7},  {wch:10}, {wch:8},
    ];
    applySheetStyle(ws, rows, L.sh.ufh, 3);
    XLSX.utils.book_append_sheet(wb, ws, L.sh.ufh);
  })();

  // ─── DOSYA YAZ (JSZip ile stil enjeksiyonu) ──────────────────────────
  const fname=('HVAC_MTH_'+(s(P.prjNo)||'PRJ')+'_'+new Date().toISOString().slice(0,10)+(_isEN?'_EN':'')+'.xlsx')
    .replace(/[\/\\:*?"<>|]/g,'_');

  if (window.__JSZIP_READY__ && typeof JSZip !== 'undefined') {
    // JSZip ile xlsx binary'i aç, styles.xml enjekte et
    const wbBinary = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const zip = await JSZip.loadAsync(wbBinary);
    
    // Tüm sheet'lerdeki stil bilgilerini topla
    const styleInfo = _collectStyleInfo(wb);
    
    // styles.xml oluştur ve enjekte et
    const stylesXmlContent = _buildStylesXml(styleInfo);
    zip.file('xl/styles.xml', stylesXmlContent);
    
    // Her sheet'in XML'ine stil indekslerini ekle
    for (let i = 0; i < wb.SheetNames.length; i++) {
      const sheetName = wb.SheetNames[i];
      const sheetFile = `xl/worksheets/sheet${i+1}.xml`;
      const sheetXmlFile = zip.file(sheetFile);
      if (!sheetXmlFile) continue;
      const sheetXml = await sheetXmlFile.async('string');
      const patchedXml = _patchSheetXml(sheetXml, wb.Sheets[sheetName], styleInfo, i);
      zip.file(sheetFile, patchedXml);
    }
    
    // base64 olarak üret (blob yerine - CSP uyumlu)
    const base64data = await zip.generateAsync({ type: 'base64' });
    const dataUrl = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64data;
     const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    // Fallback: stiller olmadan yaz
    XLSX.writeFile(wb, fname);
  }
}

