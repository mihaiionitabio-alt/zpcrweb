key=>{
   const records=Array.isArray(run[key])?run[key]:[],available=!!mask&&!mask.pending&&typeof ssIncluded==='function';let included=null;
   if(available){included=0;for(const r of records)if(ssIncluded(run,r))included++;}
   return {key,total:records.length,included,excluded:included===null?null:records.length-included,state:mask?.pending?'pending':available?'applied':'unavailable'};
  }