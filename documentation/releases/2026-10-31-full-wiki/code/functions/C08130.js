function selGraphContext(g,ri=selRunIndex()){
  const o=SEL_STATE.options["img:"+g.id]||{};
  /* target=all (any case) is the documented way to ask for every target; it must not be read as a target called "all" */
  const allTargets=/^all$/i.test(o.target||"");
  /* An omitted target is intentionally the all-target view. Never infer one from well order. */
  return {g,ri,run:RUNS[ri],target:allTargets?"":String(o.target||"").trim(),
    metric:o.metric||"outcome",signal:o.signal||"stored",log:o.log==="yes",colourby:o.colourby||"outcome",level:o.level||"end",control:o.control||"0"};
}