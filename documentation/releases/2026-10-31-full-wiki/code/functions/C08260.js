c=>{
    const v=r[c];
    return typeof v==="number"?String(+v.toPrecision(6)):reportTableValue(c,v);
  }