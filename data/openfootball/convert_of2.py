import json,collections
S='/tmp/claude-0/-home-user/40c86c58-3073-56d3-84a4-03d91ce05a6c/scratchpad'
d=json.load(open('/tmp/ofdb/db.bin',encoding='utf-8')); cm=json.load(open('/tmp/ofdb/cmap.json',encoding='utf-8'))
cmatch={int(k):v for k,v in json.load(open(S+'/of/cmatch.json',encoding='utf-8')).items()}
FAC={'Best':20,'Superb':18,'Excellent':16,'Great':14,'Good':12,'Average':10,'Adequate':9,'Below Average':7,'Fairly Basic':6,'Basic':4,'Limited':3,'Poor':2}
PH={'DevelopAndSell':'Genç yetenek','SignToCompete':'Yıldız transfer','LoanFocused':'Karma','Balanced':'Karma'}
id2our={cid:(v[0],v[1]) for cid,v in cmatch.items()}
clubs={}
for c in d['clubs']:
    if c['id'] not in cmatch: continue
    n,cn,lig=cmatch[c['id']]
    o={}
    f=c.get('facilities')
    if f: o['tesis']=FAC.get(f['training'],10); o['altyapi']=FAC.get(f['youth'],10); o['ak_kalite']=FAC.get(f['academy'],10); o['gozlem']=FAC.get(f['recruitment'],10)
    if c.get('finance',{}).get('balance') is not None: o['bakiye']=c['finance']['balance']  # avro; editörde ×50
    if c.get('average_attendance'): o['tf_ortSeyirci']=c['average_attendance']
    col=c.get('colors') or {}
    if col.get('background'): o['e_ana']=col['background'].upper()
    if col.get('foreground'): o['e_ikinci']=col['foreground'].upper()
    if c.get('philosophy'): o['hd_transfer']=PH.get(c['philosophy'],'Karma')
    r=[id2our[x][0] for x in (c.get('rivals') or []) if x in id2our]
    if r: o['rakip']=r[0]
    teams=[t for t in c['teams'] if t['team_type']=='Main']
    if teams: o['_rep']=teams[0]['reputation']['world']
    o['_tm']=(c.get('ids') or {}).get('transfermarkt.com','')
    clubs[n+'|'+cn]=o
leagues=[]
for l in d['leagues']:
    leagues.append({'ulke':cm.get(l['country_code']),'ad':l['name'],'tier':l['tier'],'rep':l['reputation'],'yuk':l['promotion_spots'],'dus':l['relegation_spots']})
json.dump({'clubs':clubs,'leagues':leagues},open(S+'/of/real4.json','w'),ensure_ascii=False,separators=(',',':'))
import os; print(len(clubs),len(leagues),os.path.getsize(S+'/of/real4.json')//1024,'KB')
