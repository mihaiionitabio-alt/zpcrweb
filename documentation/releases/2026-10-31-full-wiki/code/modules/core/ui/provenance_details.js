/* Display-only provenance. Never computes a digest, validates a calibration,
 * classifies a sample, changes native objects or compares runs for suppression. */
const MISSY_PROVENANCE=(()=>{
 const t=(en,zh)=>UI_LANG==='zh'?zh:en;
 const labels={build:['MISSY display build','MISSY 显示版本'],model:['Decoded model version','解码模型版本'],bytes:['Original source bytes','源文件字节数'],source:['Original source SHA-256','源文件 SHA-256'],crc:['Existing archive CRC evidence','已有压缩包 CRC 记录'],object:['Existing stored-checksum comparison','已有保存校验值比较'],scope:['Integrity interpretation','完整性判读范围'],protocol:['Native protocol fingerprint','原始协议指纹'],acquisition:['Native acquisition fingerprint','原始采集指纹'],calibration:['Declared calibration record count','声明的校准记录数'],audit:['Authenticated audit history','经过身份认证的审计历史']};
 const states={provided:['Provided evidence','已提供的记录'],not_exposed:['Not exposed by this decoded view','此解码视图未提供']};
 const token=(code,value)=>({code,value});
 function snapshot(run,index=0){
  const facts=[],meta=run.meta||{},integrity=run.integrity||{};
  const add=(code,value,method='')=>facts.push({code,value,method,status:value===null?'not_exposed':'provided'});
  add('build',typeof APP_VERSION==='undefined'?null:APP_VERSION,'display_only');
  add('model',run.reader?.modelVersion??null,'model_only');
  add('bytes',Number.isSafeInteger(meta.sourceBytes)&&meta.sourceBytes>=0?meta.sourceBytes:null);
  add('source',meta.sourceSHA256||null,'source_sha256');
  if(typeof integrity.crcVerified==='boolean')add('crc',token('boolean',integrity.crcVerified),'crc_flag');
  else if(typeof integrity.zipCrcOk==='boolean')add('crc',token('boolean',integrity.zipCrcOk),'eds_crc');
  else add('crc',null,'crc_unknown');
  if(typeof integrity.ok==='boolean'&&['ixo','eds'].includes(integrity.kind))add('object',token('boolean',integrity.ok),integrity.kind==='ixo'?'ixo_object':'eds_object');
  else add('object',null);
  add('scope',token('scope',run.pcrdLocked?'locked':integrity.kind||'unknown'),'scope');
  if(run.pcrd?.protocolSHA256)add('protocol',run.pcrd.protocolSHA256,'pcrd_protocol_utf8');
  else if(run.cfxRDML?.protocolSHA256)add('protocol',run.cfxRDML.protocolSHA256,'cfx_protocol_xml_utf8');
  else add('protocol',null);
  if(run.zpcr?.evidence?.acquisitionSHA256)add('acquisition',run.zpcr.evidence.acquisitionSHA256,'zpcr_member_frame_v1');
  else if(run.pcrd?.acquisitionSHA256)add('acquisition',run.pcrd.acquisitionSHA256,'pcrd_native_json_v1');
  else add('acquisition',null);
  add('calibration',Number.isSafeInteger(run.pcrd?.calibrationRecords)&&run.pcrd.calibrationRecords>=0?run.pcrd.calibrationRecords:null,'count_not_validity');
  // Instrument text logs alone are not authenticated actor/reason/change history.
  add('audit',null,'audit_unknown');
  return {run_index:index+1,filename:run.file||'',facts};
 }
 function explanation(method,localized){
  const pick=(en,zh)=>localized?t(en,zh):en;
  const m={
   display_only:pick('Version of this MISSY display; not the instrument analysis algorithm.','此 MISSY 显示版本；不代表仪器分析算法版本。'),
   model_only:pick('Existing reader model; not MISSY standard conformance.','已有读取器模型；不代表符合 MISSY 标准。'),
   source_sha256:pick('SHA-256 of original source bytes. Identifies bytes; does not authenticate their origin.','源文件字节的 SHA-256。用于标识字节内容；不能认证其来源。'),
   crc_flag:pick('Existing reader CRC flag only; consult the original integrity view for coverage. False does not alone establish corruption.','仅显示已有读取器的 CRC 标志；检查范围请查看原完整性视图。否值本身不能证明文件损坏。'),
   eds_crc:pick('Existing EDS all-entry CRC flag; no new archive check is performed.','已有 EDS 全部条目的 CRC 标志；此处不执行新的压缩包检查。'),
   crc_unknown:pick('No CRC coverage is inferred from the filename or source hash.','不根据文件名或源文件哈希推断 CRC 检查范围。'),
   ixo_object:pick('Stored IXO object-stream checksum versus existing computed checksum; not a signature.','保存的 IXO 对象流校验值与已有计算值的比较；不属于数字签名。'),
   eds_object:pick('Existing EDS stored/computed archive-member checksum comparison; not a signature.','已有 EDS 压缩包成员校验值的保存值与计算值比较；不属于数字签名。'),
   pcrd_protocol_utf8:pick('PCRD: SHA-256 of UTF-8 decoded protocolText. Format-specific; not a universal protocol identity.','PCRD：解码后 protocolText 的 UTF-8 字节的 SHA-256。仅适用于该格式；不是通用协议标识。'),
   cfx_protocol_xml_utf8:pick('CFX RDML: SHA-256 of UTF-8 decoded protocolXML. Serialization-specific, not XML canonicalization.','CFX RDML：解码后 protocolXML 的 UTF-8 字节的 SHA-256。取决于序列化形式；未进行 XML 规范化。'),
   zpcr_member_frame_v1:pick('ZPCR native method: SHA-256 of little-endian uint32 read count, then ordered raw members each framed by little-endian uint32 byte length. Filenames excluded.','ZPCR 原始方法：按小端 uint32 编码读取次数，再按顺序对每个原始成员写入小端 uint32 字节长度及其字节，计算 SHA-256。不包含文件名。'),
   pcrd_native_json_v1:pick('PCRD native method: SHA-256 of UTF-8 JSON.stringify([rows, cols, channels, reads.map(r => [r.step, r.cycle, r.originalData, r.originalDark])]).','PCRD 原始方法：对 UTF-8 编码的 JSON.stringify([rows, cols, channels, reads.map(r => [r.step, r.cycle, r.originalData, r.originalDark])]) 计算 SHA-256。'),
   count_not_validity:pick('PCRD decoded calibrationCollection/CalibrationData count only. Zero does not mean uncalibrated; a positive count does not establish validity, expiry or traceability.','仅为 PCRD 解码后 calibrationCollection/CalibrationData 的记录数。零不表示未校准；非零也不能证明校准有效性、有效期或溯源性。'),
   audit_unknown:pick('No authenticated audit history is exposed by this inventory. Instrument logs are not treated as authenticated audit records.','此清单未提供经过身份认证的审计历史。不将仪器日志视为经过身份认证的审计记录。')
  };
  return m[method]||'';
 }
 function valueText(f,localized){
  const pick=(en,zh)=>localized?t(en,zh):en,v=f.value;
  if(v===null)return '';
  if(v?.code==='boolean')return v.value?pick('True','是'):pick('False','否');
  if(v?.code==='scope')return v.value==='locked'?pick('Source bytes and encrypted inventory only; payload remains locked.','仅有源文件字节和加密文件清单；有效载荷仍处于加密状态。'):pick('Existing reader evidence only. Integrity checks do not authenticate the producer, establish calibration validity or certify a sample result.','仅显示已有读取器记录。完整性检查不能认证生成方、证明校准有效性或认证样本结果。');
  return String(v);
 }
 function rows(localized=false){return RUNS.flatMap((r,i)=>snapshot(r,i).facts.map(f=>({provenance_view:i+1,filename:r.file||'',provenance_item:localized?t(...labels[f.code]):labels[f.code][0],provenance_state:localized?t(...states[f.status]):states[f.status][0],provenance_value:valueText(f,localized),provenance_method:explanation(f.method,localized),provenance_code:f.code,method_code:f.method,status_code:f.status})));}
 function render(){return MISSY_EVIDENCE_A11Y.refresh('missy-provenance-details',renderContent);}
 function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;
  let box=document.getElementById('missy-provenance-details');if(!box){box=document.createElement('details');box.id='missy-provenance-details';box.setAttribute('data-i18n-skip','');host.append(box);box.addEventListener('toggle',render);}
  box.hidden=!RUNS.length;const open=box.open;const title=document.createElement('summary');title.textContent=t('Source identity and provenance (read only)','源文件标识与来源记录（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);if(!open)return;
  const note=document.createElement('p');note.textContent=t('Fingerprints with different methods are not comparable. Equal content does not establish one acquisition or justify suppressing a run.','不同方法的指纹不能直接比较。内容相同不能证明属于同一次采集，也不能作为隐藏运行记录的依据。');box.append(note);
  const all=rows(true);RUNS.forEach((r,i)=>{const card=document.createElement('div'),h=document.createElement('h4'),dl=document.createElement('dl');h.textContent=(i+1)+' · '+r.file;card.append(h,dl);for(const row of all.filter(x=>x.provenance_view===i+1)){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=row.provenance_item;dd.textContent=[row.provenance_state,row.provenance_value,row.provenance_method].filter(Boolean).join(' · ');dl.append(dt,dd);}box.append(card);});
 }
 MISSY_HOOKS.use('showTab','provenance/read-only-panel',261,next=>function(...args){const out=next(...args);render();return out;});
 MISSY_HOOKS.use('selDataItems','provenance/optional-table',261,next=>function(){return next().concat({id:'data:provenance_details',kind:'data',group:'Source provenance',title:'Source identity and provenance',note:'',ready:()=>RUNS.length>0,rows:()=>rows(true),file:'source_identity_provenance.csv',tableOptions:{full:true,columns:['provenance_view','filename','provenance_item','provenance_state','provenance_value','provenance_method']},text:()=>csvOf(rows(false))});});
 MISSY_HOOKS.use('exportCatalogue','provenance/optional-csv',261,next=>function(){return next().concat({title:'Source identity and provenance (CSV)',note:'',ready:()=>RUNS.length>0,run:()=>download('source_identity_provenance.csv',csvOf(rows(false)),'text/csv')});});
 MISSY_HOOKS.use('cmdExec','provenance/read-only-command',261,next=>async function(raw){if(String(raw).trim().toLowerCase()==='provenance'){cmdTable(rows(true).map(r=>[r.provenance_view+' · '+r.filename,[r.provenance_item,r.provenance_state,r.provenance_value,r.provenance_method].filter(Boolean).join(' · ')]),true);return;}return next(raw);});
 if(typeof REPORT_LITERAL_COLUMNS!=='undefined'){REPORT_LITERAL_COLUMNS.add('provenance_value');REPORT_LITERAL_COLUMNS.add('provenance_method');}
 CMD_HELP.push(['provenance','show read-only source identity and provenance']);
 Object.assign(ZH_TERMS,{'Source identity and provenance':'源文件标识与来源记录','Source identity and provenance (CSV)':'源文件标识与来源记录（CSV）','show read-only source identity and provenance':'显示只读源文件标识与来源记录',provenance_view:'运行序号',provenance_item:'记录项目',provenance_state:'记录状态',provenance_value:'记录值',provenance_method:'方法与范围'});
 const style=document.createElement('style');style.textContent='#missy-provenance-details{margin-top:16px;border-top:1px solid #d8dee8;padding-top:10px}#missy-provenance-details[hidden]{display:none!important}#missy-provenance-details summary{cursor:pointer;font-weight:600}#missy-provenance-details h4{margin:12px 0 6px;overflow-wrap:anywhere}#missy-provenance-details dl{display:grid;grid-template-columns:minmax(180px,260px) minmax(0,1fr);gap:6px 14px;margin:8px 0}#missy-provenance-details dt,#missy-provenance-details dd{margin:0;min-width:0;overflow-wrap:anywhere}#missy-provenance-details dt{font-weight:600}@media(max-width:600px){#missy-provenance-details dl{grid-template-columns:minmax(0,1fr)}#missy-provenance-details dd{margin-bottom:6px}}';document.head.append(style);
 document.addEventListener('DOMContentLoaded',()=>{render();const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});});
 return Object.freeze({snapshot,rows,render});
})();
window.MISSY_PROVENANCE=MISSY_PROVENANCE;
