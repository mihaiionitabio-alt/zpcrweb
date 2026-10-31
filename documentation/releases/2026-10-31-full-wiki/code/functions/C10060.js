function(c){
 if(!maraProfileActive())return next(c);
 const cs=sopStdCurves(c.run).filter(s=>!c.target||s.target===c.target);if(!cs.length)return {svg:svgMessage(ui('No assigned CRM copy values')),rows:[]};
 const colours=new Map(),series=[],texts=[];
 for(const [i,s] of cs.entries()){
  const col=catColour(colours,s.target),xs=s.points.map(p=>p.x),a=Math.min(...xs),b=Math.max(...xs);
  series.push({type:'points',colour:col,data:s.points.map(p=>[p.x,p.y,`${p.sample} · ${p.well} · ${p.conc} · Cq ${p.y}`])});
  series.push({type:'line',colour:col,data:[[a,s.intercept+s.slope*a],[b,s.intercept+s.slope*b]]});
  texts.push({px:80,py:46+i*17,colour:col,text:`${s.target}: ${ui('Slope')} ${num(s.slope,3)} (−3.6 … −3.1); R² ${num(s.r2,4)} (≥0.98)`});
 }
 const all=cs.flatMap(s=>s.points);
 return {svg:svgPlot({title:runName(c.run),x:extent(all.map(p=>p.x)),y:extent(all.map(p=>p.y),.25),xlab:ui('log10 assigned CRM copies'),ylab:ui('Stored Cq'),series,texts,legend:legendFromMap(colours)}),rows:cs.flatMap(s=>s.points.map(p=>({target:s.target,well:p.well,sample:p.sample,assigned_copies:p.conc,cq:p.y,residual:p.residual,slope:s.slope,intercept:s.intercept,r2:s.r2})))};
}