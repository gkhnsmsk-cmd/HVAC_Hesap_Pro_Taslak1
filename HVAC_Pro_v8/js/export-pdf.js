// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — PDF Export (export-pdf.js)
// ═══════════════════════════════════════════════════════════

// Bu rapor formatı (Carrier HAP tarzı) her zaman İngilizce başlıklarla üretiliyor (LANG'a bakmaksızın),
// ama calc-engine.js'in ürettiği mahal tipi kodları (OFİS, TOPLU, KONUT...) her zaman Türkçe kalıyordu
// ve doğrudan tabloya sızıyordu (örn. TYPE sütununda "TOPLU"). Rapor tamamen İngilizce olduğu için
// bu kodları burada koşulsuz İngilizce'ye çeviriyoruz.
var _PDF_MAHALTIP_EN = {
  'OFİS':'OFFICE', 'TOPLU':'ASSEMBLY', 'KONUT':'RESIDENTIAL', 'MAĞAZA':'RETAIL',
  'MUTFAK':'KITCHEN', 'KİTCHENETTE':'KITCHENETTE', 'ELEKTRIK':'ELECTRICAL', 'ELEKTRİK':'ELECTRICAL',
  'SERVER':'SERVER', 'WC':'WC', 'KORİDOR':'CORRIDOR', 'DEPO':'STORAGE', 'OUTDOOR':'OUTDOOR',
};
function _pdfMahalTipEN(tip){ return (tip && _PDF_MAHALTIP_EN[tip]) || tip || 'OFFICE'; }

function downloadPdf(){
  console.log('📕 PDF Export başlatılıyor...');
  
  // Validation
  if(!globalResults||!globalResults.length){
    console.error('❌ globalResults bulunamadı veya boş');
    alert(typeof LANG !== 'undefined' && LANG === 'en' ? 'Run the calculation first.' : 'Önce hesabı çalıştırın.');
    return;
  }
  
  console.log('✓ globalResults var, kayıt sayısı:', globalResults.length);
  console.log('✓ globalParams:', globalParams);
  
  try {
    // Generate Carrier HAP format content for PDF
    const projectName = globalParams && globalParams.prjAdi ? String(globalParams.prjAdi).replace(/[^a-zA-Z0-9_\-]/g,'_') : 'proje';
    console.log('✓ Project name:', projectName);
    
    // Generate Carrier HAP HTML content
    console.log('📄 HTML içeriği oluşturuluyor...');
    const carrierHapContent = generateCarrierHapHtml();
    console.log('✓ HTML içeriği oluşturuldu, uzunluk:', carrierHapContent.length);
    
    // Simple HTML content with UTF-8 encoding
    var htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + projectName + '_HAP_Report</title>';
    htmlContent += '<style>';
    htmlContent += '@page { margin: 0.2in; size: portrait; }';
    htmlContent += '@media print { @page { margin: 0.2in; size: portrait; } body { margin: 0 !important; padding: 0 !important; } @top-center { content: none !important; } @bottom-center { content: none !important; } @top-left { content: none !important; } @top-right { content: none !important; } @bottom-left { content: none !important; } @bottom-right { content: none !important; } }';
    htmlContent += 'body { font-family: "Times New Roman", serif; font-size: 10pt; margin: 0; padding: 0; color: #000000; background: #ffffff; }';
    htmlContent += 'table { border-collapse: collapse; width: 100%; margin: 6px 0; font-family: "Times New Roman", serif; font-size: 9pt; }';
    htmlContent += 'th, td { border: 1px solid #000000; padding: 2px 4px; vertical-align: top; text-align: left; font-family: "Times New Roman", serif; font-size: 9pt; }';
    htmlContent += 'th { background-color: #003366; color: #FFFFFF; font-weight: bold; text-transform: uppercase; font-size: 8pt; }';
    htmlContent += '.left-align { text-align: left; }';
    htmlContent += '.right-align { text-align: right; }';
    htmlContent += '.center-align { text-align: center; }';
    htmlContent += '.header { font-family: "Arial", sans-serif; font-size: 16pt; font-weight: bold; text-align: center; margin: 8px 0 4px 0; color: #003366; border-bottom: 2px solid #003366; padding-bottom: 4px; }';
    htmlContent += '.sub-header { font-family: "Arial", sans-serif; font-size: 9pt; text-align: center; margin: 0 0 12px 0; color: #333333; }';
    htmlContent += '.section-header { font-family: "Arial", sans-serif; font-size: 11pt; font-weight: bold; margin: 16px 0 6px 0; color: #003366; text-decoration: underline; }';
    htmlContent += '.page-break { page-break-before: always; height: 0; }';
    htmlContent += '.room-header { font-family: "Arial", sans-serif; font-size: 12pt; font-weight: bold; color: #003366; margin: 12px 0 8px 0; }';
    htmlContent += 'tr.total-row { background-color: #E6F2FF; font-weight: bold; }';
    htmlContent += 'tr.total-row td { font-weight: bold; color: #003366; }';
    htmlContent += 'tr.alt-row { background-color: #F5F5F5; }';
    htmlContent += '.header-table { width: 100%; border: 2px solid #003366; margin-bottom: 12px; }';
    htmlContent += '.header-table th { background-color: #003366; color: #FFFFFF; font-size: 10pt; }';
    htmlContent += '.header-table td { font-size: 9pt; }';
    htmlContent += '@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    htmlContent += '</style></head><body>';
    htmlContent += carrierHapContent;
    htmlContent += '<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 100); }<\/script>';
    htmlContent += '</body></html>';
    
    console.log('✓ Tam HTML oluşturuldu, toplam uzunluk:', htmlContent.length);
    
    // Create a new window with Carrier HAP content
    console.log('🪟 Yeni pencere açılıyor...');
    const pdfWindow = window.open('', '_blank');
    
    if(!pdfWindow) {
      console.error('❌ Pencere açılamadı - Pop-up engellendi olabilir');
      alert(typeof LANG !== 'undefined' && LANG === 'en'
        ? 'The PDF window could not be opened!\n\nCheck your browser\'s pop-up blocker.\nAllow pop-ups and try again.'
        : 'PDF penceresi açılamadı!\n\nTarayıcınızın pop-up engelleyicisini kontrol edin.\nPop-up\'lara izin verin ve tekrar deneyin.');
      return;
    }
    
    console.log('✓ Pencere açıldı, içerik yazılıyor...');
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
    
    console.log('✅ PDF export tamamlandı!');
    console.log('📄 Yeni pencerede yazdırma penceresi otomatik açılacak');
    
  } catch(err) {
    console.error('❌ PDF Export Hatası:', err);
    console.error('Hata detayı:', err.message);
    console.error('Stack:', err.stack);
    alert((typeof LANG !== 'undefined' && LANG === 'en'
      ? 'An error occurred while generating the PDF:\n\n'
      : 'PDF oluşturulurken hata oluştu:\n\n') + err.message + (typeof LANG !== 'undefined' && LANG === 'en'
      ? '\n\nCheck the Console (F12) for details.'
      : '\n\nDetaylar için Console\'u (F12) kontrol edin.'));
  }
}

// Generate Carrier HAP format HTML content
function generateCarrierHapHtml(){
  console.log('📄 generateCarrierHapHtml çağrıldı');
  
  try {
    const R = globalResults || [];
    const P = globalParams || {};
    
    console.log('✓ R (results) sayısı:', R.length);
    console.log('✓ P (params):', P);
    
    const now = new Date();
    const dateStr = (now.getMonth()+1).toString().padStart(2,'0')+'.'+now.getDate().toString().padStart(2,'0')+'.'+now.getFullYear();
    const timeStr = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0');
    const prjAdi = P.prjAdi || '–';
    const kimAdi = P.kim || '–';
    
    let html = '';
    
    // Calculate total pages first
    let totalPages = 0;
    const katlar = {};
    R.forEach(r=>{
      const k = r.mahalNo ? String(r.mahalNo).substring(0,1) : 'X';
      if(!katlar[k]) katlar[k]=[];
      katlar[k].push(r);
    });
    
    console.log('✓ Katlar hesaplandı:', Object.keys(katlar).length + ' kat');
    
    // Carrier HAP page structure:
    // Page 1: Main header
    // Page 2: Project information
    // Page 3: Design conditions summary
    // Pages 4-7: Floor summaries and space lists
    // Pages 8+: Individual room details
  
  totalPages = 3; // Intro pages
  totalPages += Math.min(4, Object.keys(katlar).length); // List pages (max 4)
  totalPages += R.length; // Individual room pages
  totalPages += 1; // Project summary
  
  let currentPage = 1;
  
  // PAGE 1: Main header
  html += '<table class="header-table">' +
    '<tr><th colspan="2" style="text-align:center;font-size:14pt;">HOURLY ANALYSIS PROGRAM</th></tr>' +
    '<tr><th colspan="2" style="text-align:center;font-size:12pt;">Carrier Corporation - Version 5.11</th></tr>' +
    '<tr><td style="width:50%;"><strong>Project Name:</strong> ' + prjAdi + '</td><td style="width:50%;text-align:right;"><strong>Prepared by:</strong> ' + kimAdi + '</td></tr>' +
    '<tr><td colspan="2" style="text-align:center;">' + dateStr + ' ' + timeStr + '</td></tr>' +
    '</table>';
  html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
  currentPage++;
  
  // PAGE 2: Project Information
  html += '<div class="page-break"></div>';
  html += '<table class="header-table">' +
    '<tr><th colspan="2" style="text-align:center;font-size:12pt;">PROJECT INFORMATION</th></tr>' +
    '</table>';
  
  html += '<table>' +
    '<tr><th class="left-align">Parameter</th><th class="right-align">Value</th><th class="left-align">Unit</th></tr>' +
    '<tr><td class="left-align">Project Name</td><td class="right-align">' + prjAdi + '</td><td class="left-align">-</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Prepared by</td><td class="right-align">' + kimAdi + '</td><td class="left-align">-</td></tr>' +
    '<tr><td class="left-align">Date Created</td><td class="right-align">' + dateStr + '</td><td class="left-align">-</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Time Created</td><td class="right-align">' + timeStr + '</td><td class="left-align">-</td></tr>' +
    '<tr><td class="left-align">Total Spaces</td><td class="right-align">' + R.length + '</td><td class="left-align">spaces</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Total Floor Area</td><td class="right-align">' + (R.reduce((sum, r) => sum + parseFloat(r.alan||0), 0)).toFixed(1).replace('.', ',') + '</td><td class="left-align">m²</td></tr>' +
    '</table>';
  html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
  currentPage++;
  
  // PAGE 3: Design Conditions Summary
  html += '<div class="page-break"></div>';
  html += '<table class="header-table">' +
    '<tr><th colspan="2" style="text-align:center;font-size:12pt;">DESIGN CONDITIONS SUMMARY</th></tr>' +
    '</table>';
  
  html += '<table>' +
    '<tr><th colspan="3" class="left-align">DESIGN COOLING CONDITIONS</th></tr>' +
    '<tr><td class="left-align">Outside Air Dry Bulb</td><td class="right-align">' + (P.Tmax || P.yazKt || 33) + '</td><td class="left-align">°C</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Outside Air Wet Bulb</td><td class="right-align">' + (P.yazYT || P.yazYt || 21) + '</td><td class="left-align">°C</td></tr>' +
    '<tr><td class="left-align">Occupied Setpoint</td><td class="right-align">' + (P.icKtYaz || 24) + '</td><td class="left-align">°C</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Relative Humidity</td><td class="right-align">' + (P.icNem || 50) + '</td><td class="left-align">%</td></tr>' +
    '<tr><th colspan="3" class="left-align">DESIGN HEATING CONDITIONS</th></tr>' +
    '<tr><td class="left-align">Outside Air Dry Bulb</td><td class="right-align">' + (P.kisKt || -9) + '</td><td class="left-align">°C</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Outside Air Wet Bulb</td><td class="right-align">' + (+((P.kisKt||(-9))-2).toFixed(1)) + '</td><td class="left-align">°C</td></tr>' +
    '<tr><td class="left-align">Occupied Setpoint</td><td class="right-align">' + (P.icKtKis || 22) + '</td><td class="left-align">°C</td></tr>' +
    '</table>';
  html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
  currentPage++;
  
  // PAGES 4-7: Floor Summaries and Space Lists
  Object.keys(katlar).sort().forEach((katNo, floorIndex) => {
    if (floorIndex >= 4) return; // Max 4 list pages
    
    const rooms = katlar[katNo];
    const katAdi = 'Floor ' + katNo;
    
    html += '<div class="page-break"></div>';
    html += '<table class="header-table">' +
      '<tr><th colspan="3" style="text-align:center;font-size:12pt;">FLOOR SUMMARY - ' + katAdi + '</th></tr>' +
      '</table>';
    
    // Floor summary table
    const floorTotalCooling = rooms.reduce((sum, r) => sum + parseFloat(r.bestLoad||0), 0);
    const floorTotalHeating = rooms.reduce((sum, r) => sum + parseFloat(r.qKayip||0), 0);
    const floorTotalArea = rooms.reduce((sum, r) => sum + parseFloat(r.alan||0), 0);
    const floorTotalPeople = rooms.reduce((sum, r) => sum + parseInt(r.kisiSayisi||0), 0);
    
    html += '<table>' +
      '<tr><th class="left-align">Parameter</th><th class="right-align">Value</th><th class="left-align">Unit</th></tr>' +
      '<tr><td class="left-align">Total Cooling Load</td><td class="right-align">' + (floorTotalCooling/1000).toFixed(1).replace('.', ',') + '</td><td class="left-align">kW</td></tr>' +
      '<tr class="alt-row"><td class="left-align">Total Heating Load</td><td class="right-align">' + (floorTotalHeating/1000).toFixed(1).replace('.', ',') + '</td><td class="left-align">kW</td></tr>' +
      '<tr><td class="left-align">Total Floor Area</td><td class="right-align">' + floorTotalArea.toFixed(1).replace('.', ',') + '</td><td class="left-align">m²</td></tr>' +
      '<tr class="alt-row"><td class="left-align">Number of Spaces</td><td class="right-align">' + rooms.length + '</td><td class="left-align">spaces</td></tr>' +
      '<tr><td class="left-align">Total Occupancy</td><td class="right-align">' + floorTotalPeople + '</td><td class="left-align">people</td></tr>' +
      '<tr class="alt-row"><td class="left-align">Specific Cooling</td><td class="right-align">' + ((floorTotalCooling/floorTotalArea).toFixed(0)) + '</td><td class="left-align">W/m²</td></tr>' +
      '</table>';
    
    // Space list table
    html += '<table style="margin-top:16px;">' +
      '<tr><th class="left-align">Space Name</th><th class="right-align">Area (m²)</th><th class="right-align">Occupancy</th><th class="right-align">Cooling (kW)</th><th class="right-align">Heating (kW)</th></tr>';
    
    rooms.forEach(r => {
      const peakKw = (parseFloat(r.bestLoad||0)/1000).toFixed(1).replace('.', ',');
      const htgKw = (parseFloat(r.qKayip||0)/1000).toFixed(1).replace('.', ',');
      html += '<tr' + (rooms.indexOf(r) % 2 === 1 ? ' class="alt-row"' : '') + '>' +
        '<td class="left-align">' + (r.mahalNo || '') + ' ' + (r.mahalAdi || '') + '</td>' +
        '<td class="right-align">' + parseFloat(r.alan||0).toFixed(1).replace('.', ',') + '</td>' +
        '<td class="right-align">' + (r.kisiSayisi || 0) + '</td>' +
        '<td class="right-align">' + peakKw + '</td>' +
        '<td class="right-align">' + htgKw + '</td>' +
        '</tr>';
    });
    
    html += '</table>';
    html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
    currentPage++;
  });
  
  // PAGES 8+: Individual Room Details
  Object.keys(katlar).sort().forEach((katNo, floorIndex) => {
    const rooms = katlar[katNo];
    const katAdi = 'Floor ' + katNo;
    
    rooms.forEach((r, roomIndex) => {
      html += '<div class="page-break"></div>';
      
      // Room header table
      html += '<table class="header-table">' +
        '<tr><th colspan="2" style="text-align:center;font-size:12pt;">TABLE 1.1.A. Component Loads For Space "' + (r.mahalAdi || '') + '" In Zone "Zone ' + katNo + '"</th></tr>' +
        '<tr><td style="width:50%;"><strong>Room:</strong> ' + (r.mahalNo || '') + '</td><td style="width:50%;text-align:right;"><strong>Area:</strong> ' + parseFloat(r.alan||0).toFixed(1).replace('.', ',') + ' m²</td></tr>' +
        '<tr><td colspan="2" style="text-align:center;"><strong>Occupancy:</strong> ' + (r.kisiSayisi || 0) + ' persons</td></tr>' +
        '</table>';
      
      // Design conditions section
      html += '<table>' +
        '<tr><th colspan="3" class="left-align">DESIGN COOLING</th></tr>' +
        '<tr><td class="left-align">COOLING DATA AT</td><td class="right-align" colspan="2">' + (r.bestAy ? (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.bestAy-1] || 'Jan') : 'Jan') + ' ' + (r.bestSaat||2300) + '</td></tr>' +
        '<tr><td class="left-align">COOLING OA DB/WB</td><td class="right-align" colspan="2">' + (P.Tmax||P.yazKt||33) + ' °C / ' + (P.yazYT||P.yazYt||21) + ' °C</td></tr>' +
        '<tr><td class="left-align">OCCUPIED T-STAT</td><td class="right-align" colspan="2">' + (P.icKtYaz||24) + ' °C</td></tr>' +
        '<tr><th colspan="3" class="left-align">DESIGN HEATING</th></tr>' +
        '<tr><td class="left-align">HEATING DATA AT</td><td class="right-align" colspan="2">DES HTG</td></tr>' +
        '<tr><td class="left-align">HEATING OA DB/WB</td><td class="right-align" colspan="2">' + (P.kisKt||-9) + ' °C / ' + (+((P.kisKt||(-9))-2).toFixed(1)) + ' °C</td></tr>' +
        '<tr><td class="left-align">OCCUPIED T-STAT</td><td class="right-align" colspan="2">' + (P.icKtKis||22) + ' °C</td></tr>' +
        '</table>';
      
      // Component Loads Table
      html += '<table>' +
        '<tr>' +
        '<th class="left-align">SPACE LOADS</th>' +
        '<th class="center-align">Details</th>' +
        '<th class="right-align">Sensible (W)</th>' +
        '<th class="right-align">Latent (W)</th>' +
        '</tr>';
      
      // Window loads
      html += '<tr><td class="left-align">Window & Skylight Solar Loads</td><td class="left-align">Solar + Conductive</td><td class="right-align">' + (r.pencereQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // Wall loads
      html += '<tr class="alt-row"><td class="left-align">Wall Transmission</td><td class="left-align">Conductive</td><td class="right-align">' + (r.duvarQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // Roof loads
      html += '<tr><td class="left-align">Roof Transmission</td><td class="left-align">Conductive</td><td class="right-align">' + (r.tavanQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // Floor loads
      html += '<tr class="alt-row"><td class="left-align">Floor Transmission</td><td class="left-align">Conductive</td><td class="right-align">' + (r.dosemeQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // Lighting
      html += '<tr><td class="left-align">Overhead Lighting</td><td class="left-align">Fixed Load</td><td class="right-align">' + (r.aydinlatmaQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // Equipment
      html += '<tr class="alt-row"><td class="left-align">Electric Equipment</td><td class="left-align">Fixed Load</td><td class="right-align">' + (r.ekipmanQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      
      // People
      html += '<tr><td class="left-align">People</td><td class="left-align">' + (r.kisiSayisi || 0) + ' persons</td><td class="right-align">' + (r.insanQ || 0).toFixed(1) + '</td><td class="right-align">' + (r.insanQLatent || 0).toFixed(1) + '</td></tr>';
      
      // Infiltration
      html += '<tr class="alt-row"><td class="left-align">Infiltration</td><td class="left-align">Air Leakage</td><td class="right-align">' + (r.sizintiQ || 0).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';

      // Ventilation (Outdoor Air) – from thData
      var _th = r.thData || {};
      var _thSogS = parseFloat(_th.thSogS || 0);
      var _thSogL = parseFloat(_th.thSogL || 0);
      html += '<tr><td class="left-align">Ventilation (Outdoor Air)</td><td class="left-align">' + parseFloat(_th.thFlow||0).toFixed(0) + ' L/s – ' + _pdfMahalTipEN(_th.tip) + '</td><td class="right-align">' + _thSogS.toFixed(1) + '</td><td class="right-align">' + _thSogL.toFixed(1) + '</td></tr>';

      // Safety Factor
      html += '<tr class="alt-row"><td class="left-align">Safety Factor</td><td class="left-align">10%/10%</td><td class="right-align">' + ((parseFloat(r.bestLoad||0) * 0.1).toFixed(1)) + '</td><td class="right-align">0.0</td></tr>';

      // Total
      html += '<tr class="total-row"><td class="left-align">Total Zone Loads</td><td class="left-align">Sum of All</td><td class="right-align">' + (parseFloat(r.bestLoad||0).toFixed(1)) + '</td><td class="right-align">0.0</td></tr>';

      html += '</table>';
      
      // Component Heat Losses Table (TABLE 1.1.D) — heating, sensible only, internal gains ignored (conservative)
      var _hlDt  = (parseFloat(r.dtKis||0)).toFixed(0);
      var _hlWin = ((parseFloat(r.pencereQis||0)) + (parseFloat(r.skylightQis||0))).toFixed(1);
      var _hlVen = (P.thIstEkle ? Math.max(0, parseFloat(_th.thIst||0)) : 0);
      var _hlSf  = ((parseFloat(r.qKayipBase||0)) * ((parseFloat(r.emIstFak||1)) - 1)).toFixed(1);
      var _hlSfPct = (((parseFloat(r.emIstFak||1)) - 1) * 100).toFixed(0);
      var _hlWind = ((parseFloat(r.qKayipBase||0)) - ((parseFloat(r.duvarQis||0)) + (parseFloat(r.tavanQis||0)) + (parseFloat(r.dosemeQis||0)) + (parseFloat(r.pencereQis||0)) + (parseFloat(r.skylightQis||0)))).toFixed(1);
      var _hlRuz = (P.ruzgarZam ? parseFloat(P.ruzgarZam) : 1).toFixed(2);
      html += '<table class="header-table" style="margin-top:16px;">' +
        '<tr><th colspan="4" style="text-align:center;font-size:11pt;">TABLE 1.1.D. Component Heat Losses For Space "' + (r.mahalAdi || '') + '" In Zone "Zone ' + katNo + '"</th></tr>' +
        '</table>';
      html += '<table>' +
        '<tr>' +
        '<th class="left-align">SPACE HEAT LOSSES</th>' +
        '<th class="center-align">Details</th>' +
        '<th class="right-align">Sensible (W)</th>' +
        '<th class="right-align">Latent (W)</th>' +
        '</tr>';
      html += '<tr><td class="left-align">Wall Transmission</td><td class="left-align">Conductive · ΔT ' + _hlDt + ' K</td><td class="right-align">' + (parseFloat(r.duvarQis||0)).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr class="alt-row"><td class="left-align">Roof Transmission</td><td class="left-align">Conductive · ΔT ' + _hlDt + ' K</td><td class="right-align">' + (parseFloat(r.tavanQis||0)).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr><td class="left-align">Floor Transmission</td><td class="left-align">Conductive</td><td class="right-align">' + (parseFloat(r.dosemeQis||0)).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr class="alt-row"><td class="left-align">Window &amp; Skylight Transmission</td><td class="left-align">Conductive</td><td class="right-align">' + _hlWin + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr><td class="left-align">Wind / Exposure Factor</td><td class="left-align">x' + _hlRuz + ' on transmission</td><td class="right-align">' + _hlWind + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr><td class="left-align">Infiltration</td><td class="left-align">Air Leakage</td><td class="right-align">' + (parseFloat(r.infilIst||0)).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr class="alt-row"><td class="left-align">Ventilation (Outdoor Air)</td><td class="left-align">' + parseFloat(_th.thFlow||0).toFixed(0) + ' L/s – ' + _pdfMahalTipEN(_th.tip) + '</td><td class="right-align">' + _hlVen.toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr style="color:#888;font-style:italic;"><td class="left-align">Internal Gains</td><td class="left-align">Ignored (conservative)</td><td class="right-align">—</td><td class="right-align">—</td></tr>';
      html += '<tr><td class="left-align">Safety Factor</td><td class="left-align">' + _hlSfPct + '%</td><td class="right-align">' + _hlSf + '</td><td class="right-align">0.0</td></tr>';
      html += '<tr class="total-row"><td class="left-align">Total Heating Load</td><td class="left-align">Sum of All</td><td class="right-align">' + (parseFloat(r.qKayip||0)).toFixed(1) + '</td><td class="right-align">0.0</td></tr>';
      html += '</table>';

      // Envelope Loads Table (TABLE 1.1.B)
      html += '<table class="header-table" style="margin-top:16px;">' +
        '<tr><th colspan="7" style="text-align:center;font-size:11pt;">TABLE 1.1.B. Envelope Loads For Space "' + (r.mahalAdi || '') + '" In Zone "Zone ' + katNo + '"</th></tr>' +
        '</table>';
      
      html += '<table>' +
        '<tr>' +
        '<th class="left-align">Surface</th>' +
        '<th class="right-align">Area (m²)</th>' +
        '<th class="right-align">U-Value (W/(m²K))</th>' +
        '<th class="right-align">Shade Coeff.</th>' +
        '<th class="right-align">COOLING TRANS (W)</th>' +
        '<th class="right-align">COOLING SOLAR (W)</th>' +
        '<th class="right-align">HEATING TRANS (W)</th>' +
        '</tr>';
      
      // Window envelope data
      html += '<tr><td class="left-align">Window</td><td class="right-align">' + (r.pencereAlan || 0).toFixed(1) + '</td><td class="right-align">' + (r.pencereU || 2.8).toFixed(2) + '</td><td class="right-align">' + (r.pencereG || 0.6).toFixed(2) + '</td><td class="right-align">' + (r.pencereQis || 0).toFixed(1) + '</td><td class="right-align">' + (r.pencereQ || 0).toFixed(1) + '</td><td class="right-align">' + (r.pencereQis || 0).toFixed(1) + '</td></tr>';
      
      // Wall envelope data
      html += '<tr class="alt-row"><td class="left-align">Wall</td><td class="right-align">' + (r.duvarAlan || 0).toFixed(1) + '</td><td class="right-align">' + (r.duvarU || 0.5).toFixed(2) + '</td><td class="right-align">-</td><td class="right-align">' + (r.duvarQis || 0).toFixed(1) + '</td><td class="right-align">0.0</td><td class="right-align">' + (r.duvarQis || 0).toFixed(1) + '</td></tr>';
      
      // Roof envelope data
      html += '<tr><td class="left-align">Roof</td><td class="right-align">' + (r.tavanAlan || 0).toFixed(1) + '</td><td class="right-align">' + (r.tavanU || 0.4).toFixed(2) + '</td><td class="right-align">-</td><td class="right-align">' + (r.tavanQis || 0).toFixed(1) + '</td><td class="right-align">0.0</td><td class="right-align">' + (r.tavanQis || 0).toFixed(1) + '</td></tr>';
      
      html += '</table>';

      // TABLE 1.1.C – Ventilation & Psychrometric Analysis (compact)
      var _dh  = (parseFloat(_th.hDis||0) - parseFloat(_th.hIc||0)).toFixed(1);
      var _dW  = (parseFloat(_th.WDis||0) - parseFloat(_th.WIc||0)).toFixed(2);
      var _hrv = _th.hrvTip || 'yok';
      var _eta = parseFloat(_th.hrvEta||0);
      var _hrvLabel = _hrv === 'yok' ? 'Direct Outdoor Air (No HRV)' :
                      _hrv === 'plate' ? 'Plate HRV' :
                      _hrv === 'rotary' ? 'Rotary HRV' : 'Run-Around HRV';
      var _thSogSpost = parseFloat(_th.thSogS || 0);                 // HRV sonrası efektif duyulur
      var _thSogSpre  = parseFloat(_th.thSogS_pre != null ? _th.thSogS_pre : (_eta < 100 ? _thSogSpost / (1 - _eta/100) : _thSogSpost)); // HRV öncesi ham
      var _hrvKazanim = parseFloat(_th.hrvKazanim != null ? _th.hrvKazanim : (_thSogSpre - _thSogSpost)); // geri kazanılan (W)
      var _hrvRow = _hrv !== 'yok'
        ? '<tr style="background:#e8f5e9;">' +
          '<td class="left-align" colspan="2"><strong>🔄 ' + _hrvLabel + ' — Efficiency: ' + _eta + '%</strong></td>' +
          '<td class="right-align" colspan="2">Recovered Energy: ' + _hrvKazanim.toFixed(0) + ' W</td>' +
          '<td class="right-align" colspan="4">Raw OA: ' + _thSogSpre.toFixed(0) + ' W → Effective OA Cooling: ' + _thSogSpost.toFixed(0) + ' W (after HRV)</td>' +
          '</tr>'
        : '';

      html += '<table class="header-table" style="margin-top:10px;">' +
        '<tr><th colspan="8" style="text-align:center;font-size:10pt;padding:4px 6px;">TABLE 1.1.C. Ventilation &amp; Psychrometric Analysis — ' + (r.mahalAdi || '') + '</th></tr>' +
        '</table>';

      html += '<table style="font-size:8.5pt;">' +
        '<tr>' +
        '<th class="left-align" style="width:14%;">Type</th>' +
        '<th class="left-align" style="width:22%;">Formula / HRV</th>' +
        '<th class="right-align" style="width:8%;">OA (L/s)</th>' +
        '<th class="right-align" style="width:8%;">Exh (L/s)</th>' +
        '<th class="right-align" style="width:10%;">Δh / ΔW</th>' +
        '<th class="right-align" style="width:10%;">Clg-S (W)</th>' +
        '<th class="right-align" style="width:10%;">Clg-T (W)</th>' +
        '<th class="right-align" style="width:10%;">Htg (W)</th>' +
        '</tr>' +
        // ROW 1 – airflow + loads
        '<tr>' +
        '<td class="left-align">' + _pdfMahalTipEN(_th.tip) + '</td>' +
        '<td class="left-align" style="font-size:7.5pt;">' + String(_th.formul || '–').substring(0,50) + (_hrv!=='yok'?' ['+_hrvLabel+' '+_eta+'%]':'') + '</td>' +
        '<td class="right-align">' + parseFloat(_th.thFlow||0).toFixed(1) + '</td>' +
        '<td class="right-align">' + parseFloat(_th.exFlow||0).toFixed(1) + '</td>' +
        '<td class="right-align" style="font-size:7.5pt;">' + _dh + ' kJ/kg<br>' + _dW + ' g/kg</td>' +
        '<td class="right-align">' + parseFloat(_th.thSogS||0).toFixed(0) + '</td>' +
        '<td class="right-align total-row">' + parseFloat(_th.thSogT||0).toFixed(0) + '</td>' +
        '<td class="right-align">' + parseFloat(_th.thIst||0).toFixed(0) + '</td>' +
        '</tr>' +
        // ROW HRV (sadece HRV varsa)
        _hrvRow +
        // ROW 2 – psychro conditions summary
        '<tr class="alt-row" style="font-size:7.5pt;">' +
        '<td colspan="2" class="left-align">OA: h=' + parseFloat(_th.hDis||0).toFixed(1) + ' kJ/kg · W=' + parseFloat(_th.WDis||0).toFixed(2) + ' g/kg | RA: h=' + parseFloat(_th.hIc||0).toFixed(1) + ' · W=' + parseFloat(_th.WIc||0).toFixed(2) + '</td>' +
        '<td colspan="2" class="right-align">' + (parseFloat(_th.thFlow||0)*3.6).toFixed(0) + ' m³/h</td>' +
        '<td colspan="4" class="left-align">Lat: ' + parseFloat(_th.thSogL||0).toFixed(0) + ' W | ṁ×Cp×ΔT / ṁ×hfg×ΔW' + (_hrv!=='yok'?' | HRV η='+_eta+'%':'') + '</td>' +
        '</tr>' +
        '</table>';

      html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
      currentPage++;
    });
  });
  
  // FINAL PAGE: Project Summary
  html += '<div class="page-break"></div>';
  html += '<table class="header-table">' +
    '<tr><th colspan="4" style="text-align:center;font-size:12pt;">PROJECT SUMMARY</th></tr>' +
    '<tr><td style="width:25%;"><strong>Total Spaces:</strong> ' + R.length + '</td><td style="width:25%;text-align:right;"><strong>Total Area:</strong> ' + (R.reduce((sum, r) => sum + parseFloat(r.alan||0), 0)).toFixed(1).replace('.', ',') + ' m²</td><td style="width:25%;"><strong>Total People:</strong> ' + (R.reduce((sum, r) => sum + parseInt(r.kisiSayisi||0), 0)) + '</td><td style="width:25%;text-align:right;"><strong>Date:</strong> ' + dateStr + '</td></tr>' +
    '</table>';
  
  const projectTotalCooling = R.reduce((sum, r) => sum + parseFloat(r.bestLoad||0), 0);
  const projectTotalHeating = R.reduce((sum, r) => sum + parseFloat(r.qKayip||0), 0);
  const projectTotalArea = R.reduce((sum, r) => sum + parseFloat(r.alan||0), 0);
  const projectTotalPeople = R.reduce((sum, r) => sum + parseInt(r.kisiSayisi||0), 0);
  
  html += '<table>' +
    '<tr><th class="left-align">Project Parameter</th><th class="right-align">Total Value</th><th class="left-align">Unit</th><th class="left-align">Per Unit</th></tr>' +
    '<tr><td class="left-align">Total Cooling Load</td><td class="right-align">' + (projectTotalCooling/1000).toFixed(1).replace('.', ',') + '</td><td class="left-align">kW</td><td class="left-align">' + ((projectTotalCooling/3517).toFixed(1)) + ' TR</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Total Heating Load</td><td class="right-align">' + (projectTotalHeating/1000).toFixed(1).replace('.', ',') + '</td><td class="left-align">kW</td><td class="left-align">-</td></tr>' +
    '<tr><td class="left-align">Total Floor Area</td><td class="right-align">' + projectTotalArea.toFixed(1).replace('.', ',') + '</td><td class="left-align">m²</td><td class="left-align">-</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Number of Spaces</td><td class="right-align">' + R.length + '</td><td class="left-align">spaces</td><td class="left-align">-</td></tr>' +
    '<tr><td class="left-align">Total Occupancy</td><td class="right-align">' + projectTotalPeople + '</td><td class="left-align">people</td><td class="left-align">' + ((projectTotalArea/projectTotalPeople).toFixed(1)) + ' m²/person</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Specific Cooling</td><td class="right-align">' + ((projectTotalCooling/projectTotalArea).toFixed(0)) + '</td><td class="left-align">W/m²</td><td class="left-align">-</td></tr>' +
    '<tr><td class="left-align">Air Flow per Area</td><td class="right-align">' + ((R.reduce((sum, r) => sum + Math.round(parseFloat(r.bestLoad||0)/1.2/1006*1000), 0)/projectTotalArea).toFixed(1)) + '</td><td class="left-align">L/s·m²</td><td class="left-align">-</td></tr>' +
    '</table>';
  html += '<div style="text-align:right;font-family:Arial;font-size:8pt;color:#666666;margin-top:20px;">Hourly Analysis Program 5.11 | Page ' + currentPage + ' of ' + totalPages + '</div>';
  
  console.log('✅ generateCarrierHapHtml başarıyla tamamlandı, HTML uzunluğu:', html.length);

  // APPENDIX — Calculation Methodology & Standards (traceability / audit)
  html += '<div class="page-break"></div>';
  html += '<div class="header">APPENDIX — CALCULATION METHODOLOGY &amp; STANDARDS</div>';
  html += '<div class="section-header">A.1 Design Basis Summary</div>';
  html += '<table>' +
    '<tr><th class="left-align">Parameter</th><th class="left-align">Value</th></tr>' +
    '<tr><td class="left-align">Cooling outdoor design (DB / WB)</td><td class="left-align">' + (P.Tmax||'-') + ' &deg;C / ' + (P.yazYT||P.yazYt||'-') + ' &deg;C</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Cooling indoor set-point</td><td class="left-align">' + (P.icKtYaz||24) + ' &deg;C</td></tr>' +
    '<tr><td class="left-align">Heating outdoor design (DB)</td><td class="left-align">' + (P.kisKt!=null?P.kisKt:'-') + ' &deg;C</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Heating indoor set-point</td><td class="left-align">' + (P.icKtKis||22) + ' &deg;C</td></tr>' +
    '<tr><td class="left-align">Solar data basis (latitude)</td><td class="left-align">Clear-sky model, ~40-41&deg;N reference</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Cooling safety factor</td><td class="left-align">' + (P.emSog||0) + ' %</td></tr>' +
    '<tr><td class="left-align">Heating safety factor</td><td class="left-align">' + (P.emIst||0) + ' %</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Wind / exposure factor (heating)</td><td class="left-align">x' + (P.ruzgarZam||1) + '</td></tr>' +
    '</table>';
  html += '<div class="section-header">A.2 Cooling Load Method</div>';
  html += '<p style="font-size:9pt;margin:3px 0;">Sensible cooling loads are computed with the ASHRAE CLTD/CLF method and solar heat-gain factors (SHGF), evaluated by orientation, month and hour; the peak hour is selected by a month &times; hour sweep.</p>';
  html += '<p style="font-size:9pt;margin:3px 0;font-style:italic;">Solar: q = SHGF(month, orientation, hour) &times; SHGC &times; Shade Factor. &nbsp; Walls / roof: CLTD (ASHRAE Group D wall, monthly T<sub>max</sub> correction).</p>';
  html += '<div class="section-header">A.3 Heating Load Method</div>';
  html += '<p style="font-size:9pt;margin:3px 0;font-style:italic;">Q = U &middot; A &middot; &Delta;T &times; exposure factor, &nbsp;plus infiltration and ventilation heating.</p>';
  html += '<p style="font-size:9pt;margin:3px 0;">Internal gains (lighting, people, equipment, solar) are conservatively neglected for the heating case.</p>';
  html += '<div class="section-header">A.4 Ventilation &amp; Infiltration</div>';
  html += '<table>' +
    '<tr><th class="left-align">Item</th><th class="left-align">Basis</th></tr>' +
    '<tr><td class="left-align">Office ventilation</td><td class="left-align">Per-person + per-area (3.8 L/s&middot;person + 0.6 L/s&middot;m&sup2;)</td></tr>' +
    '<tr class="alt-row"><td class="left-align">Other space types</td><td class="left-align">Air-change (ACH) method by space type</td></tr>' +
    '<tr><td class="left-align">Infiltration</td><td class="left-align">TS 825 ACH basis; Q = &rho; &middot; c<sub>p</sub> &middot; V &middot; &Delta;T (&rho; = 1.2 kg/m&sup3;, c<sub>p</sub> = 1006 J/kg&middot;K)</td></tr>' +
    '</table>';
  html += '<div class="section-header">A.5 Psychrometrics</div>';
  html += '<p style="font-size:9pt;margin:3px 0;">The fresh-air (outdoor-air) load is split into sensible and latent components from the enthalpy and humidity-ratio difference between outdoor and indoor air.</p>';
  html += '<div class="section-header">A.6 References</div>';
  html += '<ol style="font-size:9pt;margin:3px 0 3px 18px;padding:0;">' +
    '<li>ASHRAE Handbook &mdash; Fundamentals, Nonresidential Cooling and Heating Load Calculations (CLTD / CLF / SHGF method as published in earlier editions; superseded by the RTS method in current editions).</li>' +
    '<li>ASHRAE Standard 62.1 &mdash; Ventilation for Acceptable Indoor Air Quality (default outdoor-air rates).</li>' +
    '<li>EN 12831-1 &mdash; Energy performance of buildings, design heat load (simplified conduction basis).</li>' +
    '<li>TS 825 &mdash; Thermal insulation requirements for buildings (infiltration air-change basis).</li>' +
    '</ol>';
  html += '<div class="section-header">A.7 Limitations &amp; Disclaimer</div>';
  html += '<ul style="font-size:9pt;margin:3px 0 3px 18px;padding:0;">' +
    '<li>Loads are computed with the steady-periodic CLTD / CLF approach, not a transient (8760-hour) simulation.</li>' +
    '<li>Solar gains use a clear-sky model at a reference latitude, not a site-specific weather file.</li>' +
    '<li>Values are design estimates and remain subject to review by a qualified engineer.</li>' +
    '</ul>';
  return html;
  
  } catch(err) {
    console.error('❌ generateCarrierHapHtml hatası:', err);
    console.error('Hata detayı:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
}
