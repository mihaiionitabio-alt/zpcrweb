from pathlib import Path
import json,subprocess,re,hashlib,array,sys,textwrap,wave
ROOT=Path(r'D:\IXO\MISSY_VOICE_DEMO_2026-10-27')
FFMPEG=Path(r'D:\IXO\MISSY_VIDEO_2026-10-25\_tools\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe')
RATE=22050

def duration(p):
 s=subprocess.run([str(FFMPEG),'-hide_banner','-i',str(p)],capture_output=True,text=True,encoding='utf-8',errors='replace').stderr
 m=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',s)
 if not m:raise RuntimeError(s)
 h,mn,sec=map(float,m.groups());return 3600*h+60*mn+sec

def pcm(path):
 raw=subprocess.check_output([str(FFMPEG),'-hide_banner','-loglevel','error','-i',str(path),'-ac','1','-ar',str(RATE),'-f','f32le','-'])
 a=array.array('f');a.frombytes(raw)
 if sys.byteorder!='little':a.byteswap()
 return a

def stamp(t):
 ms=round(max(0,t)*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000);return f'{h:02}:{m:02}:{s:02},{ms:03}'

def chunks(text,zh=False):
 if zh:
  return re.findall(r'.{1,24}(?:[，。；！？]|$)|.{1,24}',text)
 return textwrap.wrap(text,width=68,break_long_words=False,break_on_hyphens=False)

NARRATION_ZH={'Chapter 1. Setup and intake.': '第一部分：设置与导入。', 'I click the MISSY logo to enter.': '我点击 MISSY 标志进入。', 'I enter a fictional laboratory and investigator.': '我填写虚构的实验室和分析人员姓名。', 'I select the embedded artificial file. File selection is a scripted demo action.': '我选择内嵌的模拟文件。文件选择由演示脚本完成。', 'I press Read files. This is a scripted demo action.': '我点击读取文件。此步骤由演示脚本完成。', 'Chapter 2. Follow the evidence.': '第二部分：追踪证据。', 'I create a fictional review-only method. Profile editing is a scripted demo action.': '我创建虚构的仅供审核的方法。配置编辑由演示脚本完成。', 'I open the hardware reference. Manufacturer specifications and artificial measurements are different.': '我打开硬件参考。制造商规格和模拟测量是不同的信息。', 'I select the second artificial instrument. It has only two run views.': '我选择第二台模拟仪器，它只有两个运行视图。', 'Chapter 3. Prepare the report.': '第三部分：准备报告。', 'I open the animal shortcuts. These are mouse actions in this demonstration.': '我打开动物快捷方式。本演示通过鼠标操作。', 'I open Command mode.': '我打开命令模式。', 'I select the drift and heating figures in Assisted mode. Report creation is a scripted demo action.': '我在辅助模式选择漂移图和升温图。报告操作由演示脚本完成。', 'I build the report locally. This does not approve laboratory results.': '我在本机生成报告。这不代表批准实验室结果。'}

cap=json.loads((ROOT/'CAPTURE_MANIFEST.json').read_text(encoding='utf-8'));dialogue=json.loads((ROOT/'DIALOGUE_MANIFEST.json').read_text(encoding='utf-8'));steps={x['id']:x for x in dialogue['steps']}
video=ROOT/'MISSY_Voice_Workflow.webm';raw_duration=duration(video)
# Capture clock is recorded beside the video. Align its measured span with container duration.
wall=(cap['captureEndEpochMs']-cap['captureStartEpochMs'])/1000
clock_adjust=raw_duration-wall
tour_offset=(cap['clockOriginEpochMs']-cap['captureStartEpochMs'])/1000+clock_adjust
last_step_end=max(e['atSeconds'] for e in cap['events'] if e['event']=='step-end')
d=min(raw_duration,tour_offset+last_step_end+1.0)
assert d<=900,d
actual_durations={e['id']:e['atSeconds'] for e in cap['events'] if e['event']=='step-end'}
for e in cap['events']:
 if e['event']=='step-start':actual_durations[e['id']]-=e['atSeconds']
assert max(actual_durations.values())<=30,max(actual_durations.values())
mix=array.array('f',[0.0])*(int((d+1)*RATE));entries={'en':[],'zh':[]};starts=[]
def add(samples,at,gain):
 base=round(at*RATE)
 for j,v in enumerate(samples):
  k=base+j
  if 0<=k<len(mix):mix[k]+=v*gain
for e in cap['events']:
 if e['event'] not in ['operator-start','missy-start']:continue
 role=e['event'].split('-')[0];step=steps[e['id']];at=tour_offset+e['atSeconds'];samples=pcm(ROOT/'audio'/f'{e["id"]:02}_{role}.mp3');add(samples,at,.85);secs=len(samples)/RATE;starts.append((e['id'],role,at,secs))
 text=step['say'] if role=='operator' else step['answer']['en']
 # Spoken command words remain English so viewers can repeat the exact supported phrase.
 zhtext=('操作员：'+step['say']) if role=='operator' and step['type']=='command' else NARRATION_ZH[step['say']] if role=='operator' else step['answer']['zh']
 for lang,value in [('en',text),('zh',zhtext)]:
  parts=chunks(value,lang=='zh');weights=[max(1,len(x)) for x in parts];total=sum(weights);cursor=at
  for part,weight in zip(parts,weights):
   end=cursor+secs*weight/total;entries[lang].append((cursor,end,part));cursor=end
assert len(starts)==2*len(steps),(len(starts),len(steps))
# Same oscillator recipe as the app, rendered separately through renderInto for the MP4 mix.
pulse=ROOT/'audio/alarm_pulse.wav'
alarms=[e for e in cap['events'] if e['event']=='action-applied' and e['say']=='Computer red alert'];stops=[e for e in cap['events'] if e['event']=='action-applied' and e['say']=='Computer cancel red alert']
if alarms and pulse.exists():
 a=tour_offset+alarms[0]['atSeconds'];z=tour_offset+stops[0]['atSeconds'];tone=pcm(pulse);t=a
 while t<z:
  allowed=min(len(tone),max(0,int((z-t)*RATE)));add(tone[:allowed],t,.35);t+=.92
peak=max(abs(x) for x in mix);assert peak<1,peak
sound=ROOT/'MISSY_Voice_Workflow_Audio.wav'
with wave.open(str(sound),'wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);data=array.array('h',(round(max(-1,min(1,x))*32767) for x in mix[:int(d*RATE)]));
 if sys.byteorder!='little':data.byteswap()
 f.writeframes(data.tobytes())
for lang,rows in entries.items():
 rows.sort(key=lambda x:x[0]);body=[]
 for i,(a,z,t) in enumerate(rows,1):body.extend([str(i),stamp(a)+' --> '+stamp(z),t,''])
 (ROOT/f'MISSY_Voice_Workflow.{lang}.srt').write_text('\n'.join(body),encoding='utf-8-sig')
if '--subtitles-only' in sys.argv:
 print('Updated English and Chinese clip-synchronised subtitles');raise SystemExit(0)
chapters=[]
for ch in [1,2,3]:
 ids=[i for i,s in steps.items() if s['chapter']==ch];events=[e for e in cap['events'] if e['event']=='step-start' and e['id']==min(ids)];chapters.append((0 if ch==1 else tour_offset+events[0]['atSeconds'],['Setup and intake','Analysis','Integrity, report and boundaries'][ch-1]))
meta=[';FFMETADATA1','title=MISSY voice-command workflow — artificial data','comment=Actual live page capture; original offline generated operator and MISSY voices; emulated text commands, not microphone recognition.']
for i,(a,name) in enumerate(chapters):
 z=chapters[i+1][0] if i+1<len(chapters) else d;meta.extend(['[CHAPTER]','TIMEBASE=1/1000',f'START={round(a*1000)}',f'END={round(z*1000)}','title='+name])
metadata=ROOT/'CHAPTERS.ffmetadata';metadata.write_text('\n'.join(meta),encoding='utf-8')
filter="drawbox=x=0:y=0:w=1000:h=28:color=0xffb454:t=fill,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='ARTIFICIAL DATA - NOT A LABORATORY RESULT':fontsize=17:fontcolor=black:x=16:y=6"
out=ROOT/'MISSY_Voice_Workflow.mp4'
subprocess.run([str(FFMPEG),'-hide_banner','-loglevel','error','-y','-i',str(video),'-i',str(sound),'-i',str(metadata),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-vf',filter,'-c:v','libx264','-preset','veryfast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart','-t',str(d),'-shortest',str(out)],check=True)
final={'passed':True,'seconds':duration(out),'rawCaptureSeconds':raw_duration,'trimmedIdleSeconds':raw_duration-d,'maxActualStepSeconds':max(actual_durations.values()),'steps':len(steps),'commands':sum(s['type']=='command' for s in steps.values()),'chapters':chapters,'audioStarts':len(starts),'mixedPeak':peak,'clockAdjustmentSeconds':clock_adjust,'tourOffsetSeconds':tour_offset,'sourceLocalHTMLSHA256':cap['localHTMLSHA256'],'sourcePublishedLFHTMLSHA256':cap['publishedLFHTMLSHA256'],'videoSHA256':hashlib.sha256(out.read_bytes()).hexdigest(),'audioSHA256':hashlib.sha256(sound.read_bytes()).hexdigest(),'stepTiming':[{**s,'operatorStartSeconds':next(t for i,r,t,du in starts if i==s['id'] and r=='operator'),'replyStartSeconds':next(t for i,r,t,du in starts if i==s['id'] and r=='missy')} for s in steps.values()],'reproducibility':'Fixed data, clock, script, generated voice settings and recorded step timings; cross-machine or browser-bit-identical video is not claimed.'}
assert final['seconds']<=900
(ROOT/'VIDEO_MANIFEST.json').write_text(json.dumps(final,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in final.items() if k!='stepTiming'},ensure_ascii=False,indent=2))
