function(run){
 if(!maraProfileActive())return next(run);if(SOP.analyticalRole!=='quantification')return [];
 const {records}=maraInput(run),groups=byKey(records.filter(r=>r.role==='calibrator'&&!r.omitted&&r.copies>0&&Number.isFinite(r.cq)),r=>r.assay);
 return [...groups].map(([target,rs])=>{const c=MARA_ENGINE.fit(rs);if(!c)return null;const points=rs.map(r=>({x:Math.log10(r.copies),y:r.cq,well:r.source.well,sample:SS_EXPORT_CONTEXT.has(run)?exportName(r.sample):r.sample,conc:r.copies,residual:r.cq-(c.intercept+c.slope*Math.log10(r.copies))}));return {...c,target,points,n:rs.length,efficiency:(10**(-1/c.slope)-1)*100,levels:new Set(rs.map(r=>r.level)).size,logs:Math.log10(c.max/c.min),monotonic:c.slope<0};}).filter(Boolean);
}