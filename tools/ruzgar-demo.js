const fs=require('fs'),vm=require('vm'),path=require('path');
const jsDir=path.join(__dirname,'..','HVAC_Pro_v8','js');
const noop=()=>{}; const fe=()=>new Proxy(function(){},{get:(t,k)=>k==='style'?{}:k==='classList'?{add:noop,remove:noop,toggle:noop,contains:()=>false}:()=>null,set:()=>true,apply:()=>null});
const ctx={document:{getElementById:()=>fe(),querySelector:()=>fe(),querySelectorAll:()=>[],createElement:()=>fe(),addEventListener:noop,body:fe()},console:{log:noop,warn:noop,error:noop},localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},XLSX:{},navigator:{language:'tr'},alert:noop,confirm:()=>true,setTimeout:noop,LANG:'tr'};
ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['device-db.js','calc-engine.js']) vm.runInContext(fs.readFileSync(path.join(jsDir,f),'utf8'),ctx,{filename:f});
const row={mahalNo:'G01-001',mahalAdi:'Ofis',alan:20,h:3,duvarU:0.45,pencereU:2.1,'tavan u değeri':0.35,'döşeme u değeri':0.5,'pencere gölgeleme kaysayısı':0.5,'güney dış duvar alanı':10,'güney dış pencere alanı':4,'tavan alanı':20,'döşeme alanı':20,'oturan kişi':2,'aydınlatma yükü':12,Tic_yaz:24,Tic_kis:22};
const baseP={Tmax:35,yazYT:24,DR:10,kisKt:-6,icKtYaz:24,icKtKis:22,icNem:50,shgc:0.6,emSog:10,emIst:10,thKatsayi:1.5,thSogEkle:true,thIstEkle:true,infilEkle:true,icUniteTip:'FCU_ORTA_KANAL',igkVerim:0,effZam:1,odaZam:1,fAyd:1};
const run=(zam,hiz)=>ctx.hesaplaMahalV5(row,Object.assign({},baseP,{ruzgarZam:zam,ruzgarHiz:hiz}),null);
const bug=run(3.5,3.5);      // ESKİ HATA: transmisyon ×3.5
const fix=run(1.00,3.5);     // DÜZELTİLMİŞ: korunaklı ×1.00, hız 3.5 (infil aynı)
const windy=run(1.07,10);    // rüzgarlı ×1.07 + yüksek hız 10 m/s (infil artar)
const P=(x)=>x.toFixed(1);
console.log('Senaryo                         | Isı kaybı(qKayip) | Transmisyon taban | İnfiltrasyon');
console.log('ESKİ (hatalı, transmisyon×3.5)  | '+P(bug.qKayip)+' W       | '+P(bug.qKayipBase)+' W        | '+P(bug.infilIst)+' W');
console.log('YENİ (düzeltilmiş, ×1.00, 3.5)  | '+P(fix.qKayip)+' W        | '+P(fix.qKayipBase)+' W         | '+P(fix.infilIst)+' W');
console.log('YENİ (rüzgarlı ×1.07, 10 m/s)   | '+P(windy.qKayip)+' W       | '+P(windy.qKayipBase)+' W         | '+P(windy.infilIst)+' W');
console.log('\nDüzeltmenin ısı kaybına etkisi (×3.5 -> ×1.00): %'+(((bug.qKayip-fix.qKayip)/bug.qKayip)*100).toFixed(0)+' azalma');
console.log('Rüzgâr hızı infiltrasyona etkisi (3.5 -> 10 m/s): infil '+P(fix.infilIst)+' -> '+P(windy.infilIst)+' W');
