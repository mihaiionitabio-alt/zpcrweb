function ixLayout(o){
  const ylog=!!o.ylog,lg=(o.legend||[]).length,sh=[],an=[];
  (o.bands||[]).forEach(b=>{
    if(b.x0!=null)sh.push({type:"rect",xref:"x",yref:"paper",x0:b.x0,x1:b.x1,y0:0,y1:1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
    else sh.push({type:"rect",xref:"paper",yref:"y",x0:0,x1:1,y0:b.y0,y1:b.y1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
  });
  (o.hlines||[]).forEach(h=>{if(!Number.isFinite(h.y)||(ylog&&h.y<=0))return;
    sh.push({type:"line",xref:"paper",yref:"y",x0:0,x1:1,y0:h.y,y1:h.y,
      line:{color:h.colour||"#111",width:1.2,dash:ixDash(h.dash||"5 4")}});
    if(h.label)an.push({xref:"paper",yref:"y",x:o.hlabelsOutside?1.005:0.995,y:h.y,
      xanchor:o.hlabelsOutside?"left":"right",yanchor:"bottom",text:String(h.label),
      showarrow:false,font:{size:10,color:h.colour||"#111"}});});
  (o.vlines||[]).forEach(v=>{if(!Number.isFinite(v.x))return;
    sh.push({type:"line",xref:"x",yref:"paper",x0:v.x,x1:v.x,y0:0,y1:1,
      line:{color:v.colour||"#111",width:1.2,dash:ixDash(v.dash||"5 4")}});
    if(v.label)an.push({xref:"x",yref:"paper",x:v.x,y:1-(v.row||0)*0.07,xanchor:"left",yanchor:"top",
      text:String(v.label),showarrow:false,font:{size:10,color:v.colour||"#111"}});});
  (o.texts||[]).forEach(t=>{
    if(t.px!=null||t.py!=null)return;
    an.push({xref:"x",yref:"y",x:t.x,y:t.y,xanchor:t.anchor==="end"?"right":"left",yanchor:"middle",
      text:String(t.text),showarrow:false,font:{size:t.size||11,color:t.colour||"#374151"}});});
  const yr=ylog?[Math.log10(Math.max(o.y[0],1e-9)),Math.log10(Math.max(o.y[1],1e-9))]:[o.y[0],o.y[1]];
  const xt=o.xticks,rot=xt&&xt.length?(xt.find(t=>t.rotate)||{}).rotate:undefined;
  return {
    title:o.title?{text:String(o.title),x:0,xref:"paper",xanchor:"left",font:{size:13,color:"#111827"}}:undefined,
    height:o.height||440,
    /* autoexpand off: the margins are the ones svgPlot reserves for the same
       content, and it also stops Plotly scheduling an asynchronous margin
       redraw that would fire after the figure has been replaced. */
    margin:{l:o.left||70,r:lg?(o.right||175):(o.right||26),t:o.title?44:18,b:o.bottom||52,autoexpand:false},
    xaxis:{title:{text:o.xlab||"",font:{size:11,color:"#374151"}},range:[o.x[0],o.x[1]],
      tickvals:xt?xt.map(t=>t.v):undefined,ticktext:xt?xt.map(t=>String(t.label)):undefined,
      tickangle:rot,gridcolor:"#f3f4f6",zeroline:false,linecolor:"#9ca3af",mirror:true,
      ticks:"outside",tickfont:{size:10,color:"#6b7280"}},
    yaxis:{title:{text:o.ylab||"",font:{size:11,color:"#374151"}},type:ylog?"log":"linear",range:yr,
      showticklabels:o.yticks!==false,gridcolor:"#e5e7eb",zeroline:false,linecolor:"#9ca3af",mirror:true,
      ticks:"outside",tickfont:{size:10,color:"#6b7280"}},
    showlegend:!!lg,legend:{x:1.005,xanchor:"left",y:1,yanchor:"top",font:{size:10},bgcolor:"rgba(255,255,255,0)",borderwidth:0},
    shapes:sh,annotations:an,hovermode:"closest",plot_bgcolor:"#fff",paper_bgcolor:"#fff",
    font:{family:"system-ui,Segoe UI,Arial,sans-serif",size:11}
  };
}