(){
    const rs=RUNS.map((r,i)=>({r,i,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.start)).sort((a,b)=>a.T.start-b.T.start);
    if(!rs.length)return {svg:svgMessage("No run carries a start time."),rows:[]};
    const ts=rs.flatMap(x=>[x.T.start,x.T.end,x.T.created,x.T.lastEdit]).filter(Number.isFinite);
    const lo=Math.min(...ts),hi=Math.max(...ts),D=t=>(t-lo)/864e5;
    const series=[],rows=[];
    rs.forEach((x,k)=>{const y=rs.length-k;
      if(Number.isFinite(x.T.lastEdit))series.push({type:"line",colour:"#fca5a5",dash:"3 3",data:[[D(Number.isFinite(x.T.end)?x.T.end:x.T.start),y],[D(x.T.lastEdit),y]]});
      series.push({type:"points",colour:"#16a34a",r:7,data:[[D(x.T.start),y,`${runName(x.r)} run ${sopFmtTime(x.T.start)} – ${sopFmtTime(x.T.end)}`]]});
      if(Number.isFinite(x.T.created))series.push({type:"points",colour:"#2563eb",r:3.5,data:[[D(x.T.created),y+0.18,`created ${sopFmtTime(x.T.created)}`]]});
      if(Number.isFinite(x.T.lastEdit))series.push({type:"points",colour:"#dc2626",r:3.5,data:[[D(x.T.lastEdit),y-0.18,`last change ${sopFmtTime(x.T.lastEdit)} (+${num(x.T.editDelayH,1)} h)`]]});
      rows.push({experiment:runName(x.r),created:sopFmtTime(x.T.created),run_start:sopFmtTime(x.T.start),run_end:sopFmtTime(x.T.end),last_change:sopFmtTime(x.T.lastEdit),hours_to_last_change:x.T.editDelayH,run_minutes:x.T.durationMin});});
    const span=D(hi)||1,ticks=niceTicks(0,span,5).map(v=>({v,label:sopFmtTime(lo+v*864e5).slice(0,10)}));
    return {svg:svgPlot({title:`${rs.length} run(s)`,height:Math.max(260,rs.length*18+100),left:Math.min(300,24+Math.min(40,Math.max(...rs.map(x=>runName(x.r).length)))*6.6),
      x:[-span*0.03,span*1.03],y:[0,rs.length+1],yticks:false,xticks:ticks,xlab:"Date",series,
      texts:rs.map((x,k)=>({x:-span*0.03,y:rs.length-k,text:runName(x.r).slice(0,40)+"  ",anchor:"end",size:10})),
      legend:[{label:"run",colour:"#16a34a"},{label:"created",colour:"#2563eb"},{label:"last change",colour:"#dc2626"}]}),rows};
  }