a=>{
    if(!CQ_ANALYSIS_KINDS.test(String(a.kind||"")))return;
    const c=Number(a.channelIdx);if(Number.isFinite(c))set.add(c);
  }