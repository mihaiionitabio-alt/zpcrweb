function selectedWells(run,key){
  const all=ssWells(run);
  if(key===ORPHAN_CURVE_KEY)return orphanCurveCandidates(run).filter(w=>ssPositionIncluded(run,w.pos));
  return key?all.filter(w=>(w.analysisUid||w.analysis||w.target||"")===key):all;
}