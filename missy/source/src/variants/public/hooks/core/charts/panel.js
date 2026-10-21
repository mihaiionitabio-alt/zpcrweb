/* ============================================================
   C3. Control panel — history, tiles, chart page, settings
   ============================================================ */
const CC_STATE={instrument:"",protocol:"",filter:"all",open:null,variant:"",imported:[],remember:false,cache:null};
const CC_HIST_KEY="qpcr_cc_history_v1";
const CC_COL={ok:"#16a34a",warn:"#d97706",bad:"#dc2626",none:"#94a3b8",pt:"#2563eb",line:"#64748b",rule:"#f59e0b"};
/* A flag is a LIMIT signal when the point itself lies outside a control or specification limit, and a RULE signal when the
   point is inside the limits but belongs to a suspicious pattern (Western Electric 2–5, Westgard 2-2s/4-1s/10-x). Both are
   kept; they are drawn and reported differently so that a red point always means "outside". */
const CC_SEG_PALETTE=["#2563eb","#7c3aed","#0891b2","#16a34a","#db2777","#4b5563","#65a30d","#0e7490"];
const CC_LIMIT_FLAG=/beyond 3σ|beyond limit|specification|^1-3s$|off the trend|CUSUM|EWMA|above [puc] limit|mean beyond|spread \(S\)|99\.8/;
function ccSignal(p){const f=(p&&p.flags)||[];if(!f.length)return "";return f.some(x=>CC_LIMIT_FLAG.test(x))?"limit":"rule";}
function ccPlatformBase(run){return run.platform==="QuantStudio"?"QS":"LC";}
function ccPlatform(...args){return MISSY_HOOKS.invoke("ccPlatform",this,args,ccPlatformBase);}

function ccInstrumentKey(run){const m=run.meta||{};return `${ccPlatform(run)} · ${m.InstrumentID||m.SerialNumber||m.InstrumentName||"unknown instrument"}`;}
function ccOperator(run){const m=run.meta||{};return String(m.Technician||m.CreatedByName||"").trim()||"(not recorded)";}
/* one history row per loaded run: static part cached on the run, dynamic part follows the SOP */
function ccRowsFromRunsBase(){
  const h=sopHash();
  if(CC_STATE.cache&&CC_STATE.cache.runs===RUNS&&CC_STATE.cache.hash===h)return CC_STATE.cache.rows;
  const evs=new Map(sopEvaluateAll().map(e=>[e.run,e])),counts=forensicCounts();
  const rows=RUNS.filter(r=>!r.isTemplate).map(run=>{
    if(!run.ccStatic)run.ccStatic=ccStatic(run);
    const ev=evs.get(run),T=runTimes(run),st=run.ccStatic;
    const m=Object.assign({},st,ccDynamic(run,ev,counts));
    return {key:(run.meta||{}).sourceSHA256||run.file,run:runName(run),file:run.file,platform:ccPlatform(run),instrument:ccInstrumentKey(run),
      date:Number.isFinite(T.start)?T.start:(Number.isFinite(T.created)?T.created:NaN),operator:ccOperator(run),
      software:(run.meta||{}).SWVersion||"",firmware:st.firmware||(run.meta||{}).InstrumentVersion||"",
      block_cycles:st.block_cycles,protocol:ccProtocolKey(run),sop:SOP.name+" v"+SOP.version,m,loaded:true};
  });
  CC_STATE.cache={runs:RUNS,hash:h,rows};return rows;
}
function ccRowsFromRuns(...args){return MISSY_HOOKS.invoke("ccRowsFromRuns",this,args,ccRowsFromRunsBase);}

function ccAllRowsBase(){
  const loaded=ccRowsFromRuns(),keys=new Set(loaded.map(r=>r.key));
  return CC_STATE.imported.filter(r=>!keys.has(r.key)).concat(loaded);
}
function ccAllRows(...args){return MISSY_HOOKS.invoke("ccAllRows",this,args,ccAllRowsBase);}

function ccInstruments(){const by=byKey(ccAllRows(),r=>r.instrument);return [...by].sort((a,b)=>b[1].length-a[1].length).map(([k,v])=>({key:k,n:v.length,platform:v[0].platform}));}
function ccRowsFor(inst){
  const all=ccAllRows().filter(r=>r.instrument===inst).sort((a,b)=>(a.date||0)-(b.date||0));
  let h0=0;all.forEach(r=>{r.hours=h0;h0+=(Number(r.m.run_minutes)||0)/60;});   // run hours count every run on the instrument
  const rows=CC_STATE.protocol?all.filter(r=>(r.protocol||"")===CC_STATE.protocol):all;
  return rows;
}
/* ---------- series and chart computation ---------- */
function ccVariants(def,rows){if(!def.variants)return [];
  const c=new Map();rows.forEach(r=>{const v=r.m[def.metric||def.id];if(v&&typeof v==="object"){if((def.id==="ntc_rate"||def.id==="ntc_op")&&Number.isFinite(v.n))c.set("legacy pooled (stage unknown)",1);else Object.keys(v).forEach(k=>c.set(k,(c.get(k)||0)+1));}});
  return [...c].sort((a,b)=>b[1]-a[1]).map(x=>x[0]);}
function ccValue(def,row,variant){const v=row.m[def.metric||def.id];if(v==null)return undefined;
  if(def.id==="ntc_rate"||def.id==="ntc_op"){if(Number.isFinite(v.n))return variant==="legacy pooled (stage unknown)"?v:undefined;}
  return def.variants?v[variant]:v;}
function ccXAxis(def,cfg,rows){
  const want=cfg.x||def.x||"order";
  if(want==="cycles"&&rows.some(r=>Number.isFinite(r.block_cycles)))return {kind:"cycles",label:"Block cycles (instrument counter)",x:rows.map(r=>r.block_cycles)};
  if(want==="hours"||(want==="cycles"))return {kind:"hours",label:"Observed cumulative run hours (loaded archive)",x:rows.map(r=>r.hours)};
  if(want==="date")return {kind:"date",label:"Date",x:rows.map(r=>(r.date||0)/864e5)};
  return {kind:"order",label:"Run (in date order)",x:rows.map((r,i)=>i+1)};
}
function ccSpec(def,cfg,platform,keep,variant){const d=Object.assign({},((def.spec||{})[platform])||{});
  const n=v=>v===""||v==null?NaN:Number(v);
  if(def.specRel&&keep&&keep.length){   // limit relative to the first runs (e.g. lamp: 50 % of the starting intensity)
    const first=keep.slice(0,3).map(r=>{const v=ccValue(def,r,variant);return typeof v==="object"&&v?v.mean:Number(v);}).filter(Number.isFinite);
    if(first.length){if(def.specRel.lo!=null)d.lo=def.specRel.lo*mean(first);if(def.specRel.hi!=null)d.hi=def.specRel.hi*mean(first);}}
  return {lo:Number.isFinite(n(cfg.specLo))?n(cfg.specLo):n(d.lo),hi:Number.isFinite(n(cfg.specHi))?n(cfg.specHi):n(d.hi)};}
function ccCompute(def,rows,variant){
  const cfg=ccCfg(def.id),type=cfg.type||def.type,platform=rows[0]?rows[0].platform:"LC";
  const all=rows.filter(r=>ccValue(def,r,variant)!==undefined);
  const Xall=ccXAxis(def,cfg,all),spec=ccSpec(def,cfg,platform,all,variant);
  /* re-baseline: Phase I starts at the first run on or after cfg.baseFrom; earlier runs are drawn grey, without limits or alarms */
  const t0=cfg.baseFrom?Date.parse(cfg.baseFrom):NaN;let s0=0;
  if(Number.isFinite(t0)){s0=all.findIndex(r=>(r.date||0)>=t0);if(s0<0)s0=all.length;}
  const keep=all.slice(s0),X={kind:Xall.kind,label:Xall.label,x:Xall.x.slice(s0)};
  cfg.res=def.res?(def.res[platform]||0):0;
  let res;
  if(type==="funnel"){const fr=rows.map(r=>({...r,m:{...r.m,[def.metric||def.id]:ccValue(def,r,variant)}}));res=ccFunnel(fr,def.metric||def.id);res.nRows=fr.filter(r=>r.m[def.metric||def.id]&&r.m[def.metric||def.id].n>0).length;}
  else if(type==="p"){const v=keep.map(r=>ccValue(def,r,variant));res=ccP(v.map(o=>o.bad),v.map(o=>o.n),cfg);}
  else if(type==="u"){const v=keep.map(r=>ccValue(def,r,variant));res=ccU(v.map(o=>o.count),v.map(o=>o.exposure),cfg);}
  else if(type==="c"){res=ccC(keep.map(r=>ccValue(def,r,variant).count),cfg);}
  else if(type==="xbars"){res=ccXbarS(keep.map(r=>ccValue(def,r,variant)),cfg);}
  else{
    const y=keep.map(r=>{const v=ccValue(def,r,variant);return typeof v==="object"&&v?v.mean:Number(v);});
    const one=(yy,xx)=>{const r=type==="trend"?ccTrend(xx,yy,cfg,spec):type==="ewma"?ccEWMA(yy,cfg):type==="cusum"?ccCUSUM(yy,cfg):ccI(yy,cfg);
      if(def.westgard&&type==="i")ccWestgard(r);return r;};
    /* control materials: each extract gets its own baseline and limits (a new extract is a new process) */
    const seg=def.segmentBy==="batch"?keep.map(r=>((r.m.pc_batch||{})[variant])||"extract not recorded"):null;
    if(seg&&new Set(seg).size>1){
      /* extracts can alternate on the same instrument: each extract is charted on its own runs (in date order),
         with its own baseline, and the points are put back in run order */
      const groups=[];seg.forEach((k,i)=>{let g=groups.find(q=>q.key===k);if(!g){g={key:k,idx:[]};groups.push(g);}g.idx.push(i);});
      res={pts:new Array(y.length),segments:[],segmented:true};const lastKey=seg[seg.length-1];
      groups.forEach(g=>{const yy=g.idx.map(i=>y[i]),xx=g.idx.map(i=>X.x[i]),r=one(yy,xx),nn=yy.filter(Number.isFinite).length,ready=nn>=ccBaselineNeed(cfg);
        if(!ready){r.pts.forEach(p=>{p.flags=[];p.cl=p.ucl=p.lcl=NaN;});delete r.reach;}
        r.pts.forEach((p,j)=>{p.segment=g.key;res.pts[g.idx[j]]=p;});res.segments.push({key:g.key,x:X.x[g.idx[0]],n:nn,ready,last:g.key===lastKey});
        if(g.key===lastKey){res.cl=r.cl;res.sigma=r.sigma;res.slope=r.slope;res.intercept=r.intercept;if(r.reach)res.reach=r.reach;}});
    }else{res=one(y,X.x);if(seg)res.pts.forEach(p=>{p.segment=seg[0];});if(seg)res.segments=[{key:seg[0],x:X.x[0],n:y.filter(Number.isFinite).length,ready:true}];}
  }
  const eligible=res.pts.filter(p=>Number.isFinite(p.raw!==undefined?p.raw:p.y)).length;
  const cohortOK=new Set(keep.map(r=>`${r.instrument}|${r.protocol||"unknown"}|${r.firmware||""}`)).size<=1;
  res.baselineReady=(res.segmented?res.segments.some(g=>g.ready):eligible>=ccBaselineNeed(cfg))&&cohortOK;res.cohortOK=cohortOK;
  if(type!=="funnel"&&!res.baselineReady){res.pts.forEach(p=>{p.flags=[];p.cl=p.ucl=p.lcl=p.sUcl=NaN;});delete res.reach;}
  if(type!=="funnel")res.pts.forEach((p,i)=>{p.row=keep[i];p.x=X.x[i];
    const raw=p.raw!==undefined?p.raw:p.y;
    if(Number.isFinite(spec.lo)&&raw<spec.lo)p.flags=p.flags.concat("below specification");
    if(Number.isFinite(spec.hi)&&raw>spec.hi)p.flags=p.flags.concat("above specification");});
  if(type!=="funnel"&&s0>0){
    const pre=all.slice(0,s0).map((r,i)=>{const v=ccValue(def,r,variant);let y=NaN,s;
      if(type==="i"||type==="trend")y=typeof v==="object"&&v?v.mean:Number(v);
      else if(type==="xbars"&&v){y=v.mean;s=v.sd;}
      else if(type==="p"&&v&&v.n)y=v.bad/v.n;else if(type==="u"&&v&&v.exposure)y=v.count/v.exposure;else if(type==="c"&&v)y=v.count;
      return {y,s,raw:y,cl:NaN,ucl:NaN,lcl:NaN,flags:[],pre:true,row:r,x:Xall.x[i]};});
    res.pts=pre.concat(res.pts);res.baseX=Xall.x[s0];
  }
  Object.assign(res,{type,cfg,X:Xall,spec,n:all.length,nBase:keep.length,s0,def,variant});
  res.shift=ccShift(res);return res;
}
/* sustained shift: the first run from which 8 consecutive runs are outside the limits on the same side and at least
   70 % of all later runs stay outside on that side. Reported with the level before and after and whether the new level
   is still inside the specification. */
function ccShift(res){
  if(!res.baselineReady||res.segmented||!["i","trend","xbars"].includes(res.type))return null;
  const pts=res.pts.filter(p=>!p.pre&&Number.isFinite(p.y)&&Number.isFinite(p.cl)),n=pts.length,run=8;
  const dir=p=>ccSignal(p)==="limit"&&p.flags.some(f=>!/specification/.test(f))?Math.sign(p.y-p.cl):0;
  for(let k=1;k+run<=n;k++){const d=dir(pts[k]);if(!d||dir(pts[k-1])===d)continue;
    if(!pts.slice(k,k+run).every(p=>dir(p)===d))continue;
    const after=pts.slice(k),share=after.filter(p=>dir(p)===d).length/after.length;if(share<0.7)continue;
    const raw=p=>p.raw!==undefined?p.raw:p.y,sp=res.spec||{},inSpec=after.every(p=>!(raw(p)<sp.lo)&&!(raw(p)>sp.hi));
    return {i:res.pts.indexOf(pts[k]),x:pts[k].x,date:pts[k].row&&pts[k].row.date,run:pts[k].row&&pts[k].row.run,n:after.length,dir:d,
      before:ccMedian(pts.slice(0,k).map(raw)),after:ccMedian(after.map(raw)),inSpec,hasSpec:Number.isFinite(sp.lo)||Number.isFinite(sp.hi)};}
  return null;
}
function ccStatus(res){
  if(res.type==="funnel"){
    if(res.pts.length<2||res.nRows<5)return {level:"none",text:res.pts.length<2?"needs two or more operators":"needs five or more runs"};
    const bad=res.pts.filter(p=>p.flags.some(f=>/99.8/.test(f))).length,warn=res.pts.filter(p=>p.flags.length).length;
    return {level:res.pts.length<2?"none":bad?"bad":warn?"warn":"ok",text:res.pts.length<2?"needs two or more operators":bad?`${bad} operator(s) outside 99.8 %`:warn?`${warn} outside 95 %`:"all operators within limits"};}
  const pts=res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre);
  if(!pts.length)return {level:"none",text:res.s0?"no runs since the new baseline date":ccNoDataReason(res.def)};
  const last=pts[pts.length-1],recent=pts.slice(-5).filter(p=>p.flags.length);
  if(!res.baselineReady)return {level:last.flags.length?"bad":"none",text:(last.flags.length?last.flags.join(", ")+" · ":"")+(res.cohortOK===false?"mixed instrument/protocol/firmware cohort — select comparable runs":`collecting baseline: ${pts.length} of ${ccBaselineNeed(res.cfg)} runs — exploratory only`),last:last.raw!==undefined?last.raw:last.y};
  const lastSig=ccSignal(last),hard=lastSig==="limit"||(lastSig==="rule"&&res.def.westgard);
  const lastSeg=res.segmented&&res.segments?res.segments.find(g=>g.last):null;
  if(lastSeg&&!lastSeg.ready){const sg=lastSeg;
    return {level:"none",text:`new control extract (${sg.key}): ${sg.n} of ${ccBaselineNeed(res.cfg)} runs — no limits yet for this extract`,last:last.raw!==undefined?last.raw:last.y};}
  let level=hard?"bad":lastSig?"warn":recent.some(p=>ccSignal(p)==="limit")?"warn":recent.length?"warn":"ok",
    text=lastSig==="limit"?"outside the limits: "+last.flags.join(", "):lastSig==="rule"?"pattern inside the limits: "+last.flags.join(", "):recent.length?"signal in the last 5 runs":"in control";
  if(res.shift&&lastSig==="limit"){const h=res.shift,f=v=>fmtTick(+Number(v).toPrecision(4));
    text=`sustained shift since ${h.date?sopFmtTime(h.date).slice(0,10):"run "+h.run} (${f(h.before)} → ${f(h.after)} ${res.def.unit||""}, ${h.n} runs)`
      +(h.hasSpec?(h.inSpec?" · still inside the specification":" · outside the specification"):"")+" — find the cause; if the new level is accepted, start a new baseline on that date";
    if(h.hasSpec&&h.inSpec)level="warn";}
  if(res.reach){let runs=res.reach.ahead;
    if(res.X.kind!=="order"){const xs=pts.map(p=>p.x),step=(xs[xs.length-1]-xs[0])/Math.max(1,xs.length-1);runs=step>0?res.reach.ahead/step:Infinity;}
    if(runs<=res.cfg.warnAhead&&level==="ok"){level="warn";}
    text+=` · limit ${fmtTick(+res.reach.limit.toPrecision(3))} in ≈ ${Number.isFinite(runs)?Math.round(runs):"∞"} runs`;}
  if(pts.length<Math.min(res.cfg.phase1,20))text=`baseline ${pts.length}/${res.cfg.phase1} runs · `+text;
  return {level,text,last:last.raw!==undefined?last.raw:last.y};
}
/* ---------- drawing ---------- */
function ccSpark(res,st){
  const W=150,H=38,pts=res.type==="funnel"?[]:res.pts.filter(p=>Number.isFinite(p.y)&&!p.pre);
  if(!pts.length)return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><text x="4" y="24" font-size="10" fill="#94a3b8">no data</text></svg>`;
  const ys=pts.flatMap(p=>[p.y,p.ucl,p.lcl]).filter(Number.isFinite),lo=Math.min(...ys),hi=Math.max(...ys)||1,span=hi-lo||1;
  const X=i=>4+i*(W-8)/Math.max(1,pts.length-1),Y=v=>H-4-(v-lo)/span*(H-8);
  const line=k=>pts.every(p=>Number.isFinite(p[k]))?`<polyline fill="none" stroke="#cbd5e1" stroke-dasharray="3 2" points="${pts.map((p,i)=>`${X(i).toFixed(1)},${Y(p[k]).toFixed(1)}`).join(" ")}"/>`:"";
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${line("ucl")}${line("lcl")}
    <polyline fill="none" stroke="#64748b" stroke-width="1.2" points="${pts.map((p,i)=>`${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ")}"/>
    ${pts.map((p,i)=>p.flags.length?`<circle cx="${X(i).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="2.4" fill="${ccSignal(p)==="limit"?CC_COL.bad:CC_COL.rule}"/>`:"").join("")}
    <circle cx="${X(pts.length-1).toFixed(1)}" cy="${Y(pts[pts.length-1].y).toFixed(1)}" r="3.4" fill="${CC_COL[st.level]}"/></svg>`;
}
function ccVersionMarks(res){
  const out=[];let prev=null;
  res.pts.forEach(p=>{if(!p.row)return;const v=`${p.row.firmware||""}|${p.row.software||""}`;if(prev!==null&&v!==prev)out.push({x:p.x,label:"version change",colour:"#7c3aed",dash:"2 3"});prev=v;});
  return out;
}
function ccChartSvg(res,title){
  const def=res.def,unit=def.unit||"";
  if(res.type==="funnel"){
    if(!res.pts.length)return svgMessage("No operator data for this chart.");
    const nmax=Math.max(...res.pts.map(p=>p.n))*1.1,grid=Array.from({length:60},(_,i)=>1+i*(nmax-1)/59),p0=res.p0;
    const curve=z=>grid.map(n=>[n,Math.min(1,p0+z*Math.sqrt(p0*(1-p0)/n))]);
    return svgPlot({title,x:[0,nmax],y:[0,Math.max(0.05,...res.pts.map(p=>p.y),...curve(3.09).map(c=>c[1]))*1.1],xlab:"Number of items (workload)",ylab:unit,
      series:[{type:"line",colour:"#f59e0b",dash:"5 4",data:curve(1.96),tip:"95 %"},{type:"line",colour:"#dc2626",dash:"5 4",data:curve(3.09),tip:"99.8 %"},
        {type:"points",r:5.5,data:res.pts.map(p=>[p.n,p.y,`${p.operator}: ${p.bad}/${p.n} = ${(100*p.y).toFixed(1)} %`,p.flags.length?CC_COL.bad:CC_COL.pt])}],
      hlines:[{y:p0,label:`overall ${(100*p0).toFixed(1)} %`,colour:"#374151",dash:"1 0"}],
      texts:res.pts.map(p=>({x:p.n,y:p.y,text:"  "+p.operator,size:10})),legend:[{label:"95 % limit",colour:"#f59e0b"},{label:"99.8 % limit",colour:"#dc2626"}]});
  }
  const pts=res.pts.filter(p=>Number.isFinite(p.y));
  if(!pts.length)return svgMessage("No data for this chart in the loaded runs or the imported history.");
  const lim=k=>pts.filter(p=>Number.isFinite(p[k])).map(p=>[p.x,p[k]]);
  const opCol=new Map(),byOp=def.byOperator&&uniq(pts.map(p=>p.row.operator)).length>1;
  const segCol=new Map(),bySeg=!!res.segmented,segColour=(m,k)=>{k=String(k||"—");if(!m.has(k))m.set(k,CC_SEG_PALETTE[m.size%CC_SEG_PALETTE.length]);return m.get(k);};
  const colourOf=p=>p.pre?"#cbd5e1":ccSignal(p)==="limit"?CC_COL.bad:ccSignal(p)==="rule"?CC_COL.rule:byOp?catColour(opCol,p.row.operator):bySeg?segColour(segCol,p.segment):CC_COL.pt;
  const tip=(p,side)=>`${p.row.run} · ${sopFmtTime(p.row.date)} · ${p.row.operator}${side?" · "+(side==="lo"?"lower sum":"upper sum"):""}\n${fmtTick(+Number(p.raw!==undefined?p.raw:p.y).toPrecision(4))} ${unit}${p.segment?"\ncontrol extract: "+p.segment:""}${(p.flags.length&&(!side||(side==="lo"?p.sigLo:p.sigHi)))?"\n"+(ccSignal(p)==="limit"?"⚠ outside the limits: ":"△ pattern inside the limits: ")+p.flags.join(", "):""}`;
  const series=[{type:"line",colour:"#94a3b8",width:1,data:pts.map(p=>[p.x,p.y])}];
  [...byKey(pts,p=>p.segment||"")].forEach(([key,sp])=>{const L=k=>sp.filter(p=>Number.isFinite(p[k])).map(p=>[p.x,p[k]]),c=bySeg?segColour(segCol,key):null;
    series.push({type:"line",colour:c||"#475569",dash:"6 4",width:1.2,data:L("ucl")},{type:"line",colour:c||"#475569",dash:"6 4",width:1.2,data:L("lcl")},
      {type:"line",colour:c||"#16a34a",width:1.2,data:L("cl")});});
  /* A point is red only on the series whose own statistic is outside its limit. On a CUSUM
     chart the upper and the lower sum are two series: a lower-sum alarm must not paint the
     upper sum, which is sitting at zero inside the band. */
  const cusumColour=(p,side)=>p.pre?"#cbd5e1":(side==="lo"?p.sigLo:p.sigHi)?CC_COL.bad:(side==="lo"?"#0891b2":CC_COL.pt);
  if(res.type==="cusum"){
    series.push({type:"line",colour:"#0891b2",width:1.2,data:pts.map(p=>[p.x,p.y2])},
      {type:"points",r:3,colour:"#0891b2",data:pts.map(p=>[p.x,p.y2,tip(p,"lo"),cusumColour(p,"lo")])});
    series.push({type:"points",r:4,data:pts.map(p=>[p.x,p.y,tip(p,"hi"),cusumColour(p,"hi")])});
  }else series.push({type:"points",r:4,data:pts.map(p=>[p.x,p.y,tip(p),colourOf(p)])});
  const hl=[];if(Number.isFinite(res.spec.lo)&&res.type!=="cusum"&&res.type!=="p")hl.push({y:res.spec.lo,label:`lower spec ${fmtTick(+res.spec.lo.toPrecision(4))}`,colour:"#7f1d1d",dash:"2 2"});
  if(Number.isFinite(res.spec.hi)&&res.type!=="cusum")hl.push({y:res.spec.hi,label:`upper spec ${fmtTick(+res.spec.hi.toPrecision(4))}`,colour:"#7f1d1d",dash:"2 2"});
  const px=pts.map(p=>p.x),pmin=Math.min(...px),pmax=Math.max(...px),room=pmax+0.35*Math.max(1e-9,pmax-pmin);let clipped=false,atShow=NaN;
  if(res.reach){const r=res.reach;atShow=Math.min(r.at,room);clipped=r.at>room;
    series.push({type:"line",colour:"#7c3aed",dash:"3 3",data:[[pts[pts.length-1].x,res.intercept+res.slope*pts[pts.length-1].x],[atShow,res.intercept+res.slope*atShow]],tip:"projection"});}
  /* The y-scale is set by what is plotted — the values and their control limits. A
     specification far outside that range would squeeze the data into a sliver, so it is
     drawn only when it is near the data and is otherwise reported in words. */
  const core=pts.flatMap(p=>[p.y,p.y2,p.ucl,p.lcl]).filter(Number.isFinite);
  const cLo=Math.min(...core),cHi=Math.max(...core),cSpan=Math.max(1e-9,cHi-cLo);
  const nearScale=v=>Number.isFinite(v)&&v>=cLo-0.6*cSpan&&v<=cHi+0.6*cSpan;
  const hlFar=hl.filter(h=>!nearScale(h.y));
  const hlNear=hl.filter(h=>nearScale(h.y));
  const ys=core.concat(hlNear.map(h=>h.y)).concat(res.reach&&!clipped&&nearScale(res.reach.limit)?[res.reach.limit]:[]).filter(Number.isFinite);
  const xs=px.concat(res.reach?[atShow]:[]),[xa,xb]=extent(xs,0.03);
  const xticks=res.X.kind==="date"?niceTicks(xa,xb,6).map(v=>({v,label:sopFmtTime(v*864e5).slice(0,10)}))
    :res.X.kind==="order"?niceTicks(xa,xb,8).filter(v=>Number.isInteger(v)).map(v=>({v,label:String(v)})):undefined;
  const legend=byOp?legendFromMap(opCol):bySeg?legendFromMap(segCol).concat([{label:"outside limits",colour:CC_COL.bad},{label:"pattern, in limits",colour:CC_COL.rule}])
    :[{label:"in control",colour:CC_COL.pt},{label:"outside limits",colour:CC_COL.bad},{label:"pattern, in limits",colour:CC_COL.rule},{label:"centre / fitted line",colour:"#16a34a"},{label:"control limits",colour:"#475569"}];
  const ylab=res.type==="cusum"?"CUSUM (σ units): upper / lower":res.type==="ewma"?`EWMA of ${unit}`:res.type==="p"?`share (${unit})`:res.type==="u"?unit:unit;
  const vl=ccVersionMarks(res);if(res.shift)vl.push({x:res.shift.x-0.5*(res.X.kind==="order"?1:0),label:"shift starts",colour:"#7c3aed",dash:"3 3"});if(Number.isFinite(res.baseX))vl.push({x:res.baseX,label:"new baseline",colour:"#0f766e",dash:"6 3"});
  (res.segments||[]).slice(1).forEach((sg,i)=>vl.push({x:sg.x-0.5*(res.X.kind==="order"?1:0),label:"",colour:segColour(segCol,sg.key),dash:"2 4"}));
  const tx=[];
  hlFar.forEach((h,i)=>tx.push({px:null,x:pts[0].x,y:(h.y<cLo?cLo:cHi),
    text:`${h.label} — ${h.y<cLo?"below":"above"} this scale`,anchor:"start",size:11,colour:"#7f1d1d"}));
  if(res.reach&&clipped)tx.push({px:null,x:atShow,y:res.intercept+res.slope*atShow,text:`→ limit ${fmtTick(+res.reach.limit.toPrecision(3))} beyond this chart`,anchor:"end",size:10,colour:"#7c3aed"});
  return svgPlot({title,x:[xa,xb],y:extent(ys,0.08),xticks,xlab:res.X.label,ylab,series,hlines:hlNear,vlines:vl,legend,texts:tx});
}
function ccSChartSvg(res){
  const pts=res.pts.filter(p=>Number.isFinite(p.s)&&!p.pre);if(!pts.length)return "";
  return svgPlot({title:"S chart (within-run spread)",height:230,x:extent(pts.map(p=>p.x),0.03),y:[0,Math.max(...pts.map(p=>Math.max(p.s,p.sUcl||0)))*1.15],xlab:res.X.label,ylab:"S",
    series:[{type:"line",colour:"#94a3b8",width:1,data:pts.map(p=>[p.x,p.s])},{type:"line",colour:"#475569",dash:"6 4",data:pts.map(p=>[p.x,p.sUcl])},
      {type:"points",r:3.5,data:pts.map(p=>[p.x,p.s,`${p.row.run}: S = ${fmtTick(+p.s.toPrecision(3))}`,p.flags.some(f=>/spread/.test(f))?CC_COL.bad:CC_COL.pt])}],
    hlines:[{y:res.sbar,label:"S̄",colour:"#16a34a",dash:"1 0"}]});
}
/* ---------- the panel ---------- */
function renderPanelBase(){
  const box=$("#cc-tiles");if(!box)return;
  const insts=ccInstruments();
  setSelectItems($("#cc-inst"),insts.map(i=>({value:i.key,label:`${i.key} (${i.n} run${i.n>1?"s":""})`})),CC_STATE.instrument);
  CC_STATE.instrument=$("#cc-inst").value;
  const protos=[...byKey(ccAllRows().filter(r=>r.instrument===CC_STATE.instrument),r=>r.protocol||"")].sort((a,b)=>b[1].length-a[1].length);
  setSelectItems($("#cc-proto"),[{value:"",label:"All protocols"},...protos.map(([k,v])=>({value:k,label:`${v.length} run(s): ${k||"(not recorded)"}`}))],CC_STATE.protocol);
  CC_STATE.protocol=$("#cc-proto").value;
  if(!insts.length){box.innerHTML=emptyReview("Load .ixo or .eds runs (or import an instrument history) to fill the control panel.");$("#cc-summary").innerHTML="";$("#cc-detail").hidden=true;return;}
  const rows=ccRowsFor(CC_STATE.instrument),platform=rows[0].platform;
  const results=CC_CHARTS.filter(d=>d.inst.includes(platform)).map(d=>{
    const vs=ccVariants(d,rows),variant=vs[0]||"",res=ccCompute(d,rows,variant),st=ccStatus(res);return {d,res,st,variant,enabled:ccCfg(d.id).enabled!==false};});
  const shown=results.filter(r=>r.res.n>0||(r.d.type==="funnel"&&r.res.nRows>0));
  const count=l=>shown.filter(r=>r.enabled&&r.st.level===l).length,grey=shown.filter(r=>r.st.level==="none").length;
  $("#cc-summary").innerHTML=`<div class="metric-grid">${metricCard(rows.length,"runs in this instrument's history","")}${metricCard(count("ok"),"charts in control","ok")}
    ${metricCard(count("warn"),"charts to watch (rule alarm or limit approaching)",count("warn")?"warn":"ok")}${metricCard(count("bad"),"charts alarming on the latest run",count("bad")?"bad":"ok")}
    ${metricCard(grey,"charts still collecting a baseline","")}${metricCard(rows.filter(r=>r.loaded).length,"runs loaded now","")}${metricCard(rows.filter(r=>!r.loaded).length,"runs from the imported history","")}</div>
    ${rows.length<20?`<div class="notice warn"><span>Control limits need about 20 runs per instrument.</span> <span>${rows.length} run(s) available.</span> <span>Import an instrument history or load more runs to make the alarms meaningful.</span></div>`:""}`;
  const panelEvents=ccEvents(CC_STATE.instrument),alarmCounts=new Map();
  panelEvents.forEach(e=>alarmCounts.set(e.area,(alarmCounts.get(e.area)||0)+1));
  const alarmSummary=[...alarmCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12);
  $("#cc-summary").insertAdjacentHTML("beforeend",panelEvents.length?`<details class="cc-alarm-summary" open><summary><b>${panelEvents.length}</b> control-chart alarm point(s) in Tab 2</summary><p class="hint">These monitoring alarms are kept in the Control panel and are not duplicated in Quality & forensic review. File-integrity, timeline, analysis-membership and interpretation findings remain in Tab 5.</p><div class="scroll" style="max-height:160px"><table><thead><tr><th>Chart</th><th>Alarm points</th></tr></thead><tbody>${alarmSummary.map(([a,n])=>`<tr><td>${esc(a)}</td><td>${n}</td></tr>`).join("")}</tbody></table></div></details>`:`<div class="notice ok">No control-chart alarm points for this instrument.</div>`);
  const onlyAttention=$("#cc-filter").value==="attention";
  box.innerHTML=CC_GROUPS.map(g=>{
    const mine=shown.filter(r=>r.d.group===g.id&&(!onlyAttention||r.st.level==="warn"||r.st.level==="bad"));
    const missing=results.filter(r=>r.d.group===g.id&&!shown.includes(r)),notHere=CC_CHARTS.filter(d=>d.group===g.id&&!d.inst.includes(platform));
    return `<div class="cc-group"><h3>${esc(ui(g.title))} <span class="hint">${esc(ui(g.sub))}</span></h3>
      <div class="cc-grid">${mine.map(r=>`<button class="cc-tile ${r.enabled?"":"off"}" data-cc="${r.d.id}" type="button">
        <span class="cc-top"><i style="background:${CC_COL[r.enabled?r.st.level:"none"]}"></i><b>${esc(r.d.code)}</b><span>${esc(ui(r.d.type==="funnel"?"funnel":(ccCfg(r.d.id).type||r.d.type).toUpperCase()))}</span></span>
        <span class="cc-title">${esc(ui(r.d.title))}${r.variant?` · ${esc(r.variant)}`:""}</span>
        ${r.d.type==="funnel"?`<span class="cc-fun">${esc(ui("by operator"))}</span>`:ccSpark(r.res,r.st)}
        <span class="cc-foot">${r.st.last!=null&&Number.isFinite(r.st.last)?`<b>${fmtTick(+Number(r.st.last).toPrecision(4))}</b> <span>${esc(r.d.unit)}</span> · `:""}<span>${esc(r.enabled?r.st.text:"alarms switched off")}</span></span></button>`).join("")
        ||`<p class="hint">${esc(ui(onlyAttention?"Nothing needs attention in this group.":"No chart in this group has data in these files."))}</p>`}</div>
      ${missing.length||notHere.length?`<details class="cc-missing"><summary>${missing.length+notHere.length} chart(s) not shown</summary>
        ${missing.length?`<p class="hint">${esc(ui("No data in these files:"))} ${missing.map(r=>esc(r.d.code+" "+r.d.title)).join(" · ")}</p>`:""}
        ${notHere.length?`<p class="hint">${esc(ui(platform==="LC"?"Only QuantStudio files carry:":"Only LightCycler files carry:"))} ${notHere.map(d=>esc(d.code+" "+d.title)).join(" · ")}</p>`:""}</details>`:""}</div>`;
  }).join("");
  box.querySelectorAll("[data-cc]").forEach(b=>b.onclick=()=>{CC_STATE.open=b.dataset.cc;CC_STATE.variant="";renderCcDetail();$("#cc-detail").scrollIntoView({behavior:"smooth"});});
  if(CC_STATE.open)renderCcDetail();
  localizeDOM($("#tab-panel"));
}
function renderPanel(...args){return MISSY_HOOKS.invoke("renderPanel",this,args,renderPanelBase);}

function renderCcDetail(){
  const card=$("#cc-detail"),def=CC_BY_ID[CC_STATE.open];if(!card||!def){if(card)card.hidden=true;return;}
  const rows=ccRowsFor(CC_STATE.instrument);if(!rows.length){card.hidden=true;return;}
  ixPurge();   /* release the previous figures before their nodes are replaced */
  const platform=rows[0].platform,vs=ccVariants(def,rows);
  if(!vs.includes(CC_STATE.variant))CC_STATE.variant=vs[0]||"";
  const res=ccCompute(def,rows,CC_STATE.variant),st=ccStatus(res),cfg=res.cfg;
  const types=def.type==="funnel"?["funnel"]:["p","u","c"].includes(def.type)?[def.type]:def.type==="xbars"?["xbars","i","ewma","cusum","trend"]:["i","ewma","cusum","trend"];
  const TL={i:"Individuals (I) with run rules",ewma:"EWMA (slow drift)",cusum:"CUSUM (small persistent shift)",trend:"Trend / wear line with prediction",
    xbars:"X̄–S (within-run subgroups)",p:"p-chart (proportion)",u:"u-chart (events per hour)",c:"c-chart (count)",funnel:"Funnel plot by operator"};
  const flagged=res.type==="funnel"?res.pts.filter(p=>p.flags.length):res.pts.filter(p=>p.flags.length&&Number.isFinite(p.y));
  const n=v=>v===""||v==null?"":v;
  plotArm();const ccMainSvg=ccChartSvg(res,`${def.code} ${def.title}${CC_STATE.variant?" · "+CC_STATE.variant:""}`);const ccMainSpec=plotDisarm().slice(-1);
  plotArm();const ccSSvg=res.type==="xbars"?ccSChartSvg(res):"";const ccSSpec=plotDisarm().slice(-1);
  card.hidden=false;
  card.innerHTML=`<div class="cc-head"><div><span class="tag">${esc(def.code)}</span> <b style="font-size:16px">${esc(ui(def.title))}</b>
      <div class="hint">${esc(ui(CC_GROUPS.find(g=>g.id===def.group).title))} · ${esc(CC_STATE.instrument)} · ${esc(ui("source"))}: ${esc(def.source)}</div></div>
      <div><span class="cc-pill" style="background:${CC_COL[st.level]}">${esc(ui(st.level==="ok"?"in control":st.level==="warn"?"watch":st.level==="bad"?"alarm":"no data"))}</span>
      <button class="ghost" id="cc-close" type="button">✕ ${esc(ui("Close"))}</button></div></div>
    <p class="sub">${esc(ui(def.idea))}</p>
    <div class="toolbar">
      ${vs.length>1?`<label>${esc(ui("Channel / target"))}<select id="cc-variant">${vs.map(v=>`<option${v===CC_STATE.variant?" selected":""}>${esc(v)}</option>`).join("")}</select></label>`:""}
      <label>${esc(ui("Chart type"))}<select id="cc-type">${types.map(t=>`<option value="${t}"${t===res.type?" selected":""}>${esc(ui(TL[t]))}</option>`).join("")}</select></label>
      ${res.type!=="funnel"?`<label>${esc(ui("X axis"))}<select id="cc-x">${[["order","Run order"],["date","Date"],["hours","Cumulative run hours"],["cycles","Block cycles (QuantStudio)"]].map(([v,l])=>`<option value="${v}"${(cfg.x||def.x||"order")===v?" selected":""}>${esc(ui(l))}</option>`).join("")}</select></label>`:""}
      <label style="min-width:130px"><span><input type="checkbox" id="cc-ix"${CC_STATE.ix===false?"":" checked"} style="width:auto"> Interactive</span></label><button class="ghost" id="cc-svg" type="button">SVG</button><button class="ghost" id="cc-png" type="button">PNG</button><button class="ghost" id="cc-csv" type="button">${esc(ui("Data (CSV)"))}</button>
    </div>
    <div id="cc-chart" class="chart-wrap">${ccMainSvg}${ccSSvg}</div>
    <div class="notice ${st.level==="bad"?"bad":st.level==="warn"?"warn":"ok"}"><b>${esc(st.text)}</b>${res.shift&&res.shift.date&&!SOP.locked&&/sustained shift/.test(st.text)?` <button class="ghost" id="cc-rebase" data-date="${esc(new Date(res.shift.date).toISOString().slice(0,10))}">${esc(ui("Start a new baseline on"))} ${esc(new Date(res.shift.date).toISOString().slice(0,10))}</button>`:""}${res.reach?` — ${esc(ui("the fitted line reaches"))} ${fmtTick(+res.reach.limit.toPrecision(3))} ${esc(def.unit)} ${res.X.kind==="date"?`${esc(ui("around"))} ${esc(sopFmtTime(res.reach.at*864e5).slice(0,10))}`:`${esc(ui("at"))} ${esc(res.X.label.toLowerCase())} ≈ ${fmtTick(+res.reach.at.toPrecision(4))}`}.`:""}</div>
    <h3>${esc(ui("How to read it"))}</h3><p class="sub">${esc(ui(def.reading))}</p>
    ${CC_LIMIT_TEXT[def.id]?`<h3>${esc(ui("What a result outside the limits means"))}</h3>
      <div class="cc-lim"><div><b>${esc(ui("▼ Below the lower limit"))}</b><p>${esc(ui(CC_LIMIT_TEXT[def.id].lo))}</p></div>
      <div><b>${esc(ui("▲ Above the upper limit"))}</b><p>${esc(ui(CC_LIMIT_TEXT[def.id].hi))}</p></div></div>`:""}
    ${flagged.length?`<h3>${esc(ui("Alarms"))} (${flagged.length})</h3><div class="scroll" style="max-height:220px">${table(
      res.type==="funnel"?[{key:"operator",label:"Operator"},{key:"n",label:"n",n:1},{key:"rate",label:"Rate",n:1},{key:"flags",label:"Rule"}]
        :[{key:"run",label:"Experiment"},{key:"date",label:"Date"},{key:"operator",label:"Operator"},{key:"value",label:"Value",n:1},{key:"dir",label:"Direction"},{key:"flags",label:"Rule"}],
      flagged.slice(-60).reverse().map(p=>res.type==="funnel"?{operator:p.operator,n:p.n,rate:(100*p.y).toFixed(1)+" %",flags:p.flags.join(", ")}
        :{run:p.row.run,date:sopFmtTime(p.row.date),operator:p.row.operator,value:fmtTick(+Number(p.raw!==undefined?p.raw:p.y).toPrecision(4)),dir:ui(ccAlarmDir(p,res)==="lo"?"▼ below":"▲ above"),flags:p.flags.join(", ")}))}</div>`:""}
    ${mlAdvisoryHtml(res)}
    <details class="sop-sec" ${SOP.locked?"":"open"}><summary>${esc(ui("Settings for this chart (saved in the SOP profile)"))}</summary>
      <div class="sop-grid">
        <label class="sop-field"><span>${esc(ui("Alarm action"))}</span><select data-cc-cfg="action">${["review","reject","off"].map(a=>`<option value="${a}"${cfg.action===a?" selected":""}>${esc(ui(a==="review"?"Flag for review in the forensic log":a==="reject"?"Error in the forensic log":"No alarm (chart only)"))}</option>`).join("")}</select></label>
        <label class="sop-field"><span>${esc(ui("Baseline runs (Phase I)"))}</span><input type="number" min="5" step="1" data-cc-cfg="phase1" value="${n(cfg.phase1)}"></label>
        <label class="sop-field"><span>${esc(ui("Baseline starts on (after a repair or service)"))}</span><input type="date" data-cc-cfg="baseFrom" value="${esc(cfg.baseFrom||"")}"></label>
        <label class="sop-field"><span>${esc(ui("Lower specification"))} (${esc(def.unit)})</span><input type="number" step="any" data-cc-cfg="specLo" value="${n(cfg.specLo)}" placeholder="${Number.isFinite(res.spec.lo)?fmtTick(+res.spec.lo.toPrecision(4)):""}"></label>
        <label class="sop-field"><span>${esc(ui("Upper specification"))} (${esc(def.unit)})</span><input type="number" step="any" data-cc-cfg="specHi" value="${n(cfg.specHi)}" placeholder="${Number.isFinite(res.spec.hi)?fmtTick(+res.spec.hi.toPrecision(4)):""}"></label>
        ${res.type==="ewma"?`<label class="sop-field"><span>EWMA λ</span><input type="number" step="0.05" min="0.05" max="1" data-cc-cfg="lambda" value="${n(cfg.lambda)}"></label>
          <label class="sop-field"><span>EWMA L</span><input type="number" step="0.1" data-cc-cfg="L" value="${n(cfg.L)}"></label>`:""}
        ${res.type==="cusum"?`<label class="sop-field"><span>CUSUM k (σ)</span><input type="number" step="0.1" data-cc-cfg="k" value="${n(cfg.k)}"></label>
          <label class="sop-field"><span>CUSUM h (σ)</span><input type="number" step="0.5" data-cc-cfg="h" value="${n(cfg.h)}"></label>`:""}
        ${res.type==="trend"?`<label class="sop-field"><span>${esc(ui("Warn when the limit is closer than (runs)"))}</span><input type="number" step="1" data-cc-cfg="warnAhead" value="${n(cfg.warnAhead)}"></label>
          <label class="sop-field"><span>${esc(ui("Fit the wear line on"))}</span><select data-cc-cfg="trendFit">${[["all","All runs since the baseline (updates with every run)"],["phase1","Only the baseline runs (Phase I, fixed)"]].map(([v,l])=>`<option value="${v}"${cfg.trendFit===v?" selected":""}>${esc(ui(l))}</option>`).join("")}</select></label>`:""}
        ${res.type==="i"&&!def.westgard?`<div class="sop-field"><span>${esc(ui("Run rules (Western Electric)"))}</span>${[["r2","2 of 3 beyond 2σ"],["r3","4 of 5 beyond 1σ"],["r4","8 on one side"],["r5","6 rising/falling"]].map(([k,l])=>`<label style="margin:0"><span><input type="checkbox" data-cc-rule="${k}" style="width:auto"${cfg.rules[k]?" checked":""}> ${esc(ui(l))}</span></label>`).join("")}</div>`:""}
      </div>
      <div class="toolbar"><button class="ghost" id="cc-reset" type="button">${esc(ui("Reset this chart to defaults"))}</button>
        <span class="hint">${esc(ui("Changes update the profile SHA-256 like any other SOP rule; save the profile on the SOP page to keep them."))}</span></div>
    </details>`;
  mlAdvisoryBind(card);
  const re=()=>{CC_STATE.cache=null;markDirty("sop","review");renderPanel();};
  $("#cc-close").onclick=()=>{CC_STATE.open=null;card.hidden=true;};
  if($("#cc-variant"))$("#cc-variant").onchange=e=>{CC_STATE.variant=e.target.value;renderCcDetail();};
  $("#cc-type").onchange=e=>{ccSetCfg(def.id,{type:e.target.value===def.type?"":e.target.value});re();};
  if($("#cc-x"))$("#cc-x").onchange=e=>{ccSetCfg(def.id,{x:e.target.value});re();};
  card.querySelectorAll("[data-cc-cfg]").forEach(el=>{if(SOP.locked)el.disabled=true;el.onchange=()=>{
    const k=el.dataset.ccCfg;ccSetCfg(def.id,{[k]:el.type==="number"?(el.value===""?"":Number(el.value)):el.value});re();};});
  card.querySelectorAll("[data-cc-rule]").forEach(el=>{if(SOP.locked)el.disabled=true;el.onchange=()=>{
    const r=Object.assign({},ccCfg(def.id).rules,{[el.dataset.ccRule]:el.checked});ccSetCfg(def.id,{rules:r});re();};});
  if($("#cc-rebase"))$("#cc-rebase").onclick=e=>{ccSetCfg(def.id,{baseFrom:e.target.dataset.date});re();};
  $("#cc-reset").onclick=()=>{if(SOP.locked)return;if(SOP.controlCharts)delete SOP.controlCharts[def.id];sopChanged();re();};
  const base=()=>safeName(`${CC_STATE.instrument}_${def.code}_${def.id}${CC_STATE.variant?"_"+CC_STATE.variant:""}`);
  const svgText=()=>{const s=$("#cc-chart svg");return s?s.outerHTML.replace("<svg ",`<svg data-sop="${esc(SOP.name)} v${esc(SOP.version)} sha256:${sopHash()}" `):"";};
  if($("#cc-ix"))$("#cc-ix").onchange=e=>{CC_STATE.ix=e.target.checked;ixMount($("#cc-chart"),ccMainSpec.concat(ccSSpec),CC_STATE.ix);};
  ixMount($("#cc-chart"),ccMainSpec.concat(ccSSpec),CC_STATE.ix!==false);
  $("#cc-svg").onclick=()=>download(base()+".svg",svgText(),"image/svg+xml");
  $("#cc-png").onclick=()=>ccPng(svgText(),base()+".png");
  $("#cc-csv").onclick=()=>{const rowsOut=ccChartRows(def,res,CC_STATE.variant);if(rowsOut.length)download(base()+".csv",csvOf(rowsOut),"text/csv");};
  localizeDOM(card);
}
function ccPng(svgText,name){
  const m=svgText.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/),W=m?+m[1]:900,H=m?+m[2]:450,img=new Image();
  img.onload=()=>{const cv=document.createElement("canvas");cv.width=W*2;cv.height=H*2;const c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);
    c.drawImage(img,0,0,cv.width,cv.height);cv.toBlob(b=>b.arrayBuffer().then(ab=>download(name,new Uint8Array(ab),"image/png")),"image/png");};
  img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);
}
function ccChartRows(def,res,variant){
  if(res.type==="funnel")return res.pts.map(p=>({operator:p.operator,n:p.n,bad:p.bad,rate:p.y,limit95:p.u95,limit998:p.u998,flags:p.flags.join("; ")}));
  return res.pts.map(p=>({experiment:p.row.run,date:sopFmtTime(p.row.date),operator:pseudoOn()?"":p.row.operator,x:p.x,value:p.raw!==undefined?p.raw:p.y,plotted:p.y,
    centre:p.cl,ucl:p.ucl,lcl:p.lcl,s:p.s??"",direction:p.flags.length?ccAlarmDir(p,res):"",signal:ccSignal(p),
      plotted_lower:res.type==="cusum"?p.y2:"",signal_side:res.type==="cusum"?(p.sigHi?"upper":p.sigLo?"lower":""):"",
      extract:p.segment||"",flags:p.flags.join("; "),baseline:p.pre?"before baseline":"",
    chart:def.code,type:res.type,variant:variant||"",sop_sha256:sopHash()}));
}
function ccSvgToPng(svgText){
  return new Promise(res=>{const m=svgText.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/),W=m?+m[1]:900,H=m?+m[2]:450,img=new Image();
    img.onload=()=>{const cv=document.createElement("canvas");cv.width=W*2;cv.height=H*2;const c=cv.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);
      c.drawImage(img,0,0,cv.width,cv.height);cv.toBlob(b=>b?b.arrayBuffer().then(ab=>res(new Uint8Array(ab))):res(null),"image/png");};
    img.onerror=()=>res(null);img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgText);});
}
/* ---------- every control chart of every instrument in one ZIP ----------
   <platform>_<serial>/<code>_<title>[_<variant>].svg / .csv (+ .png), a summary table per instrument, the instrument
   history (JSON + CSV), the SOP profile and a README. Follows the Protocol filter for instruments that ran that protocol. */
async function ccZipAll(withPng,onProgress){
  const entries=[],insts=ccInstruments(),proto=CC_STATE.protocol,sha=sopHash(),stamp=new Date().toISOString().slice(0,16).replace(/[:T]/g,"-");
  const fname=(def,v,ext)=>safeName(`${def.code}_${def.id}${v?"_"+v.replace(/[0-9a-f]{40,64}/gi,h=>h.slice(0,8)).replace(/\s*°C/g,"").replace(/\s*→\s*/g,"-to-"):""}`).slice(0,100)+ext;
  const readme=[`Control charts exported ${new Date().toISOString()} from the qPCR page (Control panel).`,
    `SOP profile ${SOP.name} v${SOP.version}, SHA-256 ${sha}.`,proto?`Protocol filter: ${proto} (instruments that never ran it: all runs).`:"Protocol filter: all protocols.",
    "One folder per instrument (platform_serial). In each folder:",
    "  00_summary.csv          status of every chart on the latest run (in control / watch / alarm / not enough data)",
    "  <code>_<title>[_<channel or transition>].svg   the chart as shown on the chart page",
    "  ... .csv                the numbers behind it: value, centre, limits, alarm rule and direction for every run",
    withPng?"  ... .png                the same chart as an image (2x)":"",
    "  history.json / .csv     the instrument history (one row per run); import the JSON on the Control panel next time","",
    "Instruments:"];
  let done=0;const total=insts.reduce((n,i)=>n+CC_CHARTS.filter(d=>d.inst.includes(i.platform)).length,0);
  for(const inst of insts){
    const folder=safeName(inst.key.replace(/\s*·\s*/,"_"))+"/";
    const hasProto=proto&&ccAllRows().some(r=>r.instrument===inst.key&&r.protocol===proto);
    const keep=CC_STATE.protocol;CC_STATE.protocol=hasProto?proto:"";
    let rows;try{rows=ccRowsFor(inst.key);}finally{CC_STATE.protocol=keep;}
    if(!rows.length)continue;
    const pf=rows[0].platform,summary=[];
    readme.push(`  ${folder}  ${rows.length} run(s)${hasProto?" of the selected protocol":""}, ${sopFmtTime(rows[0].date).slice(0,10)} → ${sopFmtTime(rows[rows.length-1].date).slice(0,10)}`);
    for(const def of CC_CHARTS.filter(d=>d.inst.includes(pf))){
      const vs=ccVariants(def,rows);
      for(const v of (vs.length?vs:[""])){
        try{const res=ccCompute(def,rows,v),st=ccStatus(res);
          summary.push({code:def.code,chart:def.title,group:def.group,variant:v,runs:res.type==="funnel"?res.nRows:res.n,status:st.level==="ok"?"in control":st.level==="warn"?"watch":st.level==="bad"?"alarm":"not enough data",
            detail:st.text,latest:Number.isFinite(st.last)?st.last:"",unit:def.unit,alarms:res.pts.filter(p=>p.flags.length).length,chart_type:res.type,file:fname(def,v,".svg")});
          if(!res.pts.some(p=>Number.isFinite(p.y)))continue;
          let svg=ccChartSvg(res,`${inst.key} · ${def.code} ${def.title}${v?" · "+v:""}`)+(res.type==="xbars"?ccSChartSvg(res):"");
          if(res.type==="xbars"){const a=ccChartSvg(res,`${inst.key} · ${def.code} ${def.title}${v?" · "+v:""}`),b=ccSChartSvg(res);svg=a;
            if(b)entries.push({name:folder+fname(def,v,"_S-chart.svg"),data:b.replace("<svg ",`<svg data-sop="sha256:${sha}" `)});}
          svg=svg.replace("<svg ",`<svg data-sop="${svgEsc(SOP.name)} v${svgEsc(SOP.version)} sha256:${sha}" data-instrument="${svgEsc(inst.key)}" `);
          entries.push({name:folder+fname(def,v,".svg"),data:svg});
          const cr=ccChartRows(def,res,v);if(cr.length)entries.push({name:folder+fname(def,v,".csv"),data:csvOf(cr)});
          if(withPng){const png=await ccSvgToPng(svg);if(png)entries.push({name:folder+fname(def,v,".png"),data:png});}
        }catch(e){entries.push({name:folder+fname(def,v,"_error.txt"),data:String(e&&e.message||e)});}
      }
      done++;if(onProgress&&done%6===0){onProgress(done,total);await new Promise(r=>setTimeout(r,0));}
    }
    const order={alarm:0,watch:1,"in control":2,"not enough data":3};summary.sort((a,b)=>order[a.status]-order[b.status]||a.code.localeCompare(b.code));
    entries.push({name:folder+"00_summary.csv",data:csvOf(summary)});
    const keepI=CC_STATE.instrument;CC_STATE.instrument=inst.key;
    try{entries.push({name:folder+"history.json",data:ccHistoryJSON(true)});entries.push({name:folder+"history.csv",data:ccHistoryCSV()});}finally{CC_STATE.instrument=keepI;}
  }
  entries.push({name:"sop_profile.json",data:sopJSON()});
  entries.push({name:"README.txt",data:readme.filter(l=>l!=="").join("\n")+"\n"});
  download(`control_charts_all_instruments_${stamp}.zip`,makeStoredZip(entries),"application/zip");
  return entries.length;
}
/* ---------- history file ---------- */
function ccHistoryJSON(onlyInstrument){
  const rows=ccAllRows().filter(r=>!onlyInstrument||r.instrument===CC_STATE.instrument).map(r=>{const o=Object.assign({},r);delete o.loaded;delete o.hours;
    if(pseudoOn())o.operator=o.operator==="(not recorded)"?o.operator:"operator-"+sha256Hex(new TextEncoder().encode(o.operator)).slice(0,8);return o;});
  return JSON.stringify({schema:"qpcr-instrument-history/1",written:new Date().toISOString(),sop:{name:SOP.name,version:SOP.version,sha256:sopHash()},rows},null,1);
}
function ccHistoryCSV(){
  const rows=ccAllRows().filter(r=>r.instrument===CC_STATE.instrument),cols=new Set();
  const flat=rows.map(r=>{const o={experiment:r.run,date:sopFmtTime(r.date),instrument:r.instrument,operator:pseudoOn()&&r.operator!=="(not recorded)"?"operator-"+sha256Hex(new TextEncoder().encode(r.operator)).slice(0,8):r.operator,firmware:r.firmware,software:r.software,block_cycles:r.block_cycles??""};
    for(const [k,v] of Object.entries(r.m)){if(v&&typeof v==="object"){for(const [a,b] of Object.entries(v))o[`${k}.${a}`]=b;}else o[k]=v;}
    Object.keys(o).forEach(k=>cols.add(k));return o;});
  return toCSV([...cols].map(k=>({key:k,label:k})),flat);
}
/* "35S | 415B 29.05.2025" or "35S | 415B | <source hash>" (older histories) → series "35S | 415B" + pc_batch */
function ccMigrateControlKeys(m){
  if(!m||m.pc_batch||!(m.pc_cq||m.pc_amplitude))return m;
  const conv=k=>{const p=k.split(" | ");if(p.length<2)return null;const target=p[0],label=p[1].trim().toUpperCase();
    const dm=label.match(/(?<!\d)(\d{1,2})\.(\d{1,2})\.(\d+)(?![\d.])/),mat=(label.match(/^[0-9]{3}[A-Z]{1,2}/)||[label.replace(/\d{1,2}\.\d{1,2}\.\d+/,"").trim().split(" ")[0]])[0];
    let ex="date not recorded";if(dm){const d=+dm[1],mo=+dm[2],y=+dm[3],t=new Date(Date.UTC(y,mo-1,d));
      ex=dm[3].length===4&&t.getUTCDate()===d&&t.getUTCMonth()===mo-1?"extracted "+t.toISOString().slice(0,10):"date unresolved";}
    const q=label.replace(/(?<!\d)\d{1,2}\.\d{1,2}\.\d+(?![\d.])/,"").replace(mat,"").replace(/\s+/g," ").trim();
    return {series:`${ccCanonTarget(target)} | ${mat}`,extract:ex+(q?" · "+q:"")};};
  const bat={};["pc_cq","pc_amplitude"].forEach(f=>{const o=m[f];if(!o)return;const out={};
    Object.entries(o).forEach(([k,v])=>{const c=conv(k);if(!c){out[k]=v;return;}let t=c.series,i=1;while(t in out&&bat[t]!==c.extract)t=`${c.series} · additional extract ${i++}`;out[t]=v;bat[t]=c.extract;});
    m[f]=out;});
  m.pc_batch=bat;return m;
}
function ccImport(text){
  const j=validateHistoryBoundary(JSON.parse(text),"history");
  const keys=new Set(CC_STATE.imported.map(r=>r.key));
  let accepted=0,skipped=0;
  j.rows.forEach(r=>{if(r&&typeof r.key==="string"&&r.key&&r.m&&typeof r.m==="object"&&!Array.isArray(r.m)&&!keys.has(r.key)){ccMigrateControlKeys(r.m);CC_STATE.imported.push(r);keys.add(r.key);accepted++;}else skipped++;});
  if(!accepted&&!j.rows.length)throw new Error("history file contains no rows");
  if(skipped)appNotice("history import",`${skipped} malformed or duplicate history row(s) were ignored`);
  ccRemember();return accepted;
}
function ccRemember(){if(!CC_STATE.remember)return;try{localStorage.setItem(CC_HIST_KEY,ccHistoryJSON(false));}catch(e){}}
function ccRestore(){try{const t=localStorage.getItem(CC_HIST_KEY);if(t){CC_STATE.remember=true;const j=validateHistoryBoundary(JSON.parse(t),"stored history");CC_STATE.imported=j.rows.slice();}}catch(e){appNotice("history restore",e.message||String(e));}}
/* ---------- alarms → forensic log ---------- */
function ccEvents(instrumentFilter=""){
  const out=[];if(!RUNS.length)return out;
  const loadedKeys=new Set(ccRowsFromRuns().map(r=>r.key));
  const keepProto=CC_STATE.protocol;CC_STATE.protocol="";      // alarms use every run of the instrument
  try{ccInstruments().filter(inst=>!instrumentFilter||inst.key===instrumentFilter).forEach(inst=>{const rows=ccRowsFor(inst.key),pf=rows[0].platform;
    CC_CHARTS.filter(d=>d.inst.includes(pf)&&d.type!=="funnel").forEach(d=>{const cfg=ccCfg(d.id);if(cfg.action==="off"||cfg.enabled===false)return;
      (ccVariants(d,rows).length?ccVariants(d,rows):[""]).forEach(v=>{const res=ccCompute(d,rows,v);
        res.pts.forEach(p=>{if(p.row&&loadedKeys.has(p.row.key)&&p.flags.length&&Number.isFinite(p.y)&&rows.length>=5)
          out.push({experiment:p.row.run,severity:cfg.action==="reject"?"error":"review",area:`Control chart ${d.code}`,
            finding:`${d.title}${v?" · "+v:""}: ${p.flags.join(", ")}`,evidence:`value ${fmtTick(+Number(p.raw!==undefined?p.raw:p.y).toPrecision(4))} ${d.unit}; centre ${fmtTick(+Number(p.cl).toPrecision(4))}; limits ${fmtTick(+Number(p.lcl).toPrecision(4))} – ${fmtTick(+Number(p.ucl).toPrecision(4))}${CC_LIMIT_TEXT[d.id]?` — ${ccAlarmDir(p,res)==="lo"?"below":"above"}: ${CC_LIMIT_TEXT[d.id][ccAlarmDir(p,res)]}`:""}`});});});});});}finally{CC_STATE.protocol=keepProto;}
  return out;
}
/* ---------- wiring ---------- */
function wirePanel(){
  ccRestore();$("#cc-remember").checked=CC_STATE.remember;
  $("#cc-inst").onchange=e=>{CC_STATE.instrument=e.target.value;CC_STATE.protocol="";CC_STATE.open=null;$("#cc-detail").hidden=true;renderPanel();};
  $("#cc-filter").onchange=renderPanel;
  $("#cc-proto").onchange=e=>{CC_STATE.protocol=e.target.value;renderPanel();};
  $("#cc-import").onclick=()=>$("#cc-file").click();
  $("#cc-file").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{const n=ccImport(await f.text());$("#cc-msg").innerHTML=`<span class="tag ok">${n} ${esc(ui("history rows read"))}</span>`;renderPanel();}
    catch(err){appError("history import",err);$("#cc-msg").innerHTML=`<span class="err">${esc(err.message)}</span>`;}e.target.value="";};
  $("#cc-export").onclick=()=>download(safeName(CC_STATE.instrument||"instrument")+"_history.json",ccHistoryJSON(true),"application/json");
  $("#cc-export-csv").onclick=()=>download(safeName(CC_STATE.instrument||"instrument")+"_history.csv",ccHistoryCSV(),"text/csv");
  $("#cc-zip").onclick=async()=>{const b=$("#cc-zip"),msg=$("#cc-msg");if(!ccAllRows().length)return;b.disabled=true;
    try{const n=await ccZipAll($("#cc-zip-png").checked,(d,t)=>{msg.innerHTML=`<div class="notice">${esc(ui("Preparing the charts"))}: ${d} / ${t}</div>`;});
      msg.innerHTML=`<div class="notice ok">${esc(ui("ZIP ready"))}: ${n} ${esc(ui("files"))}.</div>`;}
    catch(e){appError("control-chart archive",e);msg.innerHTML=`<div class="notice bad">${esc(e.message)}</div>`;}finally{b.disabled=false;}};
  $("#cc-remember").onchange=e=>{CC_STATE.remember=e.target.checked;if(e.target.checked)ccRemember();else try{localStorage.removeItem(CC_HIST_KEY);}catch(x){}};
  document.querySelectorAll("[data-goto-graph]").forEach(b=>b.onclick=()=>{showTab("graphs");$("#g-graph").value=b.dataset.gotoGraph;renderGraphs();});
}
/* LightCycler block temperature trace for the Graphs tab (decoded TemperatureLog) */
GRAPHS.push(...[ ["x_control_batches","Control extraction batches","batch"],["x_control_age","Control extract age versus Cq","age"],["x_control_thermal","Control Cq versus cooling rate","thermal"] ].map(([id,title,mode])=>({id,title,group:"Across runs",scope:"all",opts:["control","target"],note:"Descriptive association only. Separate material, extraction batch, dilution, target, instrument and protocol. Missing/invalid extraction dates are excluded from age plots.",render:c=>controlBatchGraph(c,mode)})));
GRAPHS.splice(GRAPHS.findIndex(g=>g.id==="recalc")+1,0,{id:"lc_thermal",group:"Run history",title:"Block temperature trace (LightCycler temperature log)",scope:"run",
  note:"The block temperature the LightCycler 480 logged about every 0.41 s, decoded from the TemperatureLog inside the .ixo file, with the protocol setpoints. Heating and cooling rates, overshoot, settling and transition times on the control panel are measured on the full trace; the graph keeps the lowest and highest value of every time slice, so overshoots and short holds are not lost when it is thinned for display.",
  render(c){const L=c.run&&c.run.cc&&c.run.cc.log;if(!L)return {svg:svgMessage("This file has no LightCycler temperature log (QuantStudio files: use the block temperature graph above)."),rows:[]};
    const sp=ccSetpoints(c.run);
    return {svg:svgPlot({title:runName(c.run),x:[0,L.seconds[L.seconds.length-1]/60],y:[Math.min(...L.temp)-3,Math.max(...L.temp)+3],xlab:"Minutes from the start of the log",ylab:"°C",right:62,hlabelsOutside:true,
      series:[{type:"line",colour:"#2563eb",width:1,data:L.seconds.map((s,i)=>[s/60,L.temp[i]])}],hlines:sp.map(s=>({y:s,label:`${s} °C`,colour:"#6b7280",dash:"2 3"}))}),
      rows:L.seconds.map((s,i)=>({seconds:s,block_C:L.temp[i]}))};}});

