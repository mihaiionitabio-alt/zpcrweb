(p,i)=>{if(!Number.isFinite(p.cq)){started=false;return;}
    const x=X(i),y=Y(p.cq);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);}