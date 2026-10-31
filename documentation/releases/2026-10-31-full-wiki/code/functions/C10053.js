function(){
 const items=next();if(!maraProfileActive())return items;
 for(const item of items){
  if(item.id==='data:sop_answers')item.tableOptions={full:true,columns:['experiment','sample','report']};
  if(item.id==='data:sop_criteria')item.tableOptions={full:true,columns:['criterion','status','evidence']};
  if(item.id==='data:sop_runs')item.tableOptions={full:true,columns:['experiment','status','positive','negative','invalid','review']};
 }
 const rows=()=>RUNS.flatMap(run=>{const {records,context}=maraInput(run);return records.map(r=>({experiment:runName(run),source_sha256:run.meta?.sourceSHA256||'',sample:exportName(r.sample),target:r.assay,well:r.source.well,role:r.role,cq:Number.isFinite(r.cq)?r.cq:'',curve_evidence:r.curve,assigned_copies:r.copies??'',level:r.level,qc_pair:r.pair,omitted:r.omitted,method_verified:context.methodVerified===true,...sopMeta()}));});
 items.push({id:'data:mara_evidence',kind:'data',group:'Tables',title:ui('Method reaction evidence'),note:'',ready:()=>RUNS.length>0,rows,file:'method_reaction_evidence.csv',text:()=>csvOf(rows())});return items;
}