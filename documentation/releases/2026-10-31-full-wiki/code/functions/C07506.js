w=>{
    const key=`${ri}|${w.analysisUid||w.analysis||w.target||""}`;
    if(!groups.has(key))groups.set(key,{experiment:runName(run),analysis:w.analysis||"",target:w.target||"",
      rows:[],cq:[],conc:[]});
    const g=groups.get(key),q=Number(w.CpRaw),c=Number(w.CalcConc);
    g.rows.push(w);if(Number.isFinite(q)&&q>0)g.cq.push(q);if(c>0)g.conc.push(c);
  }