function edsEvents(run,push){
  const p=run.eds,A=p.analysis,wells=run.wells||[],list=(a,n=10)=>a.slice(0,n).join(", ")+(a.length>n?` … (+${a.length-n})`:"");
  const ntcCut=Number(((A.rules.find(r=>r.code==="NHC")||{}).criteria||"").split(" ")[1])||35;
  const hsd=Number(((A.rules.find(r=>r.code==="HSD")||{}).criteria||"").split(" ")[1])||0.5;
  if(run.isTemplate){push("info","Run state","Template or unrun experiment",`RunState ${p.exp.runState}; no results, curves or instrument log`);return;}
  if(p.exp.runState!=="COMPLETE")push("review","Run state",`Run state is ${p.exp.runState}`,"");
  if(p.exp.finalAnalysis!=="true")push("review","Run state","Final analysis is not marked complete","");
  const ntcByName=wells.filter(w=>w.role==="NTC"),ntcTask=Object.values(run.plate).some(r=>Object.values(r.channels||{}).some(c=>c.sampleType==="NTC"));
  if(ntcByName.length&&!ntcTask)push("review","Assay controls","NTC wells are identified by name only",
    "their task is UNKNOWN in the plate setup, so the instrument's AMPNC rule cannot fire on them");
  const late=ntcByName.filter(w=>w.CpRaw>=ntcCut);
  if(late.length)push("review","Assay controls",`${late.length} NTC result(s) with a late Ct ≥ ${ntcCut}`,list(late.map(w=>`${w.well} ${w.target} ${num(w.CpRaw,2)}`)));
  const inc=ntcByName.filter(w=>w.eds.ampLabel==="Inconclusive");
  if(inc.length)push("review","Assay controls",`${inc.length} NTC result(s) classed Inconclusive`,list(inc.map(w=>`${w.well} ${w.target}`)));
  const lowc=wells.filter(w=>Number.isFinite(w.CpRaw)&&w.eds.flags.includes("CC"));
  if(lowc.length)push("review","Stored Ct",`${lowc.length} reported Ct value(s) carry CQCONF (low Cq confidence)`,
    list(lowc.map(w=>`${w.well} ${w.sample} ${w.target} Ct ${num(w.CpRaw,2)} conf ${num(Number(w.eds.cqConf),3)}`)));
  const groups=byKey(wells,w=>`${w.sample}|${w.target}`);
  groups.forEach((g,k)=>{
    const [s,t]=k.split("|"),d=g.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.CpRaw);
    if(d.length&&d.length<g.length)push("review","Replicates",`${s} / ${t}: ${d.length} of ${g.length} replicates detected`,
      `Ct ${d.map(v=>num(v,2)).join(", ")}; stored means and ΔΔCt rest on these values only`);
    if(d.length>1&&sd(d)>hsd)push("review","Replicates",`${s} / ${t}: Ct SD ${num(sd(d),3)} above ${hsd} (HIGHSD rule)`,
      `range ${num(Math.min(...d),2)}–${num(Math.max(...d),2)}; wells ${g.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.well).join(" ")}`);
  });
  if(ec(run)){
    const e=ec(run),cal=A.ddct.Calibrator,ref=wells.filter(w=>w.sample===cal&&w.target===e&&Number.isFinite(w.CpRaw)).map(w=>w.CpRaw);
    uniq(wells.filter(w=>w.target===e&&w.role!=="NTC").map(w=>w.sample)).forEach(s=>{
      const v=wells.filter(w=>w.sample===s&&w.target===e),d=v.filter(w=>Number.isFinite(w.CpRaw)).map(w=>w.CpRaw);
      if(d.length<v.length)push("review","Endogenous control",`${e} not detected in ${v.length-d.length} of ${v.length} ${s} wells`,"");
      if(s!==cal&&ref.length&&d.length&&Math.abs(mean(d)-mean(ref))>3)
        push("review","Endogenous control",`${s}: ${e} differs by ${num(mean(d)-mean(ref),2)} cycles from ${cal}`,"shifts above 3 cycles are marked for review");
    });
  }
  (run.rqResults||[]).forEach(q=>{
    if(q.rqMin>0&&q.rqMax/q.rqMin>100)push("review","Relative quantification",
      `${q.sample} / ${q.target}: RQ interval spans more than 100-fold`,`RQ ${Number(q.normRatio).toPrecision(3)} (${Number(q.rqMin).toPrecision(3)} – ${Number(q.rqMax).toPrecision(3)}), n = ${q.n}`);
  });
  const cmp=p.results.filter(x=>x.ctDelta!=null),big=cmp.filter(x=>Math.abs(x.ctDelta)>0.2);
  if(cmp.length)push(big.length?"review":"info","Ct traceability",
    `Stored Ct re-derived from stored ΔRn and threshold: max |difference| ${num(Math.max(...cmp.map(x=>Math.abs(x.ctDelta))),3)} cycles`,
    big.length?list(big.map(x=>`${x.pos} ${x.target} ${num(x.ctDelta,2)}`)):`${cmp.length} wells compared; the software smooths first, so hundredths are expected`);
  const hidden=p.results.filter(x=>x.sample&&x.undetermined&&x.ctRecalc!=null);
  if(hidden.length)push("review","Ct traceability",`${hidden.length} Undetermined result(s) whose stored ΔRn crosses the threshold`,
    list(hidden.map(x=>`${x.pos} ${x.sample} ${x.target} ≈${num(x.ctRecalc,1)}`)));
  const start=p.exp.runStart,expired=p.calibrations.filter(c=>c.exp&&start&&c.exp<start);
  if(p.calibrations.length)push(expired.length?"error":"info","Calibration",
    expired.length?`${expired.length} calibration(s) expired before the run`:`${p.calibrations.length} calibrations valid on the run date`,
    p.calibrations.map(c=>`${c.name} ${EDS.dt(c.ts)}`).join("; "));
  const logName=p.log&&p.log.runName,qn=(p.provenance||{}).quantRunNames||[];
  if(logName&&logName!==p.exp.name)push("review","Provenance",`The instrument ran this plate as "${logName}"; the document is now named "${p.exp.name}"`,
    "messages.log Run Starting; the file was renamed or saved under a new name after the run");
  const foreign=qn.filter(n=>n!==p.exp.name&&n!==logName);
  if(foreign.length)push("review","Provenance",`Raw-data parts name a different run folder: ${foreign.join(", ")}`,"quant/*.xml calibration and output paths");
  else if(qn.length)push("info","Provenance","Raw-data parts name the same run folder",qn.join(", "));
  const pi=(p.provenance||{}).plateIni,pr=p.plate.passiveRef&&p.plate.passiveRef!=="NULL"?p.plate.passiveRef:"";
  if(pi&&pi.reference&&pr&&pi.reference.toUpperCase()!==pr.toUpperCase())
    push("review","Plate setup",`Passive reference differs between plate_setup.xml (${pr}) and plate_setup.ini (${pi.reference})`,"");
  if(pr)push("info","Plate setup",`Rn is normalised to the passive reference ${pr}`,"");
  const es=(p.provenance||{}).exportSetting;
  if(es&&es.location)push("info","Provenance",`Last export recorded in the file: ${es.format||"?"} to ${es.location}`,`file name ${es.fileName||"?"}`);
  Object.values(p.stdCurves||{}).forEach(sc=>{
    const bad=sc.r2!=null&&sc.r2<0.98,eff=sc.efficiency;
    push(bad||(eff!=null&&(eff<90||eff>110))?"review":"info","Standard curve",
      `${sc.target}: slope ${num(sc.slope,4)}, R² ${num(sc.r2,4)}, efficiency ${num(eff,2)} % (derived from the stored slope)`,
      `y-intercept ${num(sc.yIntercept,3)}; ${sc.x?sc.x.length:0} standard points; review limits R² ≥ 0.98, efficiency 90–110 %`);
  });
  const flagged=p.plate.wells.filter(w=>w.sample&&w.flags.length);
  if(flagged.length)push("info","Flags",`${flagged.reduce((n,w)=>n+w.flags.length,0)} stored flag(s) on ${flagged.length} named well(s)`,
    uniq(flagged.flatMap(w=>w.flags.map(f=>EDS.flagName(f.code)))).join(", "));
  const emp=p.plate.wells.filter(w=>!w.sample&&w.tasks.length);
  if(emp.length)push("info","Plate setup",`${emp.length} well(s) carry targets but no sample name`,"read, but left out of the result rows");
  const om=p.plate.wells.filter(w=>w.omit);
  if(om.length)push("review","Plate setup",`${om.length} omitted well(s)`,om.map(w=>w.pos).join(" "));
  if(p.log){
    const L=p.log;
    push("info","Instrument log",`${L.temps.length} temperature records, ${L.images} images, ${L.errors.length} error/warning line(s)`,
      `run ${EDS.dt(L.start)} – ${EDS.dt(L.end)}; firmware ${L.version||"?"}`);
    const spread=L.temps.length?Math.max(...L.temps.map(t=>t[4])):0;
    if(spread>1.5)push("review","Instrument log",`Block zone spread reached ${num(spread,2)} °C`,"maximum difference between the six sample zones");
    if(L.start&&p.exp.runStart&&Math.abs(L.start-p.exp.runStart)>120000)
      push("review","Instrument log","Log start and experiment start differ by more than 2 minutes",`${EDS.dt(L.start)} vs ${EDS.dt(p.exp.runStart)}`);
  }else push("review","Instrument log","messages.log is missing from a completed run","");
}
function ec(run){return ((run.eds||{}).analysis||{}).ddct?.EndogenousControl||"";}

/* ---- QuantStudio-only tables for the instrument sheet and exports ---- */
function edsRecordTables(run){
  const p=run&&run.eds;if(!p)return {};
  const A=p.analysis,L=p.log;
  return {
    calibrations:p.calibrations.map(c=>({file:c.file,calibration:c.name,id:c.id,performed:EDS.dt(c.ts),expires:EDS.dt(c.exp),
      status_on_run_date:c.exp&&p.exp.runStart&&c.exp<p.exp.runStart?"expired":"valid",operator:c.operator,version:c.version})),
    software_modules:p.tools.map(t=>({module:t.name,version:t.version,id:t.id})),
    target_settings:Object.entries(A.detectors).map(([t,d])=>({target:t,reporter:(p.exp.detectors.find(x=>x.name===t)||{}).reporter||"",
      quencher:(p.exp.detectors.find(x=>x.name===t)||{}).quencher||"",threshold:d.threshold,automatic_threshold:d.autoCt,
      automatic_baseline:d.autoBaseline,baseline_start:d.bStart,baseline_end:d.bStop,confidence:d.confidence})),
    analysis_settings:[...Object.entries(A.ddct).map(([k,v])=>({setting:k,value:v,source:"IDDCtAnalysisSettings"})),
      {setting:"SignalSmoothing",value:String(A.smoothing),source:"ISignalSmoothingSettings"},
      {setting:"Algorithm",value:A.algorithm,source:"IAlgorithmSelectSettings"},
      ...Object.entries(A.dataSelect).map(([k,v])=>({setting:k,value:v,source:"IDataSelectSettings"}))],
    flag_rules:A.rules.map(r=>({code:r.code,name:EDS.flagName(r.code),description:(EDS.FLAGS[r.code]||[])[1]||"",
      name_confirmed:(EDS.FLAGS[r.code]||[])[2]?"yes":"inferred",criteria:r.criteria,enabled:r.enabled,auto_omit:r.omitEnabled,
      wells_flagged:p.plate.wells.filter(w=>w.flags.some(f=>f.code===r.code)).map(w=>w.pos).join(" ")})),
    std_curves:Object.values(p.stdCurves||{}).map(sc=>({target:sc.target,slope:sc.slope,y_intercept:sc.yIntercept,r2:sc.r2,
      efficiency_percent_derived:sc.efficiency!=null?Number(sc.efficiency.toFixed(4)):"",unlabelled_field_4:sc.field4,unlabelled_field_6:sc.field6,
      points:sc.x?sc.x.length:"",log10_quantity:(sc.x||[]).join(" "),ct:(sc.y||[]).join(" ")})),
    provenance:[{field:"experiment id",value:p.exp.experimentId||""},{field:"run name in messages.log",value:(p.log||{}).runName||""},
      {field:"run folders named in quant/*.xml",value:((p.provenance||{}).quantRunNames||[]).join(", ")},
      {field:"original path (experiment.xml FileName)",value:p.exp.fileName},
      {field:"plate_setup.ini dyes / reference",value:(p.provenance||{}).plateIni?`${p.provenance.plateIni.dyes.join(", ")} / ${p.provenance.plateIni.reference}`:""},
      ...(((p.provenance||{}).exportSetting)?[{field:"last export format",value:p.provenance.exportSetting.format},
        {field:"last export location",value:p.provenance.exportSetting.location},{field:"last export file name",value:p.provenance.exportSetting.fileName}]:[])],
    export_settings:(((p.provenance||{}).exportSetting||{}).sets||[]).map(x=>({section:x.title,type:x.type,omitted:x.omit,skip_empty_wells:x.skipEmpty,columns:x.cols.join(" | ")})),
    well_baselines:p.results.filter(x=>x.baseline).map(x=>({well:x.pos,sample:x.sample,target:x.target,automatic:x.baseline.auto,start:x.baseline.start,end:x.baseline.stop})),
    integrity:[{check:"ZIP CRC-32",result:p.crcOk?"all entries valid":"failed: "+p.crcBad.join(", ")},
      {check:"Tamper (stored)",result:p.tamper.stored},{check:"Tamper (recomputed)",result:p.tamper.computed},
      {check:"Tamper verdict",result:p.tamper.ok===true?"matches":p.tamper.ok===false?"MISMATCH":"no record"},
      {check:"SHA-256 of the file",result:p.sha256},{check:"Archive entries",result:p.entries.length}],
    archive_entries:p.entries.map(x=>({entry:x.name,bytes:x.usize,compressed:x.csize,zip_date:x.date,
      crc32:x.crc.toString(16).padStart(8,"0"),crc_valid:x.dir?"":(x.crcOk?"yes":"NO")})),
    log_summary:L?[{field:"started",value:EDS.dt(L.start)},{field:"ended",value:EDS.dt(L.end)},
      {field:"firmware",value:L.version},{field:"product",value:L.props.product||""},{field:"host",value:L.props.hostname||""},
      {field:"temperature_records",value:L.temps.length},{field:"images",value:L.images},
      {field:"max_zone_spread_C",value:L.temps.length?Math.max(...L.temps.map(t=>t[4])).toFixed(2):""},
      {field:"led_junction_C",value:L.leds.length?`${Math.min(...L.leds.map(x=>x[4])).toFixed(1)} – ${Math.max(...L.leds.map(x=>x[4])).toFixed(1)}`:""},
      ...Object.entries(L.counts).map(([k,v])=>({field:"records_"+k,value:v}))]:[],
    log_events:L?L.events.map(e=>({time:EDS.dt(e[0]),event:e[1]})):[],
    log_errors:L?L.errors.map(e=>({time:EDS.dt(e[0]),level:e[1],message:e[2]})):[],
    temperature_trace:L?L.temps.map(t=>({time:EDS.dt(t[0]),minutes:((t[0]-L.temps[0][0])/60000).toFixed(3),
      sample_mean_C:t[1],cover_C:t[2],heatsink_C:t[3],zone_spread_C:t[4]})):[]
  };
}
function drawTemperatureTrace(canvas,run){
  const L=run&&run.eds&&run.eds.log;if(!canvas||!L||!L.temps.length)return;
  const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height,Lm=60,R=20,T=18,B=44,t0=L.temps[0][0];
  const xs=L.temps.map(t=>(t[0]-t0)/60000),xmax=Math.max(...xs)||1,vals=L.temps.flatMap(t=>[t[1],t[2]]).filter(Number.isFinite);
  const lo=Math.min(0,...vals),hi=Math.max(...vals)+2,X=x=>Lm+x/xmax*(W-Lm-R),Y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
  ctx.fillStyle="#fff";ctx.fillRect(0,0,W,H);ctx.font="11px sans-serif";ctx.fillStyle="#64748b";ctx.textAlign="right";
  for(let i=0;i<=5;i++){const v=lo+(hi-lo)*i/5,y=Y(v);ctx.strokeStyle="#e5e7eb";ctx.beginPath();ctx.moveTo(Lm,y);ctx.lineTo(W-R,y);ctx.stroke();ctx.fillText(v.toFixed(0),Lm-6,y+3);}
  ctx.textAlign="center";for(let i=0;i<=6;i++){const x=xmax*i/6;ctx.fillText(x.toFixed(0),X(x),H-B+16);}
  ctx.fillText(ui("Minutes from the first log record"),(Lm+W-R)/2,H-8);
  ctx.save();ctx.translate(14,(T+H-B)/2);ctx.rotate(-Math.PI/2);ctx.fillText("°C",0,0);ctx.restore();
  [[1,"#1f6feb"],[2,"#d97706"],[4,"#6f42c1"]].forEach(([k,c])=>{ctx.strokeStyle=c;ctx.lineWidth=1.3;ctx.beginPath();
    L.temps.forEach((t,i)=>{const v=t[k];if(!Number.isFinite(v))return;const x=X(xs[i]),y=Y(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();});
}

/* ---- settings panel entries for a QuantStudio file, each with the part it came from ---- */
function edsDerived(run,note){
  const p=run.eds,e=p.exp,A=p.analysis,pr=e.props||{},tag=`${run.file}: `;
  note(tag+"Platform","QuantStudio 3/5 experiment document","Manifest.mf Implementation-Title");
  note(tag+"Experiment",e.name,"experiment.xml Name");
  note(tag+"Experiment type",`${e.typeName} (${e.typeId})`,"experiment.xml Type/Name, Type/Id");
  note(tag+"Chemistry",e.chemistry,"experiment.xml ChemistryType");
  note(tag+"Run state",`${e.runState}; final analysis ${e.finalAnalysis}`,"experiment.xml RunState, FinalAnalysisCompleted");
  if(e.created)note(tag+"Experiment created",EDS.dt(e.created),"experiment.xml CreatedTime (ms since 1970, shown in local time)");
  if(e.runStart)note(tag+"Run started",EDS.dt(e.runStart),"experiment.xml RunStartTime");
  if(e.runEnd)note(tag+"Run ended",EDS.dt(e.runEnd),"experiment.xml RunEndTime");
  if(e.runStart&&e.runEnd)note(tag+"Run duration",`${((e.runEnd-e.runStart)/60000).toFixed(2)} minutes`,"RunStartTime to RunEndTime");
  note(tag+"Instrument",pr.instrumentType||"","experiment.xml ExperimentProperty InstrumentInfo instrumentType");
  note(tag+"Serial number",pr.instrumentSerialNumber||"","InstrumentInfo instrumentSerialNumber");
  if(pr.blockSerialNumber)note(tag+"Block serial",pr.blockSerialNumber,"InstrumentInfo blockSerialNumber");
  if(p.log)note(tag+"Firmware / host",`${p.log.version||"?"} / ${p.log.props.hostname||"?"}`,"messages.log Instrument Version / Properties");
  note(tag+"Software",`${p.manifest["Implementation-Title"]||""} ${p.manifest["Implementation-Version"]||""}`,"Manifest.mf Implementation-Version");
  note(tag+"Document specification",p.manifest["Specification-Version"]||"","Manifest.mf Specification-Version");
  if(e.fileName)note(tag+"Original path",e.fileName,"experiment.xml FileName (withheld from pseudonymised exports)");
  note(tag+"Plate",`${p.plate.kind} (${p.plate.rows} x ${p.plate.cols})`,"plate_setup.xml PlateKind");
  note(tag+"Passive reference",!p.plate.passiveRef||p.plate.passiveRef==="NULL"?"none":p.plate.passiveRef,"plate_setup.xml PassiveReferenceDye");
  note(tag+"Targets",e.detectors.map(d=>`${d.name} (${d.reporter}/${d.quencher})`).join(", "),"experiment.xml Detectors");
  Object.entries(A.detectors).forEach(([t,d])=>note(tag+`Threshold and baseline — ${t}`,
    `${d.threshold} (${d.autoCt?"automatic":"manual"}); baseline ${d.autoBaseline?"automatic":`${d.bStart}–${d.bStop}`}`,
    `analysis_protocol.xml IDetectorSettings ObjectName=${t}`));
  if(A.ddct.EndogenousControl)note(tag+"Endogenous control",A.ddct.EndogenousControl,"IDDCtAnalysisSettings EndogenousControl");
  if(A.ddct.Calibrator)note(tag+"Reference sample (calibrator)",A.ddct.Calibrator,"IDDCtAnalysisSettings Calibrator");
  if(A.ddct.RQConfidence)note(tag+"RQ confidence",A.ddct.RQConfidence+" %","IDDCtAnalysisSettings RQConfidence");
  note(tag+"Signal smoothing",String(A.smoothing),"ISignalSmoothingSettings SignalSmoothing");
  if(A.dataSelect.StageNum)note(tag+"Analysed data point",`Stage ${A.dataSelect.StageNum}, Step ${A.dataSelect.StepNum}`,"IDataSelectSettings");
  note(tag+"Flag rules",A.rules.filter(r=>r.enabled==="true").map(r=>`${EDS.flagName(r.code)} ${r.criteria}`).join("; "),"analysis_protocol.xml AnalysisSetting");
  note(tag+"Thermal protocol",p.protocol.stages.map(s=>`${s.flag}×${s.reps}: `+s.steps.map(x=>`${x.temps[0]} °C ${x.hold} s${x.collect?" (read)":""}`).join(" / ")).join("; "),
    "tcprotocol.xml TCStage/TCStep");
  note(tag+"Run mode, volume, cover",`${p.protocol.runMode}; ${p.protocol.volume} µL; ${p.protocol.cover} °C`,"tcprotocol.xml RunMode, SampleVolume, CoverTemperature");
  note(tag+"Filter sets read",p.protocol.filters.join(", "),"tcprotocol.xml CollectionProfile");
  note(tag+"Dye-to-filter mapping","nominal QuantStudio table (FAM x1-m1, VIC x2-m2, ABY/NED/TAMRA x3-m3, JUN/ROX x4-m4, Cy5 x5-m5)","built into this page, not read from the file");
  if(p.calibrations.length)note(tag+"Calibrations",p.calibrations.map(c=>`${c.name} ${EDS.dt(c.ts)} → ${EDS.dt(c.exp)}`).join("; "),"calibrations/*.ini [head]");
  if(p.pureDyes.length)note(tag+"Pure dyes calibrated",p.pureDyes.join(", "),"puredyematrix.txt");
  Object.values(p.stdCurves||{}).forEach(sc=>note(tag+`Standard curve — ${sc.target}`,
    `slope ${sc.slope}, y-intercept ${sc.yIntercept}, R² ${sc.r2}; efficiency ${num(sc.efficiency,2)} % (derived: (10^(−1/slope) − 1) × 100)`,
    "analysis_result.txt Std Curve Results"));
  if(p.log&&p.log.runName)note(tag+"Run name on the instrument",p.log.runName,"messages.log Run Starting");
  if((p.provenance||{}).quantRunNames&&p.provenance.quantRunNames.length)note(tag+"Run folder in raw-data parts",p.provenance.quantRunNames.join(", "),"quant/*.xml paths");
  if((p.provenance||{}).exportSetting)note(tag+"Last export recorded",`${p.provenance.exportSetting.format} → ${p.provenance.exportSetting.location}`,"export_setting.xml");
  note(tag+"Samples",`${p.sampleSet.length}: ${p.sampleSet.join(", ")}`,"plate_setup.xml sample feature");
  note(tag+"Wells",`${p.plate.wells.filter(w=>w.sample).length} with a sample name; ${p.plate.wells.filter(w=>w.tasks.length).length} with targets`,"plate_setup.xml");
  note(tag+"Stored results",`${p.results.length} well × target rows, ${p.cycles} cycles`,"analysis_result.txt");
  note(tag+"Raw data",`${p.raw.sets.length} filter sets × ${p.raw.cycles} cycles; ${p.mc.dyes.length} multicomponent dyes; ${p.quantCount} quant files`,
    "filterdata.xml, multicomponentdata.xml, quant/*.quant");
  note(tag+"Source SHA-256",p.sha256,"SHA-256 of the unmodified .eds bytes");
  note(tag+"Container integrity",integrityLabel(run),"ZIP central directory CRC-32; extensions/Tamper (MD5 over all other entries)");
}

