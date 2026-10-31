g=>{const sl=mlFinite(y.slice(g.from,g.to)),med=mlMedian(sl);
      sl.forEach(v=>resid.push(Math.abs(v-med)));}