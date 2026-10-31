([ch,cv])=>{
      if(typeof cv==="number")push(k+" · "+ch,cv,"level",{channel:ch});
      else if(cv&&typeof cv==="object"){
        if(Number.isFinite(cv.bad)&&Number.isFinite(cv.n)&&cv.n>0)
          push(k+" · "+ch,cv.bad/cv.n,"proportion",{channel:ch,denominator:"n = "+cv.n});
        else if(Number.isFinite(cv.count)&&Number.isFinite(cv.exposure)&&cv.exposure>0)
          push(k+" · "+ch,cv.count/cv.exposure,"rate per unit exposure",{channel:ch});
        else if(Number.isFinite(cv.mean))push(k+" · "+ch,cv.mean,"level",{channel:ch});
      }
    }