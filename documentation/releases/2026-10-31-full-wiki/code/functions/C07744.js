(p,i)=>{if(i%step&&i!==s.points.length-1)return;ctx.save();ctx.translate(X(i),H-B+16);
    ctx.rotate(-.45);ctx.fillText(p.tick,0,0);ctx.restore();}