v=>{if(!Number.isFinite(v.x))return;
    sh.push({type:"line",xref:"x",yref:"paper",x0:v.x,x1:v.x,y0:0,y1:1,
      line:{color:v.colour||"#111",width:1.2,dash:ixDash(v.dash||"5 4")}});
    if(v.label)an.push({xref:"x",yref:"paper",x:v.x,y:1-(v.row||0)*0.07,xanchor:"left",yanchor:"top",
      text:String(v.label),showarrow:false,font:{size:10,color:v.colour||"#111"}});}