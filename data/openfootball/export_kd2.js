const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2], out=process.argv[3];
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]); if(p==='/support.js'){r.setHeader('content-type','text/javascript');return r.end(fs.readFileSync(path.join(__dirname,'support.js')));} const f=path.join(root,p); if(fs.existsSync(f)&&fs.statSync(f).isFile()){r.setHeader('content-type',f.endsWith('.js')?'text/javascript':'text/html; charset=utf-8');return r.end(fs.readFileSync(f));} r.statusCode=404;r.end();}).listen(0,async()=>{
 const port=srv.address().port; const b=await chromium.launch({args:['--no-sandbox']}); const pg=await b.newPage();
 pg.setDefaultTimeout(180000);
 await pg.goto(`http://localhost:${port}/VeriEditoru.dc.html`);
 for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>window.__veGen&&window.__veGen.VIRT&&window.__veGen.VIRT.done)) break; }
 const slugOf=s=>String(s).replace(/ı/g,'i').replace(/İ/g,'I').normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 const countries=await pg.evaluate(()=>{const m={}; window.__veGen.ENT.kulup.recs.forEach(r=>{m[r.ulke]=1}); return Object.keys(m)});
 fs.mkdirSync(out,{recursive:true}); let n=0;
 const INFO=['bakiye','borc','kisaBorc','faiz','kisitlama','transfer','maasButce','yayin','sponsor','bilet','zengin','profil','taraftar','tanin','kurulus','stadyum','kapasite','sehir','itibar','tesis','altyapi','gozlem','rakip','maliDurum','e_ana','e_ikinci','ku_lig','ku_kupa','ku_superkupa','ku_kitasal','ku_dunya','kupaGecmisi','rkGalibiyet','rkYenilgi','rkMacOyuncu','rkGolOyuncu','rkSezonGol','rkSezonPuan','rkSeyirci','rkTransferAlinan','rkTransferSatilan','rkYenilmez','rkSeri','tf_sayi','tf_ortSeyirci','tf_ultra','tf_kimlik','tf_atmosfer','tf_sadakat','tf_baski','tf_genc','tf_deplasman','tf_sosyal','tk_dizilis','tk_stil','tk_hucum','tk_tempo','tk_pres','tk_cizgi','tk_genislik','tk_setparca','tk_felsefe','hd_ana','hd_kupa','hd_kitasal','hd_mali','hd_transfer','hd_puan','hd_sabir','hd_plan','ak_ad','ak_kurulus','ak_kalite','ak_antrenor','ak_tesis','ak_sporcu','ak_yaslar','ak_okul','ak_mezun','ksToplam','ksEnIyi','ksKatilim','ksSampiyon','ks_0','ks_1','ks_2','ks_3','ks_4'];
 const ULK=['ad','konf','sira','puan','ulkeItibar','sl','al','kl','fifaSira','fifaPuan','itibar','cekicilik','calismaIzni','cifte','vatToplam','kadroYabanci','sahaYabanci','kimlerYabanci','yerliSart','altLig','regenTarih','regenSayi','regenKalite','regenYas'];
 for (const c of countries){
   const res=await pg.evaluate(([c,INFO,ULK])=>{const g=window.__veGen, V=g.VIRT, E=g.ENT; const clubs={}; (V.byCountry[c]||[]).forEach(k=>{ if(!k.endsWith('|A')||!V.oyuncu[k]) return; const club=k.split('|')[0]; clubs[club]=V.oyuncu[k].map(p=>{const r=[p[0],+String(p[1]).slice(-4),p[2],p[4],p[5],p[11],p[12],Math.round(p[9]||0),String(p[10]||'').slice(-4),p[8]]; if(p.length>24){ r.push(p[24]||0, p[26]||'', p[14]||0, p[15]||0); } return r;}).sort((a,b)=>b[5]-a[5]); });
     const info={}; const ligs={}; E.kulup.recs.filter(r=>r.ulke===c).forEach(r=>{ const o={}; INFO.forEach(k=>{ const v=r[k]; if(v!==undefined&&v!==''&&v!==0&&v!=='Belirsiz'&&v!=='Bilinmiyor') o[k]=v; }); info[r.ad]=o; (ligs[r.lig]=ligs[r.lig]||[]).push(r.ad); });
     const staff={}; (V.byCountry[c]||[]).forEach(k=>{ if(!k.endsWith('|S')||!V.personel[k]) return; const club=k.split('|')[0]; staff[club]=V.personel[k].map(q=>[q[0],+String(q[1]).slice(-4),q[2],q[3],String(q[5]||'').slice(-4),q[6],q[7],q[8]]); });
     E.personel.recs.forEach(q=>{ if(q.kulup && info[q.kulup] && (!q.kulupUlke||q.kulupUlke===c)){ (staff[q.kulup]=staff[q.kulup]||[]).push([q.ad,+String(q.dogum||'').slice(-4),q.uyruk,q.gorev,String(q.sozlesme||'').slice(-4),q.lisans,q.itibar,q.tanin]); } });
     const stad={}; E.stadyum.recs.forEach(x=>{ if(x.kulup && info[x.kulup]){ const o={}; ['ad','kapasite','oturmali','zemin','cati','boyut','acilis','uefa','sahip','sponsorAd','isitma','ortSeyirci','rekSeyirci','avantaj','atmosfer'].forEach(k=>{const v=x[k]; if(v!==undefined&&v!==''&&v!==0&&v!=='Bilinmiyor') o[k]=v;}); stad[x.kulup]=o; } });
     const u=E.ulke.recs.find(x=>x.ad===c); const ulke={}; if(u) ULK.forEach(k=>{ if(u[k]!==undefined&&u[k]!==''&&u[k]!==null) ulke[k]=u[k]; });
     return {clubs,info,ligs,ulke,staff,stad};},[c,INFO,ULK]);
   n+=Object.values(res.clubs).reduce((a,v)=>a+v.length,0);
   fs.writeFileSync(`${out}/${slugOf(c)}.json`,JSON.stringify(res));
 }
 const tur=await pg.evaluate(()=>{const K=['ad','tur','org','statu','kademe','itibar','tanin','odul','odulPB','takim','grup','devre','dogrudan','playoff','dusen','katilim','kita','ulke','var','trk_enCokSampiyon','trk_enBuyukGalibiyet','trk_enCokGolAtan','trk_enCokMac','trk_sezonGol','trk_sezonPuan','trk_enCokSeyirci','gecmisKazananlar','katilanKulup','katilanMilli']; return window.__veGen.ENT.lig.recs.map(r=>{const o={}; K.forEach(k=>{const v=r[k]; if(v!==undefined&&v!==''&&v!==0&&!(Array.isArray(v)&&!v.length)) o[k]=v;}); return o;});});
 fs.writeFileSync(`${out}/_turnuvalar.json`,JSON.stringify(tur));
 console.log('ülke',countries.length,'oyuncu',n,'turnuva',tur.length);
 await b.close(); srv.close(); });
