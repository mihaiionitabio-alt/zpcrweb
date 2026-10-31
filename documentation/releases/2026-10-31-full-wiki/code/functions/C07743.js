(p,i)=>{
    const x=X(i);if(!Number.isFinite(p.cq)){ctx.strokeStyle="#c0392b";ctx.beginPath();
      ctx.moveTo(x-5,H-B-6);ctx.lineTo(x+5,H-B+4);ctx.moveTo(x+5,H-B-6);ctx.lineTo(x-5,H-B+4);ctx.stroke();return;}
    ctx.fillStyle=p.flags?"#c0392b":"#1f6feb";ctx.beginPath();ctx.arc(x,Y(p.cq),p.flags?5:4,0,Math.PI*2);ctx.fill();
  }