(w,k)=>{const q=sopCq(w);if(!Number.isFinite(q))return;
        const r=sopOutcomeFor(c.run,w),key=c.colourby==="role"?(w.role||"Unknown"):sopLabel(r?r.outcome:"Not interpreted");
        const col=c.colourby==="role"?catColour(cm,key):(cm.set(key,sopColour(r?r.outcome:"Not interpreted")),sopColour(r?r.outcome:"Not interpreted"));
        const jit=((k*37)%21-10)/40;
        series.push({type:"points",data:[[ti+jit,q,graphHoverLabel(c.run,w,`${t} · Cq ${num(q,2)} · ${key}`),col]]});
        rows.push({target:t,well:w.well,sample:w.sample,role:w.role,cq:q,outcome:r?r.outcome:""});}