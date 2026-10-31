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