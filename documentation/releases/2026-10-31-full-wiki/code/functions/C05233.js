el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;chan(p,c).sampleType=pv(el,"SampleType");
  }