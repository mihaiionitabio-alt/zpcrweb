function ixTraces(o){
  const out=[],ylog=!!o.ylog;
  (o.series||[]).forEach(se=>{
    const pts=(se.data||[]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&(!ylog||p[1]>0));
    if(!pts.length)return;
    if(se.type==="line"){
      out.push({type:"scatter",mode:"lines",x:pts.map(p=>p[0]),y:pts.map(p=>p[1]),
        line:{color:se.colour,width:se.width||1.3,dash:ixDash(se.dash)},opacity:se.opacity||0.9,
        text:se.tip||se.label||"",hoverinfo:(se.tip||se.label)?"x+y+text":"x+y",showlegend:false});
    }else if(se.type==="bar"){
      const base=pts.map(p=>Number.isFinite(p[2])?p[2]:0);
      out.push({type:"bar",x:pts.map(p=>p[0]),base:base,y:pts.map((p,i)=>p[1]-base[i]),
        marker:{color:pts.map(p=>p[4]||se.colour)},text:pts.map(p=>p[3]||""),
        hoverinfo:"text+x",showlegend:false});
    }else{
      out.push({type:"scatter",mode:"markers",x:pts.map(p=>p[0]),y:pts.map(p=>p[1]),
        marker:{size:(se.r||3.5)*2,color:pts.map(p=>p[3]||se.colour||"#0d8790"),line:{color:"#fff",width:0.6}},
        opacity:se.opacity||0.85,text:pts.map(p=>p[2]||se.label||""),hoverinfo:"text",showlegend:false});
    }
  });
  (o.legend||[]).slice(0,24).forEach(l=>out.push({type:"scatter",mode:"markers",x:[null],y:[null],
    name:String(l.label).slice(0,o.legendChars||24),marker:{color:l.colour,size:9,symbol:"square"},
    hoverinfo:"skip",showlegend:true}));
  return out;
}