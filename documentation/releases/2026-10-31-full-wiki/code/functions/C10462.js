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