"""Compile the supplied sound map as data; do not execute its examples."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
source=Path(r'C:/Users/Ana si Mihai/Downloads/MISSY_SOUND_MAP_300.md')
rows=[]
for line in source.read_text(encoding='utf-8').splitlines():
 m=re.match(r'\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|',line)
 if m: rows.append(dict(number=int(m[1]),action=m[2],recipe=m[3],kind=m[4]))
assert [x['number'] for x in rows]==list(range(1,301))
base=json.loads(Path(r'D:/IXO/zpcrweb_missy_public_branch/documentation/releases/2026.10.26.responses99/sound_catalogue.json').read_text(encoding='utf-8'))
clicks={'missy-setup-reopen':28,'missy-forget-password':29,'cmd-script-run':67,'csvread':90,'csvfilebtn':91,'csvdemo':92,'sop-json-apply':100,'sop-next':108,'sop-prev':109,'sop-add-found':110,'mara-input-import':117,'mara-input-export':118,'ss-edit':124,'ss-select':125,'ss-unselect':126,'ss-apply':128,'ss-cancel':129,'ss-next':130,'ss-prev':131,'ss-group':132,'cc-rebase':188,'cc-reset':189,'cc-remember':190,'cc-import':191,'cc-export':192,'cc-export-csv':193,'cc-csv':194,'cc-png':195,'cc-svg':196,'cc-zip':197,'cc-zip-png':198,'cc-ml':199,'open-rising-review':208,'issue-overview':212,'issue-all-runs':214,'issue-clear-runs':215,'reset-control-categories':222,'dl-rising-csv':223,'dl-rising-png':223,'dl-review-all':224,'dl-curves-csv':225,'dl-curves-png':226,'dl-plate-csv':227,'dl-plate-png':228,'dl-statistics':231,'dl-compare':232,'dl-runs':233,'dl-instrument':234,'dl-issue-overview':235,'dl-lj-csv':236,'dl-lj-png':236,'dl-temp-png':237,'dl-metadata':238,'dl-pseudo-map':239,'dl-integrity':240,'dl-py':241,'dl-r':242,'dl-site':243,'missy-source-download':243,'prev-py':245,'prev-r':245,'diag-save':247,'diag-refresh':248,'demo-next':268,'demo-prev':269}
changes={'ss-enable':127,'ss-names-enable':133,'ss-names-sensitivity':135,'derived-run':141,'cmp-a':144,'cmp-b':144,'stat-rep-limit':146,'g-run':150,'g-metric':152,'cc-inst':179,'cc-proto':180,'cc-type':181,'cc-variant':182,'cc-x':183,'issue-category':213,'demo-lesson':275,'demo-delay':276,'demo-pointer-motion':277}
covered={1:'voiceAcknowledge',6:'voiceStart',7:'voiceStop',8:'voiceTimeLimit',9:'voicePermission',10:'packInstalling',11:'packReady',19:'ready',23:'enter',24:'language',26:'workspaceEnter',27:'workspaceBack',31:'loadPage',32:'sopPage',33:'resultsPage',34:'panelPage',35:'graphsPage',36:'reviewPage',37:'formatsPage',38:'logs',41:'reviewOverview',47:'consoleOpen',48:'consoleClose',63:'commandOpen',64:'consoleOpen',65:'assistedOpen',73:'working',88:'loaded',95:'profileSelect',96:'affirmative',97:'profileOpen',101:'profileSave',102:'resultBundle',103:'resultWorkbook',104:'resultCSV',105:'profileLock',106:'profileLock',122:'resultsFiltered',149:'graphSelected',151:'targetSelected',153:'signalSelected',161:'logDisplay',164:'colourDisplay',169:'graphPNG',170:'graphSVG',171:'graphCSV',172:'graphBundle',203:'reviewOverview',204:'reviewRuns',205:'reviewCurves',206:'reviewPlate',207:'reviewRising',209:'reviewInstrument',210:'reviewStatistics',211:'reviewCompare',229:'derivedTable',230:'allDerivedTables',246:'statusSave',267:'demoBegin',270:'demoPlayback',271:'demoPlayback',281:'demoExit'}
text=(ROOT/'dist/Missy-public.html').read_text(encoding='utf-8')
def exists(id):return bool(re.search(r'(?:id=["\x27]|\.id\s*=\s*["\x27])'+re.escape(id)+r'["\x27]',text))
clicks={k:v for k,v in clicks.items() if exists(k)}
changes={k:v for k,v in changes.items() if exists(k)}
active=set(clicks.values())|set(changes.values())
silent={12,68,70,82,113,162,282,299}
loops={x['number'] for x in rows if x['kind']=='loop'}
priority=sorted(active-covered.keys())+sorted(silent)+sorted(loops-covered.keys())
selected=[]
for n in priority+list(range(1,301)):
 if n not in covered and n not in selected:selected.append(n)
 if len(selected)==201:break
assert len(selected)==201
def recipe(row):
 n=row['number'];s=row['recipe'];m=re.search(r'v\.(\w+)\(([^)]*)\)',s);family,arg=m.groups() if m else ('soft','')
 var=1+(n%13)*.002
 def tones(fs,d=.07,shape='sine',gap=.02):return [[round(f*var,3),round(i*(d+gap),3),d,shape] for i,f in enumerate(fs)]
 if n in silent:return [],family
 if family=='tone':return [[float(re.search(r'\d+',arg)[0]),0,.1,'sine']],family
 if family=='key':return [[2400+int(re.search(r'\d+',arg)[0])*600,0,.03,'noise',None,['bandpass',3000,9]]],family
 if family=='noise':return [[3000,0,.06,'noise',None,['highpass',3000,1]]],family
 if family=='alert':return tones([622,622],.12,'square',.09),family
 if family=='alarm':return [[196*var,0,.45,'sawtooth',None,['lowpass',1100,1]],[207*var,0,.45,'sawtooth',None,['lowpass',1100,1]]],family
 if family=='xfer':return [[220,0,1.2 if 'long' in arg else .35,'sine',1760,['lowpass',2400,1]],[1200,0,.15,'noise',None,['lowpass',1800,1]]],family
 if family in ['open','close','fade','chirp']:
  start,end={'open':(440,1320),'close':(1320,440),'fade':(110,880),'chirp':(1046,1568)}[family]
  if '-1' in arg or (family=='chirp' and '2' in arg):start,end=end,start
  return [[start*var,0,.75 if family=='fade' else .2,'sine',end*var]],family
 if family in ['bed','swell','hail']:return [[f*var,0,1.5 if family!='hail' else .45,'sine'] for f in ([55,82.5,110] if family=='bed' else [131,196,262] if family=='swell' else [523,659,784])],family
 if family=='scan':return [[1200,0,.3,'noise',None,['bandpass',1200,6]],[1200,.5,.3,'noise',None,['bandpass',1200,6]]],family
 if family=='work':return [[440,0,.45,'sine'],[466,0,.45,'sine'],[440,.7,.45,'sine'],[466,.7,.45,'sine']],family
 fs={'soft':[330],'ok':[523,784],'attn':[523,659,880],'done':[392,523,659,784],'query':[660,494],'pause':[440,440],'resume':[440,554],'rise':[523,659,784],'none':[]}.get(family,[330])
 return tones(fs),family
for row in rows:
 n=row['number'];row['selectors']=[k for k,v in clicks.items() if v==n]+[k for k,v in changes.items() if v==n]
 row['status']='existing-cue' if n in covered else 'silent' if n in silent else 'mapped-control-request' if n in active else 'opt-in-background' if 283<=n<=288 else 'preview-only-unverified-event'
 row['cueId']=covered.get(n,'map'+str(n).zfill(3)) if n in selected or n in covered else None
 if n not in selected:continue
 pattern,family=recipe(row);label=re.sub(r'[`*]','',row['action']);label=re.sub(r'\s+',' ',label)
 base.append(dict(id=row['cueId'],group='Map',en=f'{n:03d} · {label}',zh=f'提示 {n:03d} · '+('静音' if n in silent else '背景声音' if n in loops else '合成提示音'),pattern=pattern,family=family,mapNumber=n,toneOnly=True,kind='silent' if n in silent else 'loop' if n in loops else 'one-shot',defaultOff=n in loops or row['status']=='preview-only-unverified-event',status=row['status']))
assert len(base)==300
path=ROOT/'src/core/ui/sound_catalogue.json';path.write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=ROOT/'src/shell/public_startup_sound.html';s=p.read_text(encoding='utf-8');s,c=re.subn(r' const catalog=\[.*?\];',lambda _:' const catalog='+json.dumps(base,ensure_ascii=False,separators=(',',':'))+';',s,count=1);assert c==1;p.write_text(s,encoding='utf-8')
routes={'click':{k:'map'+str(v).zfill(3) for k,v in clicks.items() if v in selected},'change':{k:'map'+str(v).zfill(3) for k,v in changes.items() if v in selected}}
(ROOT/'src/core/ui/sound_map_routes.json').write_text(json.dumps(routes,indent=2))
(ROOT/'test-results/SOUND_MAP_AUDIT.json').write_text(json.dumps({'catalogueCount':300,'newCues':201,'mapRows':rows,'routes':routes},ensure_ascii=False,indent=2),encoding='utf-8')
print('300 catalogue choices; new routes:',len(routes['click']),len(routes['change']))
