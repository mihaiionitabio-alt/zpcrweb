/* ============================================================
   LightCycler PRO "Customer data export" (.zip -> <RunID>_<time>.xml)
   ------------------------------------------------------------
   STATUS: DRAFT. Written from the LightCycler PRO System User Guide,
   SW 1.4, ch. 15 "Customer data export: XML nodes" (pp. 399-414),
   WITHOUT a real exported file. It is not listed in any build manifest.
   Every place where the manual is silent is marked ASSUMPTION; check
   each one against the first real export (and against the XSD
   Roche_LCPRO_Customer_Data_Export_v1.06.xsd if Roche provides it)
   before adding this reader to a build.

   Contract: decodeLcproXml(source) returns the same run object as
   decodeIxo / decodeEds (see readers/README.md). Values are copied,
   never recomputed: Cq is the stored <cq>, the call is the stored
   <finalCall> (the <initialCall> is kept beside it), titers are the
   stored <titer>.
   ============================================================ */

/* Channel number = excitation index (tens) x emission index (units), manual p. 400. */
const LCPRO_EXC=[432,494,541,574,621,657,687];
const LCPRO_EM=[474,523,565,601,636,675,725];
function lcproChannelLabel(ch){
  const n=Number(ch),x=LCPRO_EXC[Math.floor(n/10)-1],m=LCPRO_EM[n%10-1];
  return x&&m?`${x}-${m}`:String(ch??"");
}

/* The manual spells the same node with different case (<RunProfile>/<runProfile>,
   <Channelnumber>/<channelNumber>), so every lookup ignores case. */
const lpLower=s=>String(s||"").toLowerCase();
function lpKids(el,name){const n=lpLower(name),out=[];if(!el)return out;for(const c of el.children)if(lpLower(c.localName)===n)out.push(c);return out;}
function lpKid(el,...names){for(const n of names){const k=lpKids(el,n)[0];if(k)return k;}return null;}
function lpText(el,...names){const k=lpKid(el,...names);return k?String(k.textContent||"").trim():"";}
function lpNum(el,...names){const t=lpText(el,...names);if(t==="")return null;const v=Number(t);return Number.isFinite(v)?v:null;}
function lpAttrOrText(el,attr,...names){return (el&&el.getAttribute&&el.getAttribute(attr))||lpText(el,...names);}

function isLcproXmlText(text){
  /* root <lcData> and instrument type LCPRO (manual 3.5: "Fixed as LCPRO") */
  return /<lcData[\s>]/.test(String(text).slice(0,4096))&&/<type>\s*LCPRO\s*<\/type>/i.test(text);
}

/* ASSUMPTION: the manual calls <wellPosition> a "well position number"
   without saying whether it starts at 0 or 1. */
const LCPRO_WELL_INDEX_BASE=1;

/* ASSUMPTION: curve points are not described. Accept <point x= y=>,
   <x>/<y> pairs, or parallel <x>/<y> lists of numbers. */
function lpPoints(el){
  if(!el)return null;
  const pts=[...el.getElementsByTagName("*")].filter(e=>e.hasAttribute&&e.hasAttribute("x")&&e.hasAttribute("y"))
    .map(e=>[Number(e.getAttribute("x")),Number(e.getAttribute("y"))]);
  if(pts.length)return pts;
  const xs=lpKids(el,"x").map(e=>e.textContent.trim()),ys=lpKids(el,"y").map(e=>e.textContent.trim());
  if(xs.length&&xs.length===ys.length){
    if(xs.length===1&&/[\s,;]/.test(xs[0])){const a=xs[0].split(/[\s,;]+/).map(Number),b=ys[0].split(/[\s,;]+/).map(Number);
      return a.length===b.length?a.map((v,i)=>[v,b[i]]):null;}
    return xs.map((v,i)=>[Number(v),Number(ys[i])]);
  }
  return null;
}

/* PRO calls -> the page's call vocabulary (CALL: 0 Negative, 1 Uncertain, 2 Positive, 3 NotCalculated) */
const LCPRO_CALL={positive:2,negative:0,invalid:3,valid:3,inrange:2,abovetitermax:2,belowtitermin:2,targetnotdetected:0};
const LCPRO_ROLE={positivetemplatecontrol:"Positive control",positiveprocesscontrol:"Positive control",
  negativetemplatecontrol:"NTC",negativeprocesscontrol:"Negative control",
  ppc:"Positive control",ptc:"Positive control",npc:"Negative control",ntc:"NTC",
  qs:"Standard",rs:"Standard",ms:"Standard",standard:"Standard",unknown:"Unknown"};

async function decodeLcproXml(source){
  const text=source.text||new TextDecoder("utf-8").decode(source.bytes);
  if(/<!DOCTYPE|<!ENTITY/i.test(text.slice(0,4096)))throw new Error("LightCycler PRO export with a DOCTYPE/ENTITY declaration is refused");
  const dom=new DOMParser().parseFromString(text,"application/xml");
  if(dom.querySelector("parsererror"))throw new Error("XML parse error");
  const root=dom.documentElement;
  if(lpLower(root.localName)!=="lcdata")throw new Error("not a LightCycler PRO customer data export (root is not <lcData>)");
  const inst=lpKid(root,"instrument"),rp=lpKid(root,"runProfile"),pl=lpKid(root,"plate"),rd=lpKid(root,"rundata");
  if(lpText(inst,"type").toUpperCase()!=="LCPRO")throw new Error("instrument type is not LCPRO");

  const block=Number(lpText(inst,"blockType")||lpText(pl,"plateType"))||96;
  const rows=block===384?16:8,cols=block===384?24:12;
  const ps=lpKid(pl,"plateSetup");
  const runFlags=lpKids(rd,"flag").map(f=>({severity:lpText(f,"severity"),code:lpText(f,"code"),description:lpText(f,"description"),oid:lpText(f,"oid")}));

  const meta={
    name:lpText(rd,"RunID"),UID:lpAttrOrText(rd,"uuid"),Created:lpText(root,"created"),CreatedByName:lpAttrOrText(lpKid(root,"user"),"id"),
    LastModified:"",LastModifiedByName:"",SWVersion:lpText(inst,"softwareVersion"),
    AppliedTemplates:[lpText(ps,"name"),...lpKids(lpKid(root,"assays"),"assay").map(a=>`${lpText(a,"assayName")} ${lpText(a,"version")}`.trim())].filter(Boolean).join("; "),
    State:lpText(rd,"runStatus"),Notes:"",
    RunCreated:lpText(rd,"created"),StartTime:lpText(rd,"created"),EndTime:"",
    InstrumentName:lpText(inst,"name")||"LightCycler PRO",InstrumentVersion:lpText(inst,"softwareVersion"),
    InstrumentID:lpText(inst,"serialNo"),SerialNumber:lpText(inst,"serialNo"),PlateID:lpText(pl,"plateId")||lpText(rd,"plateId"),
    Technician:lpText(rd,"executedBy"),InstrCalibrationDate:"",RevsComplete:"",MacroName:lpText(pl,"RunProfileName"),MacroOwner:"",
    Platform:"LightCycler PRO (customer data export)",RUDI:lpAttrOrText(inst,"rudi"),GTIN:lpText(inst,"gtin"),
    ReferenceNumber:lpText(inst,"refereneceNumber","referenceNumber"),
    DetectionModuleSerial:lpText(rd,"detectionModuleSerialNumber"),ThermalBlockSerial:lpText(rd,"thermalBlockSerialNumber"),
    QcKitRun:lpText(rd,"qcKit"),Anonymized:lpText(root,"anonymized"),
    PlateSetup:lpText(ps,"name"),PlateSetupStatus:lpText(ps,"status"),
    sourceCRC32:source.bytes?crc32(source.bytes).toString(16).padStart(8,"0"):"",
    sourceSHA256:source.bytes?await sourceSha256(source.bytes):"",sourceBytes:source.bytes?source.bytes.length:""
  };

  const plate={},wells=[],tmWells=[],genoResults=[],analysesByKey=new Map();
  const analysisFor=(kind,target,ch,assay)=>{
    const key=`${kind}|${assay}|${target}`;
    if(!analysesByKey.has(key))analysesByKey.set(key,{name:`${assay||"LightCycler PRO"} — ${target}`,shortName:target,uid:"lcpro:"+key,
      kind,kindLabel:kind,cls:"LightCycler PRO",subsetName:target,calcState:"analysed",channelIdx:Number(ch)||0,
      channelName:lcproChannelLabel(ch),filterName:lcproChannelLabel(ch),filterComb:lcproChannelLabel(ch),
      cpMethod:"stored <cq>",cccEnabled:true,ccNote:"colour-compensated by the instrument",created:"",modified:"",
      createdBy:"",modifiedBy:"",nResults:0,channelMismatch:null,channelSignal:null,stdCurve:null,settings:{},quantStats:[]});
    const a=analysesByKey.get(key);a.nResults++;return a;
  };
  for(const s of lpKids(lpKid(root,"samples"),"sample").concat(lpKids(root,"samples").filter(x=>lpKid(x,"SampleID")))){
    const pos=Number(lpText(s,"wellPosition"))-LCPRO_WELL_INDEX_BASE;
    if(!Number.isInteger(pos)||pos<0||pos>=rows*cols)continue;
    const sample=lpText(s,"SampleID"),typ=lpText(s,"type"),assay=lpText(s,"assayName");
    const role=LCPRO_ROLE[lpLower(typ).replace(/[\s_-]/g,"")]||"Unknown";
    plate[pos]=plate[pos]||{name:sample,sampleId:"",notes:lpText(s,"orderId"),channels:{},subsets:[]};
    for(const t of lpKids(s,"targets")){
      const ch=lpNum(t,"ChannelNumber");
      const base=(r,kind)=>{const target=lpText(r,"targetName");const a=analysisFor(kind,target,ch,assay);
        plate[pos].channels[ch]={sampleType:typ,targetName:target,targetType:""};
        const flags=lpKids(lpKid(r,"flags"),"flag").map(f=>lpText(f,"code")||f.textContent.trim()).filter(Boolean);
        return {kind,well:posToWell(pos,cols),pos,row:Math.floor(pos/cols),col:pos%cols,sample,sampleId:"",notes:"",
          target,analysis:a.name,analysisShort:target,analysisUid:a.uid,analysisKind:kind,
          analysisGroup:"lcpro:"+kind,analysisGroupName:"LightCycler PRO "+kind,channel:ch,
          filterName:lcproChannelLabel(ch),filterComb:lcproChannelLabel(ch),instrType:typ,instrRole:role,
          givenConc:lpNum(r,"knownConcentration"),targetName:target,targetType:"",replicateOf:undefined,subsetsOfWell:[],
          IsIncluded:"1",manual:"",warnCodes:flags.join(" "),warnDesc:"",
          lcpro:{initialCall:lpText(r,"initialCall"),finalCall:lpText(r,"finalCall"),resultStatus:lpText(r,"resultStatus"),
            releasedBy:lpText(r,"releasedBy"),consolidatedFlag:lpText(r,"consolidatedFlag"),epf:lpNum(r,"epf"),
            targetUSI:lpText(r,"targetUSI"),approvals:lpKids(r,"approvalUsers").map(x=>x.textContent.trim())}};
      };
      for(const r of [...lpKids(t,"qualResults"),...lpKids(t,"quantResults")]){
        const quant=lpLower(r.localName)==="quantresults",cq=lpNum(r,"cq"),fc=lpLower(lpText(r,"finalCall")||lpText(r,"initialCall"));
        const code=LCPRO_CALL[fc.replace(/[\s_-]/g,"")]??3;
        wells.push(Object.assign(base(r,quant?"absquant":"qual"),{
          CpRaw:cq,Cp:cq!=null&&cq>0?cq:null,callCode:code,call:CALL[code],curve:null,
          CpUncertain:"",CpState:"",CrossingPointStatus:"",
          CalcConc:quant?(lpText(r,"titer")):"",ConcStatus:quant?lpText(r,"initialCall"):"",
          StandardConc:quant?lpText(r,"knownConcentration"):"",CalcConcUnc:"",concUnit:quant?lpText(r,"titerUnit"):""}));
      }
      for(const r of lpKids(t,"tmresults")){
        const pk=lpKids(r,"tmTargetResults");
        tmWells.push(Object.assign(base(r,"tm"),{tms:pk.map(p=>lpNum(p,"tmValue")),heights:pk.map(p=>lpNum(p,"PeakHeight")),
          areas:pk.map(p=>lpNum(p,"PeakArea")),widths:pk.map(p=>lpNum(p,"peakWidth")),shoulders:[],nPeaks:pk.length,
          callCode:null,showShoulder:false,manualTms:"",meltCurve:null,CpRaw:null,call:lpText(r,"finalCall"),curve:null}));
      }
      for(const r of lpKids(t,"genoResults")){
        genoResults.push(Object.assign(base(r,"genotype"),{callText:lpText(r,"finalCall")||lpText(r,"initialCall"),callCode:null,
          score:lpNum(r,"groupQualityMetric"),groupName:lpText(r,"Genogroupname","genoGroupName"),res:"",
          curveQuality:lpNum(r,"curveQualityMetric"),tmValues:lpText(r,"TmValues")}));
      }
    }
  }

  /* Instrument-processed curves (colour-compensated, baseline-subtracted): manual 8.1.
     ASSUMPTION: each curve element names its well and channel the way <samples> does. */
  const allCurves={};
  for(const oc of lpKid(root,"outputCurves")?[...lpKid(root,"outputCurves").getElementsByTagName("*")]:[]){
    if(lpLower(oc.localName)!=="bscurve")continue;
    const holder=oc.parentElement,pos=Number(lpText(holder,"wellPosition")||holder.getAttribute("wellPosition"))-LCPRO_WELL_INDEX_BASE,
      ch=Number(lpText(holder,"channelNumber")||holder.getAttribute("channelNumber"));
    const pts=lpPoints(oc);if(!pts||!Number.isFinite(pos)||!Number.isFinite(ch))continue;
    const curve=pts.map(p=>p[1]);
    allCurves[`${ch}|${pos}`]={channel:ch,pos,curve,amplitude:Math.max(...curve)-Math.min(...curve),processed:"bscurve"};
    wells.filter(w=>w.pos===pos&&w.channel===ch).forEach(w=>{w.curve=curve;});
  }
  /* Raw fluorescence (manual 6.16). ASSUMPTION/GAP: the manual lists no well field under
     <measurements>; until a real file shows one, raw curves are not assigned to wells. */
  const meas=lpKids(rd,"measurements");
  const acqError=meas.length&&!meas.some(m=>lpKid(m,"wellPosition")||m.hasAttribute("wellPosition"))
    ?"raw <measurements> carry no well position in this export; only the instrument-processed curves are shown":null;

  const channels=[...new Set([...wells,...tmWells,...genoResults].map(w=>w.channel))].filter(c=>c!=null).sort((a,b)=>a-b)
    .map(c=>({name:lcproChannelLabel(c),active:true,ex:String(LCPRO_EXC[Math.floor(c/10)-1]||""),em:String(LCPRO_EM[c%10-1]||""),
      filterSet:lcproChannelLabel(c),collected:true,integr:"",maxIntegr:"",meltFactor:"",quantFactor:""}));
  const analyses=[...analysesByKey.values()];
  return {
    file:source.name,sourcePath:source.path||source.name,sourceArchive:source.archive||null,zip:null,
    platform:"LightCycler PRO",lcpro:{runFlags,schema:root.getAttribute("xsi:noNamespaceSchemaLocation")||""},
    meta,wells,tmWells,genoResults,rqResults:[],otherResults:[],allCurves,plate,subsets:[],analyses,
    nCycles:Number(lpText(rp,"cycleCount","CycleCount"))||null,acqStats:[],acqError,acqMelt:null,acqSegments:[],
    acqAcquisitions:meas.length,acqScalingFactors:[],identities:{},duplicates:0,
    protocol:{programs:[],channels,block:{id:String(block),rowCount:rows,colCount:cols,volDefault:lpText(ps,"volume")},
      setup:{channelCount:channels.length,subclass:"LCPRO",sampleVolume:lpText(ps,"volume"),plateId:meta.PlateID,maxPositions:rows*cols},
      detectionFormatName:"LightCycler PRO channels "+channels.map(c=>c.name).join(", "),analysisModes:[...new Set(analyses.map(a=>a.kind))],
      hasTemperatureLog:false},
    namedPositions:Object.values(plate).filter(r=>r.name).length,maxPos:rows*cols,cols,rows,blockId:String(block),
    kinds:[...new Set(analyses.map(a=>a.kind))],
    format:{signature:"LightCycler PRO customer data export",version:(root.getAttribute("xsi:noNamespaceSchemaLocation")||"").replace(/^.*_v|\.xsd$/g,"")},
    integrity:{kind:"lcpro",stored:"",computed:"",ok:null,note:"the customer data export carries no vendor checksum; source SHA-256 recorded"}
  };
}
