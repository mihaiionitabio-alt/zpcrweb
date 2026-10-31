r=>{
    const o=SOP.outcomes[r.outcome]||SOP_OUTCOME_DEFAULTS[r.outcome]||{};
    r.label=o.label||r.outcome;r.colour=o.colour||"#94a3b8";
    r.report=sopFmt(o.text,{sample:r.sample,target:sopTargetLabel(r),cq:num(r.cqMean,2),sd:num(r.cqSd,2),det:r.det,n:r.n,cutoff:r.cqMax,reason:r.reason,outcome:r.label,run:runName(run)});
  }