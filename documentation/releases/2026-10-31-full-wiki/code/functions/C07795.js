e=>{
    const h=canvas._hit;if(!h)return;
    const rc=canvas.getBoundingClientRect(),sx=canvas.width/rc.width,sy=canvas.height/rc.height,
      mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy;
    let best=null,bd=(14*sx)**2;
    h.rows.forEach(w=>w.curve.forEach((v,i)=>{const y=h.Y(v);if(!Number.isFinite(y))return;
      const d=(h.X(i)-mx)**2+(y-my)**2;if(d<bd){bd=d;best={w,i,v};}}));
    if(!best){tip.style.display="none";return;}
    tip.innerHTML=`<b>${esc(graphHoverLabel(best.w.experiment||"",best.w,best.w.target||best.w.analysis||""))}</b><br>${esc(ui("Cycle"))} ${best.i+1} · ${esc(Number(best.v).toPrecision(6))}`
      +(Number.isFinite(best.w.CpRaw)?` · Cq ${num(best.w.CpRaw,2)}`:"");
    tip.style.display="block";
    const wrap=tip.parentElement,wr=wrap.getBoundingClientRect(),cx=e.clientX-wr.left+wrap.scrollLeft,cy=e.clientY-wr.top;
    tip.style.left=Math.min(cx+14,wrap.scrollWidth-tip.offsetWidth-4)+"px";tip.style.top=(cy+14)+"px";
  }