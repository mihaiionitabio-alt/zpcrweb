el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const v=pv(el,"Concentration");if(v!=="")chan(p,c).givenConc=Number(v);
  }