e=>{
    if(e.severity==="info")return;
    const ri=RUNS.findIndex(r=>runName(r)===e.experiment);
    if(ri<0||!selected.has(ri))return;
    out.push({category:issueCategoryOf(e),severity:e.severity||"review",experiment:e.experiment,well:"",finding:e.finding||"",evidence:e.evidence||"",source:"forensic"});
  }