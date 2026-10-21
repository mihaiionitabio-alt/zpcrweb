/* ---------- 4 · processing state: who analysed this, if anyone ---------- */
/* The page reports what the instrument's own software concluded, so the first question
   about any file is who produced the results in it. Four states, discriminated by what the
   file itself says - never by the file name:

     instrument     a vendor container (.ixo / .eds): the instrument's own record
     vendor-export  an RDML exported from the vendor's software: it names an <instrument>,
                    carries Cq, and no re-analysis tool is named anywhere in it
     third-party    an RDML whose results were computed by another tool: <ampEffMet> names
                    it, or <backgroundDeterminationMethod> does
     raw            an RDML with fluorescence and no Cq at all: nobody has analysed it

   Measured on the corpus:
     CORPUS-RDML-1.rdml   instrument "QuantStudio Dx", bg "Background Subtraction" -> vendor-export
     example_3_linregpcr.rdml   no instrument, bg "LinRegPCR, constant", ampEffMet LinRegPCR -> third-party
     example_1_raw.rdml         no provenance, no Cq -> raw                                                */
const RDML_REANALYSIS_TOOLS=/linregpcr|pcr-?miner|qpcr-?miner|dart-?pcr|cy0|mak2|lre|analyz/i;
function runProcessingState(run){
  if(!run)return {state:"unknown",reason:"no run"};
  if(run.rawOnly)return {state:'raw',reason:run.pcrdLocked?'Encrypted source inventory; no measurements decoded':'Stored raw acquisitions; independent calculations are separate from vendor results'};
  if(!run.rdmlDoc)return {state:"instrument",reason:"decoded from the instrument's own container"};
  const d=run.rdmlDoc||{};
  const cq=(run.wells||[]).filter(w=>resultCq(w)!==null).length;
  if(!cq)return {state:"raw",
    reason:"the file carries fluorescence data only: no Cq, and no analysis by any software"};
  const named=(d.methods||[]).filter(Boolean);
  const tool=named.find(m=>RDML_REANALYSIS_TOOLS.test(m))
    ||(RDML_REANALYSIS_TOOLS.test(d.backgroundDeterminationMethod||"")?String(d.backgroundDeterminationMethod).split(",")[0]:"");
  if(tool)return {state:"third-party",tool,
    reason:`the results in this file were produced by ${tool}, not by the instrument's software`};
  if((run.meta&&run.meta.InstrumentName)||d.instrument)
    return {state:"vendor-export",
      reason:`exchange export of an analysis made by the instrument's software on ${(run.meta&&run.meta.InstrumentName)||d.instrument}`};
  return {state:"third-party",
    reason:"the file names no instrument, so the results in it were not written by the instrument's software"};
}
function runIsInstrumentAnalysed(run){
  const s=runProcessingState(run).state;return s==="instrument"||s==="vendor-export";
}

/* ---------- 5 · the profile gate ---------- */
/* Called from sopEvaluateRun BEFORE sopRunApplicability: a file the instrument never
   analysed is out of scope whatever the method says. */
function sopProcessingApplicability(run){
  const s=runProcessingState(run);
  if(s.state==="instrument")return {applicable:true,reason:s.reason,state:s.state};
  /* A vendor export IS the producer's analysis, so it is in scope - unless the instrument's
     own file for the same experiment is loaded, in which case that one is the record and this
     one is a companion. */
  if(s.state==="vendor-export"){
    if(runIsSuperseded(run))return {applicable:false,state:"superseded",
      reason:"superseded — "+run.supersededReason};
    return {applicable:true,reason:s.reason,state:s.state};
  }
  return {applicable:false,state:s.state,
    reason:(s.state==="raw"?"raw exchange file — ":"third-party analysis — ")+s.reason};
}

/* ---------- 6 · the vendor container wins ---------- */
/* Same experiment present twice: keep the instrument's file, keep the RDML beside it as a
   companion for comparison, and never evaluate or chart the companion. Matching is on the
   file stem first, then on the experiment identifier, because an export is normally named
   after the run it came from. */
function rdmlStem(name){
  return String(name||"").replace(/\.[^.]+$/,"").replace(/[\s_-]+/g," ").trim().toLowerCase();
}
function rdmlKeyOf(item){
  return [rdmlStem(item.name),String(item.experimentId||"").trim().toLowerCase()].filter(Boolean);
}
function applyRawFilePriority(runs){
  const vendor=runs.filter(r=>!r.rdmlDoc),rdml=runs.filter(r=>r.rdmlDoc);
  if(!vendor.length||!rdml.length)return {runs,superseded:[]};
  const keys=new Set();
  vendor.forEach(v=>{rdmlKeyOf({name:v.file,experimentId:(v.meta||{}).name}).forEach(k=>keys.add(k));});
  const superseded=[],kept=[];
  runs.forEach(r=>{
    if(!r.rdmlDoc){kept.push(r);return;}
    const mine=rdmlKeyOf({name:r.file,experimentId:r.experimentId});
    const hit=mine.find(k=>keys.has(k));
    if(hit){r.supersededBy=vendor.find(v=>rdmlKeyOf({name:v.file,experimentId:(v.meta||{}).name}).includes(hit));
      r.supersededReason=`the instrument's own file for this experiment is loaded (${r.supersededBy?r.supersededBy.file:"vendor container"}); `
        +"the exchange export is kept for comparison only";
      superseded.push(r);}
    kept.push(r);
  });
  return {runs:kept,superseded};
}
function runIsSuperseded(run){return !!(run&&run.supersededBy);}



