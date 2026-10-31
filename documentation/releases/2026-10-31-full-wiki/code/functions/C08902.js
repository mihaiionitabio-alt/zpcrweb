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