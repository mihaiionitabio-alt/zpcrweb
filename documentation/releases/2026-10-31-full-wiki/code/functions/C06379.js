(){
    const rs=gByDate(RUNS.map(r=>({r,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.durationMin)),x=>x.r),tk=gRunTicks(rs.map(x=>x.r));
    if(!rs.length)return {svg:svgMessage("No run has both start and end times."),rows:[]};
    const cm=new Map();
    const series=[{type:"bar",barWidth:Math.max(3,Math.min(40,700/rs.length)),data:rs.map((x,i)=>[i,x.T.durationMin,0,`${runName(x.r)}: ${num(x.T.durationMin,1)} min · ${x.r.meta.InstrumentID||x.r.meta.InstrumentName||""}`,catColour(cm,x.r.meta.InstrumentID||x.r.meta.InstrumentName||"instrument")])}];
    return {svg:svgPlot({title:"Run duration",x:[-0.6,rs.length-0.4],y:[0,Math.max(...rs.map(x=>x.T.durationMin))*1.1],
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Minutes",series,legend:legendFromMap(cm)}),
      rows:rs.map(x=>({experiment:runName(x.r),instrument:x.r.meta.InstrumentID||x.r.meta.InstrumentName||"",software:x.r.meta.SWVersion||"",run_start:sopFmtTime(x.T.start),minutes:x.T.durationMin}))};
  }