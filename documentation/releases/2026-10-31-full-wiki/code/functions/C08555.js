([k,v])=>{
    if(v==null)return;
    if(typeof v==="number"){push(k,v,"level");return;}
    if(typeof v!=="object")return;
    /* order matters: a proportion, then a rate per unit exposure, then a bare
       count. Testing count first made the exposure branch dead code. */
    if(Number.isFinite(v.bad)&&Number.isFinite(v.n)&&v.n>0){
      push(k,v.bad/v.n,"proportion",{denominator:"n = "+v.n});return;}
    if(Number.isFinite(v.count)&&Number.isFinite(v.exposure)&&v.exposure>0){
      push(k,v.count/v.exposure,"rate per unit exposure",{denominator:"exposure = "+v.exposure});return;}
    if(Number.isFinite(v.count)&&v.exposure===undefined){push(k,v.count,"count");return;}
    if(Number.isFinite(v.mean)){
      push(k+" · mean",v.mean,"level");
      if(Number.isFinite(v.sd))push(k+" · sd",v.sd,"dispersion");
      return;}
    /* otherwise a map keyed by channel, target or transition */
    Object.entries(v).forEach(([ch,cv])=>{
      if(typeof cv==="number")push(k+" · "+ch,cv,"level",{channel:ch});
      else if(cv&&typeof cv==="object"){
        if(Number.isFinite(cv.bad)&&Number.isFinite(cv.n)&&cv.n>0)
          push(k+" · "+ch,cv.bad/cv.n,"proportion",{channel:ch,denominator:"n = "+cv.n});
        else if(Number.isFinite(cv.count)&&Number.isFinite(cv.exposure)&&cv.exposure>0)
          push(k+" · "+ch,cv.count/cv.exposure,"rate per unit exposure",{channel:ch});
        else if(Number.isFinite(cv.mean))push(k+" · "+ch,cv.mean,"level",{channel:ch});
      }
    });
  }