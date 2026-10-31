([ex,grp],k)=>{const t=k?`${ser} · additional extract ${k}`:ser;
      const a=grp.flatMap(r=>r.used.filter(w=>w.curve&&w.curve.length).map(w=>wellSignal(w.curve).amplitude));
      if(a.length)amp[t]=ccMedian(a);const q=grp.map(r=>r.cqMean).filter(Number.isFinite);if(q.length)pcq[t]=mean(q);bat[t]=ex;}