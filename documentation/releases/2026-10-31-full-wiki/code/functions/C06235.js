sc=>{const col=catColour(cm,sc.target);
      series.push({type:"points",colour:col,data:sc.points.map(p=>[p.x,p.y,graphHoverLabel(c.run,{well:p.well,sample:p.sample},`${sc.target} · ${p.conc} · Cq ${num(p.y,2)} · residual ${num(p.residual,3)}`)])});
      const xs=sc.points.map(p=>p.x),a=Math.min(...xs),b=Math.max(...xs);
      series.push({type:"line",colour:col,data:[[a,sc.intercept+sc.slope*a],[b,sc.intercept+sc.slope*b]]});
      const R=SOP.run,ok=sc.r2>=R.minR2&&sc.efficiency>=R.effMin&&sc.efficiency<=R.effMax&&sc.logs>=R.minLogs&&sc.monotonic;
      texts.push({px:80,py:ty,colour:ok?"#15803d":"#b91c1c",text:`${sc.target}: slope ${num(sc.slope,3)} · R² ${num(sc.r2,4)} (≥${R.minR2}) · E ${sc.efficiency>1000||sc.efficiency<-100?"out of range":num(sc.efficiency,1)+" %"} (${R.effMin}–${R.effMax}) · ${num(sc.logs,1)} logs (≥${R.minLogs})${sc.monotonic?"":" · out of order"} — ${ok?"within SOP":"outside SOP"}`});ty+=15;
    }