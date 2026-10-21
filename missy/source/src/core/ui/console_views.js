/* ============================================================
   The console as a data console, not only an alarm queue.
   ------------------------------------------------------------
   Each of the seven names on the top row is a VIEW with its own builder. A view
   reports what that part of the data set holds, whether or not anything is wrong,
   so the top row never leads to an empty screen. Every item carries a pictogram
   for the kind of object, a state glyph with its word, a headline number, and a
   detail list of the numbers behind it. Nothing here recomputes a measurement:
   the builders read the same functions the page's own views read.
   ============================================================ */
const MG_PICT={file:"▤",summary:"▣",rule:"§",sample:"◉",run:"▥",chart:"◪",
  graph:"◩",finding:"⚠",export:"↓",baseline:"◐",instrument:"⚙",control:"◈"};
function mgIt(o){return Object.assign({kind:"data",sev:"none",pict:MG_PICT.summary,kindWord:"",code:"",title:"",
  value:"",unit:"",limits:"",state:"",evidence:"",rows:[],actions:[]},o);}
function mgSafe(f,fallback){try{return f();}catch(e){appError("console:view",e);return fallback;}}
function mgTxt(v){return (v===undefined||v===null||v==="")?"—":String(v);}

/* ---------- 1 · Load files: one item per file, with what was read out of it ---------- */
function mgViewLoad(){
  const out=[];
  if(!RUNS.length&&!PASTED){
    const staged=Array.isArray(STAGED)&&STAGED.length;
    return [mgIt({kind:"intake",sev:"none",pict:MG_PICT.file,kindWord:"intake",code:"LOAD",
      title:staged?"Files staged, ready to read":"No experiment files are loaded",
      value:staged?String(STAGED.length):"0",unit:staged?"files staged":"files",
      state:staged?"The files passed intake. Read them to decode runs and build the views.":"Drop .ixo, .eds, .edt or .zip files on the load view to begin.",
      actions:staged
        ?[{key:"3",label:"Read staged files",cmd:"read files"},{key:"4",label:"Choose another selection",cmd:"choose files"}]
        :[{key:"3",label:"Choose experiment files",cmd:"choose files"}]})];
  }
  const meta=mgSafe(()=>metaRows(),[]);
  if(RUNS.length){
    const results=RUNS.reduce((a,r)=>a+((r.wells||[]).length),0);
    const curves=RUNS.reduce((a,r)=>a+mgSafe(()=>uniqueCurveCount(r),0),0);
    const tm=RUNS.reduce((a,r)=>a+((r.tmWells||[]).length),0);
    /* A file that could not be read, or whose container checksum does not match, is what
       raises this view. Without the test the view threw and the operator saw nothing. */
    const bad=RUNS.some(r=>r.acqError||(r.integrity&&r.integrity.ok===false));
    out.push(mgIt({kind:"summary",sev:bad?"alarm":"ok",pict:MG_PICT.summary,kindWord:"files read",code:"LOAD",
      title:"Files read into this session",value:String(RUNS.length),unit:RUNS.length===1?"file":"files",
      limits:`${results.toLocaleString()} stored results · ${curves.toLocaleString()} curves decoded`,
      state:"Decoded file metadata and stored results are ready. Open File integrity for any file-integrity mismatch.",
      evidence:uniq(RUNS.map(r=>r.platform||"LightCycler 480")).join(" · "),
      rows:[["Stored results",results.toLocaleString()],["Curves decoded",curves.toLocaleString()],
            ["Melting results",tm.toLocaleString()],
            ["Instruments",uniq(RUNS.map(r=>(r.meta&&r.meta.InstrumentName)||"not named")).join(", ")],
            ["Operators",uniq(meta.map(m=>m.operator).filter(Boolean)).join(", ")||"—"],
            ["Active profile",`${SOP.name} v${SOP.version}`]],
      actions:[{key:"3",label:"Choose experiment files",cmd:"choose files"}]}));
    RUNS.forEach((r,i)=>{
      const m=meta[i]||{},ok=true;
      out.push(mgIt({kind:"file",sev:r.acqError?"watch":"ok",pict:MG_PICT.file,kindWord:"file",
        code:"F"+(i+1),title:m.experiment||r.file||("Experiment "+(i+1)),
        value:String(m.quantification_results||0),unit:"stored results",
        limits:`${mgTxt(m.plate)} plate · ${mgTxt(m.cycles)} cycles · ${m.curves_decoded||0} curves`,
        state:r.acqError?("Fluorescence could not be read: "+r.acqError)
              :r.isTemplate?"Template or unrun experiment — plate setup, protocol and analysis settings only."
              :"File decoded; stored values are ready for review.",
        evidence:`${mgTxt(m.platform)} · ${m.instrument||"instrument not named"} · ${m.run_started||m.experiment_created||"no date"}`,
        rows:[["File",mgTxt(r.file)],["Instrument",mgTxt(m.instrument)],["Software",mgTxt(m.software_version)],
              ["Operator",mgTxt(m.operator)],["Run started",mgTxt(m.run_started)],["Run ended",mgTxt(m.run_ended)],
              ["Run minutes",mgTxt(m.run_duration_minutes)],["Channels",mgTxt(m.channels)],
              ["Analyses",String(m.analyses||0)],["Melting results",String(m.melting_results||0)],
              ["Bytes",m.source_bytes?Number(m.source_bytes).toLocaleString():"—"]],
        actions:[{key:"3",label:"Choose experiment files",cmd:"choose files"}]}));
    });
  }
  if(PASTED)out.push(mgIt({kind:"file",sev:"ok",pict:MG_PICT.file,kindWord:"pasted table",code:"CSV",
    title:"Pasted Cq table",value:String((PASTED.rows||[]).length),unit:"Cq values",
    limits:"no fluorescence curves in a pasted table",
    state:"Replicate checks and the inhibition test use these values; curve-based exports need an .ixo or .eds file.",
    evidence:PASTED.source||"pasted data"}));
  return out;
}

/* ---------- 2 · SOP: the profile itself, rule by rule, with how each one lands ---------- */
function mgViewSop(){
  const out=[],T=SOP.targets||[],C=SOP.controls||[],R=SOP.replicates||{},IC=SOP.ic||{},RN=SOP.run||{};
  out.push(mgIt({kind:"summary",sev:SOP.locked?"ok":"none",pict:MG_PICT.summary,kindWord:"profile",code:"SOP",
    title:SOP.name||"Laboratory profile",value:"v"+mgTxt(SOP.version),unit:"",
    limits:`${T.length} target rule(s) · ${C.length} control(s) · ${Object.keys(RN).length} run rule(s)`,
    state:"Every outcome on this page is produced by this profile. Stored Cq values, calls and fluorescence are never changed.",
    evidence:"sha256 "+mgSafe(()=>sopHash().slice(0,16)+"…","—"),
    rows:[["Assay",mgTxt(SOP.assay)],["Author",mgTxt(SOP.author)],["Effective",mgTxt(SOP.effective)],
          ["Locked",SOP.locked?"yes":"no"],["Minimum replicates",mgTxt(R.min)],
          ["Positive replicates",mgTxt(R.positiveMin)],["Maximum Cq SD",mgTxt(R.maxSd)],
          ["Runs evaluated",String(mgSafe(()=>sopEvaluateAll().length,0))]],
    actions:[{key:"3",label:"Open the SOP view on the page",cmd:"open page sop"}]}));
  T.forEach((t,i)=>out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.rule,kindWord:"target rule",code:"T"+(i+1),
    title:t.match==="*"?"Every other target":t.match,
    value:mgTxt(t.cqMax),unit:"Cq cut-off",
    limits:`kind ${mgTxt(t.kind)}${t.cqLate!==""&&t.cqLate!=null?` · late signal beyond Cq ${t.cqLate}`:""}${t.quantMin!==""&&t.quantMin!=null?` · minimum quantity ${t.quantMin}`:""}`,
    state:`A signal later than the cut-off is called negative. A late signal is reported as ${mgTxt(t.lateOutcome)}.`,
    evidence:`rule ${i+1} of ${T.length}; the first matching rule wins`,
    rows:[["Match",mgTxt(t.match)],["Kind",mgTxt(t.kind)],["Cq cut-off",mgTxt(t.cqMax)],
          ["Late signal from",mgTxt(t.cqLate)],["Minimum quantity",mgTxt(t.quantMin)],
          ["Late outcome",mgTxt(t.lateOutcome)]]})));
  C.forEach((c,i)=>out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.control,kindWord:"control",code:"C"+(i+1),
    title:c.name||c.match,value:mgTxt(c.minPerRun),unit:"required per run",
    limits:`expected ${mgTxt(c.expect)} · matched by ${mgTxt(c.matchBy)}`,
    state:`If this control fails the run is ${c.onFail==="reject"?"rejected":"flagged for review"}.`,
    evidence:`matches ${mgTxt(c.match)} on targets ${mgTxt(c.targets)}`,
    rows:[["Name",mgTxt(c.name)],["Match",mgTxt(c.match)],["Matched by",mgTxt(c.matchBy)],
          ["Expected",mgTxt(c.expect)],["Cq window",(c.cqLo!==""&&c.cqLo!=null?c.cqLo:"—")+" – "+(c.cqHi!==""&&c.cqHi!=null?c.cqHi:"—")],
          ["Minimum per run",mgTxt(c.minPerRun)],["On failure",mgTxt(c.onFail)]]})));
  out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.rule,kindWord:"replicates and control",code:"REP",
    title:"Replicates and internal control",value:mgTxt(R.maxSd),unit:"maximum Cq SD",
    limits:`at least ${mgTxt(R.min)} replicate(s), ${mgTxt(R.positiveMin)} of them positive`,
    state:`A spread above the limit is reported as ${mgTxt(R.sdOutcome)}; a partly positive replicate set as ${mgTxt(R.partialOutcome)}.`,
    evidence:"internal control shift limit "+mgTxt(IC.maxShift)+" Cq",
    rows:[["Minimum replicates",mgTxt(R.min)],["Positive replicates",mgTxt(R.positiveMin)],
          ["Partial outcome",mgTxt(R.partialOutcome)],["Maximum Cq SD",mgTxt(R.maxSd)],["SD outcome",mgTxt(R.sdOutcome)],
          ["IC reference Cq",mgTxt(IC.referenceCq)],["IC maximum shift",mgTxt(IC.maxShift)],
          ["IC shift outcome",mgTxt(IC.shiftOutcome)],["IC missing outcome",mgTxt(IC.missingOutcome)]]}));
  out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.rule,kindWord:"run acceptance",code:"RUN",
    title:"Run acceptance rules",value:String(Object.keys(RN).length),unit:"rules",
    limits:`controls failing: ${mgTxt(RN.controlsFail)}`,
    state:"These decide whether a whole run is accepted, reviewed or rejected before any sample is reported.",
    evidence:"applied to every loaded run",
    rows:[["Controls missing",mgTxt(RN.controlsMissing)],
          ["Controls failing",mgTxt(RN.controlsFail)],["Standard curve",mgTxt(RN.stdCurve)],
          ["Minimum R²",mgTxt(RN.minR2)],["Efficiency window",`${mgTxt(RN.effMin)} – ${mgTxt(RN.effMax)} %`],
          ["NTC gap",mgTxt(RN.ntcGap)],["Edit delay (hours)",mgTxt(RN.editDelayHours)],
          ["Calibration",mgTxt(RN.calibration)],["Zone spread limit",mgTxt(RN.maxZoneSpread)],
          ["Instrument run state",mgTxt(RN.runState)]]}));
  /* how the rules actually landed on the loaded runs */
  const crit=mgSafe(()=>sopCriteriaRows(),[]);
  if(crit.length){
    const by=new Map();
    crit.forEach(c=>{const l=by.get(c.criterion)||[];l.push(c);by.set(c.criterion,l);});
    [...by].forEach(([name,list],i)=>{
      const fail=list.filter(c=>c.status==="fail").length,rev=list.filter(c=>c.status==="review").length;
      const worst=list.find(c=>c.status==="fail")||list.find(c=>c.status==="review")||list[0];
      out.push(mgIt({kind:"rule",sev:fail?"alarm":rev?"watch":"ok",pict:MG_PICT.rule,kindWord:"criterion on the data",
        code:"A"+(i+1),title:name,value:String(list.length-fail-rev),unit:`of ${list.length} run(s) met`,
        limits:fail?`${fail} rejected`+(rev?`, ${rev} for review`:""):rev?`${rev} for review`:"every run met it",
        state:mgTxt(worst&&worst.evidence),
        evidence:list.map(c=>c.experiment).slice(0,3).join(", ")+(list.length>3?` … (+${list.length-3})`:""),
        rows:list.slice(0,12).map(c=>[c.experiment,`${c.status}${c.evidence?" — "+String(c.evidence).slice(0,70):""}`])}));
    });
  }
  return out;
}

/* ---------- 3 · Results: outcomes, runs and targets under the active profile ---------- */
function mgViewResults(){
  const out=[];
  if(!RUNS.length&&PASTED)return [mgIt({kind:"results",sev:"none",pict:MG_PICT.sample,kindWord:"pasted table",code:"CSV",
    title:"Pasted Cq table",value:String((PASTED.rows||[]).length),unit:"Cq values",
    state:"Open the results view on the page to inspect the pasted table.",evidence:PASTED.source||"pasted data",
    actions:[{key:"3",label:"Open the results view on the page",cmd:"open page results"}]})];
  const ev=mgSafe(()=>sopEvaluateAll(),[]);
  if(!ev.length)return [mgIt({kind:"results",sev:"none",pict:MG_PICT.sample,kindWord:"results",code:"RES",
    title:"No run has been evaluated yet",value:"0",unit:"runs",
    state:"Load an experiment file; results are recomputed as soon as the profile or the data changes."})];
  const rows=ev.flatMap(e=>e.rows||[]);
  const cnt=o=>rows.filter(r=>r.outcome===o).length;
  const rej=ev.filter(e=>e.accept&&e.accept.ok===false);
  const action=rows.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome)).length;
  out.push(mgIt({kind:"summary",sev:rej.length?"alarm":action?"watch":"ok",pict:MG_PICT.summary,kindWord:"results",
    code:"RES",title:"Results under this profile",value:String(rows.length),unit:"interpreted results",
    limits:`${ev.length} run(s) · ${rej.length} rejected · ${action} result(s) need action`,
    state:rej.length?`${rej.length} run(s) were rejected by the profile; their samples are not reportable.`
      :action?`${action} result(s) need an action before the report can be signed.`
      :"Every run was accepted and no result needs an action.",
    evidence:`profile ${SOP.name} v${SOP.version}`,
    rows:[["Positive",String(cnt("Positive"))],["Negative",String(cnt("Negative"))],
          ["Inconclusive",String(cnt("Inconclusive"))],["Repeat",String(cnt("Repeat"))],
          ["Invalid",String(cnt("Invalid")+cnt("Invalid run"))],["Control failed",String(cnt("Control fail"))],
          ["Control accepted",String(cnt("Control pass"))],["Standards",String(cnt("Standard"))]],
    actions:[{key:"3",label:"Open the results view on the page",cmd:"open page results"}]}));
  if(rej.length)out.push(mgIt({kind:"results",sev:"alarm",pict:MG_PICT.run,kindWord:"rejected runs",code:"REJ",
    title:"Runs rejected by the profile",value:String(rej.length),unit:rej.length===1?"run":"runs",
    limits:`of ${ev.length} run(s) read`,
    state:((rej[0].accept&&rej[0].accept.reasons)||[]).join("; ")||"see the results view for the reasons",
    evidence:rej.map(r=>runName(r.run)).slice(0,3).join(", "),
    rows:rej.slice(0,12).map(r=>[runName(r.run),((r.accept&&r.accept.reasons)||[]).join("; ").slice(0,70)||"rejected"]),
    actions:[{key:"3",label:"Open the results view on the page",cmd:"open page results"}]}));
  /* per outcome class */
  const order=["Invalid run","Invalid","Control fail","Repeat","Inconclusive","Positive","Negative","Control pass","Standard"];
  order.forEach((o,i)=>{
    const list=rows.filter(r=>r.outcome===o);if(!list.length)return;
    const bad=/Invalid|Control fail/.test(o),warn=/Repeat|Inconclusive/.test(o);
    out.push(mgIt({kind:"results",sev:bad?"alarm":warn?"watch":"ok",pict:MG_PICT.sample,kindWord:"outcome",
      code:"O"+(i+1),title:o,value:String(list.length),unit:list.length===1?"result":"results",
      limits:`${uniq(list.map(r=>r.target)).length} target(s) · ${uniq(list.map(r=>r.sample)).length} sample(s)`,
      state:mgTxt((SOP.outcomes[o]||{}).label)+((list[0]&&list[0].reason)?" — "+list[0].reason:""),
      evidence:uniq(list.map(r=>r.target)).slice(0,6).join(", "),
      rows:list.slice(0,12).map(r=>[`${r.sample} · ${r.target}`,
        Number.isFinite(r.cqMean)?"Cq "+r.cqMean.toFixed(2):(r.reason||"—")])}));
  });
  /* per target */
  const byT=new Map();rows.forEach(r=>{const l=byT.get(r.target)||[];l.push(r);byT.set(r.target,l);});
  [...byT].forEach(([t,list],i)=>{
    const cq=list.map(r=>r.cqMean).filter(Number.isFinite);
    const need=list.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome)).length;
    out.push(mgIt({kind:"results",sev:need?"watch":"ok",pict:MG_PICT.sample,kindWord:"target",code:"TG"+(i+1),
      title:t||"unnamed target",value:cq.length?cq.reduce((a,b)=>a+b,0)/cq.length:"—",
      unit:cq.length?"mean Cq":"",
      limits:`${list.length} result(s) · ${cq.length} with a Cq${need?` · ${need} need action`:""}`,
      state:cq.length?`Cq from ${Math.min(...cq).toFixed(2)} to ${Math.max(...cq).toFixed(2)} across ${uniq(list.map(r=>r.sample)).length} sample(s).`
        :"No Cq was stored for this target.",
      evidence:uniq(list.map(r=>r.role||"")).filter(Boolean).join(", ")||"—",
      rows:[["Results",String(list.length)],["Samples",String(uniq(list.map(r=>r.sample)).length)],
            ["Positive",String(list.filter(r=>r.outcome==="Positive").length)],
            ["Negative",String(list.filter(r=>r.outcome==="Negative").length)],
            ["Need action",String(need)],
            ["Lowest Cq",cq.length?Math.min(...cq).toFixed(2):"—"],
            ["Highest Cq",cq.length?Math.max(...cq).toFixed(2):"—"]]}));
  });
  /* per run */
  mgSafe(()=>sopRunRows(),[]).forEach((r,i)=>{
    out.push(mgIt({kind:"results",sev:r.rejected?"alarm":(r.review?"watch":"ok"),pict:MG_PICT.run,kindWord:"run",
      code:"R"+(i+1),title:r.experiment,value:String(r.positive),unit:"positive",
      limits:`${r.negative} negative · ${r.inconclusive} inconclusive · ${r.repeat} repeat · ${r.invalid} invalid`,
      state:r.rejected?("Rejected: "+r.rejected):r.review?("For review: "+r.review):"Accepted under this profile.",
      evidence:`${r.platform} · ${mgTxt(r.run_start)}`,
      rows:[["Status",mgTxt(r.status)],["Platform",mgTxt(r.platform)],["Run start",mgTxt(r.run_start)],
            ["Run end",mgTxt(r.run_end)],["Run minutes",mgTxt(r.run_minutes)],
            ["Last change",mgTxt(r.last_change)],["Hours end to change",mgTxt(r.hours_run_end_to_last_change)],
            ["Control failed",String(r.control_fail)]]}));
  });
  return out;
}

/* ---------- 4 · Control panel: the state of every control chart, no drawing ---------- */
function mgPanelItems(includeAll){
  const items=[];
  const insts=mgSafe(()=>ccInstruments(),[]);
  if(!insts.length)return items;
  const key=CC_STATE.instrument&&insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0].key;
  const rows=ccRowsFor(key),pf=rows.length?rows[0].platform:"LC";
  CC_CHARTS.filter(d=>d.inst.includes(pf)).forEach(d=>{
    const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
    const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{
      let res;try{res=ccCompute(d,rows,v);}catch(e){return;}
      const st=ccStatus(res),pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre),last=pts[pts.length-1];
      if(!last)return;
      if(!includeAll&&st.level!=="bad"&&st.level!=="warn")return;
      const lim=Number.isFinite(last.lcl)&&Number.isFinite(last.ucl)
        ?`limits ${fmtTick(+last.lcl.toPrecision(4))} – ${fmtTick(+last.ucl.toPrecision(4))}`:"no limits yet";
      const sp=res.spec||{},spec=[Number.isFinite(sp.lo)?`≥ ${fmtTick(sp.lo)}`:"",Number.isFinite(sp.hi)?`≤ ${fmtTick(sp.hi)}`:""].filter(Boolean).join(" and ");
      const sev=st.level==="bad"?"alarm":st.level==="warn"?"watch":st.level==="ok"?"ok":"none";
      items.push(mgIt({kind:"chart",sev,pict:MG_PICT.chart,kindWord:"control chart",code:d.code,
        title:d.title+(v?" · "+v:""),
        value:fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4)),unit:d.unit||"",
        limits:lim+(spec?`  ·  specification ${spec}`:""),state:st.text,
        evidence:`${key} · ${pts.length} run(s) in this chart · last run ${last.row&&last.row.date?sopFmtTime(last.row.date).slice(0,10):"unknown date"}`,
        chartId:d.id,variant:v,instrument:key,
        rows:[["Chart",d.code],["Measurement",d.title],["Variant",v||"—"],
              ["Latest value",fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4))+(d.unit?" "+d.unit:"")],
              ["Centre line",Number.isFinite(last.cl)?fmtTick(+last.cl.toPrecision(4)):"—"],
              ["Lower limit",Number.isFinite(last.lcl)?fmtTick(+last.lcl.toPrecision(4)):"—"],
              ["Upper limit",Number.isFinite(last.ucl)?fmtTick(+last.ucl.toPrecision(4)):"—"],
              ["Specification",spec||"—"],["Runs in chart",String(pts.length)],
              ["Chart type",MG_TYPE_LABEL[cfg.type||d.type]||(cfg.type||d.type)],
              ["Instrument",key],["State",MG_WORD[sev]||""]],
        actions:[{key:"3",label:"Show the chart",cmd:"chart"}]}));
    });
  });
  const rank={alarm:0,watch:1,none:2,ok:3};
  items.sort((a,b)=>(rank[a.sev]-rank[b.sev])||a.code.localeCompare(b.code));
  return items;
}
function mgViewPanel(){
  const insts=mgSafe(()=>ccInstruments(),[]);
  if(!insts.length)return [mgIt({kind:"chart",sev:"none",pict:MG_PICT.chart,kindWord:"control panel",code:"CC",
    title:"No instrument history yet",value:"0",unit:"runs",
    state:"Control charts are built from the numbers the instrument writes into its own files. Read a run, or import a stored history.",
    actions:[{key:"3",label:"Open the control panel on the page",cmd:"open page panel"}]})];
  const key=CC_STATE.instrument&&insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0].key;
  const rows=ccRowsFor(key),items=mgPanelItems(true);
  const c=t=>items.filter(x=>x.sev===t).length;
  const out=[mgIt({kind:"summary",sev:c("alarm")?"alarm":c("watch")?"watch":"ok",pict:MG_PICT.instrument,
    kindWord:"instrument",code:"CC",title:key,value:String(rows.length),unit:"runs in this history",
    limits:`${items.length} chart(s) · ${c("alarm")} outside limits · ${c("watch")} to watch`,
    state:c("alarm")?`${c("alarm")} chart(s) have a point outside a control or specification limit.`
      :c("watch")?`${c("watch")} chart(s) show a pattern inside the limits.`
      :"Every chart with limits is in control on the latest run.",
    evidence:`${insts.length} instrument(s) in the loaded history`,
    rows:[["Instrument",key],["Runs",String(rows.length)],["Charts",String(items.length)],
          ["Outside limits",String(c("alarm"))],["To watch",String(c("watch"))],
          ["In control",String(c("ok"))],["Collecting a baseline",String(c("none"))],
          ["Baseline needed",String(mgSafe(()=>ccBaselineNeed(ccCfg("heat_rate")),"—"))+" runs"]],
    actions:[{key:"3",label:"Open the control panel on the page",cmd:"open page panel"}]})];
  return out.concat(items);
}

/* ---------- 5 · Graphs: the page's own single-run graphs, drawn in the console ---------- */
function mgGraphCtx(g,ri,target){
  const run=RUNS[ri];
  const tg=target!==undefined?target:((g.opts||[]).includes("target")&&run?(mgSafe(()=>gTargets(run),[])[0]||""):"");
  return {g,ri,run,target:tg,metric:"outcome",signal:"stored",log:false,colourby:"outcome",level:"end",control:"0"};
}
function mgViewGraphs(){
  const out=[];
  if(!RUNS.length)return [mgIt({kind:"graph",sev:"none",pict:MG_PICT.graph,kindWord:"graphs",code:"G",
    title:"No run to draw",value:"0",unit:"runs",
    state:"The graphs are drawn from one decoded run at a time. Load an experiment file first.",
    actions:[{key:"3",label:"Open the graphs view on the page",cmd:"open page graphs"}]})];
  const ri=Math.min(Math.max(0,MG.run|0),RUNS.length-1);
  const run=RUNS[ri];
  out.push(mgIt({kind:"summary",sev:"ok",pict:MG_PICT.summary,kindWord:"graphs",code:"G",
    title:"Graphs for "+runName(run),value:String(GRAPHS.length),unit:"graphs",
    limits:`run ${ri+1} of ${RUNS.length} · ${uniq(GRAPHS.map(g=>g.group)).length} group(s)`,
    state:"Each graph below is drawn here with the limits of the active profile. Use Next run to change the experiment.",
    evidence:uniq(GRAPHS.map(g=>g.group)).join(" · "),
    rows:GRAPHS.slice(0,14).map(g=>[g.group,g.title.slice(0,54)]),
    actions:RUNS.length>1?[{key:"3",label:"Next run",cmd:"next run"},
                           {key:"4",label:"Open the graphs view on the page",cmd:"open page graphs"}]
                         :[{key:"3",label:"Open the graphs view on the page",cmd:"open page graphs"}]}));
  GRAPHS.forEach((g,i)=>out.push(mgIt({kind:"graph",sev:"none",pict:MG_PICT.graph,kindWord:g.group,
    code:"G"+(i+1),title:g.title,value:"",unit:"",
    limits:g.scope==="run"?runName(run):"all loaded runs",
    state:g.note||"",evidence:`graph ${i+1} of ${GRAPHS.length} · drawn with ${SOP.name} v${SOP.version}`,
    graphId:g.id,runIndex:ri,
    rows:[["Group",g.group],["Drawn from",g.scope==="run"?"one run":"every loaded run"],
          ["Run",runName(run)],["Options",(g.opts||[]).join(", ")||"none"],
          ["Profile",`${SOP.name} v${SOP.version}`],["Graph",`${i+1} of ${GRAPHS.length}`]],
    actions:[{key:"3",label:"Draw the graph",cmd:"chart"},
             {key:"4",label:"Open the graphs view on the page",cmd:"open page graphs"}]})));
  return out;
}

/* ---------- 6 · Quality & forensic review: findings, grouped, with the evidence listed ---------- */
function mgViewReview(){
  const events=mgSafe(()=>reviewEventsWithoutIntegrity()||[],[]);
  if(!events.length)return [mgIt({kind:"finding",sev:"ok",pict:MG_PICT.finding,kindWord:"review",code:"QC",
    title:"No finding was raised",value:"0",unit:"findings",
    limits:`${RUNS.length} run(s) examined`,
    state:"The file, result, timeline and interpretation checks all passed on the loaded runs.",
    actions:[{key:"3",label:"Open the review view on the page",cmd:"open page review"}]})];
  const err=events.filter(e=>e.severity==="error").length,rev=events.filter(e=>e.severity==="review").length;
  const by=new Map();events.forEach(e=>{const k=e.area||"other";const l=by.get(k)||[];l.push(e);by.set(k,l);});
  const issueRows=mgSafe(()=>issueOverviewRows(issueSelectedRunIndexes()),[]),issueBy=new Map();
  issueRows.forEach(e=>{const k=e.category||"Other";const l=issueBy.get(k)||[];l.push(e);issueBy.set(k,l);});
  const out=[mgIt({kind:"summary",sev:err?"alarm":rev?"watch":"ok",pict:MG_PICT.summary,kindWord:"review",code:"QC",
    title:"Quality and forensic review",value:String(events.length),unit:"findings",
    limits:`${err} error · ${rev} review · ${by.size} area(s)`,
    state:err?`${err} finding(s) are error level: the evidence contradicts what the file claims about itself.`
      :rev?`${rev} finding(s) are for review; none is error level.`:"Every check passed.",
    evidence:[...by.keys()].slice(0,5).join(" · "),
    rows:[...by].map(([a,l])=>[a,`${l.filter(e=>e.severity==="error").length} error · ${l.filter(e=>e.severity==="review").length} review`]),
    actions:[{key:"3",label:"Open the review view on the page",cmd:"open page review"}]})];
  if(issueBy.size)out.push(mgIt({kind:"summary",sev:issueRows.some(e=>e.severity==="error")?"alarm":"watch",pict:MG_PICT.finding,kindWord:"grouped problems",code:"CAT",
    title:"Problems grouped by category",value:String(issueRows.length),unit:"finding(s)",limits:`${issueBy.size} category(ies) · ${issueSelectedRunIndexes().length} experiment(s)`,
    state:"The page can reconstruct the stored fluorescence curves for the amplification-related rows.",
    rows:[...issueBy].sort((a,b)=>b[1].length-a[1].length).map(([k,l])=>[k,`${l.length} finding(s) · ${l.filter(e=>e.severity==="error").length} error · ${new Set(l.map(e=>e.experiment)).size} experiment(s)`]),
    actions:[{key:"3",label:"Open grouped problem curves",cmd:"open page review"}]}));
  const rank=l=>l.some(e=>e.severity==="error")?0:1;
  [...by].sort((a,b)=>rank(a[1])-rank(b[1])).forEach(([area,list])=>{
    const e0=list.find(e=>e.severity==="error")||list[0];
    const errs=list.filter(e=>e.severity==="error").length;
    out.push(mgIt({kind:"finding",sev:errs?"alarm":"watch",pict:MG_PICT.finding,kindWord:"finding",
      code:errs?"ERR":"REV",title:area,value:String(list.length),unit:list.length===1?"finding":"findings",
      limits:`${errs} error · ${list.length-errs} review · expected: none`,
      state:e0.finding||"",evidence:e0.experiment||"",
      rows:list.slice(0,14).map(e=>[String(e.experiment||e.finding||"").slice(0,44),
        String(e.evidence||e.finding||"").slice(0,80)]),
      actions:[{key:"3",label:"Open the review view on the page",cmd:"open page review"}]}));
  });
  return out;
}

/* ---------- 8 · File integrity: mismatch-only, one item per line ---------- */
function mgViewIntegrity(){
  const rows=mgSafe(()=>integrityMismatches(),[]);
  if(!rows.length)return [mgIt({kind:"integrity",sev:"ok",pict:MG_PICT.file,kindWord:"file integrity",code:"INT",
    title:"No file-integrity mismatch",value:"0",unit:"mismatches",limits:`${RUNS.length} file(s) examined`,
    state:RUNS.length?"Every loaded file passed its available integrity comparisons.":"Load experiment files to check them.",
    actions:[{key:"3",label:"Open File integrity on the page",cmd:"open page integrity"}]})];
  return [mgIt({kind:"summary",sev:"alarm",pict:MG_PICT.file,kindWord:"file integrity",code:"INT",
    title:"File-integrity mismatches",value:String(rows.length),unit:rows.length===1?"mismatch":"mismatches",
    limits:`${RUNS.length} file(s) examined`,state:"Each mismatch is listed below. Stored values are unchanged.",
    rows:rows.slice(0,14).map((r,i)=>[`${i+1}. ${r.file}`,`${r.type}: ${r.actual}`]),
    actions:[{key:"3",label:"Open File integrity on the page",cmd:"open page integrity"}]})].concat(rows.map((r,i)=>mgIt({kind:"integrity",sev:"alarm",pict:MG_PICT.file,kindWord:"file integrity",code:"I"+(i+1),title:r.file,value:r.type,unit:"mismatch",limits:`expected ${r.expected}`,
    state:r.detail,evidence:`observed ${r.actual}`,rows:[["File",r.file],["Check",r.type],["Expected",r.expected],["Observed",r.actual]],actions:[{key:"3",label:"Open File integrity on the page",cmd:"open page integrity"}]})));
}

/* ---------- 7 · Open formats: the downloads themselves, one press each ---------- */
function mgViewExport(){
  const items=mgSafe(()=>exportCatalogue(),[]);
  const ready=items.filter(it=>mgSafe(()=>it.ready(),false));
  const missing=items.filter(it=>!mgSafe(()=>it.ready(),false));
  MG.exports=ready;
  const summaryActions=ready.length
    ?[{key:"3",label:"Download "+String(ready[0].title||"first format").slice(0,36),cmd:"export 0"},
      {key:"4",label:"Open the formats view on the page",cmd:"open page export"}]
    :[{key:"3",label:"Open the formats view on the page",cmd:"open page export"}];
  const out=[mgIt({kind:"export",sev:ready.length?"ok":"none",pict:MG_PICT.summary,kindWord:"downloads",code:"OUT",
    title:"Formats this data set can produce",value:String(ready.length),unit:ready.length===1?"format":"formats",
    limits:missing.length?`${missing.length} format(s) need data this experiment does not hold`:"every format is available",
    state:ready.length?"Select a format below and press Download. Sample names follow the pseudonymisation switch on the page."
      :"Nothing is loaded yet, so no download can be produced.",
    evidence:missing.length?("not available: "+missing.map(m=>m.title).slice(0,4).join(", ")):"",
    rows:ready.slice(0,14).map(it=>[it.title,String(it.note||"").slice(0,64)]),
    actions:summaryActions})];
  ready.forEach((it,i)=>out.push(mgIt({kind:"export",sev:"ok",pict:MG_PICT.export,kindWord:"download",
    code:"D"+(i+1),title:it.title,value:"",unit:"",limits:"ready",state:it.note||"",
    evidence:`download ${i+1} of ${ready.length}`,exportIndex:i,
    rows:[["Format",it.title],["Contents",String(it.note||"").slice(0,90)],
          ["Runs included",String(RUNS.length)],["Profile",`${SOP.name} v${SOP.version}`],
          ["Sample names","as set by the pseudonymisation switch"]],
    actions:[{key:"3",label:"Download this file",cmd:"export "+i}]})));
  return out;
}

const MG_VIEWS={
  load:{label:"Load files",build:mgViewLoad},
  sop:{label:"SOP",build:mgViewSop},
  results:{label:"Results",build:mgViewResults},
  panel:{label:"Control panel",build:mgViewPanel},
  graphs:{label:"Graphs",build:mgViewGraphs},
  review:{label:"Quality & forensic review",build:mgViewReview},
  export:{label:"Open formats",build:mgViewExport},
  integrity:{label:"File integrity",build:mgViewIntegrity}
};
function mgScope(tab){
  MG.scope=(MG.scope===tab)?"":tab;          /* pressing the active one returns to the attention queue */
  MG.at=0;MG.chart=false;MG.filter="";MG.zoom=1;MG.panX=0;MG.panY=0;mgSheetClose();mgRefresh();mgRender();
}
function mgScopeMark(){
  document.querySelectorAll("#mg-nav [data-tab]").forEach(b=>{
    const on=b.dataset.tab===MG.scope;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");});
}
function mgItemKey(it){return it?`${it.sev}|${it.code||""}|${it.title||""}|${it.instrument||""}|${it.variant||""}`:"";}
/* A named view replaces the attention queue rather than filtering it: every view reports
   what its part of the data set holds, so no view can end on an empty screen. */
function mgScopeFilter(all){
  const v=MG_VIEWS[MG.scope];if(!v)return all;
  let items=[];try{items=v.build()||[];}catch(e){appError("console:view",e);items=[];}
  if(!items.length)items=all;
  return items;
}
function mgRefresh(){
  const oldKey=mgItemKey(mgItem());
  const all=mgBuildQueue();
  MG.queue=MG.scope?mgScopeFilter(all):(MG.filter==="alarm"?all.filter(x=>x.sev==="alarm"):all);
  if(!MG.queue.length){
    MG.queue=MG.filter==="alarm"
      ?[mgIt({kind:"summary",sev:"ok",pict:MG_PICT.summary,kindWord:"data set",code:"OK",title:"No chart is outside a limit",
         value:String(RUNS.length),unit:RUNS.length===1?"run read":"runs read",
         state:"Nothing is outside a control or specification limit. Use the top row to read any part of the data set.",
         actions:[{key:"3",label:"Show every item",cmd:"everything"}]})]
      :all;
  }
  const same=MG.queue.findIndex(x=>mgItemKey(x)===oldKey);
  MG.at=same>=0?same:Math.min(Math.max(0,MG.at),Math.max(0,MG.queue.length-1));
}

/* Button-only console: no speech recognizer, command line, or external command adapter. */
/* ---------- open, close, keys ---------- */
function mgOpen(){
  MG.open=true;MG.filter="";mgRefresh();MG.at=0;MG.chart=false;
  document.getElementById("mg").classList.add("on");
  mgRender();
}
function mgClose(){
  MG.pending=null;MG.open=false;document.getElementById("mg").classList.remove("on");
}
function mgToggle(){MG.open?mgClose():mgOpen();}
function mgInit(){
  document.querySelectorAll("#mg-nav [data-tab]").forEach(b=>b.onclick=()=>mgScope(b.dataset.tab));
  document.addEventListener("keydown",e=>{                 /* a sheet answers the number keys */
    if(!MG.open||!MG.sheet)return;
    if(e.key==="Escape"||e.key==="0"){mgSheetClose();e.preventDefault();return;}
    if(/^[1-9]$/.test(e.key)){mgSheetPick(+e.key-1);e.preventDefault();}
  });
  document.addEventListener("keydown",e=>{                 /* without a sheet, a key presses the button that shows it */
    if(!MG.open||MG.sheet||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
    const tg=e.target,tag=tg&&tg.tagName;
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||(tg&&tg.isContentEditable))return;
    const key={"-":"−","=":"+",ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓"}[e.key]||e.key;
    const b=[...document.querySelectorAll("#mg-actions .mg-act")].find(x=>{const k=x.querySelector(".k");return k&&k.textContent.trim().split(/\s/)[0]===key;});
    if(!b)return;
    e.preventDefault();b.click();
  });
  /* the console follows the data: rebuild when a read finishes or the profile changes */
  const tick=()=>{if(MG.open){const before=MG.queue.map(mgItemKey).join("\u001f")+"|"+MG.at;mgRefresh();const after=MG.queue.map(mgItemKey).join("\u001f")+"|"+MG.at;if(before!==after)mgRender();}};
  setInterval(tick,4000);
}

/* ---------- what the page is doing: counters, tasks and the status bar ----------
   Every long operation registers a task (label, total, progress). The bar reports the
   lifecycle phase, the running task with its progress and elapsed time, the loaded and
   staged volume, the memory held, the slowest view render and the number of recorded
   faults. Counters keep their high-water mark, so a peak that has passed stays visible. */
const APP_STATS={tasks:[],notices:[],seq:0,heapPeak:0,stagedPeak:0,runsPeak:0,maxRenderMs:0,lastRender:null,lastTask:null,renders:{},started:Date.now()};
function appTaskStart(label,total,cancellable){
  const t={id:++APP_STATS.seq,label:String(label||"working"),total:Number(total)||0,done:0,t0:(performance.now?performance.now():Date.now()),
    detail:"",cancellable:!!cancellable,generation:APP_STATE.generation};
  APP_STATS.tasks.push(t);appStatusPaint();return t;
}
function appTaskStep(t,done,detail){if(!t)return;t.done=done==null?t.done+1:done;if(detail)t.detail=String(detail);}
function appTaskEnd(t,note){
  if(!t)return;const i=APP_STATS.tasks.indexOf(t);if(i>=0)APP_STATS.tasks.splice(i,1);
  t.ms=(performance.now?performance.now():Date.now())-t.t0;if(note)t.note=note;
  APP_STATS.lastTask={label:t.label,ms:t.ms,note:t.note||"",at:new Date().toISOString()};appStatusPaint();
}
function appTaskWrap(names){names.forEach(n=>{const f=window[n];if(typeof f!=="function"||f.__wrapped)return;
  const w=async function(...a){const t=appTaskStart(APP_TASK_LABEL[n]||n,0,false);try{return await f.apply(this,a);}
    catch(e){appError("task:"+n,e);throw e;}finally{appTaskEnd(t);}};
  w.__wrapped=true;window[n]=w;});}
const APP_TASK_LABEL={ccZipAll:"Building the control-chart archive",graphAllZip:"Building the graph archive",
  bundleZip:"Building the export bundle",instrumentZip:"Building the instrument-record archive",
  downloadWebsiteArchive:"Building the page archive",sopZip:"Building the SOP bundle"};
function appHeapMB(){try{const m=performance.memory;return m?m.usedJSHeapSize/1048576:NaN;}catch(e){return NaN;}}
function appStagedBytes(){try{return STAGED.reduce((a,x)=>a+((x&&x.bytes&&x.bytes.length)||0),0);}catch(e){return 0;}}
function appNotice(area,message){
  /* Operator actions and ordinary limits are recorded, but they are not faults. */
  APP_STATS.notices.push({time:new Date().toISOString(),area:String(area),message:String(message)});
  if(APP_STATS.notices.length>20)APP_STATS.notices.splice(0,APP_STATS.notices.length-20);
  appStatusPaint();
}
function appCancel(){
  if(!APP_STATS.tasks.some(t=>t.cancellable))return;
  APP_STATE.cancelRequested=true;APP_STATE.generation++;            /* the running loops test this token and stop */
  appNotice("operator","the operation was stopped from the status bar");
}
function appReadSuperseded(msg){
  /* A read that is overtaken (new selection or Stop) must not leave half a data set behind. */
  const stopped=APP_STATE.cancelRequested;APP_STATE.cancelRequested=false;
  RUNS=[];PASTED=null;PSEUDO_MAP=null;
  ["load","sop","results","panel","graphs","review","export","integrity"].forEach(t=>markDirty(t));
  if(msg)msg.innerHTML=`<div class="notice warn">${esc(stopped?"The read was stopped. Nothing from it is loaded.":"The read was replaced by a newer selection. Nothing from it is loaded.")}</div>`;
  setPhase(STAGED.length?"staged":"idle","read superseded");
}
const APP_PHASE_TEXT={boot:"Starting",booting:"Starting",idle:"Ready — no files read",staging:"Staging files",
  staged:"Files staged, not read",reading:"Reading files",ready:"Ready"};
function appFmtMs(ms){return ms<1000?Math.round(ms)+" ms":(ms/1000).toFixed(ms<10000?1:0)+" s";}
function appFmtMB(mb){return !isFinite(mb)?"—":(mb>=1024?(mb/1024).toFixed(2)+" GB":mb.toFixed(mb<10?1:0)+" MB");}
function appStatusSnapshot(){
  const heap=appHeapMB(),staged=appStagedBytes()/1048576;
  if(isFinite(heap))APP_STATS.heapPeak=Math.max(APP_STATS.heapPeak,heap);
  APP_STATS.stagedPeak=Math.max(APP_STATS.stagedPeak,staged);APP_STATS.runsPeak=Math.max(APP_STATS.runsPeak,RUNS.length);
  const task=APP_STATS.tasks[APP_STATS.tasks.length-1]||null;
  return {version:APP_VERSION,phase:APP_STATE.phase,activeTab:APP_STATE.activeTab,generation:APP_STATE.generation,
    runs:RUNS.length,wells:RUNS.reduce((a,r)=>a+(r.wells?r.wells.length:0),0),
    staged:STAGED.length,stagedMB:staged,heapMB:heap,heapPeakMB:APP_STATS.heapPeak,
    historyRows:(typeof CC_STATE==="object"&&CC_STATE&&CC_STATE.imported?CC_STATE.imported.length:0),
    task:task?{label:task.label,detail:task.detail,done:task.done,total:task.total,
      ms:(performance.now?performance.now():Date.now())-task.t0,cancellable:task.cancellable}:null,
    lastTask:APP_STATS.lastTask,lastRender:APP_STATS.lastRender,maxRenderMs:APP_STATS.maxRenderMs,
    faults:APP_STATE.errorLog.length,lastError:APP_STATE.lastError,limits:APP_STATE.limits};
}
function renderConsoleIdentity(snapshot){
  const d=snapshot||appStatusSnapshot(),mode=APP_PHASE_TEXT[d.phase]||d.phase;
  const glyph=d.faults?"▲":d.phase==="ready"?"●":d.phase==="reading"||d.phase==="staging"?"△":"○";
  const instruments=[...new Set(RUNS.map(r=>r.instrument||r.platform).filter(Boolean))];
  const summary=d.runs?`${d.runs.toLocaleString()} run(s) · ${d.wells.toLocaleString()} result(s) · ${instruments.length||1} instrument group(s)`:"Load experiment files to begin.";
  const p=typeof SOP!=="undefined"&&SOP?`SOP: ${SOP.name||"unnamed"} v${SOP.version||"?"}${SOP.sha256?` · ${SOP.sha256.slice(0,8)}…`:" · active"}`:"SOP: no profile applied";
  const modeEl=$("#console-mode-text"),glyphEl=$("#console-mode-glyph"),sumEl=$("#console-data-summary"),profileEl=$("#console-profile");
  if(modeEl)modeEl.textContent=d.faults?`${mode} — with faults`:mode;
  if(glyphEl){glyphEl.textContent=glyph;glyphEl.className=`state-glyph ${d.faults?"state-alarm":d.phase==="ready"?"state-ok":d.phase==="reading"||d.phase==="staging"?"state-watch":"state-unknown"}`;}
  if(sumEl)sumEl.textContent=summary;
  if(profileEl)profileEl.textContent=p;
}
let APP_SB_LAST="";
function appStatusPaint(){
  const bar=document.getElementById("statusbar");if(!bar)return;
  try{
    const d=appStatusSnapshot(),busy=!!d.task||d.phase==="reading"||d.phase==="staging";
    renderConsoleIdentity(d);
    if(typeof MG!=="undefined"&&MG.open)mgStatusPaint();
    const parts=[];
    if(d.task){
      const pct=d.task.total?Math.min(100,Math.round(100*d.task.done/d.task.total)):0;
      const left=d.task.total&&d.task.done?(d.task.ms/d.task.done)*(d.task.total-d.task.done):0;
      parts.push(`<b>${esc(d.task.label)}</b>${d.task.total?` ${d.task.done} / ${d.task.total}`:""}`
        +`${d.task.detail?` · ${esc(d.task.detail.length>46?d.task.detail.slice(0,44)+"…":d.task.detail)}`:""} · ${appFmtMs(d.task.ms)}`
        +`${left>900?` · about ${appFmtMs(left)} left`:""}`);
      const pb=document.getElementById("sb-progress");pb.hidden=!d.task.total;pb.firstElementChild.style.width=pct+"%";
    }else{
      parts.push(`<b>${esc(APP_PHASE_TEXT[d.phase]||d.phase)}</b>`);
      document.getElementById("sb-progress").hidden=true;
    }
    const load=[];
    if(d.runs)load.push(`${d.runs} run(s), ${d.wells.toLocaleString()} stored result(s)`);
    if(d.staged)load.push(`${d.staged} file(s) staged, ${appFmtMB(d.stagedMB)} held`);
    if(d.historyRows)load.push(`${d.historyRows} history row(s)`);
    if(isFinite(d.heapMB))load.push(`memory ${appFmtMB(d.heapMB)}`);
    if(d.lastRender)load.push(`${esc(d.lastRender.tab)} drawn in ${appFmtMs(d.lastRender.ms)}`);
    document.getElementById("sb-state").innerHTML=parts.join(" ");
    document.getElementById("sb-load").innerHTML=load.length?`<span class="sb-sep">|</span> ${load.join(' <span class="sb-sep">·</span> ')}`:"";
    const note=APP_STATS.notices[APP_STATS.notices.length-1];
    document.getElementById("sb-faults").innerHTML=(d.faults?`<span class="sb-fault">${d.faults} fault(s) recorded</span>`:"no faults")
      +(note&&!busy?` <span class="sb-sep">·</span> ${esc(note.message)}`:"");
    document.getElementById("sb-cancel").hidden=!(d.task&&d.task.cancellable);
    bar.classList.toggle("busy",busy);bar.classList.toggle("fault",!!d.faults&&!busy);
    if(bar.classList.contains("open")){
      const rows=[["Lifecycle phase",esc(d.phase)],["Open view",esc(d.activeTab)],["Import generation",d.generation],
        ["Runs loaded",`${d.runs} (peak ${APP_STATS.runsPeak})`],["Stored results",d.wells.toLocaleString()],
        ["Files staged",`${d.staged}, ${appFmtMB(d.stagedMB)} held (peak ${appFmtMB(APP_STATS.stagedPeak)})`],
        ["History rows imported",d.historyRows],
        ["Memory in use",`${appFmtMB(d.heapMB)} (peak ${appFmtMB(d.heapPeakMB)})`],
        ["Slowest view render",APP_STATS.maxRenderMs?appFmtMs(APP_STATS.maxRenderMs):"—"],
        ["Last finished operation",d.lastTask?`${esc(d.lastTask.label)} — ${appFmtMs(d.lastTask.ms)}`:"—"],
        ["Limits in force",`${d.limits.maxFiles} files · ${(d.limits.maxBytes/1073741824).toFixed(0)} GiB staged · ${APP_LIMITS.maxWellsPerRun.toLocaleString()} wells per run · ${APP_LIMITS.maxFaults} recorded faults`]];
      const notes=APP_STATS.notices.slice(-3).reverse().map(e=>`<tr><td class="k">${esc(e.time.slice(11,19))}</td><td>${esc(e.area)}: ${esc(e.message)}</td></tr>`).join("");
      const faults=APP_STATE.errorLog.slice(-5).reverse().map(e=>`<tr><td class="k">${esc(e.time.slice(11,19))}</td><td class="sb-fault">${esc(e.area)}: ${esc(e.message)}</td></tr>`).join("");
      document.getElementById("sb-detail").innerHTML=`<table>${rows.map(r=>`<tr><td class="k">${r[0]}</td><td>${r[1]}</td></tr>`).join("")}
        ${notes?`<tr><td class="k">Recent notices</td><td><table>${notes}</table></td></tr>`:""}
        ${faults?`<tr><td class="k">Last faults</td><td><table>${faults}</table></td></tr>`:""}</table>`;
    }
  }catch(e){/* the status bar must never stop the page */}
}
function appStatusReport(){
  const d=appStatusSnapshot();
  return JSON.stringify({schema:"qpcr-status-report/1",written:new Date().toISOString(),
    page:{title:document.title,version:APP_VERSION,language:(typeof UI_LANG!=="undefined"?UI_LANG:"en")},
    status:d,renders:APP_STATS.renders,notices:APP_STATS.notices,faults:APP_STATE.errorLog},null,1);
}
function appStatusInit(){
  const bar=document.getElementById("statusbar");if(!bar)return;
  document.getElementById("sb-toggle").onclick=e=>{bar.classList.toggle("open");
    e.target.setAttribute("aria-expanded",bar.classList.contains("open")?"true":"false");appStatusPaint();};
  document.getElementById("sb-cancel").onclick=appCancel;
  document.getElementById("sb-save").onclick=()=>download("qpcr_status_report.json",appStatusReport(),"application/json");
  appTaskWrap(Object.keys(APP_TASK_LABEL));
  const cb=document.getElementById("sb-console");if(cb)cb.onclick=mgToggle;
  mgInit();
  setInterval(()=>{if(!document.hidden)appStatusPaint();},500);
  appStatusPaint();
}
let RUNS=[];           /* decoded runs: .ixo and .eds share one model */
let PASTED=null;       /* {rows:[{well,sample,cq}], source} from the CSV route */
let INHIB=null;        /* last inhibition assignment + result */

function tag(cls,text){return `<span class="tag ${cls}">${esc(ui(text))}</span>`;}
function table(cols,rows,opts){
  const o=opts||{};
  const head=cols.map(c=>`<th class="${c.n?"n":""}">${esc(ui(c.label))}</th>`).join("");
  const body=rows.map(r=>"<tr>"+cols.map(c=>{
    const v=r[c.key];
    return `<td class="${c.n?"n":""}">${c.html?(v==null?"":v):esc(v==null?"":v)}</td>`;
  }).join("")+"</tr>").join("");
  return `<table>${o.nohead?"":`<thead><tr>${head}</tr></thead>`}<tbody>${body}</tbody></table>`;
}
function download(name,text,mime){
  const blob=text instanceof Uint8Array?new Blob([text],{type:mime||"application/octet-stream"})
    :new Blob([text],{type:(mime||"text/plain")+";charset=utf-8"});
  const u=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),4000);
}
function websiteSource(lang){
  const source=CLEAN_PAGE_SOURCE||("<!doctype html>\n"+document.documentElement.outerHTML);
  return source.replace(/const DEFAULT_LANG="(?:en|zh)";/,`const DEFAULT_LANG="${lang==="zh"?"zh":"en"}";`);
}
function makeWebsiteArchive(lang){
  const zh=lang==="zh",name=zh?"qPCR_QC_Forensics_中文.html":"qPCR_QC_Forensics_English.html";
  const readme=zh
    ?"qPCR 原始数据、质量控制与取证导出工具（LightCycler 480 .ixo 与 QuantStudio 3/5 .eds）\n\n解压后双击 HTML 文件即可离线使用。数据只在浏览器本机处理中，不会上传。\n中文术语依据 Roche LightCycler 480 实时荧光定量PCR仪操作说明书（软件版本 1.5）及 QuantStudio 软件的通用术语。\n"
    :"qPCR raw values, quality-control and forensic export tool (LightCycler 480 .ixo and QuantStudio 3/5 .eds)\n\nExtract the archive and open the HTML file in a browser. It works offline and does not upload experiment data.\n";
  return makeStoredZip([{name,data:websiteSource(zh?"zh":"en")},{name:zh?"使用说明.txt":"README.txt",data:readme}]);
}
function downloadWebsiteArchive(lang){
  download(lang==="zh"?"qPCR_QC_Forensics_Chinese_website.zip":"qPCR_QC_Forensics_English_website.zip",
    makeWebsiteArchive(lang),"application/zip");
}
function csvq(v){
  const s=v==null?"":String(v);
  return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
}
function toCSV(cols,rows){
  return [cols.map(c=>csvq(c.label)).join(","),
    ...rows.map(r=>cols.map(c=>csvq(r[c.key])).join(","))].join("\n")+"\n";
}
function stamp(){return new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");}
function baseName(){
  if(RUNS.length===1)return safeName(RUNS[0].meta.name||RUNS[0].file.replace(/\.(ixo|eds|edt)$/i,""));
  if(RUNS.length>1)return `${RUNS.length}_runs_${stamp()}`;
  return "cq_values";
}

