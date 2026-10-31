el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"TargetType");if(v)chan(p,c).targetType=v;
  }