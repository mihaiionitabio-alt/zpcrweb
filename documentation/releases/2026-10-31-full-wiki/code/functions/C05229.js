el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"name");if(v&&!get(p).name)get(p).name=v;
  }