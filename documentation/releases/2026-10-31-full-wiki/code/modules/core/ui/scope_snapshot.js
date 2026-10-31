/* Read-only current configuration/mask snapshot. No evaluation, mask edits,
 * cache writes, analytical calculations or persistent audit/history claims. */
const MISSY_SCOPE_SNAPSHOT=(()=>{
 const t=(en,zh)=>UI_LANG==='zh'?zh:en;
 const families={wells:['Amplification records','扩增记录'],tmWells:['Melting records','熔解记录'],rqResults:['Relative-result records','相对定量结果记录'],genoResults:['Genotype records','基因分型记录'],otherResults:['Other stored records','其他保存的记录']};
 const labels={profile:['Current profile name','当前配置名称'],version:['Current profile version','当前配置版本'],review:['Stored review-only flag','保存的仅供审核标志'],locked:['Stored profile-lock flag','保存的配置锁定标志'],pending:['Sample review pending','样本审核待完成'],revision:['Existing mask revision','已有掩码修订号'],draft:['Draft differs from applied mask','草稿与已应用掩码不同'],selected:['Currently selected report-item count','当前所选报告项目数'],source:['Source scope','源数据范围']};
 const scalar=v=>v==null?'':String(v);
 function snapshot(){
  const mask=typeof SAMPLE_SELECTION==='undefined'?null:SAMPLE_SELECTION,profile=typeof SOP==='undefined'?{}:SOP;
  const excluded=mask?.excluded,draft=mask?.draft;
  const draftDiff=excluded instanceof Set&&draft instanceof Set?(excluded.size!==draft.size||[...excluded].some(k=>!draft.has(k))):null;
  const config={profile:profile.name??null,version:profile.version??null,review:typeof profile.reviewOnly==='boolean'?profile.reviewOnly:null,locked:typeof profile.locked==='boolean'?profile.locked:null,pending:mask?!!mask.pending:null,revision:mask?.revision??null,draft:draftDiff,selected:typeof SEL_STATE==='undefined'?null:SEL_STATE.ids?.size??null};
  const runs=RUNS.map((run,i)=>({view:i+1,filename:run.file||'',source:run.pcrdLocked?'locked':run.isTemplate?'template':run.zpcr||run.pcrd?'native':'stored',families:Object.keys(families).map(key=>{
   const records=Array.isArray(run[key])?run[key]:[],available=!!mask&&!mask.pending&&typeof ssIncluded==='function';let included=null;
   if(available){included=0;for(const r of records)if(ssIncluded(run,r))included++;}
   return {key,total:records.length,included,excluded:included===null?null:records.length-included,state:mask?.pending?'pending':available?'applied':'unavailable'};
  })}));return {config,runs};
 }
 function rows(localized=false){
  const p=(en,zh)=>localized?t(en,zh):en,s=snapshot(),rows=[];
  const configNotes={profile:p('Configuration identity only; not proof of laboratory approval.','仅为配置标识；不能证明已获实验室批准。'),version:p('Copied from current configuration; no new version or hash is generated.','复制当前配置；不生成新的版本或哈希。'),review:p('Existing flag only; not a new release decision.','仅显示已有标志；不作新的发布判定。'),locked:p('Existing lock flag; not authenticated approval or audit history.','已有锁定标志；不代表经过身份认证的批准或审计历史。'),pending:p('Pending review withholds included/excluded counts; it does not turn samples negative.','审核待完成时不提供纳入／排除计数；不将样本判为阴性。'),revision:p('Existing sample-mask revision; this snapshot does not increment it.','已有样本掩码修订号；此快照不增加修订号。'),draft:p('Draft is not the applied selection. No draft keys or sample names are exported here.','草稿不是已应用的选择。此处不导出草稿键或样本名称。'),selected:p('Count only; selected IDs/options and report selection are unchanged.','仅计数；所选标识／选项和报告选择保持不变。')};
  for(const [key,value]of Object.entries(s.config))rows.push({filename:'',scope_item:localized?t(...labels[key]):labels[key][0],scope_value:localized&&typeof value==='boolean'?t(String(value),value?'是':'否'):localized&&key==='profile'&&value==='No SOP selected'?t(value,'尚未选择SOP'):scalar(value),scope_state:value===null?p('Unavailable; not zero','未提供；不等于零'):p('Current configuration value','当前配置值'),scope_basis:configNotes[key],scope_code:key});
  for(const run of s.runs){
   const sourceNote=({locked:p('Locked inventory; no decoded sample measurements.','加密文件清单；未解码样本测量数据。'),template:p('Template/setup only; absent results do not mean failed PCR.','仅模板／设置；缺少结果不表示 PCR 失败。'),native:p('Original native acquisitions/hardware evidence remain at full source scope. Independent PCRD calculations are not invoked or counted as stored records here.','原始采集／硬件记录保留完整源范围。此处不调用独立 PCRD 计算，也不将其计入保存的结果记录。'),stored:p('Stored result collections only. Source records/curves are not filtered or modified by this snapshot.','仅统计保存的结果集合。此快照不筛选或修改源记录／曲线。')})[run.source];
   rows.push({filename:run.filename,scope_item:localized?t(...labels.source):labels.source[0],scope_value:'',scope_state:p('Read only','只读'),scope_basis:sourceNote,scope_code:'source',scope_view:run.view});
   for(const f of run.families){const state=f.state==='pending'?p('Pending review; mask counts withheld','审核待完成；不提供掩码计数'):f.state==='applied'?p('Applied user mask only','仅已应用的用户掩码'):p('Mask unavailable; no inclusion assumed','未提供掩码；不假定纳入情况');
    const detail=p('Stored: ','保存：')+f.total+(f.included===null?'':p('; mask included: ','；掩码纳入：')+f.included+p('; mask excluded: ','；掩码排除：')+f.excluded);
    rows.push({filename:run.filename,scope_item:localized?t(...families[f.key]):families[f.key][0],scope_value:detail,scope_state:state,scope_basis:p('Counts are records, not unique samples or valid results. Native omissions, control acceptance and method rules remain separate.','此处计数的是记录，不是唯一的样本数或有效结果数。原始剔除标志、对照接受性和方法规则仍单独处理。'),scope_code:f.key,scope_view:run.view,scope_total:f.total,scope_included:f.included,scope_excluded:f.excluded});}
  }return rows;
 }
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-scope-snapshot',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;let box=document.getElementById('missy-scope-snapshot');if(!box){box=document.createElement('details');box.id='missy-scope-snapshot';box.setAttribute('data-i18n-skip','');box.addEventListener('toggle',render);host.append(box);}
  box.hidden=!RUNS.length;const open=box.open;const title=document.createElement('summary');title.textContent=t('Current report and sample scope (read only)','当前报告与样本范围（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);if(!open)return;
  const note=document.createElement('p');note.textContent=t('Current state only, not authenticated audit history. Refresh after changing selections. Included here means included by the applied user mask, not a valid/released sample result.','仅为当前状态，不是经过身份认证的审计历史。更改选择后请刷新。此处纳入仅表示被已应用的用户掩码纳入，不表示样本结果有效或已发布。');box.append(note);
  const button=document.createElement('button');button.type='button';button.textContent=t('Refresh snapshot','刷新快照');button.onclick=render;box.append(button);
  const dl=document.createElement('dl');for(const r of rows(true)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=(r.filename?r.scope_view+' · '+r.filename+' · ':'')+r.scope_item;dd.textContent=[r.scope_value,r.scope_state,r.scope_basis].filter(Boolean).join(' · ');dl.append(dt,dd);}box.append(dl);
 }
 MISSY_HOOKS.use('showTab','scope-snapshot/read-only-panel',264,next=>function(...args){const result=next(...args);render();return result;});
 MISSY_HOOKS.use('selDataItems','scope-snapshot/optional-table',264,next=>function(){return next().concat({id:'data:scope_snapshot',kind:'data',group:'Source provenance',title:'Current report and sample scope',note:'',ready:()=>RUNS.length>0,rows:()=>rows(true),file:'current_scope_snapshot.csv',tableOptions:{full:true,columns:['filename','scope_item','scope_value','scope_state','scope_basis']},text:()=>csvOf(rows(false))});});
 MISSY_HOOKS.use('exportCatalogue','scope-snapshot/optional-csv',264,next=>function(){return next().concat({title:'Current report and sample scope (CSV)',note:'',ready:()=>RUNS.length>0,run:()=>download('current_scope_snapshot.csv',csvOf(rows(false)),'text/csv')});});
 MISSY_HOOKS.use('cmdExec','scope-snapshot/read-only-command',264,next=>async function(raw){if(String(raw).trim().toLowerCase()==='scope'){cmdTable(rows(true).map(r=>[r.filename||r.scope_item,[r.scope_item,r.scope_value,r.scope_state,r.scope_basis].filter(Boolean).join(' · ')]),true);return;}return next(raw);});
 if(typeof REPORT_LITERAL_COLUMNS!=='undefined')for(const key of ['scope_value','scope_basis'])REPORT_LITERAL_COLUMNS.add(key);
 CMD_HELP.push(['scope','show the current read-only report and sample scope']);Object.assign(ZH_TERMS,{'Current report and sample scope':'当前报告与样本范围','Current report and sample scope (CSV)':'当前报告与样本范围（CSV）','show the current read-only report and sample scope':'显示当前只读报告与样本范围',scope_item:'范围项目',scope_value:'范围值',scope_state:'范围状态',scope_basis:'范围依据'});
 const style=document.createElement('style');style.textContent='#missy-scope-snapshot{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-scope-snapshot[hidden]{display:none!important}#missy-scope-snapshot summary{cursor:pointer;font-weight:600}#missy-scope-snapshot p{overflow-wrap:anywhere}#missy-scope-snapshot dl{display:grid;grid-template-columns:minmax(160px,340px) minmax(0,1fr);gap:6px 14px}#missy-scope-snapshot dt,#missy-scope-snapshot dd{margin:0;min-width:0;overflow-wrap:anywhere}@media(max-width:600px){#missy-scope-snapshot dl{grid-template-columns:minmax(0,1fr)}#missy-scope-snapshot dd{margin-bottom:6px}}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{render();const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});});
 return Object.freeze({snapshot,rows,render});
})();
window.MISSY_SCOPE_SNAPSHOT=MISSY_SCOPE_SNAPSHOT;
