/* P09/M21: retained header excerpts/count only. No time/validity/correction logic. */
const MISSY_CALIBRATION_METADATA=(()=>{
 const t=(en,zh)=>UI_LANG==='zh'?zh:en,limit=20;
 const fields=['file','name','id','version','ts','exp'];
 const labels={record_count:['Retained record count','保留的记录数'],omitted_record_count:['Header records outside this excerpt','本摘录未显示的头部记录数'],file:['Header filename','头部文件名称'],name:['Calibration name','校准名称'],id:['Calibration ID','校准标识'],version:['Stored version','保存的版本'],ts:['Stored timestamp (unconverted)','保存的时间戳（未转换）'],exp:['Stored expiry field (unevaluated)','保存的到期字段（未评估）'],availability:['Availability','提供情况']};
 const states={provided:['Retained value','已保留的值'],empty:['Empty retained field','保留字段为空'],unavailable:['Field unavailable; not zero','字段不可用；不等于零'],native_nonfinite:['Retained non-finite token','保留的非有限标记'],count_only:['Declared count only; header contents not exposed here','仅声明的计数；此处未提供头部内容'],not_exposed:['Not exposed by this decoded view','此解码视图未提供'],locked:['Locked inventory; no calibration headers decoded here','加密文件清单；此处未解码校准头部']};
 function snapshot(run,index=0){
  const out=[],scope=run.pcrdLocked?'locked':run.isTemplate?'template':'decoded';
  const add=(record,field,value,state,path)=>out.push({view:index+1,filename:run.file||'',scope,record,field,value,state,source_path:path});
  const scalar=v=>v==null?null:typeof v==='number'?(Object.is(v,-0)?'-0':String(v)):typeof v==='string'||typeof v==='boolean'?String(v):null;
  const put=(record,field,v,path,state)=>add(record,field,scalar(v),state||(v==null||scalar(v)===null?'unavailable':v===''?'empty':typeof v==='number'&&!Number.isFinite(v)?'native_nonfinite':'provided'),path);
  if(run.pcrdLocked){add(null,'availability',null,'locked','');return out;}
  if(Array.isArray(run.eds?.calibrations)){
   const records=run.eds.calibrations;put(null,'record_count',records.length,'eds.calibrations.length');
   for(let i=0;i<Math.min(limit,records.length);i++)for(const key of fields)put(i+1,key,records[i]?.[key],'eds.calibrations['+i+'].'+key);
   if(records.length>limit)put(null,'omitted_record_count',records.length-limit,'eds.calibrations.length');
   return out;
  }
  const count=run.pcrd?.calibrationRecords;
  if(Number.isSafeInteger(count)&&count>=0){put(null,'record_count',count,'pcrd.calibrationRecords','count_only');return out;}
  add(null,'availability',null,'not_exposed','');return out;
 }
 function rows(runs){return runs.flatMap((run,i)=>snapshot(run,i).map(r=>({calibration_view:r.view,filename:r.filename,calibration_scope:r.scope,calibration_record:r.record,calibration_field:r.field,calibration_value:r.value,calibration_state:r.state,source_path:r.source_path})));}
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-calibration-metadata',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;let box=document.getElementById('missy-calibration-metadata');
  if(!box){box=document.createElement('details');box.id='missy-calibration-metadata';box.setAttribute('data-i18n-skip','');box.addEventListener('toggle',render);host.append(box);}
  box.hidden=!RUNS.length;const title=document.createElement('summary');title.textContent=t('Retained calibration metadata (read only)','保留的校准元数据（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);if(!box.open)return;
  const p=document.createElement('p');p.textContent=t('QuantStudio: first 20 retained header records. PCRD: declared count only. Timestamps/expiry fields remain unconverted and unevaluated; presence does not establish validity, traceability or fitness. Template headers do not imply a completed run. Operator identities and calibration coefficients are outside this excerpt. No corrections, expiry decisions or existing calibration checks are changed.','QuantStudio：前20条保留的头部记录。PCRD：仅声明的计数。时间戳与到期字段不转换也不评估；记录存在不能证明有效性、计量溯源性或适用性。模板头部不代表已完成运行。操作者身份与校准系数不在本摘录范围内。不更改任何校正、到期判定或已有校准检查。');box.append(p);
  const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');const titles=[t('View / filename / scope','视图／文件名称／范围'),t('Record / field','记录／字段'),t('Retained value','保留的值'),t('Evidence state / source','记录状态／来源')];for(const text of titles){const th=document.createElement('th');th.scope='col';th.textContent=text;tr.append(th);}head.append(tr);table.append(head);const body=document.createElement('tbody');
  RUNS.forEach((run,i)=>{for(const r of snapshot(run,i)){const tr=document.createElement('tr'),scope=r.scope==='template'?t('Template/setup','模板／设置'):r.scope==='locked'?t('Locked','加密锁定'):t('Decoded view','解码视图');const values=[r.view+' · '+r.filename+' · '+scope,(r.record===null?'':r.record+' · ')+t(...labels[r.field]),r.value===null?t('Unavailable','不可用'):r.value,t(...states[r.state])+(r.source_path?' · '+r.source_path:'')];values.forEach((value,j)=>{const td=document.createElement('td');td.setAttribute('data-label',titles[j]);td.textContent=value;tr.append(td);});body.append(tr);}});table.append(body);box.append(table);
  const button=document.createElement('button');button.type='button';button.textContent=t('Download calibration metadata excerpt (CSV)','下载校准元数据摘录（CSV）');button.onclick=()=>download('calibration_metadata_excerpt.csv',csvOf(rows(RUNS)),'text/csv');box.append(button);
 }
 MISSY_HOOKS.use('showTab','calibration-metadata/retained-headers',269,next=>function(...args){const result=next(...args);render();return result;});
 const style=document.createElement('style');style.textContent='#missy-calibration-metadata{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-calibration-metadata[hidden]{display:none!important}#missy-calibration-metadata summary{cursor:pointer;font-weight:600}#missy-calibration-metadata p{overflow-wrap:anywhere}#missy-calibration-metadata table{width:100%;table-layout:fixed;border-collapse:collapse;margin:10px 0}#missy-calibration-metadata th,#missy-calibration-metadata td{padding:6px;text-align:left;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid #d8dee8}#missy-calibration-metadata button{max-width:100%;white-space:normal}@media(max-width:600px){#missy-calibration-metadata table,#missy-calibration-metadata tbody,#missy-calibration-metadata tr,#missy-calibration-metadata td{display:block;width:auto}#missy-calibration-metadata thead{display:none}#missy-calibration-metadata tr{border:1px solid #d8dee8;margin:8px 0}#missy-calibration-metadata td{border:0}#missy-calibration-metadata td::before{content:attr(data-label);display:block;font-weight:600}}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{render();const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});});
 return Object.freeze({snapshot,rows,render});
})();
window.MISSY_CALIBRATION_METADATA=MISSY_CALIBRATION_METADATA;
