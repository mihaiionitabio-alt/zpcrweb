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