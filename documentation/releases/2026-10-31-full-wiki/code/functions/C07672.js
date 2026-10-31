function issueSelectedRunIndexes(){
  if(!Array.isArray(REVIEW_STATE.issueRuns))return RUNS.map((r,i)=>i);
  return REVIEW_STATE.issueRuns.filter(i=>Number.isInteger(i)&&RUNS[i]);
}