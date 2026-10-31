/* ============================================================
   T. SOP editor, SOP results and the graph gallery
   ============================================================ */
function sopOutcomeFor(run,w){
  const ri=RUNS.indexOf(run);if(ri<0||!w)return null;
  const ev=sopEvaluateAll()[ri];if(!ev)return null;
  return ev.rows.find(r=>r.wells.some(x=>x.pos===w.pos&&(x.target||x.analysis)===(w.target||w.analysis)))||null;
}
const SOP_OUTCOME_OPTIONS=["Positive","Negative","Inconclusive","Repeat","Invalid","flag"];
function sopField(label,path,type,opts,hint){
  const v=path.split(".").reduce((o,k)=>o==null?o:o[k],SOP);
  const id="sopf-"+path.replace(/\./g,"-");
  let input;
  if(type==="select")input=`<select id="${id}" data-sop-path="${path}">${opts.map(o=>`<option value="${esc(o)}"${String(v)===String(o)?" selected":""}>${esc(SOP_ACTION_LABEL[o]||o)}</option>`).join("")}</select>`;
  else if(type==="check")input=`<input id="${id}" type="checkbox" data-sop-path="${path}" style="width:auto"${v?" checked":""}>`;
  else if(type==="area")input=`<textarea id="${id}" data-sop-path="${path}" style="min-height:60px">${esc(v??"")}</textarea>`;
  else input=`<input id="${id}" type="${type==="number"?"number":"text"}" step="any" data-sop-path="${path}" value="${esc(v??"")}">`;
  return `<label class="sop-field"><span>${esc(label)}</span>${input}${hint?`<small class="hint">${esc(hint)}</small>`:""}</label>`;
}
const SOP_ACTION_LABEL={reject:"Reject the run",review:"Flag for review",off:"Do not check",flag:"Flag only (keep outcome)",
  auto:"Automatic",target:"Target",reference:"Reference gene",ic:"Internal / inhibition control",
  "any-valid":"Any valid taxon reference", "all-declared":"Every declared reference",
  negative:"Must be negative",positive:"Must be positive",standard:"Standard (no pass/fail)",name:"Sample name",role:"Resolved role"};
function sopSetPath(path,value){
  /* A profile written before a field existed has no branch for it; create the branch
     rather than throwing, so an older stored profile still accepts the new fields. */
  const keys=path.split("."),last=keys.pop();let o=SOP;
  keys.forEach(k=>{if(o[k]===null||typeof o[k]!=="object")o[k]={};o=o[k];});o[last]=value;
}
function sopTableEditor(box,rows,cols,addLabel,blank){
  const locked=!!SOP.locked;
  const head=cols.map(c=>`<th>${esc(c.label)}</th>`).join("")+(locked?"":"<th></th>");
  const body=rows.map((r,i)=>"<tr>"+cols.map(c=>{
    const v=r[c.key]??"";
    const dis=locked?" disabled":"";
    if(c.type==="select")return `<td><select data-i="${i}" data-k="${c.key}"${dis}>${c.options.map(o=>`<option value="${esc(o)}"${String(v)===String(o)?" selected":""}>${esc(SOP_ACTION_LABEL[o]||o)}</option>`).join("")}</select></td>`;
    if(c.type==="color")return `<td><input type="color" data-i="${i}" data-k="${c.key}" value="${esc(v||"#94a3b8")}"${dis} style="width:46px;padding:0;height:28px"></td>`;
    if(c.type==="static")return `<td>${esc(v)}</td>`;
    return `<td><input type="${c.type==="number"?"number":"text"}" step="any" data-i="${i}" data-k="${c.key}" value="${esc(v)}"${dis} style="min-width:${c.w||80}px"></td>`;
  }).join("")+(locked?"":`<td><button class="ghost sop-del" data-i="${i}" type="button" title="Remove row">✕</button></td>`)+"</tr>").join("");
  box.innerHTML=`<div class="scroll" style="max-height:320px"><table class="sop-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
    +(locked||!addLabel?"":`<button class="ghost sop-add" type="button" style="margin-top:6px">${esc(addLabel)}</button>`);
  box.querySelectorAll("[data-k]").forEach(el=>{el.onchange=()=>{
    const c=cols.find(x=>x.key===el.dataset.k),r=rows[Number(el.dataset.i)];
    r[c.key]=c.type==="number"?(el.value===""?"":Number(el.value)):el.value;sopProfileEdited();};});
  box.querySelectorAll(".sop-del").forEach(b=>b.onclick=()=>{rows.splice(Number(b.dataset.i),1);sopProfileEdited(true);});
  const add=box.querySelector(".sop-add");if(add)add.onclick=()=>{rows.push(blank());sopProfileEdited(true);};
}
function sopProfileEdited(rerender){
  sopChanged();markDirty("review","graphs","sop","results","panel");CC_STATE.cache=null;
  renderSopHeader();if(rerender)renderSopEditor();renderSopResults();
}
function renderSopHeader(){
  const h=$("#sop-head");if(!h)return;
  const hash=sopHash();
  h.innerHTML=`<div class="kv"><b>Profile</b><span>${esc(SOP.name)} · version ${esc(SOP.version)}${SOP.author?` · ${esc(SOP.author)}`:""}</span>
    <b>Laboratory</b><span>${esc(sopLabName()||"not stated")}${sopAnalystName()?` · analysis by ${esc(sopAnalystName())}`:""}</span>
    <b>SHA-256</b><span><code style="font-size:11.5px">${hash}</code></span>
    <b>State</b><span>${SOP.reviewOnly?tag("warn","review-only; no release decision"):SOP.locked?tag("ok","locked — fields are read-only"):tag("warn","editable")}</span></div>`;
  $("#sop-lock").checked=!!SOP.locked;
}
function sopProcedureHTML(){
  const m=SOP.method||{},a=m.applies_when||{},p=SOP.procedure||{},i=SOP.interpretation||{};
  const arr=v=>Array.isArray(v)?v:[];
  const refs=arr(m.reference_genes).map(x=>`<li><b>${esc(x.gene||x.target||"")}</b> — ${esc(x.taxon||"")}; primers ${esc(x.primers||"not stated")}; probe ${esc(x.probe||"not stated")}; ${esc(x.purpose||"taxon reference")}</li>`).join("");
  const steps=arr(p.steps).map(x=>`<li><b>${esc(x.id||"")} ${esc(x.title||"")}</b><br>${esc(x.instruction||"")}<br><span class="hint">Acceptance: ${esc(x.acceptance||"")}</span></li>`).join("");
  const rules=arr(i.rules).map(x=>`<li><b>${esc(x.id||"")}</b> — when ${esc(x.when||"")}; <b>action:</b> ${esc(x.action||"")}; <b>outcome:</b> ${esc(x.outcome||"")}</li>`).join("");
  const principles=arr(i.principles).map(x=>`<li>${esc(x)}</li>`).join("");
  const platforms=arr(a.platforms).join(", ")||"any";
  return `<details class="sop-sec" open><summary>0 · Method, procedure and interpretation</summary>
    <div class="sop-grid"><div><b>Method</b><br>${esc(m.id||SOP.assay||"unspecified")} · revision ${esc(m.revision||SOP.version||"")}</div>
    <div><b>Scope</b><br>${esc(m.scope||"laboratory profile")}</div>
    <div><b>Applicable platforms</b><br>${esc(platforms)}</div>
    <div><b>Run-name rule</b><br><code>${esc(a.run_name_pattern||"none")}</code></div></div>
    ${refs?`<h4>Taxon-specific DNA / extraction references</h4><ul>${refs}</ul>${m.reference_correlation&&m.reference_correlation.description?`<p class="hint"><b>Correlation:</b> ${esc(m.reference_correlation.description)}</p>`:""}`:""}
    <p class="hint">The method block controls applicability. A run outside this scope is reported as <b>Profile not applicable</b>; its stored Cq values, calls and curves remain available.</p>
    ${p.purpose?`<p><b>Purpose:</b> ${esc(p.purpose)}</p>`:""}
    ${steps?`<h4>Procedure</h4><ol>${steps}</ol>`:""}
    ${principles?`<h4>Interpretation principles</h4><ul>${principles}</ul>`:""}
    ${rules?`<h4>Decision rules</h4><ul>${rules}</ul>`:""}
    ${i.reporting?`<p class="hint"><b>Reporting:</b> rule ID ${i.reporting.include_rule_id!==false?"included":"optional"}; reason ${i.reporting.include_reason!==false?"included":"optional"}; stored call ${i.reporting.include_stored_call!==false?"included":"optional"}.</p>`:""}
  </details>`;
}
function renderSopEditor(){
  const box=$("#sop-editor");if(!box)return;
  const L=!!SOP.locked;
  const R="run.",A=["reject","review","off"];
  box.innerHTML=`
  ${sopProcedureHTML()}
  <details class="sop-sec" open><summary>1 · Identity of the procedure</summary><div class="sop-grid">
    ${sopField("Profile name","name")}${sopField("Version","version")}${sopField("Author / approver","author")}
    ${sopField("Laboratory","lab.name",null,null,"named on every report this page builds")}${sopField("Analysis by","lab.analyst",null,null,"the person doing the analysis")}
    ${sopField("Assay","assay")}${sopField("Effective from","effective")}${sopField("Notes","notes","area")}</div></details>
  <details class="sop-sec" open><summary>2 · Targets, Cq cut-offs and late-signal zone</summary>
    <p class="hint">Rows are tried top to bottom; the first whose pattern matches the target name applies. Patterns: <code>35S|P35S</code>, wildcards <code>HMG*</code>, <code>*</code> for anything, or a regular expression written as <code>/^tNOS/</code>. A Cq above the cut-off counts as not detected. A mean Cq above the late-signal limit, or a quantity below the minimum, gets the late-signal outcome.</p>
    <div id="sop-targets"></div>
    ${L?"":`<button class="ghost" id="sop-add-found" type="button">Add a row for every target in the loaded runs</button>`}</details>
  <details class="sop-sec"><summary>3 · Controls: which wells, what they must show, how many per run</summary>
    <p class="hint">Match by the sample name (patterns as above) or by the resolved role (NTC, Blank, Negative control, Positive control, Calibrator, Standard). Leave the Cq range empty when any detection is acceptable.</p>
    <div id="sop-controls"></div></details>
  <details class="sop-sec"><summary>4 · Replicates and internal control</summary><div class="sop-grid">
    ${sopField("Minimum replicates per sample","replicates.min","number")}
    ${sopField("Detected replicates needed for a positive","replicates.positiveMin","number","capped at the number of replicates present")}
    ${sopField("Outcome when only some replicates are detected","replicates.partialOutcome","select",SOP_OUTCOME_OPTIONS.slice(0,5))}
    ${sopField("Maximum replicate SD (Cq)","replicates.maxSd","number")}
    ${sopField("Outcome when the SD is exceeded","replicates.sdOutcome","select",SOP_OUTCOME_OPTIONS)}
    ${sopField("Fixed IC reference Cq (longitudinal monitoring)","ic.referenceCq","number")}
    ${sopField("Maximum IC shift from the run median (cycles)","ic.maxShift","number")}
    ${sopField("Outcome for a negative with a shifted IC","ic.shiftOutcome","select",SOP_OUTCOME_OPTIONS.slice(0,5))}
    ${sopField("Outcome when the IC / reference is not detected","ic.missingOutcome","select",SOP_OUTCOME_OPTIONS.slice(0,5))}
  </div></details>
  <details class="sop-sec"><summary>5 · Run acceptance</summary><div class="sop-grid">
    ${sopField("Container checksum fails",R+"integrity","select",A)}
    ${sopField("Colour compensation when multiple channels are active",R+"colourCompensation","select",A,"Set to Do not check for simplex assays; use Flag for review only when a validated multiplex method requires it.")}
    ${sopField("Taxon reference correlation for target calls",R+"referencePolicy","select",["any-valid","all-declared"],"Use Any valid taxon reference when each sample is run with its species-specific reference gene; an alternate absent species reference is not an invalid result.")}
    ${sopField("Run not completed",R+"runState","select",A)}
    ${sopField("Required control missing",R+"controlsMissing","select",A)}
    ${sopField("Standard curve outside limits",R+"stdCurve","select",A)}
    ${sopField("Minimum R²",R+"minR2","number")}${sopField("Efficiency from (%)",R+"effMin","number")}${sopField("Efficiency to (%)",R+"effMax","number")}
    ${sopField("Minimum dynamic range (log10)",R+"minLogs","number")}
    ${sopField("Minimum NTC-to-sample gap (cycles)",R+"ntcGap","number")}${sopField("NTC gap too small",R+"ntcGapAction","select",A)}
    ${sopField("Maximum hours from run end to last change",R+"editDelayHours","number")}${sopField("Changed later / created after run",R+"editAction","select",A)}
    ${sopField("Calibration expired (QuantStudio)",R+"calibration","select",A)}
    ${sopField("Maximum block zone spread °C (QuantStudio)",R+"maxZoneSpread","number")}${sopField("Zone spread exceeded",R+"zoneAction","select",A)}
    ${sopField("A rejected run turns every sample result into “Invalid run”",R+"invalidRunOverrides","check")}
  </div></details>
  <details class="sop-sec"><summary>6 · Outcomes, colours and report wording</summary>
    <p class="hint">Placeholders: {sample} {target} {cq} {sd} {det} {n} {cutoff} {reason} {outcome} {run}. The colours are used by every SOP graph.</p>
    <div id="sop-outcomes"></div></details>
  <details class="sop-sec"><summary>7 · Graph settings</summary><div class="sop-grid">
    ${sopField("Draw the Cq cut-off lines","graphs.showCutoffs","check")}${sopField("Draw the late-signal lines","graphs.showLate","check")}
    ${sopField("Draw the SD limit","graphs.showSdLimit","check")}</div></details>
  <details class="sop-sec"><summary>8 · Control charts</summary>
    <p class="hint">Each control chart is configured on its own page in the Control panel (chart type, baseline runs, specification limits, run rules, alarm action). Those settings are stored in this profile under "controlCharts" and change its SHA-256. Customised charts: ${Object.keys(SOP.controlCharts||{}).length ? esc(Object.keys(SOP.controlCharts).map(k=>(CC_BY_ID[k]||{}).code||k).join(", ")) : "none (defaults)"}.</p>
    <button class="ghost" type="button" onclick="showTab('panel')">Open the control panel</button></details>
  <details class="sop-sec"><summary>Edit the profile as JSON</summary>
    <textarea id="sop-json" style="min-height:220px;font-family:ui-monospace,monospace;font-size:12px"${L?" readonly":""}></textarea>
    ${L?"":`<button class="ghost" id="sop-json-apply" type="button">Apply JSON</button>`}<span id="sop-json-msg" class="hint"></span></details>`;
  box.querySelectorAll("[data-sop-path]").forEach(el=>{
    if(L)el.disabled=true;
    el.onchange=()=>{const t=el.type;sopSetPath(el.dataset.sopPath,t==="checkbox"?el.checked:t==="number"?(el.value===""?"":Number(el.value)):el.value);sopProfileEdited();};
  });
  sopTableEditor($("#sop-targets"),SOP.targets,[
    {key:"match",label:"Target pattern",w:150},{key:"kind",label:"Kind",type:"select",options:["auto","target","reference","ic"]},
    {key:"cqMax",label:"Cq cut-off",type:"number",w:70},{key:"cqLate",label:"Late-signal limit",type:"number",w:70},
    {key:"quantMin",label:"Minimum quantity",type:"number",w:80},
    {key:"lateOutcome",label:"Late / low outcome",type:"select",options:["Inconclusive","Repeat","Positive"]}],
    "Add target rule",()=>({match:"",kind:"target",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"}));
  sopTableEditor($("#sop-controls"),SOP.controls,[
    {key:"name",label:"Control",w:120},{key:"matchBy",label:"Match by",type:"select",options:["name","role"]},
    {key:"match",label:"Pattern",w:140},{key:"targets",label:"Targets",w:70},
    {key:"expect",label:"Expectation",type:"select",options:["negative","positive","standard"]},
    {key:"cqLo",label:"Cq from",type:"number",w:60},{key:"cqHi",label:"Cq to",type:"number",w:60},
    {key:"minPerRun",label:"Min wells / run",type:"number",w:55},
    {key:"minReplicates",label:"Min replicates / control",type:"number",w:65},
    {key:"purpose",label:"Purpose",w:120},{key:"material",label:"Material",w:100},
    {key:"onFail",label:"If it fails",type:"select",options:["reject","review","off"]}],
    "Add control",()=>({name:"",matchBy:"name",match:"",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"}));
  const orows=SOP_OUTCOMES.map(k=>Object.assign({outcome:k},SOP.outcomes[k]));
  sopTableEditor($("#sop-outcomes"),orows,[{key:"outcome",label:"Outcome",type:"static"},{key:"label",label:"Label in reports",w:120},
    {key:"colour",label:"Colour",type:"color"},{key:"text",label:"Report sentence",w:360}],null,null);
  $("#sop-outcomes").querySelectorAll("[data-k]").forEach(el=>{const prev=el.onchange;el.onchange=()=>{
    const r=orows[Number(el.dataset.i)];r[el.dataset.k]=el.value;SOP.outcomes[r.outcome][el.dataset.k]=el.value;sopProfileEdited();};});
  $("#sop-json").value=sopJSON();
  const ap=$("#sop-json-apply");if(ap)ap.onclick=()=>{try{SOP=sopNormalise(JSON.parse($("#sop-json").value));$("#sop-json-msg").textContent="";sopProfileEdited(true);}
    catch(e){$("#sop-json-msg").textContent="Not valid JSON: "+e.message;}};
  const af=$("#sop-add-found");if(af)af.onclick=()=>{
    const have=new Set(SOP.targets.map(t=>t.match));
    const found=uniq(RUNS.flatMap(r=>(r.wells||[]).map(w=>w.target||"")).filter(Boolean)).filter(t=>!have.has(t));
    const star=SOP.targets.findIndex(t=>t.match==="*"||t.match==="");
    const rows=found.map(t=>{const w=RUNS.flatMap(r=>r.wells).find(x=>x.target===t)||{};const s=sopTargetSpec(w);
      return {match:t,kind:s.kind,cqMax:s.cqMax??40,cqLate:s.cqLate??"",quantMin:s.quantMin??"",lateOutcome:s.lateOutcome||"Inconclusive"};});
    SOP.targets.splice(star<0?SOP.targets.length:star,0,...rows);sopProfileEdited(true);
  };
  localizeDOM(box);
}
const SOP_VIEW={page:0};
function renderSopResults(){
  const box=$("#sop-results");if(!box)return;
  if(!RUNS.length){box.innerHTML=emptyReview();$("#sop-metrics").innerHTML="";return;}
  const all=sopEvaluateAll();
  const runSel=$("#sop-run");setSelectItems(runSel,[{value:"",label:"All runs"},...RUNS.map((r,i)=>({value:i,label:runName(r)}))]);
  const nAcc=all.filter(e=>e.status==="Accepted").length,nRev=all.filter(e=>e.status==="Accepted with review").length,nRej=all.filter(e=>e.status==="Rejected").length,
    nNA=all.filter(e=>/^Profile not applicable/.test(e.status)).length;
  const actionRows=all.flatMap(e=>e.rows.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome)));
  const actionCounts=actionRows.reduce((m,r)=>(m[r.outcome]=(m[r.outcome]||0)+1,m),{}),act=actionRows.length,
    actionBreakdown=Object.entries(actionCounts).map(([k,v])=>`${v} ${(SOP.outcomes[k]||{}).label||k}`).join(", "),
    referenceActions=actionRows.filter(r=>r.spec&&r.spec.kind==="reference").length;
  const actionNote=act?`<p class="hint">${act} result(s) need action: ${esc(actionBreakdown)}.${referenceActions?` ${referenceActions} are taxon-reference checks; they are shown for review and do not by themselves change the GMO target outcome.`:""}</p>`:"";
  $("#sop-metrics").innerHTML=`<div class="metric-grid">${metricCard(nAcc,"runs accepted","ok")}${metricCard(nRev,"runs accepted with review",nRev?"warn":"ok")}
    ${metricCard(nRej,"runs rejected",nRej?"bad":"ok")}${metricCard(nNA,"profile not applicable",nNA?"warn":"ok")}${metricCard(act,"results needing action",act?"warn":"ok")}</div>
    ${actionNote}${SOP.name==="SC screening — SOP-06 laboratory default"?'<p class="hint">SC-06 container checksum differences stay in <b>8 · File integrity</b> and are review-only; they do not reject the assay run.</p>':""}`;
  const view=$("#sop-view").value,ri=runSel.value,filt=$("#sop-outcome").value,q=($("#sop-search").value||"").toLowerCase();
  let rows,cols;
  if(view==="runs"){
    rows=sopRunRows().filter(r=>ri===""||r.experiment===runName(RUNS[ri]));
    cols=[{key:"experiment",label:"Experiment"},{key:"status",label:"Status",html:1},{key:"rejected",label:"Rejected by"},{key:"review",label:"Review"},
      {key:"positive",label:"Positive",n:1},{key:"negative",label:"Negative",n:1},{key:"inconclusive",label:"Inconclusive",n:1},{key:"repeat",label:"Repeat",n:1},
      {key:"invalid",label:"Invalid",n:1},{key:"control_fail",label:"Control fail",n:1},{key:"run_start",label:"Run started"},{key:"last_change",label:"Last change"},
      {key:"hours_run_end_to_last_change",label:"Hours to last change",n:1}];
    rows=rows.map(r=>Object.assign({},r,{status:tag(r.status==="Rejected"?"bad":r.status==="Accepted"?"ok":"warn",r.status)}));
  }else if(view==="criteria"){
    rows=sopCriteriaRows().filter(r=>ri===""||r.experiment===runName(RUNS[ri]));
    if(filt)rows=rows.filter(r=>filt==="attention"?r.status==="fail"||r.status==="review":true);
    cols=[{key:"experiment",label:"Experiment"},{key:"criterion",label:"Criterion"},{key:"status",label:"Result",html:1},{key:"sop_action",label:"SOP action"},{key:"evidence",label:"Evidence"}];
    rows=rows.map(r=>Object.assign({},r,{status:tag(r.status==="fail"?"bad":r.status==="review"?"warn":"ok",r.status),sop_action:SOP_ACTION_LABEL[r.sop_action]||r.sop_action}));
  }else if(view==="samples"){
    rows=sopSampleRows(ri);
    if(filt==="attention")rows=rows.filter(r=>r.needs_action||/Invalid run/.test(r.summary));
    else if(filt)rows=rows.filter(r=>r.sample_outcome===filt||(/Invalid|Repeat|Inconclusive/.test(filt)&&String(r.reference_outcomes||"").split(" | ").includes(filt)));
    cols=[{key:"experiment",label:"Experiment"},{key:"sample",label:"Sample"},{key:"sample_outcome",label:"Worst outcome (when action is needed)",html:1},{key:"action",label:"Action needed"},{key:"summary",label:"Interpretation"},{key:"report",label:"Report text"}];
    rows=rows.map(r=>{const o=SOP.outcomes[r.sample_outcome]||SOP_OUTCOME_DEFAULTS[r.sample_outcome]||{},hideInformational=r.sample_outcome==="Negative"&&!r.action;return Object.assign({},r,{sample_outcome:hideInformational?"":`<span class="sop-pill" style="background:${esc(o.colour||"#94a3b8")}">${esc(o.label||r.sample_outcome)}</span>`});});
  }else{
    rows=sopInterpretationRows(ri);
    if(filt==="attention")rows=rows.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome));
    else if(filt)rows=rows.filter(r=>r.outcome===filt);
    cols=[{key:"experiment",label:"Experiment"},{key:"sample",label:"Sample"},{key:"target",label:"Target"},{key:"kind",label:"Rule"},
      {key:"wells",label:"Wells"},{key:"detected",label:"Detected",n:1},{key:"replicates",label:"n",n:1},{key:"cq_mean",label:"Mean Cq",n:1},
      {key:"cq_sd",label:"SD",n:1},{key:"outcome",label:"Outcome",html:1},{key:"reason",label:"Reason"},{key:"stored_calls",label:"Stored call"}];
    rows=rows.map(r=>{const o=SOP.outcomes[r.outcome]||{};return Object.assign({},r,{cq_mean:r.cq_mean===""?"":num(r.cq_mean,2),cq_sd:r.cq_sd===""?"":num(r.cq_sd,2),
      outcome:`<span class="sop-pill" style="background:${esc(o.colour||"#94a3b8")}">${esc(r.label)}</span>`});});
  }
  if(q)rows=rows.filter(r=>Object.values(r).some(v=>String(v).toLowerCase().includes(q)));
  const per=200,pages=Math.max(1,Math.ceil(rows.length/per));SOP_VIEW.page=Math.min(SOP_VIEW.page,pages-1);
  const show=rows.slice(SOP_VIEW.page*per,(SOP_VIEW.page+1)*per);
  box.innerHTML=`<div class="scroll">${table(cols,show)}</div>
    <div class="toolbar" style="justify-content:space-between"><span class="hint">${rows.length} row(s)${pages>1?` · page ${SOP_VIEW.page+1} of ${pages}`:""}</span>
    ${pages>1?`<span><button class="ghost" id="sop-prev" type="button"${SOP_VIEW.page?"":" disabled"}>‹ Previous</button> <button class="ghost" id="sop-next" type="button"${SOP_VIEW.page<pages-1?"":" disabled"}>Next ›</button></span>`:""}</div>`;
  const pv=$("#sop-prev"),nx=$("#sop-next");
  if(pv)pv.onclick=()=>{SOP_VIEW.page--;renderSopResults();};
  if(nx)nx.onclick=()=>{SOP_VIEW.page++;renderSopResults();};
}
function sopCurrentRows(){
  const view=$("#sop-view").value,ri=$("#sop-run").value;
  return view==="runs"?sopRunRows():view==="criteria"?sopCriteriaRows():view==="samples"?sopSampleRows(ri,true):sopInterpretationRows(ri,true);
}
function csvOf(rows){return toCSV(Object.keys(rows[0]||{}).map(k=>({key:k,label:k})),rows);}
function sheetOf(name,rows){const keys=Object.keys(rows[0]||{});return {name,rows:[keys,...rows.map(r=>keys.map(k=>r[k]))]};}
function sopReadme(){
  return `SOP interpretation export
Generated: ${new Date().toISOString()}
Profile: ${SOP.name}  version ${SOP.version}
Author / approver: ${SOP.author||"-"}
Profile SHA-256 (canonical JSON, without the sha256 field): ${sopHash()}
Runs: ${RUNS.map(r=>`${runName(r)} (source SHA-256 ${(r.meta||{}).sourceSHA256||"-"})`).join("\n      ")}

The stored Cq values, calls and fluorescence were not changed. Each outcome was
produced by applying the profile in sop_profile.json to the stored values; the
column "rule" names the profile row that applied and "reason" says why.
Sample names ${pseudoOn()?"are pseudonymised (the mapping is not part of this bundle)":"are the stored names"}.
`;
}
function sopDownloadWorkbook(){
  if(!RUNS.length)return;
  const prof=[["field","value"],["name",SOP.name],["version",SOP.version],["author",SOP.author],["assay",SOP.assay],["effective",SOP.effective],["sha256",sopHash()],["notes",SOP.notes],[],["profile JSON",sopJSON()]];
  download(baseName()+"_SOP_interpretation.xlsx",makeXlsx([
    sheetOf("Runs",sopRunRows()),sheetOf("Run acceptance",sopCriteriaRows()),sheetOf("Sample report",sopSampleRows("",true)),
    sheetOf("Results by target",sopInterpretationRows("",true)),{name:"SOP profile",rows:prof}]),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
function sopDownloadBundle(){
  if(!RUNS.length)return;
  const entries=[{name:"README.txt",data:sopReadme()},{name:"sop_profile.json",data:sopJSON()},
    {name:"runs.csv",data:csvOf(sopRunRows())},{name:"run_acceptance.csv",data:csvOf(sopCriteriaRows())},
    {name:"sample_report.csv",data:csvOf(sopSampleRows("",true))},{name:"results_by_target.csv",data:csvOf(sopInterpretationRows("",true))}];
  withExportNames(()=>entries.push({name:"forensic_log.csv",data:csvOf(reviewForensicEvents())}));
  const sums=entries.map(e=>`${sha256Hex(typeof e.data==="string"?new TextEncoder().encode(e.data):e.data)}  ${e.name}`).join("\n")+"\n";
  entries.push({name:"SHA256SUMS.txt",data:sums});
  download(baseName()+"_SOP_bundle.zip",makeStoredZip(entries),"application/zip");
}
function wireSop(){
  const presetSel=$("#sop-preset");
  $("#sop-apply-preset").onclick=()=>{SOP=sopNormalise(SOP_PRESETS[presetSel.value]());sopProfileEdited(true);};
  $("#sop-open").onclick=()=>$("#sop-file").click();
  $("#sop-file").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{const p=JSON.parse(await f.text());const claimed=p.sha256;SOP=sopNormalise(p);
      const h=sopHash();$("#sop-msg").innerHTML=claimed?(claimed===h?`<span class="tag ok">${esc(ui("Profile checksum verified"))}</span>`:`<span class="tag bad">${esc(ui("Profile checksum does not match — the file was edited after it was saved"))}</span>`):"";
      sopProfileEdited(true);}catch(err){$("#sop-msg").innerHTML=`<span class="err">${esc(err.message)}</span>`;}
    e.target.value="";};
  $("#sop-save").onclick=()=>download(safeName(SOP.name+"_v"+SOP.version)+".sop.json",sopJSON(),"application/json");
  $("#sop-lock").onchange=e=>{SOP.locked=e.target.checked;sopProfileEdited(true);};
  ["#sop-run","#sop-view","#sop-outcome"].forEach(id=>$(id).onchange=()=>{SOP_VIEW.page=0;renderSopResults();});
  $("#sop-search").oninput=()=>{SOP_VIEW.page=0;renderSopResults();};
  $("#sop-dl-csv").onclick=()=>{const rows=sopCurrentRows();if(rows.length)download(baseName()+"_SOP_"+$("#sop-view").value+".csv",csvOf(rows),"text/csv");};
  $("#sop-dl-xlsx").onclick=sopDownloadWorkbook;
  $("#sop-dl-zip").onclick=sopDownloadBundle;
}
function renderSop(){renderSopHeader();renderSopEditor();}
function renderResults(){renderSopResults();}

/* ---------- a small SVG chart kit ---------- */
function svgEsc(s){return esc(s);}
function niceTicks(lo,hi,n){
  if(!Number.isFinite(lo)||!Number.isFinite(hi))return [];
  if(lo===hi){lo-=1;hi+=1;}
  const step0=(hi-lo)/(n||5),mag=Math.pow(10,Math.floor(Math.log10(step0))),err=step0/mag;
  const step=(err>=7.5?10:err>=3.5?5:err>=1.5?2:1)*mag,out=[];
  for(let k=Math.ceil(lo/step);k*step<=hi+step*1e-9;k++)out.push(+(k*step).toPrecision(12));
  return out;
}
function fmtTick(v){const a=Math.abs(v);return a>=1e5||(a>0&&a<1e-3)?v.toExponential(1):String(+v.toPrecision(6));}
let SVG_CLIP_N=0;
function svgPlot(o){
  if(PLOT_CAPTURE)PLOT_CAPTURE.push(o);   /* interactive view only; see ixMount */
  const W=o.width||880,H=o.height||440,L=o.left||70,Rm=o.right||(o.legend&&o.legend.length?170:20),T=o.top||30,B=o.bottom||50;
  const pw=W-L-Rm,ph=H-T-B;
  const ylog=!!o.ylog;
  const fy=v=>ylog?Math.log10(v):v;
  let [x0,x1]=o.x,[y0,y1]=o.y;
  if(ylog){y0=Math.log10(Math.max(y0,1e-9));y1=Math.log10(Math.max(y1,1e-9));}
  if(x0===x1){x0-=1;x1+=1;}if(y0===y1){y0-=1;y1+=1;}
  const X=v=>L+(v-x0)/(x1-x0)*pw,Y=v=>T+(1-(fy(v)-y0)/(y1-y0))*ph;
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-size="11"><rect width="${W}" height="${H}" fill="#fff"/>`;
  if(o.title)s+=`<text x="${L}" y="18" font-size="13" font-weight="600" fill="#111827">${svgEsc(o.title)}</text>`;
  (o.bands||[]).forEach(b=>{const ya=Y(b.y1),yb=Y(b.y0);if(b.x0!=null){s+=`<rect x="${X(b.x0)}" y="${T}" width="${Math.max(0,X(b.x1)-X(b.x0))}" height="${ph}" fill="${b.colour}" opacity="${b.opacity||0.12}"/>`;}
    else s+=`<rect x="${L}" y="${Math.min(ya,yb)}" width="${pw}" height="${Math.abs(yb-ya)}" fill="${b.colour}" opacity="${b.opacity||0.12}"/>`;});
  let yt=o.yticks===false?[]:ylog?niceTicks(y0,y1,5).filter(v=>Number.isInteger(v)):niceTicks(y0,y1,6);
  if(ylog&&o.yticks!==false&&yt.length<3){                 // less than ~2 decades: also label 2× and 5×
    yt=[];for(let d=Math.floor(y0);d<=Math.ceil(y1);d++)for(const m of [1,2,5]){const v=d+Math.log10(m);if(v>=y0-1e-9&&v<=y1+1e-9)yt.push(v);}}
  const ylab10=v=>{const x=Math.pow(10,v);return x>=1e4||x<0.01?x.toExponential(0).replace("+",""):fmtTick(+x.toPrecision(2));};
  yt.forEach(v=>{const y=T+(1-(v-y0)/(y1-y0))*ph;if(y<T-0.5||y>T+ph+0.5)return;s+=`<line x1="${L}" x2="${L+pw}" y1="${y}" y2="${y}" stroke="#e5e7eb"/><text x="${L-6}" y="${y+3.5}" text-anchor="end" fill="#6b7280">${ylog?ylab10(v):fmtTick(v)}</text>`;});
  const xt=o.xticks||niceTicks(x0,x1,8).map(v=>({v,label:fmtTick(v)}));
  xt.forEach(t=>{const x=X(t.v);if(x<L-0.5||x>L+pw+0.5)return;s+=`<line x1="${x}" x2="${x}" y1="${T+ph}" y2="${T+ph+4}" stroke="#9ca3af"/><text x="${x}" y="${T+ph+16}" text-anchor="${t.anchor||"middle"}" fill="#6b7280"${t.rotate?` transform="rotate(${t.rotate} ${x} ${T+ph+16})"`:""}>${svgEsc(t.label)}</text>`;});
  s+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" fill="none" stroke="#9ca3af"/>`;
  if(o.xlab)s+=`<text x="${L+pw/2}" y="${H-8}" text-anchor="middle" fill="#374151">${svgEsc(o.xlab)}</text>`;
  if(o.ylab)s+=`<text transform="translate(16 ${T+ph/2}) rotate(-90)" text-anchor="middle" fill="#374151">${svgEsc(o.ylab)}</text>`;
  const cid="pc"+(++SVG_CLIP_N);
  s+=`<defs><clipPath id="${cid}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs><g clip-path="url(#${cid})">`;
  (o.series||[]).forEach(se=>{
    const pts=se.data.filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&(!ylog||p[1]>0));
    if(se.type==="line"){if(pts.length<2&&!pts.length)return;
      s+=`<polyline fill="none" stroke="${se.colour}" stroke-width="${se.width||1.3}" stroke-opacity="${se.opacity||0.9}"${se.dash?` stroke-dasharray="${se.dash}"`:""} points="${pts.map(p=>`${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(" ")}"><title>${svgEsc(se.tip||se.label||"")}</title></polyline>`;}
    else if(se.type==="bar"){const bw=se.barWidth||Math.max(2,pw/((x1-x0)||1)*0.7);
      pts.forEach(p=>{const base=p[2]??(ylog?Math.pow(10,y0):Math.max(y0,0));const ya=Y(p[1]),yb=Y(base);
        s+=`<rect x="${X(p[0])-bw/2+(se.offset||0)}" y="${Math.min(ya,yb)}" width="${bw}" height="${Math.abs(yb-ya)}" fill="${p[4]||se.colour}"><title>${svgEsc(p[3]||"")}</title></rect>`;});}
    else pts.forEach(p=>{s+=`<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="${se.r||3.5}" fill="${p[3]||se.colour}" fill-opacity="${se.opacity||0.85}" stroke="#fff" stroke-width="0.6"><title>${svgEsc(p[2]||se.label||"")}</title></circle>`;});
  });
  s+=`</g>`;
  (o.hlines||[]).forEach(h=>{if(!Number.isFinite(h.y)||(ylog&&h.y<=0))return;const y=Y(h.y);if(y<T||y>T+ph)return;
    s+=`<line x1="${L}" x2="${L+pw}" y1="${y}" y2="${y}" stroke="${h.colour||"#111"}" stroke-dasharray="${h.dash||"5 4"}" stroke-width="1.2"/>${o.hlabelsOutside?`<text x="${L+pw+5}" y="${y+3.5}" text-anchor="start" fill="${h.colour||"#111"}">${svgEsc(h.label||"")}</text>`:`<text x="${L+pw-4}" y="${y-4}" text-anchor="end" fill="${h.colour||"#111"}">${svgEsc(h.label||"")}</text>`}`;});
  (o.vlines||[]).forEach(h=>{if(!Number.isFinite(h.x))return;const x=X(h.x);if(x<L||x>L+pw)return;
    s+=`<line x1="${x}" x2="${x}" y1="${T}" y2="${T+ph}" stroke="${h.colour||"#111"}" stroke-dasharray="${h.dash||"5 4"}" stroke-width="1.2"/><text x="${x>L+pw*0.75?x-4:x+4}" text-anchor="${x>L+pw*0.75?"end":"start"}" y="${T+12+(h.row||0)*13}" fill="${h.colour||"#111"}">${svgEsc(h.label||"")}</text>`;});
  if(o.texts)o.texts.forEach(t=>{s+=`<text x="${t.px!=null?t.px:X(t.x)}" y="${t.py!=null?t.py:Y(t.y)}" fill="${t.colour||"#374151"}" font-size="${t.size||11}" text-anchor="${t.anchor||"start"}">${svgEsc(t.text)}</text>`;});
  if(o.legend&&o.legend.length){let y=T+4;const shown=o.legend.slice(0,24);
    shown.forEach(l=>{s+=`<rect x="${L+pw+12}" y="${y}" width="11" height="11" rx="2" fill="${l.colour}"/><text x="${L+pw+28}" y="${y+9.5}" fill="#374151">${svgEsc(String(l.label).slice(0,o.legendChars||24))}</text>`;y+=16;});
    if(o.legend.length>24)s+=`<text x="${L+pw+12}" y="${y+9}" fill="#6b7280">+${o.legend.length-24} more</text>`;}
  return s+`</svg>`;
}
function svgMessage(msg){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 120" width="880" height="120" font-family="system-ui,Arial" font-size="13"><rect width="880" height="120" fill="#fff"/><text x="20" y="60" fill="#6b7280">${svgEsc(ui(msg))}</text></svg>`;}
function extent(vals,pad){const v=vals.filter(Number.isFinite);if(!v.length)return [0,1];let lo=Math.min(...v),hi=Math.max(...v);const p=(hi-lo||Math.abs(hi)||1)*(pad??0.05);return [lo-p,hi+p];}
function legendFromMap(m){return [...m].map(([label,colour])=>({label,colour}));}

/* ---------- interactive view (Plotly, optional) ----------------------------
   svgPlot stays the single source of truth for everything that leaves the
   page: the .svg download, the .png rasteriser, the export atlas and the ZIP
   all take its output, byte for byte. What follows re-draws the same options
   object on screen as an interactive figure so a chart can be zoomed, panned
   and read point by point. No statistic, no limit and no exported byte
   depends on it. The drawn SVG is kept in the document, so an export that
   reads the chart out of the page still reads the drawn SVG and not the
   interactive figure. A graph that does not go through svgPlot — the plate
   heat map and the run acceptance grid draw their own grid of rectangles —
   records nothing here and is shown exactly as before. */
let PLOT_CAPTURE=null;
function plotArm(){PLOT_CAPTURE=[];return PLOT_CAPTURE;}
function plotDisarm(){const c=PLOT_CAPTURE;PLOT_CAPTURE=null;return c||[];}
function ixReady(){return typeof Plotly!=="undefined"&&!!Plotly.newPlot;}
function ixDash(d){const p=String(d||"").trim().split(/[\s,]+/).filter(Boolean);return p.length>1?p.map(v=>v+"px").join(","):undefined;}
function ixTraces(o){
  const out=[],ylog=!!o.ylog;
  (o.series||[]).forEach(se=>{
    const pts=(se.data||[]).filter(p=>Number.isFinite(p[0])&&Number.isFinite(p[1])&&(!ylog||p[1]>0));
    if(!pts.length)return;
    if(se.type==="line"){
      out.push({type:"scatter",mode:"lines",x:pts.map(p=>p[0]),y:pts.map(p=>p[1]),
        line:{color:se.colour,width:se.width||1.3,dash:ixDash(se.dash)},opacity:se.opacity||0.9,
        text:se.tip||se.label||"",hoverinfo:(se.tip||se.label)?"x+y+text":"x+y",showlegend:false});
    }else if(se.type==="bar"){
      const base=pts.map(p=>Number.isFinite(p[2])?p[2]:0);
      out.push({type:"bar",x:pts.map(p=>p[0]),base:base,y:pts.map((p,i)=>p[1]-base[i]),
        marker:{color:pts.map(p=>p[4]||se.colour)},text:pts.map(p=>p[3]||""),
        hoverinfo:"text+x",showlegend:false});
    }else{
      out.push({type:"scatter",mode:"markers",x:pts.map(p=>p[0]),y:pts.map(p=>p[1]),
        marker:{size:(se.r||3.5)*2,color:pts.map(p=>p[3]||se.colour||"#0d8790"),line:{color:"#fff",width:0.6}},
        opacity:se.opacity||0.85,text:pts.map(p=>p[2]||se.label||""),hoverinfo:"text",showlegend:false});
    }
  });
  (o.legend||[]).slice(0,24).forEach(l=>out.push({type:"scatter",mode:"markers",x:[null],y:[null],
    name:String(l.label).slice(0,o.legendChars||24),marker:{color:l.colour,size:9,symbol:"square"},
    hoverinfo:"skip",showlegend:true}));
  return out;
}
function ixLayout(o){
  const ylog=!!o.ylog,lg=(o.legend||[]).length,sh=[],an=[];
  (o.bands||[]).forEach(b=>{
    if(b.x0!=null)sh.push({type:"rect",xref:"x",yref:"paper",x0:b.x0,x1:b.x1,y0:0,y1:1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
    else sh.push({type:"rect",xref:"paper",yref:"y",x0:0,x1:1,y0:b.y0,y1:b.y1,
      fillcolor:b.colour,opacity:b.opacity||0.12,line:{width:0},layer:"below"});
  });
  (o.hlines||[]).forEach(h=>{if(!Number.isFinite(h.y)||(ylog&&h.y<=0))return;
    sh.push({type:"line",xref:"paper",yref:"y",x0:0,x1:1,y0:h.y,y1:h.y,
      line:{color:h.colour||"#111",width:1.2,dash:ixDash(h.dash||"5 4")}});
    if(h.label)an.push({xref:"paper",yref:"y",x:o.hlabelsOutside?1.005:0.995,y:h.y,
      xanchor:o.hlabelsOutside?"left":"right",yanchor:"bottom",text:String(h.label),
      showarrow:false,font:{size:10,color:h.colour||"#111"}});});
  (o.vlines||[]).forEach(v=>{if(!Number.isFinite(v.x))return;
    sh.push({type:"line",xref:"x",yref:"paper",x0:v.x,x1:v.x,y0:0,y1:1,
      line:{color:v.colour||"#111",width:1.2,dash:ixDash(v.dash||"5 4")}});
    if(v.label)an.push({xref:"x",yref:"paper",x:v.x,y:1-(v.row||0)*0.07,xanchor:"left",yanchor:"top",
      text:String(v.label),showarrow:false,font:{size:10,color:v.colour||"#111"}});});
  (o.texts||[]).forEach(t=>{
    if(t.px!=null||t.py!=null)return;
    an.push({xref:"x",yref:"y",x:t.x,y:t.y,xanchor:t.anchor==="end"?"right":"left",yanchor:"middle",
      text:String(t.text),showarrow:false,font:{size:t.size||11,color:t.colour||"#374151"}});});
  const yr=ylog?[Math.log10(Math.max(o.y[0],1e-9)),Math.log10(Math.max(o.y[1],1e-9))]:[o.y[0],o.y[1]];
  const xt=o.xticks,rot=xt&&xt.length?(xt.find(t=>t.rotate)||{}).rotate:undefined;
  return {
    title:o.title?{text:String(o.title),x:0,xref:"paper",xanchor:"left",font:{size:13,color:"#111827"}}:undefined,
    height:o.height||440,
    /* autoexpand off: the margins are the ones svgPlot reserves for the same
       content, and it also stops Plotly scheduling an asynchronous margin
       redraw that would fire after the figure has been replaced. */
    margin:{l:o.left||70,r:lg?(o.right||175):(o.right||26),t:o.title?44:18,b:o.bottom||52,autoexpand:false},
    xaxis:{title:{text:o.xlab||"",font:{size:11,color:"#374151"}},range:[o.x[0],o.x[1]],
      tickvals:xt?xt.map(t=>t.v):undefined,ticktext:xt?xt.map(t=>String(t.label)):undefined,
      tickangle:rot,gridcolor:"#f3f4f6",zeroline:false,linecolor:"#9ca3af",mirror:true,
      ticks:"outside",tickfont:{size:10,color:"#6b7280"}},
    yaxis:{title:{text:o.ylab||"",font:{size:11,color:"#374151"}},type:ylog?"log":"linear",range:yr,
      showticklabels:o.yticks!==false,gridcolor:"#e5e7eb",zeroline:false,linecolor:"#9ca3af",mirror:true,
      ticks:"outside",tickfont:{size:10,color:"#6b7280"}},
    showlegend:!!lg,legend:{x:1.005,xanchor:"left",y:1,yanchor:"top",font:{size:10},bgcolor:"rgba(255,255,255,0)",borderwidth:0},
    shapes:sh,annotations:an,hovermode:"closest",plot_bgcolor:"#fff",paper_bgcolor:"#fff",
    font:{family:"system-ui,Segoe UI,Arial,sans-serif",size:11}
  };
}
const IX_MOUNTED=[];
function ixPurge(){while(IX_MOUNTED.length){const el=IX_MOUNTED.pop();try{Plotly.purge(el);}catch(e){}}}
/* Draws the recorded specs into box as interactive figures. The nodes already
   in box (the drawn SVG) are moved into a hidden holder that stays first in
   document order, so any export that queries the page for its SVG is
   unaffected. Returns false and leaves box untouched if it cannot draw. */
function ixMount(box,specs,on){
  ixPurge();
  if(!box)return false;
  const old=box.querySelector(".ix-svg-hold");
  if(old){while(old.firstChild)box.insertBefore(old.firstChild,old);old.remove();}
  box.querySelectorAll(".ix-plot").forEach(el=>el.remove());
  specs=(specs||[]).filter(Boolean);
  if(!on||!ixReady()||!specs.length)return false;
  if(!specs.some(o=>ixTraces(o).length))return false;   /* nothing plottable: keep the drawn SVG */
  const hold=document.createElement("div");hold.className="ix-svg-hold";hold.style.display="none";
  while(box.firstChild)hold.appendChild(box.firstChild);
  box.appendChild(hold);
  const made=[];
  specs.forEach(o=>{
    const d=document.createElement("div");d.className="ix-plot";box.appendChild(d);
    try{
      /* newPlot finishes asynchronously. If the figure is replaced or released
         before it settles, the remainder of that promise has nothing to work on;
         the rejection is swallowed here instead of surfacing as a page error. */
      const pr=Plotly.newPlot(d,ixTraces(o),ixLayout(o),{responsive:true,displaylogo:false,
        modeBarButtonsToRemove:["lasso2d","select2d"],
        toImageButtonOptions:{format:"svg",filename:"chart",width:o.width||880,height:o.height||440}});
      if(pr&&pr.then)pr.then(null,()=>{});
      made.push(d);IX_MOUNTED.push(d);
    }catch(e){console.error("interactive chart:",e);d.remove();}
  });
  if(!made.length){ // put the drawn SVG back
    while(hold.firstChild)box.insertBefore(hold.firstChild,hold);hold.remove();return false;
  }
  return true;
}
function catColour(map,key){const k=String(key||"—");if(!map.has(k))map.set(k,SERIES_PALETTE[map.size%SERIES_PALETTE.length]);return map.get(k);}
function sopColour(o){return (SOP.outcomes[o]||SOP_OUTCOME_DEFAULTS[o]||{}).colour||"#94a3b8";}
function sopLabel(o){return (SOP.outcomes[o]||SOP_OUTCOME_DEFAULTS[o]||{}).label||o;}

/* Sample inclusion is a separate analysis mask. Decoded records, file bytes,
   acquisition data and ccStatic hardware extraction are never edited here. */
const SAMPLE_SELECTION={excluded:new Set(),draft:new Set(),pending:false,rows:[],page:0,revision:0};
function ssName(run,w){return String(w.sample||((run.plate||{})[w.pos]||{}).name||"").trim()||"(unnamed well "+(w.well||w.pos)+")";}
const SS_EXPORT_CONTEXT=new WeakMap();
function ssExportClone(clone,original,ri){
  const rows=new WeakMap();["wells","tmWells","rqResults","genoResults","otherResults"].forEach(k=>(clone[k]||[]).forEach((w,i)=>{if((original[k]||[])[i])rows.set(w,original[k][i]);}));
  SS_EXPORT_CONTEXT.set(clone,{original,ri,rows});return clone;
}
function ssKey(run,w){const ctx=SS_EXPORT_CONTEXT.get(run);return JSON.stringify(ctx?[ctx.ri,ssName(ctx.original,ctx.rows.get(w)||w)]:[RUNS.indexOf(run),ssName(run,w)]);}
function ssIncluded(run,w){return !SAMPLE_SELECTION.pending&&!SAMPLE_SELECTION.excluded.has(ssKey(run,w));}
function ssWells(run){return ((run&&run.wells)||[]).filter(w=>ssIncluded(run,w));}
function ssPositionIncluded(run,pos){
  const wells=(run.wells||[]).filter(w=>Number(w.pos)===Number(pos));
  return wells.length?wells.some(w=>ssIncluded(run,w)):ssIncluded(run,{pos,sample:((run.plate||{})[pos]||{}).name||""});
}
function ssBuildRows(){
  const out=[];
  RUNS.forEach((run,ri)=>{const map=new Map(),T=runTimes(run),date=Number.isFinite(T.start)?sopFmtTime(T.start).slice(0,10):"Date not recorded";
    const add=w=>{const key=ssKey(run,w);let r=map.get(key);if(!r){r={key,ri,date,experiment:runName(run),sample:ssName(run,w),wells:new Set(),targets:new Set(),roles:new Set()};map.set(key,r);}
      if(w.well||Number.isFinite(Number(w.pos)))r.wells.add(w.well||posToWell(Number(w.pos),run.cols));
      if(w.target||w.analysis)r.targets.add(w.target||w.analysis);if(w.role)r.roles.add(w.role);};
    [...(run.wells||[]),...(run.tmWells||[]),...(run.genoResults||[]),...(run.rqResults||[]),...(run.otherResults||[])].forEach(add);
    Object.entries(run.plate||{}).forEach(([pos,rec])=>{if(rec.name&&!((run.wells||[]).some(w=>Number(w.pos)===Number(pos))))add({pos:Number(pos),sample:rec.name});});
    out.push(...[...map.values()].map(r=>({...r,wells:[...r.wells],targets:[...r.targets],roles:[...r.roles]})));});
  SAMPLE_SELECTION.rows=out;return out;
}
/* Deterministic unsupervised naming-template model. Learns from distinct analysed
   sample names, not replicate counts; controls/standards and empty plate labels
   are kept outside the learned sample population. Suggestions never edit selection. */
function ssNameTemplate(name){return String(name).normalize("NFKC").toLocaleUpperCase().replace(/\p{N}+/gu,"#").replace(/\s+/g," ").trim();}
function ssNameControl(r){return r.roles.some(role=>/control|calibrat|standard|blank|\bNTC\b/i.test(role));}
function ssLearnNames(rows,scope="experiment",sensitivity="balanced"){
  const groups=new Map(),out=new Map(),models=[];
  rows.forEach(r=>{const k=scope==="all"?"All experiments":r.experiment+"\u0000"+r.ri;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
  const minShare={sensitive:.10,balanced:.15,strict:.25}[sensitivity]||.15;
  groups.forEach((items,key)=>{
    const names=new Map();items.filter(r=>!ssNameControl(r)&&r.targets.length&&!/^\(unnamed well /.test(r.sample)).forEach(r=>names.set(r.sample,ssNameTemplate(r.sample)));
    const counts=new Map();names.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
    const ranked=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const n=names.size,dominant=n>=8&&ranked.length&&ranked[0][1]/n>=.35;
    const common=new Set(dominant?ranked.filter(([,count])=>count>=Math.max(3,Math.ceil(n*minShare))).map(([t])=>t):[]);
    models.push({scope:key.split("\u0000")[0],n,common:[...common],ready:!!dominant});
    items.forEach(r=>{const template=ssNameTemplate(r.sample);let kind,reason;
      if(ssNameControl(r)){kind="control";reason="Control or standard: reviewed separately, not used to learn routine sample names.";}
      else if(!r.targets.length){kind="unavailable";reason="No analysed result: not used to learn sample-name patterns.";}
      else if(n<8){kind="unavailable";reason=`Only ${n} distinct sample names in this scope; at least 8 are needed.`;}
      else if(!dominant){kind="mixed";reason="No naming template covers at least 35% of distinct names; no unusual-name claim is made.";}
      else if(common.has(template)){kind="usual";reason=`Matches a common template (${counts.get(template)}/${n} distinct names): ${template}`;}
      else{kind="unusual";reason=`Less common template (${counts.get(template)||0}/${n} distinct names): ${template}. Common: ${[...common].join("; ")}`;}
      const title={control:"Controls / standards",unavailable:"Insufficient naming data",mixed:"Mixed naming patterns",usual:"Common naming pattern",unusual:"Unusual name pattern"}[kind];
      out.set(r.key,{kind,template,reason,group:title+(kind==="usual"||kind==="unusual"?" — "+template:"")});
    });
  });return {out,models};
}
function ssNameAnnotations(){
  const enabled=$("#ss-names-enable").checked;
  $("#ss-names-options").hidden=!enabled;
  if(!enabled){SAMPLE_SELECTION.rows.forEach(r=>{r.nameReview=null;r.namePattern="";});$("#ss-names-note").textContent="";return;}
  const learned=ssLearnNames(SAMPLE_SELECTION.rows,$("#ss-names-scope").value,$("#ss-names-sensitivity").value);
  SAMPLE_SELECTION.rows.forEach(r=>{r.nameReview=learned.out.get(r.key);r.namePattern=r.nameReview.group;});
  const n=SAMPLE_SELECTION.rows.filter(r=>r.nameReview.kind==="unusual").length;
  $("#ss-names-note").textContent=`${n} sample(s) have less common name patterns. Numbers are treated as identifier slots (#); words and separators define the learned templates. Controls stay separate. Suggestions do not exclude samples. `
    +learned.models.filter(m=>m.ready).slice(0,4).map(m=>`${m.scope}: ${m.common.join("; ")}`).join(" · ");
}

function ssFiltered(){const q=String($("#ss-search").value||"").toLocaleLowerCase().trim(),view=$("#ss-view").value;
  ssNameAnnotations();
  const names=$("#ss-names-enable").checked?$("#ss-names-filter").value:"all";
  return SAMPLE_SELECTION.rows.filter(r=>(names==="all"||r.nameReview.kind===names)&&(!q||[r.sample,r.experiment,r.date,r.roles.join(" "),r.targets.join(" ")].join(" ").toLocaleLowerCase().includes(q))
    &&(view==="all"||(view==="excluded")===SAMPLE_SELECTION.draft.has(r.key)));}
function ssRender(){
  const rows=ssFiltered(),group=$("#ss-group").value,groups=new Map();rows.sort((a,b)=>String(a[group]).localeCompare(String(b[group]),undefined,{numeric:true})||a.date.localeCompare(b.date)||a.experiment.localeCompare(b.experiment)||a.sample.localeCompare(b.sample,undefined,{numeric:true}));
  rows.forEach(r=>{const k=r[group];if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);});
  const count=SAMPLE_SELECTION.rows.length,excluded=SAMPLE_SELECTION.draft.size;
  $("#ss-summary").textContent=`${count-excluded} included · ${excluded} excluded · ${rows.length} match the current filter. Replicates and targets stay together.`;
  const size=150;SAMPLE_SELECTION.page=Math.max(0,Math.min(SAMPLE_SELECTION.page,Math.max(0,Math.ceil(rows.length/size)-1)));
  const visible=new Set(rows.slice(SAMPLE_SELECTION.page*size,(SAMPLE_SELECTION.page+1)*size).map(r=>r.key));
  let html="";let gi=0;
  groups.forEach((members,name)=>{const shown=members.filter(r=>visible.has(r.key));if(!shown.length)return;const n=members.filter(r=>!SAMPLE_SELECTION.draft.has(r.key)).length;
    html+=`<tr style="background:#eef3fb"><td><input type="checkbox" data-ss-group="${gi}" ${n===members.length?"checked":""} aria-label="Include group ${esc(name)}"></td><th colspan="7" style="text-align:left">${esc(name)} <span class="hint">${n}/${members.length} included</span></th></tr>`;
    shown.forEach(r=>{const ix=SAMPLE_SELECTION.rows.indexOf(r);html+=`<tr${SAMPLE_SELECTION.draft.has(r.key)?' style="opacity:.6"':""}><td><input type="checkbox" data-ss-row="${ix}" ${SAMPLE_SELECTION.draft.has(r.key)?"":"checked"} aria-label="Include ${esc(r.sample)} in ${esc(r.experiment)}"></td><td>${esc(r.date)}</td><td>${esc(r.experiment)}</td><td>${esc(r.sample)}</td><td>${esc(r.roles.join(", "))}</td><td>${esc(r.wells.join(", "))}</td><td>${esc(r.targets.join(", "))}</td><td style="min-width:170px">${r.nameReview?`<span style="color:${r.nameReview.kind==="unusual"?"#9a4c00":"#475569"}" title="${esc(r.nameReview.reason)}">${esc(r.nameReview.group)}</span><div class="hint">${esc(r.nameReview.reason)}</div>`:"—"}</td></tr>`;});gi++;});
  $("#ss-body").innerHTML=html||'<tr><td colspan="8">No samples match this filter.</td></tr>';
  const listed=[...groups.values()].filter(g=>g.some(r=>visible.has(r.key)));
  $("#ss-body").querySelectorAll('[data-ss-group]').forEach(box=>{const g=listed[Number(box.dataset.ssGroup)],n=g.filter(r=>!SAMPLE_SELECTION.draft.has(r.key)).length;box.indeterminate=n>0&&n<g.length;box.onchange=()=>{g.forEach(r=>box.checked?SAMPLE_SELECTION.draft.delete(r.key):SAMPLE_SELECTION.draft.add(r.key));ssRender();};});
  $("#ss-body").querySelectorAll('[data-ss-row]').forEach(box=>box.onchange=()=>{const r=SAMPLE_SELECTION.rows[Number(box.dataset.ssRow)];box.checked?SAMPLE_SELECTION.draft.delete(r.key):SAMPLE_SELECTION.draft.add(r.key);ssRender();});
  $("#ss-page").textContent=`Page ${SAMPLE_SELECTION.page+1} of ${Math.max(1,Math.ceil(rows.length/size))}`;
  $("#ss-prev").disabled=SAMPLE_SELECTION.page===0;$("#ss-next").disabled=(SAMPLE_SELECTION.page+1)*size>=rows.length;
}
function ssUpdateBadge(){const n=SAMPLE_SELECTION.excluded.size;$("#ss-applied").textContent=SAMPLE_SELECTION.pending?"Sample review pending":n?`${n} sample(s) excluded from analysis`:'All samples included';$("#ss-edit").hidden=!RUNS.length;}
function ssOpen(pending=false){ssBuildRows();SAMPLE_SELECTION.draft=new Set(SAMPLE_SELECTION.excluded);SAMPLE_SELECTION.page=0;SAMPLE_SELECTION.pending=pending;$("#ss-search").value="";$("#ss-view").value="all";$("#ss-review").hidden=false;$("#ss-cancel").hidden=pending;ssRender();ssUpdateBadge();showTab("load");$("#ss-review").scrollIntoView({block:"start"});}
function ssReset(){SAMPLE_SELECTION.excluded.clear();SAMPLE_SELECTION.draft.clear();SAMPLE_SELECTION.rows=[];SAMPLE_SELECTION.pending=false;SAMPLE_SELECTION.revision++;$("#ss-review").hidden=true;ssUpdateBadge();}
function ssApply(){SAMPLE_SELECTION.excluded=new Set(SAMPLE_SELECTION.draft);SAMPLE_SELECTION.pending=false;SAMPLE_SELECTION.revision++;$("#ss-review").hidden=true;SOP_CACHE=null;invalidateAnalysisCaches();ssUpdateBadge();refreshAll();showTab("results");}
function ssManifest(){return SAMPLE_SELECTION.rows.map(r=>({date:r.date,experiment:r.experiment,sample:r.sample,roles:r.roles.join(" | "),wells:r.wells.join(" | "),targets:r.targets.join(" | "),selection:SAMPLE_SELECTION.excluded.has(r.key)?"excluded":"included"}));}
function ssBind(){
  ["#ss-names-enable","#ss-names-scope","#ss-names-sensitivity","#ss-names-filter"].forEach(id=>$(id).onchange=()=>{if(!$("#ss-names-enable").checked&&$("#ss-group").value==="namePattern")$("#ss-group").value="experiment";SAMPLE_SELECTION.page=0;ssRender();});
  $("#ss-names-unusual").onclick=()=>{$("#ss-names-enable").checked=true;$("#ss-group").value="namePattern";$("#ss-names-filter").value="unusual";$("#ss-view").value="all";SAMPLE_SELECTION.page=0;ssRender();};
  $("#ss-edit").onclick=()=>ssOpen(false);
  $("#ss-enable").onchange=e=>{if(e.target.checked&&RUNS.length)ssOpen(false);else if(!e.target.checked){ssReset();SOP_CACHE=null;invalidateAnalysisCaches();refreshAll();}};
  let timer;$("#ss-search").oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{SAMPLE_SELECTION.page=0;ssRender();},120);};
  ["#ss-group","#ss-view"].forEach(id=>$(id).onchange=()=>{if($("#ss-group").value==="namePattern")$("#ss-names-enable").checked=true;SAMPLE_SELECTION.page=0;ssRender();});
  $("#ss-select").onclick=()=>{ssFiltered().forEach(r=>SAMPLE_SELECTION.draft.delete(r.key));ssRender();};
  $("#ss-unselect").onclick=()=>{ssFiltered().forEach(r=>SAMPLE_SELECTION.draft.add(r.key));ssRender();};
  $("#ss-prev").onclick=()=>{SAMPLE_SELECTION.page--;ssRender();};$("#ss-next").onclick=()=>{SAMPLE_SELECTION.page++;ssRender();};
  $("#ss-apply").onclick=ssApply;$("#ss-cancel").onclick=()=>{$("#ss-review").hidden=true;SAMPLE_SELECTION.draft=new Set(SAMPLE_SELECTION.excluded);ssUpdateBadge();};
  $("#ss-manifest").onclick=()=>{ssBuildRows();download("sample_selection.csv",csvOf(ssManifest()),"text/csv");};
}

/* ---------- the graphs ---------- */
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
function gRunWells(run,target){return ssWells(run).filter(w=>!target||(w.target||w.analysis)===target);}
function gTargets(run){return uniq(ssWells(run).map(w=>w.target||w.analysis).filter(Boolean));}
function gCutLines(target,axis){
  const out=[];if(!target)return out;
  const spec=sopTargetSpec({target});
  if(SOP.graphs.showCutoffs&&Number.isFinite(sopNum(spec.cqMax)))out.push({[axis]:sopNum(spec.cqMax),label:`SOP cut-off ${spec.cqMax}`,colour:"#b91c1c"});
  if(SOP.graphs.showLate&&Number.isFinite(sopNum(spec.cqLate)))out.push({[axis]:sopNum(spec.cqLate),label:`late-signal ${spec.cqLate}`,colour:"#d97706",row:1});
  return out;
}
/* cross-run graphs: runs in date order (load order is the file-name order), and an x axis that names the runs when
   there are few of them and shows dates when there are many */
function gRunDate(r){const T=runTimes(r);return Number.isFinite(T.start)?T.start:Number.isFinite(T.created)?T.created:Infinity;}
function gByDate(list,getRun){return list.map((x,k)=>({x,k,d:gRunDate(getRun(x))})).sort((a,b)=>a.d-b.d||a.k-b.k).map(o=>o.x);}
function gRunTicks(runs){
  if(runs.length<=40)return {xticks:runs.map((r,i)=>({v:i,label:runName(r).slice(0,16),rotate:-40,anchor:"end"})),bottom:120,xlab:""};
  const step=Math.ceil(runs.length/9),t=[];
  for(let i=0;i<runs.length;i+=step){const d=gRunDate(runs[i]);t.push({v:i,label:Number.isFinite(d)?sopFmtTime(d).slice(0,10):String(i+1),rotate:-30,anchor:"end"});}
  return {xticks:t,bottom:80,xlab:`${runs.length} runs in date order`};
}
const GRAPHS=[
 {id:"timeline",group:"Run history",title:"Run timeline — created, run, analysis, last change",scope:"run",
  note:"Every dated event the file carries: experiment creation, run start and end, analysis creation and edits, the last recorded change (for .eds, the newest ZIP entry date is the last save), instrument log and calibrations. Events more than 7 days from the run are listed in the table and marked at the edge.",
  render(c){
    const ev=runTimeline(c.run);if(!ev.length)return {svg:svgMessage("The file carries no dated events."),rows:[]};
    const T=runTimes(c.run),ref=Number.isFinite(T.start)?T.start:ev[0].time,near=ev.filter(e=>Math.abs(e.time-ref)<7*864e5);
    const lo=Math.min(...near.map(e=>e.time)),hi=Math.max(...near.map(e=>e.time)),span=(hi-lo)||3600000;
    const toH=t=>(Math.max(lo,Math.min(hi,t))-ref)/3600000;
    const cols={file:"#2563eb",run:"#16a34a",analysis:"#7c3aed",edit:"#dc2626",calibration:"#d97706"};
    const series=ev.map((e,i)=>({type:"points",r:5,colour:cols[e.kind],data:[[toH(e.time),ev.length-i,`${e.what}: ${sopFmtTime(e.time)}`,cols[e.kind]]]}));
    if(Number.isFinite(T.start)&&Number.isFinite(T.end))series.unshift({type:"bar",colour:"#bbf7d0",barWidth:0,data:[]});
    const height=Math.max(260,ev.length*20+90);
    const texts=ev.map((e,i)=>{const off=e.time<lo||e.time>hi;return {x:toH(e.time),y:ev.length-i,text:`  ${e.what}${off?` (${sopFmtTime(e.time)})`:""}`,colour:off?"#9ca3af":"#374151",anchor:toH(e.time)>((hi-ref)/3600000+(lo-ref)/3600000)/2?"end":"start"};});
    const svg=svgPlot({title:runName(c.run),height,x:[(lo-ref)/3600000-span/3600000*0.05,(hi-ref)/3600000+span/3600000*0.05],y:[0,ev.length+1],
      xlab:`Hours from run start (${sopFmtTime(ref)})`,ylab:"",series,texts,
      bands:Number.isFinite(T.start)&&Number.isFinite(T.end)?[{x0:0,x1:(T.end-ref)/3600000,colour:"#16a34a",opacity:0.1}]:[],
      legend:Object.entries(cols).map(([k,v])=>({label:{file:"file",run:"run",analysis:"analysis",edit:"change / save",calibration:"calibration"}[k],colour:v}))});
    return {svg,rows:ev.map(e=>({event:e.what,time:sopFmtTime(e.time),hours_from_run_start:+((e.time-ref)/3600000).toFixed(3),kind:e.kind,read_from:e.source}))};
  }},
 {id:"curves",group:"Fluorescence",title:"Amplification curves coloured by SOP outcome",scope:"run",opts:["target","signal"],
  note:"Stored curves of the selected target. Colour = outcome under the active SOP; dashed vertical lines = SOP Cq cut-off and late-signal limit; horizontal line = stored threshold (QuantStudio ΔRn).",
  render(c){
    const ws=gRunWells(c.run,c.target).filter(w=>c.signal==="drn"?(w.eds&&w.eds.drn&&w.eds.drn.length):(w.curve&&w.curve.length));
    if(!ws.length)return {svg:svgMessage("No curves for this selection."),rows:[]};
    const seen=new Set(),rows=[],used=new Map();
    const series=ws.filter(w=>{const k=`${w.pos}|${w.channel}|${w.target}`;if(seen.has(k))return false;seen.add(k);return true;}).map(w=>{
      const r=sopOutcomeFor(c.run,w),o=r?r.outcome:"Not interpreted",col=sopColour(o);used.set(sopLabel(o),col);
      const cur=c.signal==="drn"?w.eds.drn:w.curve;
      cur.forEach((v,i)=>rows.push({well:w.well,sample:w.sample,target:w.target,outcome:o,cycle:i+1,fluorescence:v}));
      return {type:"line",colour:col,data:cur.map((v,i)=>[i+1,c.log?Math.max(v,1e-6):v]),tip:graphHoverLabel(c.run,w,`${w.target} · Cq ${num(sopCq(w),2)} · ${sopLabel(o)}`),
        width:o==="Negative"||o==="Not interpreted"?1:1.6};});
    series.sort((a,b)=>(a.width-b.width));
    const all=series.flatMap(s=>s.data.map(p=>p[1])),n=Math.max(...series.map(s=>s.data.length));
    const thr=c.signal==="drn"?uniq(ws.map(w=>w.eds&&w.eds.threshold).filter(Number.isFinite)):[];
    return {svg:svgPlot({title:`${runName(c.run)} — ${c.target||"all targets"}`,x:[1,n],y:c.log?[Math.max(1e-4,Math.min(...all.filter(v=>v>0))),Math.max(...all)*1.2]:extent(all),ylog:c.log,
      xlab:"Cycle",ylab:c.signal==="drn"?"ΔRn (stored)":"Fluorescence (stored)",series,vlines:gCutLines(c.target,"x"),
      hlines:thr.map(t=>({y:t,label:"stored threshold",colour:"#2563eb"})),legend:legendFromMap(used)}),rows};
  }},
 {id:"plate",group:"Plate",title:"Plate heat map",scope:"run",opts:["target","metric"],
  note:"Every physical position. Choose what the colour shows: SOP outcome, stored Cq, end fluorescence, background, amplitude, or analysis status (which also shows wells with signal that are in no analysis, and omitted wells).",
  render(c){
    const run=c.run,R=run.rows||8,C=run.cols||12,cell=Math.max(26,Math.min(64,Math.floor(760/C))),W=60+C*cell+190,H=46+R*cell+20;
    const tch=c.target?new Set(ssWells(run).filter(w=>(w.target||w.analysis)===c.target).map(w=>w.channel)):null;
    const orph=orphanCurveCandidates(run).filter(o=>ssPositionIncluded(run,o.pos)&&!tch||tch.has(o.channel));
    const orphPos=new Set(orph.map(o=>o.pos));
    const rows=[],vals=[];
    for(let pos=0;pos<R*C;pos++){
      if(!ssPositionIncluded(run,pos)){rows.push({well:posToWell(pos,C),sample:((run.plate||{})[pos]||{}).name||"",status:"Excluded from analysis",selection:"excluded"});continue;}
      const rec=(run.plate||{})[pos]||{},ws=ssWells(run).filter(w=>w.pos===pos&&(!c.target||(w.target||w.analysis)===c.target));
      const w=ws[0],sig=wellSignal(w?w.curve:(orph.find(o=>o.pos===pos)||{}).curve);
      const res=w?sopOutcomeFor(run,w):null;
      const other=!ws.length&&c.target&&ssWells(run).some(x=>x.pos===pos);
      const status=ws.length?(ws.every(sopOmitted)?"Omitted":"In analysis"):orphPos.has(pos)?"Signal, not analysed":other?"Other target only":rec.name?"Named, no result":"Empty";
      const row={well:posToWell(pos,C),sample:rec.name||(w&&w.sample)||"",target:uniq(ws.map(x=>x.target)).join(" | "),
        cq:w&&Number.isFinite(sopCq(w))?+sopCq(w).toFixed(3):"",outcome:res?res.outcome:"",status,
        end_fluorescence:Number.isFinite(sig.end)?+sig.end.toPrecision(6):"",background:Number.isFinite(sig.background)?+sig.background.toPrecision(6):"",
        amplitude:Number.isFinite(sig.amplitude)?+sig.amplitude.toPrecision(6):"",flags:ws.map(x=>x.warnCodes).filter(Boolean).join(" ")};
      rows.push(row);
      const m=c.metric;if(m==="cq"||m==="end_fluorescence"||m==="background"||m==="amplitude")vals.push(Number(row[m]===""?NaN:row[m]));
    }
    const [lo,hi]=extent(vals,0);
    const statusCol={"Other target only":"#f1f5f9","In analysis":"#bfdbfe","Omitted":"#fecaca","Signal, not analysed":"#f59e0b","Named, no result":"#e5e7eb","Empty":"#ffffff"};
    const used=new Map();
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,Arial" font-size="10"><rect width="${W}" height="${H}" fill="#fff"/>
      <text x="10" y="16" font-size="13" font-weight="600">${svgEsc(runName(run))} — ${svgEsc(GRAPH_METRICS[c.metric]||c.metric)}${c.target?" · "+svgEsc(c.target):""}</text>`;
    for(let j=0;j<C;j++)s+=`<text x="${40+j*cell+cell/2}" y="38" text-anchor="middle" fill="#6b7280">${j+1}</text>`;
    rows.forEach((r,pos)=>{
      const i=Math.floor(pos/C),j=pos%C,x=40+j*cell,y=44+i*cell;
      if(j===0)s+=`<text x="28" y="${y+cell/2+3}" text-anchor="middle" fill="#6b7280">${String.fromCharCode(65+i)}</text>`;
      let fill="#fff",lab="";
      if(c.metric==="outcome"){fill=r.outcome?sopColour(r.outcome):statusCol[r.status]||"#fff";if(r.outcome)used.set(sopLabel(r.outcome),fill);else if(r.status!=="Empty")used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else if(c.metric==="status"){fill=statusCol[r.status];used.set(r.status,fill);lab=r.cq===""?"":num(r.cq,1);}
      else{const v=Number(r[c.metric]);fill=r[c.metric]===""?"#f8fafc":heatColour(v,lo,hi);lab=r[c.metric]===""?"":fmtTick(+v.toPrecision(3));}
      const dark=/^#(1|0|9f|e11|dc|7c|64)/.test(fill);
      s+=`<rect x="${x+1}" y="${y+1}" width="${cell-2}" height="${cell-2}" rx="4" fill="${fill}" stroke="${r.status==="Signal, not analysed"?"#b45309":"#cbd5e1"}" stroke-width="${r.status==="Signal, not analysed"?2:1}"><title>${svgEsc(graphHoverLabel(run,r,`${r.target}\nCq ${r.cq}\n${r.outcome||r.status}`))}</title></rect>`;
      if(cell>=34)s+=`<text x="${x+cell/2}" y="${y+cell/2+3}" text-anchor="middle" fill="${dark?"#fff":"#111827"}">${svgEsc(lab)}</text>`;
    });
    let ly=46;const lx=40+C*cell+16;
    if(c.metric==="outcome"||c.metric==="status")used.forEach((col,l)=>{s+=`<rect x="${lx}" y="${ly}" width="12" height="12" rx="2" fill="${col}" stroke="#cbd5e1"/><text x="${lx+18}" y="${ly+10}" fill="#374151" font-size="11">${svgEsc(l)}</text>`;ly+=18;});
    else{for(let k=0;k<=5;k++){const v=lo+(hi-lo)*k/5;s+=`<rect x="${lx}" y="${ly}" width="12" height="12" fill="${heatColour(v,lo,hi)}" stroke="#cbd5e1"/><text x="${lx+18}" y="${ly+10}" font-size="11">${fmtTick(+v.toPrecision(3))}</text>`;ly+=18;}}
    return {svg:s+"</svg>",rows};
  }},
 {id:"unanalysed",group:"Plate",title:"Signal in wells that are not in any analysis",scope:"run",
  note:"Rising fluorescence in positions that carry no result (unnamed wells, wells left out of every analysis, or wells without a target). These are the places where a sample may have been run but not reported.",
  render(c){
    const orph=orphanCurveCandidates(c.run).filter(w=>ssPositionIncluded(c.run,w.pos));
    if(!orph.length)return {svg:svgMessage("No rising curve outside the analyses in this run."),rows:[]};
    const cm=new Map(),rows=[];
    const series=orph.map(o=>{const col=catColour(cm,`${o.well}${o.filterComb?" · "+o.filterComb:""}`);
      o.curve.forEach((v,i)=>rows.push({well:o.well,sample:o.sample,channel:o.filterComb||o.filterName||o.channel,cycle:i+1,fluorescence:v,finding:o.finding}));
      return {type:"line",colour:col,data:o.curve.map((v,i)=>[i+1,v]),tip:graphHoverLabel(c.run,o,o.finding)};});
    const all=series.flatMap(s=>s.data.map(p=>p[1]));
    return {svg:svgPlot({title:`${runName(c.run)} — ${orph.length} curve(s) outside the analyses`,x:[1,Math.max(...series.map(s=>s.data.length))],y:extent(all),
      xlab:"Cycle",ylab:"Fluorescence (stored)",series,legend:legendFromMap(cm)}),rows};
  }},
 {id:"cqstrip",group:"Results",title:"Cq by target with SOP cut-offs",scope:"run",opts:["colourby"],
  note:"One point per well. Colour by SOP outcome or by role. Red dashed line: Cq cut-off; orange: late-signal limit (per target).",
  render(c){
    const ts=gTargets(c.run);if(!ts.length)return {svg:svgMessage("No results."),rows:[]};
    const cm=new Map(),rows=[],series=[],hl=[];
    ts.forEach((t,ti)=>{
      gRunWells(c.run,t).forEach((w,k)=>{const q=sopCq(w);if(!Number.isFinite(q))return;
        const r=sopOutcomeFor(c.run,w),key=c.colourby==="role"?(w.role||"Unknown"):sopLabel(r?r.outcome:"Not interpreted");
        const col=c.colourby==="role"?catColour(cm,key):(cm.set(key,sopColour(r?r.outcome:"Not interpreted")),sopColour(r?r.outcome:"Not interpreted"));
        const jit=((k*37)%21-10)/40;
        series.push({type:"points",data:[[ti+jit,q,graphHoverLabel(c.run,w,`${t} · Cq ${num(q,2)} · ${key}`),col]]});
        rows.push({target:t,well:w.well,sample:w.sample,role:w.role,cq:q,outcome:r?r.outcome:""});});
      gCutLines(t,"y").forEach(l=>series.push({type:"line",colour:l.colour,dash:"5 4",width:1.2,data:[[ti-0.4,l.y],[ti+0.4,l.y]],tip:l.label}));
    });
    const qs=rows.map(r=>r.cq).concat(ts.flatMap(t=>gCutLines(t,"y").map(l=>l.y)));
    return {svg:svgPlot({title:runName(c.run),x:[-0.6,ts.length-0.4],y:extent(qs),xticks:ts.map((t,i)=>({v:i,label:t.slice(0,18)})),
      xlab:"Target",ylab:"Stored Cq",series,legend:legendFromMap(cm)}),rows};
  }},
 {id:"repsd",group:"Results",title:"Replicate spread — mean Cq against SD",scope:"run",
  note:"One point per sample and target with two or more detected replicates. The dashed line is the SOP maximum SD.",
  render(c){
    const ev=sopEvaluateAll()[c.ri];const pts=ev.rows.filter(r=>r.det>=2&&Number.isFinite(r.cqSd));
    if(!pts.length)return {svg:svgMessage("No replicate groups with two or more detected wells."),rows:[]};
    const cm=new Map();const series=[{type:"points",data:pts.map(r=>[r.cqMean,r.cqSd,graphHoverLabel(c.run,{well:r.wells&&r.wells[0]&&r.wells[0].well,sample:r.sample},`${r.target} · SD ${num(r.cqSd,3)} · ${r.label}`),(cm.set(r.label,r.colour),r.colour)])}];
    return {svg:svgPlot({title:runName(c.run),x:extent(pts.map(r=>r.cqMean)),y:[0,Math.max(sopNum(SOP.replicates.maxSd)*1.3||0,...pts.map(r=>r.cqSd))*1.1],
      xlab:"Mean Cq",ylab:"SD of Cq",series,legend:legendFromMap(cm),
      hlines:SOP.graphs.showSdLimit?[{y:sopNum(SOP.replicates.maxSd),label:`SOP max SD ${SOP.replicates.maxSd}`,colour:"#b91c1c"}]:[]}),
      rows:pts.map(r=>({sample:r.sample,target:r.target,n:r.n,detected:r.det,cq_mean:r.cqMean,cq_sd:r.cqSd,outcome:r.outcome}))};
  }},
 {id:"stdcurve",group:"Results",title:"Standard curve with residuals and SOP limits",scope:"run",opts:["target"],
  note:"Cq against log10 of the stored standard quantity, fitted by least squares on this page. The label shows slope, R², efficiency and range against the SOP limits; residuals are in the table.",
  render(c){
    const scs=sopStdCurves(c.run).filter(s=>!c.target||s.target===c.target);
    if(!scs.length)return {svg:svgMessage("No standards with a stored quantity in this run / target."),rows:[]};
    const cm=new Map(),series=[],texts=[];let ty=46;
    scs.forEach(sc=>{const col=catColour(cm,sc.target);
      series.push({type:"points",colour:col,data:sc.points.map(p=>[p.x,p.y,graphHoverLabel(c.run,{well:p.well,sample:p.sample},`${sc.target} · ${p.conc} · Cq ${num(p.y,2)} · residual ${num(p.residual,3)}`)])});
      const xs=sc.points.map(p=>p.x),a=Math.min(...xs),b=Math.max(...xs);
      series.push({type:"line",colour:col,data:[[a,sc.intercept+sc.slope*a],[b,sc.intercept+sc.slope*b]]});
      const R=SOP.run,ok=sc.r2>=R.minR2&&sc.efficiency>=R.effMin&&sc.efficiency<=R.effMax&&sc.logs>=R.minLogs&&sc.monotonic;
      texts.push({px:80,py:ty,colour:ok?"#15803d":"#b91c1c",text:`${sc.target}: slope ${num(sc.slope,3)} · R² ${num(sc.r2,4)} (≥${R.minR2}) · E ${sc.efficiency>1000||sc.efficiency<-100?"out of range":num(sc.efficiency,1)+" %"} (${R.effMin}–${R.effMax}) · ${num(sc.logs,1)} logs (≥${R.minLogs})${sc.monotonic?"":" · out of order"} — ${ok?"within SOP":"outside SOP"}`});ty+=15;
    });
    const all=scs.flatMap(s=>s.points);
    return {svg:svgPlot({title:runName(c.run),x:extent(all.map(p=>p.x)),y:extent(all.map(p=>p.y),0.25),xlab:"log10 quantity (stored)",ylab:"Stored Cq",series,texts,legend:legendFromMap(cm)}),
      rows:scs.flatMap(s=>s.points.map(p=>({target:s.target,well:p.well,sample:p.sample,quantity:p.conc,log10_quantity:p.x,cq:p.y,fitted:s.intercept+s.slope*p.x,residual:p.residual,slope:s.slope,intercept:s.intercept,r2:s.r2,efficiency_percent:s.efficiency})))};
  }},
 {id:"ic",group:"Results",title:"Internal control / reference Cq per sample (inhibition)",scope:"run",
  note:"Cq of the targets the SOP marks as internal control or reference. The band is the run median ± the SOP maximum IC shift; points above it suggest inhibition or low input.",
  render(c){
    const ev=sopEvaluateAll()[c.ri];const rs=ev.rows.filter(r=>(r.spec.kind==="ic"||r.spec.kind==="reference")&&!r.ctrl&&r.role!=="Standard");
    if(!rs.length)return {svg:svgMessage("No target is marked as internal control or reference in the SOP (section 2)."),rows:[]};
    const cm=new Map(),samples=uniq(rs.map(r=>r.sample)),targets=uniq(rs.map(r=>r.target));
    const series=targets.map(t=>({type:"points",colour:catColour(cm,t),r:4.5,data:rs.filter(r=>r.target===t).map(r=>[samples.indexOf(r.sample),Number.isFinite(r.cqMean)?r.cqMean:NaN,graphHoverLabel(c.run,{well:r.wells&&r.wells[0]&&r.wells[0].well,sample:r.sample},`${t} · ${num(r.cqMean,2)} · ${r.label}`)])}));
    const med=byKey(rs,r=>r.target),bands=[],hl=[];
    med.forEach((list,t)=>{const v=list.map(r=>r.cqMean).filter(Number.isFinite).sort((a,b)=>a-b);if(!v.length)return;const m=v[Math.floor(v.length/2)];
      hl.push({y:m,label:`${t} median ${num(m,2)}`,colour:cm.get(t)});
      if(Number.isFinite(sopNum(SOP.ic.maxShift)))hl.push({y:m+sopNum(SOP.ic.maxShift),label:`${t} +${SOP.ic.maxShift}`,colour:"#b91c1c"});});
    const miss=rs.filter(r=>!Number.isFinite(r.cqMean));
    return {svg:svgPlot({title:runName(c.run)+(miss.length?` — ${miss.length} not detected`:""),x:[-0.7,samples.length-0.3],y:extent(rs.map(r=>r.cqMean).concat(hl.map(h=>h.y)),0.1),
      xticks:samples.length<=40?samples.map((s,i)=>({v:i,label:s.slice(0,14),rotate:-40,anchor:"end"})):[],bottom:samples.length<=40?110:50,
      xlab:samples.length<=40?"":"Samples",ylab:"Mean Cq",series,hlines:hl,legend:legendFromMap(cm)}),
      rows:rs.map(r=>({sample:r.sample,target:r.target,cq_mean:r.cqMean,detected:r.det,n:r.n,run_median:ev.icMedian,outcome:r.outcome}))};
  }},
 {id:"endpoint",group:"Fluorescence",title:"Fluorescence level against Cq",scope:"run",opts:["target","level"],
  note:"End-point fluorescence (or amplitude above background) against the stored Cq. Late, low-plateau curves separate from true amplification; undetected wells are drawn at the right edge.",
  render(c){
    const ws=gRunWells(c.run,c.target).filter(w=>w.curve&&w.curve.length);
    if(!ws.length)return {svg:svgMessage("No curves for this selection."),rows:[]};
    const n=Math.max(...ws.map(w=>w.curve.length)),cm=new Map(),rows=[];
    const pts=ws.map(w=>{const s=wellSignal(w.curve),r=sopOutcomeFor(c.run,w),o=r?r.outcome:"Not interpreted",q=sopCq(w);cm.set(sopLabel(o),sopColour(o));
      const y=c.level==="amplitude"?s.amplitude:s.end;rows.push({well:w.well,sample:w.sample,target:w.target,cq:Number.isFinite(q)?q:"",end_fluorescence:s.end,background:s.background,amplitude:s.amplitude,outcome:o});
      return [Number.isFinite(q)?q:n+1,y,graphHoverLabel(c.run,w,`Cq ${num(q,2)} · ${num(y,1)} · ${sopLabel(o)}`),sopColour(o)];});
    return {svg:svgPlot({title:`${runName(c.run)} — ${c.target||"all targets"}`,x:[Math.min(...pts.map(p=>p[0]))-1,n+2],y:extent(pts.map(p=>p[1])),
      xlab:`Stored Cq (undetected at ${n+1})`,ylab:c.level==="amplitude"?"Amplitude above background":"End-point fluorescence",
      series:[{type:"points",data:pts}],vlines:gCutLines(c.target,"x"),legend:legendFromMap(cm)}),rows};
  }},
 {id:"levels",group:"Fluorescence",title:"Background and plateau fluorescence per channel",scope:"run",
  note:"For each detection channel / target: background (mean of cycles 3–10) and end-point fluorescence of every well, including wells outside the analyses. A shifted background points to plate, seal or optical problems.",
  render(c){
    const items=[...ssWells(c.run).filter(w=>w.curve&&w.curve.length).map(w=>({w,key:w.filterComb||w.target||String(w.channel),outside:false})),
      ...orphanCurveCandidates(c.run).filter(w=>ssPositionIncluded(c.run,w.pos)).map(o=>({w:o,key:o.filterComb||o.filterName||String(o.channel),outside:true}))];
    const seen=new Set(),uniqItems=items.filter(i=>{const k=`${i.key}|${i.w.pos}`;if(seen.has(k))return false;seen.add(k);return true;});
    if(!uniqItems.length)return {svg:svgMessage("No curves."),rows:[]};
    const keys=uniq(uniqItems.map(i=>i.key)),rows=[];
    const bg=[],end=[];
    uniqItems.forEach((i,k)=>{const s=wellSignal(i.w.curve),x=keys.indexOf(i.key),j=((k*29)%19-9)/60;
      bg.push([x-0.18+j,s.background,graphHoverLabel(c.run,i.w,`background ${num(s.background,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#f59e0b":"#60a5fa"]);
      end.push([x+0.18+j,s.end,graphHoverLabel(c.run,i.w,`end ${num(s.end,1)}${i.outside?" (outside analyses)":""}`),i.outside?"#b45309":"#1d4ed8"]);
      rows.push({channel:i.key,well:i.w.well,sample:i.w.sample||"",outside_analyses:i.outside?"yes":"",background:s.background,end_fluorescence:s.end,amplitude:s.amplitude});});
    const all=bg.concat(end).map(p=>p[1]).filter(v=>v>0);
    return {svg:svgPlot({title:runName(c.run),x:[-0.6,keys.length-0.4],y:[Math.max(1e-3,Math.min(...all)*0.8),Math.max(...all)*1.3],ylog:true,
      xticks:keys.map((k,i)=>({v:i,label:k})),xlab:"Channel / target",ylab:"Fluorescence (log scale)",
      series:[{type:"points",data:bg,r:3},{type:"points",data:end,r:3}],
      legend:[{label:"background",colour:"#60a5fa"},{label:"end point",colour:"#1d4ed8"},{label:"outside analyses",colour:"#f59e0b"}]}),rows};
  }},
 {id:"outcomes",group:"Results",title:"SOP outcomes per target",scope:"run",
  note:"Number of sample/target results per outcome under the active SOP, controls included.",
  render(c){
    const ev=sopEvaluateAll()[c.ri];const ts=uniq(ev.rows.map(r=>r.target));
    if(!ts.length)return {svg:svgMessage("No results."),rows:[]};
    const outs=SOP_OUTCOMES.filter(o=>ev.rows.some(r=>r.outcome===o)),series=[],rows=[];
    const base=ts.map(()=>0);
    outs.forEach(o=>{const data=ts.map((t,i)=>{const n=ev.rows.filter(r=>r.target===t&&r.outcome===o).length;const p=[i,base[i]+n,base[i],`${t}: ${n} ${sopLabel(o)}`,sopColour(o)];base[i]+=n;if(n)rows.push({target:t,outcome:o,count:n});return p;}).filter(p=>p[1]>p[2]);
      series.push({type:"bar",colour:sopColour(o),barWidth:Math.min(60,600/ts.length),data});});
    return {svg:svgPlot({title:`${runName(c.run)} — run ${ev.status}`,x:[-0.6,ts.length-0.4],y:[0,Math.max(...base)*1.1||1],xticks:ts.map((t,i)=>({v:i,label:t.slice(0,16)})),
      xlab:"Target",ylab:"Results",series,legend:outs.map(o=>({label:sopLabel(o),colour:sopColour(o)}))}),rows};
  }},
 {id:"temperature",group:"Run history",title:"Block, cover and zone temperature (QuantStudio log)",scope:"run",
  note:"From the instrument log inside the .eds file: sample block mean, heated cover and the spread between block zones, against minutes from the first record. The dashed line is the SOP maximum zone spread.",
  render(c){
    const L=c.run.eds&&c.run.eds.log;if(!L||!L.temps.length)return {svg:svgMessage("This graph uses the QuantStudio instrument log. For a LightCycler run choose “Block temperature trace (LightCycler temperature log)”."),rows:[]};
    const t0=L.temps[0][0],step=Math.max(1,Math.floor(L.temps.length/1500)),pts=L.temps.filter((_,i)=>i%step===0);
    const m=t=>(t[0]-t0)/60000;
    const series=[{type:"line",colour:"#2563eb",data:pts.map(t=>[m(t),t[1]]),tip:"sample block"},{type:"line",colour:"#d97706",data:pts.map(t=>[m(t),t[2]]),tip:"cover"},
      {type:"line",colour:"#7c3aed",data:pts.map(t=>[m(t),t[4]*10]),tip:"zone spread ×10"}];
    return {svg:svgPlot({title:runName(c.run),x:[0,m(L.temps[L.temps.length-1])],y:[0,110],xlab:"Minutes from the first log record",ylab:"°C",series,
      hlines:[{y:sopNum(SOP.run.maxZoneSpread)*10,label:`SOP zone spread ${SOP.run.maxZoneSpread} °C (×10)`,colour:"#7c3aed"}],
      legend:[{label:"sample block",colour:"#2563eb"},{label:"heated cover",colour:"#d97706"},{label:"zone spread ×10",colour:"#7c3aed"}]}),
      rows:L.temps.map(t=>({time:sopFmtTime(t[0]),minutes:+m(t).toFixed(3),block_C:t[1],cover_C:t[2],heatsink_C:t[3],zone_spread_C:t[4]}))};
  }},
 {id:"recalc",group:"Run history",title:"Stored Ct against the Ct re-derived on this page",scope:"run",
  note:"QuantStudio only: difference between the stored Ct and the crossing of the stored ΔRn with the stored threshold. Differences beyond ±0.2 require an algorithm/settings/provenance review; they do not prove that stored data were edited.",
  render(c){
    const ws=ssWells(c.run).filter(w=>w.eds&&Number.isFinite(w.eds.ctRecalc)&&Number.isFinite(sopCq(w)));
    if(!ws.length)return {svg:svgMessage("No re-derived Ct (QuantStudio files only)."),rows:[]};
    const cm=new Map();
    const series=[{type:"points",data:ws.map(w=>[sopCq(w),sopCq(w)-w.eds.ctRecalc,graphHoverLabel(c.run,w,`${w.target} · stored ${num(sopCq(w),3)} · re-derived ${num(w.eds.ctRecalc,3)}`),catColour(cm,w.target)])}];
    return {svg:svgPlot({title:runName(c.run),x:extent(ws.map(sopCq)),y:extent(ws.map(w=>sopCq(w)-w.eds.ctRecalc).concat([-0.3,0.3])),xlab:"Stored Ct",ylab:"Stored − re-derived Ct",series,
      hlines:[{y:0.2,label:"+0.2",colour:"#b91c1c"},{y:-0.2,label:"−0.2",colour:"#b91c1c"},{y:0,label:"",colour:"#9ca3af",dash:"2 3"}],legend:legendFromMap(cm)}),
      rows:ws.map(w=>({well:w.well,sample:w.sample,target:w.target,stored_ct:sopCq(w),rederived_ct:w.eds.ctRecalc,difference:sopCq(w)-w.eds.ctRecalc,threshold:w.eds.threshold}))};
  }},
 /* ----- across all loaded runs ----- */
 {id:"x_timeline",group:"Across runs",title:"Runs on a calendar — run time and last change",scope:"all",
  note:"Each run as a green dot at its start, with the experiment creation (blue, above) and the last recorded change (red, below, joined by a dashed line). Long gaps between run and last change are the first thing an auditor asks about.",
  render(){
    const rs=RUNS.map((r,i)=>({r,i,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.start)).sort((a,b)=>a.T.start-b.T.start);
    if(!rs.length)return {svg:svgMessage("No run carries a start time."),rows:[]};
    const ts=rs.flatMap(x=>[x.T.start,x.T.end,x.T.created,x.T.lastEdit]).filter(Number.isFinite);
    const lo=Math.min(...ts),hi=Math.max(...ts),D=t=>(t-lo)/864e5;
    const series=[],rows=[];
    rs.forEach((x,k)=>{const y=rs.length-k;
      if(Number.isFinite(x.T.lastEdit))series.push({type:"line",colour:"#fca5a5",dash:"3 3",data:[[D(Number.isFinite(x.T.end)?x.T.end:x.T.start),y],[D(x.T.lastEdit),y]]});
      series.push({type:"points",colour:"#16a34a",r:7,data:[[D(x.T.start),y,`${runName(x.r)} run ${sopFmtTime(x.T.start)} – ${sopFmtTime(x.T.end)}`]]});
      if(Number.isFinite(x.T.created))series.push({type:"points",colour:"#2563eb",r:3.5,data:[[D(x.T.created),y+0.18,`created ${sopFmtTime(x.T.created)}`]]});
      if(Number.isFinite(x.T.lastEdit))series.push({type:"points",colour:"#dc2626",r:3.5,data:[[D(x.T.lastEdit),y-0.18,`last change ${sopFmtTime(x.T.lastEdit)} (+${num(x.T.editDelayH,1)} h)`]]});
      rows.push({experiment:runName(x.r),created:sopFmtTime(x.T.created),run_start:sopFmtTime(x.T.start),run_end:sopFmtTime(x.T.end),last_change:sopFmtTime(x.T.lastEdit),hours_to_last_change:x.T.editDelayH,run_minutes:x.T.durationMin});});
    const span=D(hi)||1,ticks=niceTicks(0,span,5).map(v=>({v,label:sopFmtTime(lo+v*864e5).slice(0,10)}));
    return {svg:svgPlot({title:`${rs.length} run(s)`,height:Math.max(260,rs.length*18+100),left:Math.min(300,24+Math.min(40,Math.max(...rs.map(x=>runName(x.r).length)))*6.6),
      x:[-span*0.03,span*1.03],y:[0,rs.length+1],yticks:false,xticks:ticks,xlab:"Date",series,
      texts:rs.map((x,k)=>({x:-span*0.03,y:rs.length-k,text:runName(x.r).slice(0,40)+"  ",anchor:"end",size:10})),
      legend:[{label:"run",colour:"#16a34a"},{label:"created",colour:"#2563eb"},{label:"last change",colour:"#dc2626"}]}),rows};
  }},
 {id:"x_delay",group:"Across runs",title:"Hours from run end to the last recorded change",scope:"all",
  note:"Processing time per run. The dashed line is the SOP maximum; bars above it are flagged in the run acceptance.",
  render(){
    const rs=gByDate(RUNS.map(r=>({r,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.editDelayH)),x=>x.r),tk=gRunTicks(rs.map(x=>x.r));
    if(!rs.length)return {svg:svgMessage("No run has both a run end and a later dated change."),rows:[]};
    const lim=sopNum(SOP.run.editDelayHours),vals=rs.map(x=>x.T.editDelayH);
    const series=[{type:"bar",barWidth:Math.max(3,Math.min(40,700/rs.length)),data:rs.map((x,i)=>[i,Math.max(0.01,x.T.editDelayH),0.01,`${runName(x.r)}: ${num(x.T.editDelayH,1)} h`,x.T.editDelayH>lim?"#dc2626":"#60a5fa"])}];
    return {svg:svgPlot({title:"Processing delay",x:[-0.6,rs.length-0.4],y:[0.01,Math.max(...vals,lim||1)*2],ylog:true,
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Hours (log scale)",series,hlines:[{y:lim,label:`SOP ${lim} h`,colour:"#b91c1c"}]}),
      rows:rs.map(x=>({experiment:runName(x.r),run_end:sopFmtTime(x.T.end),last_change:sopFmtTime(x.T.lastEdit),hours:x.T.editDelayH}))};
  }},
 {id:"x_accept",group:"Across runs",title:"Run acceptance grid",scope:"all",
  note:"Runs (rows) against the SOP criteria (columns): green met, amber review, red rejected, grey not applicable.",
  render(){
    const all=gByDate(sopEvaluateAll(),e=>e.run);if(!all.length)return {svg:svgMessage("No runs."),rows:[]};
    const crit=uniq(all.flatMap(e=>e.criteria.map(c=>c.criterion.replace(/ — .*/,""))));
    const cw=Math.max(28,Math.min(90,600/crit.length)),rh=18,left=300,top=150,W=left+crit.length*cw+160,H=top+all.length*rh+20;
    const col={pass:"#86efac",review:"#fcd34d",fail:"#f87171","n/a":"#e5e7eb"};
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui,Arial" font-size="10.5"><rect width="${W}" height="${H}" fill="#fff"/><text x="10" y="18" font-size="13" font-weight="600">${svgEsc(SOP.name)} v${svgEsc(SOP.version)}</text>`;
    crit.forEach((c,j)=>{const x=left+j*cw+cw/2;s+=`<text transform="translate(${x+3} ${top-6}) rotate(-50)" fill="#374151">${svgEsc(c)}</text>`;});
    const rows=[];
    all.forEach((e,i)=>{const y=top+i*rh;s+=`<text x="${left-8}" y="${y+13}" text-anchor="end" fill="${e.status==="Rejected"?"#b91c1c":"#111827"}">${svgEsc(runName(e.run).slice(0,40))}</text>`;
      crit.forEach((c,j)=>{const mine=e.criteria.filter(x=>x.criterion.replace(/ — .*/,"")===c);
        const st=mine.some(x=>x.status==="fail")?"fail":mine.some(x=>x.status==="review")?"review":mine.some(x=>x.status==="pass")?"pass":"n/a";
        s+=`<rect x="${left+j*cw+1}" y="${y+1}" width="${cw-2}" height="${rh-2}" rx="3" fill="${col[st]}"><title>${svgEsc(runName(e.run)+"\n"+c+": "+st+"\n"+mine.map(x=>x.evidence).join("\n"))}</title></rect>`;
        rows.push({experiment:runName(e.run),criterion:c,status:st,evidence:mine.map(x=>x.evidence).join(" | ")});});});
    return {svg:s+"</svg>",rows};
  }},
 {id:"x_outcomes",group:"Across runs",title:"SOP outcomes per run",scope:"all",
  note:"Stacked counts of sample/target outcomes for every loaded run.",
  render(){
    const all=gByDate(sopEvaluateAll(),e=>e.run),tk=gRunTicks(all.map(e=>e.run));if(!all.length)return {svg:svgMessage("No runs."),rows:[]};
    const outs=SOP_OUTCOMES.filter(o=>all.some(e=>e.rows.some(r=>r.outcome===o))),base=all.map(()=>0),series=[],rows=[];
    outs.forEach(o=>{series.push({type:"bar",colour:sopColour(o),barWidth:Math.max(3,Math.min(40,700/all.length)),data:all.map((e,i)=>{const n=e.rows.filter(r=>r.outcome===o).length;const p=[i,base[i]+n,base[i],`${runName(e.run)}: ${n} ${sopLabel(o)}`,sopColour(o)];base[i]+=n;if(n)rows.push({experiment:runName(e.run),outcome:o,count:n});return p;}).filter(p=>p[1]>p[2])});});
    return {svg:svgPlot({title:"Outcomes per run",x:[-0.6,all.length-0.4],y:[0,Math.max(...base,1)*1.08],
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Results",series,legend:outs.map(o=>({label:sopLabel(o),colour:sopColour(o)}))}),rows};
  }},
 {id:"x_control",group:"Across runs",title:"Control Cq across runs with SOP range",scope:"all",opts:["control","target"],
  note:"Descriptive control overview. Solid band: configured SOP range. No pooled statistical limits; use extraction-batch charts for comparable groups.",
  render(c){
    const ctrl=SOP.controls[Number(c.control)];if(!ctrl)return {svg:svgMessage("Define a control in the SOP (section 3)."),rows:[]};
    const all=gByDate(sopEvaluateAll(),e=>e.run),pts=[],tk=gRunTicks(all.map(e=>e.run));
    all.forEach((e,i)=>e.rows.filter(r=>r.ctrl===ctrl&&(!c.target||r.target===c.target)).forEach(r=>pts.push({i,e,r})));
    if(!pts.length)return {svg:svgMessage("The chosen control was not found in the loaded runs."),rows:[]};
    if(!pts.some(p=>Number.isFinite(p.r.cqMean)))return {svg:svgMessage(`${ctrl.name}${c.target?" · "+c.target:""}: no Cq in any of the ${pts.length} control result(s) in ${uniq(pts.map(p=>p.i)).length} run(s)${ctrl.expect==="negative"?" — as expected for a negative control":""}. Choose a positive control to see a Levey-Jennings chart.`),
      rows:pts.map(p=>({experiment:runName(p.e.run),sample:p.r.sample,target:p.r.target,cq_mean:p.r.cqMean,detected:p.r.det,n:p.r.n,outcome:p.r.outcome}))};
    const cm=new Map(),series=[],det=pts.filter(p=>Number.isFinite(p.r.cqMean));
    byKey(pts,p=>p.r.target).forEach((ps,t)=>series.push({type:"points",colour:catColour(cm,t),r:4.5,data:ps.map(p=>[p.i,Number.isFinite(p.r.cqMean)?p.r.cqMean:NaN,graphHoverLabel(p.e.run,{well:p.r.wells&&p.r.wells[0]&&p.r.wells[0].well,sample:p.r.sample},`${t} · ${num(p.r.cqMean,2)} · ${p.r.label}`)])}));
    byKey(det,p=>`${p.r.target}|${p.r.sample}|${ccInstrumentKey(p.e.run)}|${ccProtocolKey(p.e.run)}`).forEach((ps,t)=>series.push({type:"line",colour:cm.get(t),width:1,opacity:0.5,data:ps.map(p=>[p.i,p.r.cqMean])}));
    const v=det.map(p=>p.r.cqMean),m=mean(v),s=sd(v),hl=[];
    const lo=sopNum(ctrl.cqLo),hi=sopNum(ctrl.cqHi),bands=[];
    if(Number.isFinite(lo)||Number.isFinite(hi))bands.push({y0:Number.isFinite(lo)?lo:0,y1:Number.isFinite(hi)?hi:60,colour:"#16a34a",opacity:0.1});
    const ys=v.concat(hl.map(h=>h.y)).concat([lo,hi].filter(Number.isFinite));
    return {svg:svgPlot({title:`${ctrl.name}${c.target?" · "+c.target:""} — ${det.length}/${pts.length} detected`,x:[-0.6,all.length-0.4],y:extent(ys.length?ys:[0,40],0.1),
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Mean Cq",series,hlines:hl,bands,legend:legendFromMap(cm)}),
      rows:pts.map(p=>({experiment:runName(p.e.run),sample:p.r.sample,target:p.r.target,cq_mean:p.r.cqMean,detected:p.r.det,n:p.r.n,outcome:p.r.outcome}))};
  }},
 {id:"x_signal",group:"Across runs",title:"Background and plateau fluorescence across runs",scope:"all",
  note:"Median background and median end-point fluorescence of every channel per run: slow drift here is an instrument or reagent trend.",
  render(){
    const med=a=>{const v=a.filter(Number.isFinite).sort((x,y)=>x-y);return v.length?v[Math.floor(v.length/2)]:NaN;};
    const rows=[],cm=new Map(),byCh=new Map();
    const RR=gByDate(RUNS,r=>r),tk=gRunTicks(RR);
    RR.forEach((r,i)=>{const g=byKey(ssWells(r).filter(w=>w.curve&&w.curve.length),w=>w.filterComb||w.target||String(w.channel));
      g.forEach((ws,ch)=>{const seen=new Set(),sig=ws.filter(w=>!seen.has(w.pos)&&seen.add(w.pos)).map(w=>wellSignal(w.curve));
        const row={experiment:runName(r),channel:ch,median_background:med(sig.map(s=>s.background)),median_end:med(sig.map(s=>s.end)),wells:sig.length};rows.push(row);
        if(!byCh.has(ch))byCh.set(ch,[]);byCh.get(ch).push([i,row.median_background,row.median_end]);});});
    if(!rows.length)return {svg:svgMessage("No curves."),rows:[]};
    const series=[];byCh.forEach((pts,ch)=>{const col=catColour(cm,ch);
      series.push({type:"line",colour:col,dash:"4 3",data:pts.map(p=>[p[0],p[1]]),tip:ch+" background"});
      series.push({type:"line",colour:col,width:2,data:pts.map(p=>[p[0],p[2]]),tip:ch+" end point"});
      series.push({type:"points",colour:col,data:pts.map(p=>[p[0],p[2],`${ch} end ${num(p[2],0)}`])});});
    const all=rows.flatMap(r=>[r.median_background,r.median_end]).filter(v=>v>0);
    return {svg:svgPlot({title:"Solid: end point · dashed: background",x:[-0.6,RR.length-0.4],y:[Math.min(...all)*0.7,Math.max(...all)*1.4],ylog:true,
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Median fluorescence (log)",series,legend:legendFromMap(cm)}),rows};
  }},
 {id:"x_duration",group:"Across runs",title:"Run duration and instrument use",scope:"all",
  note:"Minutes from run start to run end, coloured by instrument. A run much shorter than its siblings with the same protocol deserves a look at the log.",
  render(){
    const rs=gByDate(RUNS.map(r=>({r,T:runTimes(r)})).filter(x=>Number.isFinite(x.T.durationMin)),x=>x.r),tk=gRunTicks(rs.map(x=>x.r));
    if(!rs.length)return {svg:svgMessage("No run has both start and end times."),rows:[]};
    const cm=new Map();
    const series=[{type:"bar",barWidth:Math.max(3,Math.min(40,700/rs.length)),data:rs.map((x,i)=>[i,x.T.durationMin,0,`${runName(x.r)}: ${num(x.T.durationMin,1)} min · ${x.r.meta.InstrumentID||x.r.meta.InstrumentName||""}`,catColour(cm,x.r.meta.InstrumentID||x.r.meta.InstrumentName||"instrument")])}];
    return {svg:svgPlot({title:"Run duration",x:[-0.6,rs.length-0.4],y:[0,Math.max(...rs.map(x=>x.T.durationMin))*1.1],
      xticks:tk.xticks,bottom:tk.bottom,xlab:tk.xlab,
      ylab:"Minutes",series,legend:legendFromMap(cm)}),
      rows:rs.map(x=>({experiment:runName(x.r),instrument:x.r.meta.InstrumentID||x.r.meta.InstrumentName||"",software:x.r.meta.SWVersion||"",run_start:sopFmtTime(x.T.start),minutes:x.T.durationMin}))};
  }},
 {id:"x_findings",group:"Across runs",title:"Forensic findings by area (Pareto)",scope:"all",
  note:"Count of error and review findings in the forensic log, grouped by area, largest first.",
  render(){
    const ev=reviewForensicEvents().filter(e=>e.severity==="error"||e.severity==="review");
    if(!ev.length)return {svg:svgMessage("No error or review findings."),rows:[]};
    const g=[...byKey(ev,e=>e.area)].map(([a,l])=>({area:a,errors:l.filter(e=>e.severity==="error").length,reviews:l.filter(e=>e.severity==="review").length})).sort((a,b)=>(b.errors+b.reviews)-(a.errors+a.reviews));
    const bw=Math.min(50,600/g.length);
    return {svg:svgPlot({title:"Findings",x:[-0.6,g.length-0.4],y:[0,Math.max(...g.map(x=>x.errors+x.reviews))*1.1],bottom:140,left:110,
      xticks:g.map((x,i)=>({v:i,label:x.area.slice(0,22),rotate:-40,anchor:"end"})),ylab:"Findings",
      series:[{type:"bar",colour:"#dc2626",barWidth:bw,data:g.map((x,i)=>[i,x.errors,0,`${x.area}: ${x.errors} error(s)`])},
        {type:"bar",colour:"#f59e0b",barWidth:bw,data:g.map((x,i)=>[i,x.errors+x.reviews,x.errors,`${x.area}: ${x.reviews} review item(s)`])}],
      legend:[{label:"error",colour:"#dc2626"},{label:"review",colour:"#f59e0b"}]}),rows:g};
  }}
];
const GRAPH_METRICS={outcome:"SOP outcome",status:"Analysis status (incl. signal outside analyses)",cq:"Stored Cq",end_fluorescence:"End-point fluorescence",background:"Background fluorescence",amplitude:"Amplitude above background"};
const GRAPH_STATE={last:null};
function graphContext(){
  const g=GRAPHS.find(x=>x.id===$("#g-graph").value)||GRAPHS[0];
  const ri=Number($("#g-run").value)||0;
  return {g,ri,run:RUNS[ri],target:$("#g-target").value,metric:$("#g-metric").value,signal:$("#g-signal").value,
    log:$("#g-log").checked,colourby:$("#g-colourby").value,level:$("#g-level").value,control:$("#g-control").value};
}
function graphAnalysisControl(w){
  const name=String(w&&w.sample||"");
  const role=String(w&&w.role||"");
  const byRole=/^(NTC|Blank|Negative control)$/i.test(role);
  const byName=/\b(NTC|no\s*template|blank|H2O|water)\b/i.test(name);
  return byRole||byName;
}
function graphAnalysisStats(curve){
  const v=(curve||[]).map(Number).filter(Number.isFinite);
  if(v.length<5)return null;
  const k=Math.max(3,Math.floor(v.length*.2));
  const baseValues=v.slice(0,k);
  const first=mean(baseValues),last=mean(v.slice(-k));
  const baselineSd=sd(baseValues);
  const diffs=v.slice(1).map((x,i)=>x-v[i]).filter(Number.isFinite);
  const maxSlope=diffs.length?Math.max(...diffs):NaN;
  const maxSlopeCycle=diffs.length?diffs.indexOf(maxSlope)+2:NaN;
  const curvature=diffs.slice(1).map((x,i)=>x-diffs[i]).filter(Number.isFinite);
  const maxCurvature=curvature.length?Math.max(...curvature):NaN;
  const maxCurvatureCycle=curvature.length?curvature.indexOf(maxCurvature)+3:NaN;
  const tailK=Math.max(5,Math.floor(v.length*.25));
  const tailBase=mean(v.slice(Math.max(0,v.length-2*tailK),Math.max(0,v.length-tailK)));
  const tailDiffs=v.slice(Math.max(1,v.length-tailK)).map((x,i)=>x-v[Math.max(0,v.length-tailK)-1+i]).filter(Number.isFinite);
  return {n:v.length,baseline:first,baselineSd,late:last,lateDelta:last-first,amplitude:Math.max(...v)-Math.min(...v),
    risingFraction:diffs.length?diffs.filter(x=>x>0).length/diffs.length:0,
    maxSlope,maxSlopeCycle,maxCurvature,maxCurvatureCycle,
    terminalDelta:last-tailBase,terminalRisingFraction:tailDiffs.length?tailDiffs.filter(x=>x>0).length/tailDiffs.length:0};
}
function graphAnalysisRows(run,targetKey,sampleName){
  if(!run)return [];
  const selectedKey=String(targetKey||"");
  const wells=ssWells(run).filter(w=>{
    if(!w||!Array.isArray(w.curve)||!Number.isFinite(Number(w.channel)))return false;
    if(sampleName&&String(w.sample||"")!==String(sampleName))return false;
    if(!selectedKey||selectedKey===ORPHAN_CURVE_KEY)return true;
    return [w.analysisUid,w.analysis,w.target].some(v=>String(v||"")===selectedKey);
  });
  const byChannel=new Map();
  wells.forEach(w=>{const k=String(Number(w.channel));if(!byChannel.has(k))byChannel.set(k,[]);byChannel.get(k).push({w,s:graphAnalysisStats(w.curve)});});
  const out=[];
  byChannel.forEach((items,k)=>{
    const baselines=items.map(x=>x.s&&x.s.baseline).filter(Number.isFinite).sort((a,b)=>a-b);
    const baselineMedian=baselines.length?median(baselines):NaN;
    const deviations=baselines.map(x=>Math.abs(x-baselineMedian)).sort((a,b)=>a-b);
    const baselineMad=deviations.length?median(deviations):0;
    const baselineLimit=baselineMedian+Math.max(10,3*1.4826*baselineMad);
    const posAmps=items.filter(x=>x.s&&((/positive/i.test(String(x.w.call||"")))||Number(x.w.CpRaw)>0)).map(x=>x.s.amplitude).filter(Number.isFinite).sort((a,b)=>a-b);
    const referenceAmplitude=posAmps.length?median(posAmps):NaN;
    items.filter(x=>graphAnalysisControl(x.w)).forEach(({w,s})=>{
      if(!s)return;
      const signalFloor=Math.max(3,Number.isFinite(referenceAmplitude)?referenceAmplitude*.05:0);
      /* Match the forensic rising-curve rule and also catch a monotone terminal rise:
         a late segment can be meaningful even when early baseline noise lowers the whole-run fraction. */
      const wholeRunRise=s.lateDelta>=.45*s.amplitude&&s.risingFraction>=.55;
      const terminalRise=s.terminalDelta>=Math.max(10,.25*s.amplitude)&&s.terminalRisingFraction>=.8;
      const lateRise=s.amplitude>=signalFloor&&(wholeRunRise||terminalRise);
      const highBaseline=Number.isFinite(baselineMedian)&&s.baseline>baselineLimit&&s.baseline-baselineMedian>=10;
      if(!lateRise&&!highBaseline)return;
      const hasAnswer=resultAnswers(w);
      const assessment=lateRise
        ? `Late rising trace${hasAnswer?" with a stored answer":" without a same-channel Cq/no-crossing answer"}`
        : "High raw baseline relative to wells on the same channel";
      out.push({well:w.well||"",sample:w.sample||"",target:w.target||w.analysis||"",channel:w.channel,
        baseline:s.baseline,baseline_sd:s.baselineSd,reference_baseline:baselineMedian,late_delta:s.lateDelta,terminal_delta:s.terminalDelta,amplitude:s.amplitude,curve:w.curve,
        max_slope:s.maxSlope,max_slope_cycle:s.maxSlopeCycle,max_curvature:s.maxCurvature,max_curvature_cycle:s.maxCurvatureCycle,
        rising_fraction:s.risingFraction,terminal_rising_fraction:s.terminalRisingFraction,stored_call:w.call||"",assessment,
        severity:lateRise?"error":"review",lateRise,highBaseline});
    });
  });
  return out;
}
function graphAnalysisMarkup(run,c,targetKey,sampleName,signalName){
  if(!run)return '<p class="hint">Load an experiment to analyse its stored curves.</p>';
  const rows=graphAnalysisRows(run,targetKey,sampleName);
  const title=`${runName(run)} · ${c&&c.g?c.g.title:"selected graph"}${c&&c.target?` · ${c.target}`:""}${sampleName?` · ${sampleName}`:""}${signalName?` · ${signalName}`:""}`;
  const findings=rows.map(r=>`<div class="graph-finding ${r.severity}"><b>${esc(r.severity==="error"?"Error — review required":"Review — baseline comparison")}: ${esc(r.well)} ${esc(r.sample)}</b><div>${esc(r.assessment)} for ${esc(r.target||"unnamed target")} (channel ${esc(String(r.channel))}). Baseline ${esc(num(r.baseline,1))}; ground-noise SD ${esc(num(r.baseline_sd,1))}; peak slope ${esc(num(r.max_slope,1))} at cycle ${esc(num(r.max_slope_cycle,0))}; peak curvature ${esc(num(r.max_curvature,1))} at cycle ${esc(num(r.max_curvature_cycle,0))}; same-channel median ${esc(num(r.reference_baseline,1))}; late change ${esc(num(r.late_delta,1))}; terminal change ${esc(num(r.terminal_delta,1))}; amplitude ${esc(num(r.amplitude,1))}; rising fraction ${esc(num(r.rising_fraction*100,0))}%.</div><div class="hint">Raw fluorescence height alone is not an amplification call. Compare the stored curve with ΔRn/threshold, neighbouring wells, melt or endpoint evidence, and the laboratory control rule.</div></div>`).join("");
  const tableRows=rows.map(r=>({well:r.well,sample:r.sample,target:r.target,channel:r.channel,baseline:+r.baseline.toPrecision(6),ground_noise_sd:+r.baseline_sd.toPrecision(6),peak_slope:+r.max_slope.toPrecision(6),peak_slope_cycle:r.max_slope_cycle,peak_curvature:+r.max_curvature.toPrecision(6),peak_curvature_cycle:r.max_curvature_cycle,same_channel_median:+r.reference_baseline.toPrecision(6),late_change:+r.late_delta.toPrecision(6),terminal_change:+r.terminal_delta.toPrecision(6),amplitude:+r.amplitude.toPrecision(6),rising_fraction:+(r.rising_fraction*100).toPrecision(5),terminal_rising_fraction:+(r.terminal_rising_fraction*100).toPrecision(5),stored_call:r.stored_call,assessment:r.assessment}));
  const tableHtml=tableRows.length?`<details><summary>Numbers behind these findings (${tableRows.length})</summary><div class="scroll" style="max-height:280px">${table(Object.keys(tableRows[0]).map(k=>({key:k,label:k,n:typeof tableRows[0][k]==="number"})),tableRows)}</div></details>`:'<p class="hint">No NTC/blank baseline or late-rise finding was triggered for this selection.</p>';
  return `<p><b>Selected context:</b> ${esc(title)}</p>${findings?`<div class="graph-analysis-grid">${findings}</div>`:""}${tableHtml}`;
}
function renderGraphs(){
  const box=$("#g-chart");if(!box)return;
  ixPurge();   /* release the previous figures before their nodes are replaced */
  const sel=$("#g-graph");
  if(!sel.options.length){
    const groups=uniq(GRAPHS.map(g=>g.group));
    sel.innerHTML=groups.map(gr=>`<optgroup label="${esc(ui(gr))}">${GRAPHS.filter(g=>g.group===gr).map(g=>`<option value="${g.id}">${esc(ui(g.title))}</option>`).join("")}</optgroup>`).join("");
  }
  if(!RUNS.length){box.innerHTML=emptyReview();$("#g-table").innerHTML="";$("#g-note").textContent="";return;}
  setSelectItems($("#g-run"),RUNS.map((r,i)=>({value:i,label:runName(r)})));
  const c0=graphContext(),g=c0.g,opts=g.opts||[];
  $("#g-run-wrap").style.display=g.scope==="run"?"":"none";
  const tgt=g.scope==="all"?uniq(RUNS.flatMap(r=>ssWells(r).map(w=>w.target||w.analysis)).filter(Boolean)):gTargets(c0.run||{});
  setSelectItems($("#g-target"),[{value:"",label:g.id==="x_control"||g.id==="plate"||g.id==="stdcurve"||g.id==="endpoint"?"All targets":"All targets"},...tgt.map(t=>({value:t,label:t}))]);
  /* Do not silently choose the first target: an empty target means all targets. */
  setSelectItems($("#g-control"),SOP.controls.map((x,i)=>({value:i,label:x.name||x.match})));
  const show=(id,on)=>{$(id).style.display=on?"":"none";};
  show("#g-target-wrap",opts.includes("target"));show("#g-metric-wrap",opts.includes("metric"));
  show("#g-signal-wrap",opts.includes("signal"));show("#g-log-wrap",opts.includes("signal"));
  show("#g-colourby-wrap",opts.includes("colourby"));show("#g-level-wrap",opts.includes("level"));show("#g-control-wrap",opts.includes("control"));
  const c=graphContext();
  $("#g-note").textContent=ui(g.note||"");
  let res;
  plotArm();
  try{res=g.render(c);}catch(e){console.error(e);res={svg:svgMessage("This graph could not be drawn: "+e.message),rows:[]};}
  const ixSpecs=plotDisarm();
  GRAPH_STATE.last={g,c,res};
  box.innerHTML=res.svg;
  const svg=box.querySelector("svg");if(svg){svg.removeAttribute("height");svg.style.width="100%";svg.style.maxWidth=svg.getAttribute("width")+"px";svg.style.height="auto";}
  ixMount(box,ixSpecs.slice(-1),!!($("#g-ix")&&$("#g-ix").checked)&&/<clipPath/.test(res.svg||""));
  const rows=res.rows||[];
  $("#g-table").innerHTML=rows.length?`<details><summary>${esc(ui("Data behind this graph"))} (${rows.length})</summary><div class="scroll" style="max-height:300px">${table(Object.keys(rows[0]).map(k=>({key:k,label:k,n:typeof rows[0][k]==="number"})),rows.slice(0,300).map(r=>{const o={};for(const k in r)o[k]=typeof r[k]==="number"?+r[k].toPrecision(6):r[k];return o;}))}</div>${rows.length>300?`<p class="hint">First 300 rows shown; the CSV has all ${rows.length}.</p>`:""}</details>`:"";
  $("#g-sop").innerHTML=`${esc(ui("Drawn with SOP profile"))} <b>${esc(SOP.name)}</b> v${esc(SOP.version)} · <code>${sopHash().slice(0,16)}…</code>`;
}
function graphFileBase(){const L=GRAPH_STATE.last;if(!L)return "graph";return safeName((L.g.scope==="run"&&L.c.run?runName(L.c.run)+"_":baseName()+"_")+L.g.id+(L.c.target?"_"+L.c.target:""));}
function graphSvgText(){const L=GRAPH_STATE.last;if(!L)return "";
  return L.res.svg.replace("<svg ",`<svg data-sop="${esc(SOP.name)} v${esc(SOP.version)} sha256:${sopHash()}" `);}
function graphPng(){
  const L=GRAPH_STATE.last;if(!L)return;
  const svgText=graphSvgText(),m=svgText.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/),W=m?+m[1]:900,H=m?+m[2]:450,scale=2;
  const img=new Image();
  img.onload=()=>{const cv=document.createElement("canvas");cv.width=W*scale;cv.height=H*scale;const ctx=cv.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(img,0,0,cv.width,cv.height);
    cv.toBlob(b=>b.arrayBuffer().then(ab=>download(graphFileBase()+".png",new Uint8Array(ab),"image/png")),"image/png");};
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);
}
function graphAllZip(){
  if(!RUNS.length)return;
  const ri=Number($("#g-run").value)||0,entries=[];
  GRAPHS.forEach(g=>{
    const targets=[""];
    const controls=(g.opts||[]).includes("control")
      ?SOP.controls.map((x,i)=>({i,x})).filter(({x})=>x.expect==="positive")
      :[{i:0,x:null}];
    targets.forEach(t=>controls.forEach(({i,x})=>{try{
      const c={g,ri,run:RUNS[ri],target:t,metric:"outcome",signal:"stored",log:false,colourby:"outcome",level:"end",control:String(i)};
      const suffix=x?"_"+safeName(x.name||x.match||String(i)):"";
      const res=g.render(c);const base=(g.scope==="run"?"run_":"all_runs_")+g.id+suffix;
      entries.push({name:base+".svg",data:res.svg});
      if(res.rows&&res.rows.length)entries.push({name:base+".csv",data:csvOf(res.rows)});
    }catch(e){entries.push({name:g.id+"_error.txt",data:String(e.message)});}}));
  });
  entries.push({name:"sop_profile.json",data:sopJSON()});
  entries.push(...reviewBundleEntries());
  entries.push({name:"README.txt",data:`Graphs and review exports for ${runName(RUNS[ri])} (run-level) and all ${RUNS.length} loaded run(s) (cross-run).\nSOP profile ${SOP.name} v${SOP.version}, SHA-256 ${sopHash()}.\nEach graph .csv holds the numbers behind the .svg of the same name. The review/ folder contains the plate map, sample comparison, statistics, control-chart, runs/QC, amplification-curve and instrument-record exports.\n`});
  download(safeName(runName(RUNS[ri]))+"_graphs.zip",makeStoredZip(entries),"application/zip");
}
function wireGraphs(){
  ["#g-graph","#g-run","#g-metric","#g-signal","#g-log","#g-colourby","#g-level","#g-control","#g-ix"].forEach(id=>$(id).onchange=()=>{GRAPH_STATE.userTarget=false;renderGraphs();});
  $("#g-target").onchange=()=>{GRAPH_STATE.userTarget=true;renderGraphs();};
  $("#g-dl-svg").onclick=()=>{if(GRAPH_STATE.last)download(graphFileBase()+".svg",graphSvgText(),"image/svg+xml");};
  $("#g-dl-png").onclick=graphPng;
  $("#g-dl-csv").onclick=()=>{const L=GRAPH_STATE.last;if(L&&L.res.rows&&L.res.rows.length)withExportNames(()=>{const r=L.g.render(Object.assign({},L.c,{run:RUNS[L.c.ri]}));download(graphFileBase()+".csv",csvOf(r.rows),"text/csv");});};
  $("#g-dl-all").onclick=async()=>{
    const button=$("#g-dl-all"),label=button.textContent;button.disabled=true;button.textContent="Preparing graphs…";
    try{await new Promise(r=>setTimeout(r,0));withExportNames(graphAllZip);}
    catch(e){console.error(e);alert("Graph export failed: "+e.message);}
    finally{button.disabled=false;button.textContent=label;}
  };
}

/* ---------- lighter Load tab and lazy rendering ---------- */
const DIRTY=new Set();
function markDirty(...names){names.forEach(n=>DIRTY.add(n));}
function currentTab(){const b=document.querySelector("nav button.on");return b?b.dataset.tab:"load";}
function currentReviewSheet(){const b=document.querySelector("#review-tabs button.on");return b?b.dataset.review:"overview";}
const REVIEW_RENDERERS={overview:()=>{renderReviewOverview();renderIssueOverview();},plate:()=>renderReviewPlate(),compare:()=>renderReviewComparison(),
  statistics:()=>renderReviewStatistics(),controls:()=>renderReviewControls(),runs:()=>renderReviewRuns(),
  curves:()=>renderReviewCurves(),rising:()=>renderReviewRising(),instrument:()=>renderReviewInstrument()};
function renderTab(name){
  if(!DIRTY.has(name))return;DIRTY.delete(name);APP_STATE.activeTab=name;
  const t0=performance.now?performance.now():Date.now();
  try{
    if(name==="load"){renderLoaded();renderDerived();}
    else if(name==="export")renderExports();
    else if(name==="sop")renderSop();
    else if(name==="results")renderResults();
    else if(name==="graphs")renderGraphs();
    else if(name==="panel")renderPanel();
    else if(name==="integrity")renderIntegrity();
    else if(name==="review"){["overview","plate","compare","statistics","controls","runs","curves","rising","instrument"].forEach(s=>DIRTY.add("review:"+s));renderReviewSheetLazy(currentReviewSheet());}
  }catch(e){
    appError(`render:${name}`,e);
    const target=document.querySelector("#tab-"+name);
    if(target)target.insertAdjacentHTML("afterbegin",`<div class="notice bad">This view could not be rendered. The diagnostic record contains the error: <code>${esc(e.message||e)}</code></div>`);
  }finally{localizeDOM(document.querySelector("#tab-"+name)||document.body);
    const ms=(performance.now?performance.now():Date.now())-t0;
    APP_STATS.lastRender={tab:name,ms};APP_STATS.renders[name]=Math.round(ms);
    if(ms>APP_STATS.maxRenderMs)APP_STATS.maxRenderMs=ms;
    appStatusPaint();}
}
function renderReviewSheetLazy(name){
  if(DIRTY.has("review"))return renderTab("review");
  if(!DIRTY.has("review:"+name))return;DIRTY.delete("review:"+name);
  try{REVIEW_RENDERERS[name]&&REVIEW_RENDERERS[name]();}catch(e){console.error(e);}
}

