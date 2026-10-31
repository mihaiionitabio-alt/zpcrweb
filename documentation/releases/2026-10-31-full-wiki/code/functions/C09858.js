function crmAcceptance(values,expected,uCRM,f=1.693,measuredMean=avg(values)){
  const s=rangeStats(values,f),bias=measuredMean-expected,uBias=Math.hypot(uCRM,s.uMean);
  const tolerance=16*Number.EPSILON*Math.max(Math.abs(measuredMean),Math.abs(expected),2*uBias,Number.MIN_VALUE);
  return {...s,mean:measuredMean,bias,uBias,pass:values.length===3&&values.every(Number.isFinite)&&expected>0&&Number.isFinite(uCRM)&&uCRM>=0&&Math.abs(bias)<2*uBias-tolerance};
 }