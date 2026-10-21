/* ============================================================
   A. Page state and small DOM helpers
   ============================================================ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const APP_VERSION=document.querySelector('meta[name="software-version"]')?.content||"unknown";
/* Explicit lifecycle state. A new generation invalidates pending async work,
   so a slow file read cannot overwrite a newer import. The log is bounded to
   keep diagnostics from becoming another large in-memory data set. */
const APP_LIMITS=Object.freeze({maxFiles:512,maxBytes:2*1024*1024*1024,maxWellsPerRun:10000,maxFaults:100,maxHistoryRows:100000,maxCqRows:100000,maxCqTextBytes:25*1024*1024});
const APP_STATE={phase:"boot",activeTab:"load",generation:0,lastError:null,errorLog:[],limits:APP_LIMITS};
function appError(area,error,context){
  const e=error instanceof Error?error:new Error(String(error));
  const item={time:new Date().toISOString(),area:String(area||"unknown"),message:e.message||String(e),context:context||null};
  APP_STATE.lastError=item;APP_STATE.errorLog.push(item);
  if(APP_STATE.errorLog.length>APP_LIMITS.maxFaults)APP_STATE.errorLog.splice(0,APP_STATE.errorLog.length-APP_LIMITS.maxFaults);
  console.error(`[qPCR ${item.area}]`,e,context||"");
  return item;
}
const APP_PHASE_TRANSITIONS=Object.freeze({boot:["booting"],booting:["idle","staged"],idle:["staging","reading","booting"],staging:["staged","idle","reading"],staged:["reading","staging","idle"],reading:["ready","idle","staged","staging"],ready:["staging","reading","idle"]});
function setPhase(next,reason){
  const prev=APP_STATE.phase;
  if(prev===next)return;
  const legal=APP_PHASE_TRANSITIONS[prev]||[];
  if(!legal.includes(next)){
    const note=`lifecycle transition ${prev} → ${next}${reason?` (${reason})`:``}`;
    if(typeof appNotice==="function")appNotice("lifecycle",note);else console.warn(note);
  }
  APP_STATE.phase=next;appStatusPaint();
}
function appDiagnostics(){return {phase:APP_STATE.phase,activeTab:APP_STATE.activeTab,generation:APP_STATE.generation,runCount:RUNS.length,stagedCount:STAGED.length,lastError:APP_STATE.lastError,errorCount:APP_STATE.errorLog.length};}
function validateRunBoundary(run,source){
  const at=m=>new Error(`${source||"run"}: ${m}`);
  if(!run||typeof run!=="object")throw at("decoder returned no run object");
  if(!Array.isArray(run.wells))throw at("decoded object has no wells array");
  if(run.wells.length>APP_LIMITS.maxWellsPerRun)throw at(`${run.wells.length} wells exceeds the safety limit`);
  if(run.meta!=null&&(typeof run.meta!=="object"||Array.isArray(run.meta)))throw at("meta is not an object");
  const bad=run.wells.findIndex(w=>!w||typeof w!=="object"||Array.isArray(w));
  if(bad>=0)throw at(`well ${bad+1} is not an object`);
  return run;
}
function validateHistoryBoundary(j,source){
  const at=m=>new Error(`${source||"history"}: ${m}`);
  if(!j||j.schema!=="qpcr-instrument-history/1"||!Array.isArray(j.rows))throw at("not an instrument history file");
  if(j.rows.length>APP_LIMITS.maxHistoryRows)throw at(`${j.rows.length.toLocaleString()} rows exceeds the import limit`);
  const bad=j.rows.findIndex(r=>!r||typeof r!=="object"||Array.isArray(r)||typeof r.key!=="string"||!r.key||!r.m||typeof r.m!=="object"||Array.isArray(r.m));
  if(bad>=0)throw at(`row ${bad+1} has no key/measurement object`);
  return j;
}
