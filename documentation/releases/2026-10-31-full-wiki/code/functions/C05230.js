el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"SampleID")||pv(el,"name");if(v)get(p).sampleId=v;
  }