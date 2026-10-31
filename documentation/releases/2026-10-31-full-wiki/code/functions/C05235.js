el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"CpRangeHigh");if(v!=="")chan(p,c).cpHigh=Number(v);
  }