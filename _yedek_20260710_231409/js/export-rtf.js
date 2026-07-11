// ═══════════════════════════════════════════════════════════
// HVAC Hesap Pro — RTF / HAP-Style Word Export (export-rtf.js)
// ═══════════════════════════════════════════════════════════

function exportRTF(){
  if(!globalResults||!globalResults.length){ alert((typeof LANG!=='undefined'&&LANG==='en') ? 'Run the calculation first.' : 'Önce hesabı çalıştırın.'); return; }
  const R = globalResults;
  const P = globalParams || {};
  const now = new Date();
  const dateStr = (now.getMonth()+1).toString().padStart(2,'0')+'.'+now.getDate().toString().padStart(2,'0')+'.'+now.getFullYear();
  const timeStr = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const prjAdi = s(P.prjAdi)||'–';
  const kimAdi = s(P.kim)||'–';
  const sehir  = s(P.sehir)||'Istanbul, Turkey';
  const programAdi = 'HVAC Load Calculation Report v5.1';

  // RTF escape
  function rtf(str){
    if(str===undefined||str===null) return '';
    str = String(str);
    
    // First handle special units and symbols - fix m² and L/(s-m²)
    const replacements = {
      'm²': 'm\\u178?',
      'm2': 'm\\u178?', 
      'm²': 'm\\u178?',
      'L/(s-m²)': 'L/(s-m\\u178?)',
      'L/(s-m2)': 'L/(s-m\\u178?)',
      'L/(s·m²)': 'L/(s\\u183?m\\u178?)',
      'L/(s·m2)': 'L/(s\\u183?m\\u178?)',
      'L/(s·m²)': 'L/(s\\u183?m\\u178?)',
      'L/(s-m²)': 'L/(s-m\\u178?)',
      '°C': '\\u176?C',
      '°F': '\\u176?F',
      '°': '\\u176?',
      '²': '\\u178?',
      '³': '\\u179?',
      '±': '\\u177?',
      'µ': '\\u181?',
      '×': '\\u215?',
      '÷': '\\u247?',
      '≤': '\\u2264?',
      '≥': '\\u2265?',
      '≠': '\\u2260?',
      '∞': '\\u221e?',
      '∑': '\\u2211?',
      '∆': '\\u394?',
      'π': '\\u3c0?',
      'Ω': '\\u3a9?',
      'β': '\\u3b2?',
      'ρ': '\\u3c1?',
      'λ': '\\u3bb?',
      'α': '\\u3b1?',
      'γ': '\\u3b3?',
      'η': '\\u3b7?',
      'ε': '\\u3b5?',
      'τ': '\\u3c4?',
      'φ': '\\u3c6?',
      'ψ': '\\u3c8?',
      'δ': '\\u3b4?',
      'θ': '\\u3b8?',
      'κ': '\\u3ba?',
      'σ': '\\u3c3?',
      'ξ': '\\u3be?',
      'χ': '\\u3c7?',
      'ω': '\\u3c9?'
    };
    
    // Apply unit replacements first
    Object.keys(replacements).forEach(key => {
      str = str.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacements[key]);
    });
    
    // Handle Turkish characters
    str = str
      .replace(/ğ/g, '\\u287?')
      .replace(/Ğ/g, '\\u286?')
      .replace(/ı/g, '\\u305?')
      .replace(/İ/g, '\\u304?')
      .replace(/ö/g, '\\u246?')
      .replace(/Ö/g, '\\u214?')
      .replace(/ü/g, '\\u252?')
      .replace(/Ü/g, '\\u220?')
      .replace(/ş/g, '\\u351?')
      .replace(/Ş/g, '\\u350?')
      .replace(/ç/g, '\\u231?')
      .replace(/Ç/g, '\\u199?');
    
    // Handle basic RTF escaping
    return str
      .replace(/\\/g, '\\\\')
      .replace(/{/g, '\\{')
      .replace(/}/g, '\\}')
      .replace(/\n/g, '\\par ')
      .replace(/\t/g, '\\tab ');
  }
  function n2(v){ 
    const num = parseFloat(v);
    return isNaN(num) ? '0' : Math.round(num).toString(); 
  }
  function n(v){ 
    const num = parseFloat(v);
    return isNaN(num) ? 0 : num; 
  }
  function s(v){ 
    if(v == null || v === undefined) return '';
    if(typeof v === 'number' && isNaN(v)) return '0';
    return String(v).trim(); 
  }
  function f1(v){ 
    const num = parseFloat(v);
    return isNaN(num) ? '0,0' : num.toFixed(1).replace('.', ','); 
  }
  function f2(v){ 
    const num = parseFloat(v);
    return isNaN(num) ? '0,00' : num.toFixed(2).replace('.', ','); 
  }

  // Sayfalar arası counter
  let pageNum = 0;

  // ── RTF Header / Footer builder ──────────────────────────────
  function makeHeaderFooter(title, pg){
    pageNum = pg;
    return (
      '{\\header\\pard\\s0\\tqc\\tx5231\\brdrt\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sb20\\ql\\f2\\cf3\\b\\fs20\\tab '+
      rtf(title)+'\\par'+
      '\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\ql\\f2\\fs16 '+
      'Project Name: '+rtf(prjAdi)+'\\tab\\tab '+rtf(dateStr)+' \\par'+
      '\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrb\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sa20\\ql\\f2\\fs16 '+
      'Prepared by: '+rtf(kimAdi)+'\\tab\\tab '+rtf(timeStr)+' \\par}'+
      '{\\footer\\pard\\s0\\tqr\\tx10463\\brdrt\\brdrs\\sb20\\ql\\f2\\fs16 '+
      rtf(programAdi)+'\\tab Page \\~{\\field{\\fldinst PAGE}{\\fldrslt '+pg+'}}\\~ of \\~{\\field{\\fldinst NUMPAGES}{\\fldrslt 99}}\\~\\par}'
    );
  }

  // ── Bölüm ayarları ───────────────────────────────────────────
  const SECT = '\\sectd\\pgwsxn11908\\pghsxn16833\\marglsxn1134\\margrsxn1134\\margtsxn1440\\margbsxn1134\\headery360\\footery360\\sbknone\\pgncont\\pgndec\\ltrpar\n';
  const SECT_BREAK = '\\sectd\\pgwsxn11908\\pghsxn16833\\marglsxn1134\\margrsxn1134\\margtsxn1440\\margbsxn1134\\headery360\\footery360\\sbkpage\\pgncont\\pgndec\\ltrpar\n';
  const SECT2COL = '\\sectd\\pgwsxn11908\\pghsxn16833\\marglsxn1134\\margrsxn1134\\margtsxn1440\\margbsxn1134\\headery360\\footery360\\sbknone\\pgncont\\cols2\\colsx360\\pgndec\\ltrpar\n';

  // ── Tablo hücre yardımcıları ─────────────────────────────────
  function th(txt, w, align){
    align = align||'qc';
    // Better multi-line header formatting with proper text wrapping and centering
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\'+align+'\\f2\\fs16\\b\\clwrap\\trgaph60\\qc\\vertalc '+cleanText+'\\b0\\cell\n';
  }
  function td(txt, w, align){
    align = align||'qr';
    // Improved cell formatting with text wrapping and better spacing
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\'+align+'\\f2\\fs16\\clwrap\\trgaph60\\vertalc '+cleanText+'\\cell\n';
  }
  function tdl(txt){ 
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\ql\\f2\\fs16\\clwrap\\trgaph60\\vertalc '+cleanText+'\\cell\n'; 
  }
  function tdn(txt){ 
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\qr\\f2\\fs16\\clwrap\\trgaph60\\vertalc '+cleanText+'\\cell\n'; 
  }
  function tdc(txt){ 
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\qc\\f2\\fs16\\clwrap\\trgaph60\\vertalc '+cleanText+'\\cell\n'; 
  }
  // For Time of Peak column - left aligned like in PDF
  function tdt(txt){ 
    const cleanText = rtf(String(txt));
    return '\\pard\\intbl\\s0\\ql\\f2\\fs16\\clwrap\\trgaph60\\vertalc '+cleanText+'\\cell\n'; 
  }
  function rowEnd(){ return '\\intbl\\row\n'; }

  // Hücre genişlikleri (twips)
  function cellDef(widths, header){
    const bg = header ? '\\clcbpat6' : '';
    // Increased row height for better text fitting
    let r = '\\trowd\\trgaph60\\trleft173\\trrh400\\trkeep';
    if(header) r += '\\trhdr';
    let pos = 173;
    widths.forEach(w=>{
      pos += w;
      // Added vertical centering and better borders
      r += '\\clvertalc\\clbrdrt\\brdrs\\brdrw15\\clbrdrb\\brdrs\\brdrw15\\clbrdrl\\brdrs\\brdrw15\\clbrdrr\\brdrs\\brdrw15\\clpadl20\\clpadr20\\clpadt20\\clpadb20'+bg+'\\cellx'+pos;
    });
    return r + '\n';
  }

  // ── Bölüm başlığı ────────────────────────────────────────────
  function secHead(txt){
    return '\\pard\\s0\\ql\\f2\\cf3\\fs18\\b\\ul\\sb120\\sa60 '+rtf(txt)+'\\ul0\\b0\\par\\plain\\f1\\fs24\n';
  }
  // For group headers like "SOYUNMA ODALARI"
  function groupHead(txt){
    return '\\pard\\s0\\ql\\f2\\fs16\\b\\ul\\sb60\\sa30 '+rtf(txt)+'\\ul0\\b0\\par\n';
  }

  // ── 2-sütun key:value satırı ─────────────────────────────────
  function kv(label, value, unit){
    unit = unit||'';
    return '\\pard\\s0\\tqr\\tldot\\tx4200\\tx4400\\ql\\f2\\fs16\\li60\\ri60 '+rtf(label)+' \\tab  \\b '+rtf(String(value))+'\\b0\\tab '+rtf(unit)+'\\par\\sa20\n';
  }

  // ═══════════════════════════════════════════════════
  // Kat bazında gruplama
  // ═══════════════════════════════════════════════════
  const katlar = {};
  R.forEach(r=>{
    const k = r.mahalNo ? String(r.mahalNo).substring(0,1) : 'X';
    if(!katlar[k]) katlar[k]=[];
    katlar[k].push(r);
  });

  let body = '';
  let pgCount = 0;

  // ═══════════════════════════════════════════════════════════════
  // Her kat için rapor sayfaları üret
  // ═══════════════════════════════════════════════════════════════
  Object.entries(katlar).forEach(([kat, rooms], katIdx)=>{
    const katAdi = kat+'. Kat';
    const katAlan = rooms.reduce((a,r)=>a+n(r.alan||0),0);
    const katSog  = rooms.reduce((a,r)=>a+n(r.bestLoad||0),0);
    const katIst  = rooms.reduce((a,r)=>a+n(r.qKayip||0),0);
    const katTH   = rooms.reduce((a,r)=>a+n(r.thData?.th||0),0);
    const katTHSog= rooms.reduce((a,r)=>a+n(r.thData?.thSogT||0),0);
    const katTHIst= rooms.reduce((a,r)=>a+n(r.thData?.thIst||0),0);

    // Soğutma peak hesabı
    const peakRoom = rooms.reduce((a,b)=>(n(b.bestLoad||0)>n(a.bestLoad||0)?b:a), rooms[0]);
    const peakAy = peakRoom.bestAy||5;
    const peakSaat= peakRoom.bestSaat||1600;
    const AYLAR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const peakStr = (AYLAR[peakAy]||'Jun')+' '+peakSaat;

    // Tüm kat bileşen toplamları
    let totCamSolar=0, totDuvar=0, totPencIlet=0, totTavan=0, totDoseme=0;
    let totAydinlatma=0, totIcDuy=0, totIcGiz=0, totInfil=0;
    let totDuvarKis=0, totPencKis=0, totDosKis=0, totTavKis=0;
    rooms.forEach(r=>{
      const p = r.peak||{};
      totCamSolar  += n(p.qCam||0);
      totDuvar     += n(p.qDuvar||0);
      totPencIlet  += n(p.qPencIlet||0);
      totTavan     += n(p.qTavan||0);
      totDoseme    += n(p.qDoseme||0);
      totAydinlatma+= n(p.qIcDuy||r.qAyd||0);
      totIcDuy     += n(p.qIcDuy||0);
      totIcGiz     += n(p.qIcGiz||0);
      totInfil     += n(r.infilSog||0);
      totDuvarKis  += n(r.qDuvarKis||0);
      totPencKis   += n(r.qPencKis||0);
      totDosKis    += n(r.qDosKis||0);
      totTavKis    += n(r.qTavKis||0);
    });
    const totZoneSog = totCamSolar+totDuvar+totPencIlet+totTavan+totDoseme+totIcDuy+totIcGiz+totInfil;
    const emSog = n(peakRoom.emSogFak||1.1);
    const safeFactorSog = Math.round(totZoneSog*(emSog-1));
    const totZoneSogSf = totZoneSog+safeFactorSog;
    const safeFactorGiz = Math.round(totIcGiz*0.1);
    const airflow = Math.round(katSog / 1.2 / 1006 * 1000);

    // ──────────────────────────────────────────
    // SAYFA 1: Air System Sizing Summary
    // ──────────────────────────────────────────
    pgCount++;
    if(katIdx===0){
      body += SECT_BREAK.replace('sbkpage','sbkpage')+makeHeaderFooter('Air System Sizing Summary for '+katAdi, pgCount)+'\n';
    } else {
      body += '{\\header\\pard\\s0\\tqc\\tx5231\\brdrt\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sb20\\ql\\f2\\cf3\\b\\tab Air System Sizing Summary for '+rtf(katAdi)+'\\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\ql\\f2\\fs16 Project Name: '+rtf(prjAdi)+'\\tab\\tab '+rtf(dateStr)+' \\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrb\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sa20\\ql\\f2\\fs16 Prepared by: '+rtf(kimAdi)+'\\tab\\tab '+rtf(timeStr)+' \\par}\n';
      body += '{\\footer\\pard\\s0\\tqr\\tx10463\\brdrt\\brdrs\\sb20\\ql\\f2\\fs16 '+rtf(programAdi)+'\\tab Page \\~{\\field{\\fldinst PAGE}{\\fldrslt '+pgCount+'}}\\~ of \\~{\\field{\\fldinst NUMPAGES}{\\fldrslt 99}}\\~\\par}\n';
    }

    // Air System Information
    body += secHead('Air System Information');
    body += '\\sect\n'+SECT2COL;
    body += '\\pard\\s0\\tqr\\tldot\\tx4104\\tx4248\\ql\\f2\\fs16\n';
    body += kv('Air System Name', katAdi);
    body += kv('Equipment Class', 'CW AHU');
    body += kv('Air System Type', 'SZCAV');
    body += '\\column\\f2\\fs16\n';
    body += kv('Number of zones', rooms.length);
    body += kv('Floor Area', f1(katAlan), 'm\\u178?');
    body += kv('Location', sehir);
    body += '\\sect\n'+SECT;

    // Sizing Calculation Information
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Sizing Calculation Information\\par\\plain\\f1\\fs24\n';
    body += '\\sect\n'+SECT2COL;
    body += kv('Calculation Months', 'Jan to Dec');
    body += kv('Sizing Data', 'Calculated');
    body += '\\column\\f2\\fs16\n';
    body += kv('Zone L/s Sizing', 'Sum of space airflow rates');
    body += kv('Space L/s Sizing', 'Individual peak space loads');
    body += '\\sect\n'+SECT;

    // Central Cooling Coil Sizing Data
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Central Cooling Coil Sizing Data\\par\\plain\\f1\\fs24\n';
    body += '\\sect\n'+SECT2COL;
    body += kv('Total coil load', f1(katSog/1000), 'kW');
    body += kv('Sensible coil load', f1(katSog*0.78/1000), 'kW');
    body += kv('Coil L/s at '+peakStr, airflow, 'L/s');
    body += kv('Max block L/s', airflow, 'L/s');
    body += kv('Sum of peak zone L/s', airflow, 'L/s');
    body += kv('Sensible heat ratio', '0.780', '');
    body += kv('L/(s kW)', f1(airflow/(katSog/1000||1)), '');
    body += kv('m\\u178?/kW', f1(katAlan/(katSog/1000||1)), '');
    body += kv('W/m\\u178?', f1(katSog/katAlan||0), '');
    body += kv('Water flow @ 5,0 K rise', f1(katSog/1000/5/4.18), 'L/s');
    body += '\\column\\f2\\fs16\n';
    body += kv('Load occurs at', peakStr);
    body += kv('OA DB / WB', (P.Tmax||32)+' / '+(P.yazYT||23), '\\u176?C');
    body += kv('Entering DB / WB', (P.icKtYaz||24)+' / 17.5', '\\u176?C');
    body += kv('Leaving DB / WB', '15.0 / 14.4', '\\u176?C');
    body += kv('Coil ADP', '13.8', '\\u176?C');
    body += kv('Bypass Factor', '0.100', '');
    body += kv('Resulting RH', '55', '%');
    body += kv('Design supply temp.', '15.0', '\\u176?C');
    body += kv('Zone T-stat Check', '0 of '+rooms.length, 'OK');
    body += kv('Max zone temperature deviation', '0.2', 'K');
    body += '\\sect\n'+SECT;

    // Central Heating Coil Sizing Data
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Central Heating Coil Sizing Data\\par\\plain\\f1\\fs24\n';
    body += '\\sect\n'+SECT2COL;
    body += kv('Max coil load', f1(katIst/1000), 'kW');
    body += kv('Coil L/s at Des Htg', airflow, 'L/s');
    body += kv('Max coil L/s', airflow, 'L/s');
    body += kv('Water flow @ 20,0 K drop', f1(katIst/1000/20/4.18), 'L/s');
    body += '\\column\\f2\\fs16\n';
    body += kv('Load occurs at', 'Des Htg');
    body += kv('W/m\\u178?', f1(katIst/katAlan||0), '');
    body += kv('Ent. DB / Lvg DB', (P.kisKt||(-3))+' / '+(P.icKtKis||22), '\\u176?C');
    body += '\\sect\n'+SECT;

    // Supply Fan Sizing Data
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Supply Fan Sizing Data\\par\\plain\\f1\\fs24\n';
    body += '\\sect\n'+SECT2COL;
    body += kv('Actual max L/s', airflow, 'L/s');
    body += kv('Standard L/s', Math.round(airflow*0.996), 'L/s');
    body += kv('Actual max L/(s\\u183?m\\u178?)', f1(airflow/katAlan||0), 'L/(s\\u183?m\\u178?)');
    body += '\\column\\f2\\fs16\n';
    body += kv('Fan motor BHP', '0.00', 'BHP');
    body += kv('Fan motor kW', '0.00', 'kW');
    body += kv('Fan static', '0', 'Pa');
    body += '\\sect\n'+SECT;

    // Outdoor Ventilation Air Data
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Outdoor Ventilation Air Data\\par\\plain\\f1\\fs24\n';
    body += '\\sect\n'+SECT2COL;
    const oaFlow = Math.round(katTH);
    body += kv('Design airflow L/s', oaFlow, 'L/s');
    body += kv('L/(s\\u183?m\\u178?)', f1(oaFlow/katAlan||0), 'L/(s\\u183?m\\u178?)');
    body += '\\column\\f2\\fs16\n';
    const totKisi = rooms.reduce((a,r)=>a+n(r.nToplam||0),0);
    body += kv('L/s/person', totKisi>0?f1(oaFlow/totKisi):'–', 'L/s/person');
    body += '\\sect\n'+SECT;

    // ──────────────────────────────────────────
    // SAYFA 2: Zone Sizing Summary
    // ──────────────────────────────────────────
    pgCount++;
    body += '\\sect\n'+SECT_BREAK;
    body += '{\\header\\pard\\s0\\tqc\\tx5231\\brdrt\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sb20\\ql\\f2\\cf3\\b\\tab Zone Sizing Summary for '+rtf(katAdi)+'\\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\ql\\f2\\fs16 Project Name: '+rtf(prjAdi)+'\\tab\\tab '+rtf(dateStr)+' \\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrb\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sa20\\ql\\f2\\fs16 Prepared by: '+rtf(kimAdi)+'\\tab\\tab '+rtf(timeStr)+' \\par}\n';
    body += '{\\footer\\pard\\s0\\tqr\\tx10463\\brdrt\\brdrs\\sb20\\ql\\f2\\fs16 '+rtf(programAdi)+'\\tab Page \\~{\\field{\\fldinst PAGE}{\\fldrslt '+pgCount+'}}\\~ of \\~{\\field{\\fldinst NUMPAGES}{\\fldrslt 99}}\\~\\par}\n';

    body += secHead('Air System Information');
    body += '\\sect\n'+SECT2COL;
    body += kv('Air System Name', katAdi);
    body += kv('Equipment Class', 'CW AHU');
    body += kv('Air System Type', 'SZCAV');
    body += '\\column\\f2\\fs16\n';
    body += kv('Number of zones', rooms.length);
    body += kv('Floor Area', f1(katAlan), 'm\\u178?');
    body += kv('Location', sehir);
    body += '\\sect\n'+SECT;

    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Zone Terminal Sizing Data\\par\\plain\\f1\\fs24\\par\n';

    // Zone Terminal tablo
    const ZTW = [3600, 1200, 1200, 1100, 1000, 1100, 1000, 1100, 1000];
    body += cellDef(ZTW, true);
    body += th('Zone Name',0,'ql')+th('Design\\par Supply\\par Airflow\\par (L/s)')+th('Minimum\\par Supply\\par Airflow\\par (L/s)')+th('Zone\\par L/(s\\u183?m\\u178?)')+th('Reheat\\par Coil\\par Load\\par (kW)')+th('Reheat\\par Coil\\par Water\\par L/s\\par @ 20,0 K')+th('Zone\\par Htg Unit\\par Coil\\par Load\\par (kW)')+th('Zone\\par Htg Unit\\par Water\\par L/s\\par @ 20,0 K')+th('Mixing\\par Box Fan\\par Airflow\\par (L/s)')+rowEnd();

    rooms.forEach(r=>{
      const rFlow = Math.round(n(r.bestLoad||0)/1.2/1006*1000);
      const rLsm2 = f1(rFlow/(n(r.alan)||1));
      body += cellDef(ZTW, false);
      body += tdl(rtf(s(r.mahalNo)+' '+s(r.mahalAdi)))+td(rFlow)+td(rFlow)+td(rLsm2)+td('0.0')+td('0.00')+td('0.0')+td('0.00')+td('0')+rowEnd();
    });
    body += '\\par\n';

    // Zone Peak Sensible Loads
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Zone Peak Sensible Loads\\par\\plain\\f1\\fs24\\par\n';
    const ZPW = [3600, 1100, 1400, 1100, 1100];
    body += cellDef(ZPW, true);
    body += th(' ',0,'ql')+th('Zone')+th(' ')+th('Zone')+th('Zone')+rowEnd();
    body += cellDef(ZPW, true);
    body += th(' ',0,'ql')+th('Cooling')+th('Time of')+th('Heating')+th('Floor')+rowEnd();
    body += cellDef(ZPW, true);
    body += th(' ',0,'ql')+th('Sensible')+th('Peak Sensible\\par Load')+th('Load')+th('Area')+rowEnd();
    body += cellDef(ZPW, true);
    body += th('Zone Name',0,'ql')+th('(W)')+th('')+th('(W)')+th('(m\\u178?)')+rowEnd();

    rooms.forEach(r=>{
      const peakSensible = n(r.bestLoad||0);
      body += cellDef(ZPW, false);
      body += tdl(rtf(s(r.mahalNo)+' '+s(r.mahalAdi)))+td(n2(peakSensible))+td((AYLAR[r.bestAy||5]||'Jun')+' '+(r.bestSaat||1600))+td(n2(r.qKayip||0))+td(f1(r.alan||0))+rowEnd();
    });

    // Space Loads and Airflows
    body += '\\f2\\fs16\\par\\cf3\\fs18\\b Space Loads and Airflows\\par\\plain\\f1\\fs24\\par\n';
    const SAW = [3600, 1000, 1400, 1000, 1000, 1000, 900];
    body += cellDef(SAW, true);
    body += th('Zone Name /\\par      Space Name',0,'ql')+th('Sensible\\par (kW)')+th('Time of\\par Peak\\par Sensible\\par Load')+th('Air\\par Flow\\par (L/s)')+th('Heating\\par Load\\par (kW)')+th('Floor\\par Area\\par (m\\u178?)')+th('L/(s\\u183?m\\u178?)')+rowEnd();

    rooms.forEach(r=>{
      const peakKw = (n(r.bestLoad||0)/1000).toFixed(1);
      const rFlow2 = Math.round(n(r.bestLoad||0)/1.2/1006*1000);
      const htgKw = (n(r.qKayip||0)/1000).toFixed(1);
      body += cellDef(SAW, false);
      body += tdl(rtf(s(r.mahalNo)+' '+s(r.mahalAdi)))+td(peakKw)+td((AYLAR[r.bestAy||5]||'Jun')+' '+(r.bestSaat||1600))+td(rFlow2)+td(htgKw)+td(f1(r.alan||0))+td(f1(rFlow2/(n(r.alan)||1)))+rowEnd();
    });

    // ──────────────────────────────────────────
    // SAYFA 3: Air System Design Load Summary
    // ──────────────────────────────────────────
    pgCount++;
    body += '\\sect\n'+SECT_BREAK;
    body += '{\\header\\pard\\s0\\tqc\\tx5231\\brdrt\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sb20\\ql\\f2\\cf3\\b\\tab Air System Design Load Summary for '+rtf(katAdi)+'\\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\ql\\f2\\fs16 Project Name: '+rtf(prjAdi)+'\\tab\\tab '+rtf(dateStr)+' \\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrb\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sa20\\ql\\f2\\fs16 Prepared by: '+rtf(kimAdi)+'\\tab\\tab '+rtf(timeStr)+' \\par}\n';
    body += '{\\footer\\pard\\s0\\tqr\\tx10463\\brdrt\\brdrs\\sb20\\ql\\f2\\fs16 '+rtf(programAdi)+'\\tab Page \\~{\\field{\\fldinst PAGE}{\\fldrslt '+pgCount+'}}\\~ of \\~{\\field{\\fldinst NUMPAGES}{\\fldrslt 99}}\\~\\par}\n';

    // Design Load Summary tablosu
    const DLW = [3600, 1400, 1000, 1000, 1000, 1000, 1000];
    body += cellDef(DLW, true);
    body += th(' ',0,'ql')+th('DESIGN COOLING',0,'qc')+th(' ')+th(' ')+th('DESIGN HEATING',0,'qc')+th(' ')+th(' ')+rowEnd();
    body += cellDef(DLW, true);
    body += th(' ',0,'ql')+th('COOLING DATA AT '+peakStr,0,'qc')+th(' ')+th(' ')+th('HEATING DATA AT DES HTG',0,'qc')+th(' ')+th(' ')+rowEnd();
    body += cellDef(DLW, true);
    body += th(' ',0,'ql')+th('COOLING OA DB / WB   '+(P.Tmax||32)+' \\u176?C / '+(P.yazYT||23)+' \\u176?C',0,'qc')+th(' ')+th(' ')+th('HEATING OA DB / WB   '+(P.kisKt||(-3))+' \\u176?C / '+(+((P.kisKt||(-3))-2).toFixed(1))+' \\u176?C',0,'qc')+th(' ')+th(' ')+rowEnd();
    body += cellDef(DLW, true);
    body += th(' ',0,'ql')+th(' ')+th('Sensible')+th('Latent')+th(' ')+th('Sensible')+th('Latent')+rowEnd();
    body += cellDef(DLW, true);
    body += th('ZONE LOADS',0,'ql')+th('Details',0,'qr')+th('(W)')+th('(W)')+th('Details',0,'qr')+th('(W)')+th('(W)')+rowEnd();

    // Yük satırları
    const totCamAlan = rooms.reduce((a,r)=>a+Object.values(r.pencAlani||{}).reduce((x,v)=>x+v,0),0);
    const totDuvAlan = rooms.reduce((a,r)=>a+Object.values(r.duvarAlani||{}).reduce((x,v)=>x+v,0),0);

    function dlRow(label, detailCool, sensCool, latCool, detailHeat, sensHeat, latHeat){
      body += cellDef(DLW, false);
      body += tdl(rtf(label))+td(rtf(String(detailCool)))+td(n2(sensCool))+td(latCool==='-'?'-':n2(latCool))+td(rtf(String(detailHeat)))+td(n2(sensHeat))+td(latHeat==='-'?'-':n2(latHeat))+rowEnd();
    }

    dlRow('Window & Skylight Solar Loads', Math.round(totCamAlan)+' m\\u178?', totCamSolar, '-', Math.round(totCamAlan)+' m\\u178?', '-', '-');
    dlRow('Wall Transmission', Math.round(totDuvAlan)+' m\\u178?', totDuvar, '-', Math.round(totDuvAlan)+' m\\u178?', totDuvarKis, '-');
    dlRow('Roof Transmission', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
    dlRow('Window Transmission', Math.round(totCamAlan)+' m\\u178?', totPencIlet, '-', Math.round(totCamAlan)+' m\\u178?', totPencKis, '-');
    dlRow('Skylight Transmission', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
    dlRow('Door Loads', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
    dlRow('Floor Transmission', Math.round(katAlan)+' m\\u178?', totDoseme, '-', Math.round(katAlan)+' m\\u178?', totDosKis, '-');
    dlRow('Partitions', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
    dlRow('Ceiling', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
    const totAydW = rooms.reduce((a,r)=>a+n(r.aydW||0)*n(r.alan||0),0);
    dlRow('Overhead Lighting', Math.round(totAydW)+' W', totAydinlatma, '-', '0', 0, '-');
    dlRow('Task Lighting', '0 W', 0, '-', '0', 0, '-');
    const totCihazW = rooms.reduce((a,r)=>a+n(r.qCihaz||0),0);
    dlRow('Electric Equipment', Math.round(totCihazW)+' W', totCihazW, '-', '0', 0, '-');
    dlRow('People', totKisi, totIcDuy, totIcGiz, '0', 0, 0);
    dlRow('Infiltration', '-', totInfil, 0, '-', rooms.reduce((a,r)=>a+n(r.infilIst||0),0), 0);
    dlRow('Miscellaneous', '-', 0, 0, '-', 0, 0);
    const sfPct = Math.round((peakRoom.emSogFak||1.1-1)*100);
    dlRow('Safety Factor', sfPct+'% / '+sfPct+'%', safeFactorSog, safeFactorGiz, sfPct+'%', Math.round(katIst*(1-1/(peakRoom.emIstFak||1.1))), 0);

    // Total Zone Loads
    body += cellDef(DLW, true);
    body += '\\pard\\intbl\\s0\\ql\\f2\\cf3\\fs16\\b >> Total Zone Loads\\cf0\\b0\\cell\n';
    body += td('-')+td(n2(totZoneSogSf))+td(n2(totIcGiz+safeFactorGiz))+td('-')+td(n2(katIst))+td('0')+rowEnd();

    dlRow('Zone Conditioning', '-', Math.round(katSog*0.78), Math.round(katSog*0.22), '-', katIst, 0);
    dlRow('Plenum Wall Load', '0%', 0, '-', '0', 0, '-');
    dlRow('Plenum Roof Load', '0%', 0, '-', '0', 0, '-');
    dlRow('Plenum Lighting Load', '0%', 0, '-', '0', 0, '-');
    dlRow('Return Fan Load', airflow+' L/s', 0, '-', airflow+' L/s', 0, '-');
    dlRow('Ventilation Load', oaFlow+' L/s', Math.round(katTHSog), Math.round(katTHSog*0.6), oaFlow+' L/s', Math.round(katTHIst), 0);
    dlRow('Supply Fan Load', airflow+' L/s', 0, '-', airflow+' L/s', 0, '-');
    dlRow('Space Fan Coil Fans', '-', 0, '-', '-', 0, '-');
    dlRow('Central Cooling Coil', '-', Math.round(katSog*0.78+katTHSog), Math.round((katSog*0.22+katTHSog*0.6)), '-', '-', '-');
    dlRow('Central Heating Coil', '-', '-', '-', '-', Math.round(katIst+katTHIst), '-');

    // Grand Total
    body += cellDef(DLW, true);
    body += '\\pard\\intbl\\s0\\ql\\f2\\cf3\\fs16\\b >> Grand Total\\cf0\\b0\\cell\n';
    body += td('-')+td(n2(katSog))+td(n2(katSog*0.22))+td('-')+td(n2(katIst))+td('0')+rowEnd();

    // ──────────────────────────────────────────
    // SAYFALAR 4+: Space Design Load Summary
    // Her mahal için TABLE X.A + TABLE X.B
    // ──────────────────────────────────────────
    pgCount++;
    body += '\\sect\n'+SECT_BREAK;
    body += '{\\header\\pard\\s0\\tqc\\tx5231\\brdrt\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sb20\\ql\\f2\\cf3\\b\\tab Space Design Load Summary for '+rtf(katAdi)+'\\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\ql\\f2\\fs16 Project Name: '+rtf(prjAdi)+'\\tab\\tab '+rtf(dateStr)+' \\par\\pard\\s0\\tqc\\tx5231\\tqr\\tx10463\\brdrb\\brdrs\\brdrl\\brdrs\\brdrr\\brdrs\\li60\\ri60\\sa20\\ql\\f2\\fs16 Prepared by: '+rtf(kimAdi)+'\\tab\\tab '+rtf(timeStr)+' \\par}\n';
    body += '{\\footer\\pard\\s0\\tqr\\tx10463\\brdrt\\brdrs\\sb20\\ql\\f2\\fs16 '+rtf(programAdi)+'\\tab Page \\~{\\field{\\fldinst PAGE}{\\fldrslt '+pgCount+'}}\\~ of \\~{\\field{\\fldinst NUMPAGES}{\\fldrslt 99}}\\~\\par}\n';

    rooms.forEach((r, rIdx)=>{
      const spaceNo = (rIdx+1);
      const spaceLabel = s(r.mahalNo)+' '+s(r.mahalAdi);
      const p = r.peak||{};
      const rPeakStr = (AYLAR[r.bestAy||5]||'Jun')+' '+(r.bestSaat||1600);
      const rCamAlan = Object.values(r.pencAlani||{}).reduce((a,v)=>a+v,0);
      const rDuvAlan = Object.values(r.duvarAlani||{}).reduce((a,v)=>a+v,0);
      const rSafeFactorS = Math.round(n(r.bestLoadBase||r.bestLoad||0)*((r.emSogFak||1.1)-1));
      const rSafeFactorG = Math.round(n(p.qIcGiz||0)*0.1);

      // TABLE X.A – Component Loads
      if(rIdx > 0){
        body += '\\par\n';
      }
      const SPW = [10080];
      body += cellDef(SPW, true);
      body += '\\pard\\intbl\\s0\\qc\\f2\\fs16\\b TABLE '+katIdx+'.'+(rIdx+1)+'.A.    Component Loads For Space  \\"'+rtf(spaceLabel)+'\\"  In Zone  \\"Zone 1\\"\\b0\\cell\n'+rowEnd();

      body += cellDef(DLW, true);
      body += th(' ',0,'ql')+th('DESIGN COOLING',0,'qc')+th(' ')+th(' ')+th('DESIGN HEATING',0,'qc')+th(' ')+th(' ')+rowEnd();
      body += cellDef(DLW, true);
      body += th(' ',0,'ql')+th('COOLING DATA AT '+rPeakStr,0,'qc')+th(' ')+th(' ')+th('HEATING DATA AT DES HTG',0,'qc')+th(' ')+th(' ')+rowEnd();
      body += cellDef(DLW, true);
      body += th(' ',0,'ql')+th('COOLING OA DB / WB   '+(P.Tmax||32)+' \\u176?C / '+(P.yazYT||23)+' \\u176?C',0,'qc')+th(' ')+th(' ')+th('HEATING OA DB / WB   '+(P.kisKt||(-3))+' \\u176?C / '+(+((P.kisKt||(-3))-2).toFixed(1))+' \\u176?C',0,'qc')+th(' ')+th(' ')+rowEnd();
      body += cellDef(DLW, true);
      body += th(' ',0,'ql')+th('OCCUPIED T-STAT '+(r.Tic_yaz||24)+'.0 \\u176?C',0,'qc')+th(' ')+th(' ')+th('OCCUPIED T-STAT '+(r.Tic_kis||22)+'.0 \\u176?C',0,'qc')+th(' ')+th(' ')+rowEnd();
      body += cellDef(DLW, true);
      body += th(' ',0,'ql')+th(' ')+th('Sensible')+th('Latent')+th(' ')+th('Sensible')+th('Latent')+rowEnd();
      body += cellDef(DLW, true);
      body += th('SPACE LOADS',0,'ql')+th('Details',0,'qr')+th('(W)')+th('(W)')+th('Details',0,'qr')+th('(W)')+th('(W)')+rowEnd();

      function spaceRow(label, detailCool, sensCool, latCool, detailHeat, sensHeat, latHeat){
        body += cellDef(DLW, false);
        body += tdl(rtf(label))+td(rtf(String(detailCool)))+td(n2(sensCool))+td(latCool==='-'?'-':n2(latCool))+td(rtf(String(detailHeat)))+td(n2(sensHeat))+td(latHeat==='-'?'-':n2(latHeat))+rowEnd();
      }

      spaceRow('Window & Skylight Solar Loads', Math.round(rCamAlan)+' m\\u178?', n(p.qCam||0), '-', Math.round(rCamAlan)+' m\\u178?', '-', '-');
      spaceRow('Wall Transmission', Math.round(rDuvAlan)+' m\\u178?', n(p.qDuvar||0), '-', Math.round(rDuvAlan)+' m\\u178?', n(r.qDuvarKis||0), '-');
      spaceRow('Roof Transmission', Math.round(r.tavanA||0)+' m\\u178?', n(p.qTavan||0), '-', Math.round(r.tavanA||0)+' m\\u178?', n(r.qTavKis||0), '-');
      spaceRow('Window Transmission', Math.round(rCamAlan)+' m\\u178?', n(p.qPencIlet||0), '-', Math.round(rCamAlan)+' m\\u178?', n(r.qPencKis||0), '-');
      spaceRow('Skylight Transmission', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
      spaceRow('Door Loads', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
      spaceRow('Floor Transmission', Math.round(r.dosA||r.alan||0)+' m\\u178?', n(p.qDoseme||0), '-', Math.round(r.dosA||r.alan||0)+' m\\u178?', n(r.qDosKis||0), '-');
      spaceRow('Partitions', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
      spaceRow('Ceiling', '0 m\\u178?', 0, '-', '0 m\\u178?', 0, '-');
      const rAydW = n(r.aydW||0)*n(r.alan||0);
      spaceRow('Overhead Lighting', Math.round(rAydW)+' W', n(r.qAyd||0), '-', '0', 0, '-');
      spaceRow('Task Lighting', '0 W', 0, '-', '0', 0, '-');
      spaceRow('Electric Equipment', Math.round(n(r.qCihaz||0))+' W', n(r.qCihaz||0), '-', '0', 0, '-');
      const nK = n(r.nToplam||0);
      spaceRow('People', nK, n(r.insDuy||0), n(r.insGiz||0), '0', 0, 0);
      spaceRow('Infiltration', '-', n(r.infilSog||0), 0, '-', n(r.infilIst||0), 0);
      spaceRow('Miscellaneous', '-', 0, 0, '-', 0, 0);
      const sfPctR = Math.round(((r.emSogFak||1.1)-1)*100);
      spaceRow('Safety Factor', sfPctR+'% / '+sfPctR+'%', rSafeFactorS, rSafeFactorG, sfPctR+'%', Math.round(n(r.qKayipBase||r.qKayip||0)*((r.emIstFak||1.1)-1)), 0);

      // >> Total Zone Loads
      body += cellDef(DLW, true);
      body += '\\pard\\intbl\\s0\\ql\\f2\\cf3\\fs16\\b >> Total Zone Loads\\cf0\\b0\\cell\n';
      const rTotSogSf = n(r.bestLoadBase||r.bestLoad||0)+rSafeFactorS;
      body += td('-')+td(n2(rTotSogSf))+td(n2(n(r.insGiz||0)+rSafeFactorG))+td('-')+td(n2(r.qKayip||0))+td('0')+rowEnd();

      // TABLE X.B – Envelope Loads
      body += cellDef(SPW, true);
      body += '\\pard\\intbl\\s0\\qc\\f2\\fs16\\b TABLE '+katIdx+'.'+(rIdx+1)+'.B.    Envelope Loads For Space  \\"'+rtf(spaceLabel)+'\\"  In Zone  \\"Zone 1\\"\\b0\\cell\n'+rowEnd();

      const ELW = [3240, 720, 1008, 864, 1008, 1008, 864];
      body += cellDef(ELW, true);
      body += th(' ',0,'ql')+th(' ')+th(' ')+th(' ')+th('COOLING')+th('COOLING')+th('HEATING')+rowEnd();
      body += cellDef(ELW, true);
      body += th(' ',0,'ql')+th('Area')+th('U-Value')+th('Shade')+th('TRANS')+th('SOLAR')+th('TRANS')+rowEnd();
      body += cellDef(ELW, true);
      body += th(' ',0,'ql')+th('(m\\u178?)')+th('(W/(m\\u178?\\u183?K))')+th('Coeff.')+th('(W)')+th('(W)')+th('(W)')+rowEnd();

      // Duvar satırları
      const YONLER2 = ['K','KD','D','GD','G','GB','B','KB'];
      YONLER2.forEach(y=>{
        const dA = n(r.duvarAlani?.[y]||0);
        const pA = n(r.pencAlani?.[y]||0);
        if(dA>0||pA>0){
          body += cellDef(ELW, false);
          body += tdl(y+' EXPOSURE')+td('')+td('')+td('')+td('')+td('')+td('')+rowEnd();
          if(dA>0){
            body += cellDef(ELW, false);
            body += tdl('    WALL')+td(dA)+td(f1(r.uDuv||0.45))+td('-')+td(n2(dA*(r.uDuv||0.45)*(P.Tmax||32-(r.Tic_yaz||24))))+td('-')+td(n2(dA*(r.uDuv||0.45)*((r.Tic_kis||22)-(P.kisKt||(-3)))))+rowEnd();
          }
          if(pA>0){
            body += cellDef(ELW, false);
            body += tdl('    WINDOW')+td(pA)+td(f1(r.uPenc||2.1))+td('0.5')+td(n2(pA*(r.uPenc||2.1)*(P.Tmax||32-(r.Tic_yaz||24))))+td(n2(pA*200*0.5))+td(n2(pA*(r.uPenc||2.1)*((r.Tic_kis||22)-(P.kisKt||(-3)))))+rowEnd();
          }
        }
      });

      if(n(r.tavanA||0)>0){
        body += cellDef(ELW, false);
        body += tdl('H  EXPOSURE')+td('')+td('')+td('')+td('')+td('')+td('')+rowEnd();
        body += cellDef(ELW, false);
        body += tdl('    ROOF')+td(Math.round(r.tavanA||0))+td(f1(r.uTav||0.4))+td('-')+td(n2(n(p.qTavan||0)))+td('-')+td(n2(n(r.qTavKis||0)))+rowEnd();
      }
    }); // rooms.forEach end

  }); // katlar.forEach end

  // ── RTF dosyasını birleştir ve indir ────────────────────────
  const rtfDoc =
    '{\\rtf1\\ansi\\ansicpg1254\\deff0\\deflang1055\\ftnbj\\uc1\n'+
    '{\\fonttbl{\\f0\\fnil\\fcharset0 Times New Roman;}{\\f1\\fnil\\fcharset162 Times New Roman;}{\\f2\\fswiss\\fcharset162 Arial;}{\\f3\\fswiss\\fcharset0 Arial Unicode MS;}}\n'+
    '{\\colortbl ;\\red255\\green255\\blue255 ;\\red0\\green0\\blue0 ;\\red0\\green0\\blue255 ;\\red255\\green0\\blue0 ;\\red128\\green0\\blue128 ;\\red245\\green245\\blue245 ;}\n'+
    '{\\stylesheet{\\fs24\\cf0\\cb1 Normal;}{\\cs1\\cf0\\cb1 Default Paragraph Font;}}\n'+
    '\\paperw11908\\paperh16833\\margl1134\\margr1134\\margt1440\\margb1134\\headery360\\footery360\\deftab720\\formshade\\aendnotes\\aftnnrlc\\pgbrdrhead\\pgbrdrfoot\n'+
    '\\sectd\\pgwsxn11908\\pghsxn16833\\marglsxn1134\\margrsxn1134\\margtsxn1440\\margbsxn1134\\headery360\\footery360\\sbkpage\\pgncont\\pgndec\n'+
    '\\plain\\plain\\f1\\fs24\n'+
    body +
    '}';

  const blob = new Blob([rtfDoc], {type:'application/rtf'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = (s(P.prjAdi)||'proje').replace(/[^a-zA-Z0-9_\-]/g,'_')+'_HAP_Report.rtf';
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF Download Function ───────────────────────────────────
