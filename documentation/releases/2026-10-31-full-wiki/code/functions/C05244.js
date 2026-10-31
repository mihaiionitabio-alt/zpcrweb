el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const kind=pv(el,"PropertyTypeName")||"Sample type",v=pv(el,"GroupSampleType");
    if(v){(chan(p,c).groupTypes??={})[kind]=v;}
  }