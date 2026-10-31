next=>function(){return next().concat({
  title:'Data evidence and limits (CSV)',note:'',ready:()=>RUNS.length>0,
  run:()=>download('data_evidence_limits.csv',csvOf(rows(false)),'text/csv')
 });}