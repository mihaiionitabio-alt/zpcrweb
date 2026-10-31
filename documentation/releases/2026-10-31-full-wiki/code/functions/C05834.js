n=>{
      const unk=rows.filter(r=>!r.ctrl&&r.target===n.target&&r.det&&r.role!=="Standard").map(r=>r.cqMaxObs);
      if(!unk.length)return;const gap=n.cqMin-Math.max(...unk);
      add(`NTC-to-sample gap — ${n.target}`,R.ntcGapAction,gap>=sopNum(R.ntcGap),`NTC ${n.sample} Cq ${num(n.cqMin,2)}; latest sample Cq ${num(Math.max(...unk),2)}; gap ${num(gap,2)} (SOP ≥ ${R.ntcGap})`);
    }