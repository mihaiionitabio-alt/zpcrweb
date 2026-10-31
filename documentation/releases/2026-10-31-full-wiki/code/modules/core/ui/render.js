/* ============================================================
   G. Rendering
   ============================================================ */
let LOADED_LIMIT=15;
function renderLoaded(){
  const card=$("#loadedcard");
  if(!RUNS.length&&!PASTED){card.style.display="none";return;}
  card.style.display="";
  let h="";
  if(RUNS.length){
    h+=table([
      {key:"experiment",label:"Experiment"},{key:"platform",label:"Instrument family"},{key:"plate",label:"Plate"},
      {key:"cycles",label:"Cycles",n:1},{key:"analyses",label:"Analyses",n:1},
      {key:"quantification_results",label:"Cq results",n:1},
      {key:"curves_decoded",label:"Curves",n:1},
      {key:"melting_results",label:"Tm results",n:1},
      {key:"channels",label:"Active channels"},{key:"instrument",label:"Instrument"}
    ],metaRows().slice(0,LOADED_LIMIT));
    if(RUNS.length>LOADED_LIMIT)h+=`<div class="toolbar"><span class="hint">${LOADED_LIMIT} of ${RUNS.length} runs listed.</span><button class="ghost" id="loaded-more" type="button">Show all ${RUNS.length}</button></div>`;
    const tpl=RUNS.filter(r=>r.isTemplate);
    if(tpl.length)h+=`<div class="notice warn">${tpl.map(r=>esc(r.file)).join(", ")}: template or unrun experiment — plate setup, protocol and analysis settings only.</div>`;
    const noCurve=RUNS.reduce((s,r)=>s+r.wells.filter(w=>!w.curve).length,0);
    if(noCurve)h+=`<div class="notice warn">${noCurve} stored result(s) have no decoded amplification curve.
      Curve-based exports and checks will skip them.</div>`;
    const acqErr=RUNS.filter(r=>r.acqError);
    if(acqErr.length)h+=`<div class="notice bad">Fluorescence could not be read from
      ${acqErr.map(r=>esc(r.file)).join(", ")}: ${esc(acqErr[0].acqError)}. Cq values are still available.</div>`;
  }
  if(PASTED){
    h+=`<div class="notice ok">${PASTED.rows.length} Cq value(s) read from ${esc(PASTED.source)}.
      The inhibition test and the replicate checks will use these. Curve-based exports need an .ixo file.</div>`;
  }
  $("#loaded").innerHTML=h;
  const more=$("#loaded-more");if(more)more.onclick=()=>{LOADED_LIMIT=1e9;renderLoaded();localizeDOM($("#loadedcard"));};
}
function renderDiagnostics(){
  const box=$("#diag-summary"),log=$("#diag-log");if(!box)return;
  const d=appStatusSnapshot();
  const rows=[
    {label:"Software version",value:d.version},{label:"Lifecycle phase",value:d.phase},
    {label:"Open view",value:d.activeTab},{label:"Import generation",value:d.generation},
    {label:"Runs loaded",value:d.runs},{label:"Files staged",value:d.staged},
    {label:"History rows",value:d.historyRows},{label:"Recorded faults",value:d.faults},
    {label:"Last fault",value:d.lastError?`${d.lastError.area}: ${d.lastError.message}`:"none"}
  ];
  box.innerHTML=table([{key:"label",label:"Item"},{key:"value",label:"Value"}],rows);
  const entries=[...APP_STATS.notices.slice(-5).map(e=>({kind:"notice",...e})),...APP_STATE.errorLog.slice(-5).map(e=>({kind:"fault",...e}))]
    .sort((a,b)=>String(a.time).localeCompare(String(b.time))).reverse();
  log.innerHTML=entries.length?table([{key:"kind",label:"Type"},{key:"time",label:"Time"},{key:"message",label:"Message"}],entries.map(e=>({kind:e.kind,time:e.time,message:`${e.area}: ${e.message}`}))):`<p class="hint">No notices or faults recorded.</p>`;
  $("#diag-refresh").onclick=renderDiagnostics;
  $("#diag-save").onclick=()=>download("qpcr_diagnostics.json",appStatusReport(),"application/json");
}
function renderExports(){
  /* Only what this experiment can actually produce. A disabled card for a
     format the file cannot supply reads as a broken feature rather than as an
     absent one, and invites the question "why not?" every time. What is missing
     is said once, plainly, underneath. */
  const items=exportCatalogue();
  const have=items.filter(it=>it.ready());
  const missing=items.filter(it=>!it.ready());
  /* Clear the previous note first: it lives outside #exports, so replacing that
     element's innerHTML does not remove it, and removing it afterwards would
     delete the one just written. */
  const prev=$("#exp-missing");if(prev)prev.remove();
  $("#exports").innerHTML=have.map(it=>{
    const i=items.indexOf(it);
    return `<div class="dl"><b>${esc(it.title)}</b><span>${esc(it.note)}</span>
      <button class="ghost" data-exp="${i}">Download</button></div>`;
  }).join("")
    +(have.length?"":`<div class="notice">Nothing loaded yet.</div>`);
  if(missing.length&&RUNS.length)
    $("#exports").insertAdjacentHTML("afterend",
      `<p class="hint" id="exp-missing">Not offered for this experiment, because it holds no such data:
        ${missing.map(m=>esc(m.title)).join(", ")}.</p>`);
  $$("#exports button[data-exp]").forEach(b=>b.onclick=()=>items[Number(b.dataset.exp)].run());

  const first=RUNS[0]?safeName(RUNS[0].meta.name||RUNS[0].file):"run";
  const r=rScript().replace("REPLACE_WIDE",`${first}_qpcR_curves.csv`).replace("REPLACE_CQ",baseName()+"_cq_values.csv");
  const p=pyScript().replace("REPLACE_RDML",`${first}.rdml`);
  $("#prev-r").textContent=r;
  $("#prev-py").textContent=p;
  $("#scripts").innerHTML=`
    <div class="dl"><b>analyse_with_qpcR.R</b><span>Fits every curve with qpcR, writes per-well efficiency and
      cpD2, and compares them with the Cq the instrument stored.</span>
      <button class="ghost" id="dl-r">Download R script</button></div>
    <div class="dl"><b>analyse_with_linregpcr.py</b><span>Runs LinRegPCR through rdmlpython on the exported RDML and
      writes the per-well efficiencies and starting concentrations.</span>
      <button class="ghost" id="dl-py">Download Python script</button></div>`;
  $("#dl-r").onclick=()=>download("analyse_with_qpcR.R",r,"text/plain");
  $("#dl-py").onclick=()=>download("analyse_with_linregpcr.py",p,"text/plain");
  renderDiagnostics();
}

