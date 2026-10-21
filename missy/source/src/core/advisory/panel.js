/* ============================================================================
   Advisory analytics — the panel under each control chart. Revision 2.

   The presentation half. The arithmetic is in the engine above; here it becomes
   figures and tables drawn with the page's own svgPlot, esc, ui, table and
   fmtTick, so an advisory figure looks like every other figure on the page.

   What it must never do, and what revision 2 changed to make that true:

     - It changes no control limit, centre line, flag, stored Cq, SOP verdict or
       exported byte, and writes to nothing the page owns. The review found two
       leaks of this kind and both are closed: advisory figures no longer
       advance the page's shared SVG clip-path counter (they are renumbered into
       their own namespace, and the page's counter is restored), and the cohort
       is built here without calling the page's row builder, which assigns
       cumulative run hours onto the shared history rows as a side effect.
     - It registers no figure with PLOT_CAPTURE, so no advisory figure can reach
       the SVG download, the PNG rasteriser, the export atlas or the ZIP.
     - It compares like with like. The forecast is fitted, drawn and compared in
       ONE quantity, and a crossing statement is made only where the chart's
       limits actually belong to that quantity -- not for EWMA or CUSUM, whose
       limits belong to the transformed statistic, and not where the limits move
       with a denominator that a future run has not yet supplied.
     - It says what it is. A rank is called a rank, a retrospective percentile is
       called one, and an interval whose independence assumption fails is
       withheld with the reason given.
   ========================================================================== */

const ML_VERSION="advisory r2 2026-10-12";
const ML_STATE={mv:null};
const ML_PANELS=new Map();
let ML_PANEL_N=0,ML_CLIP_N=0;

/* ---------- drawing, isolated from the page's SVG state -----------------
   svgPlot pushes into PLOT_CAPTURE when the interactive view is armed and
   allocates a clip-path id from the shared SVG_CLIP_N. Suspending the first
   was not enough: advancing the counter changes the ids of every later page
   figure, so two otherwise identical exports differed byte for byte. Here the
   counter is restored and the advisory figure's ids are rewritten into their
   own namespace, which keeps them unique in the live document. */
function mlPlot(o){
  const keepCapture=PLOT_CAPTURE,keepClip=SVG_CLIP_N;
  PLOT_CAPTURE=null;
  let svg;
  try{svg=svgPlot(o);}
  finally{PLOT_CAPTURE=keepCapture;SVG_CLIP_N=keepClip;}
  const ids=[...new Set(svg.match(/pc\d+/g)||[])].sort((a,b)=>b.length-a.length);
  ids.forEach(id=>{const nid="mlc"+(++ML_CLIP_N);
    svg=svg.replace(new RegExp("\\b"+id+"\\b","g"),nid);});
  return svg;
}

function mlNote(t){return `<p class="hint">${esc(ui(t))}</p>`;}
function mlWarn(t){return `<div class="notice warn">${esc(ui(t))}</div>`;}
function mlNum(v,sig){return Number.isFinite(v)?fmtTick(+Number(v).toPrecision(sig||4)):"—";}
function mlPct(v){return Number.isFinite(v)?(100*v).toFixed(1)+" %":"—";}
function mlDate(row){return row&&Number.isFinite(row.date)?sopFmtTime(row.date).slice(0,10):"—";}
function mlRunLabel(row){return row?String(row.run||""):"";}

/* ---------- which quantity, and may it be compared to the limits? -------
   i, trend, X-bar, p, u and c charts plot the measured quantity itself, and
   their limits belong to it. EWMA plots a smoothed statistic and CUSUM a
   cumulative sum in standard-deviation units; their limits belong to those
   statistics, so a forecast of the measured value must not be compared to
   them. p and u limits move with the run's denominator, which a future run has
   not supplied, so no crossing is claimed there either. */
const ML_TRANSFORMED={ewma:"a smoothed statistic (EWMA)",cusum:"a cumulative sum in standard-deviation units (CUSUM)"};
/* p and u charts are suppressed BY TYPE, not by whether their limits happen to
   have been constant so far: the limit of a future run is a function of that
   run's denominator, which has not been supplied. Historical constancy is not a
   future denominator. */
const ML_DENOMINATOR_LIMITS={p:"the number of items in the run",u:"the exposure of the run"};
function mlSeries(res){
  if(!res)return {ok:false,why:"no chart result"};
  if(res.type==="funnel")return {ok:false,funnel:true,
    why:"The funnel plot compares operators rather than a series in time, so the advisory layer is not offered for it."};
  const transformed=!!ML_TRANSFORMED[res.type];
  const val=p=>transformed?(p.raw!==undefined?p.raw:NaN):p.y;
  let pts=res.pts.filter(p=>!p.pre&&Number.isFinite(val(p)));
  /* control materials: a new extract is a new process, so the univariate panels
     speak about the current extract only rather than pooling them */
  let segment="",segmentKey="";
  if(res.segmented&&res.segments&&res.segments.length>1){
    const last=res.segments.find(g=>g.last)||res.segments[res.segments.length-1];
    const before=pts.length;
    pts=pts.filter(p=>p.segment===last.key);
    segmentKey=last.key;
    segment=`${last.key} (${before-pts.length} run(s) on earlier extracts are not pooled with it)`;
  }
  if(pts.length<8)return {ok:false,
    why:`Fewer than eight runs with a value in the current cohort (${pts.length}): too few for any of this to mean anything.`};
  /* Which limits actually exist? An EMPTY set of finite limits must not read as
     "constant": that is how a chart still collecting its baseline came to be
     told that no limit is reached. A limit counts as established only when it is
     finite on every charted point. */
  const n=pts.length;
  const uc=pts.map(p=>p.ucl).filter(Number.isFinite),lc=pts.map(p=>p.lcl).filter(Number.isFinite);
  const hasU=uc.length===n,hasL=lc.length===n;
  const spread=a=>a.length?Math.max(...a)-Math.min(...a):0;
  const scale=Math.max(1e-12,Math.abs(mlMedian(pts.map(val))||1));
  const constU=!hasU||spread(uc)/scale<1e-9,constL=!hasL||spread(lc)/scale<1e-9;
  const denom=ML_DENOMINATOR_LIMITS[res.type]||"";
  const baselineReady=res.baselineReady!==false;
  let limitsApply=false,limitWhy="";
  if(transformed)
    limitWhy=`This chart plots ${ML_TRANSFORMED[res.type]}, and its limits belong to that statistic. The forecast below is of the measured value, so it is not compared with them.`;
  else if(denom)
    limitWhy=`No crossing is assessed for this chart type: its limits are a function of ${denom}, which a future run has not supplied. Historical constancy of those limits is not a future denominator.`;
  else if(!hasU&&!hasL)
    limitWhy="No crossing is assessed: this chart has no control limits on the charted runs — it is still collecting its baseline, or limits are not defined for it.";
  else if(!baselineReady)
    limitWhy="No crossing is assessed: the chart itself reports that its baseline is not yet established, so its limits are provisional.";
  else if(!constU||!constL)
    limitWhy="No crossing is assessed: the limits of this chart move from run to run, so there is no fixed limit for a future run to cross.";
  else{limitsApply=true;
    if(hasU&&!hasL)limitWhy="This chart has an upper limit only; the forecast is assessed against that limit alone.";
    else if(hasL&&!hasU)limitWhy="This chart has a lower limit only; the forecast is assessed against that limit alone.";}
  return {ok:true,pts,x:pts.map(p=>p.x),y:pts.map(val),
    quantity:transformed?"the measured value":"the plotted statistic",
    transformed,transformedAs:ML_TRANSFORMED[res.type]||"",
    limitsApply,hasUpper:hasU,hasLower:hasL,oneSided:limitsApply&&!(hasU&&hasL),
    baselineReady,segment,segmentKey,limitWhy};
}

/* ---------- the cohort, built without touching the page's rows ----------
   The univariate panels drop the runs before the chart's baseline date; the
   multivariate panels must use the same cohort or the two halves of the panel
   are discussing different processes. The page's own ccRowsFor would supply the
   rows but it also assigns cumulative run hours onto them as a side effect, so
   the filter is done here, read-only, and the cohort is stated to the reader. */
function mlCohort(res,ctx){
  /* the instrument and protocol come from the context captured when the panel
     was created, not from the globals as they stand when it is opened */
  const inst=(ctx&&ctx.instrument)||CC_STATE.instrument;
  const prot=(ctx&&ctx.protocol!==undefined)?ctx.protocol:CC_STATE.protocol;
  const all=ccAllRows().filter(r=>r.instrument===inst);
  const proto=prot?all.filter(r=>(r.protocol||"")===prot):all;
  const from=res&&res.cfg&&res.cfg.baseFrom?Date.parse(res.cfg.baseFrom):NaN;
  const kept=(Number.isFinite(from)?proto.filter(r=>(r.date||0)>=from):proto)
    .slice().sort((a,b)=>(a.date||0)-(b.date||0));
  const keys=uniq(kept.map(r=>`${r.protocol||"unknown protocol"} · ${r.firmware||"no firmware"} / ${r.software||"no software"}`));
  return {rows:kept,n:kept.length,baseFrom:res&&res.cfg?res.cfg.baseFrom||"":"",
    droppedByBaseline:proto.length-kept.length,
    instrument:inst,protocol:prot||"",
    keys,mixed:keys.length>1};
}
function mlCohortNote(c){
  const bits=[`${c.n} run(s) on ${c.instrument}`];
  if(c.protocol)bits.push(`protocol filter: ${c.protocol}`);
  if(c.baseFrom)bits.push(`baseline from ${c.baseFrom} (${c.droppedByBaseline} earlier run(s) excluded)`);
  else bits.push("no baseline date set, so the whole history is used");
  return mlNote("Cohort: "+bits.join(" · ")+".")
    +(c.mixed?mlWarn("This cohort mixes "+c.keys.length+" protocol/firmware/software combinations ("+c.keys.join("; ")+"). A shift between them is a change of equipment or method, not necessarily a change in the process; record the intervention rather than reading it as deterioration."):"");
}

/* ---------- A. where the next runs land -------------------------------- */
function mlPanelForecast(res,S){
  const fc=mlForecast(S.x,S.y,5,{});
  if(!fc)return {html:mlNote("Fewer than eight runs in the cohort: no forecast is offered."),level:"none"};
  const unit=res.def.unit||"";
  const last=S.pts[S.pts.length-1];
  const ucl=S.limitsApply&&S.hasUpper&&Number.isFinite(last.ucl)?last.ucl:NaN;
  const lcl=S.limitsApply&&S.hasLower&&Number.isFinite(last.lcl)?last.lcl:NaN;
  const cross=S.limitsApply?mlCrossing(fc,ucl,lcl):null;
  const reliable=fc.intervalReliable;
  const ys=S.y.concat(fc.points.flatMap(p=>reliable?[p.lo,p.hi]:[p.y]),
    [ucl,lcl].filter(Number.isFinite));
  const series=[{type:"line",colour:"#cbd5e1",width:1,data:S.pts.map((p,i)=>[p.x,S.y[i]])},
    {type:"points",r:3,colour:CC_COL.pt,data:S.pts.map((p,i)=>[p.x,S.y[i],mlRunLabel(p.row)])},
    {type:"line",colour:"#0f766e",width:1.6,data:fc.inSample.map(p=>[p.x,p.y]),tip:ui("fitted "+fc.model)}];
  if(reliable)series.push(
    {type:"line",colour:"#0f766e",dash:"4 3",data:fc.points.map(p=>[p.x,p.hi]),tip:ui("upper prediction interval")},
    {type:"line",colour:"#0f766e",dash:"4 3",data:fc.points.map(p=>[p.x,p.lo]),tip:ui("lower prediction interval")});
  series.push({type:"points",r:4,colour:"#0f766e",
    data:fc.points.map(p=>[p.x,p.y,ui("forecast")+" "+mlNum(p.y)])});
  const fig=mlPlot({title:ui(reliable?"Forecast of the next five runs with a 95 % prediction interval"
      :"Forecast of the next five runs — interval withheld, see below"),
    width:880,height:300,x:extent(S.x.concat(fc.points.map(p=>p.x)),0.04),y:extent(ys,0.08),
    xlab:res.X.label,ylab:unit+(S.transformed?" ("+ui("measured value")+")":""),
    series,
    hlines:[Number.isFinite(ucl)?{y:ucl,label:"UCL",colour:CC_COL.bad}:null,
      Number.isFinite(lcl)?{y:lcl,label:"LCL",colour:CC_COL.bad}:null].filter(Boolean),
    legend:[{label:ui("observed"),colour:CC_COL.pt},{label:ui("fitted and forecast"),colour:"#0f766e"}]});
  const rows=fc.points.map((p,i)=>({ahead:"+"+(i+1),x:mlNum(p.x,5),y:mlNum(p.y),
    lo:reliable?mlNum(p.lo):"withheld",hi:reliable?mlNum(p.hi):"withheld"}));
  const tab=table([{key:"ahead",label:"Runs ahead"},{key:"x",label:res.X.label,n:1},
    {key:"y",label:"Expected "+(unit||"value"),n:1},
    {key:"lo",label:"Lower 95 %",n:1},{key:"hi",label:"Upper 95 %",n:1}],rows);
  const ind=fc.independence;
  const method=[
    `Quantity fitted: ${S.quantity}${S.transformed?" — "+S.transformedAs+" is what the chart above plots":""}.`,
    `Model: ${fc.model}, chosen by ${fc.selectionRule}; margin over the alternative ${Number.isFinite(fc.selectionMargin)?fc.selectionMargin.toFixed(2)+" AICc":"no alternative"}. R² ${mlNum(fc.r2,3)}, residual spread ${mlNum(fc.sigma)} ${unit}, ${fc.n} runs, ${fc.dof} residual degrees of freedom.`,
    `Interval: one future observation, Student-t at ${fc.dof} degrees of freedom (${mlNum(fc.tQuantile,4)}) times the standard error, with the leverage of the fitted design. It is not a control limit and raises no alarm.`,
    `The 95 % is NOMINAL. Because the model is chosen from the same runs it is fitted to, the level is not exact: in rolling-origin simulation on series that satisfy the assumptions, the intervals this layer offers covered about 93–94 % at every horizon, falling to roughly 89 % five runs ahead when the underlying process was curved. Treat the band as approximate, and more approximate the further out you read it.`,
    `Assumed future spacing: ${mlNum(fc.stepX,4)} on this axis per run, the median observed step.`,
    `Independence screen on the residuals: lag-1 autocorrelation ${mlNum(ind.r1,3)}${Number.isFinite(ind.se)?" (standard error ≈ "+mlNum(ind.se,2)+")":""}, Ljung-Box Q ${mlNum(ind.Q,4)} on ${ind.lags||0} lags, p ${Number.isFinite(ind.p)?ind.p.toExponential(2):"—"}.`
  ].join(" ");
  let verdict;
  if(!reliable)verdict=mlWarn("The residuals are autocorrelated (Ljung-Box p "+(Number.isFinite(ind.p)?ind.p.toExponential(2):"—")
    +"), so the independence assumption the interval rests on does not hold and its nominal 95 % coverage is unsupported. Which way and how far the true coverage departs depends on the dependence structure and the horizon, so no corrected interval is offered either: only the fitted path is shown.");
  else if(ind.ok===null)verdict=mlNote("Too few residuals to test independence ("+ind.n+"): the interval is shown, but nothing here establishes its coverage on this series.");
  else verdict=mlNote("The screen found no evidence against independence. That is not a demonstration of it — at this sample size the test has little power — so the interval's nominal coverage remains an assumption.");
  const crossText=!S.limitsApply
    ?mlNote(S.limitWhy||"No crossing statement is made for this chart type.")
    :`${S.oneSided?mlNote(S.limitWhy):""}<p><b>${esc(cross
        ?`${ui("the fitted model reaches the")} ${ui(cross.side==="upper"?"upper":"lower")} ${ui("control limit")} (${mlNum(cross.limit)} ${unit}) ${ui("within the next five runs")}`
        :ui("the fitted path does not reach "+(S.oneSided?"that limit":"either control limit")+" within the next five runs"))}.</b></p>`;
  return {level:cross?"warn":"ok",
    html:`<div class="chart-wrap">${fig}</div>${tab}${verdict}${crossText}${mlNote(method)}`};
}

/* ---------- B. when the level moved ------------------------------------ */
function mlPanelChange(res,S){
  const cp=mlChangepoints(S.y,3);
  const basis=mlNote(`Binary segmentation on the mean; a split is kept when the reduction in the residual sum of squares exceeds 2·log(n)·s² with s = ${mlNum(cp.scale,3)} ${res.def.unit||""} estimated from ${cp.scaleKind} (penalty ${mlNum(cp.penalty,4)}); a split is then kept only if the step between the segment medians exceeds 2s = ${mlNum(cp.minStep,3)}, which stops a single extreme run from being reported as a pair of level changes. This is an exploratory heuristic in the shape of a Schwarz penalty, not a test with a calibrated error rate, and it cannot show that no shift exists.`);
  if(!cp.points.length)return {level:"ok",
    html:mlNote("No change of level was detected by this method on these runs. That is not evidence that the level is constant — a smaller shift than this penalty admits would not be reported.")+basis};
  const unit=res.def.unit||"";
  const marks=cp.points.map(c=>({x:S.x[c.index],label:ui("level change"),colour:"#7c3aed",dash:"3 3",row:0}));
  const fig=mlPlot({title:ui("Change points in the level, with the median of each final segment"),
    width:880,height:280,x:extent(S.x,0.04),y:extent(S.y,0.1),xlab:res.X.label,ylab:unit,
    series:[{type:"line",colour:"#cbd5e1",width:1,data:S.pts.map((p,i)=>[p.x,S.y[i]])},
      {type:"points",r:3,colour:CC_COL.pt,data:S.pts.map((p,i)=>[p.x,S.y[i],mlRunLabel(p.row)])}]
      .concat(cp.segments.map(g=>({type:"line",colour:"#7c3aed",width:2,
        data:[[S.x[g.from],g.level],[S.x[Math.max(g.from,g.to-1)],g.level]],
        tip:ui("segment median")+" "+mlNum(g.level)}))),
    vlines:marks,legend:[{label:ui("segment median"),colour:"#7c3aed"}]});
  const rows=cp.points.map(c=>{const p=S.pts[c.index];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),
      before:mlNum(c.before),after:mlNum(c.after),step:mlNum(c.after-c.before),
      nb:c.nBefore,na:c.nAfter};});
  return {level:"warn",html:`<div class="chart-wrap">${fig}</div>
    ${table([{key:"run",label:"First run of the new level"},{key:"date",label:"Date"},
      {key:"before",label:"Level before",n:1},{key:"after",label:"Level after",n:1},
      {key:"step",label:"Step",n:1},{key:"nb",label:"Runs before",n:1},{key:"na",label:"Runs after",n:1}],rows)}
    ${mlNote("The levels quoted are the medians of the final segments, which is what the figure draws, so the table and the figure agree. A change point is a date to look for a cause — a service, a reagent lot, a firmware change. If the new level is accepted, the chart's own baseline setting below is where that is recorded; nothing here changes it.")}
    ${basis}`};
}

/* ---------- C. runs that stand out ------------------------------------- */
function mlPanelAnomaly(res,S){
  const a=mlAnomalyScores(S.y);
  if(a.degenerate)return {level:"none",html:mlNote("No ranking is offered: "+a.note+".")};
  const sc=a.scores;
  const ranked=sc.map((s,i)=>({...s,i})).filter(s=>Number.isFinite(s.score)).sort((p,q)=>q.score-p.score);
  const unit=res.def.unit||"";
  const ref=3,top=ranked.slice(0,8);
  const fig=mlPlot({title:ui("Unusualness rank of every run — an uncalibrated score, not a significance test"),
    width:880,height:260,x:extent(S.x,0.04),y:[0,Math.max(ref*1.3,...ranked.map(s=>s.score))*1.08],
    xlab:res.X.label,ylab:ui("score (deviation ÷ "+a.scaleKind+")"),
    series:[{type:"bar",colour:"#94a3b8",data:S.x.map((xv,i)=>[xv,Number.isFinite(sc[i].score)?sc[i].score:0,0,
      `${mlRunLabel(S.pts[i].row)}\n${ui("score")} ${mlNum(sc[i].score,3)}`,
      (sc[i].score>=ref?(S.pts[i].flags.length?CC_COL.rule:CC_COL.bad):"#94a3b8")])}],
    hlines:[{y:ref,label:ui("reference line at 3 — a reading aid, not a threshold"),colour:"#6b7280"}],
    legend:[{label:ui("above the line, a rule also fired"),colour:CC_COL.rule},
      {label:ui("above the line, no rule fired"),colour:CC_COL.bad},{label:ui("below"),colour:"#94a3b8"}]});
  const rows=top.map(s=>{const p=S.pts[s.i];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),value:mlNum(S.y[s.i]),
      score:mlNum(s.score,3),robust:mlNum(s.robust,3),local:mlNum(s.local,3),
      novelty:mlNum(s.novelty,3),rule:p.flags.length?p.flags.join(", "):ui("no rule fired")};});
  const silent=top.filter(s=>s.score>=ref&&!S.pts[s.i].flags.length).length;
  return {level:silent?"warn":"ok",
    html:`<div class="chart-wrap">${fig}</div>
      ${table([{key:"run",label:"Experiment"},{key:"date",label:"Date"},
        {key:"value",label:"Value "+(unit?"("+unit+")":""),n:1},{key:"score",label:"Rank score",n:1},
        {key:"robust",label:"Robust",n:1},{key:"local",label:"Local window",n:1},
        {key:"novelty",label:"Novelty (not in the score)",n:1},{key:"rule",label:"Chart rule"}],rows)}
      ${mlNote(`The score is the larger of two deviations, each divided by ${a.scaleKind} (${mlNum(a.scale,3)} ${unit}): distance from the series median, and distance from the fifteen runs around it. It orders the runs; it is not in standard deviations and carries no false-alarm rate, and the line at 3 is drawn to help read the figure rather than to declare a threshold. The local window uses the runs on both sides, so it is retrospective and cannot be read as prospective detection.`)}
      ${mlNote("The novelty column is the distance in a three-lag embedding, attributed to the run in each window that deviates most on its own. It is shown for information and deliberately does not enter the score.")}
      ${silent?`<p><b>${esc(ui(silent+" of the runs listed stand out with no chart rule fired — the shapes the fixed rules were not written for."))}</b></p>`:""}`};
}

/* ---------- D-F. the whole instrument ----------------------------------
   An explicit feature schema. The review found that channel and target maps
   were never flattened, so channel-specific optical metrics were silently
   absent from a panel describing the whole instrument, and that the
   count-per-exposure branch was unreachable because a bare count was tested
   first, so a rate entered as a count. Both are fixed here, and the panel now
   prints what went in, what was left out and why. */
function mlFeatureRows(row){
  const out=[];
  const push=(name,value,kind,extra)=>{
    if(!Number.isFinite(value))return;
    out.push(Object.assign({name,value,kind},extra||{}));};
  Object.entries(row.m||{}).forEach(([k,v])=>{
    if(v==null)return;
    if(typeof v==="number"){push(k,v,"level");return;}
    if(typeof v!=="object")return;
    /* order matters: a proportion, then a rate per unit exposure, then a bare
       count. Testing count first made the exposure branch dead code. */
    if(Number.isFinite(v.bad)&&Number.isFinite(v.n)&&v.n>0){
      push(k,v.bad/v.n,"proportion",{denominator:"n = "+v.n});return;}
    if(Number.isFinite(v.count)&&Number.isFinite(v.exposure)&&v.exposure>0){
      push(k,v.count/v.exposure,"rate per unit exposure",{denominator:"exposure = "+v.exposure});return;}
    if(Number.isFinite(v.count)&&v.exposure===undefined){push(k,v.count,"count");return;}
    if(Number.isFinite(v.mean)){
      push(k+" · mean",v.mean,"level");
      if(Number.isFinite(v.sd))push(k+" · sd",v.sd,"dispersion");
      return;}
    /* otherwise a map keyed by channel, target or transition */
    Object.entries(v).forEach(([ch,cv])=>{
      if(typeof cv==="number")push(k+" · "+ch,cv,"level",{channel:ch});
      else if(cv&&typeof cv==="object"){
        if(Number.isFinite(cv.bad)&&Number.isFinite(cv.n)&&cv.n>0)
          push(k+" · "+ch,cv.bad/cv.n,"proportion",{channel:ch,denominator:"n = "+cv.n});
        else if(Number.isFinite(cv.count)&&Number.isFinite(cv.exposure)&&cv.exposure>0)
          push(k+" · "+ch,cv.count/cv.exposure,"rate per unit exposure",{channel:ch});
        else if(Number.isFinite(cv.mean))push(k+" · "+ch,cv.mean,"level",{channel:ch});
      }
    });
  });
  return out;
}
const ML_LABEL_SOURCE=["findings","copied"];
function mlFeatureMatrix(rows){
  const per=rows.map(mlFeatureRows);
  const meta=new Map();
  per.forEach(list=>list.forEach(f=>{if(!meta.has(f.name))meta.set(f.name,f);}));
  const names=[...meta.keys()].sort();
  const coverage=new Map(names.map(nm=>[nm,per.filter(l=>l.some(f=>f.name===nm)).length]));
  const valueOf=(list,nm)=>{const f=list.find(q=>q.name===nm);return f?f.value:NaN;};
  const omitted=[];
  const keep=names.filter(nm=>{
    if(ML_LABEL_SOURCE.some(s=>nm===s||nm.indexOf(s+" · ")===0)){
      omitted.push({name:nm,why:"excluded: this is the metric the label is taken from"});return false;}
    const cov=coverage.get(nm);
    if(cov<Math.max(8,0.8*rows.length)){
      omitted.push({name:nm,why:`present on ${cov} of ${rows.length} runs (under 80 %)`});return false;}
    const col=per.map(l=>valueOf(l,nm)).filter(Number.isFinite);
    if(!((mlSd(col)||0)>1e-12)){
      omitted.push({name:nm,why:"no variation across the cohort"});return false;}
    return true;});
  if(keep.length<3)return {ok:false,why:`only ${keep.length} usable metric(s) across this cohort`,omitted,
    included:keep.map(nm=>meta.get(nm))};
  const idx=[],X=[],dropped=[];
  per.forEach((list,i)=>{
    const v=keep.map(nm=>valueOf(list,nm));
    if(v.every(Number.isFinite)){idx.push(i);X.push(v);}
    else dropped.push({run:rows[i].run,missing:keep.filter((nm,j)=>!Number.isFinite(v[j]))});
  });
  if(X.length<8)return {ok:false,why:`only ${X.length} run(s) have every metric present`,omitted,
    included:keep.map(nm=>meta.get(nm)),dropped};
  return {ok:true,keys:keep,X,rows:idx.map(i=>rows[i]),
    included:keep.map(nm=>Object.assign({},meta.get(nm),{coverage:coverage.get(nm)})),
    omitted,dropped};
}
/* ---------- cache identity --------------------------------------------
   Three attempts at this, so the reasoning is worth recording.

   Revision 2 keyed on the feature matrix and row identities, which omitted the
   forensic labels. Revision 3 added the labels and every displayed field, and
   compared the serialised key rather than a digest — but it still enumerated
   DERIVED artefacts, and one derived input escaped the enumeration: a metric can
   clear the 80 % presence rule inside the training window while failing it over
   the whole cohort, so it is absent from the full-cohort matrix and present in
   the training-only matrix that the out-of-time model is fitted on. Its values
   reached the model without reaching the key.

   Enumerating derived artefacts is the wrong boundary, because the next
   derivation added will escape it in the same way. The key is therefore built
   from the INPUTS: every row of the cohort, serialised complete, with its whole
   metric object and with object keys sorted so the serialisation is canonical.
   Any change to any measurement now changes the key whether or not any current
   schema happens to read it. The derived schemas are included as well, so the
   key is self-describing and a reader can see what was computed, and both
   matrices are constructed BEFORE the comparison so nothing is built from
   inputs the key has not seen. */
function mlCanonical(v){
  if(v===null||typeof v!=="object")return JSON.stringify(v===undefined?null:v);
  if(Array.isArray(v))return "["+v.map(mlCanonical).join(",")+"]";
  return "{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+mlCanonical(v[k])).join(",")+"}";
}
/* one row, complete: identity, date, every field the tables print, and the
   entire metric object -- not a selection from it */
function mlRowInput(r){
  return mlCanonical({key:r.key,run:r.run,file:r.file,date:r.date,
    instrument:r.instrument,platform:r.platform,protocol:r.protocol,
    operator:r.operator,firmware:r.firmware,software:r.software,
    block_cycles:r.block_cycles,sop:r.sop,m:r.m});
}
function mlDependencyKey(cohort,F,labels,scope,holdout){
  const schema=M=>M&&M.ok?{keys:M.keys,
    omitted:(M.omitted||[]).map(o=>[o.name,o.why]),
    dropped:(M.dropped||[]).map(d=>[d.run,d.missing]),
    rows:(M.rows||[]).map(r=>r.key),X:M.X}:{ok:false,why:M?M.why:"none"};
  return "advisory-key-v3\n"+mlCanonical({
    version:ML_VERSION,
    instrument:cohort.instrument,protocol:cohort.protocol,baseFrom:cohort.baseFrom,
    sop:sopHash(),
    segmentScope:scope||"",
    /* the primary boundary: the complete inputs, canonically serialised */
    inputs:cohort.rows.map(mlRowInput),
    /* and the derived objects, so the key says what was made from them */
    cohortSchema:schema(F),
    labels:labels||null,
    holdout:holdout?{keys:holdout.keys,Xtr:holdout.Xtr,ytr:holdout.ytr,
      Xte:holdout.Xte,yte:holdout.yte,
      trainRows:holdout.trainRowKeys,testRows:holdout.testRowKeys,
      droppedTest:holdout.droppedTest,trainSchema:holdout.trainSchema}:null});
}
/* Build the training-only analysis input. The feature schema is rebuilt on the
   training rows alone -- presence, variance screening and complete-case
   selection all computed there -- and the later rows are projected onto it, so
   nothing from the evaluation period has influenced which metrics are used. */
function mlBuildHoldout(rows,frac){
  const sp=mlTimeSplit(rows.length,frac||0.7);
  if(!sp.trainable)return null;
  const trRows=rows.slice(0,sp.cut),teRows=rows.slice(sp.cut);
  const Ftr=mlFeatureMatrix(trRows);
  if(!Ftr.ok)return null;
  const lab=rs=>rs.map(r=>((((r.m||{}).findings||{}).count)>0)?1:0);
  const keep=[],Xte=[];
  teRows.forEach(r=>{const list=mlFeatureRows(r);
    const v=Ftr.keys.map(nm=>{const f=list.find(q=>q.name===nm);return f?f.value:NaN;});
    if(v.every(Number.isFinite)){Xte.push(v);keep.push(r);}});
  if(Xte.length<4)return null;
  return {Xtr:Ftr.X,ytr:lab(Ftr.rows),Xte,yte:lab(keep),
    keys:Ftr.keys,schemaFrozen:true,
    trainSchema:{keys:Ftr.keys,omitted:(Ftr.omitted||[]).map(o=>[o.name,o.why])},
    trainRowKeys:Ftr.rows.map(r=>r.key),testRowKeys:keep.map(r=>r.key),
    nTrainRows:Ftr.rows.length,nTestRows:keep.length,
    droppedTest:teRows.length-keep.length,cut:sp.cut};
}
function mlMultivariate(cohort,scope){
  /* both analysis inputs are constructed before the key is compared */
  const F=mlFeatureMatrix(cohort.rows);
  const labels=F.ok?F.rows.map(r=>((((r.m||{}).findings||{}).count)>0)?1:0):null;
  const usable=!!labels&&labels.some(v=>v===1)&&labels.some(v=>v===0);
  const holdout=usable?mlBuildHoldout(cohort.rows,0.7):null;
  const key=mlDependencyKey(cohort,F,labels,scope,holdout);
  if(ML_STATE.mv&&ML_STATE.mv.key===key)return ML_STATE.mv;
  const out={key,fingerprint:mlHash32(key),F,label:labels,scope:scope||"",holdout};
  if(F.ok){
    out.pca=mlPCA(F.X,2,20260921);
    out.logit=usable?mlLogistic(F.X,labels,{iters:400,lambda:1,holdout}):null;
    out.clusters=out.pca?mlClusterStructure(out.pca.scores.map(q=>q.slice(0,2)),20260921,4,20):null;
  }
  ML_STATE.mv=out;
  return out;
}
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
function mlPanelMulti(mv,cohort,scopeNote){
  if(!mv.F.ok)return mlNote("The multivariate view is not offered: "+mv.F.why+".")+mlInventory(mv.F);
  const p=mv.pca;
  if(!p)return mlNote("Too few complete runs for a multivariate decomposition.")+mlInventory(mv.F);
  const rows=mv.F.rows,n=rows.length,x=rows.map((r,i)=>i+1);
  const figT=mlPlot({title:ui("Hotelling T² — the retained components, per run"),
    width:880,height:260,x:[0.5,n+0.5],y:[0,Math.max(p.t2Ucl*1.25,...p.t2)*1.08],
    xlab:ui("Run (in date order)"),ylab:"T²",
    series:[{type:"line",colour:"#cbd5e1",width:1,data:x.map((xv,i)=>[xv,p.t2[i]])},
      {type:"points",r:3.4,data:x.map((xv,i)=>[xv,p.t2[i],`${mlRunLabel(rows[i])}\nT² ${mlNum(p.t2[i],3)}`,
        p.t2[i]>p.t2Ucl?CC_COL.bad:p.t2[i]>p.t2Warn?CC_COL.rule:CC_COL.pt])}],
    hlines:[{y:p.t2Ucl,label:ui("99th percentile of this history"),colour:CC_COL.bad},
      {y:p.t2Warn,label:ui("95th percentile"),colour:CC_COL.rule}]});
  const figQ=mlPlot({title:ui("Residual distance Q — the directions the components do not keep"),
    width:880,height:240,x:[0.5,n+0.5],y:[0,Math.max(p.speUcl*1.25,...p.spe)*1.08],
    xlab:ui("Run (in date order)"),ylab:"Q",
    series:[{type:"line",colour:"#cbd5e1",width:1,data:x.map((xv,i)=>[xv,p.spe[i]])},
      {type:"points",r:3.4,data:x.map((xv,i)=>[xv,p.spe[i],`${mlRunLabel(rows[i])}\nQ ${mlNum(p.spe[i],3)}`,
        p.spe[i]>p.speUcl?CC_COL.bad:p.spe[i]>p.speWarn?CC_COL.rule:CC_COL.pt])}],
    hlines:[{y:p.speUcl,label:ui("99th percentile of this history"),colour:CC_COL.bad},
      {y:p.speWarn,label:ui("95th percentile"),colour:CC_COL.rule}]});
  const over=p.t2.map((v,i)=>({v,i,q:p.spe[i]}))
    .filter(o=>o.v>p.t2Ucl||o.q>p.speUcl).sort((a,b)=>(b.v/p.t2Ucl+b.q/p.speUcl)-(a.v/p.t2Ucl+a.q/p.speUcl)).slice(0,10);
  const contrib=o=>mv.F.keys.map((k,j)=>({k,z:Math.abs((mv.F.X[o.i][j]-p.mean[j])/(p.sd[j]||1))}))
    .sort((a,b)=>b.z-a.z).slice(0,3).map(c=>`${c.k} (${mlNum(c.z,2)} σ)`).join(", ");
  const tabOver=over.length?table([{key:"run",label:"Experiment"},{key:"date",label:"Date"},
    {key:"t2",label:"T²",n:1},{key:"q",label:"Q",n:1},{key:"flag",label:"Forensic findings",n:1},
    {key:"why",label:"Metrics furthest from the centre"}],
    over.map(o=>({run:mlRunLabel(rows[o.i]),date:mlDate(rows[o.i]),t2:mlNum(o.v,3),q:mlNum(o.q,3),
      flag:((rows[o.i].m||{}).findings||{}).count||0,why:contrib(o)}))):mlNote("No run is above the 99th percentile of either statistic in this cohort.");
  const figS=mlPlot({title:ui("Runs in the plane of the first two components"),
    width:880,height:320,x:extent(p.scores.map(s=>s[0]),0.1),y:extent(p.scores.map(s=>s[1]||0),0.1),
    xlab:`${ui("Component 1")} (${mlPct(p.explained[0])})`,
    ylab:`${ui("Component 2")} (${mlPct(p.explained[1])})`,
    series:[{type:"points",r:4,data:p.scores.map((s,i)=>[s[0],s[1]||0,
      `${mlRunLabel(rows[i])}\n${mlDate(rows[i])}`,CC_COL.pt])}]});
  const load=p.eig[0].vector.map((v,j)=>({k:mv.F.keys[j],v})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,8);
  const tabLoad=table([{key:"metric",label:"Metric"},{key:"w",label:"Weight in component 1",n:1},
    {key:"dir",label:"Direction"}],
    load.map(l=>({metric:l.k,w:mlNum(l.v,3),dir:ui(l.v>0?"rises with the component":"falls with the component")})));
  return `<h4>${esc(ui("The instrument as a whole"))}</h4>
    ${scopeNote||""}
    <div class="chart-wrap">${figT}</div>
    <div class="chart-wrap">${figQ}</div>
    ${mlNote(`The correlation matrix of ${mv.F.keys.length} metrics over ${n} runs, decomposed by power iteration. Numerical rank ${p.rank} of ${p.p}; ${p.m} component(s) retained, holding ${mlPct(p.retained)} of the variation. T² measures the distance of a run from the centre of the retained subspace, and Q the part of the run those components cannot reproduce — a fault confined to a low-variance direction shows in Q and not in T², which is why both are drawn.`)}
    ${mlWarn("Both sets of lines are "+p.limitKind+", computed from the same runs they are compared against. They rank runs within this history; they are not control limits, carry no false-alarm rate, and with a short history a highest-ranked run will exceed the 99th percentile whenever the values differ at all.")}
    ${tabOver}
    <div class="chart-wrap">${figS}</div>
    ${tabLoad}
    ${mlInventory(mv.F)}`;
}
function mlPanelClusters(mv){
  if(!mv.F.ok||!mv.clusters)return "";
  const c=mv.clusters;
  if(!c.structure)return `<h4>${esc(ui("Behaviour groups"))}</h4>`
    +mlNote(`No grouping is shown. The best partition found (k = ${c.k||"—"}, silhouette ${mlNum(c.silhouette,3)}) is no better than the best partition of ${c.nNull||0} seeded uniform clouds spanning the same ranges (90th percentile ${mlNum(c.nullQ90,3)}). That is evidence against one particular null — a uniform box — and nothing more: a single Gaussian cloud, a curved band or a steady drift would also fail this comparison while still being structure of a kind. Read it as no evidence of groups beyond this comparison, not as proof that none exist.`);
  const rows=mv.F.rows,km=c.km,p=mv.pca;
  const fig=mlPlot({title:ui("Behaviour groups in the plane of the first two components (exploratory)"),
    width:880,height:320,x:extent(p.scores.map(s=>s[0]),0.1),y:extent(p.scores.map(s=>s[1]||0),0.1),
    xlab:ui("Component 1"),ylab:ui("Component 2"),
    series:[{type:"points",r:4,data:p.scores.map((s,i)=>[s[0],s[1]||0,
      `${mlRunLabel(rows[i])}\n${mlDate(rows[i])}\n${ui("group")} ${km.assign[i]+1}`,
      CC_SEG_PALETTE[km.assign[i]%CC_SEG_PALETTE.length]])}],
    legend:km.sizes.map((s,j)=>({label:`${ui("group")} ${j+1} · ${s} ${ui("runs")}`,
      colour:CC_SEG_PALETTE[j%CC_SEG_PALETTE.length]}))});
  const by=km.sizes.map((_,j)=>rows.filter((_,i)=>km.assign[i]===j));
  return `<h4>${esc(ui("Behaviour groups"))}</h4>
    <div class="chart-wrap">${fig}</div>
    ${table([{key:"g",label:"Group"},{key:"n",label:"Runs",n:1},{key:"span",label:"Dates"},
      {key:"find",label:"Runs with a forensic finding",n:1},{key:"inst",label:"Firmware / software seen"}],
      by.map((g,j)=>{const ds=g.map(r=>r.date).filter(Number.isFinite).sort((a,b)=>a-b);
        return {g:j+1,n:g.length,span:ds.length?`${sopFmtTime(ds[0]).slice(0,10)} → ${sopFmtTime(ds[ds.length-1]).slice(0,10)}`:"—",
          find:g.filter(r=>(((r.m||{}).findings||{}).count>0)).length,
          inst:uniq(g.map(r=>`${r.firmware||"—"} / ${r.software||"—"}`)).slice(0,3).join("; ")};}))}
    ${mlNote(`Exploratory only. k = ${c.k} was chosen by the highest silhouette over k = 2 to 4 (${mlNum(c.silhouette,3)}), and kept because it exceeds the 90th percentile of ${c.nNull} seeded uniform-box resamples (${mlNum(c.nullQ90,3)}) — a comparison against that one null, which is weaker than a demonstration that the groups are real. A group holding the runs before a service date and another holding the runs after it is the same finding as a change point, reached from a different direction.`)}`;
}
function mlPanelDrivers(mv){
  if(!mv||!mv.F||!mv.F.ok)return "";
  const head=`<h4>${esc(ui("Which metrics go with a flagged run"))}</h4>`;
  if(!mv.logit)return head+mlNote("The forensic log has no findings, or a finding on every run, in this cohort: there is nothing for an association model to separate.");
  const L=mv.logit,keys=mv.F.keys;
  const caveats=[
    `Label: a run that produced at least one forensic finding (${L.nPos} of ${L.n} runs). The categories of finding are pooled, because the history row carries a count and not a category; an integrity finding and an analysis-setting finding are therefore treated as the same event, which they are not.`,
    `The label's own metrics are excluded from the features, but that does not rule out indirect leakage: a metric the forensic rules themselves read will carry part of the label by construction. These are associations in this cohort, not causes, and not a prediction for a run that has not happened.`,
    `L2-penalised logistic regression, ${keys.length} standardised metrics, fixed λ = 1 and ${400} steps at a fixed step size — λ is not tuned and no convergence criterion is applied; the trace shows the log-loss and gradient if you need to check it.`,
    mv&&mv.holdout
      ?`For the out-of-time line the feature schema was rebuilt on the ${mv.holdout.nTrainRows} training runs alone (${mv.holdout.keys.length} metric(s) survived there), and the later runs were projected onto it; ${mv.holdout.droppedTest} later run(s) were dropped for missing one of those metrics.`
        +(()=>{const only=mv.holdout.keys.filter(k=>keys.indexOf(k)<0);
          return only.length?` ${only.length} of those metric(s) are not in the cohort-wide set above, because they are recorded often enough inside the training period but not across the whole cohort: ${only.join(", ")}.`:"";})()
        +` The coefficients above, by contrast, are selected and fitted over the whole cohort, so their own selection has seen every run.`
      :"The coefficients above are selected and fitted over the whole cohort: the presence and variance screening that chose the metrics has seen every run, including any later period, so they describe this history rather than predicting a future one."
  ];
  if(!L.enoughEvents)return head
    +mlWarn(`Coefficients are not shown. There are ${L.nPos} flagged and ${L.nNeg} clean run(s) across ${L.p} metrics (${mlNum(L.eventsPerFeature,2)} events per metric). Below roughly one event per metric, and five in each class, the weights of such a model are not interpretable.`)
    +mlNote(caveats.join(" "));
  const w=L.w.map((v,j)=>({k:keys[j],v})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,10);
  /* The host renderer draws VERTICAL bars: x is the position, y is the height
     and the third value is the baseline. Revision 2 passed [coefficient, rank,
     0], so every rectangle's height was its rank and a negative coefficient
     became a positive-height bar standing to the left of zero. There is no
     horizontal bar type to reach for, so each coefficient is drawn as a line
     segment from zero to its value on its own row, with a point at the end. */
  const span=extent(w.map(o=>o.v).concat([0]),0.25);
  const fig=mlPlot({title:ui("Metrics associated with a run that produced a forensic finding"),
    width:880,height:Math.max(220,60+w.length*26),x:span,y:[0.4,w.length+0.6],
    xlab:ui("weight (standardised metric, log-odds) — bar length is the weight, sign is its direction"),
    yticks:false,left:210,
    series:w.map((o,i)=>({type:"line",colour:o.v>0?"#2563eb":"#0891b2",width:9,
        data:[[0,w.length-i],[o.v,w.length-i]],tip:`${o.k}: ${mlNum(o.v,3)}`}))
      .concat([{type:"points",r:3.2,data:w.map((o,i)=>[o.v,w.length-i,
        `${o.k}: ${mlNum(o.v,3)}`,o.v>0?"#1d4ed8":"#0e7490"])}]),
    vlines:[{x:0,label:"",colour:"#9ca3af",dash:"1 0"}],
    texts:w.map((o,i)=>({px:200,y:w.length-i,text:o.k,size:10,anchor:"end",colour:"#374151"}))
      .concat(w.map((o,i)=>({x:o.v,y:w.length-i,text:" "+mlNum(o.v,3),size:10,
        anchor:o.v>0?"start":"end",colour:"#6b7280"}))),
    legend:[{label:ui("higher value, finding more likely"),colour:"#2563eb"},
      {label:ui("higher value, finding less likely"),colour:"#0891b2"}]});
  const perf=table([{key:"what",label:"Evaluation"},{key:"auc",label:"Area under the ROC curve",n:1},
    {key:"note",label:"How to read it"}],
    [{what:"In-sample",auc:mlNum(L.aucIn,3),note:ui("fitted and scored on the same runs: an optimistic estimate of the fit, with no ordering relation to the line below — a later period can be easier and score higher")},
     {what:L.nTest>0?`Out-of-time (${L.nTrain} earlier runs → ${L.nTest} later runs)`:"Out-of-time (not possible on this cohort)",
      auc:Number.isFinite(L.aucOut)?mlNum(L.aucOut,3):"—",
      note:Number.isFinite(L.aucOut)
        ?ui("fitted on the earlier period and scored on the later one, with the feature schema and the standardisation both derived from the training runs only — this is the number that speaks to a later run")
        :ui("not computed: ")+L.outWhy+ui(". Without it the line above cannot be read as evidence that the association holds for a future run.")}]);
  return head+`<div class="chart-wrap">${fig}</div>
    ${table([{key:"metric",label:"Metric"},{key:"w",label:"Weight",n:1},{key:"dir",label:"Reading"}],
      w.map(o=>({metric:o.k,w:mlNum(o.v,3),dir:ui(o.v>0?"a high value goes with a finding":"a high value goes with a clean run")})))}
    ${perf}${mlNote(caveats.join(" "))}`;
}

/* ---------- the panel ---------------------------------------------------
   Computed when opened, not when the chart is drawn, so a cabinet with a
   hundred runs opens its charts exactly as fast as before. Each panel keeps
   its OWN chart result in a registry keyed from its element: reading a global
   meant a second chart opened in the same card could be described by the
   first one's numbers. Recompute refits from scratch, which is also how the
   trace is obtained after ML_TRACE is switched on. */
function mlAdvisoryBody(token){
  const ctx=ML_PANELS.get(token);
  if(!ctx)return mlNote("This panel's context is no longer available. Press Recompute.");
  const res=ctx.res;
  try{
    const S=mlSeries(res);
    /* The funnel plot is declined outright, and that means the WHOLE layer:
       revision 2 declined the series panels and then carried on into the
       multivariate ones, which made the stated scope untrue. */
    if(S.funnel)return mlNote(S.why);
    const parts=[];
    const cohort=mlCohort(res,ctx);
    parts.push(mlCohortNote(cohort));
    if(!S.ok)parts.push(mlNote(S.why));
    else{
      if(S.segment)parts.push(mlNote("Control material charted in the three panels below: "+S.segment+"."));
      const a=mlPanelForecast(res,S),b=mlPanelChange(res,S),c=mlPanelAnomaly(res,S);
      parts.push(`<h4>${esc(ui("Where the next runs land"))}</h4>${a.html}`,
        `<h4>${esc(ui("When the level moved"))}</h4>${b.html}`,
        `<h4>${esc(ui("Runs that stand out"))}</h4>${c.html}`);
    }
    /* Two populations, named. The panels above are the current control-material
       extract where there is one; the panels below are every run in the cohort,
       because a decomposition over several metrics needs the runs that have
       them. The scope is part of the cache identity. */
    const scope=S.ok&&S.segmentKey?"all extracts":"whole cohort";
    const mv=mlMultivariate(cohort,scope);
    const scopeNote=S.ok&&S.segmentKey
      ?mlWarn(`The panels from here on are computed over ALL ${cohort.n} run(s) in the cohort, including the earlier control-material extracts that the three panels above set aside. They describe a different population; a difference between the two is not a finding about either.`)
      :"";
    parts.push(mlPanelMulti(mv,cohort,scopeNote),mlPanelClusters(mv),mlPanelDrivers(mv));
    parts.push(mlNote(`${ML_VERSION} · SOP profile ${SOP.name} v${SOP.version} sha256 ${sopHash()} · cohort ${cohort.instrument}${cohort.protocol?" / "+cohort.protocol:""} · multivariate scope: ${scope} · input key ${mv.fingerprint} (an 8-character digest of the full dependency key, shown for reference; the cache compares the key itself) · deterministic: the same inputs give the same output.`));
    return parts.join("");
  }catch(e){
    console.error("advisory analytics",e);
    return mlNote("The advisory layer could not be computed for this chart ("+(e&&e.message||"unknown reason")+"). The chart itself, its limits and its alarms are unaffected.");
  }
}
function mlAdvisoryHtml(res){
  if(!res)return "";
  const token="ml"+(++ML_PANEL_N);
  /* capture the settings the panel will be computed under, so that opening it
     later cannot silently pick up a different instrument or protocol filter */
  ML_PANELS.set(token,{res,instrument:CC_STATE.instrument,protocol:CC_STATE.protocol||"",
    variant:CC_STATE.variant||""});
  /* keep the registry small: a long session opens many charts */
  if(ML_PANELS.size>8)ML_PANELS.delete(ML_PANELS.keys().next().value);
  return `<details class="sop-sec" id="cc-ml" data-ml="${token}">
    <summary>${esc(ui("Advisory analytics — learned from this instrument's own history"))}</summary>
    <div class="toolbar"><button class="ghost" data-ml-recompute="${token}" type="button">${esc(ui("Recompute"))}</button>
      <span class="hint">${esc(ui("Computed when this section is opened. Set ML_TRACE = true in the browser console and press Recompute to report every fit's progress, objective and convergence to the console; the figures and numbers are identical with the trace on or off."))}</span></div>
    <div data-ml-body="${token}"><p class="hint">${esc(ui("Computed when this section is opened."))}</p></div></details>`;
}
function mlAdvisoryBind(card){
  const root=card||document;
  root.querySelectorAll("[data-ml]").forEach(d=>{
    const token=d.dataset.ml;
    const body=root.querySelector(`[data-ml-body="${token}"]`);
    const fill=()=>{
      if(!body)return;
      body.innerHTML=`<p class="hint">${esc(ui("Computing…"))}</p>`;
      setTimeout(()=>{body.innerHTML=mlAdvisoryBody(token);
        if(typeof localizeDOM==="function")localizeDOM(body);},0);
    };
    d.addEventListener("toggle",()=>{if(d.open&&!d.dataset.filled){d.dataset.filled="1";fill();}});
    const btn=root.querySelector(`[data-ml-recompute="${token}"]`);
    if(btn)btn.onclick=e=>{e.preventDefault();e.stopPropagation();
      ML_STATE.mv=null;d.dataset.filled="1";d.open=true;fill();};
  });
}

