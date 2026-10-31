function graphAnalysisStats(curve){
  const v=(curve||[]).map(Number).filter(Number.isFinite);
  if(v.length<5)return null;
  const k=Math.max(3,Math.floor(v.length*.2));
  const baseValues=v.slice(0,k);
  const first=mean(baseValues),last=mean(v.slice(-k));
  const baselineSd=sd(baseValues);
  const diffs=v.slice(1).map((x,i)=>x-v[i]).filter(Number.isFinite);
  const maxSlope=diffs.length?Math.max(...diffs):NaN;
  const maxSlopeCycle=diffs.length?diffs.indexOf(maxSlope)+2:NaN;
  const curvature=diffs.slice(1).map((x,i)=>x-diffs[i]).filter(Number.isFinite);
  const maxCurvature=curvature.length?Math.max(...curvature):NaN;
  const maxCurvatureCycle=curvature.length?curvature.indexOf(maxCurvature)+3:NaN;
  const tailK=Math.max(5,Math.floor(v.length*.25));
  const tailBase=mean(v.slice(Math.max(0,v.length-2*tailK),Math.max(0,v.length-tailK)));
  const tailDiffs=v.slice(Math.max(1,v.length-tailK)).map((x,i)=>x-v[Math.max(0,v.length-tailK)-1+i]).filter(Number.isFinite);
  return {n:v.length,baseline:first,baselineSd,late:last,lateDelta:last-first,amplitude:Math.max(...v)-Math.min(...v),
    risingFraction:diffs.length?diffs.filter(x=>x>0).length/diffs.length:0,
    maxSlope,maxSlopeCycle,maxCurvature,maxCurvatureCycle,
    terminalDelta:last-tailBase,terminalRisingFraction:tailDiffs.length?tailDiffs.filter(x=>x>0).length/tailDiffs.length:0};
}