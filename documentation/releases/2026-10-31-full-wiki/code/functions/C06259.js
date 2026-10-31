(c){
    const ws=gRunWells(c.run,c.target).filter(w=>w.curve&&w.curve.length);
    if(!ws.length)return {svg:svgMessage("No curves for this selection."),rows:[]};
    const n=Math.max(...ws.map(w=>w.curve.length)),cm=new Map(),rows=[];
    const pts=ws.map(w=>{const s=wellSignal(w.curve),r=sopOutcomeFor(c.run,w),o=r?r.outcome:"Not interpreted",q=sopCq(w);cm.set(sopLabel(o),sopColour(o));
      const y=c.level==="amplitude"?s.amplitude:s.end;rows.push({well:w.well,sample:w.sample,target:w.target,cq:Number.isFinite(q)?q:"",end_fluorescence:s.end,background:s.background,amplitude:s.amplitude,outcome:o});
      return [Number.isFinite(q)?q:n+1,y,graphHoverLabel(c.run,w,`Cq ${num(q,2)} · ${num(y,1)} · ${sopLabel(o)}`),sopColour(o)];});
    return {svg:svgPlot({title:`${runName(c.run)} — ${c.target||"all targets"}`,x:[Math.min(...pts.map(p=>p[0]))-1,n+2],y:extent(pts.map(p=>p[1])),
      xlab:`Stored Cq (undetected at ${n+1})`,ylab:c.level==="amplitude"?"Amplitude above background":"End-point fluorescence",
      series:[{type:"points",data:pts}],vlines:gCutLines(c.target,"x"),legend:legendFromMap(cm)}),rows};
  }