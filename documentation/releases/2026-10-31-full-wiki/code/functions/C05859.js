function sopSampleRowsBase(filterRun,forExport){
  const P=s=>forExport?exportName(s):s;
  return sopEvaluateAll().filter(e=>filterRun==null||filterRun===""||String(e.ri)===String(filterRun)).flatMap(e=>{
    const by=byKey(e.rows.filter(r=>!r.ctrl&&r.outcome!=="Standard"),r=>r.sample);
    return [...by].map(([s,rs])=>{
      const order=["Invalid run","Invalid","Repeat","Inconclusive","Positive","Negative","Not interpreted"];
      /* A taxon reference is a validity check, not a GMO target.  Decide the
         sample-level screening outcome from 35S/T-NOS (or other non-reference
         targets); keep reference failures in needs_action for review. */
      const assay=rs.filter(r=>!r.spec||r.spec.kind!=="reference");
      const decisionRows=assay.length?assay:rs;
      const worst=decisionRows.map(r=>r.outcome).sort((a,b)=>order.indexOf(a)-order.indexOf(b))[0];
      const actionRows=rs.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome));
      const referenceOutcomes=uniq(rs.filter(r=>r.spec&&r.spec.kind==="reference").map(r=>r.outcome));
      return {experiment:runName(e.run),run_status:e.status,sample:P(s),
        summary:rs.map(r=>`${sopTargetLabel(r)}: ${r.label}`).join("; "),sample_outcome:worst,action:actionRows.map(r=>`${sopTargetLabel(r)}: ${r.label}`).join("; "),reference_outcomes:referenceOutcomes.join(" | "),needs_action:actionRows.length?"yes":"",
        report:rs.map(r=>sopFmt((SOP.outcomes[r.outcome]||{}).text,{sample:P(s),target:sopTargetLabel(r),cq:num(r.cqMean,2),sd:num(r.cqSd,2),det:r.det,n:r.n,cutoff:r.cqMax,reason:r.reason,outcome:r.label,run:runName(e.run)})).join(" "),
        ...sopMeta()};
    });
  });
}