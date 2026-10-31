function add(run,ri,w,q,basis,target,channel,protocol){
  if(!Number.isFinite(q)||q<=0)return;
  const sn=run.meta.SerialNumber||run.meta.InstrumentID||'',knownProtocol=protocol&&!/not decoded|unknown protocol/i.test(protocol);
  const identity=sn||'Unverified SN; source '+run.meta.sourceSHA256;
  const fingerprint=knownProtocol?sha256Hex(new TextEncoder().encode(protocol)):'Unverified protocol; source '+run.meta.sourceSHA256;
  const key=JSON.stringify([run.reader?.id||run.platform||'',identity,fingerprint,target||'Unassigned',String(channel??''),basis,w.analysis||w.analysisMode||'',w.overviewTargetVerified===false?run.meta.sourceSHA256:'']);
  if(!groups.has(key))groups.set(key,{key,instrument:identity,protocol:fingerprint,target:target||'Unassigned',channel:String(channel??''),basis,analysis:w.analysis||w.analysisMode||'',points:[]});
  const row={run_index:ri+1,filename:run.file,source_sha256:run.meta.sourceSHA256,well:w.well||posToWell(w.pos,run.cols),sample:w.sample||'',role:w.role||w.instrRole||'Unknown',value:q,run};groups.get(key).points.push(row);points.push(row);
 }