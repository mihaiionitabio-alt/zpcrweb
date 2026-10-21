/* ============================================================
   Microgravity console
   ------------------------------------------------------------
   Designed for an operator who cannot point precisely: no hover, no drag,
   no double click, no small dismiss control. One item is on screen at a time,
   taken from a priority queue built from the same findings the other views
   show. Every action is a large, labelled button, with numbered options in the
   chart sheets for fast keyboard selection.
   ============================================================ */
const MG={open:false,queue:[],at:0,chart:false,theme:"light",pending:null,scope:"",sheet:null,run:0,exports:[],zoom:1,panX:0,panY:0};
const MG_GLYPH={alarm:"▲",watch:"△",ok:"●",none:"○"};
const MG_WORD={alarm:"outside limits",watch:"watch",ok:"in control",none:"no limits yet"};

/* ---------- the attention queue: what deserves the screen, in order ---------- */
function mgBuildQueue(){
  const q=[];
  if(!RUNS.length&&!PASTED){
    const staged=Array.isArray(STAGED)&&STAGED.length;
    q.push({kind:"intake",sev:"none",code:"",title:staged?"Files staged, ready to read":"No experiment files are loaded",
      value:staged?String(STAGED.length):"0",unit:staged?"files staged":"files",limits:"",
      state:staged?"The files passed intake. Read them to decode runs and build the views.":"Load .ixo or .eds files to begin.",
      evidence:"",actions:staged
        ?[{key:"3",label:"Read staged files",cmd:"read files"},{key:"4",label:"Choose another selection",cmd:"choose files"}]
        :[{key:"3",label:"Choose experiment files",cmd:"choose files"}]});
    return q;
  }
  /* A pasted Cq table has results but no decoded runs, charts or instrument history. */
  if(!RUNS.length&&PASTED){
    const n=Array.isArray(PASTED.rows)?PASTED.rows.length:0;
    q.push({kind:"results",sev:"none",code:"CSV",title:"Pasted Cq table loaded",value:String(n),unit:n===1?"Cq value":"Cq values",
      limits:"curves and instrument charts unavailable",state:"Use the Results view to inspect the pasted table; file-based forensic and control-chart views need decoded experiment files.",
      evidence:PASTED.source||"pasted data",actions:[{key:"3",label:"Open the results view",cmd:"results"}]});
    return q;
  }
  /* 1. errors first: integrity and decode */
  let events=[];try{events=reviewForensicEvents()||[];}catch(e){appError("console:events",e);}
  const errs=events.filter(e=>e.severity==="error"&&String(e.area||"").toLowerCase()!=="integrity"&&!/^Control chart/i.test(String(e.area||"")));
  const byArea=new Map();errs.forEach(e=>{const k=e.area||"other";byArea.set(k,(byArea.get(k)||[]).concat(e));});
  byArea.forEach((list,area)=>{
    q.push({kind:"finding",sev:"alarm",code:"ERR",title:area,value:String(list.length),unit:list.length===1?"finding":"findings",
      limits:"expected: none",state:list[0].finding||"",evidence:(list[0].evidence||"")+(list.length>1?`  (+${list.length-1} more of the same kind)`:""),
      run:list[0].experiment||"",actions:[{key:"3",label:"Open the review view",cmd:"review"}]});
  });
  /* 2. control charts of the selected instrument: limit alarms, then patterns */
  try{
    const insts=ccInstruments();
    if(insts.length){
      const key=CC_STATE.instrument&&insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0].key;
      const rows=ccRowsFor(key),pf=rows.length?rows[0].platform:"LC";
      const items=[];
      CC_CHARTS.filter(d=>d.inst.includes(pf)).forEach(d=>{
        const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
        const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{
          let res;try{res=ccCompute(d,rows,v);}catch(e){return;}
          const st=ccStatus(res);if(st.level!=="bad"&&st.level!=="warn")return;
          const pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre),last=pts[pts.length-1];
          if(!last)return;
          const lim=Number.isFinite(last.lcl)&&Number.isFinite(last.ucl)
            ? `limits ${fmtTick(+last.lcl.toPrecision(4))} – ${fmtTick(+last.ucl.toPrecision(4))}`:"no limits yet";
          const sp=res.spec||{},spec=[Number.isFinite(sp.lo)?`≥ ${fmtTick(sp.lo)}`:"",Number.isFinite(sp.hi)?`≤ ${fmtTick(sp.hi)}`:""].filter(Boolean).join(" and ");
          items.push({kind:"chart",sev:st.level==="bad"?"alarm":"watch",code:d.code,title:d.title+(v?" · "+v:""),
            value:fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4)),unit:d.unit||"",
            limits:lim+(spec?`  ·  specification ${spec}`:""),state:st.text,
            evidence:`${key} · ${pts.length} run(s) in this chart · last run ${last.row&&last.row.date?sopFmtTime(last.row.date).slice(0,10):"unknown date"}`,
            chartId:d.id,variant:v,instrument:key,
            actions:[{key:"3",label:MG.chart?"Hide the chart":"Show the chart",cmd:"chart"}]});
        });
      });
      items.sort((a,b)=>(a.sev==="alarm"?0:1)-(b.sev==="alarm"?0:1));
      q.push(...items);
    }
  }catch(e){appError("console:queue",e);}
  /* 3. what the run acceptance says */
  try{
    const ev=sopEvaluateAll(),rej=ev.filter(e=>e.accept&&e.accept.ok===false);
    if(rej.length)q.push({kind:"results",sev:"alarm",code:"SOP",title:"Runs rejected by the profile",value:String(rej.length),unit:rej.length===1?"run":"runs",
      limits:`of ${ev.length} run(s) read`,state:(rej[0].accept&&rej[0].accept.reasons||[]).join("; ")||"see the results view",
      evidence:rej.map(r=>runName(r.run)).slice(0,3).join(", "),actions:[{key:"3",label:"Open the results view",cmd:"results"}]});
  }catch(e){appError("console:sop-queue",e);}
  /* 4. how much of the panel cannot judge anything yet */
  try{
    const insts=ccInstruments();
    if(insts.length){
      const key=CC_STATE.instrument&&insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0].key;
      const rows=ccRowsFor(key),pf=rows.length?rows[0].platform:"LC";
      let none=0,total=0;
      CC_CHARTS.filter(d=>d.inst.includes(pf)).forEach(d=>{const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
        const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{total++;
          try{if(ccStatus(ccCompute(d,rows,v)).level==="none")none++;}catch(e){}});});
      if(none)q.push({kind:"baseline",sev:"none",code:"BASE",title:"Charts still collecting a baseline",value:String(none),unit:`of ${total}`,
        limits:`a chart needs ${ccBaselineNeed(ccCfg("heat_rate"))} runs before it has limits`,
        state:`${rows.length} run(s) are in this instrument's history. Until a chart has its baseline it can raise no alarm.`,
        evidence:key,actions:[]});
    }
  }catch(e){appError("console:baseline-queue",e);}
  /* 5. chart gallery: keep usable charts in the console even when no alarm exists. */
  try{
    const insts=ccInstruments();
    if(insts.length){
      const key=CC_STATE.instrument&&insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0].key;
      const rows=ccRowsFor(key),pf=rows.length?rows[0].platform:"LC",seen=new Set(q.filter(x=>x.chartId).map(x=>x.chartId+"|"+(x.variant||"")));
      const gallery=[];
      CC_CHARTS.filter(d=>d.inst.includes(pf)).forEach(d=>{
        const cfg=ccCfg(d.id);if(cfg.enabled===false)return;
        const vs=ccVariants(d,rows);(vs.length?vs:[""]).forEach(v=>{
          const id=d.id+"|"+v;if(seen.has(id))return;
          try{
            const res=ccCompute(d,rows,v),st=ccStatus(res),pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre),last=pts[pts.length-1];
            if(!last)return;
            const lim=Number.isFinite(last.lcl)&&Number.isFinite(last.ucl)?`limits ${fmtTick(+last.lcl.toPrecision(4))} – ${fmtTick(+last.ucl.toPrecision(4))}`:"no limits yet";
            gallery.push({kind:"chart",sev:st.level==="ok"?"ok":"none",code:d.code,title:d.title+(v?" · "+v:""),
              value:fmtTick(+Number(st.last!==undefined?st.last:last.y).toPrecision(4)),unit:d.unit||"",limits:lim,state:st.level==="ok"?"In control. Select Show chart to inspect the trend and limits.":"Data available; this chart is still building its baseline.",
              evidence:`${key} · ${pts.length} run(s) · chart gallery`,chartId:d.id,variant:v,instrument:key,
              actions:[{key:"3",label:"Show chart",cmd:"chart"}]});
            seen.add(id);
          }catch(e){appError("console:gallery",e);}
        });
      });
      q.push(...gallery);
    }
  }catch(e){appError("console:gallery",e);}
  /* 6. everything is in order: report the data set rather than an empty screen */
  if(!q.length)q.push({kind:"summary",sev:"ok",pict:MG_PICT.summary,kindWord:"data set",code:"OK",
    title:"All checks passed",value:String(RUNS.length),unit:RUNS.length===1?"run read":"runs read",
    limits:`${RUNS.reduce((a,r)=>a+((r.wells||[]).length),0).toLocaleString()} stored results · profile ${SOP.name}`,
    state:"Every chart with limits is in control and no error-level finding is open. Use the top row to read any part of the data set.",
    evidence:uniq(RUNS.map(r=>(r.meta&&r.meta.InstrumentName)||r.platform||"instrument")).join(" · "),
    rows:[["Runs",String(RUNS.length)],["Stored results",RUNS.reduce((a,r)=>a+((r.wells||[]).length),0).toLocaleString()],
          ["Profile",`${SOP.name} v${SOP.version}`],["Instruments",String(mgSafe(()=>ccInstruments().length,0))]],
    actions:[]});
  return q;
}

/* ---------- rendering: one item, large ---------- */
function mgItem(){return MG.queue[MG.at]||null;}
const MG_TYPE_LABEL={i:"Individuals (I)",ewma:"EWMA",cusum:"CUSUM",trend:"Trend / forecast",xbars:"X̄–S",p:"p-chart",u:"u-chart",c:"c-chart",funnel:"Funnel"};
function mgChartTypeOptions(it){
  const def=it&&it.chartId?CC_BY_ID[it.chartId]:null;if(!def)return [];
  const types=def.type==="funnel"?["funnel"]:["p","u","c"].includes(def.type)?[def.type]:def.type==="xbars"?["xbars","i","ewma","cusum","trend"]:["i","ewma","cusum","trend"];
  const current=ccCfg(def.id).type||def.type;return types.map(value=>({value,label:MG_TYPE_LABEL[value]||value,current:value===current}));
}
function mgChartAxisOptions(it){
  const def=it&&it.chartId?CC_BY_ID[it.chartId]:null;if(!def||def.type==="funnel")return [];
  const rows=ccRowsFor(it.instrument),current=ccCfg(def.id).x||def.x||"order",out=[{value:"order",label:"Run order"}];
  if(rows.some(r=>Number.isFinite(r.date)))out.push({value:"date",label:"Date"});
  if(rows.length)out.push({value:"hours",label:"Cumulative hours"});
  if(rows.some(r=>Number.isFinite(r.block_cycles)))out.push({value:"cycles",label:"Block cycles"});
  return out.map(o=>Object.assign(o,{current:o.value===current}));
}
function mgStatusPaint(){
  if(!MG.open)return;
  const d=appStatusSnapshot();
  const state=(APP_PHASE_TEXT&&APP_PHASE_TEXT[d.phase])||d.phase||"Ready — no files read";
  const mem=isFinite(d.heapMB)?appFmtMB(d.heapMB):"—";
  const last=d.lastRender&&d.lastRender.ms!=null?`${d.lastRender.tab||"view"} drawn in ${appFmtMs(d.lastRender.ms)}`:"export drawn in —";
  const a=$("#mg-sb-state"),b=$("#mg-sb-load"),c=$("#mg-sb-render");
  if(a)a.textContent=state;if(b)b.textContent=`memory ${mem}`;if(c)c.textContent=last;
  const dot=$("#mg-statusbar .mg-sb-dot");if(dot)dot.style.background=d.faults?"#ff5252":d.phase==="ready"?"#37d67a":"#ffb020";
}

function mgRenderBase(){
  if(!MG.open)return;
  const it=mgItem(),root=document.getElementById("mg");
  const d=appStatusSnapshot();
  document.getElementById("mg-mode-text").textContent=(APP_PHASE_TEXT&&APP_PHASE_TEXT[d.phase])||d.phase;
  document.getElementById("mg-facts").innerHTML=RUNS.length
    ?`<b class="mg-num">${d.runs}</b> runs · <b class="mg-num">${d.wells.toLocaleString()}</b> results · profile <b>${esc(SOP.name)}</b>`
    :PASTED
      ?`<b class="mg-num">${Array.isArray(PASTED.rows)?PASTED.rows.length:0}</b> pasted Cq values · file charts unavailable`
      :`no data loaded`;
  root.classList.remove("sev-alarm","sev-watch","sev-none");
  if(it)root.classList.add("sev-"+(it.sev==="ok"?"ok":it.sev));
  root.classList.remove("theme-light","theme-dark");root.classList.add("theme-"+(MG.theme||"light"));
  const card=document.getElementById("mg-card");
  card.className=(it?it.sev:"")+((MG.chart&&it&&it.chartId)?" with-chart":"");
  const alarms=MG.queue.filter(x=>x.sev==="alarm").length,watch=MG.queue.filter(x=>x.sev==="watch").length;
  const view=MG_VIEWS[MG.scope];
  document.getElementById("mg-count").textContent=
    `${view?view.label:"Attention"}  ·  item ${MG.at+1} of ${MG.queue.length}  ·  ${alarms} outside limits  ·  ${watch} to watch`;
  document.getElementById("mg-glyph").textContent=it?MG_GLYPH[it.sev]:"";
  document.getElementById("mg-pict").textContent=(it&&it.pict)||MG_PICT.summary;
  document.getElementById("mg-kind").textContent=(it&&(it.kindWord||MG_WORD[it.sev]))||"";
  document.getElementById("mg-code").textContent=it?it.code:"";
  document.getElementById("mg-title").textContent=it?it.title:"";
  document.getElementById("mg-value").innerHTML=it&&it.value!==""?`${esc(it.value)}${it.unit?`<span class="unit">${esc(it.unit)}</span>`:""}`:"";
  document.getElementById("mg-limits").textContent=it?it.limits:"";
  document.getElementById("mg-state").textContent=it?it.state:"";
  document.getElementById("mg-evidence").textContent=it?(it.evidence||""):"";
  document.getElementById("mg-rows").innerHTML=(it&&it.rows&&it.rows.length)
    ?it.rows.map(r=>`<div class="r"><b>${esc(String(r[0]))}</b><span>${esc(String(r[1]))}</span></div>`).join("")
    :"";
  const ch=document.getElementById("mg-chart");
  const charting=!!(MG.chart&&it&&(it.chartId||it.graphId));
  ch.classList.toggle("on",charting);root.classList.toggle("charting",charting);
  if(charting&&it.chartId){
    try{const rows=ccRowsFor(it.instrument),def=CC_BY_ID[it.chartId],res=ccCompute(def,rows,it.variant||"");
      mgStageSet(ccChartSvg(res,`${def.code} ${def.title}${it.variant?" · "+it.variant:""}`));}
    catch(e){mgStageSet("");appError("console:chart",e);}
  }else if(charting&&it.graphId){
    try{const g=GRAPHS.find(x=>x.id===it.graphId);
      const res=g?g.render(mgGraphCtx(g,it.runIndex||0)):null;
      mgStageSet(`<div id="mg-gcap">${esc(it.title)} · ${esc(it.limits)}</div>`+((res&&res.svg)||""));}
    catch(e){mgStageSet(`<p style="font-size:20px;padding:18px">This graph could not be drawn from the loaded run: ${esc(e.message)}</p>`);appError("console:graph",e);}
  }
  /* Buttons are the only console interaction. Chart mode gets its own full-screen controls. */
  /* One button each: the options open as a sheet, so the action row keeps its height. */
  const onChart=charting&&it&&it.chartId;
  const curType=onChart?(mgChartTypeOptions(it).find(o=>o.current)||{}).label:"";
  const curAxis=onChart?(mgChartAxisOptions(it).find(o=>o.current)||{}).label:"";
  const typeActs=onChart&&mgChartTypeOptions(it).length>1?[{key:"4",label:"Chart type · "+curType,cmd:"chart type",cls:"sheet"}]
    :(charting&&it&&it.graphId&&RUNS.length>1?[{key:"4",label:"Next run · "+runName(RUNS[Math.min(it.runIndex||0,RUNS.length-1)]).slice(0,26),cmd:"next run"}]:[]);
  const axisActs=onChart&&mgChartAxisOptions(it).length>1?[{key:"5",label:"X axis · "+curAxis,cmd:"x axis",cls:"sheet"}]:[];
  const rawActs=MG.pending
    ?[{key:"1",label:"Confirm "+MG.pending.id,cmd:"confirm",cls:"primary"},{key:"2",label:"Cancel",cmd:"cancel"},
      {key:"0",label:"Leave the console",cmd:"exit"}]
    :charting
      ?[{key:"1",label:onChart?"Previous chart":"Previous graph",cmd:onChart?"chart previous":"previous",cls:"primary"},
        {key:"2",label:onChart?"Next chart":"Next graph",cmd:onChart?"chart next":"next",cls:"primary"},
        {key:"3",label:onChart?"Close chart":"Close graph",cmd:"chart close"},
        ...typeActs,...axisActs,
        {key:"−",label:"Zoom out",cmd:"zoom out"},
        {key:"⟲",label:`Reset view · ${Math.round((Number.isFinite(MG.zoom)?MG.zoom:1)*100)}%`,cmd:"zoom reset"},
        {key:"+",label:"Zoom in",cmd:"zoom in"},
        {key:"←",label:"Pan left",cmd:"pan left"},{key:"→",label:"Pan right",cmd:"pan right"},{key:"↑",label:"Pan up",cmd:"pan up"},{key:"↓",label:"Pan down",cmd:"pan down"},
        {key:"8",label:"Light theme",cmd:"theme light"},
        {key:"9",label:"Dark theme",cmd:"theme dark"},
        {key:"0",label:"Return to the page",cmd:"exit"}]
      :[{key:"1",label:"Next",cmd:"next",cls:"primary"},{key:"2",label:"Previous",cmd:"previous"}]
        .concat((it&&it.actions||[]).map(a=>Object.assign({},a)))
        .concat([{key:"0",label:"Return to the page",cmd:"exit"}]);
  const seenKeys=new Set(),acts=rawActs.filter(a=>{if(seenKeys.has(a.key))return false;seenKeys.add(a.key);return true;});
  document.getElementById("mg-actions").innerHTML=acts.map(a=>
    `<button class="mg-act ${a.cls||""}" data-cmd="${esc(a.cmd)}" title="${esc(/^[0-9]$/.test(String(a.key))?"press "+a.key:a.label)}">
       <span class="k">${esc(a.key)}${/^[0-9]$/.test(String(a.key))?"  ·  key":""}</span><span class="l">${esc(a.label)}</span></button>`).join("");
  document.querySelectorAll("#mg-actions .mg-act").forEach(b=>b.onclick=()=>mgCommand(b.dataset.cmd,"button"));
  mgScopeMark();
  document.getElementById("mg-body").scrollTop=0;
  mgApplyChartView();mgStatusPaint();
}
function mgRender(...args){return MISSY_HOOKS.invoke("mgRender",this,args,mgRenderBase);}


/* ---------- option sheets: one question, large targets, number-addressable ---------- */
function mgSheet(kind){
  const it=mgItem(),box=document.getElementById("mg-sheet");
  if(!it||!it.chartId)return;
  const opts=kind==="type"?mgChartTypeOptions(it):mgChartAxisOptions(it);
  if(opts.length<2)return;
  MG.sheet={kind,opts};
  document.getElementById("mg-sheet-title").textContent=kind==="type"?"Chart type":"X axis";
  document.getElementById("mg-sheet-list").innerHTML=opts.map((o,i)=>
    `<button data-i="${i}" class="${o.current?"current":""}">
       <span class="k">${i+1} · select${o.current?" · in use":""}</span>
       <span class="l">${esc(o.label)}</span></button>`).join("");
  document.querySelectorAll("#mg-sheet-list button").forEach(b=>b.onclick=()=>mgSheetPick(+b.dataset.i));
  box.hidden=false;
  const first=document.querySelector("#mg-sheet-list button");if(first)first.focus();
}
function mgSheetPick(i){
  const st=MG.sheet;if(!st||!st.opts[i])return;
  const v=st.opts[i].value;mgSheetClose();
  if(st.kind==="type")mgSetChartType(v);else mgSetChartAxis(v);
  mgRender();
}
function mgSheetClose(){MG.sheet=null;const b=document.getElementById("mg-sheet");if(b)b.hidden=true;}
function mgItemSentence(it){
  if(!it)return "Nothing to report.";
  const sev=MG_WORD[it.sev]||"";
  return `${it.code?it.code+". ":""}${it.title}. ${it.value?it.value+" "+(it.unit||"")+". ":""}${sev}. ${it.state||""}`;
}

/* ---------- the command grammar ----------
   One table: the phrase, what it does, whether it must be confirmed.
   Recognisers, the keyboard and the buttons all go through mgCommand(). */
/* One viewport (#mg-chart), one transformed stage (#mg-chart-stage).
   Every chart write goes through mgStageSet so a redraw cannot orphan the
   transform, and the zoom survives a change of chart, graph, type or run. */
function mgStage(){
  const ch=document.getElementById("mg-chart");if(!ch)return null;
  let st=document.getElementById("mg-chart-stage");
  if(!st||st.parentNode!==ch){st=document.createElement("div");st.id="mg-chart-stage";ch.innerHTML="";ch.appendChild(st);}
  return st;
}
function mgStageSet(html){const st=mgStage();if(st)st.innerHTML=html||"";mgApplyChartView();}
function mgApplyChartView(){
  const st=document.getElementById("mg-chart-stage");if(!st)return;
  if(!Number.isFinite(MG.zoom)||MG.zoom<=0)MG.zoom=1;
  if(!Number.isFinite(MG.panX))MG.panX=0;
  if(!Number.isFinite(MG.panY))MG.panY=0;
  st.style.transform=`translate(${MG.panX}px,${MG.panY}px) scale(${MG.zoom})`;
  st.style.transformOrigin="center center";
}
function mgZoom(kind){
  const z=Number.isFinite(MG.zoom)&&MG.zoom>0?MG.zoom:1;
  if(kind==="in")MG.zoom=Math.min(5,+(z*1.25).toFixed(3));
  else if(kind==="out")MG.zoom=Math.max(.5,+(z/1.25).toFixed(3));
  else {MG.zoom=1;MG.panX=0;MG.panY=0;}
  mgApplyChartView();
}
function mgPan(dx,dy){MG.panX=Math.max(-1200,Math.min(1200,MG.panX+dx));MG.panY=Math.max(-1200,Math.min(1200,MG.panY+dy));mgApplyChartView();}

const MG_COMMANDS=[
  {re:/^next$/, id:"next", act:()=>mgGo(1)},
  {re:/^previous$/, id:"previous", act:()=>mgGo(-1)},
  {re:/^chart previous$/, id:"chart previous", act:()=>mgGoChart(-1)},
  {re:/^chart next$/, id:"chart next", act:()=>mgGoChart(1)},
  {re:/^chart close$/, id:"chart close", act:()=>{MG.chart=false;}},
  {re:/^zoom (in|out|reset)$/,id:"zoom",act:m=>mgZoom(m[1])},
  {re:/^pan (left|right|up|down)$/,id:"pan",act:m=>mgPan(m[1]==="left"?-180:m[1]==="right"?180:0,m[1]==="up"?-140:m[1]==="down"?140:0)},
  {re:/^(chart type|type menu|change chart type)$/, id:"chart type menu", act:()=>mgSheet("type")},
  {re:/^(x axis|axis menu|change x axis)$/, id:"x axis menu", act:()=>mgSheet("axis")},
  {re:/^(close|close menu|dismiss)$/, id:"close menu", act:()=>mgSheetClose()},
  {re:/^read files$/, id:"read staged files", act:()=>mgReadFiles()},
  {re:/^choose files$/, id:"choose experiment files", act:()=>mgChooseFiles()},
  {re:/^open page (load|sop|results|panel|graphs|review|export|integrity)$/, id:"leave for a page", act:m=>mgLeaveTo(m[1])},
  {re:/^(view )?(load files|load view|sop view|results view|panel view|charts view|review view|formats view|file integrity|integrity view)$/, id:"console view",
    act:m=>{const k={"load files":"load","load view":"load","sop view":"sop","results view":"results","panel view":"panel","charts view":"panel","review view":"review","formats view":"export","file integrity":"integrity","integrity view":"integrity"}[m[2]];if(k)mgScope(k);}},
  {re:/^type (i|ewma|cusum|trend|xbars|p|u|c|funnel)$/, id:"chart type", act:m=>mgSetChartType(m[1])},
  {re:/^x (order|date|hours|cycles)$/, id:"x axis", act:m=>mgSetChartAxis(m[1])},
  {re:/^theme light$/, id:"theme light", act:()=>{MG.theme="light";}},
  {re:/^theme dark$/, id:"theme dark", act:()=>{MG.theme="dark";}},
  {re:/^chart$/, id:"chart", act:()=>{MG.chart=!MG.chart;}},
  {re:/^panel$/, id:"panel", act:()=>mgLeaveTo("panel")},
  {re:/^results$/, id:"results", act:()=>mgLeaveTo("results")},
  {re:/^review$/, id:"review", act:()=>mgLeaveTo("review")},
  {re:/^load$/, id:"load", act:()=>mgLeaveTo("load")},
  {re:/^sop$/, id:"sop", act:()=>mgLeaveTo("sop")},
  {re:/^next run$/, id:"next run", act:()=>{if(RUNS.length>1){MG.run=((MG.run|0)+1)%RUNS.length;mgRefresh();}}},
  {re:/^export (\d+)$/, id:"download a file", act:m=>{
     const i=Number(m[1]),it=(MG.exports||[])[i];
     if(it)try{it.run();appNotice&&appNotice("console","Download requested: "+it.title);}catch(e){appError("console:export",e);}}},
  {re:/^exit$/, id:"exit", act:()=>mgClose()}
];
function mgCommandBase(text,source){
  const t=String(text||"").toLowerCase().trim();
  if(MG.sheet){                                   /* while a sheet is open, a number or its name picks */
    const t0=t;
    if(/^[1-9]$/.test(t0)){mgSheetPick(+t0-1);return true;}
    const i=MG.sheet.opts.findIndex(o=>o.label.toLowerCase()===t0||o.value===t0);
    if(i>=0){mgSheetPick(i);return true;}
    if(/^(close|cancel|back|dismiss)$/.test(t0)){mgSheetClose();return true;}
  }
  const hit=MG_COMMANDS.find(c=>c.re.test(t));
  if(!hit)return false;
  /* Handlers read capture groups, so they are given the match, not the text.
     Passing the text made m[1] the second CHARACTER of the command. */
  const m=hit.re.exec(t)||[t];
  try{hit.act(m,t);}catch(e){appError("console:button",e);}
  mgRender();
  return true;
}
function mgGoBase(step){
  if(!MG.queue.length)return;MG.zoom=1;MG.panX=0;MG.panY=0;
  MG.at=(MG.at+step+MG.queue.length)%MG.queue.length;
  const nx=MG.queue[MG.at];
  MG.chart=!!(nx&&(nx.chartId||(MG.scope==="graphs"&&nx.graphId)));
}
function mgGo(...args){return MISSY_HOOKS.invoke("mgGo",this,args,mgGoBase);}

function mgGoChart(step){
  MG.zoom=1;MG.panX=0;MG.panY=0;
  const chartIndexes=MG.queue.map((x,i)=>x&&x.chartId?i:-1).filter(i=>i>=0);
  if(!chartIndexes.length)return;
  let pos=chartIndexes.indexOf(MG.at);
  if(pos<0)pos=step>0?-1:0;
  pos=(pos+step+chartIndexes.length)%chartIndexes.length;
  MG.at=chartIndexes[pos];MG.chart=true;
}
function mgSetChartType(type){
  const it=mgItem();if(!it||!it.chartId)return;const def=CC_BY_ID[it.chartId];
  ccSetCfg(it.chartId,{type:type===def.type?"":type});CC_STATE.cache=null;MG.chart=true;mgRefresh();
}
function mgSetChartAxis(axis){
  const it=mgItem();if(!it||!it.chartId)return;
  ccSetCfg(it.chartId,{x:axis===((CC_BY_ID[it.chartId]||{}).x||"order")?"":axis});CC_STATE.cache=null;MG.chart=true;mgRefresh();
}
function mgReadFiles(){
  if(!Array.isArray(STAGED)||!STAGED.length){appNotice("console","No experiment files are staged.");return;}
  const task=readStaged();
  Promise.resolve(task).finally(()=>{
    if(typeof MG!=="undefined"&&MG.open){mgRefresh();mgRender();}
  });
}
function mgChooseFiles(){
  const f=document.getElementById("file");
  if(!f){appError("console:load",new Error("The experiment file control is not available."));return;}
  f.click();
}
function mgLeaveTo(tab){mgClose();try{showTab(tab);}catch(e){}}
/* The console is a mode, not a page. Its top row selects which part of the data set the
   console is working on; it never changes the mode. Leaving is one explicit action. */

function mgCommand(...args){return MISSY_HOOKS.invoke("mgCommand",this,args,mgCommandBase);}
