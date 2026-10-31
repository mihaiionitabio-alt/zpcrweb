el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const kind=pv(el,"PropertyTypeName")||"Genotype",v=pv(el,"Genotype")||pv(el,"name")||pv(el,"GenotypeName");
    if(v){(chan(p,c).genotypes??={})[kind]=v;}
  }