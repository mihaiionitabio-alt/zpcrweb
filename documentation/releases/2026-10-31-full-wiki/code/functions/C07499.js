name=>all.filter(w=>(w.sample||"")===name)
      .map(w=>Number(w.CpRaw)).filter(q=>Number.isFinite(q)&&q>0)