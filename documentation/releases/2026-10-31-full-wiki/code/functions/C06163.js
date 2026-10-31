function graphHoverLabel(experiment,w,detail){
  const run=experiment&&typeof experiment==="object"?experiment:null;
  const exp=run?runName(run):String(experiment||w&&w.experiment||"");
  const cols=run&&run.cols||12;
  const location=w&&(w.well||((Number.isFinite(Number(w.pos))&&Number.isFinite(Number(cols)))?posToWell(Number(w.pos),Number(cols)):""));
  /* Keep replicate-aware sample IDs visible in hover labels while the base
     sample name remains the grouping key used by Cq/SD calculations. */
  const displaySample=w&&(w.sampleId||w.sample)||"";
  return [exp,displaySample,location,detail||""].filter(Boolean).join(" · ");
}