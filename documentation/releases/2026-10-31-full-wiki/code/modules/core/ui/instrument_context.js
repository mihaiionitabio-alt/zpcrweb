/* Additive context excerpts from retained decoded fields. No parsing, thermal
 * metrics, interpolation, sensor/dye remapping, gain or calibration correction. */
const MISSY_INSTRUMENT_CONTEXT=(()=>{
 const t=(en,zh)=>UI_LANG==='zh'?zh:en;
 const labels={count:['Retained record count','保留的记录数'],availability:['Availability','提供情况'],time:['Decoded time field','解码后的时间字段'],temperature:['Temperature field','温度字段'],sample_mean:['Existing parser sample-temperature mean','已有解析器的样本温度均值'],cover:['Cover temperature field','盖温度字段'],heatsink:['Heatsink temperature field','散热器温度字段'],zone_span:['Existing parser zone-temperature span','已有解析器的温区温度范围'],led_temperature:['LED temperature field','LED 温度字段'],led_current:['LED current/setting field','LED 电流／设置字段'],led_voltage:['LED voltage field','LED 电压字段'],junction:['LED junction temperature field','LED 结温字段'],exposure:['Exposure/integration field','曝光／积分字段'],channel:['Stored channel identifier','保存的通道标识'],reference:['Stored reference value','保存的参比值'],valid:['Stored acquisition-valid flag','保存的采集有效标志'],mask:['Opaque channel mask','未解释的通道掩码'],gain:['Gain evidence','增益记录'],omitted:['Fields omitted from this excerpt','此摘录未显示的字段数']};
 const basis={
  trace:['Retained display trace, possibly thinned; not the complete original temperature log. No new resampling.','保留的显示轨迹可能经过抽稀；不等于完整原始温度日志。不进行新的重采样。'],
  acquisition:['Existing decoded acquisition field. No new unit conversion, channel/dye mapping or QC verdict.','已有解码采集字段。不进行新的单位换算、通道／染料映射或质控判定。'],
  eds_temperature:['Existing parser tuple; sample mean and zone span are already parser-derived, not raw per-zone measurements.','已有解析器元组；样本均值和温区范围已由解析器计算，不是原始逐温区测量值。'],
  eds_led:['Existing decoded LEDStatus field; electrical units and calibration are not established here.','已有解码 LEDStatus 字段；此处不确认电学单位或校准状态。'],
  eds_exposure:['Existing exposure request per filter; no unit conversion, coverage/gap test or completeness claim.','已有逐滤光片曝光请求；不进行单位换算、覆盖／缺口检查，也不声明数据完整。'],
  reader_measured:['Existing reader interpretation: measured. Sensor location and calibration are not independently verified.','已有读取器判读为测量值。未独立验证传感器位置和校准状态。'],
  reader_setpoint:['Existing reader interpretation: setpoint. Not a measured temperature.','已有读取器判读为设定值。不属于测量温度。'],
  stored_temperature:['Stored temperature field; sensor/model/setpoint basis is not established by this view.','保存的温度字段；此视图未确定传感器测量／模型估计／设定值依据。'],
  led_setting:['Selected-channel decoded LED setting; not a calibrated current, gain or exposure measurement.','所选通道的解码 LED 设置；不代表已校准电流、增益或曝光测量值。'],
  mask:['Stored opaque mask; no bit meaning, active-channel status or dye identity is inferred.','保存的未解释掩码；不推断位含义、通道启用状态或染料标识。'],
  native_time:['Stored time text; no timezone conversion, clock correction or timing-precision claim.','保存的时间文本；不进行时区换算或时钟校正，也不声明时间精度。'],
  missing:['Not exposed by this decoded view. Not an instrument or sample failure; no new decoding is attempted.','此解码视图未提供。不代表仪器或样本失败；不尝试新的解码。'],
  locked:['Locked inventory only; no decoded instrument records.','仅有加密文件清单；未解码仪器记录。'],
  template:['Template/setup only; no completed acquisition is implied.','仅模板／设置；不表示已完成数据采集。'],
  layout:['Retained trace axes do not match; this excerpt is unavailable. Existing readers and results are unaffected.','保留轨迹的坐标轴长度不匹配，无法提供此摘录。不影响已有读取器和结果。'],
  count:['Count in the retained decoded collection, not a completeness or acquisition-validity verdict.','保留的解码集合中的计数，不属于数据完整性或采集有效性判定。'],
  bound:['Bounded excerpt only; omitted metadata remains in the existing decoded object.','仅提供有界摘录；未显示的元数据仍保留在已有解码对象中。']
 };
 const value=v=>typeof v==='number'?(Object.is(v,-0)?'-0':String(v)):typeof v==='string'||typeof v==='boolean'?String(v):'';
 const status=v=>v==null?'unavailable':typeof v==='number'?Number.isFinite(v)?'number':'nonfinite':v===''?'empty':typeof v==='boolean'?'boolean':'text';
 function snapshot(run,index=0){
  const records=[],add=(field,v,source,scope,basisCode,suffix='')=>records.push({field,value:value(v),state:status(v),source,scope,basis:basisCode,suffix});
  const out={view:index+1,filename:run.file||'',records};
  if(run.pcrdLocked||run.isTemplate){add('availability',null,'', '',run.pcrdLocked?'locked':'template');return out;}
  const endpoints=(a,path,fn,why)=>{if(!Array.isArray(a))return;add('count',a.length,path,'', 'count');for(const i of new Set(a.length?[0,a.length-1]:[]))fn(a[i],i,path+'['+i+']',why);};
  const raw=run.zpcr||run.pcrd;
  if(raw&&Array.isArray(raw.reads)&&raw.reads.length){
   const selected=typeof MISSY_NATIVE_INSPECTOR==='undefined'?null:MISSY_NATIVE_INSPECTOR.snapshot(run,index);
   const choice=selected?.status==='provided'?selected.selection:{read:0,channel:0},r=raw.reads[choice.read],path=(run.zpcr?'zpcr':'pcrd')+'.reads['+choice.read+']';
   const scope={read:choice.read+1,name:r.name||'',channel:choice.channel+1};
   add('time',r.dateText,path+'.dateText',scope,'native_time');
   const temps=Object.entries(r.temps||{});for(const [key,o]of temps.slice(0,32)){const why=run.zpcr&&o?.kind==='measured'?'reader_measured':run.zpcr&&o?.kind==='setpoint'?'reader_setpoint':'stored_temperature';add('temperature',o?.c,path+'.temps.'+key+'.c',scope,why,key);}
   if(!temps.length)add('temperature',null,path+'.temps',scope,'missing');if(temps.length>32)add('omitted',temps.length-32,path+'.temps',scope,'bound');
   add('led_current',r.leds?.[choice.channel],path+'.leds['+choice.channel+']',scope,'led_setting');
   add('mask',r.channelMaskRaw,path+'.channelMaskRaw',scope,'mask');
   add('exposure',null,path,scope,'missing');
  }else if(run.eds){
   endpoints(run.eds.log?.temps,'eds.log.temps',(r,i,path)=>{for(const [field,k]of [['time',0],['sample_mean',1],['cover',2],['heatsink',3],['zone_span',4]])add(field,r?.[k],path+'['+k+']',{record:i+1},'eds_temperature');});
   endpoints(run.eds.log?.leds,'eds.log.leds',(r,i,path)=>{for(const [field,k]of [['time',0],['led_temperature',1],['led_current',2],['led_voltage',3],['junction',4]])add(field,r?.[k],path+'['+k+']',{record:i+1},'eds_led');});
   const exposure=run.cc?.qs?.exposure,filters=exposure&&typeof exposure==='object'?Object.entries(exposure):[];
   for(const [filter,a]of filters.slice(0,16))endpoints(a,'cc.qs.exposure['+JSON.stringify(filter)+']',(v,i,path)=>add('exposure',v,path,{record:i+1},'eds_exposure',filter));
   if(!filters.length)add('exposure',null,'cc.qs.exposure','','missing');if(filters.length>16)add('omitted',filters.length-16,'cc.qs.exposure','','bound');
  }else if(run.cc){
   const l=run.cc.log;
   if(l&&Array.isArray(l.seconds)&&Array.isArray(l.temp)){
    if(l.seconds.length!==l.temp.length)add('temperature',null,'cc.log','','layout');
    else{add('count',l.seconds.length,'cc.log','','count');for(const i of new Set(l.seconds.length?[0,l.seconds.length-1]:[])){add('time',l.seconds[i],'cc.log.seconds['+i+']',{record:i+1},'trace');add('temperature',l.temp[i],'cc.log.temp['+i+']',{record:i+1},'trace');}}
   }
   endpoints(run.cc.acq,'cc.acq',(r,i,path)=>{for(const [field,key]of [['time','ms'],['temperature','temp'],['channel','channel'],['exposure','intgr'],['valid','valid'],['reference','ref']])add(field,r?.[key],path+'.'+key,{record:i+1},'acquisition');});
  }
  if(!records.length)add('availability',null,'','','missing');
  add('gain',null,'','','missing');return out;
 }
 function rows(localized=false){const p=(en,zh)=>localized?t(en,zh):en;return RUNS.flatMap((run,i)=>snapshot(run,i).records.map(r=>({context_view:i+1,filename:run.file||'',context_scope:(r.scope&&typeof r.scope==='object'?(r.scope.read?p('Read ','读取序号 ')+r.scope.read+' · '+r.scope.name+p(' · channel ',' · 通道 ')+r.scope.channel:p('Record ','记录 ')+r.scope.record):r.scope)+(r.source?' · '+r.source:''),context_field:(localized?t(...labels[r.field]):labels[r.field][0])+(r.suffix?' · '+r.suffix:''),context_value:r.value,context_basis:localized?t(...basis[r.basis]):basis[r.basis][0],context_state:({number:p('Decoded finite number','解码后的有限数值'),nonfinite:p('Decoded non-finite/unavailable marker; not replaced','解码后的非有限／不可用标记；未替换'),empty:p('Empty decoded field; no value assumed','空解码字段；不假定数值'),unavailable:p('Unavailable; not zero','未提供；不等于零'),boolean:p('Stored Boolean flag; not a new QC verdict','保存的布尔标志；不属于新的质控判定'),text:p('Decoded text; unchanged','解码文本；保持不变')})[r.state],field_code:r.field,basis_code:r.basis,source_path:r.source})));}
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-instrument-context',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;let box=document.getElementById('missy-instrument-context');if(!box){box=document.createElement('details');box.id='missy-instrument-context';box.setAttribute('data-i18n-skip','');box.addEventListener('toggle',render);host.append(box);}
  box.hidden=!RUNS.length;const open=box.open;const title=document.createElement('summary');title.textContent=t('Thermal and optical context (read only)','温度与光学记录背景（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);if(!open)return;
  const note=document.createElement('p');note.textContent=t('Native context follows the applied reading-inspector read/channel. IXO/EDS show first/last retained records, not full logs. No new temperatures, ramp rates, uniformity, gain or calibration corrections are calculated. Source units and sensor basis are not newly established.','原始格式背景随读数检查器已应用的读取序号／通道变化。IXO／EDS 仅显示保留的首末记录，不是完整日志。不计算新的温度、升降温速率、均匀性、增益或校准修正，也不重新确定源单位和传感器依据。');box.append(note);
  const all=rows(true);RUNS.forEach((run,i)=>{const card=document.createElement('div'),h=document.createElement('h4'),dl=document.createElement('dl');h.textContent=(i+1)+' · '+run.file;card.append(h,dl);for(const r of all.filter(x=>x.context_view===i+1)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=r.context_field;dd.textContent=[r.context_value,r.context_state,r.context_scope,r.context_basis].filter(Boolean).join(' · ');dl.append(dt,dd);}box.append(card);});
 }
 MISSY_HOOKS.use('showTab','instrument-context/read-only-panel',263,next=>function(...args){const result=next(...args);render();return result;});
 MISSY_HOOKS.use('selDataItems','instrument-context/optional-table',263,next=>function(){return next().concat({id:'data:instrument_context',kind:'data',group:'Source provenance',title:'Thermal and optical context excerpt',note:'',ready:()=>RUNS.length>0,rows:()=>rows(true),file:'instrument_context_excerpt.csv',tableOptions:{full:true,columns:['filename','context_scope','context_field','context_value','context_state','context_basis']},text:()=>csvOf(rows(false))});});
 MISSY_HOOKS.use('exportCatalogue','instrument-context/optional-csv',263,next=>function(){return next().concat({title:'Thermal and optical context excerpt (CSV)',note:'',ready:()=>RUNS.length>0,run:()=>download('instrument_context_excerpt.csv',csvOf(rows(false)),'text/csv')});});
 MISSY_HOOKS.use('cmdExec','instrument-context/read-only-command',263,next=>async function(raw){if(String(raw).trim().toLowerCase()==='context'){cmdTable(rows(true).map(r=>[r.filename,[r.context_field,r.context_value,r.context_state,r.context_scope,r.context_basis].filter(Boolean).join(' · ')]),true);return;}return next(raw);});
 if(typeof REPORT_LITERAL_COLUMNS!=='undefined')for(const key of ['context_scope','context_value','context_basis'])REPORT_LITERAL_COLUMNS.add(key);
 CMD_HELP.push(['context','show read-only thermal and optical context']);Object.assign(ZH_TERMS,{'Thermal and optical context excerpt':'温度与光学背景摘录','Thermal and optical context excerpt (CSV)':'温度与光学背景摘录（CSV）','show read-only thermal and optical context':'显示只读温度与光学背景',context_scope:'记录范围',context_field:'记录字段',context_value:'记录值',context_state:'数值状态',context_basis:'记录依据'});
 const style=document.createElement('style');style.textContent='#missy-instrument-context{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-instrument-context[hidden]{display:none!important}#missy-instrument-context summary{cursor:pointer;font-weight:600}#missy-instrument-context h4,#missy-instrument-context p{overflow-wrap:anywhere}#missy-instrument-context dl{display:grid;grid-template-columns:minmax(160px,300px) minmax(0,1fr);gap:6px 14px}#missy-instrument-context dt,#missy-instrument-context dd{margin:0;min-width:0;overflow-wrap:anywhere}@media(max-width:600px){#missy-instrument-context dl{grid-template-columns:minmax(0,1fr)}#missy-instrument-context dd{margin-bottom:6px}}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{render();const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});});
 document.addEventListener('submit',e=>{if(e.composedPath().some(n=>n.id==='missy-native-inspector'))render();});
 return Object.freeze({snapshot,rows,render});
})();
window.MISSY_INSTRUMENT_CONTEXT=MISSY_INSTRUMENT_CONTEXT;
