t=>{
    if(t.px!=null||t.py!=null)return;
    an.push({xref:"x",yref:"y",x:t.x,y:t.y,xanchor:t.anchor==="end"?"right":"left",yanchor:"middle",
      text:String(t.text),showarrow:false,font:{size:t.size||11,color:t.colour||"#374151"}});}