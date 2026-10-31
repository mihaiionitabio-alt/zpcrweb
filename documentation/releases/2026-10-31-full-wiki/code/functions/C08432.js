(p,i)=>{
      const d=emb.map((q,j)=>i===j?Infinity:Math.sqrt(p.reduce((s,v,t)=>s+(v-q[t])*(v-q[t]),0)))
        .sort((a,b)=>a-b).slice(0,Math.min(5,emb.length-1));
      return mlMean(d);
    }