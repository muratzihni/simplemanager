import json,glob,re,datetime
S='/tmp/claude-0/-home-user/40c86c58-3073-56d3-84a4-03d91ce05a6c/scratchpad'
wd=json.load(open(S+'/wd.json',encoding='utf-8')); countries={r['ad'] for r in wd['ulke']}
clubdb=json.load(open(S+'/clubdb.json',encoding='utf-8')); clubs={n for c in clubdb.values() for l in c for n in l[2]}
MEV={'Kaleci','Stoper','Sağ bek','Sol bek','Ön libero','Merkez orta saha','Ofansif orta saha','Sağ kanat','Sol kanat','Santrfor'}
AYAK={'Sağ','Sol','İki ayak'}
GOREV={'Teknik direktör','Yardımcı antrenör','Kaleci antrenörü','Kondisyoner','Gözlemci','Fizyoterapist','Altyapı sorumlusu','Sportif direktör','Başkan','Doktor','Analist'}
LIS={'UEFA Pro','UEFA A','UEFA B','Yok'}; TAN={'Yerel','Bölgesel','Ulusal','Kıtasal','Dünya çapında'}
def date_ok(s):
    try: datetime.datetime.strptime(s,'%d.%m.%Y'); return True
    except: return False
rej=[]; oy=[]; pe=[]; seen=set()
for f in sorted(glob.glob(S+'/real2/sq*.json')):
    for t in json.load(open(f,encoding='utf-8')):
        k=t.get('kulup')
        if k not in clubs: rej.append(('kulüp yok',k)); continue
        for o in t.get('oyuncular',[]):
            ad=o.get('ad'); key=(ad,k)
            bad=None
            if key in seen: bad='tekrar'
            elif o.get('mevki') not in MEV: bad='mevki '+str(o.get('mevki'))
            elif o.get('ayak') not in AYAK: bad='ayak'
            elif not date_ok(o.get('dogum','')): bad='doğum'
            elif not date_ok(o.get('sozlesme','')): bad='sözleşme'
            elif o.get('uyruk') not in countries: bad='uyruk '+str(o.get('uyruk'))
            elif o.get('uyruk2') and o['uyruk2'] not in countries: o['uyruk2']=''
            if not bad:
                g=o.get('guc'); p=o.get('pot')
                if not isinstance(g,(int,float)) or not 1<=g<=20: bad='guc'
                elif not isinstance(p,(int,float)): bad='pot'
            if bad: rej.append((k,ad,bad)); continue
            seen.add(key); g=int(round(o['guc'])); p=max(g,int(round(o['pot'])))
            mt=o.get('milliTakim') or ''
            if mt and mt not in countries: mt=''
            oy.append([ad,o['dogum'],o['uyruk'],o.get('uyruk2') or '',o['mevki'],o['ayak'],int(o.get('boy') or 180),int(o.get('kilo') or 75),int(o.get('forma') or 0),float(o.get('deger_eur') or 0),o['sozlesme'],g,p,mt,int(o.get('milliMac') or 0),int(o.get('milliGol') or 0),o.get('lakap') or '',1 if o.get('gercek') else 0,k])
        for o in t.get('personel',[]):
            ad=o.get('ad'); bad=None
            if o.get('gorev') not in GOREV: bad='görev '+str(o.get('gorev'))
            elif o.get('uyruk') not in countries: bad='uyruk '+str(o.get('uyruk'))
            elif not date_ok(o.get('dogum','')): o['dogum']='01.01.1975'
            if not date_ok(o.get('sozlesme','')): o['sozlesme']='30.06.2027'
            if bad: rej.append((k,ad,bad)); continue
            it=o.get('itibar'); it=int(it) if isinstance(it,(int,float)) and 1<=it<=20 else 8
            pe.append([ad,o['dogum'],o['uyruk'],o['gorev'],k,o['sozlesme'],o.get('lisans') if o.get('lisans') in LIS else 'Yok',it,o.get('tanin') if o.get('tanin') in TAN else 'Ulusal',1 if o.get('gercek') else 0])
ag=[]
try:
    for a in json.load(open(S+'/real2/agents.json',encoding='utf-8')):
        ag.append([a['ad'],a.get('ulke','Türkiye'),a.get('ajans',''),int(a.get('itibar',8)),int(a.get('komisyon',5)),int(a.get('ag',8)),int(a.get('sertlik',8)),int(a.get('musteri',10)),a.get('not',''),1 if a.get('gercek') else 0])
except Exception as e: print('agents yok',e)
json.dump({'oyuncu':oy,'personel':pe,'temsilci':ag},open(S+'/real2_merged.json','w'),ensure_ascii=False,separators=(',',':'))
print('oyuncu',len(oy),'gerçek',sum(x[17] for x in oy),'personel',len(pe),'temsilci',len(ag),'reddedilen',len(rej))
for r in rej[:30]: print(' ',r)
