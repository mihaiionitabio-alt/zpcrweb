function(){return next().concat({
  id:'data:evidence_limits',kind:'data',group:'Source provenance',title:'Data evidence and limits',note:'',
  ready:()=>RUNS.length>0,rows:()=>rows(true),file:'data_evidence_limits.csv',
  tableOptions:{full:true,columns:['evidence_view','filename','evidence_item','evidence_state','evidence_detail']},text:()=>csvOf(rows(false))
 });}