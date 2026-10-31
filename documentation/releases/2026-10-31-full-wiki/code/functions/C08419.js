segs=>{
    const resid=[];
    segs.forEach(g=>{const sl=mlFinite(y.slice(g.from,g.to)),med=mlMedian(sl);
      sl.forEach(v=>resid.push(Math.abs(v-med)));});
    const s=1.4826*mlMedian(resid);
    return Number.isFinite(s)?s:NaN;
  }