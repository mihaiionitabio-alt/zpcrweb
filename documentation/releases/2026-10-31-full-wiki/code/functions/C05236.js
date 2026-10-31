el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"CpRangeLow");if(v!=="")chan(p,c).cpLow=Number(v);
  }