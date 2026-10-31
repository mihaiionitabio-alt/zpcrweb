el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"ReplicateOf");if(v!=="")get(p).replicateOf=parseInt(v,10);
  }