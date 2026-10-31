(x,i)=>{
    const r=Math.floor(i/run.cols),c=i%run.cols,x0=left+c*cw,y0=top+r*ch;
    ctx.fillStyle=plateColour(x,mode,lo,hi);ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1;
    ctx.fillRect(x0+1,y0+1,cw-3,ch-3);ctx.strokeRect(x0+1,y0+1,cw-3,ch-3);
    ctx.textAlign="left";ctx.fillStyle="#111827";ctx.font="10px sans-serif";
    ctx.fillText(String(x.sample||x.well).slice(0,17),x0+5,y0+17);
    ctx.fillStyle="#475569";ctx.font="9px sans-serif";
    const sub=x.cq!==""?`Cq ${num(Number(x.cq),2)}`:(x.call||x.role||x.subsets||"");
    ctx.fillText(String(sub).slice(0,20),x0+5,y0+34);
  }