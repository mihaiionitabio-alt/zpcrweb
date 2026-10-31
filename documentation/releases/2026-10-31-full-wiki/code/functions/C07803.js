w=>{
    const source=w.curve.map(v=>Number.isFinite(v)?(!normalize&&opts.log&&v>0?Math.log10(v):v):null),finite=source.filter(Number.isFinite),mn=finite.length?Math.min(...finite):0,mx=finite.length?Math.max(...finite):1,span=mx-mn||1;
    transformed.push({w,values:source.map(v=>Number.isFinite(v)?(normalize?(v-mn)/span:v):null)});
  }