(run,ri)=>ssWells(run).forEach(w=>{
    const q=Number(w.CpRaw);if(!(q>0))return;
    const key=`${ri}|${w.analysisUid||w.analysis||""}|${w.sample||w.well}`;
    if(!groups.has(key))groups.set(key,{experiment:runName(run),analysis:w.analysis||"",
      target:w.target||"",sample:w.sample||w.well,wells:[],cq:[]});
    const g=groups.get(key);g.wells.push(w.well);g.cq.push(q);
  })