(c){
    const ev=runTimeline(c.run);if(!ev.length)return {svg:svgMessage("The file carries no dated events."),rows:[]};
    const T=runTimes(c.run),ref=Number.isFinite(T.start)?T.start:ev[0].time,near=ev.filter(e=>Math.abs(e.time-ref)<7*864e5);
    const lo=Math.min(...near.map(e=>e.time)),hi=Math.max(...near.map(e=>e.time)),span=(hi-lo)||3600000;
    const toH=t=>(Math.max(lo,Math.min(hi,t))-ref)/3600000;
    const cols={file:"#2563eb",run:"#16a34a",analysis:"#7c3aed",edit:"#dc2626",calibration:"#d97706"};
    const series=ev.map((e,i)=>({type:"points",r:5,colour:cols[e.kind],data:[[toH(e.time),ev.length-i,`${e.what}: ${sopFmtTime(e.time)}`,cols[e.kind]]]}));
    if(Number.isFinite(T.start)&&Number.isFinite(T.end))series.unshift({type:"bar",colour:"#bbf7d0",barWidth:0,data:[]});
    const height=Math.max(260,ev.length*20+90);
    const texts=ev.map((e,i)=>{const off=e.time<lo||e.time>hi;return {x:toH(e.time),y:ev.length-i,text:`  ${e.what}${off?` (${sopFmtTime(e.time)})`:""}`,colour:off?"#9ca3af":"#374151",anchor:toH(e.time)>((hi-ref)/3600000+(lo-ref)/3600000)/2?"end":"start"};});
    const svg=svgPlot({title:runName(c.run),height,x:[(lo-ref)/3600000-span/3600000*0.05,(hi-ref)/3600000+span/3600000*0.05],y:[0,ev.length+1],
      xlab:`Hours from run start (${sopFmtTime(ref)})`,ylab:"",series,texts,
      bands:Number.isFinite(T.start)&&Number.isFinite(T.end)?[{x0:0,x1:(T.end-ref)/3600000,colour:"#16a34a",opacity:0.1}]:[],
      legend:Object.entries(cols).map(([k,v])=>({label:{file:"file",run:"run",analysis:"analysis",edit:"change / save",calibration:"calibration"}[k],colour:v}))});
    return {svg,rows:ev.map(e=>({event:e.what,time:sopFmtTime(e.time),hours_from_run_start:+((e.time-ref)/3600000).toFixed(3),kind:e.kind,read_from:e.source}))};
  }