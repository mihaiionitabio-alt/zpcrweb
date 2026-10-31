function ssPositionIncluded(run,pos){
  const wells=(run.wells||[]).filter(w=>Number(w.pos)===Number(pos));
  return wells.length?wells.some(w=>ssIncluded(run,w)):ssIncluded(run,{pos,sample:((run.plate||{})[pos]||{}).name||""});
}