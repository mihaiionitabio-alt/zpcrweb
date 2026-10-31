el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"name");if(v)chan(p,c).targetName=v;
  }