function selReportTitleBase(){
  return SEL_STATE.title||("Selected results" + (RUNS.length===1?" — "+runName(RUNS[0]):""));
}