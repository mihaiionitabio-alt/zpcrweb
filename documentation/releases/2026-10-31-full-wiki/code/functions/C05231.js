el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"Notes")||pv(el,"name");if(v)get(p).notes=(get(p).notes?get(p).notes+" | ":"")+v;
  }