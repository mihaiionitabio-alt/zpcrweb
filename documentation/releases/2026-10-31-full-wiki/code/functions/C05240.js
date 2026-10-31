el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"DominantChannel");if(v!=="")get(p).dominantChannel=Number(v);
  }