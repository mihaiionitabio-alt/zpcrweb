/* ============================================================
   R. Quality review workspace
   ------------------------------------------------------------
   This layer reads the same decoded run objects as the exports above. It never
   substitutes a Cq, call or fluorescence value. Review flags are structural or
   descriptive and are deliberately kept separate from assay-specific rules.
   ============================================================ */
const REVIEW_COLOURS={
  "Unknown":"#f8fafc","Standard":"#d1fae5","Calibrator":"#fee2e2",
  "Positive control":"#fbcfe8","Negative control":"#dbeafe","NTC":"#ede9fe",
  "Blank":"#fef3c7","Reference":"#cffafe","Internal control":"#fce7f3",
  "Positive":"#d1fae5","Negative":"#e5e7eb","Uncertain":"#fef3c7",
  "NotCalculated":"#f3f4f6"
};
const PLATE_PASTELS=["#e0f2fe","#dcfce7","#fef3c7","#fce7f3","#ede9fe","#fee2e2","#cffafe","#f1f5f9"];
const CONTROL_CATEGORY_OPTIONS=["LOD control","Positive control","Calibrator","Standard","Negative control",
  "Negative calibrator","No-template control","Extraction blank","Blank","Internal control",
  "Inhibition control","Spike","External reference","Other control"];
const REVIEW_STATE={plateRun:0,plateTarget:"",curveRun:0,curveTarget:"",instrumentRun:0,
  comparison:[],statistics:[],forensic:[],controlSeries:[],controlCategoryOverrides:{},
  issueRuns:null,issueCategory:"all"};

function runName(run){return (run&&run.meta&&run.meta.name)||run.file||"Experiment";}
function shortDate(value){
  const m=String(value||"").match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return m?`${Number(m[3])}.${Number(m[2])}`:"";
}
function displayRunTick(run,index){
  return shortDate((run.meta||{}).StartTime||(run.meta||{}).Created)
    ||String(runName(run)).slice(0,11)||String(index+1);
}
function runAt(selectId,fallback){
  const sel=$(selectId),i=sel?Number(sel.value):fallback;
  return RUNS[Number.isFinite(i)?i:0]||null;
}
function setSelectItems(sel,items,keep){
  if(!sel)return "";
  const old=keep==null?sel.value:keep;
  sel.innerHTML=items.map(x=>`<option value="${esc(x.value)}">${esc(ui(x.label))}</option>`).join("");
  const values=items.map(x=>String(x.value));
  sel.value=values.includes(String(old))?String(old):(values[0]||"");
  return sel.value;
}
const ORPHAN_CURVE_KEY="__flagged_omitted_curves__";
function analysisChoices(run){
  const seen=new Set(),out=[{value:"",label:"All analyses"}];
  if(orphanCurveCandidates(run).length)
    out.push({value:ORPHAN_CURVE_KEY,label:"Rising curves with no result in their channel"});
  (run&&run.wells||[]).forEach(w=>{
    const key=w.analysisUid||w.analysis||w.target||"";
    if(!key||seen.has(key))return;seen.add(key);
    out.push({value:key,label:`${w.target||"(no target)"} — ${w.analysis||"analysis"}`});
  });
  return out;
}
function selectedWells(run,key){
  const all=ssWells(run);
  if(key===ORPHAN_CURVE_KEY)return orphanCurveCandidates(run).filter(w=>ssPositionIncluded(run,w.pos));
  return key?all.filter(w=>(w.analysisUid||w.analysis||w.target||"")===key):all;
}
function physicalCurveRows(rows){
  const groups=new Map();
  (rows||[]).filter(w=>w.curve&&w.curve.length).forEach(w=>{
    const key=`${w.channel}|${w.pos}`;
    (groups.get(key)??(groups.set(key,[]),groups.get(key))).push(w);
  });
  return [...groups.values()].map(items=>{
    if(items.length===1)return items[0];
    const out=Object.assign({},items[0]);
    out.analysis=uniq(items.map(w=>w.analysis).filter(Boolean)).join(" | ");
    out.analysisUid=uniq(items.map(w=>w.analysisUid).filter(Boolean)).join(" | ");
    out.target=uniq(items.map(w=>w.target).filter(Boolean)).join(" | ");
    out.call=uniq(items.map(w=>w.call).filter(Boolean)).join(" | ");
    out.mergedAnalysisCount=items.length;
    return out;
  });
}
function heatColour(value,lo,hi){
  if(!Number.isFinite(value))return "#f8fafc";
  const t=hi>lo?Math.max(0,Math.min(1,(value-lo)/(hi-lo))):0.5;
  const r=Math.round(222+28*t),g=Math.round(245-83*t),b=Math.round(255-103*t);
  return `rgb(${r},${g},${b})`;
}
function plateMapRows(run,key){
  if(!run)return [];
  const wells=selectedWells(run,key),byPos=byKey(wells,w=>w.pos);
  const total=(run.rows||8)*(run.cols||12),rows=[];
  for(let pos=0;pos<total;pos++){
    const rec=(run.plate||{})[pos]||{},res=byPos.get(pos)||[];
    const cq=res.map(w=>Number(w.CpRaw)).filter(q=>Number.isFinite(q)&&q>0);
    const roles=uniq(res.map(w=>w.role).filter(Boolean));
    const types=uniq(res.map(w=>w.instrType).filter(Boolean));
    const cqRows=res.filter(w=>Number.isFinite(Number(w.CpRaw))&&Number(w.CpRaw)>0);
    rows.push({
      experiment:runName(run),source_uid:sourceUidOf(run),source_crc32:sourceCRCOf(run),
      well:posToWell(pos,run.cols),well_lims:posToLimsWell(pos,run.cols),position:pos+1,
      sample:rec.name||res[0]?.sample||"",sample_id:rec.sampleId||res[0]?.sampleId||"",
      subsets:uniq([...(rec.subsets||[]),...res.flatMap(w=>w.subsetsOfWell||[])]).join(" | "),
      instrument_type:types.join(" | "),role:roles.join(" | "),
      replicate_of:Number.isFinite(rec.replicateOf)?rec.replicateOf+1:"",
      target:uniq(res.map(w=>w.target).filter(Boolean)).join(" | "),
      analysis:uniq(res.map(w=>w.analysis).filter(Boolean)).join(" | "),
      cq:cq.length===1?cq[0]:"",
      cq_mean:cq.length>1?mean(cq):"",cq_n:cq.length,
      cq_by_analysis:cqRows.map(w=>`${w.analysis||"analysis"}=${w.CpRaw}`).join(" | "),
      call:uniq(res.map(w=>w.call).filter(Boolean)).join(" | "),
      results:res.length,named_unanalysed:(rec.name&&!res.length)?"yes":""
    });
  }
  return rows;
}
function sampleComparisonRows(a,b,limit){
  const stableKey=w=>`${w.target||""}||${w.analysis||w.analysisGroupName||"(analysis)"}`;
  const keys=uniq(RUNS.flatMap(r=>(r.wells||[]).map(stableKey)))
    .filter(Boolean);
  return keys.map(key=>{
    const all=RUNS.flatMap(r=>(r.wells||[]).filter(w=>stableKey(w)===key));
    const meta=all[0]||{},vals=name=>all.filter(w=>(w.sample||"")===name)
      .map(w=>Number(w.CpRaw)).filter(q=>Number.isFinite(q)&&q>0);
    const av=vals(a),bv=vals(b),ma=mean(av),mb=mean(bv),diff=ma-mb;
    return {analysis:meta.analysis||key,target:meta.target||"",sample_1:a,mean_1:ma,sd_1:sd(av),n_1:av.length,
      sample_2:b,mean_2:mb,sd_2:sd(bv),n_2:bv.length,difference:diff,
      review:Number.isFinite(diff)&&Math.abs(diff)>=limit?`Review: |ΔCq| ≥ ${limit}`:""};
  }).sort((x,y)=>(x.target||x.analysis).localeCompare(y.target||y.analysis));
}
function reviewStatisticsRows(){
  const groups=new Map();
  RUNS.forEach((run,ri)=>ssWells(run).forEach(w=>{
    const key=`${ri}|${w.analysisUid||w.analysis||w.target||""}`;
    if(!groups.has(key))groups.set(key,{experiment:runName(run),analysis:w.analysis||"",target:w.target||"",
      rows:[],cq:[],conc:[]});
    const g=groups.get(key),q=Number(w.CpRaw),c=Number(w.CalcConc);
    g.rows.push(w);if(Number.isFinite(q)&&q>0)g.cq.push(q);if(c>0)g.conc.push(c);
  }));
  return [...groups.values()].map(g=>({
    experiment:g.experiment,analysis:g.analysis,target:g.target,results:g.rows.length,
    amplified:g.cq.length,uncertain:g.rows.filter(w=>w.call==="Uncertain").length,
    missing_curves:g.rows.filter(w=>!w.curve).length,
    mean:mean(g.cq),sd:sd(g.cq),cv:cv(g.cq),min:g.cq.length?Math.min(...g.cq):NaN,
    q1:percentile(g.cq,.25),median:median(g.cq),q3:percentile(g.cq,.75),
    max:g.cq.length?Math.max(...g.cq):NaN,
    concentration_n:g.conc.length,concentration_mean:mean(g.conc),
    concentration_sd:sd(g.conc),concentration_cv:cv(g.conc)
  }));
}
function replicateReviewRows(limit){
  const groups=new Map();
  RUNS.forEach((run,ri)=>ssWells(run).forEach(w=>{
    const q=Number(w.CpRaw);if(!(q>0))return;
    const key=`${ri}|${w.analysisUid||w.analysis||""}|${w.sample||w.well}`;
    if(!groups.has(key))groups.set(key,{experiment:runName(run),analysis:w.analysis||"",
      target:w.target||"",sample:w.sample||w.well,wells:[],cq:[]});
    const g=groups.get(key);g.wells.push(w.well);g.cq.push(q);
  }));
  return [...groups.values()].filter(g=>g.cq.length>1&&range(g.cq)>=limit).map(g=>({
    experiment:g.experiment,analysis:g.analysis,target:g.target,sample:g.sample,
    wells:g.wells.join(" "),n:g.cq.length,mean:mean(g.cq),sd:sd(g.cq),range:range(g.cq),
    finding:`Replicate range ≥ ${limit} Cq`
  }));
}
/* A no-template control, extraction blank or matrix negative is DECLARED to be
   without template. A rising trace there is not noise to be filtered away: under
   the screening profile it reads as contamination and is the most serious finding
   this scan can produce, so it is raised rather than suppressed. Names follow the
   laboratory profile's own control vocabulary (NAME_ROLE_RULES) plus the
   instrument sample types. */
const BLANK_ROLES=["NTC","Blank","Negative control"];
function orphanBlankRole(rec,chRec){
  const byName=roleFromName((rec&&rec.name)||"");
  const byType=TYPE_TO_ROLE[chRec&&chRec.sampleType]||"";
  if(BLANK_ROLES.includes(byName))return byName;
  if(BLANK_ROLES.includes(byType))return byType;
  return "";
}
/* Results at the same POSITION but in another channel. They are reported as
   context; they never suppress this channel, because a Cq for one target says
   nothing about the trace of another. */
function orphanOtherChannels(run,pos,channel){
  const active=(((run.protocol||{}).channels)||[]);
  const out=[];
  [...(run.wells||[]),...(run.tmWells||[]),...(run.genoResults||[]),...(run.otherResults||[])]
    .forEach(w=>{
      if(Number(w.pos)!==pos||Number(w.channel)===channel)return;
      const cq=resultCq(w);
      out.push({channel:Number(w.channel),name:(active[Number(w.channel)]||{}).name||`channel ${w.channel}`,
        target:w.target||w.analysis||"",cq:Number.isFinite(cq)?+cq.toFixed(2):null});
    });
  const seen=new Set();
  return out.filter(o=>{const k=o.channel+"|"+o.target;if(seen.has(k))return false;seen.add(k);return true;});
}
/* Is this stored row an ANSWER for its channel? A finite Cq is one. So is an explicit
   "undetermined"/"not detected" status: the instrument looked and reported no crossing,
   which under the profile is a negative, not an absence. A row with neither, sitting over
   a rising trace, is the case the operator most needs to see. */
const CQ_NEGATIVE_STATUS=/undeterm|not\s*detect|no\s*c[tq]\b|negativ/i;
/* Number(null) is 0, so a null Cq must be rejected BEFORE the numeric test:
   the .eds decoder writes CpRaw:null for an undetermined result, and reading that
   as "Cq 0" would report a crossing at cycle zero. A crossing at 0 is not a result. */
function resultCq(w){
  for(const v of [w&&w.CpRaw,w&&w.Cq,w&&w.Ct,w&&w.cq,w&&w.ct]){
    if(v===null||v===undefined||v==="")continue;
    const n=Number(v);if(Number.isFinite(n)&&n>0)return n;}
  return null;
}
function resultAnswers(w){
  if(resultCq(w)!==null)return "cq";
  if(w&&w.undetermined===true)return "undetermined";
  /* a genotype call and a melting temperature are answers in their own modules */
  if(w&&(w.kind==="genotype"||w.kind==="tm")&&((w.call&&String(w.call).trim())||Number.isFinite(Number(w.tm))))return "call";
  const st=`${(w&&w.CpState)||""} ${(w&&w.CrossingPointStatus)||""} ${(w&&w.call)||""}`;
  if(CQ_NEGATIVE_STATUS.test(st))return "undetermined";
  return "";
}
/* Which analyses of this run compute a crossing at all? Endpoint genotyping reports calls,
   gene scanning reports groups, melt-curve genotyping and Tm calling report temperatures.
   In those modules a stored row without a Cq is the normal and correct state, so a
   missing-Cq finding there is noise, not evidence. */
const CQ_ANALYSIS_KINDS=/absquant|relquant/i;
function quantChannels(run){
  const set=new Set();
  (run&&run.analyses||[]).forEach(a=>{
    if(!CQ_ANALYSIS_KINDS.test(String(a.kind||"")))return;
    const c=Number(a.channelIdx);if(Number.isFinite(c))set.add(c);
  });
  return set;
}
function orphanCurveCandidates(run){
  if(!run||!run.allCurves||!Object.keys(run.allCurves).length)return [];
  /* Scope by the RUN, not by the channel. Excluding channels that no Cq analysis reads
     would re-create the blind spot of 23 September: in the three-channel COVID assay the
     channel with no analysis at all is precisely the one worth seeing, and a contamination
     finding lives there. So: skip a run that computes no crossing anywhere, and inside a
     run that does, keep looking at every channel. */
  if(!quantChannels(run).size)return [];
  if(typeof runProcessingState==="function"&&runProcessingState(run).state==="raw")return [];
  const results=[...(run.wells||[]),...(run.tmWells||[]),...(run.genoResults||[]),
    ...(run.otherResults||[])];
  /* answered: this channel and position carry a real answer (a Cq, or a reported
     no-crossing). unanswered: a row exists but says nothing, which is itself a finding. */
  const answered=new Set(),unanswered=new Map();
  results.filter(w=>Number.isFinite(Number(w.channel))&&Number.isFinite(Number(w.pos))).forEach(w=>{
    const k=`${Number(w.channel)}|${Number(w.pos)}`,a=resultAnswers(w);
    if(a)answered.add(k);else if(!unanswered.has(k))unanswered.set(k,w);
  });
  const claimed=answered;
  /* Use analysed Cq-bearing curves as the reference population.  Empty-well
     baseline wander must not lower the reference and then qualify itself as a
     signal.  If a channel has no result rows (a common vendor export shape),
     use the finite-Cq reference from the other active channels and report that
     the channel was not analysed. */
  const swingsByChannel=new Map(),finiteByChannel=new Map(),allAmps=[];
  (run.wells||[]).filter(w=>w.curve&&Number.isFinite(Number(w.channel))).forEach(w=>{
    const amp=Math.max(...w.curve)-Math.min(...w.curve);
    if(Number.isFinite(amp)&&amp>0){
      const ch=Number(w.channel);allAmps.push(amp);
      if(!swingsByChannel.has(ch))swingsByChannel.set(ch,[]);swingsByChannel.get(ch).push(amp);
      if(resultCq(w)!==null){if(!finiteByChannel.has(ch))finiteByChannel.set(ch,[]);finiteByChannel.get(ch).push(amp);}
    }
  });
  const refByChannel=new Map([...finiteByChannel].map(([ch,a])=>[ch,median(a.sort((x,y)=>x-y))]));
  const allFinite=[...finiteByChannel.values()].flat();
  const sortedAmps=allAmps.slice().sort((a,b)=>a-b);
  const globalRef=allFinite.length?median(allFinite.slice().sort((a,b)=>a-b)):(sortedAmps.length?sortedAmps[Math.floor(.75*(sortedAmps.length-1))]:NaN);
  const ampMed=sortedAmps.length?median(sortedAmps):0;
  const ampMad=sortedAmps.length?median(sortedAmps.map(x=>Math.abs(x-ampMed)).sort((a,b)=>a-b)):0;
  const active=(((run.protocol||{}).channels)||[]).filter(c=>c.active);
  const out=[];
  Object.values(run.allCurves).forEach(e=>{
    if(!e||!Number.isFinite(Number(e.channel))||!Number.isFinite(Number(e.pos))||!e.curve)return;
    const channel=Number(e.channel),pos=Number(e.pos),key=`${channel}|${pos}`,ref=refByChannel.get(channel)||globalRef;
    const noiseFloor=Math.max(3,6*ampMad,Number.isFinite(ref)?ref*.02:0);
    const signalFloor=Math.max(noiseFloor,Number.isFinite(ref)?ref*.05:0);
    if(claimed.has(key)||!(Number.isFinite(e.amplitude)&&e.amplitude>=signalFloor))return;
    const k=Math.max(2,Math.floor(e.curve.length/5));
    const first=mean(e.curve.slice(0,k)),last=mean(e.curve.slice(-k));
    const diffs=e.curve.slice(1).map((v,i)=>Number(v)-Number(e.curve[i])).filter(Number.isFinite);
    const risingFraction=diffs.length?diffs.filter(d=>d>0).length/diffs.length:0;
    const tailK=Math.max(5,Math.floor(e.curve.length*.25));
    const tailBase=mean(e.curve.slice(Math.max(0,e.curve.length-2*tailK),Math.max(0,e.curve.length-tailK)));
    const tailDiffs=e.curve.slice(Math.max(1,e.curve.length-tailK)).map((v,i)=>Number(v)-Number(e.curve[Math.max(0,e.curve.length-tailK)-1+i])).filter(Number.isFinite);
    const terminalDelta=last-tailBase,terminalRisingFraction=tailDiffs.length?tailDiffs.filter(d=>d>0).length/tailDiffs.length:0;
    const wholeRunRise=last-first>=.45*e.amplitude&&risingFraction>=.55;
    const terminalRise=terminalDelta>=Math.max(10,.25*e.amplitude)&&terminalRisingFraction>=.8;
    if(!(wholeRunRise||terminalRise))return;
    const rec=(run.plate||{})[pos]||{},chRec=(rec.channels||{})[channel]||{};
    const instrRole=TYPE_TO_ROLE[chRec.sampleType]||"",nameRole=roleFromName(rec.name||"");
    const refine=instrRole&&nameRole!=="Unknown"&&NEGATIVE_FAMILY.includes(instrRole)
      &&NEGATIVE_FAMILY.includes(nameRole)&&instrRole!==nameRole;
    const role=refine?nameRole:(instrRole&&instrRole!=="Unknown"?instrRole:nameRole);
    const chDef=active[channel]||(((run.protocol||{}).channels)||[])[channel]||{};
    /* Classify rather than merely flag. Every class below is a rising trace with
       no result IN ITS OWN CHANNEL; what differs is what the position declares. */
    const blank=orphanBlankRole(rec,chRec);
    const stale=unanswered.get(key);           /* a row with no Cq and no reported no-crossing */
    const others=orphanOtherChannels(run,pos,channel);
    const withCq=others.filter(o=>o.cq!==null);
    const chName=chDef.name||`channel ${channel}`;
    const cls=blank?"blank-with-signal":stale?"result-without-cq"
      :others.length?"channel-not-analysed":"position-not-analysed";
    const context=withCq.length
      ? `the same position has ${withCq.map(o=>`${o.name}${o.target?" "+o.target:""} Cq ${o.cq}`).join(", ")}, in other channel(s)`
      : others.length?"the same position has results in other channels, none with a Cq"
        :"no stored result of any kind at this position";
    out.push({experiment:runName(run),well:posToWell(pos,run.cols),pos,
      row:Math.floor(pos/run.cols),col:pos%run.cols,sample:rec.name||"",
      target:"No result in this channel",analysis:"Rising curve with no result in its channel",
      analysisUid:ORPHAN_CURVE_KEY,channel,filterName:chDef.name||"",
      filterComb:Number.isFinite(chDef.ex)?`${chDef.ex}-${chDef.em??""}`:"",
      instrType:chRec.sampleType||"",instrRole,role:role||"Unknown",call:"Not analysed",
      curve:e.curve,amplitude:e.amplitude,relative:Number.isFinite(ref)&&ref>0?e.amplitude/ref:null,
      referenceAmplitude:Number.isFinite(ref)?ref:null,noiseFloor,riseFraction:risingFraction,terminalDelta,terminalRiseFraction:terminalRisingFraction,
      cls,severity:blank?"error":"review",blankRole:blank,
      sameChannelCq:null,otherCq:withCq.length?withCq[0].cq:null,
      otherCqs:withCq.map(o=>o.cq),
      otherChannels:others.map(o=>`${o.name}${o.target?" "+o.target:""}${o.cq!==null?" Cq "+o.cq:""}`).join("; "),
      context,
      resultRow:stale?(stale.target||stale.analysis||"stored row"):"",
      finding:blank
        ? `${blank} position carries a rising curve in ${chName} — read as contamination until explained`
        : stale
          ? `${chName} has a stored result row (${stale.target||stale.analysis||"no target named"}) with no Cq and no reported no-crossing, over a rising curve`
          : `${chName} has a rising curve that belongs to no analysis (${context})`});
  });
  return out.sort((a,b)=>a.channel-b.channel||a.pos-b.pos);
}
function reviewOrphanWells(){
  return RUNS.flatMap(run=>orphanCurveCandidates(run).map(o=>({
    experiment:o.experiment,well:o.well,sample:o.sample,role:o.role,channel:o.channel,
    filter:o.filterComb||o.filterName||"",classification:o.cls,level:o.severity,
    stored_row:o.resultRow||"",same_channel_cq:o.sameChannelCq==null?"":o.sameChannelCq,
    other_channel_cq:o.otherCq==null?"":o.otherCq,other_channels:o.otherChannels,
    amplitude:o.amplitude,relative:o.relative,finding:o.finding
  })));
}
function reviewForensicEventsCoreUncached(){
  const all=[];
  const colourAction=()=>String((SOP&&SOP.run&&SOP.run.colourCompensation)||"review");
  RUNS.forEach(run=>{
    const exp=runName(run),events=[],push=(severity,area,finding,evidence)=>
      events.push({experiment:exp,severity,area,finding,evidence:evidence||""});
    push("info","Recovery",run.eds?"QuantStudio experiment decoded":"Experiment decoded",
      `${run.rows}x${run.cols}; ${(run.analyses||[]).length} analyses; ${(run.wells||[]).length} quantification results`);
    if(run.acqError)push("error","AcquisitionStore","Fluorescence could not be decoded",run.acqError);
    if(run.duplicates)push("error","Results","Duplicate result records",String(run.duplicates));
    const active=(((run.protocol||{}).channels)||[]).filter(c=>c.active);
    (run.analyses||[]).forEach(a=>{
      if(Number.isFinite(a.channelIdx)&&(a.channelIdx<0||a.channelIdx>=active.length))
        push("error","Channel assignment",`Analysis reads channel index ${a.channelIdx}, but ${active.length} active channel(s) exist`,a.name);
      if(a.channelMismatch)push("review","Channel assignment",
        `Analysis is named for ${a.channelMismatch.named} but reads ${a.channelMismatch.reading}`,a.name);
    });
    if(!run.eds){
      const declared=((run.protocol||{}).channels)||[];
      const acquired=declared.some(c=>c.active)?declared.filter(c=>c.active):declared;
      const pair=c=>c&&Number.isFinite(c.ex)&&Number.isFinite(c.em)?`${c.ex}-${c.em}`:"";
      const conflicts=uniq((run.wells||[]).filter(w=>w.filterComb&&pair(acquired[w.channel])
        &&w.filterComb.split(" / ")[0]!==pair(acquired[w.channel]))
        .map(w=>`channel ${w.channel}: analysis ${w.filterComb}; acquisition ${pair(acquired[w.channel])}`));
      if(conflicts.length)push("review","Channel assignment","Analysis filter pairs disagree with the acquisition format",
        conflicts.join("; ")+". Optical hardware charts use the acquisition format.");
      const keys=acquired.map(pair).filter(Boolean);
      if(new Set(keys).size!==keys.length)push("error","Channel assignment","Duplicate acquisition filter pairs",
        "Ambiguous optical hardware variants are omitted to prevent channel overwrite.");
    }
    const miss=(run.wells||[]).filter(w=>!w.curve).length;
    if(miss&&(run.allCurves&&Object.keys(run.allCurves).length))
      push("review","Curve linkage",`${miss} stored result(s) have no linked amplification curve`,"Cq remains available");
    const disagree=(run.wells||[]).filter(w=>w.roleDisagrees);
    if(disagree.length)push("review","Sample role",`${disagree.length} instrument-versus-name role disagreement(s)`,
      disagree.slice(0,6).map(w=>`${w.well} ${w.sample}: ${w.roleInstrument} / ${w.roleName}`).join("; "));
    const ceiling=(run.wells||[]).filter(w=>Number(w.CpRaw)===40&&w.call==="Positive");
    if(ceiling.length)push("review","Stored call",`${ceiling.length} positive result(s) are stored exactly at Cq 40`,
      ceiling.slice(0,10).map(w=>`${w.well} ${w.sample}`).join(", "));
    const uncertain=(run.wells||[]).filter(w=>w.call==="Uncertain");
    if(uncertain.length)push("review","Stored call",`${uncertain.length} uncertain call(s)`,
      uncertain.slice(0,10).map(w=>`${w.well} ${w.sample}`).join(", "));
    const contaminated=(run.wells||[]).filter(w=>(w.role==="NTC"||w.role==="Blank")
      &&(w.call==="Positive"||Number(w.CpRaw)>0));
    if(contaminated.length)push("review","Assay controls",`${contaminated.length} NTC/blank result(s) are positive`,
      contaminated.slice(0,10).map(w=>`${w.well} ${w.sample} ${w.target}: Cq ${Number(w.CpRaw).toFixed(3)}`).join("; "));
    const failedPositive=(run.wells||[]).filter(w=>(w.role==="Calibrator"||w.role==="Positive control")
      &&(!(Number(w.CpRaw)>0)||w.call==="Negative"||w.call==="NotCalculated"));
    if(failedPositive.length)push("review","Assay controls",`${failedPositive.length} positive-control/calibrator result(s) did not amplify`,
      failedPositive.slice(0,10).map(w=>`${w.well} ${w.sample} ${w.target}: ${w.call||"no call"}`).join("; "));
    const ambiguousMelt=(run.tmWells||[]).filter(w=>w.meltCurveAmbiguous);
    if(ambiguousMelt.length)push("review","Melting curve",
      `${ambiguousMelt.length} Tm result(s) have an ambiguous raw melting program`,
      "Stored Tm peaks are preserved; the raw melt trace is omitted rather than merging programs");
    if(active.length>1&&colourAction()!=="off"&&!(run.analyses||[]).some(a=>a.cccEnabled))
      push("review","Detection format",`${active.length} active channels and colour compensation is not recorded as applied`,
        active.map(c=>`${c.name||"channel"} ${c.ex}-${c.em}`).join(", "));
    /* File-integrity mismatches belong to the dedicated File integrity tab.
       They must not be duplicated as assay/QC findings in the general review
       count or used to make every sample look like an assay error. */
    if(run.eds)edsEvents(run,push);
    /* Inspect this run directly. Filtering the global orphan table by experiment
       name duplicated findings when two imported files shared the same title. */
    orphanCurveCandidates(run).forEach(o=>
      push(o.severity==="error"?"error":"review",
        o.severity==="error"?"Contamination":o.cls==="result-without-cq"?"Stored result":"Analysis membership",
        `${o.well}: ${o.finding}`,
        [o.sample,o.filterComb||o.filterName||`channel ${o.channel}`,o.otherChannels]
          .filter(Boolean).join("; ")));
    if(!events.some(e=>e.severity==="error"||e.severity==="review"))
      push("info","QC","No structural review finding","The run may still require assay-specific acceptance review");
    all.push(...events);
  });
  return all;
}
function reviewRunRows(events){
  /* Deduplicated WITHIN the run, with the same key the overview uses, so the run table
     and the summary cannot report two different numbers for the same data. The raw
     count stays beside it, because the export is the raw log. */
  return RUNS.map(run=>{
    const ev=events.filter(e=>e.experiment===runName(run));
    const uniqOf=sev=>new Set(ev.filter(e=>e.severity===sev).map(findingKey)).size;
    const errors=uniqOf("error"),reviews=uniqOf("review"),
      rawErrors=ev.filter(e=>e.severity==="error").length,
      rawReviews=ev.filter(e=>e.severity==="review").length;
    return {experiment:runName(run),date:(run.meta||{}).StartTime||(run.meta||{}).Created||"",
      source_uid:sourceUidOf(run),source_crc32:sourceCRCOf(run),
      operator:operatorOf(run),instrument:(run.meta||{}).InstrumentName||"",
      plate:`${run.rows}x${run.cols}`,analyses:(run.analyses||[]).length,results:(run.wells||[]).length,
      curves:uniqueCurveCount(run),errors,reviews,raw_errors:rawErrors,raw_reviews:rawReviews,
      integrity:integrityLabel(run),platform:run.platform||"LightCycler 480",
      status:errors?"Error":reviews?"Review":"No structural finding"};
  });
}
function stripLotDate(name){
  return String(name||"").replace(/\b\d{4}[-./]\d{1,2}[-./]\d{1,2}\b/g," ")
    .replace(/\b\d{1,2}[-./]\d{1,2}(?:[-./]\d{2,4})?\b/g," ")
    .replace(/\s+/g," ").trim()||String(name||"");
}
function controlRootName(name){
  const original=String(name||"").trim();
  return stripLotDate(original).replace(/[\s._,:;/-]+$/g,"").replace(/\s+/g," ").trim()||original;
}
function controlRootKey(name){
  return controlRootName(name).normalize("NFKC").replace(/\s+/g," ").trim().toLocaleUpperCase();
}
function controlProfileRoot(w,mapped){
  const id=String((mapped||sopControlSpec(w)||{}).id||"").toLowerCase();
  if(/^crm-415b/.test(id))return "415B";
  if(/^crm-410cp/.test(id))return "410CP";
  if(/^cn-maize/.test(id))return "CN PORUMB";
  if(/^cn-soy/.test(id))return "CN SOIA";
  if(id==="ntc")return "NTC";
  if(id==="extr")return "BLANK EX";
  if(id==="grind")return "BLANK MAC";
  return mapped&&mapped.name?String(mapped.name):"";
}
function controlCategory(w){
  const n=String(w.sample||"");
  const mapped=sopControlSpec(w);
  if(mapped){
    if(mapped.expect==="negative"){
      if(/extraction/i.test(mapped.purpose||""))return "Extraction blank";
      if(/grinding|environment/i.test(mapped.purpose||""))return "Blank";
      if(/matrix/i.test(mapped.purpose||""))return "Negative control";
      return "No-template control";
    }
    if(mapped.expect==="positive")return /LOD/i.test(mapped.purpose||"")?"LOD control":"Positive control";
  }
  if(/\b(LOD|limit\s+of\s+detection|LDD)\b/i.test(n))return "LOD control";
  if(/\b(no\s*template|NTC|water|H2O)\b/i.test(n))return "No-template control";
  if(/\b(extraction\s*blank|EBC)\b/i.test(n))return "Extraction blank";
  if(/\b(blank|BLK)\b/i.test(n))return "Blank";
  if(/\b(internal\s*(amplification\s*)?control|IAC|IPC)\b/i.test(n))return "Internal control";
  if(/\b(inhibition\s*control)\b/i.test(n))return "Inhibition control";
  if(/\b(spike|spiked)\b/i.test(n))return "Spike";
  if(/\b(external\s*reference)\b/i.test(n))return "External reference";
  return w.role&&w.role!=="Unknown"?w.role:"";
}
function detectedControlRoots(){
  const roots=new Map();
  RUNS.forEach(run=>(run.wells||[]).forEach(w=>{
    const automatic=controlCategory(w);if(!automatic)return;
    const mapped=sopControlSpec(w),root=controlProfileRoot(w,mapped)||controlRootName(w.sample||automatic),key=controlRootKey(root);if(!key)return;
    if(!roots.has(key))roots.set(key,{key,root,variants:new Set(),counts:new Map()});
    const r=roots.get(key);r.variants.add(String(w.sample||root));
    r.counts.set(automatic,(r.counts.get(automatic)||0)+1);
  }));
  return [...roots.values()].map(r=>{
    const automaticCategory=[...r.counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0][0];
    const override=REVIEW_STATE.controlCategoryOverrides[r.key]||"";
    return {key:r.key,root:r.root,variants:[...r.variants].sort((a,b)=>a.localeCompare(b)),
      automaticCategory,category:override||automaticCategory,override};
  }).sort((a,b)=>a.root.localeCompare(b.root,undefined,{numeric:true,sensitivity:"base"}));
}
function renderControlCategoryEditor(){
  const box=$("#control-category-table");if(!box)return;
  const roots=detectedControlRoots();
  if(!roots.length){box.innerHTML='<p class="hint">No control roots detected.</p>';return;}
  const options=(r)=>{
    const values=uniq([r.automaticCategory,...CONTROL_CATEGORY_OPTIONS]);
    return `<option value="auto"${r.override?"":" selected"}>${esc(ui(`Automatic — ${r.automaticCategory}`))}</option>`
      +values.map(v=>`<option value="${esc(v)}"${r.override===v?" selected":""}>${esc(ui(v))}</option>`).join("")
      +`<option value="ignore"${r.override==="ignore"?" selected":""}>${esc(ui("Ignore / not a control"))}</option>`;
  };
  box.innerHTML=`<div class="scroll"><table><thead><tr><th>${esc(ui("Root name"))}</th><th>${esc(ui("Names found"))}</th>
    <th>${esc(ui("Automatic category"))}</th><th>${esc(ui("Use as"))}</th></tr></thead><tbody>${roots.map(r=>`<tr>
      <td><b>${esc(r.root)}</b></td><td>${esc(r.variants.join(", "))}</td>
      <td>${esc(ui(r.automaticCategory))}</td><td><select data-control-root="${esc(r.key)}"
        aria-label="${esc(ui(`Category for ${r.root}`))}">${options(r)}</select></td></tr>`).join("")}
    </tbody></table></div>`;
  $$("#control-category-table select[data-control-root]").forEach(select=>{
    select.onchange=()=>{
      const key=select.dataset.controlRoot,value=select.value;
      if(value==="auto")delete REVIEW_STATE.controlCategoryOverrides[key];
      else REVIEW_STATE.controlCategoryOverrides[key]=value;
      renderReviewControls();
    };
  });
}
function westgardReview(points,m,d){
  const flags=points.map(()=>[]);
  if(!(Number.isFinite(d)&&d>0))return flags;
  const z=points.map(p=>Number.isFinite(p.cq)?(p.cq-m)/d:null);
  z.forEach((v,i)=>{if(Number.isFinite(v)&&Math.abs(v)>=3)flags[i].push("1-3s");});
  for(let i=1;i<z.length;i++){
    if(Number.isFinite(z[i])&&Number.isFinite(z[i-1])){
      if(Math.abs(z[i])>=2&&Math.abs(z[i-1])>=2&&Math.sign(z[i])===Math.sign(z[i-1]))
        flags[i].push("2-2s");
      // No R-4s across consecutive run means.
    }
  }
  for(let i=9;i<z.length;i++){
    const a=z.slice(i-9,i+1);
    if(a.every(Number.isFinite)&&(a.every(v=>v>0)||a.every(v=>v<0)))flags[i].push("10-x");
  }
  return flags;
}
function reviewControlSeries(grouping){
  grouping=grouping==="root"?"root":"exact";
  const roots=new Map(detectedControlRoots().map(r=>[r.key,r])),map=new Map();
  RUNS.forEach((run,ri)=>{
    const perRun=new Map();
    ssWells(run).forEach(w=>{
      const automatic=controlCategory(w);if(!automatic)return;
      const mapped=sopControlSpec(w),rootName=controlProfileRoot(w,mapped)||controlRootName(w.sample||automatic),rootKey=controlRootKey(rootName),root=roots.get(rootKey);
      const category=root?root.category:automatic;if(!category||category==="ignore")return;
      const sample=grouping==="exact"?String(w.sample||category):(root?root.root:controlRootName(w.sample||category));
      const target=w.target||w.analysis||"(all)";
      const identity=grouping==="exact"?String(w.sample||category):rootKey;
      const key=`${grouping}:${identity}||${target}||${ccInstrumentKey(run)}||${ccProtocolKey(run)}`;
      if(!perRun.has(key))perRun.set(key,{sample,category,target,exact:new Set(),values:[],wells:[]});
      const g=perRun.get(key),q=Number(w.CpRaw);g.exact.add(w.sample||"");g.wells.push(w.well);
      if(Number.isFinite(q)&&q>0)g.values.push(q);
    });
    perRun.forEach((g,key)=>{
      if(!map.has(key))map.set(key,{key,sample:g.sample,category:g.category,target:g.target,
        exact:new Set(),points:[]});
      const s=map.get(key);g.exact.forEach(n=>s.exact.add(n));
      s.points.push({experiment:runName(run),date:(run.meta||{}).StartTime||(run.meta||{}).Created||"",
        tick:displayRunTick(run,ri),cq:g.values.length?mean(g.values):null,n:g.values.length,
        wells:g.wells.join(" ")});
    });
  });
  return [...map.values()].map(s=>{
    s.points.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
    const values=s.points.map(p=>p.cq).filter(Number.isFinite),need=ccBaselineNeed(ccCfg("pc_cq")),base=values.slice(0,need),m=mean(base),d=sd(base);
    const flags=grouping==="exact"&&values.length>=need?westgardReview(s.points,m,d):s.points.map(()=>[]);
    s.points.forEach((p,i)=>p.flags=flags[i].join(" "));
    return Object.assign(s,{exact:[...s.exact],runs:s.points.length,n:values.length,mean:m,sd:d,
      cv:cv(values),judgeable:grouping==="exact"&&values.length>=need&&Number.isFinite(d)&&d>0,
      flagged:flags.filter(x=>x.length).length});
  }).sort((a,b)=>(Number(b.judgeable)-Number(a.judgeable))||b.n-a.n||b.runs-a.runs
    ||a.sample.localeCompare(b.sample)||a.target.localeCompare(b.target));
}
function instrumentRecordTables(run){
  if(!run)return {metadata:[],program:[],channels:[],subsets:[],analyses:[],statistics:[]};
  const m=run.meta||{},metadata=Object.keys(m).map(k=>({field:k,value:m[k]}))
    .concat([{field:"plate_geometry",value:`${run.rows}x${run.cols}`},{field:"block_id",value:run.blockId||""},
      {field:"cycles_decoded",value:run.nCycles||""},{field:"container_signature",value:(run.format||{}).signature||""},
      {field:"container_version",value:(run.format||{}).version||""}]);
  const program=[];
  (((run.protocol||{}).programs)||[]).forEach((p,pi)=>(p.segments||[]).forEach((s,si)=>program.push({
    program:pi+1,name:p.name||"",cycles:p.cycles,analysis_mode:p.mode||"",segment:si+1,
    target:s.target,target_2:s.target2,hold:s.hold,slope:s.slope,step_size:s.stepSize,
    step_delay:s.stepDelay,acquisition_mode:s.acqMode,acquisitions_per_degree:s.acqPerDegree
  })));
  const channels=(((run.protocol||{}).channels)||[]).map((c,i)=>({index:i,name:c.name||"",active:c.active?"yes":"no",
    excitation:c.ex,emission:c.em,integration_time:c.integr,max_integration:c.maxIntegr,
    melt_factor:c.meltFactor,quant_factor:c.quantFactor}));
  const subsets=(run.subsets||[]).map(s=>({name:s.name,id:s.id,for_analysis:s.forAnalysis,
    for_report:s.forReport,use_all_samples:s.useAll,positions:(s.items||[]).map(p=>posToWell(p,run.cols)).join(" ")}));
  const analyses=(run.analyses||[]).map(a=>({name:a.name,short_name:a.shortName,kind:a.kindLabel||a.kind,
    class:a.cls,uid:a.uid,subset:a.subsetName,calculation_state:a.calcState,channel_index:a.channelIdx,
    channel_name:a.channelName,filter:a.filterComb,created:a.created,modified:a.modified,
    created_by:a.createdBy,modified_by:a.modifiedBy,results:a.nResults,
    standard_curve_source:a.stdCurve?a.stdCurve.source:"",slope:a.stdCurve?a.stdCurve.slope:"",
    intercept:a.stdCurve?a.stdCurve.yIntercept:"",efficiency:a.stdCurve?a.stdCurve.efficiency:"",
    fit_error:a.stdCurve?a.stdCurve.fitError:"",colour_compensation:a.cccEnabled?"applied":"not applied"}));
  const statistics=[];
  (run.analyses||[]).forEach(a=>(a.quantStats||[]).forEach(q=>statistics.push({analysis:a.name,
    sample:q.master,wells:q.sampleIds,n:q.count,cq_mean:q.cpAvg,cq_sd:q.cpSD,
    concentration_mean:q.concAvg,concentration_sd:q.concSD,method:q.method})));
  const g=run.integrity,integrity=run.eds?[]:(g?[{check:"Trailing checksum (stored)",result:g.stored||"none"},
    {check:"Trailing checksum (recomputed)",result:g.computed},{check:"Verdict",result:integrityLabel(run)},
    {check:"Method",result:"MD5 of the object stream including its CRLF, four byte-swapped 32-bit words"},
    {check:"SHA-256 of the file",result:(run.meta||{}).sourceSHA256||""}]:[]);
  return Object.assign({metadata,integrity,program,channels,subsets,analyses,statistics},edsRecordTables(run));
}

function emptyReview(message){
  return `<div class="empty-state">${esc(ui(message||"Load one or more .ixo or .eds experiments to use this sheet."))}</div>`;
}
function metricCard(value,label,cls){
  return `<div class="metric ${cls||""}"><b>${esc(value)}</b><span>${esc(ui(label))}</span></div>`;
}
function downloadCanvas(canvas,name){
  if(!canvas)return;
  const a=document.createElement("a");a.download=name;a.href=canvas.toDataURL("image/png");
  document.body.appendChild(a);a.click();a.remove();
}
function hashColour(text){
  let h=0;for(const c of String(text||""))h=(h*31+c.charCodeAt(0))>>>0;
  return PALETTE[h%PALETTE.length];
}
function reviewBundleEntries(){
  if(!RUNS.length)return [];
  const csv=(rows)=>toCSV(Object.keys(rows[0]||{}).map(k=>({key:k,label:k})),rows);
  const stats=reviewStatisticsRows(),events=reviewForensicEvents(),runs=reviewRunRows(events);
  const entries=[
    {name:"review/plate_map.csv",data:csv(RUNS.flatMap(r=>plateMapRows(r,"")))},
    {name:"review/statistics.csv",data:csv(stats)},
    {name:"review/runs_and_qc.csv",data:csv(runs)},
    {name:"review/forensic_log.csv",data:csv(events)}
  ];
  const sampleNames=uniq(RUNS.flatMap(r=>(r.wells||[]).map(w=>w.sample).filter(Boolean)));
  if(sampleNames.length>=2)entries.push({name:"review/sample_comparison.csv",data:csv(sampleComparisonRows(sampleNames[0],sampleNames[1],1))});
  const controls=reviewControlSeries("root").flatMap(s=>s.points.map(p=>({series:s.sample,category:s.category,target:s.target,...p})));
  entries.push({name:"review/control_charts.csv",data:csv(controls)});
  const curves=RUNS.flatMap(run=>ssWells(run).filter(w=>w.curve&&w.curve.length).flatMap(w=>w.curve.map((v,i)=>({experiment:runName(run),well:w.well,sample:w.sample||"",target:w.target||"",analysis:w.analysis||"",role:w.role||"",call:w.call||"",cycle:i+1,fluorescence:v}))));
  entries.push({name:"review/amplification_curves.csv",data:csv(curves)});
  RUNS.forEach((run,i)=>{
    const tables=instrumentRecordTables(run);
    Object.entries(tables).forEach(([name,rows])=>entries.push({name:`review/instrument_${String(i+1).padStart(3,"0")}/${safeName(name)}.csv`,data:csv(rows)}));
  });
  return entries;
}
function downloadReviewBundle(){
  if(!RUNS.length)return;
  download(baseName()+"_quality_review.zip",makeStoredZip(reviewBundleEntries()),"application/zip");
}
const FINDING_SEVERITY_RANK={info:0,review:1,error:2};
function findingTextKey(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim();}
/* The key is the CONDITION, not the occurrence: experiment and well are what a
   finding is counted across, so putting them in the key would make every row
   unique and the count identical to the raw one. Well identifiers inside the
   finding text are folded out for the same reason.
   Severity stays IN the key on purpose. The same check can end as information in
   one run and as a review item in another - a change 3 h after a run and one 24 h
   after it are the same sentence with different numbers - and merging those would
   report every run at the worst outcome any run reached. Analytical identity is
   already carried by the text: a control failure names its control and its target,
   so two controls do not merge. What the text cannot hold is reported instead:
   every group counts how many distinct pieces of evidence it covers. */
function findingEvidenceKey(e){
  return String(e&&e.evidence||"").toLowerCase().replace(/\s+/g," ").trim()
    .replace(/\b[a-h](?:[0-9]|1[0-9]|2[0-4])\b/gi,"<well>");
}
function findingKey(e){
  const text=findingTextKey(e.finding).replace(/\b[a-h](?:[0-9]|1[0-9]|2[0-4])\b/gi,"<well>")
    .replace(/\b\d+(?:\.\d+)?\b/g,"<n>");
  return [findingTextKey(e.area),findingTextKey(e.severity),text].join("|");
}
function reviewDisplayFindings(raw){
  const groups=new Map();
  (raw||reviewEventsWithoutIntegrity()||[]).forEach((e,i)=>{
    const sev=FINDING_SEVERITY_RANK[e&&e.severity]!=null?e.severity:"review";
    const key=findingKey(Object.assign({},e,{severity:sev})),g=groups.get(key);
    if(!g){groups.set(key,{key,severity:sev,area:e.area||"Uncategorised",
      finding:e.finding||"Unspecified finding",evidence:e.evidence||"",occurrences:1,
      runs:new Set(e.experiment?[e.experiment]:[]),
      variants:new Set([findingEvidenceKey(e)]),sources:[i]});return;}
    g.occurrences++;g.sources.push(i);
    if(e.experiment)g.runs.add(e.experiment);
    g.variants.add(findingEvidenceKey(e));
    if(!g.evidence&&e.evidence)g.evidence=e.evidence;
  });
  return [...groups.values()].map(g=>Object.assign(g,{runCount:g.runs.size,runs:[...g.runs],
    variantCount:g.variants.size,variants:[...g.variants]}))
    .sort((a,b)=>FINDING_SEVERITY_RANK[b.severity]-FINDING_SEVERITY_RANK[a.severity]
      ||b.occurrences-a.occurrences||a.area.localeCompare(b.area));
}
function reviewDisplayCounts(rows){
  return {unique:rows.length,
    errors:rows.filter(r=>r.severity==="error").length,
    reviews:rows.filter(r=>r.severity==="review").length,
    info:rows.filter(r=>r.severity==="info").length,
    affectedRuns:uniq(rows.flatMap(r=>r.runs||[])).length,
    variants:rows.reduce((n,r)=>n+(r.variantCount||1),0),
    raw:rows.reduce((n,r)=>n+r.occurrences,0)};
}
function reviewEventsWithoutIntegrity(){
  return (reviewForensicEvents()||[]).filter(e=>String(e.area||"").toLowerCase()!=="integrity");
}
function integrityMismatches(){
  const out=[];
  (RUNS||[]).forEach((r,i)=>{
    const g=r&&r.integrity||{}; const file=r&&r.file||(`Run ${i+1}`);
    if(g.kind==="ixo"){
      if(g.ok===false)out.push({file,type:"Object stream checksum",expected:g.stored||"stored value",actual:g.computed||"recomputed value",detail:"The file content differs from the sealed object stream."});
    }else if(g.kind==="eds"){
      if(g.zipCrcOk===false){
        const bad=(g.zipCrcBad||[]); out.push({file,type:"ZIP CRC-32",expected:"entry CRC",actual:bad.length?bad.join(", "):"mismatch",detail:"One or more archive entries failed their CRC check."});
      }
      if(g.ok===false)out.push({file,type:"Tamper MD5",expected:g.stored||"stored value",actual:g.computed||"recomputed value",detail:"The archive content differs from its stored Tamper value."});
    }
  });
  return out;
}
function renderIntegrity(){
  const box=$("#integrity-summary"),list=$("#integrity-list");if(!box||!list)return;
  const rows=integrityMismatches();
  box.innerHTML=RUNS.length
    ? `<div class="notice ${rows.length?"bad":"ok"}"><b>${rows.length?rows.length+" file-integrity mismatch(es) found":"No file-integrity mismatches detected"}.</b> ${RUNS.length} file(s) examined.</div>`
    : `<div class="notice">Load experiment files to check their integrity.</div>`;
  list.innerHTML=rows.length?`<ol class="integrity-records">${rows.map((r,i)=>
    `<li class="integrity-record"><div class="integrity-record-head">
       <span class="integrity-index">${i+1}</span>
       <b class="integrity-file" title="${esc(r.file)}">${esc(r.file)}</b>
       <span class="integrity-badge">file integrity</span></div>
     <dl class="integrity-fields">
       <div><dt>Check</dt><dd>${esc(r.type)}</dd></div>
       <div><dt>Expected</dt><dd class="integrity-value">${esc(r.expected)}</dd></div>
       <div><dt>Observed</dt><dd class="integrity-value">${esc(r.actual)}</dd></div>
       <div><dt>Meaning</dt><dd>${esc(r.detail)}</dd></div>
     </dl></li>`).join("")}</ol>`
    : `<p class="hint">Mismatches will appear here one under another when a file fails a stored checksum or archive-integrity comparison.</p>`;
  const b=$("#dl-integrity");if(b)b.onclick=()=>{
    if(!rows.length)return;
    download(baseName()+"_file_integrity.csv","file,check,expected,observed,meaning\n"+rows.map(r=>[r.file,r.type,r.expected,r.actual,r.detail].map(csvq).join(",")).join("\n")+"\n","text/csv");
  };
}

const ISSUE_CATEGORY_ORDER=["Controls / contamination","Amplification / curve shape","SOP / result interpretation","Timing / traceability","File / structure","Other"];
function issueCategoryOf(e){
  const text=(`${e&&e.area||""} ${e&&e.finding||""} ${e&&e.evidence||""}`).toLowerCase();
  if(/contaminat|assay control|no-template|ntc|blank|positive control|calibrator/.test(text))return "Controls / contamination";
  if(/amplif|curve|rising|channel assignment|detection format|stored result|analysis membership|signal/.test(text))return "Amplification / curve shape";
  if(/integrity|acquisition|sample role|file|archive|checksum|container/.test(text))return "File / structure";
  if(/sop|stored call|uncertain|replicate|interpret/.test(text))return "SOP / result interpretation";
  if(/timeline|traceability|batch|copied data|duplicate name/.test(text))return "Timing / traceability";
  return "Other";
}
function issueSelectedRunIndexes(){
  if(!Array.isArray(REVIEW_STATE.issueRuns))return RUNS.map((r,i)=>i);
  return REVIEW_STATE.issueRuns.filter(i=>Number.isInteger(i)&&RUNS[i]);
}
function issueOverviewRows(indexes){
  const selected=new Set(indexes),out=[];
  const events=reviewEventsWithoutIntegrity();
  events.forEach(e=>{
    if(e.severity==="info")return;
    const ri=RUNS.findIndex(r=>runName(r)===e.experiment);
    if(ri<0||!selected.has(ri))return;
    out.push({category:issueCategoryOf(e),severity:e.severity||"review",experiment:e.experiment,well:"",finding:e.finding||"",evidence:e.evidence||"",source:"forensic"});
  });
  indexes.forEach(ri=>{
    const run=RUNS[ri];if(!run)return;
    graphAnalysisRows(run).forEach(r=>out.push({category:"Amplification / curve shape",severity:r.severity||"review",experiment:runName(run),well:r.well||"",finding:`${r.assessment} for ${r.target||"unnamed target"}`,evidence:`baseline ${num(r.baseline,1)}; ground-noise SD ${num(r.baseline_sd,1)}; late change ${num(r.late_delta,1)}; terminal change ${num(r.terminal_delta,1)}; peak slope ${num(r.max_slope,1)} at cycle ${num(r.max_slope_cycle,0)}`,source:"curve",curve:r.curve,sample:r.sample||"",target:r.target||"",channel:r.channel,issueColour:r.severity==="error"?"#c0392b":"#d97706",storedCall:r.stored_call||""}));
    orphanCurveCandidates(run).forEach(r=>out.push({category:"Amplification / curve shape",severity:r.severity||"review",experiment:runName(run),well:r.well||"",finding:r.finding||"Rising curve without a stored result",evidence:`${r.filterName||r.filterComb||"channel "+r.channel}; amplitude ${num(r.amplitude,1)}; terminal change ${num(r.terminalDelta,1)}`,source:"curve",curve:r.curve,sample:r.sample||"",target:r.target||"",channel:r.channel,issueColour:r.severity==="error"?"#c0392b":"#d97706",storedCall:r.call||""}));
  });
  const seen=new Set();return out.filter(r=>{const k=[r.category,r.severity,r.experiment,r.well,r.finding,r.source].join("|");if(seen.has(k))return false;seen.add(k);return true;});
}
function issueCurveRows(rows){
  const seen=new Set();return rows.filter(r=>r.source==="curve"&&Array.isArray(r.curve)&&r.curve.length>4).sort((a,b)=>{
    const sa=a.severity==="error"?0:1,sb=b.severity==="error"?0:1;return sa-sb||String(a.experiment).localeCompare(String(b.experiment))||String(a.well).localeCompare(String(b.well));
  }).filter(r=>{const k=`${r.experiment}|${r.well}|${r.channel}|${r.target}`;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,120).map(r=>({curve:r.curve,experiment:r.experiment,well:r.well,sample:r.sample,target:r.target,role:"Issue",call:r.storedCall,issueColour:r.issueColour}));
}
function renderIssueOverview(){
  const box=$("#issue-overview");if(!box)return;
  purgeCurvePlots();
  if(!RUNS.length){box.innerHTML=emptyReview("Load two or more experiments to compare grouped problems.");return;}
  const indexes=issueSelectedRunIndexes(),rows=issueOverviewRows(indexes),cat=REVIEW_STATE.issueCategory||"all",shown=cat==="all"?rows:rows.filter(r=>r.category===cat);
  const counts=new Map();rows.forEach(r=>{const c=counts.get(r.category)||{n:0,error:0,review:0,runs:new Set()};c.n++;if(r.severity==="error")c.error++;else if(r.severity==="review")c.review++;c.runs.add(r.experiment);counts.set(r.category,c);});
  const runPicker=RUNS.map((r,i)=>`<label><input type="checkbox" data-issue-run="${i}"${indexes.includes(i)?" checked":""}>${esc(runName(r))}</label>`).join("");
  const groups=[...counts.entries()].sort((a,b)=>ISSUE_CATEGORY_ORDER.indexOf(a[0])-ISSUE_CATEGORY_ORDER.indexOf(b[0]));
  const tableRows=shown.slice(0,500).map(r=>({category:r.category,severity:r.severity,experiment:r.experiment,well:r.well||"",finding:r.finding,evidence:r.evidence}));
  box.innerHTML=`<div class="toolbar"><label>Problem category<select id="issue-category"><option value="all">All categories</option>${ISSUE_CATEGORY_ORDER.filter(c=>counts.has(c)).map(c=>`<option value="${esc(c)}"${cat===c?" selected":""}>${esc(c)}</option>`).join("")}</select></label><button class="ghost" id="issue-all-runs">Select all experiments</button><button class="ghost" id="issue-clear-runs">Clear experiments</button><button class="ghost" id="dl-issue-overview">Download grouped problems (CSV)</button></div><div class="issue-run-picker" aria-label="Experiments included">${runPicker}</div><div class="issue-category-grid">${groups.map(([name,c])=>`<div class="issue-category ${c.error?"bad":""}"><b>${c.n}</b> ${esc(name)}<small>${c.error} error · ${c.review} review · ${c.runs.size} experiment(s)</small></div>`).join("")||'<p class="hint">No review or error finding was raised for the selected experiments.</p>'}</div><p class="hint">${shown.length} finding(s) shown for ${indexes.length} selected experiment(s). The chart below uses the stored cycle-by-cycle fluorescence for curve findings; red marks errors and amber marks review items.</p>${shown.length?`<div class="scroll">${table([{key:"category",label:"Category"},{key:"severity",label:"Level"},{key:"experiment",label:"Experiment"},{key:"well",label:"Well"},{key:"finding",label:"Problem"},{key:"evidence",label:"Evidence"}],tableRows)}</div>`:""}<div class="issue-chart-wrap"><h4>Reconstructed problem curves</h4><div class="issue-legend"><span><i style="background:#c0392b"></i>error-level curve</span><span><i style="background:#d97706"></i>review-level curve</span><span>stored fluorescence by cycle; endpoint marker shows the final cycle</span></div><div id="issue-overview-chart" class="curve-plot-host"></div><div class="tip" id="issue-chart-tip"></div><p class="hint" id="issue-chart-note"></p></div>`;
  $$("#issue-overview input[data-issue-run]").forEach(cb=>cb.onchange=()=>{REVIEW_STATE.issueRuns=$$("#issue-overview input[data-issue-run]:checked").map(x=>Number(x.dataset.issueRun));renderIssueOverview();});
  const select=$("#issue-category");if(select)select.onchange=()=>{REVIEW_STATE.issueCategory=select.value;renderIssueOverview();};
  $("#issue-all-runs").onclick=()=>{REVIEW_STATE.issueRuns=null;renderIssueOverview();};
  $("#issue-clear-runs").onclick=()=>{REVIEW_STATE.issueRuns=[];REVIEW_STATE.issueCategory="all";renderIssueOverview();};
  const csvButton=$("#dl-issue-overview");if(csvButton)csvButton.onclick=()=>{if(tableRows.length)download(baseName()+"_grouped_problem_overview.csv",toCSV(Object.keys(tableRows[0]).map(k=>({key:k,label:k})),tableRows),"text/csv");};
  const curves=issueCurveRows(shown),chart=$("#issue-overview-chart");
  if(curves.length){
    const interactive=mountInteractiveCurvePlot(chart,curves,{height:420,label:w=>graphHoverLabel(w.experiment,w,w.target||""),colour:w=>w.issueColour||"#64748b",ylabel:"Stored fluorescence"});
    if(!interactive){chart.innerHTML='<canvas width="1000" height="420"></canvas>';drawAmplificationCurves(chart.firstElementChild,curves,"well",false,{ylabel:"Stored fluorescence"});bindCurveTip(chart.firstElementChild,$("#issue-chart-tip"));}
    $("#issue-chart-note").textContent=`${curves.length} problem curve(s) drawn (up to 120 shown); hover for cycle values, use the mouse wheel to zoom, drag to pan, and Reset view to restore the axes. All finding rows remain in the table and CSV.`;
  } else{$("#issue-chart-note").textContent="No reconstructable stored curve is attached to the selected findings.";}
}

function renderReviewOverview(){
  const box=$("#review-overview");if(!box)return;
  if(!RUNS.length){box.innerHTML=emptyReview();return;}
  const stats=reviewStatisticsRows(),events=reviewEventsWithoutIntegrity(),orph=reviewOrphanWells(),
    display=reviewDisplayFindings(events),counts=reviewDisplayCounts(display),
    reviews=counts.reviews,errors=counts.errors,
    results=RUNS.reduce((n,r)=>n+(r.wells||[]).length,0),
    curves=RUNS.reduce((n,r)=>n+uniqueCurveCount(r),0),
    uncertain=stats.reduce((n,s)=>n+s.uncertain,0);
  box.innerHTML=`<div class="metric-grid">
    ${metricCard(RUNS.length,"experiments loaded","ok")}
    ${metricCard(results,"stored quantification rows","")}
    ${metricCard(curves,"linked amplification curves",curves<results?"warn":"ok")}
    ${metricCard(errors,"unique structural errors",errors?"bad":"ok")}
    ${metricCard(reviews,"unique review findings",reviews?"warn":"ok")}
    ${metricCard(counts.affectedRuns,"runs affected","")}
    ${metricCard(uncertain,"uncertain stored calls",uncertain?"warn":"ok")}
    ${metricCard(orph.length,"rising curves with no result in their own channel",orph.length?"warn":"ok")}
  </div>
  <p class="hint">${events.length} raw event(s) from the file, timeline, result and profile scans collapse to
     ${counts.unique} distinct finding(s) across ${counts.affectedRuns} run(s). The forensic log and every export
     keep all ${events.length} rows; only this summary is deduplicated.</p>
  <div class="notice ${errors?"bad":reviews?"warn":"ok"}"><b>${errors?"Structural errors found":
    reviews?"Review findings are available":"No structural finding in the loaded data"}.</b>
    These checks describe recoverability and internal consistency; they do not replace method-specific acceptance.</div>
  <div class="toolbar"><button class="ghost" id="open-rising-review">Open rising-curve review</button>
    <button class="ghost" id="dl-review-all">Download review tables (ZIP)</button></div>`;
  const openRising=$("#open-rising-review");if(openRising)openRising.onclick=()=>showReviewSheet("rising");
  $("#dl-review-all").onclick=downloadReviewBundle;
}
function plateColour(row,mode,lo,hi){
  if(mode==="cq")return heatColour(Number(row.cq),lo,hi);
  const key=mode==="subset"?row.subsets:mode==="type"?row.instrument_type:mode==="call"?row.call:row.role;
  if(mode==="role"||mode==="call")return REVIEW_COLOURS[key||"Unknown"]||"#f8fafc";
  let h=0;for(const c of String(key||""))h=(h*31+c.charCodeAt(0))>>>0;
  return key?PLATE_PASTELS[h%PLATE_PASTELS.length]:"#f8fafc";
}
function renderReviewPlate(){
  const box=$("#review-plate"),runSel=$("#plate-run"),targetSel=$("#plate-target");if(!box)return;
  if(!RUNS.length){
    setSelectItems(runSel,[],null);setSelectItems(targetSel,[],null);box.innerHTML=emptyReview();return;
  }
  const oldRun=runSel.value;
  setSelectItems(runSel,RUNS.map((r,i)=>({value:i,label:runName(r)})),oldRun);
  const run=runAt("#plate-run",0),oldTarget=targetSel.value;
  setSelectItems(targetSel,analysisChoices(run),oldTarget);
  const rows=plateMapRows(run,targetSel.value),mode=$("#plate-colour").value,
    cq=rows.map(r=>Number(r.cq)).filter(Number.isFinite),lo=cq.length?Math.min(...cq):0,hi=cq.length?Math.max(...cq):1;
  let h=`<div class="plate-scroll"><div class="plate-grid" style="grid-template-columns:24px repeat(${run.cols},96px)">`;
  h+=`<div class="plate-corner"></div>`;
  for(let c=1;c<=run.cols;c++)h+=`<div class="plate-head">${c}</div>`;
  for(let r=0;r<run.rows;r++){
    h+=`<div class="plate-rowhead">${String.fromCharCode(65+r)}</div>`;
    for(let c=0;c<run.cols;c++){
      const x=rows[r*run.cols+c],bg=plateColour(x,mode,lo,hi),empty=!x.sample&&!x.results;
      const sub=x.cq!==""?`Cq ${num(Number(x.cq),2)}`:(x.call||x.role||x.subsets||"");
      const tip=[x.well,x.sample,x.target,x.analysis,x.role,x.instrument_type,
        x.cq!==""?`Cq ${x.cq}`:"",x.call,x.named_unanalysed?"named but not analysed":""].filter(Boolean).join("\n");
      h+=`<div class="plate-well ${empty?"empty":""}" data-plate-pos="${x.position-1}"
        style="background:${bg}" title="${esc(tip)}"><strong>${esc(x.sample||x.well)}</strong>
        <span>${esc(sub)}</span>${x.named_unanalysed?`<span>not analysed</span>`:""}</div>`;
    }
  }
  h+=`</div></div>`;
  const legends=new Map();
  rows.forEach(r=>{
    const key=mode==="subset"?r.subsets:mode==="type"?r.instrument_type:mode==="call"?r.call:mode==="cq"?"Cq scale":r.role;
    if(key&&!legends.has(key))legends.set(key,plateColour(r,mode,lo,hi));
  });
  h+=`<div class="plate-legend">${[...legends].slice(0,18).map(([k,v])=>
    `<span><i style="background:${v}"></i>${esc(k)}</span>`).join("")}</div>
    <p class="hint">${rows.filter(r=>r.named_unanalysed==="yes").length} named position(s) have no result in the selected analysis.</p>`;
  box.innerHTML=h;
}
function drawPlateMapImage(){
  const run=runAt("#plate-run",0);if(!run)return null;
  const rows=plateMapRows(run,$("#plate-target").value),mode=$("#plate-colour").value,
    cq=rows.map(r=>Number(r.cq)).filter(Number.isFinite),lo=cq.length?Math.min(...cq):0,hi=cq.length?Math.max(...cq):1;
  const cw=112,ch=58,left=30,top=34,canvas=ce("canvas");
  canvas.width=left+run.cols*cw+12;canvas.height=top+run.rows*ch+28;
  const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.font="11px sans-serif";ctx.textAlign="center";ctx.fillStyle="#475569";
  for(let c=0;c<run.cols;c++)ctx.fillText(String(c+1),left+c*cw+cw/2,20);
  for(let r=0;r<run.rows;r++)ctx.fillText(String.fromCharCode(65+r),15,top+r*ch+ch/2+3);
  rows.forEach((x,i)=>{
    const r=Math.floor(i/run.cols),c=i%run.cols,x0=left+c*cw,y0=top+r*ch;
    ctx.fillStyle=plateColour(x,mode,lo,hi);ctx.strokeStyle="#cbd5e1";ctx.lineWidth=1;
    ctx.fillRect(x0+1,y0+1,cw-3,ch-3);ctx.strokeRect(x0+1,y0+1,cw-3,ch-3);
    ctx.textAlign="left";ctx.fillStyle="#111827";ctx.font="10px sans-serif";
    ctx.fillText(String(x.sample||x.well).slice(0,17),x0+5,y0+17);
    ctx.fillStyle="#475569";ctx.font="9px sans-serif";
    const sub=x.cq!==""?`Cq ${num(Number(x.cq),2)}`:(x.call||x.role||x.subsets||"");
    ctx.fillText(String(sub).slice(0,20),x0+5,y0+34);
  });
  return canvas;
}
function renderReviewComparison(){
  const box=$("#review-compare"),a=$("#cmp-a"),b=$("#cmp-b");if(!box)return;
  const samples=uniq(RUNS.flatMap(r=>(r.wells||[]).map(w=>w.sample).filter(Boolean))).sort();
  if(!samples.length){setSelectItems(a,[],null);setSelectItems(b,[],null);box.innerHTML=emptyReview("No named quantification samples are loaded.");return;}
  const oldA=a.value,oldB=b.value;
  setSelectItems(a,samples.map(x=>({value:x,label:x})),oldA);
  const distinct=samples.find(x=>x.toLowerCase()!==String(a.value).toLowerCase())||samples[1]||samples[0];
  setSelectItems(b,samples.map(x=>({value:x,label:x})),oldB||distinct);
  const limit=Math.max(0,Number($("#cmp-limit").value)||0),rows=sampleComparisonRows(a.value,b.value,limit);
  REVIEW_STATE.comparison=rows;
  const display=rows.map(r=>({...r,mean_1:num(r.mean_1,3),sd_1:num(r.sd_1,3),mean_2:num(r.mean_2,3),
    sd_2:num(r.sd_2,3),difference:num(r.difference,3),
    review:r.review?tag("warn",r.review):tag("ok","within highlight threshold")}));
  box.innerHTML=table([
    {key:"target",label:"Target"},{key:"analysis",label:"Analysis"},
    {key:"mean_1",label:`${a.value} mean`,n:1},{key:"sd_1",label:`${a.value} SD`,n:1},
    {key:"n_1",label:`${a.value} n`,n:1},{key:"mean_2",label:`${b.value} mean`,n:1},
    {key:"sd_2",label:`${b.value} SD`,n:1},{key:"n_2",label:`${b.value} n`,n:1},
    {key:"difference",label:"Difference",n:1},{key:"review",label:"Review",html:1}
  ],display);
}
function renderReviewStatistics(){
  const box=$("#review-statistics");if(!box)return;
  if(!RUNS.length){box.innerHTML=emptyReview();return;}
  const limit=Math.max(0,Number($("#stat-rep-limit").value)||0),rows=reviewStatisticsRows(),
    reps=replicateReviewRows(limit),orph=reviewOrphanWells(),missing=rows.reduce((n,r)=>n+r.missing_curves,0),
    uncertain=rows.reduce((n,r)=>n+r.uncertain,0);
  REVIEW_STATE.statistics=rows;
  const show=rows.map(r=>({...r,mean:num(r.mean,3),sd:num(r.sd,3),cv:num(r.cv,2),
    min:num(r.min,3),q1:num(r.q1,3),median:num(r.median,3),q3:num(r.q3,3),max:num(r.max,3),
    concentration_mean:Number.isFinite(r.concentration_mean)?Number(r.concentration_mean).toPrecision(5):"",
    concentration_sd:Number.isFinite(r.concentration_sd)?Number(r.concentration_sd).toPrecision(5):"",
    concentration_cv:num(r.concentration_cv,2)}));
  let h=`<div class="metric-grid">
    ${metricCard(rows.length,"analysis summaries","ok")}
    ${metricCard(missing,"result rows without a linked curve",missing?"warn":"ok")}
    ${metricCard(uncertain,"uncertain stored calls",uncertain?"warn":"ok")}
    ${metricCard(reps.length,`replicate groups with range ≥ ${limit} Cq`,reps.length?"warn":"ok")}
    ${metricCard(orph.length,"rising curves omitted from analyses",orph.length?"warn":"ok")}
  </div>`;
  h+=`<div class="scroll">${table([
    {key:"experiment",label:"Experiment"},{key:"target",label:"Target"},{key:"analysis",label:"Analysis"},
    {key:"results",label:"Results",n:1},{key:"amplified",label:"Amplified",n:1},
    {key:"mean",label:"Mean Cq",n:1},{key:"sd",label:"SD",n:1},{key:"cv",label:"CV %",n:1},
    {key:"min",label:"Min",n:1},{key:"q1",label:"Q1",n:1},{key:"median",label:"Median",n:1},
    {key:"q3",label:"Q3",n:1},{key:"max",label:"Max",n:1},
    {key:"uncertain",label:"Uncertain",n:1},{key:"missing_curves",label:"No curve",n:1},
    {key:"concentration_n",label:"Conc. n",n:1},{key:"concentration_mean",label:"Conc. mean",n:1},
    {key:"concentration_sd",label:"Conc. SD",n:1},{key:"concentration_cv",label:"Conc. CV %",n:1}
  ],show)}</div>`;
  if(reps.length)h+=`<h3>Replicate groups to review</h3>`+table([
    {key:"experiment",label:"Experiment"},{key:"target",label:"Target"},{key:"sample",label:"Sample"},
    {key:"wells",label:"Wells"},{key:"n",label:"n",n:1},{key:"mean",label:"Mean Cq",n:1},
    {key:"sd",label:"SD",n:1},{key:"range",label:"Range",n:1},{key:"finding",label:"Finding"}
  ],reps.map(r=>({...r,mean:num(r.mean,3),sd:num(r.sd,3),range:num(r.range,3)})));
  if(orph.length)h+=`<p class="hint">${orph.length} rising curve(s) need their own evidence view. Open the <b>Rising curves without result</b> sheet for the combined plot, plate locations, channel context and Cq/Ct evidence.</p>`;
  box.innerHTML=h;
}
function renderReviewControls(){
  const box=$("#review-controls"),sel=$("#lj-series");if(!box)return;
  renderControlCategoryEditor();
  if(!RUNS.length){setSelectItems(sel,[],null);box.innerHTML=emptyReview();return;}
  const grouping=$("#lj-grouping").value,series=reviewControlSeries(grouping),old=sel.value;
  REVIEW_STATE.controlSeries=series;
  setSelectItems(sel,series.map(s=>({value:s.key,
    label:`${s.sample} · ${s.category} · ${s.target} (${s.n}/${s.runs} numeric runs)`})),old);
  const s=series.find(x=>x.key===sel.value);
  if(!s){box.innerHTML=emptyReview("No control wells could be identified from sample types or neutral control names.");return;}
  const pooled=s.exact.length>1?`Pooled names: ${s.exact.join(", ")}.`:"";
  const assess=s.judgeable?(s.flagged?tag("warn",`${s.flagged} Westgard flag(s)`):tag("ok","no Westgard flag"))
    :tag("warn","fewer than three numeric run points — limits not drawn");
  box.innerHTML=`<div class="kv">
      <b>Series</b><span>${esc(s.sample)} · ${esc(ui(s.category))} · ${esc(s.target)}</span>
      <b>Runs</b><span>${s.runs} (${s.n} with a numeric Cq)</span>
      <b>Mean / SD</b><span>${s.judgeable?`${num(s.mean,3)} / ${num(s.sd,3)}`:"not estimated as control limits"}</span>
      <b>Assessment</b><span>${assess}</span>
    </div>${pooled?`<p class="hint">${esc(pooled)}</p>`:""}
    <div class="chart-wrap"><canvas id="lj-chart" width="920" height="330"></canvas></div>
    <div class="scroll">${table([
      {key:"experiment",label:"Experiment"},{key:"date",label:"Date"},{key:"wells",label:"Wells"},
      {key:"n",label:"Replicates",n:1},{key:"cq",label:"Run mean Cq",n:1},{key:"flags",label:"Westgard"}
    ],s.points.map(p=>({...p,cq:Number.isFinite(p.cq)?num(p.cq,3):"not detected"})))}</div>`;
  drawLeveyJennings($("#lj-chart"),s);
}
function drawLeveyJennings(canvas,s){
  if(!canvas)return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height,L=62,R=24,T=22,B=58,
    vals=s.points.map(p=>p.cq).filter(Number.isFinite);
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  if(!vals.length){ctx.fillStyle="#5b6672";ctx.font="13px sans-serif";ctx.fillText(ui("No numeric Cq in this series"),L,H/2);return;}
  const spread=s.judgeable?3.5*s.sd:Math.max(.6,range(vals)*.7),lo=Math.min(...vals,s.mean-spread),
    hi=Math.max(...vals,s.mean+spread),span=Math.max(.2,hi-lo);
  const X=i=>L+(s.points.length<=1?.5:i/(s.points.length-1))*(W-L-R),
    Y=v=>T+(hi-v)/span*(H-T-B);
  ctx.font="11px sans-serif";ctx.textAlign="right";ctx.fillStyle="#64748b";
  for(let i=0;i<=5;i++){const v=lo+span*i/5,y=Y(v);ctx.strokeStyle="#e5e7eb";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.fillText(v.toFixed(1),L-7,y+3);}
  if(s.judgeable)[-3,-2,-1,0,1,2,3].forEach(k=>{
    const v=s.mean+k*s.sd,y=Y(v),major=Math.abs(k)>=2;
    ctx.strokeStyle=k===0?"#1b7837":Math.abs(k)===3?"#c0392b":Math.abs(k)===2?"#d97706":"#94a3b8";
    ctx.lineWidth=k===0?1.7:1;ctx.setLineDash(k?[4,4]:[]);
    ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);
    if(major||k===0){ctx.fillStyle=ctx.strokeStyle;ctx.fillText(k===0?ui("mean"):`${k>0?"+":""}${k}s`,W-R-3,y-4);}
  });
  ctx.strokeStyle="#1f6feb";ctx.lineWidth=1.7;ctx.beginPath();let started=false;
  s.points.forEach((p,i)=>{if(!Number.isFinite(p.cq)){started=false;return;}
    const x=X(i),y=Y(p.cq);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);});ctx.stroke();
  s.points.forEach((p,i)=>{
    const x=X(i);if(!Number.isFinite(p.cq)){ctx.strokeStyle="#c0392b";ctx.beginPath();
      ctx.moveTo(x-5,H-B-6);ctx.lineTo(x+5,H-B+4);ctx.moveTo(x+5,H-B-6);ctx.lineTo(x-5,H-B+4);ctx.stroke();return;}
    ctx.fillStyle=p.flags?"#c0392b":"#1f6feb";ctx.beginPath();ctx.arc(x,Y(p.cq),p.flags?5:4,0,Math.PI*2);ctx.fill();
  });
  const step=Math.max(1,Math.ceil(s.points.length/12));ctx.textAlign="center";ctx.fillStyle="#475569";
  s.points.forEach((p,i)=>{if(i%step&&i!==s.points.length-1)return;ctx.save();ctx.translate(X(i),H-B+16);
    ctx.rotate(-.45);ctx.fillText(p.tick,0,0);ctx.restore();});
  ctx.fillStyle="#334155";ctx.fillText(ui("Experiment date (day.month)"),(L+W-R)/2,H-7);
  ctx.save();ctx.translate(15,(T+H-B)/2);ctx.rotate(-Math.PI/2);ctx.fillText("Cq",0,0);ctx.restore();
}
function renderReviewRuns(){
  const box=$("#review-runs");if(!box)return;
  if(!RUNS.length){box.innerHTML=emptyReview();return;}
  const events=reviewEventsWithoutIntegrity(),runs=reviewRunRows(events);REVIEW_STATE.forensic=events;
  const runDisplay=runs.map(r=>({...r,status:r.status==="Error"?tag("bad",r.status):
    r.status==="Review"?tag("warn",r.status):tag("ok",r.status)}));
  setSelectItems($("#fx-run"),[{value:"",label:"All runs"},...uniq(events.map(e=>e.experiment)).map(x=>({value:x,label:x}))]);
  const lvl=$("#fx-level").value,fr=$("#fx-run").value;
  const shown=events.filter(e=>(lvl==="all"||(lvl==="error"?e.severity==="error":e.severity!=="info"))&&(!fr||e.experiment===fr));
  const eventDisplay=shown.slice(0,500).map(e=>({...e,severity:e.severity==="error"?tag("bad","error"):
    e.severity==="review"?tag("warn","review"):tag("ok","information")}));
  const display=reviewDisplayFindings(events),counts=reviewDisplayCounts(display);
  const uniqueDisplay=display.map(r=>({severity:r.severity==="error"?tag("bad","error"):
      r.severity==="review"?tag("warn","review"):tag("ok","information"),
    area:r.area,finding:r.finding,occurrences:r.occurrences,runs:r.runCount,
    variants:r.variantCount,
    experiments:r.runs.slice(0,3).join(", ")+(r.runCount>3?` (+${r.runCount-3} more)`:"")}));
  box.innerHTML=`<div class="scroll">${table([
      {key:"experiment",label:"Experiment"},{key:"date",label:"Date"},{key:"operator",label:"Operator"},
      {key:"instrument",label:"Instrument"},{key:"plate",label:"Plate"},{key:"analyses",label:"Analyses",n:1},
      {key:"results",label:"Results",n:1},{key:"curves",label:"Curves",n:1},
      {key:"errors",label:"Unique errors",n:1},{key:"reviews",label:"Unique review",n:1},
      {key:"raw_errors",label:"Raw errors",n:1},{key:"raw_reviews",label:"Raw review",n:1},
      {key:"status",label:"Status",html:1}
    ],runDisplay)}</div>
    <h3>Distinct findings</h3>
    <p class="hint">One row per condition and level, counted across runs. "Evidence variants" is how many
       different pieces of evidence that row covers, so an aggregated row never hides that its occurrences
       differ. The raw log below keeps every event, and so does every export.</p>
    <div class="scroll">${table([
      {key:"severity",label:"Level",html:1},{key:"area",label:"Area"},{key:"finding",label:"Finding"},
      {key:"occurrences",label:"Events",n:1},{key:"runs",label:"Runs",n:1},
      {key:"variants",label:"Evidence variants",n:1},{key:"experiments",label:"Experiments"}
    ],uniqueDisplay)}</div>
    <h3>Forensic log (raw events)</h3><div class="scroll">${table([
      {key:"experiment",label:"Experiment"},{key:"severity",label:"Level",html:1},{key:"area",label:"Area"},
      {key:"finding",label:"Finding"},{key:"evidence",label:"Evidence"}
    ],eventDisplay)}</div><p class="hint">${shown.length} of ${events.length} finding(s) shown${shown.length>500?" (first 500 on screen; the CSV has all)":""}.</p>`;
}
function curveSignal(run){return run&&run.eds?($("#curve-signal").value||"stored"):"stored";}
function curveRowsSelected(){
  const run=runAt("#curve-run",0);if(!run)return [];
  const key=$("#curve-target").value,sig=curveSignal(run),smp=$("#curve-sample").value;
  let rows=selectedWells(run,key);
  if(smp)rows=rows.filter(w=>(w.sample||"")===smp);
  if(sig==="drn")return rows.filter(w=>w.eds&&w.eds.drn&&w.eds.drn.length).map(w=>Object.assign({},w,{curve:w.eds.drn}));
  if(sig==="mc"||sig==="raw"){
    const p=run.eds,out=[];
    uniq(rows.map(w=>w.pos)).forEach(pos=>{
      const w=rows.find(x=>x.pos===pos);
      if(sig==="mc")Object.entries(p.mc.signal[pos]||{}).forEach(([dye,arr])=>out.push(Object.assign({},w,{curve:arr,
        target:dye,analysis:"Multicomponent "+dye,analysisUid:"mc:"+dye,filterName:dye,filterComb:QS_DYE_FILTER[dye.toUpperCase()]||""})));
      else p.raw.sets.forEach(fs=>out.push(Object.assign({},w,{curve:(p.raw.data[fs]||[]).map(r=>r?r[pos]:NaN),
        target:fs,analysis:"Raw "+fs,analysisUid:"raw:"+fs,filterName:fs,filterComb:fs})));
    });
    return out.filter(w=>w.curve.length);
  }
  rows=rows.filter(w=>w.curve&&w.curve.length);
  return key||smp?rows:physicalCurveRows(rows);
}
const SERIES_PALETTE=["#1f6feb","#c0392b","#1b7837","#d97706","#6f42c1","#0d9488","#be185d","#4b5563","#65a30d","#0891b2","#9333ea","#b45309"];
let CURVE_KEY_COLOURS=new Map();
const CALL_LINE={Positive:"#c0392b",Negative:"#1f6feb",Uncertain:"#d97706",NotCalculated:"#5b6672","Not analysed":"#6f42c1"};
function curveKey(w,mode){if(mode==="sop"){const r=sopOutcomeFor(runAt("#curve-run",0),w);return r?r.label:"Not interpreted";}return mode==="call"?w.call:mode==="sample"?w.sample:mode==="target"?w.target:mode==="well"?w.well:w.role;}
function curveColour(w,mode){
  if(w&&w.issueColour)return w.issueColour;
  const key=curveKey(w,mode);
  if(mode==="sop"){const r=sopOutcomeFor(runAt("#curve-run",0),w);return r?r.colour:"#94a3b8";}
  if(mode==="target"||mode==="well"||mode==="sample"){
    /* distinct colours in order of first appearance; a hash collides too often with few series */
    const k=String(key||w.well);
    if(!CURVE_KEY_COLOURS.has(k))CURVE_KEY_COLOURS.set(k,SERIES_PALETTE[CURVE_KEY_COLOURS.size%SERIES_PALETTE.length]);
    return CURVE_KEY_COLOURS.get(k);
  }
  /* Plate fills are pale by design; lines need the saturated role palette or Unknown curves vanish on white. */
  if(mode==="role")return ROLE_LINE[key||"Unknown"]||hashColour(key||w.well);
  if(mode==="call")return CALL_LINE[key]||hashColour(key||w.well);
  return REVIEW_COLOURS[key]||hashColour(key||w.well);
}
function renderCurveGraphAnalysis(run,targetKey){
  const el=$("#curve-analysis");if(!el)return;
  if(!run){el.innerHTML=graphAnalysisMarkup(null,null,"","");return;}
  const targetSel=$("#curve-target"),sampleSel=$("#curve-sample"),signalSel=$("#curve-signal");
  const targetLabel=targetSel&&targetSel.selectedIndex>=0?targetSel.options[targetSel.selectedIndex].textContent:"All analyses";
  const signalLabel=signalSel&&signalSel.selectedIndex>=0?signalSel.options[signalSel.selectedIndex].textContent:"Stored curve (raw / Rn)";
  el.innerHTML=graphAnalysisMarkup(run,{g:{title:"Amplification curves"},target:targetLabel},targetKey,sampleSel&&sampleSel.value,signalLabel);
}
function renderReviewCurves(){
  const box=$("#review-curves"),runSel=$("#curve-run"),targetSel=$("#curve-target");if(!box)return;
  purgeCurvePlots();
  if(!RUNS.length){setSelectItems(runSel,[],null);setSelectItems(targetSel,[],null);box.innerHTML=emptyReview();renderCurveGraphAnalysis(null,"");return;}
  setSelectItems(runSel,RUNS.map((r,i)=>({value:i,label:runName(r)})),runSel.value);
  const run=runAt("#curve-run",0);
  setSelectItems(targetSel,analysisChoices(run),targetSel.value);
  setSelectItems($("#curve-sample"),[{value:"",label:"All samples"},...uniq((run.wells||[]).map(w=>w.sample).filter(Boolean)).map(x=>({value:x,label:x}))],$("#curve-sample").value);
  $("#curve-signal-wrap").style.display=run.eds?"":"none";
  $("#curve-thr").parentElement.parentElement.style.display=run.eds&&curveSignal(run)==="drn"?"":"none";
  const rows=curveRowsSelected().map(w=>Object.assign({experiment:runName(run)},w));
  renderCurveGraphAnalysis(run,targetSel.value);
  if(!rows.length){
    const selected=selectedWells(run,targetSel.value),label=targetSel.options[targetSel.selectedIndex]?.textContent||"the selected analysis";
    const message=selected.length
      ? `${label} is present in the file, but no linked amplification curve was decoded for this selection. Stored results remain available in Results and the analysis data table.`
      : "No decoded amplification curves match this selection.";
    box.innerHTML=emptyReview(message);return;
  }
  const mode=$("#curve-colour").value,legend=new Map();CURVE_KEY_COLOURS=new Map();
  rows.forEach(w=>{const key=curveKey(w,mode);
    if(!legend.has(key||"Unassigned"))legend.set(key||"Unassigned",curveColour(w,mode));});
  box.innerHTML=`<div class="metric-grid">
      ${metricCard(rows.length,"curves drawn","ok")}
      ${metricCard(Math.max(...rows.map(w=>w.curve.length)),"maximum cycles","")}
      ${metricCard(rows.filter(w=>w.role&&w.role!=="Unknown").length,"control-role curves","")}
    </div><div class="legend">${[...legend].slice(0,24).map(([k,c])=>
      `<span><i style="background:${c}"></i>${esc(k)}</span>`).join("")}</div>
    <div class="chart-wrap" style="position:relative"><div id="curve-chart" class="curve-plot-host"></div><div class="tip" id="curve-tip"></div></div>
    <p class="hint">Hover a line for its stored cycle value. Use the mouse wheel to zoom, drag to pan, and Reset view to restore the axes. The CSV contains every cycle of every selected curve.</p>`;
  const sig=curveSignal(run),hl=[];
  if(sig==="drn"&&$("#curve-thr").checked)uniq(rows.map(w=>w.target)).forEach(t=>{
    const d=run.eds.analysis.detectors[t];if(d&&Number.isFinite(d.threshold))hl.push({y:d.threshold,label:`${t} threshold`,
      colour:(run.eds.exp.detectors.find(x=>x.name===t)||{}).color||"#475569"});});
  const chart=$("#curve-chart"),ylabel={drn:"ΔRn (stored)",mc:"Multicomponent signal",raw:"Raw filter-set fluorescence",stored:run.eds?"Rn (stored)":""}[sig];
  if(!mountInteractiveCurvePlot(chart,rows,{mode,normalize:false,log:$("#curve-log").checked,hlines:hl,ylabel,height:420,label:w=>graphHoverLabel(run,w,w.target||w.analysis||"")})){
    chart.innerHTML='<canvas width="1000" height="420"></canvas>';
    drawAmplificationCurves(chart.firstElementChild,rows,mode,$("#curve-log").checked,{hlines:hl,ylabel});
    bindCurveTip(chart.firstElementChild,$("#curve-tip"));
  }
}
function drawAmplificationCurves(canvas,rows,mode,logScale,opts){
  if(!canvas||!rows.length)return;
  opts=opts||{};
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height,L=70,R=20,T=20,B=48,
    raw=rows.flatMap(w=>w.curve.filter(Number.isFinite)).concat((opts.hlines||[]).map(h=>h.y)),pos=raw.filter(v=>v>0);
  const tx=v=>logScale?Math.log10(Math.max(v,pos.length?Math.min(...pos):1)):v,
    vals=raw.map(tx).filter(Number.isFinite),lo=Math.min(...vals),hi=Math.max(...vals),span=Math.max(1e-9,hi-lo),
    cycles=Math.max(...rows.map(w=>w.curve.length)),X=i=>L+i/Math.max(1,cycles-1)*(W-L-R),
    Y=v=>T+(hi-tx(v))/span*(H-T-B);
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  ctx.font="11px sans-serif";ctx.fillStyle="#64748b";ctx.textAlign="right";
  for(let i=0;i<=5;i++){const v=lo+span*i/5,y=T+(5-i)/5*(H-T-B);ctx.strokeStyle="#e5e7eb";
    ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();
    ctx.fillText(logScale?`10^${v.toFixed(1)}`:v.toFixed(Math.abs(v)>100?0:2),L-7,y+3);}
  const ordinary=rows.filter(w=>!w.role||w.role==="Unknown"),controls=rows.filter(w=>w.role&&w.role!=="Unknown");
  [...ordinary,...controls].forEach(w=>{
    ctx.strokeStyle=curveColour(w,mode);ctx.globalAlpha=controls.includes(w)?.95:.38;
    ctx.lineWidth=controls.includes(w)?1.8:1;ctx.beginPath();
    w.curve.forEach((v,i)=>{const x=X(i),y=Y(v);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
    if(w.issueColour){const v=w.curve[w.curve.length-1],x=X(w.curve.length-1),y=Y(v);ctx.fillStyle=w.issueColour;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}
  });ctx.globalAlpha=1;
  ctx.textAlign="center";ctx.fillStyle="#334155";
  for(let i=0;i<=5;i++){const c=Math.round(1+(cycles-1)*i/5);ctx.fillText(String(c),X(c-1),H-B+17);}
  (opts.hlines||[]).forEach(h=>{const y=Y(h.y);if(!Number.isFinite(y))return;ctx.save();ctx.strokeStyle=h.colour;ctx.setLineDash([6,4]);
    ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=h.colour;
    ctx.textAlign="left";ctx.fillText(h.label,L+6,y-4);ctx.restore();});
  ctx.fillText(ui("Cycle"),(L+W-R)/2,H-8);ctx.save();ctx.translate(16,(T+H-B)/2);ctx.rotate(-Math.PI/2);
  ctx.fillText(ui((opts.ylabel||"Raw fluorescence")+(logScale?" (log scale)":"")),0,0);ctx.restore();
  canvas._hit={rows,X,Y,W,H};
}
function bindCurveTip(canvas,tip){
  if(!canvas||!tip)return;
  canvas.onmousemove=e=>{
    const h=canvas._hit;if(!h)return;
    const rc=canvas.getBoundingClientRect(),sx=canvas.width/rc.width,sy=canvas.height/rc.height,
      mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy;
    let best=null,bd=(14*sx)**2;
    h.rows.forEach(w=>w.curve.forEach((v,i)=>{const y=h.Y(v);if(!Number.isFinite(y))return;
      const d=(h.X(i)-mx)**2+(y-my)**2;if(d<bd){bd=d;best={w,i,v};}}));
    if(!best){tip.style.display="none";return;}
    tip.innerHTML=`<b>${esc(graphHoverLabel(best.w.experiment||"",best.w,best.w.target||best.w.analysis||""))}</b><br>${esc(ui("Cycle"))} ${best.i+1} · ${esc(Number(best.v).toPrecision(6))}`
      +(Number.isFinite(best.w.CpRaw)?` · Cq ${num(best.w.CpRaw,2)}`:"");
    tip.style.display="block";
    const wrap=tip.parentElement,wr=wrap.getBoundingClientRect(),cx=e.clientX-wr.left+wrap.scrollLeft,cy=e.clientY-wr.top;
    tip.style.left=Math.min(cx+14,wrap.scrollWidth-tip.offsetWidth-4)+"px";tip.style.top=(cy+14)+"px";
  };
  canvas.onmouseleave=()=>{tip.style.display="none";};
}
/* Review charts use a self-contained canvas interaction layer so they remain
   interactive when the single-file page is opened offline. Operators get
   hover values, wheel zoom, drag-to-pan, and a reset-view button without an
   external chart library. */
const CURVE_PLOTS=[];
function purgeCurvePlots(){while(CURVE_PLOTS.length){const el=CURVE_PLOTS.pop();try{if(el&&el._curveDispose)el._curveDispose();}catch(e){}}}
function mountInteractiveCurvePlot(host,rows,opts){
  if(!host||!rows.length)return false;
  opts=opts||{};
  const normalize=!!opts.normalize, colour=opts.colour||((w)=>curveColour(w,opts.mode||"outcome"));
  const label=opts.label||((w)=>graphHoverLabel(w.experiment||w.run||"",w,w.target||w.analysis||""));
  const list=rows.slice(0,120),W=1100,H=470,L=72,R=24,T=30,B=54;
  const transformed=[];
  list.forEach(w=>{
    const source=w.curve.map(v=>Number.isFinite(v)?(!normalize&&opts.log&&v>0?Math.log10(v):v):null),finite=source.filter(Number.isFinite),mn=finite.length?Math.min(...finite):0,mx=finite.length?Math.max(...finite):1,span=mx-mn||1;
    transformed.push({w,values:source.map(v=>Number.isFinite(v)?(normalize?(v-mn)/span:v):null)});
  });
  const all=transformed.flatMap(x=>x.values).filter(Number.isFinite),cycles=Math.max(...list.map(w=>w.curve.length),2);
  if(!all.length)return false;
  const baseLo=normalize?0:Math.min(...all),baseHi=normalize?1:Math.max(...all),pad=(baseHi-baseLo||1)*.06;
  const initial={x0:1,x1:cycles,y0:normalize?0:baseLo-pad,y1:normalize?1:baseHi+pad},view=Object.assign({},initial);
  host.innerHTML=`<div class="curve-canvas-tools"><button type="button" class="ghost curve-reset">Reset view</button><span>Hover for values · wheel zooms · drag pans</span></div><div class="curve-canvas-frame"><canvas width="${W}" height="${H}"></canvas><div class="tip curve-canvas-tip"></div></div>`;
  const canvas=host.querySelector("canvas"),tip=host.querySelector(".curve-canvas-tip"),ctx=canvas.getContext("2d");
  const xPix=x=>L+(x-view.x0)/Math.max(1e-9,view.x1-view.x0)*(W-L-R),yPix=y=>T+(view.y1-y)/Math.max(1e-9,view.y1-view.y0)*(H-T-B),xVal=p=>view.x0+(p-L)/(W-L-R)*(view.x1-view.x0),yVal=p=>view.y1-(p-T)/(H-T-B)*(view.y1-view.y0);
  const fmt=v=>Number(v).toPrecision(Math.abs(v)>=100?6:5);
  function draw(){
    ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.font="11px sans-serif";ctx.strokeStyle="#e5e7eb";ctx.fillStyle="#64748b";ctx.textAlign="right";
    for(let i=0;i<=5;i++){const y=T+i*(H-T-B)/5,v=view.y1-(view.y1-view.y0)*i/5;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.fillText(fmt(v),L-8,y+3);}
    ctx.textAlign="center";for(let i=0;i<=5;i++){const x=L+i*(W-L-R)/5,v=view.x0+(view.x1-view.x0)*i/5;ctx.strokeStyle="#f1f5f9";ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,H-B);ctx.stroke();ctx.fillStyle="#64748b";ctx.fillText(String(Math.max(1,Math.round(v))),x,H-B+18);}
    (opts.hlines||[]).forEach(h=>{const hv=Number.isFinite(h.y)?(!normalize&&opts.log&&h.y>0?Math.log10(h.y):h.y):NaN;if(!Number.isFinite(hv)||hv<view.y0||hv>view.y1)return;const y=yPix(hv);ctx.save();ctx.strokeStyle=h.colour||"#475569";ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=h.colour||"#475569";ctx.textAlign="left";ctx.fillText(h.label||"",L+5,y-4);ctx.restore();});
    transformed.forEach(({w,values})=>{ctx.strokeStyle=colour(w);ctx.globalAlpha=w.issueColour?.95:.78;ctx.lineWidth=w.issueColour?2.5:(w.role&&w.role!=="Unknown"?1.8:1.25);ctx.beginPath();let started=false;values.forEach((v,i)=>{if(!Number.isFinite(v))return;const x=xPix(i+1),y=yPix(v);if(!started){ctx.moveTo(x,y);started=true;}else ctx.lineTo(x,y);});ctx.stroke();});ctx.globalAlpha=1;
    ctx.fillStyle="#334155";ctx.textAlign="center";ctx.fillText("Cycle",(L+W-R)/2,H-10);ctx.save();ctx.translate(17,(T+H-B)/2);ctx.rotate(-Math.PI/2);ctx.fillText(opts.ylabel||"Stored fluorescence",0,0);ctx.restore();
  }
  function nearest(mx,my){let best=null,bd=12*12;transformed.forEach(({w,values})=>values.forEach((v,i)=>{if(!Number.isFinite(v))return;const d=(xPix(i+1)-mx)**2+(yPix(v)-my)**2;if(d<bd){bd=d;best={w,v,i};}}));return best;}
  function move(e){const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,best=nearest(mx,my);if(!best){tip.style.display="none";return;}tip.innerHTML=`<b>${esc(label(best.w))}</b><br>Cycle ${best.i+1} · ${esc(fmt(best.v))}`;tip.style.display="block";tip.style.left=Math.min((mx/sx)+14,rc.width-tip.offsetWidth-6)+"px";tip.style.top=((my/sy)+14)+"px";}
  let drag=null;
  const onMove=e=>{if(drag){const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,dx=(mx-drag.x)/(W-L-R)*(view.x1-view.x0),dy=(my-drag.y)/(H-T-B)*(view.y1-view.y0);view.x0=drag.v.x0-dx;view.x1=drag.v.x1-dx;view.y0=drag.v.y0+dy;view.y1=drag.v.y1+dy;draw();}else move(e);};
  const onLeave=()=>{if(!drag)tip.style.display="none";};
  const onDown=e=>{drag={x:e.offsetX,y:e.offsetY,v:Object.assign({},view)};canvas.setPointerCapture(e.pointerId);};
  const onUp=e=>{drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
  const onWheel=e=>{e.preventDefault();const rc=canvas.getBoundingClientRect(),sx=W/rc.width,sy=H/rc.height,mx=(e.clientX-rc.left)*sx,my=(e.clientY-rc.top)*sy,fac=e.deltaY<0?.85:1.18,cx=xVal(mx),cy=yVal(my);view.x0=cx+(view.x0-cx)*fac;view.x1=cx+(view.x1-cx)*fac;view.y0=cy+(view.y0-cy)*fac;view.y1=cy+(view.y1-cy)*fac;draw();};
  canvas.addEventListener("mousemove",onMove);canvas.addEventListener("mouseleave",onLeave);canvas.addEventListener("pointerdown",onDown);canvas.addEventListener("pointerup",onUp);canvas.addEventListener("wheel",onWheel,{passive:false});canvas.dataset.interactive="true";
  host.querySelector(".curve-reset").onclick=()=>{Object.assign(view,initial);draw();};
  draw();host._curveDispose=()=>{canvas.removeEventListener("mousemove",onMove);canvas.removeEventListener("mouseleave",onLeave);canvas.removeEventListener("pointerdown",onDown);canvas.removeEventListener("pointerup",onUp);canvas.removeEventListener("wheel",onWheel);};CURVE_PLOTS.push(host);return true;
}
function risingCurveRows(){
  return RUNS.flatMap((run,ri)=>orphanCurveCandidates(run).map(o=>Object.assign({runIndex:ri},o)));
}
function risingCurveDisplayRows(rows){
  return rows.map(o=>({
    experiment:o.experiment,well:o.well,sample:o.sample||"",role:o.role||"Unknown",
    channel:o.filterName||`channel ${o.channel}`,target:o.target,
    cq_ct:o.sameChannelCq==null?"not stored":o.sameChannelCq,
    other_cq_ct:o.otherCq==null?"":o.otherCq,
    other_channels:o.otherChannels||"",classification:o.cls,severity:o.severity,
    amplitude:Number.isFinite(o.amplitude)?num(o.amplitude,3):"",
    relative:Number.isFinite(o.relative)?num(o.relative*100,0)+" %":"",
    finding:o.finding
  }));
}
function drawRisingCurveBundle(canvas,rows){
  if(!canvas)return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height,L=68,R=24,T=28,B=52;
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);
  if(!rows.length){ctx.fillStyle="#64748b";ctx.font="14px sans-serif";ctx.fillText("No rising curves selected",L,H/2);return;}
  const colourBy=new Map();rows.forEach(o=>{const k=`${o.experiment}|${o.channel}`;if(!colourBy.has(k))colourBy.set(k,hashColour(k));});
  const cycles=Math.max(...rows.map(o=>o.curve.length));
  const X=i=>L+i/Math.max(1,cycles-1)*(W-L-R),Y=v=>T+(1-v)*(H-T-B);
  ctx.font="11px sans-serif";ctx.textAlign="right";ctx.fillStyle="#64748b";
  for(let i=0;i<=4;i++){const v=i/4,y=Y(v);ctx.strokeStyle="#e5e7eb";ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.fillText(v.toFixed(2),L-8,y+3);}
  rows.forEach(o=>{
    const finite=o.curve.filter(Number.isFinite),mn=finite.length?Math.min(...finite):0,mx=finite.length?Math.max(...finite):1,span=mx-mn||1;
    const col=colourBy.get(`${o.experiment}|${o.channel}`)||"#1f6feb";
    ctx.strokeStyle=col;ctx.globalAlpha=.72;ctx.lineWidth=1.25;ctx.beginPath();
    o.curve.forEach((v,i)=>{if(!Number.isFinite(v))return;const x=X(i),y=Y((v-mn)/span);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
  });ctx.globalAlpha=1;
  ctx.textAlign="center";ctx.fillStyle="#334155";
  for(let i=0;i<=5;i++){const c=Math.round(1+(cycles-1)*i/5);ctx.fillText(String(c),X(c-1),H-B+18);}
  ctx.fillText("Cycle",(L+W-R)/2,H-9);ctx.save();ctx.translate(16,(T+H-B)/2);ctx.rotate(-Math.PI/2);ctx.fillText("Normalised signal",0,0);ctx.restore();
  canvas._risingLegend=[...colourBy];
}
function renderReviewRising(){
  const box=$("#review-rising"),sel=$("#rising-run"),level=$("#rising-level");if(!box)return;
  purgeCurvePlots();
  const all=risingCurveRows();
  if(!RUNS.length||!all.length){setSelectItems(sel,[],null);box.innerHTML=emptyReview("No rising curve without an own-channel result was detected.");return;}
  setSelectItems(sel,[{value:"",label:"All loaded experiments"},...RUNS.map((r,i)=>({value:i,label:runName(r)}))],sel.value);
  const runValue=sel.value,lev=level.value;
  const rows=all.filter(o=>(runValue===""||String(o.runIndex)===String(runValue))&&(lev==="all"||o.severity===lev));
  if(!rows.length){box.innerHTML=emptyReview("No rising curves match this filter.");return;}
  const display=risingCurveDisplayRows(rows),errors=rows.filter(o=>o.severity==="error").length;
  const legend=new Map();rows.forEach(o=>{const k=`${o.experiment} · ${o.filterName||"channel "+o.channel}`;if(!legend.has(k))legend.set(k,hashColour(k));});
  box.innerHTML=`<div class="metric-grid">${metricCard(rows.length,"rising curves",errors?"warn":"ok")}${metricCard(uniq(rows.map(o=>o.experiment)).length,"experiments","")}${metricCard(uniq(rows.map(o=>o.well)).length,"plate positions","")}${metricCard(errors,"error-level curves",errors?"bad":"ok")}</div>
    <div class="legend">${[...legend].slice(0,32).map(([k,c])=>`<span><i style="background:${c}"></i>${esc(k)}</span>`).join("")}${legend.size>32?`<span>+${legend.size-32} more series</span>`:""}</div>
    <div class="chart-wrap"><div id="rising-chart" class="curve-plot-host"></div></div>
    <p class="hint">The combined plot is per-curve normalised for visibility. Hover a curve for its experiment, well and cycle; use the mouse wheel to zoom, drag to pan, and Reset view to restore the axes. Use the amplitude and Cq/Ct evidence columns for the stored scale and same-position result context. No Cq/Ct is invented for the missing channel.</p>
    <div class="scroll">${table([
      {key:"experiment",label:"Experiment"},{key:"well",label:"Plate position"},{key:"sample",label:"Sample"},
      {key:"role",label:"Role"},{key:"channel",label:"Channel / filter"},{key:"target",label:"Missing analysis"},
      {key:"cq_ct",label:"Same-channel Cq/Ct"},{key:"other_cq_ct",label:"Other-channel Cq/Ct"},
      {key:"other_channels",label:"Other-channel evidence"},{key:"amplitude",label:"Amplitude",n:1},
      {key:"relative",label:"Vs reference",n:1},{key:"classification",label:"Classification"},
      {key:"severity",label:"Level"},{key:"finding",label:"Finding"}
    ],display.map(r=>({...r,severity:r.severity==="error"?tag("bad","error"):tag("warn","review")})))}</div>`;
  const chart=$("#rising-chart");
  if(!mountInteractiveCurvePlot(chart,rows,{normalize:true,height:470,colour:o=>o.severity==="error"?"#c0392b":hashColour(`${o.experiment}|${o.channel}`),label:o=>`${o.experiment} · ${o.well}${o.sample?" · "+o.sample:""} · ${o.filterName||"channel "+o.channel}`,ylabel:"Normalised signal"})){
    chart.innerHTML='<canvas width="1100" height="470"></canvas>';drawRisingCurveBundle(chart.firstElementChild,rows);
  }
}
function renderReviewInstrument(){
  const box=$("#review-instrument"),sel=$("#instrument-run");if(!box)return;
  if(!RUNS.length){setSelectItems(sel,[],null);box.innerHTML=emptyReview();return;}
  setSelectItems(sel,RUNS.map((r,i)=>({value:i,label:runName(r)})),sel.value);
  const t=instrumentRecordTables(runAt("#instrument-run",0));
  const block=(title,cols,rows)=>`<div class="record-block"><h3>${esc(title)} <span class="tag">${rows.length} row(s)</span></h3>
    ${rows.length?`<div class="scroll">${table(cols,rows)}</div>`:`<div class="notice">No record of this type.</div>`}</div>`;
  box.innerHTML=
    block("Run metadata",[{key:"field",label:"Field"},{key:"value",label:"Stored value"}],t.metadata)+
    block("Thermal program",Object.keys(t.program[0]||{}).map(k=>({key:k,label:k})),t.program)+
    block("Detection channels",Object.keys(t.channels[0]||{}).map(k=>({key:k,label:k})),t.channels)+
    block("Subsets",Object.keys(t.subsets[0]||{}).map(k=>({key:k,label:k})),t.subsets)+
    block("Analysis objects",Object.keys(t.analyses[0]||{}).map(k=>({key:k,label:k})),t.analyses)+
    block("Instrument replicate statistics",Object.keys(t.statistics[0]||{}).map(k=>({key:k,label:k})),t.statistics);
  const run=runAt("#instrument-run",0),auto=rows=>Object.keys(rows[0]||{}).map(k=>({key:k,label:k}));
  if(run&&run.eds){
    box.insertAdjacentHTML("beforeend",
      (t.std_curves.length?block("Standard curves",auto(t.std_curves),t.std_curves):"")+
      block("Provenance recorded in the file",auto(t.provenance),t.provenance)+
      block("Calibrations",auto(t.calibrations),t.calibrations)+
      block("Target settings",auto(t.target_settings),t.target_settings)+
      block("Analysis settings",auto(t.analysis_settings),t.analysis_settings)+
      block("Flag rules",auto(t.flag_rules),t.flag_rules)+
      block("Software modules",auto(t.software_modules),t.software_modules)+
      block("Per-well baselines",auto(t.well_baselines),t.well_baselines)+
      block("Export configuration saved in the file",auto(t.export_settings),t.export_settings)+
      (t.temperature_trace.length?`<div class="record-block"><h3>${esc(ui("Block and cover temperature during the run"))}</h3>
        <div class="legend"><span><i style="background:#1f6feb"></i>${esc(ui("sample zones (mean)"))}</span><span><i style="background:#d97706"></i>${esc(ui("heated cover"))}</span><span><i style="background:#6f42c1"></i>${esc(ui("zone spread (max − min)"))}</span></div>
        <div class="chart-wrap"><canvas id="temp-chart" width="1000" height="300"></canvas></div>
        <button class="ghost" id="dl-temp-png" type="button">Save chart as PNG</button></div>`:"")+
      block("Instrument log summary",auto(t.log_summary),t.log_summary)+
      block("Run events",auto(t.log_events),t.log_events)+
      block("Errors and warnings in the instrument log",auto(t.log_errors),t.log_errors)+
      block("Archive entries",auto(t.archive_entries),t.archive_entries));
    drawTemperatureTrace($("#temp-chart"),run);
    const b=$("#dl-temp-png");if(b)b.onclick=()=>downloadCanvas($("#temp-chart"),safeName(runName(run))+"_temperature_trace.png");
  }
}
function instrumentZip(){
  const run=runAt("#instrument-run",0);if(!run)return;
  const t=instrumentRecordTables(run),entries=Object.entries(t).map(([name,rows])=>({
    name:name+".csv",data:toCSV(Object.keys(rows[0]||{}).map(k=>({key:k,label:k})),rows)
  }));
  download(safeName(runName(run))+"_instrument_records.zip",makeStoredZip(entries),"application/zip");
}
function downloadCurveCSV(){withExportNames(downloadCurveCSVCore);}
function downloadCurveCSVCore(){
  const run=runAt("#curve-run",0),rows=[];
  curveRowsSelected().forEach(w=>w.curve.forEach((v,i)=>rows.push({experiment:runName(run),well:w.well,
    sample:exportName(w.sample),target:w.target,analysis:w.analysis,channel_index:w.channel,
    filter:w.filterComb||w.filterName||"",role:w.role,call:w.call,signal:curveSignal(run),cycle:i+1,fluorescence:v})));
  if(rows.length)download(baseName()+"_amplification_curves.csv",
    toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");
}
function downloadForensicCSV(){
  const events=reviewForensicEvents(),runs=reviewRunRows(events),rows=[
    ...runs.map(r=>({record_type:"run",...r})),
    ...events.map(e=>({record_type:"forensic_event",experiment:e.experiment,severity:e.severity,
      area:e.area,finding:e.finding,evidence:e.evidence}))
  ],keys=uniq(rows.flatMap(Object.keys));
  download(baseName()+"_runs_qc_forensic_log.csv",toCSV(keys.map(k=>({key:k,label:k})),rows),"text/csv");
}
function renderQualityReview(){
  renderReviewOverview();renderIssueOverview();renderReviewPlate();renderReviewComparison();renderReviewStatistics();
  renderReviewControls();renderReviewRuns();renderReviewCurves();renderReviewRising();renderReviewInstrument();
}
function renderQualityReviewLazy(){markDirty("review");renderTab("review");}
function showReviewSheet(name){
  $$("#review-tabs button").forEach(b=>b.classList.toggle("on",b.dataset.review===name));
  $$(".review-sheet").forEach(s=>s.classList.toggle("on",s.dataset.reviewSheet===name));
  renderReviewSheetLazy(name);
  localizeDOM(document.querySelector("#tab-review"));
}
function wireQualityReview(){
  $$("#review-tabs button").forEach(b=>b.onclick=()=>showReviewSheet(b.dataset.review));
  $("#plate-run").onchange=()=>{setSelectItems($("#plate-target"),analysisChoices(runAt("#plate-run",0)),"");renderReviewPlate();};
  $("#plate-target").onchange=renderReviewPlate;$("#plate-colour").onchange=renderReviewPlate;
  $("#dl-plate-csv").onclick=()=>{const run=runAt("#plate-run",0),rows=plateMapRows(run,$("#plate-target").value);
    if(rows.length)download(safeName(runName(run))+"_plate_map.csv",toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");};
  $("#dl-plate-png").onclick=()=>downloadCanvas(drawPlateMapImage(),safeName(runName(runAt("#plate-run",0)))+"_plate_map.png");
  ["#cmp-a","#cmp-b","#cmp-limit"].forEach(id=>$(id).onchange=renderReviewComparison);
  $("#dl-compare").onclick=()=>{const rows=REVIEW_STATE.comparison;if(rows.length)download(baseName()+"_sample_comparison.csv",
    toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");};
  $("#stat-rep-limit").onchange=renderReviewStatistics;
  $("#dl-statistics").onclick=()=>{const rows=REVIEW_STATE.statistics;if(rows.length)download(baseName()+"_statistics.csv",
    toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");};
  $("#lj-grouping").onchange=renderReviewControls;$("#lj-series").onchange=renderReviewControls;
  $("#reset-control-categories").onclick=()=>{REVIEW_STATE.controlCategoryOverrides={};renderReviewControls();};
  $("#dl-lj-csv").onclick=()=>{const s=REVIEW_STATE.controlSeries.find(x=>x.key===$("#lj-series").value);
    if(s)download(safeName(`${s.sample}_${s.target}`)+"_levey_jennings.csv",
      toCSV(Object.keys(s.points[0]||{}).map(k=>({key:k,label:k})),s.points),"text/csv");};
  $("#dl-lj-png").onclick=()=>{const s=REVIEW_STATE.controlSeries.find(x=>x.key===$("#lj-series").value);
    if(s)downloadCanvas($("#lj-chart"),safeName(`${s.sample}_${s.target}`)+"_levey_jennings.png");};
  $("#dl-runs").onclick=downloadForensicCSV;
  ["#fx-level","#fx-run"].forEach(id=>$(id).onchange=renderReviewRuns);
  $("#curve-run").onchange=()=>{setSelectItems($("#curve-target"),analysisChoices(runAt("#curve-run",0)),"");renderReviewCurves();};
  ["#curve-target","#curve-colour","#curve-log","#curve-signal","#curve-sample","#curve-thr"].forEach(id=>$(id).onchange=renderReviewCurves);
  $("#rising-run").onchange=renderReviewRising;$("#rising-level").onchange=renderReviewRising;
  $("#dl-rising-csv").onclick=()=>{const rows=risingCurveDisplayRows(risingCurveRows());if(rows.length)download(baseName()+"_rising_curves_review.csv",toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");};
  $("#dl-rising-png").onclick=()=>downloadCanvas($("#rising-chart"),baseName()+"_rising_curves.png");
  $("#dl-curves-csv").onclick=downloadCurveCSV;
  $("#dl-curves-png").onclick=()=>downloadCanvas($("#curve-chart"),safeName(runName(runAt("#curve-run",0)))+"_amplification_curves.png");
  $("#instrument-run").onchange=renderReviewInstrument;$("#dl-instrument").onclick=instrumentZip;
}

