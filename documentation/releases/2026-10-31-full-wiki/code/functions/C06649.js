v=>{
    let sigHi=false,sigLo=false;
    if(Number.isFinite(v)){const z=(v-I.cl)/I.sigma;
      hi=Math.max(0,hi+z-k);lo=Math.max(0,lo-z-k);
      sigHi=hi>h;sigLo=lo>h;}
    const p={y:hi,y2:-lo,raw:v,cl:0,ucl:h,lcl:-h,sigHi,sigLo,
      flags:sigHi?["upward shift (CUSUM)"]:sigLo?["downward shift (CUSUM)"]:[]};
    if(sigHi)hi=0;if(sigLo)lo=0;                 /* restart the sum that signalled */
    return p;}