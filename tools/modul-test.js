// HVAC Hesap Pro — Modul Sozlesme / Smoke Testi
// modules.js'i headless yukler, her modulun tanimli+cagrilabilir oldugunu,
// ana fonksiyonlarin calisip nesne dondurdugunu ve UI'nin bekledigi FanSelect
// duz alanlarinin (tip/motor_kW/verim) VAR oldugunu dogrular.
const fs=require('fs'),vm=require('vm'),path=require('path');
const jsDir=path.join(__dirname,'..','HVAC_Pro_v8','js');
const R=m=>process.stdout.write(m+'\n');
const noop=()=>{}; const fe=()=>new Proxy(function(){},{get:(t,k)=>k==='style'?{}:k==='classList'?{add:noop,remove:noop,toggle:noop,contains:()=>false}:()=>null,set:()=>true,apply:()=>null});
const ctx={document:{getElementById:()=>fe(),querySelector:()=>fe(),querySelectorAll:()=>[],createElement:()=>fe(),addEventListener:noop,body:fe()},console:{log:noop,warn:noop,error:noop},localStorage:{getItem:()=>null,setItem:noop,removeItem:noop},XLSX:{},navigator:{language:'tr'},alert:noop,confirm:()=>true,setTimeout:noop,LANG:'tr',Chart:function(){}};
ctx.window=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
try{ vm.runInContext(fs.readFileSync(path.join(jsDir,'modules.js'),'utf8'),ctx,{filename:'modules.js'}); }
catch(e){ R('YUKLEME HATASI: '+e.message); process.exit(1); }

let fail=0; const ok=(a,k)=>{R((k?'  OK   ':'  KALDI ')+a);if(!k)fail++;};
const mods={PressureLoss:['select','renderTable'],EnergyEstimate:['calculate','renderCard'],TS825Check:['check','renderReport'],DuctSizing:['calcCircular','calcNetwork'],UFHCalc:['calc','renderCard'],ChillerSelect:['select','renderCard'],FanSelect:['select','renderCard'],Psychro:[]};

R('MODUL SOZLESME TESTI'); R('='.repeat(52));
R('\n1) Moduller tanimli ve metotlar mevcut:');
for(const m in mods){ ok(m+' tanimli', !!ctx[m]); mods[m].forEach(fn=>ok('  '+m+'.'+fn, ctx[m]&&typeof ctx[m][fn]==='function')); }

R('\n2) Ana fonksiyonlar calisiyor + nesne donuyor:');
function calisir(ad,fn){ try{const r=fn(); const good=r&&typeof r==='object'; R((good?'  OK   ':'  BILGI ')+ad+' -> '+(good?('{'+Object.keys(r).slice(0,6).join(',')+(Object.keys(r).length>6?',...':'')+'}'):String(r))); if(!good) return null; return r;}catch(e){R('  BILGI '+ad+' -> hata: '+e.message.slice(0,40)); return null;} }
calisir('PressureLoss.select(10,5,10,1.5)', ()=>ctx.PressureLoss.select(10,5,10,1.5));
calisir('ChillerSelect.select(50,1.15)',   ()=>ctx.ChillerSelect.select(50,1.15,'auto'));
calisir('DuctSizing.calcCircular(200)',    ()=>ctx.DuctSizing.calcCircular(200,0.8,'galvaniz'));
const fanRes=calisir('FanSelect.select(5000,200)', ()=>ctx.FanSelect.select(5000,200));

R('\n3) FanSelect UI-uyum adaptoru (kritik — daha once uyumsuzdu):');
ok('res.tip var',      fanRes && 'tip' in fanRes);
ok('res.motor_kW var', fanRes && 'motor_kW' in fanRes);
ok('res.verim var',    fanRes && 'verim' in fanRes);
ok('res.results[] korundu', fanRes && Array.isArray(fanRes.results));

R("\n4) PressureLoss UI-uyum alanlari (daha once uyumsuzdu):");
const plRes=ctx.PressureLoss.select(50,5,50,1.5);
ok('res.dP_Pa_m var', plRes && 'dP_Pa_m' in plRes);
ok('res.dP_total_kPa var', plRes && 'dP_total_kPa' in plRes);
ok('res.m_dot_kgh var', plRes && 'm_dot_kgh' in plRes);

R('\n5) Canli UI sozlesme alanlari (tum moduller kilit):');
const en=ctx.EnergyEstimate.calculate([{bestLoad:2850,qKayip:1906}],'fancoil',4.5);
['topSog_kW','eer','cop','kWhToplam','maliyetToplam','co2_ton'].forEach(k=>ok('EnergyEstimate.'+k, en&&k in en));
const ch2=ctx.ChillerSelect.select(100,1.15,'auto'); const cand=ch2&&ch2.candidates&&ch2.candidates[0];
['model','COP','ec','sogutici'].forEach(k=>ok('ChillerSelect.cand.'+k, cand&&k in cand));
const ps=ctx.Psychro.stateFromRH(24,50);
['T','RH','W','h','T_cig'].forEach(k=>ok('Psychro.'+k, ps&&k in ps));
const dc=ctx.DuctSizing.calcCircular(200,0.8,'galvaniz');
['D_std_mm','rect_a','rect_b','v','R_actual','Re'].forEach(k=>ok('DuctSizing.'+k, dc&&k in dc));

R('\n'+'='.repeat(52));
R(fail===0?'MODUL SOZLESME TESTI GECTI.':'MODUL TESTI: '+fail+' KALDI.');
process.exit(fail?1:0);
