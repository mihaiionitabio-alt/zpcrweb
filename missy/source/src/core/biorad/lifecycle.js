/* Explicit core lifecycle integration; readers do not refresh/replace the UI. */
async function bioradAfterRead(token){
 for(const r of pcrdRuns())piResults(r);
 for(const r of cfxRuns())if(!r.cfxRDML.protocolSHA256)r.cfxRDML.protocolSHA256=await sourceSha256(new TextEncoder().encode(r.cfxRDML.protocolXML));
 if(token!==APP_STATE.generation)return;
 pcrdSync();cfxSync();zcSyncGraphs();pcrdKeylessNotice();pcrdImportFeedback();
 const msg=document.getElementById('readmsg');
 if(pcrdRuns().length){const rows=pcrdRuns().flatMap(r=>piResults(r).rows);msg.append(document.createTextNode(' PCRD: '+pcrdRuns().length+' decoded sources; '+pcrdRuns().reduce((n,r)=>n+r.pcrd.reads.length,0)+' stored acquisition reads; '+rows.filter(x=>Number.isFinite(x.Cq_independent)).length+' independently calculated Cq calls.'));}
 document.getElementById('g-graph')?.replaceChildren();
 for(const id of ['graphs','panel','results','export','integrity'])markDirty(id);
}
