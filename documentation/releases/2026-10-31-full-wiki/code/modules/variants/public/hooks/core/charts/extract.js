const CC_TZ={UTC:0,GMT:0,WET:0,WEST:1,CET:1,CEST:2,EET:2,EEST:3,MSK:3,SGT:8,CST:-6,CDT:-5,EST:-5,EDT:-4,MST:-7,MDT:-6,PST:-8,PDT:-7,JST:9,KST:9,IST:5.5,AEST:10,AEDT:11};
function ccParseJavaDate(s){                    // "#Mon Jun 15 15:35:04 EEST 2026" → epoch ms, or NaN
  const m=String(s||"").match(/\w{3} (\w{3}) +(\d+) (\d\d):(\d\d):(\d\d) (\w+) (\d{4})/);if(!m||!(m[6] in CC_TZ))return NaN;
  const mon="JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(m[1])/3;
  return Date.UTC(+m[7],mon,+m[2],+m[3],+m[4],+m[5])-CC_TZ[m[6]]*3600000;
}

/* ---- the static part of the history row: hardware + software, computed once per file ---- */
const ccQ=(a,p)=>{const s=(a||[]).filter(Number.isFinite).sort((x,y)=>x-y);return s.length?s[Math.min(s.length-1,Math.floor(p*s.length))]:NaN;};
const ccMedian=a=>ccQ(a,0.5);
/* Measured log span, never inferred from the programmed holds or fluorescence
   acquisitions. A reversed time base is not a usable duration. */
function ccTemperatureLogSpan(run){
  let times=[];
  if(run.platform==="QuantStudio"){
    const L=run.eds&&run.eds.log;
    if(L&&Array.isArray(L.temps))times=L.temps.filter(r=>Number.isFinite(r[0])&&Number.isFinite(r[1])).map(r=>r[0]/1000);
  }else{
    const L=run.cc&&run.cc.log;
    if(L&&L.seconds&&L.temp)times=Array.from(L.seconds).filter((t,i)=>Number.isFinite(t)&&Number.isFinite(L.temp[i]));
  }
  if(times.length<2||times.some((t,i)=>i>0&&t<times[i-1]))return NaN;
  const span=times[times.length-1]-times[0];return span>0?span:NaN;
}
function ccStaticBase(run){
  const m={},meta=run.meta||{};
  const set=(k,v)=>{if(v!==undefined&&v!==null&&!(typeof v==="number"&&!Number.isFinite(v)))m[k]=v;};
  const variant=(k,obj)=>{const o={};for(const [a,b] of Object.entries(obj))if(Number.isFinite(b))o[a]=b;if(Object.keys(o).length)m[k]=o;};
  const T=runTimes(run);
  set("run_minutes",T.durationMin);
  const temperatureSpan=ccTemperatureLogSpan(run);
  set("temperature_log_minutes",temperatureSpan/60);
  if(Number.isFinite(T.durationMin)&&Number.isFinite(temperatureSpan))
    set("run_log_gap_seconds",T.durationMin*60-temperatureSpan);
  set("edit_delay",Number.isFinite(T.editDelayH)?Math.log10(Math.max(T.editDelayH,0.01)):NaN);
  /* background and plateau per detection channel (A-H3) */
  const bg={},pl={},by=byKey((run.wells||[]).filter(w=>w.curve&&w.curve.length),w=>w.filterComb||w.target||String(w.channel));
  by.forEach((ws,ch)=>{const seen=new Set(),sig=ws.filter(w=>!seen.has(w.pos)&&seen.add(w.pos)).map(w=>wellSignal(w.curve));
    bg[ch]=ccMedian(sig.map(s=>s.background));pl[ch]=ccMedian(sig.map(s=>s.end));});
  variant("bg_median",bg);variant("plateau_median",pl);
  const x=run.cc||{};
  if(x.thermal)for(const [k,v] of Object.entries(x.thermal))set(k,v);
  if(run.platform!=="QuantStudio"){           /* ---------- LightCycler ---------- */
    const acq=x.acq||[];
    if(acq.length){
      const chans=uniq(acq.map(a=>a.channel)),sp=ccSetpoints(run);
      const acqSp=sp.length?sp.reduce((b,s)=>Math.abs(s-ccMedian(acq.map(a=>a.temp)))<Math.abs(b-ccMedian(acq.map(a=>a.temp)))?s:b,sp[0]):ccMedian(acq.map(a=>a.temp));
      const off=acq.filter(a=>a.channel===chans[0]).map(a=>a.temp-acqSp);
      set("hold_temp",{mean:mean(off),sd:sd(off),n:off.length});
      /* key channels by their filter pair (e.g. 465-510), not by the detection-format name,
         which differs between formats for the same optics (FAM vs 465-510) */
      const declared=((run.protocol||{}).channels)||[];
      const active=declared.some(q=>q.active)?declared.filter(q=>q.active):declared;
      const chName=c=>{const ch=active[c];return ch?(ch.ex&&ch.em?`${ch.ex}-${ch.em}`:ch.name):"channel "+c;};
      const ref={},drift={},intg={};
      const names=chans.map(chName),unique=names.filter((name,i)=>names.indexOf(name)===i&&names.lastIndexOf(name)===i);
      chans.forEach(c=>{const name=chName(c);if(!unique.includes(name))return; // Never overwrite a different acquisition channel.
        const a=acq.filter(r=>r.channel===c);ref[name]=a[0].ref;
        drift[name]=100*(a[a.length-1].ref/a[0].ref-1);intg[name]=ccMedian(a.map(r=>r.intgr));});
      variant("lamp_ref",ref);variant("lamp_drift",drift);variant("exposure",intg);
      const over=[];for(let k=0;k+1<acq.length;k++)if(acq[k+1].channel===acq[k].channel+1)over.push(acq[k+1].ms-acq[k].ms-acq[k].intgr);
      set("chan_switch",ccMedian(over));
      const per=[];for(let k=0;k+chans.length<acq.length;k+=chans.length)per.push(acq[k+chans.length].ms-acq[k].ms);
      set("cycle_sd",sd(per));
      m.invalid_acq={bad:acq.filter(a=>!a.valid).length,n:acq.length};
    }
    if(x.templogLate)m.templog_late=x.templogLate;
  }else{                                        /* ---------- QuantStudio ---------- */
    const E=run.eds,L=E&&E.log,g=x.qs;
    if(L&&L.leds.length){set("led_current",ccMedian(L.leds.map(r=>r[2])));set("led_junction",Math.max(...L.leds.map(r=>r[4]).filter(Number.isFinite)));}
    if(L&&L.temps.length){set("zone_spread",ccQ(L.temps.map(r=>r[4]),0.95));set("cover_temp",ccMedian(L.temps.map(r=>r[2])));
      set("heatsink_max",Math.max(...L.temps.map(r=>r[3]).filter(Number.isFinite)));}
    if(g){
      const sp=ccSetpoints(run);
      if(g.imgTemp.length){const mz=g.imgTemp.map(z=>mean(z)),s0=sp.length?sp.reduce((b,s)=>Math.abs(s-ccMedian(mz))<Math.abs(b-ccMedian(mz))?s:b,sp[0]):ccMedian(mz);
        const off=mz.map(v=>v-s0);set("hold_temp",{mean:mean(off),sd:sd(off),n:off.length});}
      const ex={};for(const [f,a] of Object.entries(g.exposure))ex[f]=ccMedian(a);variant("exposure",ex);
      set("wheel_ms",ccMedian(g.wheel));m.wheel_slow={bad:g.wheel.filter(v=>v>500).length,n:g.wheel.length};
      if(g.enc.length)variant("encoder",{emission:ccMedian(g.enc.map(e=>e[0])),excitation:ccMedian(g.enc.map(e=>e[1]))});
      const co=g.cam.filter(c=>c.req!=null).map(c=>c.dur-c.req);if(co.length)set("cam_overhead",{mean:mean(co),sd:sd(co),n:co.length});
      set("cover_down",g.cover.down);set("cover_up",g.cover.up);
      set("cmd_rt",ccQ(g.rt,0.95));set("tick_late",ccQ(g.tick,0.95));
      const hours=(g.last-g.first)/3600;if(hours>0)m.catch_up={count:g.catchUp,exposure:hours};
      set("img_proc",ccQ(g.pipe,0.95));set("roi_ms",ccMedian(g.roi));
      if(g.predicted)set("runtime_err",100*(g.elapsed-g.predicted)/g.predicted);
      m.log_errors={count:g.errors};
      const cs=Object.keys(g.cycleStart).map(Number).sort((a,b)=>a-b).map(c=>g.cycleStart[c]),per=cs.slice(1).map((v,i)=>(v-cs[i])*1000);
      set("cycle_sd",sd(per));
      if(g.props.lifeCycleCount)m.block_cycles=+g.props.lifeCycleCount;
      if(g.props.firmwareVersion)m.firmware=String(g.props.firmwareVersion);
      if(x.mfTime&&g.last)set("handoff_min",(x.mfTime-g.last*1000)/60000);
    }
    if(x.sat)m.saturation=x.sat;
    if(x.calib)for(const [k,v] of Object.entries(x.calib))set(k,v);
    const wc=(run.wells||[]).filter(w=>w.eds&&w.eds.ctRecalc!=null&&Number.isFinite(Number(w.CpRaw))&&Number(w.CpRaw)>0);
    if(wc.length)m.ct_mismatch={bad:wc.filter(w=>Math.abs(Number(w.CpRaw)-w.eds.ctRecalc)>0.2).length,n:wc.length};
  }
  return m;
}
function ccStatic(...args){return MISSY_HOOKS.invoke("ccStatic",this,args,ccStaticBase);}

/* ---- the SOP-dependent part (method and operator), recomputed whenever the profile changes ---- */
function ccDynamicBase(run,ev,counts){
  const m={},rows=(ev&&ev.rows)||[];
  const pos=rows.filter(r=>r.ctrl&&r.ctrl.expect==="positive"&&r.ctrl.purpose!=="reference check"),amp={},pcq={},bat={};
  /* one series per target and control material; the extract (extraction date and aliquot/dilution qualifiers) is kept
     in pc_batch and becomes a segment of the chart. A second extract of the same material on one plate is its own series. */
  byKey(pos,r=>sopControlIdentity(r.wells[0],run).series).forEach((rs,ser)=>{
    const byEx=[...byKey(rs,r=>sopControlIdentity(r.wells[0],run).extract)].sort((a,b)=>b[1].reduce((s,r)=>s+r.n,0)-a[1].reduce((s,r)=>s+r.n,0));
    byEx.forEach(([ex,grp],k)=>{const t=k?`${ser} · additional extract ${k}`:ser;
      const a=grp.flatMap(r=>r.used.filter(w=>w.curve&&w.curve.length).map(w=>wellSignal(w.curve).amplitude));
      if(a.length)amp[t]=ccMedian(a);const q=grp.map(r=>r.cqMean).filter(Number.isFinite);if(q.length)pcq[t]=mean(q);bat[t]=ex;});});
  if(Object.keys(amp).length)m.pc_amplitude=amp;if(Object.keys(pcq).length)m.pc_cq=pcq;if(Object.keys(bat).length)m.pc_batch=bat;
  const eff={};sopStdCurves(run).forEach(s=>{if(Number.isFinite(s.efficiency)&&s.efficiency>0&&s.efficiency<200)eff[s.target]=s.efficiency;});
  if(Object.keys(eff).length)m.efficiency=eff;
  const neg=rows.filter(r=>r.ctrl&&r.ctrl.expect==="negative");
  if(neg.length){m.ntc_rate={};byKey(neg,r=>r.ctrl.purpose||r.ctrl.name).forEach((rs,k)=>{m.ntc_rate[k]={bad:rs.reduce((s,r)=>s+r.det,0),n:rs.reduce((s,r)=>s+r.n,0)};});}
  const ic=rows.filter(r=>r.spec&&r.spec.kind==="ic"&&!r.ctrl&&Number.isFinite(r.cqMean)&&Number.isFinite(ev.icMedian));
  const fixed=sopNum(SOP.ic.referenceCq);
  if(ic.length&&Number.isFinite(fixed))m.ic_shift=mean(ic.map(r=>r.cqMean-fixed));
  const samp=rows.filter(r=>!r.ctrl&&r.outcome!=="Standard"&&r.outcome!=="Not interpreted");
  if(samp.length){
    m.action_rate={bad:samp.filter(r=>/Inconclusive|Repeat|Invalid/.test(r.outcome)).length,n:samp.length};
    m.late_rate={bad:samp.filter(r=>/late-signal|stochastic/.test(r.reason||"")).length,n:samp.length};
    const comparable=samp.flatMap(r=>r.used.map(w=>({w,o:r.storedOutcome||r.outcome}))).filter(x=>/Positive|Negative/.test(x.w.call)&&/Positive|Negative/.test(x.o));
    if(comparable.length)m.call_disagree={bad:comparable.filter(x=>x.w.call!==x.o).length,n:comparable.length};
  }
  if(run.eds){const cq=(run.wells||[]).filter(w=>Number(w.CpRaw)>0);
    if(cq.length)m.low_conf={bad:cq.filter(w=>/CQCONF/.test(w.warnCodes||"")).length,n:cq.length};}
  /* replicate precision (Cq < 30, so stochastic noise does not hide pipetting skill) */
  const reps=rows.filter(r=>!r.ctrl&&r.det>=2&&r.cqMean<30&&Number.isFinite(r.cqSd));
  if(reps.length)m.rep_sd=Math.sqrt(mean(reps.map(r=>r.cqSd**2)));
  /* row/column pattern: residual of each well from its replicate-group mean, averaged per plate row and column */
  const res=[];reps.forEach(r=>r.used.forEach(w=>{const q=Number(w.CpRaw);if(q>0)res.push({row:w.row,col:w.col,e:q-r.cqMean});}));
  if(res.length>=8){const eff=k=>[...byKey(res,x=>x[k]).values()].filter(g=>g.length>=2).map(g=>Math.abs(mean(g.map(x=>x.e))));
    const rc=Math.max(0,...eff("row"),...eff("col"));m.rowcol=rc<1e-9?0:rc;}
  /* passive reference (QS): level and well-to-well spread */
  if(run.eds&&run.eds.mc&&run.eds.plate.passiveRef&&run.eds.plate.passiveRef!=="NULL"){
    const dye=run.eds.plate.passiveRef,lv=[];
    Object.entries(run.eds.mc.signal||{}).forEach(([pos,d])=>{const w=(run.plate||{})[pos];if(!w||!w.name||!d[dye])return;lv.push(mean(d[dye].slice(0,5)));});
    if(lv.length>=4){m.rox_level=ccMedian(lv);m.rox_cv=100*sd(lv)/mean(lv);}
  }
  /* manual interventions */
  let man=0,items=0;
  if(run.eds){const D=run.eds.analysis.detectors||{};Object.values(D).forEach(d=>{items+=2;if(d.autoCt===false)man++;if(d.autoBaseline===false)man++;});}
  (run.wells||[]).forEach(w=>{items++;if(sopOmitted(w)||String(w.manual||"")==="1")man++;});
  if(items)m.manual_rate={bad:man,n:items};
  counts=counts||forensicCounts();
  m.copied={count:counts.copied.get(runName(run))||0};
  m.findings={count:counts.findings.get(runName(run))||0};
  return m;
}
function ccDynamic(...args){return MISSY_HOOKS.invoke("ccDynamic",this,args,ccDynamicBase);}

/* ---- extraction at load time (called from readStaged, while the file bytes are still in memory) ---- */
async function ccExtractOnLoad(run,source){
  const cc={};
  try{
    if(run.platform==="QuantStudio"){
      cc.qs=run.eds&&run.eds.ccLog||null;cc.sat=run.eds&&run.eds.ccSat||null;cc.calib=run.eds&&run.eds.ccCalib||null;cc.mfTime=run.eds&&run.eds.ccMf||NaN;
      const L=run.eds&&run.eds.log;
      if(L&&L.temps.length){const tt=L.temps.map(r=>r[0]/1000),yy=L.temps.map(r=>r[1]);
        cc.thermal=ccThermalSummary(ccThermalSteps(tt,yy,ccSetpoints(run),0.6,3),ccPeakRates(tt,yy,2.5));
        const tr=ccTransitions(tt,yy,ccTransitionPairs(run),0.6);if(tr)cc.thermal.transition=tr;}
    }else if(source&&source.text){
      cc.log=ccIxoTemperatureLog(source.text);
      if(cc.log){cc.thermal=ccThermalSummary(ccThermalSteps(cc.log.seconds,cc.log.temp,ccSetpoints(run)),ccPeakRates(cc.log.seconds,cc.log.temp,2));
        const tr=ccTransitions(cc.log.seconds,cc.log.temp,ccTransitionPairs(run),0.5);if(tr)cc.thermal.transition=tr;
        const dt=cc.log.seconds.slice(1).map((v,i)=>(v-cc.log.seconds[i])*1000);cc.templogLate={bad:dt.filter(d=>d>500).length,n:dt.length};
        cc.log=ccThin(cc.log.seconds,cc.log.temp,1800);}                   // light copy for the trace chart
      cc.acq=await ccIxoAcquisitions(source.text);
    }
  }catch(e){console.error("control-chart extraction",e);cc.error=e.message;}
  run.cc=cc;
}

/* protocol fingerprint: setpoints, holds and programmed ramp of every segment.
   Thermal charts compare like with like when filtered on it. */
function ccProtocolKeyBase(run){
  const segs=((run.protocol||{}).programs||[]).flatMap(p=>(p.segments||[]).map(s=>`${+s.target}/${+s.hold||0}s${s.slope?"@"+(+s.slope):""}`));
  return segs.join(" ")||"(protocol not decoded)";
}
function ccProtocolKey(...args){return MISSY_HOOKS.invoke("ccProtocolKey",this,args,ccProtocolKeyBase);}


