function selDataItemsBase(){
  const csv=rows=>toCSV(uniq(rows.flatMap(Object.keys)).map(k=>({key:k,label:k})),rows);
  const item=(id,title,note,ready,rows,file)=>({id:"data:"+id,kind:"data",group:"Tables",title,note,
    ready,rows,file:file||(id+".csv"),text:()=>csv(rows())});
  const L=[];
  L.push(item("cq_values","Stored Cq values",
    "One row per stored result with well, sample, target, role and call.",
    ()=>RUNS.length>0,()=>allWellRows()));
  L.push(item("melting_peaks","Melting peaks",
    "One row per stored peak with temperature, area, width and height.",
    ()=>tmRows().length>0,()=>tmRows()));
  L.push(item("experiment_settings","Experiment settings",
    "Every setting read out of the container, with the property it came from.",
    ()=>RUNS.length>0,()=>derivedSettings()));
  L.push(item("plate_map","Plate map",
    "The plate as the file describes it: position, sample, target and role.",
    ()=>RUNS.length>0,()=>RUNS.flatMap(r=>plateMapRows(r,""))));
  L.push(item("statistics","Statistics",
    "Per target and group: counts, mean Cq, spread and detection.",
    ()=>RUNS.length>0,()=>reviewStatisticsRows()));
  L.push(item("runs_and_qc","Runs and quality control",
    "One row per run with its profile answer and the reason behind it.",
    ()=>RUNS.length>0,()=>reviewRunRows(reviewForensicEvents())));
  L.push(item("forensic_log","Forensic findings",
    "Every finding with its area, severity and the evidence behind it.",
    ()=>RUNS.length>0,()=>reviewForensicEvents()));
  L.push(item("control_charts","Control chart points",
    "The plotted points of the control series with their limits.",
    ()=>RUNS.length>0,()=>reviewControlSeries("root").flatMap(s=>s.points.map(p=>Object.assign({series:s.sample,category:s.category,target:s.target},p)))));
  L.push(item("amplification_curves","Amplification curves",
    "The fluorescence of every well, one row per cycle.",
    ()=>RUNS.some(r=>(r.wells||[]).some(w=>w.curve&&w.curve.length)),
    ()=>RUNS.flatMap(run=>(run.wells||[]).filter(w=>w.curve&&w.curve.length)
      .flatMap(w=>w.curve.map((v,i)=>({experiment:runName(run),well:w.well,sample:w.sample||"",target:w.target||"",cycle:i+1,fluorescence:v}))))));
  L.push(item("sop_answers","Profile answers",
    "What the laboratory profile concluded for every sample.",
    ()=>RUNS.length>0,()=>sopSampleRows("",true)));
  L.push(item("relative_quantification","Relative quantification",
    "Relative quantification rows read from the stored analysis.",
    ()=>RUNS.some(r=>(r.rqResults||[]).length),()=>rqRows()));
  L.push(item("multicomponent_raw","Multicomponent raw values",
    "Raw multicomponent signal rows from exchange containers.",
    ()=>RUNS.some(r=>r.eds),()=>edsSignalRows()));
  L.push(item("experiment_meta","Experiment metadata",
    "Metadata fields read from every loaded experiment.",
    ()=>RUNS.length>0,()=>metaRows()));
  L.push(item("sample_comparison","Sample comparison",
    "Paired sample comparison rows for the first two loaded runs.",
    ()=>RUNS.length>1,()=>sampleComparisonRows(RUNS[0],RUNS[1],200)));
  L.push(item("rising_curves","Rising curves without a channel result",
    "Curve events retained for review when the same channel has no stored result.",
    ()=>RUNS.length>0,()=>risingCurveRows()));
  L.push(item("sop_criteria","SOP criteria",
    "One row per evaluated profile criterion.",
    ()=>RUNS.length>0,()=>sopCriteriaRows()));
  L.push(item("sop_runs","SOP run decisions",
    "One row per run with profile status and counts.",
    ()=>RUNS.length>0,()=>sopRunRows()));
  const recordRows=()=>RUNS.flatMap((run,index)=>Object.entries(instrumentRecordTables(run)).flatMap(([table,rows])=>(rows||[]).map(row=>({run:index+1,experiment:runName(run),table,...row}))));
  L.push({id:"rec:instrument_records",kind:"data",group:"Instrument records",title:"Instrument records",note:"Metadata, protocol, channels, subsets, analyses and statistics.",ready:()=>RUNS.length>0,rows:recordRows,file:"instrument_records.csv",text:()=>csv(recordRows())});
  return L;
}