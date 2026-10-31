w=>{
      const r=sopOutcomeFor(c.run,w),o=r?r.outcome:"Not interpreted",col=sopColour(o);used.set(sopLabel(o),col);
      const cur=c.signal==="drn"?w.eds.drn:w.curve;
      cur.forEach((v,i)=>rows.push({well:w.well,sample:w.sample,target:w.target,outcome:o,cycle:i+1,fluorescence:v}));
      return {type:"line",colour:col,data:cur.map((v,i)=>[i+1,c.log?Math.max(v,1e-6):v]),tip:graphHoverLabel(c.run,w,`${w.target} · Cq ${num(sopCq(w),2)} · ${sopLabel(o)}`),
        width:o==="Negative"||o==="Not interpreted"?1:1.6};}