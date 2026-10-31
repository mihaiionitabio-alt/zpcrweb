function overviewData(){
 if(OVERVIEW_CACHE.runs===RUNS&&OVERVIEW_CACHE.count===RUNS.length&&OVERVIEW_CACHE.revision===SAMPLE_SELECTION.revision&&OVERVIEW_CACHE.generation===APP_STATE.generation)return OVERVIEW_CACHE.value;
 const groups=new Map(),runRows=[],points=[];
 function add(run,ri,w,q,basis,target,channel,protocol){
  if(!Number.isFinite(q)||q<=0)return;
  const sn=run.meta.SerialNumber||run.meta.InstrumentID||'',knownProtocol=protocol&&!/not decoded|unknown protocol/i.test(protocol);
  const identity=sn||'Unverified SN; source '+run.meta.sourceSHA256;
  const fingerprint=knownProtocol?sha256Hex(new TextEncoder().encode(protocol)):'Unverified protocol; source '+run.meta.sourceSHA256;
  const key=JSON.stringify([run.reader?.id||run.platform||'',identity,fingerprint,target||'Unassigned',String(channel??''),basis,w.analysis||w.analysisMode||'',w.overviewTargetVerified===false?run.meta.sourceSHA256:'']);
  if(!groups.has(key))groups.set(key,{key,instrument:identity,protocol:fingerprint,target:target||'Unassigned',channel:String(channel??''),basis,analysis:w.analysis||w.analysisMode||'',points:[]});
  const row={run_index:ri+1,filename:run.file,source_sha256:run.meta.sourceSHA256,well:w.well||posToWell(w.pos,run.cols),sample:w.sample||'',role:w.role||w.instrRole||'Unknown',value:q,run};groups.get(key).points.push(row);points.push(row);
 }
 RUNS.forEach((run,ri)=>{
  const selected=ssWells(run),stored=selected.filter(w=>Number.isFinite(sopCq(w))),protocol=overviewProtocol(run);
  for(const w of stored)add(run,ri,w,sopCq(w),'Stored vendor Cq',w.target||w.analysis||'Unassigned',w.filterComb||w.channel,protocol);
  let independent=0;
  if(run.pcrd)for(const group of piResults(run).groups)for(const r of group.records){if(!ssPositionIncluded(run,r.layout.position)||!Number.isFinite(r.cq.value)||r.cq.value<=0)continue;independent++;add(run,ri,{pos:r.layout.position,well:r.layout.well,sample:r.layout.sample,role:r.layout.role,analysis:PCRDI_METHOD+' | acquisition group '+group.step,overviewTargetVerified:!!r.layout.target?.trim()},r.cq.value,'Independently calculated PCRD Cq',r.layout.target?.trim()||'Unassigned target ('+group.dye+')',group.dye+' / raw channel '+(group.channel+1),run.pcrd.protocolSHA256);}
  runRows.push({run:'R'+(ri+1),filename:run.file,format:run.reader?.id||'',selected_results:selected.length,stored_Cq:stored.length,without_Cq:selected.length-stored.length,excluded_results:(run.wells||[]).length-selected.length,independent_Cq:independent,raw_reads:(run.zpcr||run.pcrd)?.reads.length||0});
 });
 const cohorts=[...groups.values()].map((g,i)=>({...g,id:'C'+(i+1)})),stats=[];
 for(const g of cohorts)for(const [role,rows]of byKey(g.points,x=>x.role)){
  const a=rows.map(r=>r.value).sort((a,b)=>a-b);stats.push({cohort:g.id,role,n:a.length,mean:mean(a),median:median(a),SD:a.length>1?sd(a):null,min:a[0],max:a.at(-1)});
 }
 const result={cohorts,stats,runRows,points};OVERVIEW_CACHE.runs=RUNS;OVERVIEW_CACHE.count=RUNS.length;OVERVIEW_CACHE.revision=SAMPLE_SELECTION.revision;OVERVIEW_CACHE.generation=APP_STATE.generation;OVERVIEW_CACHE.value=result;return result;
}