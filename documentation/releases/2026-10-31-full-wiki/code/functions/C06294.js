(c){
    const ws=ssWells(c.run).filter(w=>w.eds&&Number.isFinite(w.eds.ctRecalc)&&Number.isFinite(sopCq(w)));
    if(!ws.length)return {svg:svgMessage("No re-derived Ct (QuantStudio files only)."),rows:[]};
    const cm=new Map();
    const series=[{type:"points",data:ws.map(w=>[sopCq(w),sopCq(w)-w.eds.ctRecalc,graphHoverLabel(c.run,w,`${w.target} · stored ${num(sopCq(w),3)} · re-derived ${num(w.eds.ctRecalc,3)}`),catColour(cm,w.target)])}];
    return {svg:svgPlot({title:runName(c.run),x:extent(ws.map(sopCq)),y:extent(ws.map(w=>sopCq(w)-w.eds.ctRecalc).concat([-0.3,0.3])),xlab:"Stored Ct",ylab:"Stored − re-derived Ct",series,
      hlines:[{y:0.2,label:"+0.2",colour:"#b91c1c"},{y:-0.2,label:"−0.2",colour:"#b91c1c"},{y:0,label:"",colour:"#9ca3af",dash:"2 3"}],legend:legendFromMap(cm)}),
      rows:ws.map(w=>({well:w.well,sample:w.sample,target:w.target,stored_ct:sopCq(w),rederived_ct:w.eds.ctRecalc,difference:sopCq(w)-w.eds.ctRecalc,threshold:w.eds.threshold}))};
  }