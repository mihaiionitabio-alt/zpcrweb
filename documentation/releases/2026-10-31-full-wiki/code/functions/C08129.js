function selRunIndex(){
  const n=Number(SEL_STATE.run)||0;
  return RUNS.length?Math.min(Math.max(0,n),RUNS.length-1):0;
}