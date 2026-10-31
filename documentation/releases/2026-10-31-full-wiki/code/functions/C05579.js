(g,k)=>{
    const [s,t]=k.split("|"),d=g.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.CpRaw);
    if(d.length&&d.length<g.length)push("review","Replicates",`${s} / ${t}: ${d.length} of ${g.length} replicates detected`,
      `Ct ${d.map(v=>num(v,2)).join(", ")}; stored means and ΔΔCt rest on these values only`);
    if(d.length>1&&sd(d)>hsd)push("review","Replicates",`${s} / ${t}: Ct SD ${num(sd(d),3)} above ${hsd} (HIGHSD rule)`,
      `range ${num(Math.min(...d),2)}–${num(Math.max(...d),2)}; wells ${g.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.well).join(" ")}`);
  }