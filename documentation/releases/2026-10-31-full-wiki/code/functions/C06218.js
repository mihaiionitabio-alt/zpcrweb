(c){
    const ts=gTargets(c.run);if(!ts.length)return {svg:svgMessage("No results."),rows:[]};
    const cm=new Map(),rows=[],series=[],hl=[];
    ts.forEach((t,ti)=>{
      gRunWells(c.run,t).forEach((w,k)=>{const q=sopCq(w);if(!Number.isFinite(q))return;
        const r=sopOutcomeFor(c.run,w),key=c.colourby==="role"?(w.role||"Unknown"):sopLabel(r?r.outcome:"Not interpreted");
        const col=c.colourby==="role"?catColour(cm,key):(cm.set(key,sopColour(r?r.outcome:"Not interpreted")),sopColour(r?r.outcome:"Not interpreted"));
        const jit=((k*37)%21-10)/40;
        series.push({type:"points",data:[[ti+jit,q,graphHoverLabel(c.run,w,`${t} · Cq ${num(q,2)} · ${key}`),col]]});
        rows.push({target:t,well:w.well,sample:w.sample,role:w.role,cq:q,outcome:r?r.outcome:""});});
      gCutLines(t,"y").forEach(l=>series.push({type:"line",colour:l.colour,dash:"5 4",width:1.2,data:[[ti-0.4,l.y],[ti+0.4,l.y]],tip:l.label}));
    });
    const qs=rows.map(r=>r.cq).concat(ts.flatMap(t=>gCutLines(t,"y").map(l=>l.y)));
    return {svg:svgPlot({title:runName(c.run),x:[-0.6,ts.length-0.4],y:extent(qs),xticks:ts.map((t,i)=>({v:i,label:t.slice(0,18)})),
      xlab:"Target",ylab:"Stored Cq",series,legend:legendFromMap(cm)}),rows};
  }