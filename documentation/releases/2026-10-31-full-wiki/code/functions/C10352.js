()=>{
 const text=(en,zh)=>UI_LANG==='zh'?zh:en;
 const list=v=>Array.isArray(v)?v:[];
 const size=(r,c)=>Number.isInteger(r)&&r>0&&Number.isInteger(c)&&c>0?r+' × '+c:null;
 const words={
  reader:['Reader','读取器'],source:['Source SHA-256','源文件 SHA-256'],
  access:['Decoded view','已解码视图'],results:['Stored result records','保存的结果记录'],
  raw:['Raw acquisition reads','原始采集读数'],curves:['Decoded curve entries','已解码曲线条目'],
  sample:['Sample layout: rows × columns','样本布局：行数 × 列数'],
  physical:['Physical read layout: rows × columns','实际读取布局：行数 × 列数'],
  reference:['Declared reference rows','声明的参比行数'],statistics:['Stored read components','保存的读数组分'],
  thermal:['Thermal evidence','温度记录'],optical:['Optical evidence','光学记录'],
  declared:['Declared source data name','文件内声明的源数据名称'],limits:['Interpretation boundary','判读范围'],
 };
 const statuses={retained:['Retained','已保留'],not_exposed:['Not exposed by this decoded view','此解码视图未提供'],
  locked:['Locked inventory only','仅有加密文件清单'],template:['Template / setup only','仅模板／设置'],
  different_name:['Different name; not proof of corruption','名称不同；不能据此认定文件损坏'],same_name:['Same name','名称相同']};
 function snapshot(run,index=0){
  const raw=run.zpcr||run.pcrd,reads=list(raw?.reads),first=reads[0],meta=run.meta||{};
  const counts={amplification:list(run.wells).length,melting:list(run.tmWells).length,relative:list(run.rqResults).length,genotype:list(run.genoResults).length,other:list(run.otherResults).length};
  const facts=[];const add=(code,status,detail)=>facts.push({code,status_code:status,detail:String(detail??'')});
  add('reader','retained',String(run.reader?.id||'unknown')+' · '+String(run.reader?.version||'unknown'));
  add('source',meta.sourceSHA256?'retained':'not_exposed',meta.sourceSHA256||'');
  add('access',run.pcrdLocked?'locked':run.isTemplate?'template':'retained','');
  add('results','retained',JSON.stringify(counts));
  if(!run.pcrdLocked&&!run.isTemplate){
   add('raw',reads.length?'retained':'not_exposed',reads.length?String(reads.length):'');
   const curves=Object.keys(run.allCurves||{}).length;add('curves',curves?'retained':'not_exposed',curves?String(curves):'');
  }
  const sample=size(run.rows,run.cols);add('sample',sample?'retained':'not_exposed',sample||'');
  const physical=size(first?.rows,first?.cols);add('physical',physical?'retained':'not_exposed',physical||'');
  if(Number.isInteger(raw?.grid?.referenceRows))add('reference','retained',raw.grid.referenceRows);
  if(run.zpcr&&reads.length)add('statistics','retained','native_mean_sd_min_max');
  else if(run.pcrd&&Number.isInteger(first?.tupleWidth))add('statistics','retained','native_component_count:'+first.tupleWidth);
  else add('statistics','not_exposed','');
  const thermal=!!(run.cc?.thermal&&Object.keys(run.cc.thermal).length)||!!(first?.temps&&Object.keys(first.temps).length);
  const optical=!!list(run.cc?.acq).length||!!Object.keys(run.cc?.qs?.exposure||{}).length||!!first?.darkData?.length||!!first?.leds?.length;
  add('thermal',thermal?'retained':'not_exposed',thermal?'decoded_temperature_fields_or_diagnostics':'');
  add('optical',optical?'retained':'not_exposed',optical?'decoded_optical_fields':'');
  const declared=run.zpcr?.runInfo?.DataFile||run.pcrd?.runInfo?.DataFile||'';
  if(declared)add('declared',declared===run.file?'same_name':'different_name',declared);
  const boundary=run.pcrdLocked?'locked':run.isTemplate?'template':run.zpcr?'zpcr':run.pcrd?'pcrd':run.rdmlDoc?'exchange':'native';
  add('limits','retained',boundary);
  return {run_index:index+1,filename:run.file||'',facts};
 }
 function detail(f,localized){
  const choose=(en,zh)=>localized?text(en,zh):en;
  if(f.code==='results'){
   const c=JSON.parse(f.detail);return choose('Amplification ','扩增 ')+c.amplification+choose('; melting ','；熔解 ')+c.melting+choose('; relative ','；相对定量 ')+c.relative+choose('; genotype ','；基因分型 ')+c.genotype+choose('; other ','；其他 ')+c.other;
  }
  if(f.detail==='native_mean_sd_min_max')return choose('Native mean, SD, minimum and maximum; contributing count not established.','原始均值、标准差、最小值和最大值；未确定构成该读数的测量次数。');
  if(f.detail.startsWith('native_component_count:'))return f.detail.split(':')[1]+choose(' native components; missing components are not zero.',' 个原始组分；缺失组分不等于零。');
  if(f.detail==='decoded_temperature_fields_or_diagnostics')return choose('Temperature fields or derived diagnostics are present; measurement basis remains source-specific.','已提供温度字段或派生诊断值；测量依据以源文件为准。');
  if(f.detail==='decoded_optical_fields')return choose('Acquisition, dark/reference or optical-setting fields are present; calibration validity is not established.','已提供采集、暗信号／参比或光学设置字段；尚不能据此确认校准有效性。');
  if(f.code==='limits')return ({
   locked:choose('No decoded measurements; access credentials are not included.','未解码测量数据；不包含访问凭据。'),
   template:choose('Setup only; no completed acquisition is implied.','仅有设置；不表示已完成数据采集。'),
   zpcr:choose('Raw acquisitions; an optical channel does not establish dye or sample identity.','原始采集数据；光学通道不能据此确定染料或样本标识。'),
   pcrd:choose('Raw acquisitions; independently calculated Cq/Tm belong to a separate method.','原始采集数据；独立计算的 Cq／Tm 属于另一分析方法。'),
   exchange:choose('Exchange-file evidence; no new inference about the analysis producer is applied.','交换文件中的记录；不对分析结果的生成方作新的推断。'),
   native:choose('Stored native results and decoded fields; complete numeric precision and processing history may be unavailable.','保存的原始结果及已解码字段；完整数值精度和处理历史可能未提供。')
  })[f.detail];
  return f.detail;
 }
 function rows(localized=false){
  return RUNS.flatMap((run,i)=>snapshot(run,i).facts.map(f=>({evidence_view:i+1,filename:run.file||'',evidence_item:localized?text(...words[f.code]):words[f.code][0],evidence_state:localized?text(...statuses[f.status_code]):statuses[f.status_code][0],evidence_detail:detail(f,localized),evidence_code:f.code,status_code:f.status_code})));
 }
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-evidence-summary',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;
  let box=document.getElementById('missy-evidence-summary');
  if(!box){box=document.createElement('details');box.id='missy-evidence-summary';box.setAttribute('data-i18n-skip','');host.append(box);}
  box.hidden=!RUNS.length;const open=box.open;
  const title=document.createElement('summary');title.textContent=text('Data evidence and limits (read only)','数据记录与局限（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);
  if(!open)return;
  const note=document.createElement('p');note.className='hint';note.textContent=text('Decoded-view inventory only. Not a sample verdict or MISSY 0.3 conformance assessment.','仅列出此解码视图中的记录。不代表样本判定或 MISSY 0.3 符合性评估。');box.append(note);
  const all=rows(true);
  RUNS.forEach((run,i)=>{
   const card=document.createElement('div'),h=document.createElement('h4'),dl=document.createElement('dl');card.className='evidence-run';h.textContent=(i+1)+' · '+run.file;card.append(h,dl);
   for(const r of all.filter(r=>r.evidence_view===i+1)){const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=r.evidence_item;value.textContent=r.evidence_state+(r.evidence_detail?' · '+r.evidence_detail:'');dl.append(term,value);}
   box.append(card);
  });
 }
 function boot(){
  render();const box=document.getElementById('missy-evidence-summary');box?.addEventListener('toggle',render);
  const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});
  new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});
 }
 MISSY_HOOKS.use('showTab','evidence/read-only-panel',260,next=>function(...args){const result=next(...args);render();return result;});
 MISSY_HOOKS.use('selDataItems','evidence/optional-report-table',260,next=>function(){return next().concat({
  id:'data:evidence_limits',kind:'data',group:'Source provenance',title:'Data evidence and limits',note:'',
  ready:()=>RUNS.length>0,rows:()=>rows(true),file:'data_evidence_limits.csv',
  tableOptions:{full:true,columns:['evidence_view','filename','evidence_item','evidence_state','evidence_detail']},text:()=>csvOf(rows(false))
 });});
 MISSY_HOOKS.use('exportCatalogue','evidence/optional-csv',260,next=>function(){return next().concat({
  title:'Data evidence and limits (CSV)',note:'',ready:()=>RUNS.length>0,
  run:()=>download('data_evidence_limits.csv',csvOf(rows(false)),'text/csv')
 });});
 MISSY_HOOKS.use('cmdExec','evidence/read-only-command',260,next=>async function(raw){
  if(String(raw).trim().toLowerCase()==='evidence'){cmdTable(rows(true).map(r=>[r.evidence_view+' · '+r.filename,[r.evidence_item,r.evidence_state,r.evidence_detail].filter(Boolean).join(' · ')]),true);return;}
  return next(raw);
 });
 if(typeof REPORT_LITERAL_COLUMNS!=='undefined')REPORT_LITERAL_COLUMNS.add('evidence_detail');
 CMD_HELP.push(['evidence','show read-only data evidence and limits']);
 Object.assign(ZH_TERMS,{'Data evidence and limits':'数据记录与局限','Data evidence and limits (CSV)':'数据记录与局限（CSV）','show read-only data evidence and limits':'显示只读数据记录与局限',evidence_view:'运行序号',evidence_item:'记录项目',evidence_state:'记录状态',evidence_detail:'记录详情'});
 const style=document.createElement('style');style.textContent='#missy-evidence-summary{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-evidence-summary[hidden]{display:none!important}#missy-evidence-summary summary{cursor:pointer;font-weight:600}#missy-evidence-summary .evidence-run{padding:10px 0;border-top:1px solid #e5e7eb}#missy-evidence-summary h4{margin:6px 0;overflow-wrap:anywhere}#missy-evidence-summary dl{display:grid;grid-template-columns:minmax(180px,260px) minmax(0,1fr);gap:6px 14px;margin:8px 0}#missy-evidence-summary dt,#missy-evidence-summary dd{margin:0;min-width:0;overflow-wrap:anywhere}#missy-evidence-summary dt{font-weight:600}@media(max-width:600px){#missy-evidence-summary dl{grid-template-columns:minmax(0,1fr)}#missy-evidence-summary dd{margin-bottom:6px}}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',boot);
 return Object.freeze({snapshot,rows,render});
}