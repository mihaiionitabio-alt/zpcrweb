(c){
    const ctrl=SOP.controls[Number(c.control)];if(!ctrl)return {svg:svgMessage("Define a control in the SOP (section 3)."),rows:[]};
    const all=gByDate(sopEvaluateAll(),e=>e.run),pts=[],tk=gRunTicks(all.map(e=>e.run));
    all.forEach((e,i)=>e.rows.filter(r=>r.ctrl===ctrl&&(!c.target||r.target===c.target)).forEach(r=>pts.push({i,e,r})));
    if(!pts.length)return {svg:svgMessage("The chosen control was not found in the loaded runs."),rows:[]};
    if(!pts.some(p=>Number.isFinite(p.r.cqMean)))return {svg:svgMessage(`${ctrl.name}${c.target?" · "+c.target:""}: no Cq in any of the ${pts.length} control result(s) in ${uniq(pts.map(p=>p.i)).length} run(s)${ctrl.expect==="negative"?" — as expected for a negative control":""}. Choose a positive control to see a Levey-Jennings chart.`),
      rows:pts.map(p=>({experiment:runName(p.e.run),sample:p.r.sample,target:p.r.target,cq_mean:p.r.cqMean,detected:p.r.det,n:p.r.n,outcome:p.r.outcome}))};
    const cm=new Map(),series=[],det=pts.filter(p=>Number.isFinite(p.r.cqMean));
    byKey(pts,p=>p.r.target).forEach((ps,t)=>series.push({type:"points",colour:catColour(cm,t),r:4.5,data:ps.map(p=>[p.i,Number.isFinite(p.r.cqMean)?p.r.cqMean:NaN,graphHoverLabel(p.e.run,{well:p.r.wells&&p.r.wells[0]&&p.r.wells[0].well,sample:p.r.sample},`${t} · ${num(p.r.cqMean,2)} · ${p.r.label}`)])}));
    byKey(det,p=>`${p.r.target}|${p.r.sample}|${ccInstrumentKey(p.e.run)}|${ccProtocolKey(p.e.run)}`).forEach((ps,t)=>series.push({type:"line",colour:cm.get(t),width:1,opacity:0.5,data:ps.map(p=>[p.i,p.r.cqMean])}));
    const v=det.map(p=>p.r.cqMean),m=mean(v),s=sd(v),hl=[];
    const lo=sopNum(ctrl.cqLo),hi=sopNum(ctrl.cqHi),bands=[];
    if(Number.isFinite(lo)||Number.isFinite(hi))bands.push({y0:Number.isFinite(lo)?lo:0,y1:Number.isFinite(hi)?hi:60,colour:"#16a34a",opacity:0.1});
    const ys=v.concat(hl.map(h=>h.y)).concat([lo,hi].filter(Number.isFinite));
    return {svg:svgPlot({title:`${ctrl.name}${c.target?" · "+c.target:""} — ${det.length}/${pts.length} detected`,x:[-0.6,all.length-0.4],y:extent(ys.length?ys:[0,40],0.1),
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Mean Cq",series,hlines:hl,bands,legend:legendFromMap(cm)}),
      rows:pts.map(p=>({experiment:runName(p.e.run),sample:p.r.sample,target:p.r.target,cq_mean:p.r.cqMean,detected:p.r.det,n:p.r.n,outcome:p.r.outcome}))};
  }