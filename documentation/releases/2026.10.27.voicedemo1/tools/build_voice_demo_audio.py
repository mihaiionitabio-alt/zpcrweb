from pathlib import Path
import json,base64,wave,subprocess,hashlib,math
root=Path(r'D:\IXO\MISSY_VOICE_DEMO_2026-10-27');audio=root/'audio';capture=json.loads(Path('test-results/VOICE_DEMO_SCRIPT_CAPTURE.json').read_text(encoding='utf-8'));assert '2026.10.27.voicedemo1' in capture['steps'][5]['answer']['en']
ffmpeg=Path(r'D:\IXO\MISSY_VIDEO_2026-10-25\_tools\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe')
subprocess.run(['powershell','-NoProfile','-File','tools/render_voice_demo_sapi.ps1','-Capture','test-results/VOICE_DEMO_SCRIPT_CAPTURE.json','-Output',str(audio)],check=True,stdout=subprocess.DEVNULL)
assets={'version':1,'voices':json.loads((audio/'VOICES.json').read_text(encoding='utf-8-sig')),'clock':capture['clock'],'dataAudit':capture['audit'],'steps':[]};timeline=0;long=[]
for s in capture['steps']:
 item={k:s[k] for k in ['id','chapter','title','say','intent','answer','tier','type']};item['atSeconds']=round(timeline,3);durations={}
 for role in ['operator','missy']:
  wav=audio/f'{s["id"]:02}_{role}.wav';mp3=audio/f'{s["id"]:02}_{role}.mp3'
  with wave.open(str(wav)) as f:duration=f.getnframes()/f.getframerate()
  durations[role]=round(duration,4)
  subprocess.run([str(ffmpeg),'-hide_banner','-loglevel','error','-y','-i',str(wav),'-af','alimiter=limit=0.85:level=false','-ar','22050','-ac','1','-codec:a','libmp3lame','-b:a','56k','-map_metadata','-1',str(mp3)],check=True)
  data=mp3.read_bytes();assert len(data)>100;item[role]=base64.b64encode(data).decode();item[role+'SHA256']=hashlib.sha256(data).hexdigest()
 item['audioSeconds']=durations;minimum=5 if s['tier']=='trivial' else 9;item['durationSeconds']=round(max(minimum,sum(durations.values())+1.5),3)
 if item['durationSeconds']>30:long.append({'id':s['id'],'seconds':item['durationSeconds'],'say':s['say'],'responseSeconds':durations['missy']})
 timeline+=item['durationSeconds'];assets['steps'].append(item)
assets['durationSeconds']=round(timeline,3);assets['complexRepliesOver20Seconds']=sum(x['audioSeconds']['missy']>20 for x in assets['steps']);print(json.dumps({'seconds':timeline,'long':long,'responseOver20':assets['complexRepliesOver20Seconds']}))
(root/'AUDIO_BUILD_MEASUREMENTS.json').write_text(json.dumps({'seconds':timeline,'long':long,'responseOver20':assets['complexRepliesOver20Seconds']},indent=2),encoding='utf-8')
(root/'DIALOGUE_ASSETS.json').write_text(json.dumps(assets,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
assert not long,'Dialogue step exceeds 30 seconds'
assert timeline<=900,'Single video exceeds 15 minutes'
Path('src/core/ui/voice_demo_assets.js').write_text('/* Original offline Windows SAPI speech. No source recordings or network assets. */\nconst MISSY_VOICE_DEMO_AUDIO='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
manifest={k:v for k,v in assets.items() if k!='steps'};manifest['steps']=[{k:v for k,v in x.items() if k not in ['operator','missy']} for x in assets['steps']];manifest['scriptAnswersSHA256']=hashlib.sha256(json.dumps([{'id':x['id'],'say':x['say'],'intent':x['intent'],'answer':x['answer']} for x in assets['steps']],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest();manifest['scriptAnswersHashMethod']='SHA-256 of UTF-8 compact sorted-key JSON of [{id,say,intent,answer}] in step order';(root/'DIALOGUE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Embedded',len(assets['steps']),'duets,',assets['durationSeconds'],'seconds')
