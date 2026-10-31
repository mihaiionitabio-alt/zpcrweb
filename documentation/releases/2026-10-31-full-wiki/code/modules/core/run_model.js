/* Model contract v2: validate evidence before committing any run to UI state.
   Missing vendor measurements and sentinel numbers remain unchanged. */
function validatePublicRun(run,source){
 validateRunBoundary(run,source.name);
 const fail=m=>{throw Error(source.name+': run model: '+m);},object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&!ArrayBuffer.isView(v);
 if(Array.isArray(run))fail('run must be an object');
 for(const field of ['meta','plate','allCurves','format','integrity','protocol'])if(run[field]!=null&&!object(run[field]))fail(field+' must be an object');
 for(const field of ['wells','tmWells','genoResults','rqResults','otherResults'])if(run[field]!=null){const a=run[field];if(!Array.isArray(a)||a.length>APP_LIMITS.maxWellsPerRun||a.some(x=>!object(x)))fail(field+' must contain bounded result objects');}
 const rows=run.rows,cols=run.cols;
 if(rows!=null&&(!Number.isInteger(rows)||rows<0||rows>100))fail('invalid plate rows');
 if(cols!=null&&(!Number.isInteger(cols)||cols<0||cols>100))fail('invalid plate columns');
 if(!!rows!==!!cols)fail('incomplete plate geometry');
 const size=rows*cols;
 for(const field of ['wells','tmWells','genoResults','rqResults','otherResults'])for(const result of run[field]||[])for(const field of ['pos','position'])if(result[field]!=null&&(!Number.isInteger(result[field])||result[field]<0||(size&&result[field]>=size)))fail('result position out of range');
 if(size>APP_LIMITS.maxWellsPerRun)fail('plate exceeds position limit');
 if(size&&run.plate)for(const pos of Object.keys(run.plate))if(!/^\d+$/.test(pos)||+pos>=size||!object(run.plate[pos]))fail('invalid plate position '+pos);
 if(run.meta?.sourceSHA256!=null&&!/^[a-f\d]{64}$/i.test(run.meta.sourceSHA256))fail('invalid source SHA-256');
 if(run.meta?.sourceBytes!=null&&run.meta.sourceBytes!==source.bytes.length)fail('source byte count disagrees');
 if(run.pcrd&&run.zpcr)fail('conflicting raw payload types');
 if(run.pcrdLocked){if(run.pcrd||run.zpcr||run.wells.length||run.tmWells?.length||Object.keys(run.allCurves||{}).length||size)fail('encrypted inventory contains decoded measurements');}
 const raw=run.pcrd||run.zpcr;
 if(raw){
  if(!object(raw)||!Array.isArray(raw.reads)||!raw.reads.length||raw.reads.length>100000)fail('invalid raw read collection');
  const g=raw.grid;if(!object(g)||g.sampleRows!==rows||g.cols!==cols||!Number.isInteger(g.referenceRows)||g.referenceRows<0||g.referenceRows>10)fail('sample/reference geometry disagrees');
  const first=raw.reads[0];
  for(const [i,r]of raw.reads.entries()){
   if(!object(r)||r.rows!==rows+g.referenceRows||r.cols!==cols||!Number.isInteger(r.channels)||r.channels<1||r.channels>32||r.channels!==first.channels)fail('read '+i+' geometry disagrees');
   const width=run.pcrd?r.tupleWidth:4;
   if(!Number.isInteger(width)||width<1||width>4)fail('read tuple width');
   const numeric=a=>(Array.isArray(a)||ArrayBuffer.isView(a))&&typeof a.length==='number';
   if(!numeric(r.wellData)||r.wellData.length!==r.rows*r.cols*r.channels*4)fail('read '+i+' payload length disagrees');
   if(r.darkData!=null&&(!numeric(r.darkData)||r.darkData.length!==r.channels*4))fail('read '+i+' dark payload length disagrees');
   if(run.pcrd&&(!numeric(r.originalData)||r.originalData.length!==r.rows*r.cols*r.channels*width||!numeric(r.originalDark)||r.originalDark.length!==r.channels*width))fail('read '+i+' original tuple length disagrees');
   if(Array.from(r.wellData).some(n=>typeof n!=='number')||(r.darkData&&Array.from(r.darkData).some(n=>typeof n!=='number')))fail('non-numeric raw payload');
   if(!Number.isInteger(r.step)||!Number.isInteger(r.cycle))fail('read '+i+' acquisition identity invalid');
  }
  if(raw.layout!=null&&(!Array.isArray(raw.layout)||raw.layout.some(x=>!object(x)||!Number.isInteger(x.position)||x.position<0||x.position>=size)))fail('invalid sample layout');
 }
 return run;
}
