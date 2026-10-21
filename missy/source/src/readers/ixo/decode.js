/* ============================================================
   5. .ixo decoding - container, plate model, analyses, curves
   ============================================================ */
function propText(root,name){const e=root.querySelector('prop[name="'+name+'"]');return e&&e.textContent?e.textContent.trim():"";}
function pv(el,name){const e=el?el.querySelector(':scope > prop[name="'+name+'"]'):null;return e&&e.textContent?e.textContent.trim():"";}
function propValues(root,name){return [...root.querySelectorAll('prop[name="'+name+'"]')].map(e=>(e.textContent||"").trim()).filter(Boolean);}
function base64ToBytes(b64){const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u;}
function posToWell(pos,cols){return String.fromCharCode(65+Math.floor(pos/cols))+String(pos%cols+1).padStart(2,"0");}
function posToLimsWell(pos,cols){return String.fromCharCode(65+Math.floor(pos/cols))+String(pos%cols+1);}
function wellToPos(text,cols){
  const m=String(text||"").trim().match(/^([A-Za-z])(\d{1,2})$/);
  return m?(m[1].toUpperCase().charCodeAt(0)-65)*cols+(parseInt(m[2],10)-1):null;
}
function hexBEToDouble(hex){
  if(!/^[0-9A-Fa-f]{16}$/.test(hex||""))return null;
  const b=new ArrayBuffer(8),dv=new DataView(b);
  dv.setUint32(0,parseInt(hex.slice(0,8),16),false);
  dv.setUint32(4,parseInt(hex.slice(8),16),false);
  const n=dv.getFloat64(0,false);
  return Number.isFinite(n)?n:null;
}

async function decodeAcq(raw,protocol){
  const m=raw.match(/name="AcquisitionStore"[^>]*>([^<]+)</);
  if(!m)return {channels:null,melt:null,acquisitions:0,scalingFactors:[],error:"AcquisitionStore not found"};
  const innerBytes=await inflate(base64ToBytes(m[1].trim()),"deflate");
  const inner=new TextDecoder().decode(innerBytes),segments={};
  let program=null,segment=null,cycle=null,channel=null,temp=null,scalingFactor=null,nAcq=0;
  const re=/name="Program">(\d+)<\/prop>|name="Segment">(\d+)<\/prop>|name="Cycle">(\d+)<\/prop>|name="Temp">\$([0-9A-Fa-f]{16})<\/prop>|name="Channel">(\d+)<\/prop>|name="ScalingFactor">([^<]+)<\/prop>|name="FloPoints">([^<]+)</g;
  let mm;
  while((mm=re.exec(inner))){
    if(mm[1]!==undefined){program=Number(mm[1]);continue;}
    if(mm[2]!==undefined){segment=Number(mm[2]);continue;}
    if(mm[3]!==undefined){cycle=Number(mm[3])+1;channel=null;temp=null;scalingFactor=null;continue;}
    if(mm[4]!==undefined){temp=hexBEToDouble(mm[4]);continue;}
    if(mm[5]!==undefined){channel=Number(mm[5]);continue;}
    if(mm[6]!==undefined){scalingFactor=Number(mm[6]);continue;}
    else{
      if(program==null||segment==null||cycle==null||channel==null)
        throw new Error("AcquisitionStore ordering is invalid");
      const b=base64ToBytes(mm[7]),dv=new DataView(b.buffer,b.byteOffset,b.byteLength),a=new Float32Array(b.byteLength/4);
      for(let i=0;i<a.length;i++)a[i]=dv.getFloat32(i*4,true);
      const key=`${program}/${segment}`;
      const seg=segments[key]??=(segments[key]={
        program,segment,cycles:{},acquisitions:[],collisions:0,temps:[],scalingFactors:[]
      });
      const slot=seg.cycles[cycle]??=(seg.cycles[cycle]={});
      if(slot[channel])seg.collisions++;
      else slot[channel]=a;
      seg.acquisitions.push({cycle,channel,temp,scalingFactor,values:a});
      if(Number.isFinite(temp))seg.temps.push(temp);
      if(Number.isFinite(scalingFactor))seg.scalingFactors.push(scalingFactor);
      nAcq++;
    }
  }
  const list=Object.values(segments).map(s=>{
    const prog=(protocol&&protocol.programs||[])[s.program]||null;
    const protoSeg=prog&&prog.segments?s.program>=0&&prog.segments[s.segment]:null;
    return Object.assign(s,{
      distinctCycles:Object.keys(s.cycles).length,
      protocolProgram:prog,protocolSegment:protoSeg,
      acqMode:protoSeg?String(protoSeg.acqMode||""):"",
      tempSpan:s.temps.length?Math.max(...s.temps)-Math.min(...s.temps):0
    });
  });
  if(!list.length)return {channels:null,melt:null,acquisitions:0,scalingFactors:[],error:"AcquisitionStore contained no acquisitions"};

  /* The protocol's single-acquisition segment is authoritative. The cycle-series
     shape is the fallback for legacy files whose store numbering cannot be joined
     safely to the protocol. A continuous ramp is never allowed to overwrite it. */
  const ranked=list.filter(s=>s.distinctCycles>1).sort((a,b)=>{
    const score=s=>(s.acqMode==="1"?100000:0)
      +(s.protocolProgram&&/quant/i.test(s.protocolProgram.mode||"")?10000:0)
      +s.distinctCycles*100-s.tempSpan;
    return score(b)-score(a);
  });
  const amp=ranked[0]||null;
  if(amp&&amp.collisions)
    throw new Error(`AcquisitionStore collision in amplification segment ${amp.program}/${amp.segment}`);
  if(amp&&amp.protocolProgram&&/quant/i.test(amp.protocolProgram.mode||"")
      &&amp.protocolProgram.cycles>1&&amp.distinctCycles!==amp.protocolProgram.cycles)
    throw new Error(`AcquisitionStore cycle count ${amp.distinctCycles} does not match protocol ${amp.protocolProgram.cycles}`);

  const channels={};
  if(amp)Object.entries(amp.cycles).forEach(([cyc,byChan])=>{
    Object.entries(byChan).forEach(([ch,a])=>{(channels[ch]??={})[cyc]=a;});
  });

  const melt=list.filter(s=>s!==amp&&s.acquisitions.length>1
      &&(s.acqMode==="2"||s.collisions>0||s.tempSpan>2))
    .map(s=>({
      program:s.program,segment:s.segment,
      programName:s.protocolProgram?String(s.protocolProgram.name||""):"",
      analysisMode:s.protocolProgram?String(s.protocolProgram.mode||""):"",
      points:s.acquisitions.filter(p=>Number.isFinite(p.temp))
        .sort((a,b)=>a.temp-b.temp)
    })).filter(s=>s.points.length>1);
  const scalingFactors=uniq(list.flatMap(s=>s.scalingFactors));
  return {
    channels:Object.keys(channels).length?channels:null,
    melt:melt.length?melt:null,
    acquisitions:nAcq,scalingFactors,
    segments:list.map(s=>({
      program:s.program,segment:s.segment,distinctCycles:s.distinctCycles,
      acquisitions:s.acquisitions.length,collisions:s.collisions,
      acqMode:s.acqMode,tempSpan:s.tempSpan
    })),
    error:amp||melt.length?null:"AcquisitionStore contained no usable cycle series or melt ramp"
  };
}
function acquisitionStats(channels){
  if(!channels)return [];
  return Object.keys(channels).map(key=>{
    const cycles=Object.keys(channels[key]).map(Number).sort((a,b)=>a-b),lengths=uniq(cycles.map(c=>channels[key][c].length));
    const continuous=cycles.every((c,i)=>i===0||c===cycles[i-1]+1);
    return {channel:Number(key),cycles:cycles.length,firstCycle:cycles[0],lastCycle:cycles.at(-1),wellCounts:lengths,continuous};
  });
}

/* ---- plate model: one record per plate position ---- */
function decodePlateModel(dom){
  const plate={};                       /* pos -> record */
  const get=pos=>plate[pos]??=(plate[pos]={pos,name:"",sampleId:"",notes:"",replicateOf:null,subsets:[],channels:{}});
  const chan=(pos,idx)=>{const r=get(pos);return r.channels[idx]??=(r.channels[idx]={});};
  const posOf=el=>{const t=pv(el,"Position");if(t==="")return null;const n=parseInt(t,10);return Number.isFinite(n)?n:null;};
  const chanOf=el=>{const c=el.querySelector('obj[name="ChannelProp"] > prop[name="ChannelIdx"]');return c?parseInt(c.textContent,10):null;};

  dom.querySelectorAll('[class="GenSampleEditName"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"name");if(v&&!get(p).name)get(p).name=v;
  });
  dom.querySelectorAll('[class="HTCSampleID"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"SampleID")||pv(el,"name");if(v)get(p).sampleId=v;
  });
  dom.querySelectorAll('[class="GenSampleEditNotes"],[class="HTCSamplePrepNotes"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"Notes")||pv(el,"name");if(v)get(p).notes=(get(p).notes?get(p).notes+" | ":"")+v;
  });
  dom.querySelectorAll('[class="GenSampleEditReplicate"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"ReplicateOf");if(v!=="")get(p).replicateOf=parseInt(v,10);
  });
  dom.querySelectorAll('[class="QuantSampleTypeProperty"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;chan(p,c).sampleType=pv(el,"SampleType");
  });
  dom.querySelectorAll('[class="QuantConcProperty"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const v=pv(el,"Concentration");if(v!=="")chan(p,c).givenConc=Number(v);
  });
  dom.querySelectorAll('[class="QuantCpHighProp"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"CpRangeHigh");if(v!=="")chan(p,c).cpHigh=Number(v);
  });
  dom.querySelectorAll('[class="QuantCpLowProp"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"CpRangeLow");if(v!=="")chan(p,c).cpLow=Number(v);
  });
  dom.querySelectorAll('[class="RQEffProp"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"Efficiency");if(v!=="")chan(p,c).rqEfficiency=Number(v);
  });
  dom.querySelectorAll('[class="TargetName"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"name");if(v)chan(p,c).targetName=v;
  });
  dom.querySelectorAll('[class="RQTargetProperty"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;const v=pv(el,"TargetType");if(v)chan(p,c).targetType=v;
  });
  dom.querySelectorAll('[class="DominantChannelProp"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"DominantChannel");if(v!=="")get(p).dominantChannel=Number(v);
  });
  dom.querySelectorAll('[class="GroupingSample"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"GroupSampleType");if(v)get(p).endpointType=v;
  });
  dom.querySelectorAll('[class="Genotype"]').forEach(el=>{
    const p=posOf(el);if(p==null)return;const v=pv(el,"Genotype")||pv(el,"name");if(v)get(p).endpointGenotype=v;
  });
  dom.querySelectorAll('[class="ChannelGenotype"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const kind=pv(el,"PropertyTypeName")||"Genotype",v=pv(el,"Genotype")||pv(el,"name")||pv(el,"GenotypeName");
    if(v){(chan(p,c).genotypes??={})[kind]=v;}
  });
  dom.querySelectorAll('[class="GroupChannelTypeProp"]').forEach(el=>{
    const p=posOf(el),c=chanOf(el);if(p==null||c==null)return;
    const kind=pv(el,"PropertyTypeName")||"Sample type",v=pv(el,"GroupSampleType");
    if(v){(chan(p,c).groupTypes??={})[kind]=v;}
  });
  return plate;
}

function decodeSubsets(dom){
  const out=[];
  dom.querySelectorAll('[class="SampleSubset"]').forEach(el=>{
    const name=pv(el,"name");if(!name)return;
    const items=[...el.querySelectorAll('list[name="Items"] > prop[name="Item"]')].map(x=>parseInt(x.textContent,10)).filter(Number.isFinite);
    out.push({name,forAnalysis:pv(el,"ForAnalysis")==="1",forReport:pv(el,"ForReport")==="1",
      subsetId:pv(el,"SubsetID"),useAll:pv(el,"UseAllSamples")==="1",items});
  });
  const seen=new Set();
  return out.filter(s=>{const k=s.name+"|"+s.subsetId+"|"+s.items.join(",");if(seen.has(k))return false;seen.add(k);return true;});
}

function decodeProtocol(dom){
  const programs=[];
  dom.querySelectorAll('[class="HTCRunProgram"]').forEach(el=>{
    const segs=[...el.querySelectorAll('[class="HTCRunSegment"]')].map(s=>({
      target:Number(pv(s,"Target")),target2:Number(pv(s,"Target2")),hold:Number(pv(s,"Hold")),
      slope:Number(pv(s,"Slope")),acqMode:pv(s,"AcquisitionMode"),acqPerDeg:pv(s,"AcqPerDegree"),
      stepSize:Number(pv(s,"StepSize")),stepDelay:Number(pv(s,"StepDelay"))
    }));
    programs.push({name:pv(el,"name"),cycles:Number(pv(el,"Cycles")),mode:pv(el,"AnalysisMode"),segments:segs});
  });
  /* Only the run's embedded detection format defines acquisition indices.
     The DetectionFormats object may also carry a complete instrument catalogue;
     its Active flags describe formats, not channels acquired by this run. */
  const formats=[...dom.querySelectorAll('[class="HTCDetectionFormat"]')];
  const embedded=formats.filter(f=>f.getAttribute("name")==="DetFormat"
    &&f.closest('[class="TCyclingInput"]'));
  const selectedName=propText(dom,"DefFormatName")||"";
  const candidates=embedded.length?embedded:formats.filter(f=>pv(f,"name")===selectedName);
  const signature=f=>JSON.stringify([...f.querySelectorAll('[class="HTCChannel"]')]
    .filter(c=>pv(c,"Active")==="1").map(c=>[pv(c,"ExcitationWL"),pv(c,"EmissionWL")]));
  if(candidates.length&&new Set(candidates.map(signature)).size!==1)
    throw new Error("Ambiguous acquisition channels: embedded detection formats disagree");
  if(formats.length&&!candidates.length)
    throw new Error("Cannot resolve the run's acquisition detection format; catalogue channels were not used");
  const channelRoot=candidates[0]||dom;
  const channels=[];
  channelRoot.querySelectorAll('[class="HTCChannel"]').forEach(el=>{
    const c={name:pv(el,"name"),active:pv(el,"Active")==="1",em:Number(pv(el,"EmissionWL")),ex:Number(pv(el,"ExcitationWL")),
      integr:Number(pv(el,"IntgrTime")),maxIntegr:Number(pv(el,"MaxIntgrTime")),
      meltFactor:pv(el,"MeltFactor"),quantFactor:pv(el,"QuantFactor")};
    channels.push(c);
  });
  const bt=dom.querySelector('[class="HTCBlockType"]');
  const block=bt?{
    id:pv(bt,"Id"),rowCount:Number(pv(bt,"RowCount")),colCount:Number(pv(bt,"ColCount")),
    rampUp:Number(pv(bt,"RampRateMaxUp")),rampDn:Number(pv(bt,"RampRateMaxDn")),
    volMin:Number(pv(bt,"ReactionVolMin")),volMax:Number(pv(bt,"ReactionVolMax")),
    volDefault:Number(pv(bt,"ReactionVolDefault"))
  }:null;
  const numOrNull=t=>{const v=propText(dom,t);return v===""?null:Number(v);};
  const setup={
    channelCount:numOrNull("ChannelCount"),subclass:propText(dom,"InstrumentSubclass"),
    seekTemp:numOrNull("SeekTemp"),maxPositions:numOrNull("MaxPositionsToSeek"),
    sampleVolume:numOrNull("SampleVolume"),plateId:propText(dom,"PlateID")
  };
  const detectionFormatName=propText(dom,"DefFormatName")||"";
  const analysisModes=[...dom.querySelectorAll('list[name="AnalysisModes"] prop, list[name="AnalysisModes"] item')]
    .map(e=>(e.textContent||"").trim()).filter(Boolean);
  return {programs,channels,block,setup,detectionFormatName,analysisModes:uniq(analysisModes),
    hasTemperatureLog:!!dom.querySelector('[class="TemperatureLog"]')};
}

/* ---- analyses: every LC480 analysis module, not only absolute quantification ---- */
/* Qual_Mut_Detection and Scanning are the actual object classes used by Roche's
   "Demo Melt Curve Genotyping" and "Demo Gene Scanning" experiments. Keep the
   Scanning alternatives anchored so ScanningSample / ScanningStdSample cannot be
   mistaken for analysis objects merely because they also carry a direct name prop. */
const ANALYSIS_CLASS_RE=/Analysis|Genotyping|Gene Scanning|Tm Calling|Color Comp|^Qual_Mut_Detection$|^Scanning$|^Melting$|^High Resolution Melting$/i;
const ANALYSIS_KINDS=[
  [/relative\s*quantification|rel\.?\s*quant/i,"relquant","Relative Quantification"],
  [/absolute\s*quantification|abs\s*quant|fit\s*points/i,"absquant","Absolute Quantification"],
  [/end\s*-?\s*(point|pt)\s*geno/i,"endptgeno","Endpoint Genotyping"],
  [/qual[_\s-]*mut[_\s-]*detection|melt.*geno/i,"meltgeno","Melting Curve Genotyping"],
  [/high\s*resolution\s*melting|gene\s*scanning|(?:^|\s)scanning(?:\s|$)/i,"genescan","Gene Scanning"],
  [/tm\s*calling|melting\s*(temperature|curve)\s*analysis/i,"tm","Tm Calling"],
  [/colou?r\s*comp/i,"colorcomp","Color Compensation"]
];
function analysisKind(cls,name){
  const hay=(cls||"")+" "+(name||"");
  for(const [re,kind,label] of ANALYSIS_KINDS)if(re.test(hay))return {kind,label};
  return {kind:"other",label:"Other analysis"};
}
/* The crossing-point method is usually in the analysis name, but a subordinate
   quantification inside a relative quantification is named after its gene instead. The
   object class then carries it: FitPointsAnalysis is the fit-points method, and the legacy
   absolute quantification object is the second-derivative maximum. */
const LC_CALC_STATE_LABELS={"0":"not analysed","1":"created","2":"calculated","3":"invalid","4":"analysed"};
function calcStateLabel(v){const k=String(v??"").trim();return LC_CALC_STATE_LABELS[k]||(!k?"":`unknown (${k})`);}
function cpMethodOf(name,cls){
  if(/2nd\s*deriv/i.test(name||""))return "2nd Derivative Maximum";
  if(/fit\s*point/i.test(name||""))return "Fit Points";
  if(/FitPoints/i.test(cls||""))return "Fit Points";
  if(/Absolute\s*Quantification/i.test(cls||""))return "2nd Derivative Maximum";
  return "";
}
/* every direct-ish child object of an analysis that carries a plate position and a result field */
const RESULT_PROPS=["CrossingPoint","Call","CalcConc","ConcRatio","NormRatio","TargetCpMedian",
  "Score","PeakWtFluor","PeakMutFluor","GroupName","Res","Tm","TmCount","ManualCall","ManualTms","ManualGroup"];
function readLists(el){
  const out={};
  el.querySelectorAll(':scope > list').forEach(l=>{
    const n=l.getAttribute("name");if(!n)return;
    out[n]=[...l.children].map(c=>(c.textContent||"").trim()).filter(x=>x!=="").map(Number)
      .filter(x=>Number.isFinite(x));
  });
  return out;
}
function resultKindOf(d,lists){
  if("CrossingPoint" in d)return "quant";
  if("TargetCpMedian" in d||"NormRatio" in d||"ConcRatio" in d)return "relquant";
  /* Gene Scanning and Melt Curve Genotype records also contain TmCount and Tms
     placeholders. Roche's LIMS guide distinguishes them by GroupName / Res /
     Score, so classify those fields before the Tm Calling fields. */
  if("PeakWtFluor" in d||"PeakMutFluor" in d||"Score" in d)return "genotype";
  if("GroupName" in d||"Res" in d)return "genotype";
  if("TmCount" in d||(lists.Tms&&lists.Tms.length))return "tm";
  return "other";
}
/* ---- relative quantification: genes, pairings and the stored result groups ----
   Structure inside a Rel. Quant. Analysis:
     RelQuantDataList -> RelQuantData  one per gene, target or reference
     PairingList      -> Pairing       which wells form each target/reference pair
     ResultGroups     -> ResultGroup   one per target gene, holding a CalibResult
                                       and one UnkResult per unknown pairing        */
const PAIRING_RULES={prAllToMean:"All-to-mean",prAllToAll:"All-to-all",prAllToOne:"All-to-one"};
function rqResult(el,isCalib){
  if(!el)return null;
  const n=t=>{const v=pv(el,t);return v===""?null:Number(v);};
  return {
    isCalib,
    pairName:pv(el,"PairName"),
    pairings:[...el.querySelectorAll(':scope > list[name="PairingList"] > item')].map(x=>(x.textContent||"").trim()),
    targetCp:n("TargetCpMedian"),targetCpSD:n("TargetCpMedianSTD"),
    refCp:n("RefCpMedian"),refCpSD:n("RefCpMedianSTD"),
    concRatio:n("ConcRatio"),concRatioSD:n("ConcRatioSTD"),
    normRatio:n("NormRatio"),normRatioSD:n("NormRatioSTD"),
    targetCall:pv(el,"TargetCall"),refCall:pv(el,"RefCall"),
    concStat:pv(el,"ConcRatioStat"),normStat:pv(el,"NormRatioStat"),
    hasConcError:pv(el,"HasConcError")==="1",hasNormError:pv(el,"HasNormError")==="1",
    externalCurve:pv(el,"ExtCurve")==="1",inChart:pv(el,"InChart")==="1"
  };
}
function decodeRelQuant(an){
  const genes=[...an.querySelectorAll('[class="RelQuantData"]')].map(g=>{
    const gi=g.querySelector('[class="GeneInfo"]'),cr2=gi&&gi.querySelector('[class="ChannelRatio"]');
    return {
      name:gi?pv(gi,"RQTargetName"):"",
      type:gi?pv(gi,"RQDataType"):"",
      isTarget:(gi?pv(gi,"RQDataType"):"")==="dtTarget",
      external:gi?pv(gi,"ExternalData")==="1":false,
      ex:cr2?Number(pv(cr2,"NumeratorXWL")):null,em:cr2?Number(pv(cr2,"NumeratorEWL")):null,
      positions:[...g.querySelectorAll('[class="TIntegerList"] > list > prop')].map(x=>Number(x.textContent))
    };
  });
  const posList=el=>[...el.querySelectorAll('[class="PairSampleInfo"]')]
    .map(x=>({pos:Number(pv(x,"BasePosition")),gene:Number(pv(x,"RQDataIndex")),channel:Number(pv(x,"RQChannelIndex"))}));
  const pairings=[...an.querySelectorAll('[class="Pairing"]')].map(p=>({
    name:pv(p,"name"),
    calibTarget:posList(p.querySelector(':scope > obj[name="CalibTarget"]')||p),
    calibRef:posList(p.querySelector(':scope > obj[name="CalibRef"]')||p),
    pairTarget:posList(p.querySelector(':scope > obj[name="PairTarget"]')||p),
    pairRef:posList(p.querySelector(':scope > obj[name="PairRef"]')||p)
  }));
  const targets=genes.filter(g=>g.isTarget),refs=genes.filter(g=>!g.isTarget);
  const groups=[...an.querySelectorAll('[class="ResultGroup"]')].map((g,i)=>{
    const unknowns=[...g.querySelectorAll('[class="UnkResult"]')].map(x=>rqResult(x,false));
    /* which genes this group compared: read it from the pairings it names, and fall back
       to the declaration order of the target genes */
    const named=new Set(unknowns.map(u=>u.pairName));
    const mine=pairings.filter(p=>named.has(p.name));
    const gi=mine.length&&mine[0].pairTarget.length?mine[0].pairTarget[0].gene:null;
    const ri=mine.length?uniq(mine[0].pairRef.map(x=>x.gene)):[];
    return {
      hasCalib:pv(g,"HasCalib")==="1",
      target:(gi!=null&&genes[gi])?genes[gi].name:(targets[i]?targets[i].name:""),
      references:ri.length?ri.map(x=>genes[x]?genes[x].name:"").filter(Boolean):refs.map(x=>x.name),
      calib:rqResult(g.querySelector('[class="CalibResult"]'),true),
      unknowns
    };
  });
  return {
    genes,targets:targets.map(g=>g.name),references:refs.map(g=>g.name),pairings,groups,
    rule:PAIRING_RULES[pv(an,"PairingRule")]||pv(an,"PairingRule"),
    ruleCode:pv(an,"PairingRule"),
    manualPairing:pv(an,"ManualPairing")==="1",
    multiTarget:pv(an,"MultiTarget")==="1",
    correction:pv(an,"CorrectionFactor"),multiplication:pv(an,"MultiplicationFactor")
  };
}

/* Query inside one analysis only. A relative quantification analysis contains the
   subordinate quantifications of its genes, each with its own standard curve and replicate
   statistics; without this the parent silently inherits the first child's. */
function ownedBy(el,root){
  let p=el.parentElement;
  while(p&&p!==root){
    const c=p.getAttribute&&p.getAttribute("class");
    if(c&&ANALYSIS_CLASS_RE.test(c)&&p.querySelector(':scope > prop[name="name"]'))return false;
    p=p.parentElement;
  }
  return true;
}
function ownQueryAll(root,sel){return [...root.querySelectorAll(sel)].filter(e=>ownedBy(e,root));}
function ownQuery(root,sel){return ownQueryAll(root,sel)[0]||null;}

function decodeAnalyses(dom){
  const out=[];
  const seenEl=new Set();
  dom.querySelectorAll('obj[class]').forEach(an=>{
    const cls=an.getAttribute("class")||"";
    if(!ANALYSIS_CLASS_RE.test(cls))return;
    if(/^(AnalysisList|TAnalysisSampleList|AnalysisSamples)$/i.test(cls))return;
    if(!an.querySelector(':scope > prop[name="name"]'))return;
    if(seenEl.has(an))return;seenEl.add(an);
    const name=pv(an,"name");
    const {kind,label}=analysisKind(cls,name);
    const sc=ownQuery(an,'[class="StdCurve"]');
    const stats=ownQueryAll(an,'[class="QuantStat"]').map(s=>({
      sampleIds:pv(s,"SampleIDs"),count:Number(pv(s,"SampleCount")),master:pv(s,"SampleMaster"),
      cpAvg:Number(pv(s,"CpAverage")),cpSD:Number(pv(s,"CpDeviation")),
      concAvg:Number(pv(s,"ConcAverage")),concSD:Number(pv(s,"ConcDeviation")),method:pv(s,"StatMethod")
    }));
    const genotypeGroups=uniq(ownQueryAll(an,'[class="GenotypeGroup"]')
      .map(g=>pv(g,"name")).filter(Boolean));
    /* "Subordinate for Target 1\\465-510\\Samples+Calibrator" is the per-gene quantification a
       relative quantification analysis runs internally; the gene is the first path segment. */
    const subsetRaw=pv(an,"SubsetName");
    const subordinate=/^Subordinate for /i.test(name);
    const geneName=subsetRaw.indexOf("\\")>=0?subsetRaw.split("\\")[0].trim():"";
    const cr=ownQuery(an,'[class="ChannelRatio"]');
    const xwl=cr?pv(cr,"NumeratorXWL"):"",dwl=cr?pv(cr,"DenominatorXWL"):"";
    /* the settings that define how this analysis produced its crossing points */
    const numOr=(t,el)=>{const v=pv(el||an,t);return v===""?null:Number(v);};
    const settings={
      mode:pv(an,"Mode"),measuringMode:pv(an,"MeasuringMode"),
      firstCycle:numOr("FirstCycle"),lastCycle:numOr("LastCycle"),
      backgroundStart:numOr("BackgroundStart"),backgroundStop:numOr("BackgroundStop"),
      noiseband:numOr("Noiseband"),noisebandMethod:pv(an,"NoisebandMethod"),
      stdDevMultiplier:numOr("StdDevMultiplier"),numFitPoints:numOr("NumFitPoints"),
      threshold:numOr("Threshold"),thresholdMethod:pv(an,"ThresholdMethod"),
      selectedProgram:pv(an,"SelectedProgram"),colourCompensation:pv(an,"IsCCCEnabled")==="1"
    };
    const ewl=cr?pv(cr,"NumeratorEWL"):"",dewl=cr?pv(cr,"DenominatorEWL"):"";
    out.push({
      cls,kind,kindLabel:label,
      name,shortName:pv(an,"shortname"),uid:pv(an,"UID"),
      created:pv(an,"Created"),modified:pv(an,"LastModified"),
      createdBy:pv(an,"CreatedByName"),modifiedBy:pv(an,"LastModifiedByName"),
      calcState:calcStateLabel(pv(an,"CalcState")),rawCalcState:pv(an,"CalcState"),cccEnabled:pv(an,"IsCCCEnabled")==="1",
      cpMethod:cpMethodOf(name,cls),
      subordinate,geneName,
      notes:pv(an,"Notes"),
      relQuant:kind==="relquant"?decodeRelQuant(an):null,
      subsetName:geneName||subsetRaw,rawSubsetName:subsetRaw,
      numeratorXWL:xwl===""?null:parseInt(xwl,10),
      numeratorEWL:ewl===""?null:parseInt(ewl,10),
      denominatorXWL:(dwl===""||dwl==="0")?null:parseInt(dwl,10),
      denominatorEWL:(dewl===""||dewl==="0")?null:parseInt(dewl,10),
      maxPos:Number(pv(an,"MaxPosSamples"))||null,
      settings,
      genotypeGroups,
      stdCurve:sc?{method:pv(sc,"Method"),curveType:pv(sc,"CurveType"),state:pv(sc,"State"),
        extAnchor:pv(sc,"ExtStdRqAnchor"),
        source:pv(sc,"CurveType")==="ctExternal"?"external"
              :pv(sc,"CurveType")==="ctInternal"?"in-run"
              :pv(sc,"CurveType")==="ctEfficiency"?"assumed efficiency":pv(sc,"CurveType"),
        assumedEfficiency:pv(sc,"CurveType")==="ctEfficiency",
        standards:[...sc.querySelectorAll('[class="StdCrvSam"]')].map(x=>({
          name:pv(x,"name"),wellText:pv(x,"PosAsStr"),pos:Number(pv(x,"Position")),
          cq:Number(pv(x,"CrossingPoint")),conc:Number(pv(x,"Concentration")),
          call:pv(x,"Call"),targetName:pv(x,"TargetName")})),
        fitError:Number(pv(sc,"FitError")),efficiency:Number(pv(sc,"Efficiency")),
        slope:Number(pv(sc,"Slope")),yIntercept:Number(pv(sc,"YIntercept")),
        curveEff:Number(pv(sc,"CurveEff")),linkConc:pv(sc,"LinkConc"),
        nStandards:sc.querySelectorAll('obj[name="Standard Samples"] list > obj').length}:null,
      quantStats:stats,el:an
    });
  });
  /* an analysis nested inside another belongs to it: a relative quantification analysis owns
     one subordinate quantification per gene, and those must stay distinguishable */
  out.forEach(a=>{
    let p=a.el.parentElement,parent=null;
    while(p&&!parent){
      parent=out.find(x=>x!==a&&x.el===p)||null;
      p=p.parentElement;
    }
    a.parentName=parent?parent.name:"";
    a.parentUid=parent?parent.uid:"";
    a.parentKind=parent?parent.kind:"";
    if(a.subordinate&&a.parentName)a.shortName=a.parentName;
  });
  return out;
}
/* pull every position-keyed result record out of one analysis */
/* objects that live inside an analysis but are not per-well results */
const NON_RESULT_CLASSES=/^(StdCrvSam|StdCurve|TExternalStdHelper|QuantStat|QuantStatList|ChannelRatio|ProgramInfo|TAppProperty|TAppProperties)$/i;
/* A relative quantification analysis physically contains the subordinate quantification
   analyses of its individual genes. Without this guard every one of their results would be
   counted twice: once for the subordinate and once for the parent. */
function ownsResult(an,o){
  let p=o.parentElement;
  while(p&&p!==an.el){
    const c=p.getAttribute&&p.getAttribute("class");
    if(c&&ANALYSIS_CLASS_RE.test(c)&&p.querySelector(':scope > prop[name="name"]'))return false;
    p=p.parentElement;
  }
  return true;
}
function analysisResults(an,cols){
  const out=[];
  an.el.querySelectorAll('obj').forEach(o=>{
    if(NON_RESULT_CLASSES.test(o.getAttribute("class")||""))return;
    if(o.closest('[class="StdCurve"]'))return;
    if(!ownsResult(an,o))return;
    const posEl=o.querySelector(':scope > prop[name="Pos"]')||o.querySelector(':scope > prop[name="Position"]');
    if(!posEl)return;
    const d={};o.querySelectorAll(':scope > prop').forEach(pr=>d[pr.getAttribute("name")]=(pr.textContent||"").trim());
    if(!RESULT_PROPS.some(k=>k in d))return;
    const lists=readLists(o);
    const posTxt=d.Pos!==undefined?d.Pos:d.Position;
    let pos;
    if(/^[A-Za-z]/.test(posTxt))pos=wellToPos(posTxt,cols);
    else pos=parseInt(posTxt,10);
    if(!Number.isFinite(pos))return;
    out.push({pos,d,lists,kind:resultKindOf(d,lists)});
  });
  return out;
}

async function decodeIxo(source,geomPref){
  const raw=source.text,end=raw.indexOf("</objectstream>");
  const dom=new DOMParser().parseFromString(end>=0?raw.slice(0,end+15):raw,"application/xml");
  if(dom.querySelector("parsererror"))throw new Error("XML parse error");

  /* Experiment and run provenance live at different levels. Scope each property
     so a nested object's Created/LastModified value can never be mistaken for the
     experiment's, and keep the four distinct run timestamps distinct. */
  const expObj=dom.querySelector('[class="HTCExperiment"]'),runObj=dom.querySelector('[class="HTCRun"]');
  const from=(el,k)=>pv(el,k)||propText(dom,k);
  const meta={
    name:from(expObj,"name"),UID:from(expObj,"UID"),
    Created:from(expObj,"Created"),CreatedByName:from(expObj,"CreatedByName"),
    LastModified:from(expObj,"LastModified"),LastModifiedByName:from(expObj,"LastModifiedByName"),
    SWVersion:from(expObj,"SWVersion"),AppliedTemplates:from(expObj,"AppliedTemplates"),
    State:from(expObj,"State"),Notes:from(expObj,"Notes"),
    RunCreated:from(runObj,"Created"),StartTime:from(runObj,"StartTime"),EndTime:from(runObj,"EndTime"),
    InstrumentName:from(runObj,"InstrumentName"),InstrumentVersion:from(runObj,"InstrumentVersion"),
    InstrumentID:from(runObj,"InstrumentID"),PlateID:from(runObj,"PlateID"),
    Technician:from(runObj,"Technician"),InstrCalibrationDate:from(runObj,"InstrCalibrationDate"),
    RevsComplete:from(runObj,"RevsComplete"),MacroName:from(runObj,"MacroName"),
    MacroOwner:from(runObj,"MacroOwner"),
    sourceCRC32:source.bytes?crc32(source.bytes).toString(16).padStart(8,"0"):"",
    sourceSHA256:source.bytes?await sourceSha256(source.bytes):"",
    sourceBytes:source.bytes?source.bytes.length:""
  };
  if(!meta.AppliedTemplates){const it=dom.querySelector('list[name="AppliedTemplates"] item');if(it&&it.textContent)meta.AppliedTemplates=it.textContent.trim();}
  const identities={};["Id","InstrumentID","PlateID","OwnerUID","UID","SubsetID"].forEach(k=>identities[k]=uniq(propValues(dom,k)));

  const plate=decodePlateModel(dom);
  const subsets=decodeSubsets(dom);
  const protocol=decodeProtocol(dom);
  const analyses=decodeAnalyses(dom);

  /* plate geometry: the block type is authoritative (LIMS guide, HTCBlockType RowCount/ColCount) */
  let rows,cols;
  if(protocol.block&&protocol.block.rowCount>0&&protocol.block.colCount>0){
    rows=protocol.block.rowCount;cols=protocol.block.colCount;
  }else{
    const seen=Math.max(96,...analyses.map(a=>a.maxPos||0),
      (protocol.setup&&protocol.setup.maxPositions)||0,...Object.keys(plate).map(x=>Number(x)+1));
    cols=seen>96?24:12;rows=seen>96?16:8;
  }
  if(geomPref==="96"){rows=8;cols=12;}
  else if(geomPref==="384"){rows=16;cols=24;}
  const maxPos=rows*cols;

  /* Excitation wavelength -> acquisition / plate-model channel index.
     ChannelIdx and AcquisitionStore.Channel number the ACTIVE channels in detection-format
     order. Inactive declarations do not consume an index. This matters for Roche's dual-colour
     hydrolysis demo: Cyan 500 is declared first but inactive, while FAM and Hex are stored as
     channels 0 and 1. Counting the inactive declaration loses every Hex curve and attaches the
     FAM plate properties to Hex. Sorting wavelengths remains only a last resort. */
  const ex2chan={},chanName={},exem2chan={};
  const acquisitionChannels=protocol.channels.some(c=>c.active)
    ? protocol.channels.filter(c=>c.active) : protocol.channels;
  acquisitionChannels.forEach((c,i)=>{
    if(Number.isFinite(c.ex)&&!(c.ex in ex2chan)){ex2chan[c.ex]=i;chanName[c.ex]=c.name;}
    /* Two channels can share an excitation filter (533-580 and 533-610 in the four-channel
       COVID format). The excitation/emission pair is therefore the key; excitation alone is
       only the fallback for analyses that do not name an emission wavelength. */
    if(Number.isFinite(c.ex)&&Number.isFinite(c.em)&&!(`${c.ex}-${c.em}` in exem2chan))exem2chan[`${c.ex}-${c.em}`]=i;
  });
  if(!Object.keys(ex2chan).length){
    const exs=[...dom.querySelectorAll('prop[name="ExcitationWL"]')].map(e=>parseInt(e.textContent)).filter(Number.isFinite);
    uniq(exs).sort((a,b)=>a-b).forEach((e,i)=>ex2chan[e]=i);
  }
  const fallback={465:0,533:1,498:2,610:3,640:4};

  let acq={channels:null,melt:null,scalingFactors:[],error:null};
  try{acq=await decodeAcq(raw,protocol);}catch(err){acq={channels:null,melt:null,scalingFactors:[],error:err.message};}
  const channels=acq.channels,cycles={};
  if(channels)for(const c in channels)cycles[c]=Object.keys(channels[c]).map(Number).sort((a,b)=>a-b);
  const meltTraceFor=(analysis,chanIdx,pos)=>{
    if(!acq.melt)return null;
    let segments=acq.melt.filter(s=>(s.points||[]).some(p=>p.channel===chanIdx));
    if(!segments.length)return null;
    const selected=String((analysis.settings||{}).selectedProgram||"").trim();
    const analysisName=String(analysis.name||"");
    const exact=segments.filter(s=>s.programName&&(s.programName===selected
      ||analysisName.toLowerCase().includes(s.programName.toLowerCase())));
    if(exact.length)segments=exact;
    else if(selected){
      const n=Number(selected);
      const numeric=segments.filter(s=>Number.isFinite(n)&&(s.program===n||s.program+1===n));
      if(numeric.length)segments=numeric;
    }
    /* Never concatenate independent temperature ramps. If the analysis cannot be
       tied to one program, omit the raw melt trace rather than exporting a curve
       that never existed. The instrument's stored Tm peaks remain available. */
    if(segments.length!==1)return {points:null,ambiguous:true,candidates:segments.map(s=>({
      program:s.program,segment:s.segment,programName:s.programName
    }))};
    const s=segments[0],points=(s.points||[])
      .filter(p=>p.channel===chanIdx&&Number.isFinite(p.temp)&&p.values&&Number.isFinite(p.values[pos]))
      .map(p=>({temp:p.temp,fluor:p.values[pos],scalingFactor:p.scalingFactor}));
    return points.length?{points,program:s.program,segment:s.segment,programName:s.programName,ambiguous:false}:null;
  };

  const subsetsOfPos={};
  subsets.forEach(s=>{if(s.useAll)return;s.items.forEach(p=>{(subsetsOfPos[p]??=[]).push(s.name);});});

  const wells=[],tmWells=[],genoResults=[],rqResults=[],otherResults=[];
  const seen=new Set();let duplicates=0;

  analyses.forEach(a=>{
    const target=a.subsetName||a.name;
    const pairKey=`${a.numeratorXWL}-${a.numeratorEWL}`;
    const chanIdx=(a.numeratorXWL!=null&&a.numeratorEWL!=null&&pairKey in exem2chan)?exem2chan[pairKey]
      :(a.numeratorXWL!=null&&a.numeratorXWL in ex2chan)?ex2chan[a.numeratorXWL]
      :(a.numeratorXWL!=null?(fallback[a.numeratorXWL]??0):0);
    const chDef=protocol.channels.find(c=>c.ex===a.numeratorXWL&&(a.numeratorEWL==null||c.em===Number(a.numeratorEWL)))
      ||protocol.channels.find(c=>c.ex===a.numeratorXWL);
    a.channelIdx=chanIdx;
    a.channelName=chDef?chDef.name:(chanName[a.numeratorXWL]||"");
    a.filterName=a.channelName;
    /* An analysis whose name contains the name of a DIFFERENT detection channel is reading a
       channel other than the one it appears to be named after. That is legitimate - an
       operator may name an analysis anything - but it is worth surfacing, because it changes
       what the numbers mean. */
    const others=protocol.channels.filter(c=>c.name&&c.name!==a.channelName);
    const claimed=others.find(c=>new RegExp("\\b"+c.name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(a.name||""));
    a.channelMismatch=(claimed&&a.channelName&&!new RegExp("\\b"+a.channelName.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b","i").test(a.name||""))
      ? {named:claimed.name,reading:a.channelName} : null;
    a.filterComb=a.numeratorXWL!=null
      ? `${a.numeratorXWL}-${a.numeratorEWL??(chDef?chDef.em:"")}`
      : (chDef?`${chDef.ex}-${chDef.em}`:"");
    if(a.denominatorXWL!=null)a.filterComb+=" / "+a.denominatorXWL+"-"+(a.denominatorEWL??"");
    const recs=analysisResults(a,cols);
    a.nResults=recs.length;
    a.resultKinds=uniq(recs.map(r=>r.kind));
    recs.forEach(rec=>{
      const pos=rec.pos,d=rec.d,lists=rec.lists;
      const prec=plate[pos]||{},ch=(prec.channels||{})[chanIdx]||{};
      const base={
        well:posToWell(pos,cols),pos,row:Math.floor(pos/cols),col:pos%cols,
        sample:prec.name||"",sampleId:prec.sampleId||"",notes:prec.notes||"",
        target,analysis:a.name,analysisShort:a.shortName,analysisUid:a.uid,analysisKind:a.kind,
        /* Measurements that may be pooled: different targets of the same quantification
           method belong together, but a second-derivative and a fit-points reading of the
           same wells do not, and neither do two relative quantification analyses. */
        analysisGroup:a.parentUid||a.cpMethod||a.uid,
        analysisGroupName:a.parentName||a.cpMethod||a.name,
        channel:chanIdx,filterName:a.filterName,filterComb:a.filterComb,
        instrType:ch.sampleType||"",instrRole:TYPE_TO_ROLE[ch.sampleType]||"",
        givenConc:ch.givenConc,cpLow:ch.cpLow,cpHigh:ch.cpHigh,rqEfficiency:ch.rqEfficiency,
        targetName:ch.targetName||"",targetType:ch.targetType||"",
        dominantChannel:prec.dominantChannel,
        replicateOf:prec.replicateOf,subsetsOfWell:subsetsOfPos[pos]||[],
        IsIncluded:d.IsIncluded??"",manual:d.ManualCall??d.ManualTms??d.ManualGroup??"",
        warnCodes:d.WarnCodes??"",warnDesc:d.WarnDesc??""
      };
      if(rec.kind==="quant"){
        const key=target+"|"+a.uid+"|"+pos;
        if(seen.has(key)){duplicates++;return;}
        seen.add(key);
        const rawCq=Number(d.CrossingPoint),callCode=Number(d.Call??3);
        const curve=(channels&&channels[chanIdx]&&cycles[chanIdx])?cycles[chanIdx].map(c=>channels[chanIdx][c][pos]):null;
        wells.push(Object.assign(base,{
          kind:"quant",
          CpRaw:Number.isFinite(rawCq)?rawCq:null,Cp:Number.isFinite(rawCq)&&rawCq>0?rawCq:null,
          callCode,call:CALL[callCode]??String(callCode),curve,
          CpUncertain:d.CpUncertain??"",CpState:d.CpState??"",CrossingPointStatus:d.CrossingPointStatus??"",
          CalcConc:d.CalcConc??"",ConcStatus:d.ConcStatus??"",StandardConc:d.StandardConc??"",
          CalcConcUnc:d.CalcConcUnc??""
        }));
      }else if(rec.kind==="tm"){
        /* the peak lists are fixed-length and zero-padded; TmCount gives the real number */
        const nPk=Number.isFinite(Number(d.TmCount))?Number(d.TmCount):(lists.Tms||[]).filter(v=>v>0).length;
        const cut=a=>(a||[]).slice(0,nPk);
        const meltTrace=meltTraceFor(a,chanIdx,pos);
        tmWells.push(Object.assign(base,{
          kind:"tm",tms:cut(lists.Tms),shoulders:(lists.Shoulder||[]).slice(0,nPk).filter(v=>v>0),
          areas:cut(lists.Amounts),heights:cut(lists.Heights),widths:cut(lists.Widths),
          callCode:d.Call===undefined?null:Number(d.Call),nPeaks:nPk,showShoulder:d.ShowShoulder==="1",
          manualTms:d.ManualTms??"",meltCurve:meltTrace&&meltTrace.points,
          meltProgram:meltTrace&&meltTrace.programName||"",meltProgramIndex:meltTrace&&meltTrace.program,
          meltSegment:meltTrace&&meltTrace.segment,meltCurveAmbiguous:!!(meltTrace&&meltTrace.ambiguous),
          CpRaw:null,call:"",curve:null
        }));
      }else if(rec.kind==="genotype"){
        genoResults.push(Object.assign(base,{
          kind:"genotype",
          /* Endpoint Genotyping stores the genotype itself in Call. Gene Scanning
             and Melt Curve Genotype store an integer Call state and the textual
             genotype in GroupName (LIMS guide, Tables 6-25 and 6-26). */
          callText:a.kind==="endptgeno"?(d.Call??""):(d.GroupName??""),
          callCode:a.kind==="endptgeno"?null:(d.Call===undefined?null:Number(d.Call)),
          score:d.Score===undefined?null:Number(d.Score),
          groupName:d.GroupName??"",res:d.Res??"",
          peakWt:d.PeakWtFluor===undefined?null:Number(d.PeakWtFluor),
          peakMut:d.PeakMutFluor===undefined?null:Number(d.PeakMutFluor)
        }));
      }else if(rec.kind==="relquant"){
        rqResults.push(Object.assign(base,{
          kind:"relquant",pairingName:d.PairingName??"",
          targetTargetName:d.TargetTargetName??"",referenceName:d.ReferenceReferenceName??"",
          targetCp:d.TargetCpMedian===undefined?null:Number(d.TargetCpMedian),
          targetCpSD:d.TargetCpMedianSTD===undefined?null:Number(d.TargetCpMedianSTD),
          refCp:d.RefCpMedian===undefined?null:Number(d.RefCpMedian),
          refCpSD:d.RefCpMedianSTD===undefined?null:Number(d.RefCpMedianSTD),
          concRatio:d.ConcRatio===undefined?null:Number(d.ConcRatio),
          concRatioSD:d.ConcRatioSTD===undefined?null:Number(d.ConcRatioSTD),
          normRatio:d.NormRatio===undefined?null:Number(d.NormRatio),
          correction:d.CorrectionFactor??"",multiplication:d.MultiplicationFactor??""
        }));
      }else otherResults.push(Object.assign(base,{kind:"other",raw:d}));
    });
  });

  /* Relative quantification stores its result sets outside the per-position model: one
     group per target gene, each holding the calibrator result and one result per pairing. */
  const nameAt=pos=>((plate[pos]||{}).name)||"";
  analyses.filter(a=>a.kind==="relquant"&&a.relQuant).forEach(a=>{
    const rq=a.relQuant;
    rq.groups.forEach(g=>{
      const refLabel=g.references.join("; ");
      const push=(res,label)=>{
        if(!res)return;
        const targetWell=res.pairName?res.pairName.split("/")[0]:"";
        const refWell=res.pairName&&res.pairName.indexOf("/")>=0?res.pairName.split("/")[1]:"";
        const tp=targetWell?wellToPos(targetWell,cols):null;
        rqResults.push({
          kind:"relquant",analysis:a.name,analysisUid:a.uid,analysisKind:"relquant",
          rule:rq.rule,pairingName:res.pairName||label,
          well:targetWell,refWell,pos:tp,
          sample:res.isCalib?"calibrator":(tp!=null?nameAt(tp):""),
          isCalibrator:res.isCalib,
          target:g.target,targetTargetName:g.target,referenceName:refLabel,
          targetCp:res.targetCp,targetCpSD:res.targetCpSD,
          refCp:res.refCp,refCpSD:res.refCpSD,
          concRatio:res.concRatio,concRatioSD:res.concRatioSD,
          normRatio:res.normRatio,normRatioSD:res.normRatioSD,
          targetCall:res.targetCall,refCall:res.refCall,
          concStat:res.concStat,normStat:res.normStat,
          hasConcError:res.hasConcError,hasNormError:res.hasNormError,
          externalCurve:res.externalCurve,
          correction:rq.correction,multiplication:rq.multiplication,
          coveredPairings:res.pairings.join(" ")
        });
      };
      push(g.calib,"calibrator");
      g.unknowns.forEach(u=>push(u,""));
    });
  });
  /* The LIMS interface export writes the same information as flat RelQuantResults records
     rather than as result groups, so accept that shape too - but only where the structural
     decoding above produced nothing, so nothing is counted twice. */
  if(!rqResults.length)dom.querySelectorAll('[class*="RelQuantResult"]').forEach(el=>{
    const d={};el.querySelectorAll(':scope > prop').forEach(pr=>d[pr.getAttribute("name")]=(pr.textContent||"").trim());
    if(!("NormRatio" in d)&&!("ConcRatio" in d))return;
    const num=t=>d[t]===undefined||d[t]===""?null:Number(d[t]);
    rqResults.push({kind:"relquant",analysis:"",analysisKind:"relquant",rule:"",
      pairingName:d.PairingName??d.PairName??"",well:"",refWell:"",pos:null,
      sample:d.SampleName??"",isCalibrator:false,
      target:d.TargetTargetName??"",targetTargetName:d.TargetTargetName??"",
      referenceName:d.ReferenceReferenceName??"",
      targetCp:num("TargetCpMedian"),targetCpSD:num("TargetCpMedianSTD"),
      refCp:num("RefCpMedian"),refCpSD:num("RefCpMedianSTD"),
      concRatio:num("ConcRatio"),concRatioSD:num("ConcRatioSTD"),
      normRatio:num("NormRatio"),normRatioSD:num("NormRatioSTD"),
      targetCall:d.TargetCall??"",refCall:d.RefCall??"",
      concStat:d.ConcRatioStat??"",normStat:d.NormRatioStat??"",
      hasConcError:d.HasConcError==="1",hasNormError:d.HasNormError==="1",
      externalCurve:d.ExtCurve==="1",
      correction:d.CorrectionFactor??"",multiplication:d.MultiplicationFactor??"",
      coveredPairings:""});
  });

  /* Which channel does each analysis's signal actually live in?
     An analysis names a filter combination, but nothing guarantees that the wells it covers
     were labelled with the dye that channel detects. Comparing the fluorescence rise of the
     same wells across every decoded channel answers it from the data: if another channel
     carries a substantially larger rise, the analysis is reading the wrong one. */
  if(channels&&Object.keys(channels).length>1){
    const chIdx=Object.keys(channels).map(Number).sort((a,b)=>a-b);
    analyses.forEach(a=>{
      const pos=uniq(wells.filter(w=>w.analysisUid===a.uid).map(w=>w.pos));
      if(pos.length<3)return;
      const profile=chIdx.map(ci=>{
        const cyc=cycles[ci];
        if(!cyc||!cyc.length)return {channel:ci,median:null};
        const rises=pos.map(p=>{
          const v=cyc.map(c=>channels[ci][c][p]).filter(Number.isFinite);
          return v.length?Math.max(...v)-Math.min(...v):0;
        }).sort((x,y)=>x-y);
        return {channel:ci,median:rises[Math.floor(rises.length/2)],
          name:(acquisitionChannels[ci]||{}).name||("channel "+ci)};
      }).filter(x=>x.median!=null);
      a.channelProfile=profile;
      const own=profile.find(x=>x.channel===a.channelIdx);
      const best=profile.reduce((m,x)=>(!m||x.median>m.median)?x:m,null);
      /* only meaningful when the winner is clearly ahead and there is real signal at all */
      /* A larger rise in another channel does NOT prove the analysis reads the wrong one:
         a bright dye bleeds into neighbouring channels, and a control present in every well
         raises its own channel everywhere. Without colour compensation the two cannot be
         separated, so this is reported as "not verifiable from the data", not as an error.
         The threshold is deliberately high to keep it rare. */
      a.channelSignal=(own&&best&&best.channel!==a.channelIdx&&best.median>2*own.median&&best.median>200)
        ? {reading:own,strongest:best,ratio:best.median/Math.max(1,own.median)} : null;
    });
  }

  const stats=acquisitionStats(channels),nCycles=stats.length?Math.max(...stats.map(s=>s.cycles)):null;

  /* Every acquired curve, indexed by acquisition channel and plate position,
     regardless of whether any
     analysis claimed it. The instrument reads the whole block on every cycle, so
     a well that was loaded but left out of the analysis still has a trace here.
     Finding those wells is the point: nothing in the LightCycler software warns
     about them, and an omitted positive is a silent false negative. Channels must
     remain separate: a well can be analysed in FAM while an unclaimed YELLOW curve
     at the same position still needs review. */
  const allCurves={};
  if(channels){
    for(const ch in channels){
      const cyc=cycles[ch];
      if(!cyc||!cyc.length)continue;
      const first=channels[ch][cyc[0]];
      if(!first)continue;
      for(let pos=0;pos<first.length;pos++){
        const curve=cyc.map(c=>channels[ch][c]?channels[ch][c][pos]:NaN);
        if(curve.some(v=>!Number.isFinite(v)))continue;
        const amp=Math.max(...curve)-Math.min(...curve);
        allCurves[`${ch}|${pos}`]={channel:Number(ch),pos,curve,amplitude:amp};
      }
    }
  }

  analyses.forEach(a=>{delete a.el;});
  return {
    file:source.name,sourcePath:source.path||source.name,sourceArchive:source.archive||null,zip:source.zip||null,
    meta,wells,tmWells,genoResults,rqResults,otherResults,allCurves,
    plate,subsets,protocol,analyses,nCycles,acqStats:stats,acqError:acq.error,
    acqMelt:acq.melt||null,acqSegments:acq.segments||[],acqAcquisitions:acq.acquisitions||0,
    acqScalingFactors:acq.scalingFactors||[],identities,duplicates,
    namedPositions:Object.values(plate).filter(r=>r.name).length,maxPos,cols,rows,
    blockId:(protocol.block&&protocol.block.id)||"",
    kinds:uniq(analyses.map(a=>a.kind)),
    format:{signature:dom.documentElement.getAttribute("signature")||"",version:dom.documentElement.getAttribute("version")||""},
    platform:"LightCycler 480",integrity:ixoIntegrity(source.bytes)
  };
}

