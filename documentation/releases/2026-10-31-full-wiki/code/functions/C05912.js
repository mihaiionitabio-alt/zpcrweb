run=>{
    const T=runTimes(run);
    if(Number.isFinite(T.created)&&Number.isFinite(T.start)&&T.created>T.start+60000)
      push(run,"error","Timeline","Experiment was created after the run started",`created ${sopFmtTime(T.created)}; run started ${sopFmtTime(T.start)}`);
    if(Number.isFinite(T.editDelayH)){
      push(run,T.editDelayH>24?"review":"info","Timeline",`Last recorded change ${num(T.editDelayH,1)} h after the run ended`,
        runTimeline(run).filter(e=>e.kind==="edit"||e.kind==="analysis").slice(-4).map(e=>`${e.what} ${sopFmtTime(e.time)}`).join("; "));
    }
    if(Number.isFinite(T.lastEdit)&&Number.isFinite(T.start)&&T.lastEdit<T.start-60000)
      push(run,"review","Timeline","Last recorded change is earlier than the run start","the file dates are inconsistent");
    const m=run.meta||{};
    if(!run.isTemplate&&!String(m.Technician||m.CreatedByName||"").trim())push(run,"info","Traceability","No operator recorded in the file","");
    if(run.eds&&!(run.eds.reagents||[]).some(x=>x&&(x.lot||x.lotNumber)))push(run,"info","Traceability","No reagent lot number recorded in the file","");
    const cqs=new Map();
    (run.wells||[]).forEach(w=>{const q=Number(w.CpRaw);if(Number.isFinite(q)&&q>0&&String(w.CpRaw).replace(/^\d+\./,"").length>=6){
      const k=`${w.target}|${w.CpRaw}`;if(!cqs.has(k))cqs.set(k,[]);cqs.get(k).push(w);}});
    cqs.forEach(ws=>{const pos=uniq(ws.map(w=>w.pos));if(pos.length>1)push(run,"review","Copied data","Different wells share a Cq identical to six or more decimals",ws.map(w=>`${w.well} ${w.sample}`).join(", ")+` = ${ws[0].CpRaw}`);});
    const omitted=(run.wells||[]).filter(w=>sopOmitted(w)&&sopControlSpec(w));
    if(omitted.length)push(run,"review","Controls","Control wells were omitted from the analysis",omitted.map(w=>`${w.well} ${w.sample}`).join(", "));
  }