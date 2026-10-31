(c){
    const orph=orphanCurveCandidates(c.run).filter(w=>ssPositionIncluded(c.run,w.pos));
    if(!orph.length)return {svg:svgMessage("No rising curve outside the analyses in this run."),rows:[]};
    const cm=new Map(),rows=[];
    const series=orph.map(o=>{const col=catColour(cm,`${o.well}${o.filterComb?" · "+o.filterComb:""}`);
      o.curve.forEach((v,i)=>rows.push({well:o.well,sample:o.sample,channel:o.filterComb||o.filterName||o.channel,cycle:i+1,fluorescence:v,finding:o.finding}));
      return {type:"line",colour:col,data:o.curve.map((v,i)=>[i+1,v]),tip:graphHoverLabel(c.run,o,o.finding)};});
    const all=series.flatMap(s=>s.data.map(p=>p[1]));
    return {svg:svgPlot({title:`${runName(c.run)} — ${orph.length} curve(s) outside the analyses`,x:[1,Math.max(...series.map(s=>s.data.length))],y:extent(all),
      xlab:"Cycle",ylab:"Fluorescence (stored)",series,legend:legendFromMap(cm)}),rows};
  }