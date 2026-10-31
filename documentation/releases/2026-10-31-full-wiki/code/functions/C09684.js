(run,ri)=>{
  const selected=ssWells(run),stored=selected.filter(w=>Number.isFinite(sopCq(w))),protocol=overviewProtocol(run);
  for(const w of stored)add(run,ri,w,sopCq(w),'Stored vendor Cq',w.target||w.analysis||'Unassigned',w.filterComb||w.channel,protocol);
  let independent=0;
  if(run.pcrd)for(const group of piResults(run).groups)for(const r of group.records){if(!ssPositionIncluded(run,r.layout.position)||!Number.isFinite(r.cq.value)||r.cq.value<=0)continue;independent++;add(run,ri,{pos:r.layout.position,well:r.layout.well,sample:r.layout.sample,role:r.layout.role,analysis:PCRDI_METHOD+' | acquisition group '+group.step,overviewTargetVerified:!!r.layout.target?.trim()},r.cq.value,'Independently calculated PCRD Cq',r.layout.target?.trim()||'Unassigned target ('+group.dye+')',group.dye+' / raw channel '+(group.channel+1),run.pcrd.protocolSHA256);}
  runRows.push({run:'R'+(ri+1),filename:run.file,format:run.reader?.id||'',selected_results:selected.length,stored_Cq:stored.length,without_Cq:selected.length-stored.length,excluded_results:(run.wells||[]).length-selected.length,independent_Cq:independent,raw_reads:(run.zpcr||run.pcrd)?.reads.length||0});
 }