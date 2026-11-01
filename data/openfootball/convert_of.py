import json,re,unicodedata,difflib,collections,datetime,sys
S='/tmp/claude-0/-home-user/40c86c58-3073-56d3-84a4-03d91ce05a6c/scratchpad'
d=json.load(open('/tmp/ofdb/db.bin',encoding='utf-8')); cm=json.load(open('/tmp/ofdb/cmap.json',encoding='utf-8'))
ours=json.load(open(S+'/clubdb.json',encoding='utf-8'))
STOP={'fc','cf','sc','ac','as','afc','fk','sk','bk','if','ik','sv','vfb','vfl','tsv','club','de','del','la','el','the','real','sporting','cd','ud','sd','ca','cs','nk','gnk','hnk','fsv','ssc','us','og','rc','ogc','sco','ec','esporte','clube','associacao','atletico','athletic'}
def norm(s):
    s=unicodedata.normalize('NFKD',s.replace('ı','i').replace('İ','I').replace('ø','o').replace('ł','l').replace('ß','ss')).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9 ]+',' ',s).split()
def key(s): return ''.join(w for w in norm(s) if w not in STOP) or ''.join(norm(s))
byc=collections.defaultdict(dict)
for c,v in ours.items():
    for l in v:
        for n in l[2]: byc[c].setdefault(key(n),[]).append((n,l[0]))
cmatch={}  # their club id -> (ourName, ourCountry)
for c in d['clubs']:
    cn=cm.get(c['country_code'])
    if not cn or cn not in byc: continue
    k=key(c['name']); hit=byc[cn].get(k); how='tam'
    if not hit:
        cands=difflib.get_close_matches(k,list(byc[cn].keys()),n=1,cutoff=0.85)
        if cands: hit=byc[cn][cands[0]]; how='benzer'
    if not hit:
        for kk,v in byc[cn].items():
            if len(k)>=5 and len(kk)>=5 and (k in kk or kk in k): hit=v; how='içerir'; break
    if hit and (how=='tam' or len(hit)==1): cmatch[c['id']]=(hit[0][0],cn,hit[0][1])
print('eşleşen kulüp',len(cmatch))
teams={}; clubs={}
for c in d['clubs']:
    clubs[c['id']]=c
    for t in c['teams']: teams[t['id']]=(c,t)
hist={h['id']:h['name'] for h in d['history_clubs']}
countries={c['id']:c for c in d['countries']}
def club_of(cid):
    if cid in teams: return teams[cid][0]
    return clubs.get(cid)
def team_type(cid):
    if cid in teams: return teams[cid][1]['team_type']
    return 'Main' if cid in clubs else None
def club_name(cid):
    c=club_of(cid)
    if c:
        m=cmatch.get(c['id']); return m[0] if m else c['name']
    return hist.get(cid,'Bilinmeyen kulüp')
MEV={'GK':'Kaleci','DC':'Stoper','DR':'Sağ bek','WBR':'Sağ bek','DL':'Sol bek','WBL':'Sol bek','DM':'Ön libero','MC':'Merkez orta saha','AMC':'Ofansif orta saha','AMR':'Sağ kanat','MR':'Sağ kanat','AML':'Sol kanat','ML':'Sol kanat','ST':'Santrfor'}
MV_ORDER=['Kaleci','Stoper','Sağ bek','Sol bek','Ön libero','Merkez orta saha','Ofansif orta saha','Sağ kanat','Sol kanat','Santrfor']
TECH={'cro':'Orta','dri':'Dribbling','fin':'Bitiricilik','hea':'Kafa','lon':'Uzaktan şut','mar':'Markaj','pas':'Pas','pen':'Penaltı','tck':'Top kesme','fir':'İlk dokunuş','tec':'Teknik','cor':'Korner','lth':'Uzun taç atışı','fre':'Serbest vuruş'}
MENT={'otb':'Topsuz hareket','vis':'Vizyon','ant':'Önsezi','dec':'Karar alma','pos':'Pozisyon alma','fla':'Yaratıcılık','tea':'Takım oyunu','wor':'Çalışkanlık','ldr':'Liderlik','bra':'Cesaret','agg':'Agresiflik','det':'Kararlılık','cmp':'Soğukkanlılık','cnt':'Konsantrasyon'}
PHYS={'acc':'Hızlanma','str':'Güç','sta':'Dayanıklılık','pac':'Hız','jum':'Zıplama','bal':'Denge','agi':'Çeviklik','nat':'Doğal form'}
GKM={'aer':'Hava hakimiyeti','cmd':'Alan hakimiyeti','kic':'Ayakla oyun','thr':'Elle atış','ecc':'Garip hareketler'}
AT_TECH=['Bitiricilik','Dribbling','İlk dokunuş','Orta','Pas','Uzaktan şut','Top kesme','Markaj','Kafa','Teknik','Korner','Serbest vuruş','Penaltı','Uzun taç atışı']
AT_MENT=['Karar alma','Önsezi','Pozisyon alma','Liderlik','Soğukkanlılık','Çalışkanlık','Takım oyunu','Agresiflik','Cesaret','Konsantrasyon','Kararlılık','Yaratıcılık','Topsuz hareket','Vizyon']
AT_PHYS=['Hız','Hızlanma','Çeviklik','Dayanıklılık','Güç','Denge','Zıplama','Doğal form','Sakatlık direnci']
AT_GK=['Hava hakimiyeti','Alan hakimiyeti','İletişim','Garip hareketler','Top tutma','Ayakla oyun','Teke tek','Refleks','Çıkış','Elle atış']
ORDER=AT_TECH+AT_MENT+AT_PHYS+AT_GK
def dmy(s):
    try: y,m,dd=s.split('-'); return '%s.%s.%s'%(dd,m,y)
    except: return ''
def clampi(x,lo=1,hi=20): return max(lo,min(hi,int(round(x))))
out=[]; stats=collections.Counter(); seen=set()
for p in d['players']:
    cid=p.get('club_id')
    if not cid: stats['kulüpsüz']+=1; continue
    c=club_of(cid)
    if not c or c['id'] not in cmatch: stats['kulübü eşleşmeyen']+=1; continue
    ad,cn,lig=cmatch[c['id']]
    tt=team_type(cid) or 'Main'
    takim='A takım' if tt=='Main' else 'Rezerv' if tt in ('B','Second') else 'U19'
    name=(p['first_name']+' '+p['last_name']).strip()
    if (name,ad,cn) in seen: stats['tekrar']+=1; continue
    seen.add((name,ad,cn))
    pos=sorted(p['positions'],key=lambda x:-x['level']); main=MEV.get(pos[0]['code'],'Merkez orta saha') if pos else 'Merkez orta saha'
    mv=[0]*10
    for x in p['positions']:
        m=MEV.get(x['code']); 
        if m: i=MV_ORDER.index(m); mv[i]=max(mv[i],x['level'])
    f=p.get('foots') or {}; l,r=f.get('left',0),f.get('right',0)
    ayak='İki ayak' if min(l,r)>=80 else 'Sol' if l>r else 'Sağ'
    ca=p['current_ability']; pa=p['potential_ability']; guc=clampi(ca/10); pot=max(guc,clampi(pa/10)) if pa and pa>0 else guc
    ctry=cm.get(countries.get(p['country_id'],{}).get('code'),None) or 'Türkiye'
    inter=p.get('international') or {}
    mm=inter.get('apps',0) or 0; mg=inter.get('goals',0) or 0
    # öznitelikler
    attrs=[0]*47; a=(p.get('attrs') or {}); pl=a.get('player') or {}
    idx={k:i for i,k in enumerate(ORDER)}
    for grp,mp in (('technical',TECH),('mental',MENT),('physical',PHYS),('goalkeeping',GKM)):
        for code,v in (pl.get(grp) or {}).items():
            if code in mp: attrs[idx[mp[code]]]=clampi(v)
    hid=pl.get('hidden') or {}; per=a.get('person') or {}
    if 'inj' in hid: attrs[idx['Sakatlık direnci']]=clampi(21-hid['inj'])
    dv=[clampi(per.get('tem')) if 'tem' in per else 0, clampi(per.get('con')) if 'con' in per else 0, clampi(hid.get('dir')) if 'dir' in hid else 0, clampi(hid.get('imp')) if 'imp' in hid else 0]
    if not any(attrs): attrs=0
    # geçmiş
    lines=[]; grp=[]
    for h in (p.get('history') or []):
        nm=club_name(h['c'])
        if grp and grp[-1]['n']==nm and grp[-1]['to']==h['s']: grp[-1]['to']=h['s']+1; grp[-1]['p']+=h.get('p',0); grp[-1]['g']+=h.get('g',0)
        else: grp.append({'n':nm,'from':h['s'],'to':h['s']+1,'p':h.get('p',0),'g':h.get('g',0)})
    for i,g in enumerate(grp):
        cur=(i==len(grp)-1 and g['n']==ad and g['to']>=2026)
        lines.append('%d–%s · %s · %d maç / %d gol'%(g['from'],'' if cur else g['to'],g['n'],g['p'],g['g']))
    ex={}
    if any(dv): ex['dv']=dv
    ids=p.get('ids') or {}
    if ids.get('transfermarkt.com'): ex['tm']=ids['transfermarkt.com']
    ln=p.get('loan')
    if ln and ln.get('to_club_id'): ex['kt']=club_name(ln['to_club_id']); ex['kb']=dmy(ln.get('expiration','')); ex['km']=ln.get('wage_contribution_pct',100)
    con=p.get('contract') or {}
    out.append([name,dmy(p['birth_date']),ctry,'',main,ayak,0,0,0,p.get('value') or 0,dmy(con.get('expiration','')),guc,pot,ctry if mm>0 else '',mm,mg,'',1,ad,cn,takim,0,'',0,attrs,mv,'\n'.join(lines),ex or 0])
    stats['alındı']+=1
print(stats, 'toplam',len(out))
# parçala
chunks=[];cur=[];size=0
for r in out:
    s=len(json.dumps(r,ensure_ascii=False,separators=(',',':')))
    if size+s>6_500_000: chunks.append(cur);cur=[];size=0
    cur.append(r); size+=s
chunks.append(cur)
import os
for i,ch in enumerate(chunks,1):
    open(S+'/of/ve-op-%d.js'%i,'w',encoding='utf-8').write('window.VE_OP=window.VE_OP||[];window.VE_OP.push('+json.dumps(ch,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+');\n')
    print('parça',i,len(ch),os.path.getsize(S+'/of/ve-op-%d.js'%i)//1024,'KB')
json.dump({str(k):v for k,v in cmatch.items()},open(S+'/of/cmatch.json','w'),ensure_ascii=False)
