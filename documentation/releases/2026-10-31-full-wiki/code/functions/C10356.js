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