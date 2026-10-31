h=>{if(!Number.isFinite(h.y)||(ylog&&h.y<=0))return;
    sh.push({type:"line",xref:"paper",yref:"y",x0:0,x1:1,y0:h.y,y1:h.y,
      line:{color:h.colour||"#111",width:1.2,dash:ixDash(h.dash||"5 4")}});
    if(h.label)an.push({xref:"paper",yref:"y",x:o.hlabelsOutside?1.005:0.995,y:h.y,
      xanchor:o.hlabelsOutside?"left":"right",yanchor:"bottom",text:String(h.label),
      showarrow:false,font:{size:10,color:h.colour||"#111"}});}