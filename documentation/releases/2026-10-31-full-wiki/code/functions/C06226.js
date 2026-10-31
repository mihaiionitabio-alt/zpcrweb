(c){
    const ev=sopEvaluateAll()[c.ri];const pts=ev.rows.filter(r=>r.det>=2&&Number.isFinite(r.cqSd));
    if(!pts.length)return {svg:svgMessage("No replicate groups with two or more detected wells."),rows:[]};
    const cm=new Map();const series=[{type:"points",data:pts.map(r=>[r.cqMean,r.cqSd,graphHoverLabel(c.run,{well:r.wells&&r.wells[0]&&r.wells[0].well,sample:r.sample},`${r.target} · SD ${num(r.cqSd,3)} · ${r.label}`),(cm.set(r.label,r.colour),r.colour)])}];
    return {svg:svgPlot({title:runName(c.run),x:extent(pts.map(r=>r.cqMean)),y:[0,Math.max(sopNum(SOP.replicates.maxSd)*1.3||0,...pts.map(r=>r.cqSd))*1.1],
      xlab:"Mean Cq",ylab:"SD of Cq",series,legend:legendFromMap(cm),
      hlines:SOP.graphs.showSdLimit?[{y:sopNum(SOP.replicates.maxSd),label:`SOP max SD ${SOP.replicates.maxSd}`,colour:"#b91c1c"}]:[]}),
      rows:pts.map(r=>({sample:r.sample,target:r.target,n:r.n,detected:r.det,cq_mean:r.cqMean,cq_sd:r.cqSd,outcome:r.outcome}))};
  }