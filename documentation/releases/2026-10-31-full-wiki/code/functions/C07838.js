o=>{
    const finite=o.curve.filter(Number.isFinite),mn=finite.length?Math.min(...finite):0,mx=finite.length?Math.max(...finite):1,span=mx-mn||1;
    const col=colourBy.get(`${o.experiment}|${o.channel}`)||"#1f6feb";
    ctx.strokeStyle=col;ctx.globalAlpha=.72;ctx.lineWidth=1.25;ctx.beginPath();
    o.curve.forEach((v,i)=>{if(!Number.isFinite(v))return;const x=X(i),y=Y((v-mn)/span);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
  }