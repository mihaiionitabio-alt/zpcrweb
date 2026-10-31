(){
    const rs=gByDate(RUNS.map(r=>({r,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.editDelayH)),x=>x.r),tk=gRunTicks(rs.map(x=>x.r));
    if(!rs.length)return {svg:svgMessage("No run has both a run end and a later dated change."),rows:[]};
    const lim=sopNum(SOP.run.editDelayHours),vals=rs.map(x=>x.T.editDelayH);
    const series=[{type:"bar",barWidth:Math.max(3,Math.min(40,700/rs.length)),data:rs.map((x,i)=>[i,Math.max(0.01,x.T.editDelayH),0.01,`${runName(x.r)}: ${num(x.T.editDelayH,1)} h`,x.T.editDelayH>lim?"#dc2626":"#60a5fa"])}];
    return {svg:svgPlot({title:"Processing delay",x:[-0.6,rs.length-0.4],y:[0.01,Math.max(...vals,lim||1)*2],ylog:true,
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Hours (log scale)",series,hlines:[{y:lim,label:`SOP ${lim} h`,colour:"#b91c1c"}]}),
      rows:rs.map(x=>({experiment:runName(x.r),run_end:sopFmtTime(x.T.end),last_change:sopFmtTime(x.T.lastEdit),hours:x.T.editDelayH}))};
  }