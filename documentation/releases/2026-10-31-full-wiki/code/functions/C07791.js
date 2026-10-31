w=>{
    ctx.strokeStyle=curveColour(w,mode);ctx.globalAlpha=controls.includes(w)?.95:.38;
    ctx.lineWidth=controls.includes(w)?1.8:1;ctx.beginPath();
    w.curve.forEach((v,i)=>{const x=X(i),y=Y(v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
    if(w.issueColour){const v=w.curve[w.curve.length-1],x=X(w.curve.length-1),y=Y(v);ctx.fillStyle=w.issueColour;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}
  }