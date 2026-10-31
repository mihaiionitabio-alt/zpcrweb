([key,ws])=>{
    const w0=ws[0],spec=sopTargetSpec(w0),ctrl=sopControlSpec(w0),use=ws.filter(w=>!sopOmitted(w));
    const cqMax=sopNum(spec.cqMax),cqs=use.map(sopCq);
    const det=cqs.filter(q=>Number.isFinite(q)&&(!Number.isFinite(cqMax)||q<=cqMax));
    const above=cqs.filter(q=>Number.isFinite(q)&&Number.isFinite(cqMax)&&q>cqMax);
    const conc=use.map(w=>Number(w.CalcConc)).filter(c=>Number.isFinite(c)&&c>0);
    const g={run,ri,key,wells:ws,used:use,sample:w0.sample||"",target:w0.target||w0.analysis||"",role:w0.role||"",
      spec,ctrl,cqMax,n:use.length,omitted:ws.length-use.length,det:det.length,above:above.length,
      cqMean:mean(det),cqSd:sd(det),cqMin:det.length?Math.min(...det):NaN,cqMaxObs:det.length?Math.max(...det):NaN,
      conc:mean(conc)};
    if(spec.kind==="ic"&&!ctrl&&g.role!=="Standard"&&Number.isFinite(g.cqMean))icCqs.push(g.cqMean);
    if((spec.kind==="ic"||spec.kind==="reference")&&!ctrl){
      const cur=sampleRef.get(g.sample)||[];cur.push(g);sampleRef.set(g.sample,cur);}
    return g;
  }