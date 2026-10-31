function issueOverviewRows(indexes){
  const selected=new Set(indexes),out=[];
  const events=reviewEventsWithoutIntegrity();
  events.forEach(e=>{
    if(e.severity==="info")return;
    const ri=RUNS.findIndex(r=>runName(r)===e.experiment);
    if(ri<0||!selected.has(ri))return;
    out.push({category:issueCategoryOf(e),severity:e.severity||"review",experiment:e.experiment,well:"",finding:e.finding||"",evidence:e.evidence||"",source:"forensic"});
  });
  indexes.forEach(ri=>{
    const run=RUNS[ri];if(!run)return;
    graphAnalysisRows(run).forEach(r=>out.push({category:"Amplification / curve shape",severity:r.severity||"review",experiment:runName(run),well:r.well||"",finding:`${r.assessment} for ${r.target||"unnamed target"}`,evidence:`baseline ${num(r.baseline,1)}; ground-noise SD ${num(r.baseline_sd,1)}; late change ${num(r.late_delta,1)}; terminal change ${num(r.terminal_delta,1)}; peak slope ${num(r.max_slope,1)} at cycle ${num(r.max_slope_cycle,0)}`,source:"curve",curve:r.curve,sample:r.sample||"",target:r.target||"",channel:r.channel,issueColour:r.severity==="error"?"#c0392b":"#d97706",storedCall:r.stored_call||""}));
    orphanCurveCandidates(run).forEach(r=>out.push({category:"Amplification / curve shape",severity:r.severity||"review",experiment:runName(run),well:r.well||"",finding:r.finding||"Rising curve without a stored result",evidence:`${r.filterName||r.filterComb||"channel "+r.channel}; amplitude ${num(r.amplitude,1)}; terminal change ${num(r.terminalDelta,1)}`,source:"curve",curve:r.curve,sample:r.sample||"",target:r.target||"",channel:r.channel,issueColour:r.severity==="error"?"#c0392b":"#d97706",storedCall:r.call||""}));
  });
  const seen=new Set();return out.filter(r=>{const k=[r.category,r.severity,r.experiment,r.well,r.finding,r.source].join("|");if(seen.has(k))return false;seen.add(k);return true;});
}