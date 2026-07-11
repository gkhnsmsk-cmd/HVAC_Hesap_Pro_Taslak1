// HVAC Hesap Pro — GOLDEN Regresyon Testi (GENISLETILMIS)
// Kullanicinin GERCEK dogrulanmis raporundan (HVAC_MTH_PRJ_2026-07-11_EN, HEAT LOSS sayfasi)
// alinan deterministik degerleri kilitler: 5 cesitli mahalde catı/döşeme/duvar transmisyonu
// + RÜZGÂR ×1.00 kilidi (kritik hata düzeltmesinin bekcisi). Tum mahallerde ic=20, ΔT=23, ruzgar=1.00.
const fs=require('fs'),vm=require('vm'),path=require('path');
const jsDir=path.join(__dirname,'..','HVAC_Pro_v8','js');
const R=m=>process.stdout.write(m+'\n');
const noop=()=>{}; const fe=()=>new Proxy(function(){},{get:(t,k)=>k==='style'?{}:k==='classList'?{add:noop,remove:noop,toggle:noop,contains:()=>false}:()=>null,set:()=>true,apply:()=>null});
const ctx={document:{getElementById:()=>fe(),querySelector:()=>fe(),querySelectorAll:()=>[],createElement:()=>fe(),addEventListener:noop,body:fe()},console:{log:noop,warn:noop,error:noop},localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},XLSX:{},navigator:{language:'tr'},alert:noop,confirm:()=>true,setTimeout:noop,LANG:'tr'};
ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['device-db.js','calc-engine.js']) vm.runInContext(fs.readFileSync(path.join(jsDir,f),'utf8'),ctx,{filename:f});

const P0={Tmax:33,yazYT:24,DR:10,kisKt:-3,icKtYaz:24,icKtKis:20,icNem:50,shgc:0.87,
  emSog:10,emIst:10,ruzgarZam:1.00,ruzgarHiz:3.5,thKatsayi:0.05,
  thSogEkle:true,thIstEkle:true,infilEkle:true,icUniteTip:'FCU_ORTA_KANAL',igkVerim:0,effZam:1,odaZam:1,fAyd:1};

// gercek rapordan (HEAT LOSS): At=cati alani, Ad=doseme alani, Aw=duvar alani, Ap=pencere alani
// beklenen: qtav(catı Q), qdos(döşeme Q), qduv(duvar Q), qpen, sub(ΣTransmisyon = qKayipBase, ruzgar×1.00)
const cases=[
  {no:'G01-001',ad:'ENTRANCE HALL',   At:26.5,Ad:26.5,Aw:0,   Ap:0, qtav:213,qdos:274,qduv:0,  sub:487},
  {no:'G01-002',ad:'ELECTRICAL ROOM', At:7.8, Ad:7.8, Aw:0,   Ap:0, qtav:63, qdos:81, qduv:0,  sub:144},
  {no:'G01-005',ad:'WOMENS LOCKER',   At:18.6,Ad:18.6,Aw:18.0,Ap:0, qtav:150,qdos:193,qduv:186,sub:529},
  {no:'G01-010',ad:'DEEP FREEZER',    At:74.9,Ad:74.9,Aw:0,   Ap:0, qtav:603,qdos:775,qduv:0,  sub:1378},
  {no:'G01-022',ad:'COOKING AREA',    At:21.7,Ad:21.7,Aw:21.0,Ap:0, qtav:175,qdos:225,qduv:217,sub:617},
];

let fail=0;
const yakin=(ad,val,hedef,tol)=>{const ok=Math.abs(val-hedef)<=tol;if(!ok){R('    KALDI '+ad+': '+val.toFixed(1)+' != '+hedef+' (±'+tol+')');fail++;}return ok;};

R('GOLDEN — 5 GERCEK MAHAL (dogrulanmis rapor)'); R('='.repeat(58));
for(const c of cases){
  const row={mahalNo:c.no,mahalAdi:c.ad,alan:c.Ad,h:3,
    'tavan u değeri':0.35,'döşeme u değeri':0.45,duvarU:0.45,pencereU:2.1,
    'tavan alanı':c.At,'döşeme alanı':c.Ad,'güney dış duvar alanı':c.Aw,'güney dış pencere alanı':c.Ap,
    Tic_yaz:24,Tic_kis:20,'oturan kişi':0,'aydınlatma yükü':10};
  const r=ctx.hesaplaMahalV5(row,P0,null);
  const wind=r.qKayipBase-(r.tavanQis+r.dosemeQis+r.duvarQis+r.pencereQis+(r.skylightQis||0));
  let hepOk=true;
  hepOk&=yakin(c.no+' catı',   r.tavanQis, c.qtav, 1.5);
  hepOk&=yakin(c.no+' döşeme', r.dosemeQis,c.qdos, 1.5);
  if(c.qduv>0) hepOk&=yakin(c.no+' duvar', r.duvarQis, c.qduv, 1.5);
  hepOk&=yakin(c.no+' qKayipBase(ΣTr)', r.qKayipBase, c.sub, 2.0);
  const windOk=Math.abs(wind)<0.6; if(!windOk){R('    KALDI '+c.no+' RÜZGÂR: eki='+wind.toFixed(1)+' (0 olmali)');fail++;}
  R((hepOk&&windOk?'  ✓ ':'  ✗ ')+c.no+' '+c.ad+'  (catı '+r.tavanQis.toFixed(0)+', döşeme '+r.dosemeQis.toFixed(0)+(c.qduv>0?', duvar '+r.duvarQis.toFixed(0):'')+', ΣTr '+r.qKayipBase.toFixed(0)+', rüzgar×1.00)');
}
R('\n'+'='.repeat(58));
R(fail===0?'GOLDEN GECTI — motor 5 gercek mahalin transmisyon+rüzgar degerlerini koruyor.':'GOLDEN: '+fail+' KALDI — motor ciktisi degisti!');
process.exit(fail?1:0);
