/* P01/M01: display existing registration metadata only. Never invoke readers. */
const MISSY_READER_INVENTORY=(()=>{
 const t=(en,zh)=>UI_LANG==='zh'?zh:en;
 function snapshot(){
  return {build:typeof APP_VERSION==='undefined'?null:APP_VERSION,model:typeof MISSY_MODEL_VERSION==='undefined'?null:MISSY_MODEL_VERSION,
   readers:(typeof MISSY_READERS==='undefined'?[]:MISSY_READERS).map(r=>({reader_id:r.id,adapter_version:r.version,extensions:Array.isArray(r.extensions)?r.extensions.join(', '):''}))};
 }
 function csvRows(){const s=snapshot();return s.readers.map(r=>({display_build:s.build,decoded_model_version:s.model,...r}));}
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-reader-inventory',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;let box=document.getElementById('missy-reader-inventory');
  if(!box){box=document.createElement('details');box.id='missy-reader-inventory';box.setAttribute('data-i18n-skip','');box.addEventListener('toggle',render);host.append(box);}
  const title=document.createElement('summary');title.textContent=t('Registered readers in this build (read only)','本版本已注册的读取器（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);if(!box.open)return;
  const s=snapshot(),info=document.createElement('p');info.textContent=t('Display build: ','显示版本：')+String(s.build??'')+' · '+t('Decoded model version: ','解码模型版本：')+String(s.model??'');box.append(info);
  const note=document.createElement('p');note.textContent=t('These are current registration declarations, not vendor algorithm versions or conformance results. A listed extension does not guarantee every file variant is supported. ZIP batch intake is separate from these readers and does not declare MISSY package support. No files are inspected by this inventory.','以下为当前注册声明，不代表厂商算法版本或符合性结果。列出的扩展名不能保证支持所有文件变体。ZIP批量加载与这些读取器分开，不表示支持MISSY数据包。本清单不检查任何文件。');box.append(note);
  const table=document.createElement('table'),head=document.createElement('thead'),tr=document.createElement('tr');for(const label of [t('Reader ID','读取器标识'),t('Adapter version','适配器版本'),t('Registered extensions','已注册扩展名')]){const th=document.createElement('th');th.scope='col';th.textContent=label;tr.append(th);}head.append(tr);table.append(head);
  const body=document.createElement('tbody');for(const row of s.readers){const tr=document.createElement('tr');for(const key of ['reader_id','adapter_version','extensions']){const td=document.createElement('td');td.textContent=String(row[key]??'');tr.append(td);}body.append(tr);}table.append(body);box.append(table);
  if(!s.readers.length){const empty=document.createElement('p');empty.textContent=t('No reader registrations are exposed.','未提供读取器注册信息。');box.append(empty);}
  const button=document.createElement('button');button.type='button';button.textContent=t('Download reader inventory (CSV)','下载读取器清单（CSV）');button.onclick=()=>download('registered_readers.csv',csvOf(csvRows()),'text/csv');box.append(button);
 }
 MISSY_HOOKS.use('showTab','reader-inventory/registration-display',266,next=>function(...args){const result=next(...args);render();return result;});
 const style=document.createElement('style');style.textContent='#missy-reader-inventory{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-reader-inventory summary{cursor:pointer;font-weight:600}#missy-reader-inventory p{overflow-wrap:anywhere}#missy-reader-inventory table{table-layout:fixed;width:100%;border-collapse:collapse;margin-bottom:10px}#missy-reader-inventory th,#missy-reader-inventory td{padding:6px;text-align:left;vertical-align:top;overflow-wrap:anywhere;border-bottom:1px solid #d8dee8}#missy-reader-inventory button{max-width:100%;white-space:normal}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{render();new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});});
 return Object.freeze({snapshot,csvRows,render});
})();
window.MISSY_READER_INVENTORY=MISSY_READER_INVENTORY;
