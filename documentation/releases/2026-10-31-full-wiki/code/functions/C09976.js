function maraInput(run,p=SOP,evidence=maraEvidence(run)){
 const exportContext=SS_EXPORT_CONTEXT.get(run);
 const rapid=p.method.standard_number===17;
 const refName=p.method.reference_genes?.[0]?.target||'';
 const refSpec=p.targets.find(t=>t.kind==='reference'&&t.match&&sopMatcher(t.match)(refName));
 const reference=refName;
 const selected=rapid?(p.method.selected_assays||[]):[p.method.selected_event].filter(Boolean);
 const specs=selected.map(name=>({name,spec:p.targets.find(t=>t.kind==='target'&&(t.match===name||sopMatcher(t.match)(name)))}));
 const matchAssay=w=>{const t=String(w.target||w.analysis||'');if(refName&&(t.toLowerCase()===refName.toLowerCase()||refSpec&&sopMatcher(refSpec.match)(t)))return reference;return specs.find(x=>x.name===t||x.spec&&sopMatcher(x.spec.match)(t))?.name||'';};
 const all=ssWells(run),records=[];
 for(const [i,shown] of all.entries()){
  const w=exportContext?.rows.get(shown)||shown;
  const assay=matchAssay(w);if(!assay)continue;
  const id=maraWellID(w,i),e=evidence.reactions[id]||{};
  const matched=p.controls.filter(c=>c.id!=='cal-lowest'&&maraControlMatches(c,w,p));
  const kinds=new Set(matched.map(c=>/pos-quant/.test(c.id)?'quantitative':/pos-qual/.test(c.id)?'positive':/blank/.test(c.id)?'blank':/^neg/.test(c.id)?'negative':'unknown'));
  let role=kinds.size===1?[...kinds][0]:kinds.size>1?'ambiguous':'sample';
  if(e.kind==='calibrator'||role==='sample'&&(w.role==='Standard'||w.instrRole==='Standard'))role='calibrator';
  let sampleGroup=w.sample||'',subsample='',mappingError=false;
  if(role==='sample'&&!rapid){
   try{const pattern=p.sample_id?.pattern,re=pattern?new RegExp(pattern,(p.sample_id.flags||'i').replace(/[gy]/g,'')):null,m=re?.exec(String(w.sample||''));
    if(!m?.groups?.sample||!m.groups.subsample)mappingError=true;else{sampleGroup=m.groups.sample;subsample=m.groups.subsample;}
   }catch{mappingError=true;}
  }
  records.push({id,physicalId:JSON.stringify([w.pos??w.well??i,assay]),source:shown,originalSource:w,assay,role,sample:String(w.sample||''),sampleGroup,subsample,mappingError,cq:sopCq(w),curve:e.curve||'unknown',copies:e.copies,level:e.level||'',pair:e.pair||'',omitted:sopOmitted(w)});
 }
 return {records,context:{...evidence.context,reference,assays:selected,selectionPending:SAMPLE_SELECTION.pending,complete:!run.isTemplate&&(!run.eds||run.eds.exp?.runState==='COMPLETE')}};
}