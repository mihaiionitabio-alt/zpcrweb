/* Descriptive raw diagnostics. No vendor analytical results or inferred log events. */
function zpcrGuideMetrics(run){
 const out={},put=(id,v,n)=>{if(Number.isFinite(n))(out[id]||(out[id]={}))[v]=n;},z=run.zpcr;
 for(const step of new Set(z.reads.map(r=>r.step))){
  const reads=z.reads.filter(r=>r.step===step),tag='Step '+step;
  // Keep source order, including non-increasing samples; never sort by temperature.
  const ts=reads.map(r=>r.temps.BLOCKTEMP?.c),ds=ts.slice(1).map((t,i)=>t-ts[i]);
  if(ts.length>1&&ts.every(Number.isFinite)){
   put('z_spacing',tag,ZPCR.zpcrStats(ds).mean);
   put('z_nonincrease',tag,ds.filter(d=>d<=0).length);
   put('z_gapmax',tag,Math.max(...ds.map(Math.abs)));
  }
  for(const [lo,hi]of [[2,6],[2,10]]){
   // Explicit cycle windows; missing/repeated cycle values withhold the metric.
   const window=reads.filter(r=>r.cycle>=lo&&r.cycle<=hi);
   if(window.length!==hi-lo+1||window.some((r,i)=>r.cycle!==lo+i))continue;
   for(let c=0;c<reads[0].channels;c++)for(let p=0;p<96;p++){
    const ys=window.map(r=>ZPCR.zpcrWellMean(r,c,Math.floor(p/12),p%12));if(!ys.every(Number.isFinite))continue;
    const xs=window.map(r=>r.cycle),xm=ZPCR.zpcrStats(xs).mean,ym=ZPCR.zpcrStats(ys).mean;
    const slope=xs.reduce((a,x,i)=>a+(x-xm)*(ys[i]-ym),0)/xs.reduce((a,x)=>a+(x-xm)**2,0);
    const rms=Math.sqrt(ys.reduce((a,y,i)=>a+(y-(ym+slope*(xs[i]-xm)))**2,0)/ys.length);
    const v=tag+' · Raw channel '+(c+1)+' · '+String.fromCharCode(65+Math.floor(p/12))+(p%12+1)+' · cycles '+lo+'–'+hi;
    put('z_early_slope',v,slope);put('z_early_residual',v,rms);
   }
  }
 }
 return out;
}
const zpcrGuideStatic=ccStatic;ccStatic=function(run){const m=zpcrGuideStatic(run);if(run.zpcr)Object.assign(m,zpcrGuideMetrics(run));return m;};
for(const [id,code,title,unit,group]of [
 ['z_early_slope','Z-R1','Raw early-cycle linear slope','raw units/cycle','hardware'],
 ['z_early_residual','Z-R2','Raw early-cycle linear-fit residual RMS','raw units','hardware'],
 ['z_spacing','Z-R3','Ordered block-temperature increment — mean','°C/read','software'],
 ['z_nonincrease','Z-R4','Ordered block-temperature non-increasing transitions','transitions','software'],
 ['z_gapmax','Z-R5','Ordered block-temperature absolute increment — maximum','°C/read','software']
]){const def={id,code,title,unit,group,inst:['CFX'],type:'i',variants:true,better:'target',status:'B',source:'Stored raw well means and BLOCKTEMP, in source acquisition order',idea:'Descriptive raw diagnostics; select an explicit well/channel/cycle-window variant for early-cycle fits.',reading:'Early-cycle windows are cycles 2–6 or 2–10, with every cycle required exactly once in order. Residual RMS uses denominator n, not a noise estimator. A rising early curve may be amplification, not background drift. Temperature increments preserve source order; steady holds and cooling legitimately produce non-increasing transitions. These are acquisition sampling diagnostics, not measured ramp accuracy, Tm, contamination calls or hardware acceptance tests. Compare only matching protocol, firmware, step and variant. Statistical limits are descriptive and are not vendor specifications. Sample exclusions do not alter raw hardware diagnostics.'};CC_CHARTS.push(def);CC_BY_ID[id]=def;}
// No parsed log/calibration semantics have independent validation yet. Inventory is evidence, not interpretation.
const zpcrGuideInventory=zpcrInventoryRows;zpcrInventoryRows=function(){return zpcrGuideInventory().map(row=>({...row,log_insight:'Unavailable: log event semantics not independently verified',calibration_insight:'Unavailable: calibration binary interpretation not independently verified'}));};
