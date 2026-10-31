b=>{
    if(b.x0!=null)sh.push({type:"rect",xref:"x",yref:"paper",x0:b.x0,x1:b.x1,y0:0,y1:1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
    else sh.push({type:"rect",xref:"paper",yref:"y",x0:0,x1:1,y0:b.y0,y1:b.y1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
  }