el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"Genotype")||pv(el,"name");if(v)get(p).endpointGenotype=v;
  }