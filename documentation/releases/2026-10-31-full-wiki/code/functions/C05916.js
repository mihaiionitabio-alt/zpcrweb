w=>{const q=Number(w.CpRaw);if(Number.isFinite(q)&&q>0&&String(w.CpRaw).replace(/^\d+\./,"").length>=6){
      const k=`${w.target}|${w.CpRaw}`;if(!cqs.has(k))cqs.set(k,[]);cqs.get(k).push(w);}}