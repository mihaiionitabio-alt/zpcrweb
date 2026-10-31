s=>{
      const v=wells.filter(w=>w.sample===s&&w.target===e),d=v.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.CpRaw);
      if(d.length<v.length)push("review","Endogenous control",`${e} not detected in ${v.length-d.length} of ${v.length} ${s} wells`,"");
      if(s!==cal&&ref.length&&d.length&&Math.abs(mean(d)-mean(ref))>3)
        push("review","Endogenous control",`${s}: ${e} differs by ${num(mean(d)-mean(ref),2)} cycles from ${cal}`,"shifts above 3 cycles are marked for review");
    }