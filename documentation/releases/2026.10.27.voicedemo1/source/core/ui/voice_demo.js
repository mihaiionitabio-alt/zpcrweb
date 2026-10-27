/* Voice workflow demonstration: isolated synthetic session and original embedded dialogue. */
(()=>{
 const T=(en,zh)=>document.body.classList.contains('lang-zh')?zh:en;
 const BANNER='ARTIFICIAL DATA — NOT A LABORATORY RESULT';
 function installVoiceChild(){
  const demo=window.MISSY_DEMO_CHILD.voice,voice=window.MISSY_CONSOLE_VOICE;
  setLanguage('en');for(const item of MISSY_COMPUTER_SOUND.catalog)MISSY_COMPUTER_SOUND.setCue(item.id,item.id==='redalert');
  const note=document.createElement('p');note.id='voice-demo-data-label';note.textContent=BANNER+' · Fixed demonstration clock: 26 October 2026, 10:00 UTC';note.style.cssText='font:12px Arial;color:#ffb454;background:#000;margin:0;padding:4px';document.body.prepend(note);
  let loaded=false,profiled=false,at=-1;
  const clear=()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());document.activeElement?.blur?.();};
  const ask=say=>{clear();const intent=voice.interpret(say);if(intent===null||typeof intent==='string'&&(intent.startsWith('guard:')||intent==='q:unknown'))throw Error('Demo command has no verified binding: '+say);const result=voice.ask(say);let answer=result;if(typeof result==='boolean'){if(!result)throw Error('Demo command was not applied: '+say);const text=document.querySelector('#missy-console-voice-controls [role=status]')?.title;if(!text)throw Error('Missing actual numeric acknowledgement');answer={en:text,zh:text};}clear();if(!answer?.en||!answer?.zh||(answer.en===voice.limitedResponse.en||answer.zh===voice.limitedResponse.zh))throw Error('Missing actual demo answer');return{say,intent,answer};};
  const chartNumber=id=>Object.values(CC_BY_ID).findIndex(d=>d.id===id)+1;
  const graphNumber=id=>Object.values(CC_BY_ID).length+GRAPHS.findIndex(g=>g.id===id)+1;
  const resultFocus=(outcome,index=0)=>{demo.page('results');const row=sopInterpretationRows(null,false).filter(r=>r.outcome===outcome)[index];if(!row)return;document.getElementById('sop-view').value='targets';document.getElementById('sop-run').value=String(RUNS.findIndex(r=>runName(r)===row.experiment));document.getElementById('sop-search').value=row.sample;renderResults();};
  const command=(chapter,title,say,target,tier='standard',prepare=null)=>({chapter,title,say,target,tier,prepare,type:'command'});
  const action=(chapter,title,say,run,target)=>({chapter,title,say,run,target,tier:'standard',type:'action'});
  const announce=chapter=>action(chapter,'Chapter '+chapter+' / 第 '+chapter+' 章','Chapter '+chapter+'. '+['Setup and intake.','Follow the evidence.','Prepare the report.'][chapter-1],()=>({en:BANNER+'. '+['The operator is Dr Lin in a fictional laboratory. Commands are supplied as text; no microphone is being tested.','We will examine planted repeat findings, a failed control, optical drift and an incomplete baseline.','We will review provenance, prepare a real report from artificial data, and show the limits of this tool.'][chapter-1],zh:'人工模拟数据，不是实验室结果。'+['操作人员为虚构实验室的林博士。命令以文本模拟输入，不测试麦克风。','我们将检查人为设置的复测判定、对照失败、光学漂移和不足的基线。','我们将审核来源，使用模拟数据生成真实报告，并说明工具的边界。'][chapter-1]}),'body');
  const steps=[
   announce(1),
   action(1,'Open MISSY / 打开 MISSY','I click the MISSY logo to enter.',()=>{document.getElementById('missy-startup-enter').click();return{en:document.getElementById('missy-setup').querySelector('[data-setup-text=heading]')?.textContent||'Session setup is open.',zh:'会话设置已打开。'};},'#setup-logo'),
   action(1,'Enter a fictional identity / 输入虚构身份','I enter a fictional laboratory and investigator.',()=>{const form=document.querySelector('#missy-setup form');form.elements.laboratory.value='Demo Molecular Laboratory (fictional)';form.elements.investigator.value='Dr Lin (fictional)';form.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('setup-enter').click();return ask('Computer who is the operator').answer;},'#statusbar'),
   command(1,'Who is speaking? / 操作人员','Computer who am I','#statusbar','trivial'),
   command(1,'Demonstration clock / 演示时钟','Computer what time is it','#voice-demo-data-label','trivial'),
   command(1,'Current publication / 当前发布','Computer what build is this','#tab-load'),
   command(1,'Language and recognition / 语言与识别','Computer what language are you speaking','#tab-load'),
   command(1,'Supported formats / 支持的格式','Computer what formats do you read','#drop'),
   action(1,'Choose embedded data / 选择内嵌数据','I select the embedded artificial file. File selection is a scripted demo action.',async()=>{demo.page('load');await demo.stage();return{en:document.getElementById('loadmsg').textContent,zh:'已选择内嵌人工模拟文件。此步骤为演示脚本操作。'};},'#read'),
   command(1,'Ready to read / 可开始读取','Computer what are you doing','#read','trivial'),
   action(1,'Read artificial runs / 读取模拟运行','I press Read files. This is a scripted demo action.',async()=>{await demo.load();loaded=true;demo.page('load');return{en:document.getElementById('readmsg').textContent,zh:'实际读取流程已完成，模拟运行和记录已加载。'};},'#readmsg'),
   command(1,'Count runs and records / 统计运行及记录','Computer how many runs','#readmsg','trivial'),
   command(1,'Source files and run views / 源文件与运行视图','Computer how many files','#readmsg'),
   command(1,'Identify one run / 识别一次运行','Computer identify run three','#readmsg'),
   command(1,'Find the latest recorded run / 查找最新运行','Computer which run is newest','#readmsg'),
   command(1,'Recorded instruments / 已记录的仪器','Computer how many instruments','#readmsg'),
   command(1,'Compare compatible histories / 比较相容历史','Computer are these runs comparable','#readmsg'),
   command(1,'Recorded evidence, not damage diagnosis / 记录证据而非损坏诊断','Computer damage report','#readmsg'),
   announce(2),
   action(2,'Create a review-only profile / 创建仅审核配置','I create a fictional review-only method. Profile editing is a scripted demo action.',()=>{demo.profile();profiled=true;demo.page('sop');return ask('Computer which profile is active').answer;},'#sop-head'),
   command(2,'Active method / 当前方法','Computer which profile is active','#sop-head','trivial'),
   command(2,'Reference assignment / 参照角色','Computer which target is the reference','#sop-targets'),
   command(2,'Loaded targets / 已加载靶标','Computer what targets are loaded','#sop-targets','trivial'),
   command(2,'Read real profile summaries / 阅读实际配置汇总','Computer read the results','#sop-results','standard',()=>demo.page('results')),
   command(2,'Planted repeat findings / 人为设置的复测判定','Computer which samples should I repeat','#sop-results','complex',()=>resultFocus('Repeat',0)),
   command(2,'Read the next repeat finding / 阅读下一条复测判定','Computer more','#sop-results','standard',()=>resultFocus('Repeat',1)),
   command(2,'Finish the repeat list / 读完复测列表','Computer more','#sop-results','standard',()=>resultFocus('Repeat',2)),
   command(2,'A deliberately failed control / 人为设置的对照失败','Computer did any control fail','#sop-results','complex',()=>resultFocus('Control fail',0)),
   command(2,'Assigned standards, not calibration approval / 指定标准品不等于校准批准','Computer how many standards','#sop-results'),
   action(2,'Hardware reference / 硬件参考','I open the hardware reference. Manufacturer specifications and artificial measurements are different.',()=>{demo.hardware();return{en:document.querySelector('#missy-demo-hardware h2').textContent,zh:'制造商规格仅作参考，模拟测量另行标记。'};},'#missy-demo-hardware'),
   command(2,'Chart by its number / 按编号打开图表',()=> 'Computer show chart '+chartNumber('heat_rate'),'#mg-chart','standard',()=>{CC_STATE.instrument=ccInstrumentKey(RUNS[0]);demo.chart('heat_rate');}),
   command(2,'Chart inventory / 图表清单','Computer run diagnostic on module charts','#mg-chart'),
   command(2,'Identify the current chart / 识别当前图表','Computer which chart is this','#mg-chart','trivial'),
   command(2,'Open the optical history / 打开光学历史',()=> 'Computer show chart '+chartNumber('bg_median'),'#mg-chart'),
   command(2,'Measure the planted drift / 查看人为漂移','Computer how many outliers','#mg-chart','standard'),
   command(2,'Read the current magnification / 查看缩放比例','Computer what is the magnification','#mg-chart','trivial'),
   command(2,'Zoom without changing values / 缩放不改变数值','Computer zoom in','#mg-chart','trivial'),
   command(2,'Confirm the zoom / 确认缩放','Computer what is the magnification','#mg-chart','trivial'),
   command(2,'Reset the view / 重置视图','Computer reset the view','#mg-chart','trivial'),
   command(2,'White chart background / 白色图表背景','Computer white background','#mg-chart','trivial'),
   command(2,'Dark chart background / 深色图表背景','Computer dark background','#mg-chart','trivial'),
   command(2,'Label this as a drill / 标记演练','Computer this is a drill','#mg-statusbar'),
   command(2,'Manual alarm for the scenario / 情景手动警报','Computer red alert','#mg-statusbar'),
   command(2,'Stop the manual alarm / 停止手动警报','Computer cancel red alert','#mg-statusbar'),
   action(2,'Switch to the short history / 切换至短历史','I select the second artificial instrument. It has only two run views.',()=>{CC_STATE.instrument=ccInstrumentKey(RUNS.at(-1));demo.chart('heat_rate');return ask('Computer which chart is this').answer;},'#mg-chart'),
   command(2,'Missing baseline is not a pass / 基线不足不代表通过','Computer why has this chart no limits','#mg-chart','complex'),
   command(2,'Open amplification data / 打开扩增数据',()=> 'Computer show chart '+graphNumber(GRAPHS.find(g=>/amplification|curves/i.test(g.id+' '+g.title)).id),'#mg-chart','standard',()=>{CC_STATE.instrument=ccInstrumentKey(RUNS[0]);}),
   command(2,'Summarise this single run / 汇总单次运行','Computer summarise the run','#mg-chart'),
   command(2,'Trace the source / 追溯来源','Computer where did this run come from','#mg-chart'),
   command(2,'Inspect the plate mapping / 查看孔板映射',()=> 'Computer show chart '+graphNumber('plate'),'#mg-chart'),
   command(2,'Open review / 打开审核','Computer stations','#mg'),
   command(2,'Return to the saved view / 返回保存页面','Computer as you were','#mg-chart'),
   announce(3),
   command(3,'Open formats with a numbered command / 使用数字打开开放格式','Computer seven','#tab-export','trivial',()=>demo.closeModes()),
   command(3,'Identify the view / 识别页面','Computer where am I','#tab-export','trivial'),
   command(3,'Export scope / 导出范围','Computer what will the export contain','#tab-export'),
   command(3,'Name disclosure settings / 名称设置','Computer security alert','#tab-export'),
   command(3,'Open integrity / 打开完整性页面','Computer eight','#tab-integrity','trivial'),
   command(3,'Read the status, with coverage limits / 阅读状态及覆盖范围','Computer status report','#tab-integrity','complex'),
   action(3,'Animal shortcuts / 动物快捷方式','I open the animal shortcuts. These are mouse actions in this demonstration.',()=>{demo.page('load');document.getElementById('missy-animal-menu-toggle')?.click();return ask('Computer what can I do here').answer;},'#statusbar'),
   action(3,'Command mode / 命令模式','I open Command mode.',()=>{demo.closeModes();cmdOpen();return ask('Computer where am I').answer;},'#cmdm'),
   command(3,'Research-use boundary / 研究用途边界','Computer are these results validated','#cmdm'),
   command(3,'No cause inferred from a curve / 不从曲线推断原因','Computer is this sample contaminated','#cmdm'),
   command(3,'Rules cannot be overridden by voice / 语音不能绕过规则','Computer override the profile','#cmdm'),
   command(3,'Release is a laboratory decision / 放行由实验室决定','Computer approve this run for release','#cmdm'),
   action(3,'Assisted report selection / 辅助模式选择报告','I select the drift and heating figures in Assisted mode. Report creation is a scripted demo action.',()=>{demo.closeModes();SEL_STATE.ids=new Set(['cc:bg_median','cc:heat_rate']);SEL_STATE.run=0;SEL_STATE.figureScope='selected';astOpen();return ask('Computer where am I').answer;},'#astm'),
   action(3,'Build a real artificial-data report / 用模拟数据生成真实报告','I build the report locally. This does not approve laboratory results.',async()=>{CC_STATE.instrument=ccInstrumentKey(RUNS[0]);await demo.report();if(!window.MISSY_DEMO_CHILD.reportBytes)throw Error('Report was not built');const message=document.createElement('p');message.id='voice-demo-report-ready';message.textContent='Artificial-data report is ready in memory. Use Preview report to inspect the actual PDF.';document.getElementById('ast-msg').after(message);return{en:message.textContent,zh:'模拟数据报告已在内存中生成，可点击预览查看实际 PDF。'};},'#ast-msg'),
   command(3,'Stand down / 结束演练','Computer stand down','#statusbar','standard',()=>demo.closeModes()),
   command(3,'Stop the interface audio / 停止界面音频','Computer all stop','#tab-integrity','standard',()=>demo.page('integrity'))
  ];
  window.MISSY_VOICE_DEMO_CHILD={get steps(){return steps.map((s,i)=>({id:i,chapter:s.chapter,title:s.title,say:typeof s.say==='function'?s.say():s.say,tier:s.tier,type:s.type}));},async go(i){const step=steps[i];if(!step)throw Error('Unknown voice demo step');clear();if(i>=1){const until=performance.now()+15000;while(document.getElementById('missy-startup-enter').disabled){if(performance.now()>until)throw Error('Startup did not become ready');await new Promise(r=>setTimeout(r,30));}}if(i>=10&&!loaded){await demo.load();loaded=true;}if(i>=20&&!profiled){demo.profile();profiled=true;}if(step.prepare)await step.prepare();const say=typeof step.say==='function'?step.say():step.say;const result=step.type==='command'?ask(say):{say,intent:null,answer:await step.run()};if(step.target){document.querySelector(step.target)?.closest('details')?.setAttribute('open','');demo.focus(step.target,step.title);}at=i;return{...this.steps[i],...result,runCount:RUNS.length,reportBytes:window.MISSY_DEMO_CHILD.reportBytes,audioBytes:(()=>{const c=MISSY_VOICE_DEMO_AUDIO.steps.find(x=>x.id===i);return c?atob(c.operator||'').length+atob(c.missy||'').length:0;})()};},get reportURL(){return window.MISSY_DEMO_CHILD.reportURL;},get reportBytes(){return window.MISSY_DEMO_CHILD.reportBytes;},audit(){const e=sopEvaluateAll(),primary=ccCompute(CC_BY_ID.bg_median,ccRowsFor(ccInstrumentKey(RUNS[0])),'DNA_TARGET'),short=ccCompute(CC_BY_ID.heat_rate,ccRowsFor(ccInstrumentKey(RUNS.at(-1))),'');return{runs:RUNS.length,rows:RUNS.reduce((n,r)=>n+r.wells.length,0),repeats:e.flatMap(x=>x.rows).filter(r=>r.outcome==='Repeat').length,failedControls:e.flatMap(x=>x.rows).filter(r=>r.ctrl&&r.outcome==='Control fail').length,instruments:[...new Set(RUNS.map(ccInstrumentKey))],protocols:[...new Set(RUNS.map(ccProtocolKey))],primaryFlagged:primary.pts.filter(p=>p.flags.length).length,primaryBaselineReady:primary.baselineReady,shortBaselineReady:short.baselineReady,shortPoints:short.pts.length};},stop(){MISSY_CONSOLE_VOICE.stop();MISSY_COMPUTER_SOUND.stopAlert();window.MISSY_DEMO_CHILD.stop();}};
 }
 if(window.__MISSY_VOICE_DEMO_FRAME){document.addEventListener('DOMContentLoaded',installVoiceChild,{once:true});return;}
 document.addEventListener('DOMContentLoaded',()=>{
  if(window.__MISSY_DEMO_FRAME)return;
  const first=document.getElementById('missy-startup-demo'),button=document.createElement('button');if(!first)return;button.id='missy-startup-voice-demo';button.type='button';button.setAttribute('data-i18n-skip','');const label=()=>{button.textContent=T('▶ Voice commands','▶ 语音命令');button.disabled=first.disabled;};label();first.after(button);new MutationObserver(label).observe(first,{attributes:true,attributeFilter:['disabled']});new MutationObserver(label).observe(document.body,{attributes:true,attributeFilter:['class']});
  button.onclick=()=>{window.MISSY_COMPUTER_SOUND?.interrupt?.();const overlay=document.createElement('section');overlay.id='missy-voice-demo';overlay.setAttribute('data-i18n-skip','');overlay.innerHTML='<header><b>'+BANNER+' / 人工模拟数据，非实验室结果</b><span>Recorded dialogue · no microphone · one list record per reply / 录制对话，不使用麦克风，每次朗读一条列表记录</span></header><iframe title="MISSY voice-command demonstration"></iframe><footer><div class="vd-heading"></div><div class="vd-command"></div><div class="vd-answer"></div><div class="vd-controls"><button data-vd="previous">◂</button><button data-vd="pause">Pause / 暂停</button><button data-vd="next">▸</button><select aria-label="Voice lesson / 语音课程"></select><button data-vd="mute">Dialogue on / 对话开</button><a data-vd="report" hidden>Preview report / 预览报告</a><button data-vd="exit">Exit / 退出</button><span class="vd-progress"></span></div></footer>';document.body.append(overlay);
  const style=document.createElement('style');style.textContent='html.missy-starting body>#missy-voice-demo{visibility:visible!important;z-index:2147483647}#missy-voice-demo{position:fixed;inset:0;z-index:2147483647;background:#000;color:#cc99cc;display:flex;flex-direction:column;font:15px Arial,sans-serif}#missy-voice-demo header{background:#ffb454;color:#000;padding:7px 16px;display:flex;justify-content:space-between;gap:15px;font-size:12px}#missy-voice-demo iframe{width:100%;flex:1;min-height:0;border:0}#missy-voice-demo footer{border-top:5px solid #cc99cc;border-radius:28px 0 0 0;padding:10px 20px;background:#08050b;min-height:140px;max-height:25vh;overflow:auto}.vd-heading{color:#ffb454;font-weight:bold}.vd-command{font-size:18px;margin:6px 0;color:#ffcc99}.vd-answer{font-size:16px;line-height:1.3;max-height:80px;overflow:auto}.vd-controls{display:flex;align-items:center;gap:8px;margin-top:8px}.vd-controls button,.vd-controls select,.vd-controls a{border:0;border-radius:18px;padding:6px 14px;background:#cc99cc;color:#000;cursor:pointer}.vd-controls select{max-width:420px}.vd-progress{margin-left:auto;font-size:12px}.vd-command[data-speaking=true],.vd-answer[data-speaking=true]{border-left:3px solid #ffb454;padding-left:8px}';overlay.append(style);
  if(MISSY_VOICE_DEMO_AUDIO.voices&&!MISSY_VOICE_DEMO_AUDIO.voices.distinct)overlay.querySelector('header span').textContent+=' · One installed voice; roles use different settings / 单一本地语音，角色设置不同';
  const frame=overlay.querySelector('iframe'),select=overlay.querySelector('select'),heading=overlay.querySelector('.vd-heading'),commandBox=overlay.querySelector('.vd-command'),answerBox=overlay.querySelector('.vd-answer'),progress=overlay.querySelector('.vd-progress');frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-downloads');let api=null,index=-1,token=0,paused=false,muted=false,actionBusy=false,audio=null,ended=false;const events=[],started=performance.now();
  const seed='<script>window.__MISSY_DEMO_FRAME=true;window.__MISSY_VOICE_DEMO_FRAME=true;window.__MISSY_DEMO_LANG="en";(()=>{const D=Date,F=Date.UTC(2026,9,26,10,0,0);class DemoDate extends D{constructor(...a){super(...(a.length?a:[F]));}static now(){return F;}getTimezoneOffset(){return 0;}toLocaleString(l,o){return super.toLocaleString(l,{...o,timeZone:"UTC"});}}window.Date=DemoDate;const m=new Map();const memory={getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>[...m.keys()][i]||null,get length(){return m.size}};Object.defineProperty(window,"localStorage",{value:memory});Object.defineProperty(window,"sessionStorage",{value:memory});})();<\/script>';
  const source=()=>MISSY_PUBLIC_SOURCE.replace('<meta charset="utf-8">','<meta charset="utf-8">'+seed);
  const loadFrame=()=>new Promise((resolve,reject)=>{frame.onload=()=>{api=frame.contentWindow.MISSY_VOICE_DEMO_CHILD;if(api)resolve(api);else reject(Error('Voice demonstration failed to initialise'));};frame.srcdoc=source();});
  const wait=(ms,t)=>new Promise(resolve=>{let elapsed=0,last=performance.now();const timer=setInterval(()=>{const now=performance.now();if(!paused)elapsed+=now-last;last=now;if(token!==t||!overlay.isConnected||elapsed>=ms){clearInterval(timer);resolve(token===t&&overlay.isConnected);}},40);});
  const stamp=(event,id,extra={})=>events.push({event,id,atSeconds:(performance.now()-started)/1000,...extra});
  const play=async(data,t,role,id)=>{if(!data)throw Error('Missing recorded speech');if(token!==t)return;audio=new Audio('data:audio/mpeg;base64,'+data);audio.muted=muted;audio.volume=.85;const box=role==='operator'?commandBox:answerBox;await new Promise((resolve,reject)=>{const poll=setInterval(()=>{if(token!==t||!overlay.isConnected){clearInterval(poll);audio?.pause();box.dataset.speaking='false';resolve();}},100);audio.onplaying=()=>{box.dataset.speaking='true';stamp(role+'-start',id);};audio.onended=()=>{clearInterval(poll);box.dataset.speaking='false';stamp(role+'-end',id);resolve();};audio.onerror=()=>{clearInterval(poll);box.dataset.speaking='false';reject(Error('Recorded audio could not play'));};audio.play().catch(()=>{paused=true;overlay.querySelector('[data-vd=pause]').textContent='Play / 播放';answerBox.textContent=T('Press Play to allow the recorded audio.','请点击播放以允许录制音频。');});});};
  async function go(i,{silent=false}={}){
   if(actionBusy||!api||!overlay.isConnected)return;const own=++token;audio?.pause();ended=false;i=Math.max(0,Math.min(api.steps.length-1,i));actionBusy=true;
   try{
    if(i!==index+1){api?.stop();await loadFrame();for(let j=0;j<i;j++)await api.go(j);}
    const descriptor=api.steps[i],clip=MISSY_VOICE_DEMO_AUDIO.steps.find(x=>x.id===i);const begin=performance.now();
    heading.textContent='PART '+descriptor.chapter+'/3 · '+descriptor.title;commandBox.textContent=(descriptor.type==='command'?'Operator: ':'Scripted demo action: ')+descriptor.say;answerBox.textContent='';select.value=String(i);progress.textContent=(i+1)+' / '+api.steps.length+' · '+(MISSY_VOICE_DEMO_AUDIO.durationSeconds?Math.ceil(MISSY_VOICE_DEMO_AUDIO.durationSeconds/60)+' min':'preflight');
    stamp('step-start',i,{say:descriptor.say});actionBusy=false;
    if(!silent){if(!clip)throw Error('Recorded dialogue is not built yet.');if(!await wait(350,own))return;await play(clip.operator,own,'operator',i);if(own!==token)return;}
    actionBusy=true;const step=await api.go(i);if(own!==token)return;index=i;answerBox.textContent=T(step.answer.en,step.answer.zh);
    if(clip&&!window.__MISSY_VOICE_CAPTURE_ONLY&&(clip.say!==step.say||clip.answer.en!==step.answer.en||clip.answer.zh!==step.answer.zh))throw Error('Recorded answer differs from this live demo step. Audio playback stopped.');
    stamp('action-applied',i,{say:step.say,intent:step.intent,answer:step.answer});const link=overlay.querySelector('[data-vd=report]');link.hidden=!api.reportURL;if(api.reportURL){link.href=api.reportURL;link.target='_blank';link.rel='noopener';}actionBusy=false;
    if(silent)return step;
    if(!await wait(250,own))return;await play(clip.missy,own,'missy',i);if(own!==token)return;
    const remain=Math.max(900,clip.durationSeconds*1000-(performance.now()-begin));if(await wait(remain,own)){stamp('step-end',i);if(i<api.steps.length-1&&!paused)void go(i+1);else ended=true;}return step;
   }catch(e){paused=true;answerBox.textContent=e.message;progress.textContent='Paused / 已暂停';stamp('error',i,{message:e.message});}finally{if(own===token)actionBusy=false;}
  }
  overlay.querySelector('[data-vd=previous]').onclick=()=>go(index-1);overlay.querySelector('[data-vd=next]').onclick=()=>go(index+1);select.onchange=()=>go(Number(select.value));overlay.querySelector('[data-vd=pause]').onclick=()=>{paused=!paused;overlay.querySelector('[data-vd=pause]').textContent=paused?'Play / 播放':'Pause / 暂停';if(paused)audio?.pause();else if(audio&&audio.paused&&!audio.ended)audio.play().catch(()=>{});else if(ended)void go(index+1);};overlay.querySelector('[data-vd=mute]').onclick=e=>{muted=!muted;if(audio)audio.muted=muted;e.target.textContent=muted?'Dialogue off / 对话关':'Dialogue on / 对话开';};const exit=()=>{++token;audio?.pause();api?.stop();overlay.remove();if(window.MISSY_VOICE_TOUR?.frame===frame)delete window.MISSY_VOICE_TOUR;button.focus();};overlay.querySelector('[data-vd=exit]').onclick=exit;
  window.MISSY_VOICE_TOUR={go,exit,get frame(){return frame},get api(){return api},get index(){return index},get busy(){return actionBusy},get paused(){return paused},get ended(){return ended},get clockOriginEpochMs(){return performance.timeOrigin+started},get events(){return events.map(e=>({...e}))},pause(){if(!paused)overlay.querySelector('[data-vd=pause]').click();}};
  loadFrame().then(()=>{for(const step of api.steps)select.add(new Option(step.chapter+' · '+step.title,String(step.id)));if(!window.__MISSY_VOICE_PREFLIGHT)void go(0);}).catch(e=>answerBox.textContent=e.message);
  };
 },{once:true});
})();
