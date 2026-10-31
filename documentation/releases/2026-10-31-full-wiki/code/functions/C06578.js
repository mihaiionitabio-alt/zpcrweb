(rs,ser)=>{
    const byEx=[...byKey(rs,r=>sopControlIdentity(r.wells[0],run).extract)].sort((a,b)=>b[1].reduce((s,r)=>s+r.n,0)-a[1].reduce((s,r)=>s+r.n,0));
    byEx.forEach(([ex,grp],k)=>{const t=k?`${ser} · additional extract ${k}`:ser;
      const a=grp.flatMap(r=>r.used.filter(w=>w.curve&&w.curve.length).map(w=>wellSignal(w.curve).amplitude));
      if(a.length)amp[t]=ccMedian(a);const q=grp.map(r=>r.cqMean).filter(Number.isFinite);if(q.length)pcq[t]=mean(q);bat[t]=ex;});}