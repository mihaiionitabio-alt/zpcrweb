w=>{
      x+=`<react id="${w.pos+1}"><sample id="${xesc(rdmlId("smp",w.sample||w.well))}"/>`;
      x+=`<data><tar id="${xesc(rdmlId("tgt",w.target||"target"))}"/>`;
      if(Number.isFinite(w.CpRaw)&&w.CpRaw>0)x+=`<cq>${w.CpRaw}</cq>`;
      if(w.tms&&Number.isFinite(w.tms[0]))x+=`<meltTemp>${w.tms[0]}</meltTemp>`;
      if(w.curve)w.curve.forEach((v,i)=>{x+=`<adp><cyc>${i+1}</cyc><fluor>${v}</fluor></adp>`;});
      if(w.meltCurve)w.meltCurve.forEach(p=>{
        x+=`<mdp><tmp>${p.temp}</tmp><fluor>${p.fluor}</fluor></mdp>`;
      });
      x+=`</data></react>\n`;
    }