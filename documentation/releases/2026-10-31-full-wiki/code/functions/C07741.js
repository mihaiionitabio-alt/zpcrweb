k=>{
    const v=s.mean+k*s.sd,y=Y(v),major=Math.abs(k)>=2;
    ctx.strokeStyle=k===0?"#1b7837":Math.abs(k)===3?"#c0392b":Math.abs(k)===2?"#d97706":"#94a3b8";
    ctx.lineWidth=k===0?1.7:1;ctx.setLineDash(k?[4,4]:[]);
    ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);
    if(major||k===0){ctx.fillStyle=ctx.strokeStyle;ctx.fillText(k===0?ui("mean"):`${k>0?"+":""}${k}s`,W-R-3,y-4);}
  }