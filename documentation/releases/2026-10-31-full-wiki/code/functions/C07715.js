r=>{
    const key=mode==="subset"?r.subsets:mode==="type"?r.instrument_type:mode==="call"?r.call:mode==="cq"?"Cq scale":r.role;
    if(key&&!legends.has(key))legends.set(key,plateColour(r,mode,lo,hi));
  }