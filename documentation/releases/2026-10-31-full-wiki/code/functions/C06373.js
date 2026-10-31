(pts,ch)=>{const col=catColour(cm,ch);
      series.push({type:"line",colour:col,dash:"4 3",data:pts.map(p=>[p[0],p[1]]),tip:ch+" background"});
      series.push({type:"line",colour:col,width:2,data:pts.map(p=>[p[0],p[2]]),tip:ch+" end point"});
      series.push({type:"points",colour:col,data:pts.map(p=>[p[0],p[2],`${ch} end ${num(p[2],0)}`])});}