(){
    const ev=reviewForensicEvents().filter(e=>e.severity==="error"||e.severity==="review");
    if(!ev.length)return {svg:svgMessage("No error or review findings."),rows:[]};
    const g=[...byKey(ev,e=>e.area)].map(([a,l])=>({area:a,errors:l.filter(e=>e.severity==="error").length,reviews:l.filter(e=>e.severity==="review").length})).sort((a,b)=>(b.errors+b.reviews)-(a.errors+a.reviews));
    const bw=Math.min(50,600/g.length);
    return {svg:svgPlot({title:"Findings",x:[-0.6,g.length-0.4],y:[0,Math.max(...g.map(x=>x.errors+x.reviews))*1.1],bottom:140,left:110,
      xticks:g.map((x,i)=>({v:i,label:x.area.slice(0,22),rotate:-40,anchor:"end"})),ylab:"Findings",
      series:[{type:"bar",colour:"#dc2626",barWidth:bw,data:g.map((x,i)=>[i,x.errors,0,`${x.area}: ${x.errors} error(s)`])},
        {type:"bar",colour:"#f59e0b",barWidth:bw,data:g.map((x,i)=>[i,x.errors+x.reviews,x.errors,`${x.area}: ${x.reviews} review item(s)`])}],
      legend:[{label:"error",colour:"#dc2626"},{label:"review",colour:"#f59e0b"}]}),rows:g};
  }