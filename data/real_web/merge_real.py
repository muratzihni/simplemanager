import json,glob,re,sys
S='/tmp/claude-0/-home-user/40c86c58-3073-56d3-84a4-03d91ce05a6c/scratchpad'
DESEN={"Düz","Dikey çizgili","Yatay şeritli","Yarı yarıya","Çapraz şerit","Kareli","Desenli"}
ENUM={'tk_dizilis':{"4-3-3","4-2-3-1","4-4-2","3-5-2","3-4-3","5-3-2","4-1-4-1"},
 'tk_stil':{"Pozisyonel / top hâkimiyeti","Kontra atak","Yüksek pres","Direkt oyun","Dengeli","Savunma ağırlıklı"},
 'tk_hucum':{"Kanatlardan","Ortadan","Karma"},
 'hd_ana':{"Şampiyonluk","Avrupa kupası","Üst sıralar","Orta sıra","Küme düşmemek","Yükselme","Gelişim","Elemeleri geç","Gruptan çık","Çeyrek final","Yarı final"},
 'hd_kupa':{"Şampiyonluk","Yarı final","Çeyrek final","Fark etmez"},
 'hd_kitasal':{"Şampiyonlar Ligi şampiyonluğu","Şampiyonlar Ligi gruptan çıkmak","Avrupa Ligi","Konferans Ligi","Yok"},
 'hd_mali':{"Kâr","Dengeli","Zarar kabul"},'hd_transfer':{"Yıldız transfer","Genç yetenek","Altyapıdan","Tecrübeli oyuncu","Karma"},
 'ak_okul':{"Yok","Anlaşmalı okul","Kendi okulu","Yatılı"}}
TXT=['rkGalibiyet','rkYenilgi','rkMacOyuncu','rkGolOyuncu','rkTransferAlinan','rkTransferSatilan','kupaGecmisi','tf_ultra','tf_kimlik','tk_felsefe','hd_plan','ak_ad','ak_yaslar','ak_mezun']
NUM=['rkSezonGol','rkSezonPuan','rkSeyirci','rkYenilmez','rkSeri','ku_lig','ku_kupa','ku_superkupa','ku_kitasal','ku_dunya','ku_kita','ku_diger','tf_sayi','tf_ulke','tf_sosyal','hd_puan','hd_sabir','ak_kurulus','ak_sporcu']
N20=['tf_atmosfer','tf_sadakat','tf_baski','tf_genc','tf_deplasman','tf_olay','tk_tempo','tk_pres','tk_cizgi','tk_genislik','tk_setparca','ak_kalite','ak_antrenor','ak_tesis']
COL=[c+'_'+x for c in 'eda' for x in ('ana','ikinci','sort','corap')]
def mergeRec(old,new,f):
    if old is None: return new
    m=dict(old)
    for k,v in new.items():
        if k=='gecmisKazananlar' and k in m and len(str(m[k]).splitlines())>=len(str(v).splitlines()): continue
        if k=='kaynakNot' and k in m: m[k]=m[k]+' || '+v; continue
        m[k]=v
    return m
out={'kulup':{},'milli':{},'lig':{},'odul':{}}; rej=[]
for f in [S+'/real2/clubs.json',S+'/real2/nt2.json',S+'/real2/trn1.json',S+'/real2/trn2.json',S+'/real2/awd2.json']+sorted(glob.glob(S+'/real/*.json')):
    try: arr=json.load(open(f,encoding='utf-8'))
    except Exception as e: print('BOZUK',f,e); continue
    if re.search(r'(trn\d?|awd\d?)\.json$',f):
        kind='lig' if 'trn' in f.split('/')[-1] else 'odul'
        for t in json.load(open(f,encoding='utf-8')):
            ad=t.get('ad'); r={}
            for k,v in t.items():
                if k in ('ad','kaynaklar','tarih') or v in (None,''): continue
                if k in ('trk_sezonGol','trk_sezonPuan','trk_enCokSeyirci'):
                    if isinstance(v,(int,float)) and not isinstance(v,bool): r[k]=v
                    else: rej.append((ad,k,v))
                elif k.startswith(('trk_','od_')) or k=='gecmisKazananlar':
                    if isinstance(v,str): r[k]=v
                    else: rej.append((ad,k,v))
                else: rej.append((ad,k,'bilinmeyen anahtar'))
            src=', '.join(t.get('kaynaklar',[])) if isinstance(t.get('kaynaklar'),list) else ''
            r['kaynakNot']=('Kaynaklar: '+src if src else 'Kaynak belirtilmedi')+(' · '+t['tarih'] if t.get('tarih') else '')+' · web aramasıyla toplandı, doğrulanmadı'
            out[kind][ad]=mergeRec(out[kind].get(ad),r,f)
        continue
    kind='milli' if re.search(r'nt\d?\.json$',f) else 'kulup'
    for t in arr:
        ad=t.get('ad'); r={}
        for k,v in t.items():
            if k in ('ad','kaynaklar','tarih','tahmini','stadyum'): continue
            if v is None or v=='': continue
            if k in COL:
                if isinstance(v,str) and re.fullmatch(r'#[0-9a-fA-F]{6}',v): r[k]=v.upper()
                else: rej.append((ad,k,v))
            elif k.endswith('_desen'):
                if v in DESEN: r[k]=v
                else: rej.append((ad,k,v))
            elif k in ENUM:
                if v in ENUM[k]: r[k]=v
                else: rej.append((ad,k,v))
            elif k in TXT:
                if isinstance(v,str): r[k]=v
                else: rej.append((ad,k,v))
            elif k in NUM:
                if isinstance(v,(int,float)) and not isinstance(v,bool): r[k]=v
                else: rej.append((ad,k,v))
            elif k in N20:
                if isinstance(v,(int,float)) and 1<=v<=20: r[k]=int(round(v))
                else: rej.append((ad,k,v))
            else: rej.append((ad,k,'bilinmeyen anahtar'))
        src=', '.join(t.get('kaynaklar',[])) if isinstance(t.get('kaynaklar'),list) else ''
        est=t.get('tahmini',[])
        r['kaynakNot']=('Kaynaklar: '+src if src else 'Kaynak belirtilmedi')+(' · '+t['tarih'] if t.get('tarih') else '')+(' · tahmini alanlar: '+', '.join(est) if est else '')+' · web aramasıyla toplandı, doğrulanmadı'
        st=t.get('stadyum')
        if isinstance(st,dict): r['_stadyum']={k:v for k,v in st.items() if k in('ad','kapasite','acilis','sponsorAd','isitma','rekSeyirci','ortSeyirci') and v not in (None,'')}
        out[kind][ad]=mergeRec(out[kind].get(ad),r,f)
META={"Ballon d'Or":('Oyuncu','Dünya','','Yıl sonu',0,20),"FIFA The Best Yılın Oyuncusu":('Oyuncu','Dünya','','Yıl sonu',0,19),"UEFA Yılın Oyuncusu":('Oyuncu','Kıta','UEFA Şampiyonlar Ligi','Sezon sonu',0,17),"Altın Ayakkabı":('Gol','Kıta','','Sezon sonu',0,16),"Kopa Kupası":('Oyuncu','Dünya','','Yıl sonu',21,15),"Yashin Kupası":('Kaleci','Dünya','','Yıl sonu',0,15),"Gerd Müller Kupası":('Gol','Dünya','','Yıl sonu',0,15),"Premier League Sezonun Oyuncusu (PFA)":('Oyuncu','Lig','Premier League','Sezon sonu',0,16),"Premier League Altın Ayakkabı":('Gol','Lig','Premier League','Sezon sonu',0,14),"Premier League Altın Eldiven":('Kaleci','Lig','Premier League','Sezon sonu',0,13),"FIFA Dünya Kupası Altın Top":('Oyuncu','Dünya','FIFA Dünya Kupası','Sezon sonu',0,18),"FIFA Dünya Kupası Altın Ayakkabı":('Gol','Dünya','FIFA Dünya Kupası','Sezon sonu',0,17),"FIFA Dünya Kupası Altın Eldiven":('Kaleci','Dünya','FIFA Dünya Kupası','Sezon sonu',0,16)}
for ad,r in list(out['odul'].items()):
    if ad=='Süper Lig Gol Kralı':
        r['_match']={'ad':'Gol Kralı','turnuva':'Süper Lig'}
    elif ad in META:
        t=META[ad]; r['_meta']={'tur':t[0],'kapsam':t[1],'turnuva':t[2],'zaman':t[3],'yasSiniri':t[4],'itibar':t[5]}
json.dump(out,open(S+'/real_merged.json','w'),ensure_ascii=False)
print({k:len(v) for k,v in out.items()},'reddedilen',len(rej)); [print(' ',x) for x in rej[:40]]
