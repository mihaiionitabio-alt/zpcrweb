function mlInventory(F){
  const inc=table([{key:"name",label:"Metric"},{key:"kind",label:"Quantity"},
    {key:"ch",label:"Channel / target"},{key:"den",label:"Denominator"},{key:"cov",label:"Runs",n:1}],
    (F.included||[]).map(f=>({name:f.name,kind:f.kind,ch:f.channel||"—",
      den:f.denominator||"—",cov:f.coverage==null?"—":f.coverage})));
  const om=(F.omitted||[]).length?table([{key:"name",label:"Metric left out"},{key:"why",label:"Reason"}],
    F.omitted.map(o=>({name:o.name,why:o.why}))):"";
  const dr=(F.dropped||[]).length?mlNote(`${F.dropped.length} run(s) are excluded from the multivariate view because at least one metric is missing on them: `
    +F.dropped.slice(0,6).map(d=>`${d.run} (${d.missing.slice(0,3).join(", ")}${d.missing.length>3?", …":""})`).join("; ")
    +(F.dropped.length>6?" and others":"")+". Complete cases only — a metric absent on a run cannot be imputed here."):"";
  return `<details class="sop-sec"><summary>${esc(ui("What went into the multivariate view"))}</summary>${inc}${om}${dr}</details>`;
}