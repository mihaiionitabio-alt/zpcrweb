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