function(c){
    const scs=sopStdCurves(c.run).filter(s=>!c.target||s.target===c.target);
    if(!scs.length)return {svg:svgMessage("No standards with a stored quantity in this run / target."),rows:[]};
    const cm=new Map(),series=[],texts=[];let ty=46;
    scs.forEach(sc=>{const col=catColour(cm,sc.target);
      series.push({type:"points",colour:col,data:sc.points.map(p=>[p.x,p.y,graphHoverLabel(c.run,{well:p.well,sample:p.sample},`${sc.target} · ${p.conc} · Cq ${num(p.y,2)} · residual ${num(p.residual,3)}`)])});
      const xs=sc.points.map(p=>p.x),a=Math.min(...xs),b=Math.max(...xs);
      series.push({type:"line",colour:col,data:[[a,sc.intercept+sc.slope*a],[b,sc.intercept+sc.slope*b]]});
      const R=SOP.run,ok=sc.r2>=R.minR2&&sc.efficiency>=R.effMin&&sc.efficiency<=R.effMax&&sc.logs>=R.minLogs&&sc.monotonic;
      texts.push({px:80,py:ty,colour:ok?"#15803d":"#b91c1c",text:`${sc.target}: slope ${num(sc.slope,3)} · R² ${num(sc.r2,4)} (≥${R.minR2}) · E ${sc.efficiency>1000||sc.efficiency<-100?"out of range":num(sc.efficiency,1)+" %"} (${R.effMin}–${R.effMax}) · ${num(sc.logs,1)} logs (≥${R.minLogs})${sc.monotonic?"":" · out of order"} — ${ok?"within SOP":"outside SOP"}`});ty+=15;
    });
    const all=scs.flatMap(s=>s.points);
    return {svg:svgPlot({title:runName(c.run),x:extent(all.map(p=>p.x)),y:extent(all.map(p=>p.y),0.25),xlab:"log10 quantity (stored)",ylab:"Stored Cq",series,texts,legend:legendFromMap(cm)}),
      rows:scs.flatMap(s=>s.points.map(p=>({target:s.target,well:p.well,sample:p.sample,quantity:p.conc,log10_quantity:p.x,cq:p.y,fitted:s.intercept+s.slope*p.x,residual:p.residual,slope:s.slope,intercept:s.intercept,r2:s.r2,efficiency_percent:s.efficiency})))};
  }