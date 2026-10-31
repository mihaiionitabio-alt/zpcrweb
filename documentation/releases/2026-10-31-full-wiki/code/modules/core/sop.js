/* ============================================================
   S. Laboratory SOP profile and interpretation
   ------------------------------------------------------------
   A profile is a small JSON document that states the laboratory's own
   acceptance and interpretation rules. The page never changes a stored Cq or
   call: it applies the profile on top of the stored values and writes the
   outcome, the reason and the rule that produced it next to each result.
   Every export carries the profile name, version and SHA-256.
   ============================================================ */
const SOP_SCHEMA="qpcr-sop-profile/1";
const SOP_OUTCOMES=["Positive","Negative","Inconclusive","Repeat","Invalid","Invalid run","Control pass","Control fail","Standard","Not interpreted"];
const SOP_OUTCOME_DEFAULTS={
  "Positive":{label:"Detected",colour:"#dc2626",text:"{target} detected (mean Cq {cq}; {det}/{n} replicates)"},
  "Negative":{label:"Not detected",colour:"#64748b",text:"{target} not detected ({n} replicates; Cq cut-off {cutoff})"},
  "Inconclusive":{label:"Inconclusive",colour:"#d97706",text:"{target} inconclusive: {reason}"},
  "Repeat":{label:"Repeat analysis",colour:"#7c3aed",text:"{target}: repeat — {reason}"},
  "Invalid":{label:"Invalid result",colour:"#111827",text:"{target}: invalid — {reason}"},
  "Invalid run":{label:"Invalid run",colour:"#9f1239",text:"Run not accepted — {reason}"},
  "Control pass":{label:"Control accepted",colour:"#16a34a",text:"{sample} / {target}: control accepted"},
  "Control fail":{label:"Control failed",colour:"#e11d48",text:"{sample} / {target}: control FAILED — {reason}"},
  "Standard":{label:"Standard",colour:"#0891b2",text:"{sample} / {target}: standard"},
  "Not interpreted":{label:"Not interpreted",colour:"#cbd5e1",text:"{target}: not interpreted"}
};
function sopBase(){
  return {schema:SOP_SCHEMA,name:"Generic qPCR (MIQE-style defaults)",version:"1.0",author:"",assay:"",lab:{name:"",analyst:""},
    effective:"",notes:"Starting values only. Replace every number with the value validated in your SOP.",locked:false,
    targets:[{match:"*",kind:"auto",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"}],
    controls:[
      {name:"No-template control",matchBy:"role",match:"NTC|Blank",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"},
      {name:"Positive control",matchBy:"role",match:"Positive control|Calibrator",expect:"positive",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"}
    ],
    replicates:{min:1,positiveMin:1,partialOutcome:"Inconclusive",maxSd:0.5,sdOutcome:"Repeat"},
    ic:{referenceCq:"",maxShift:2,shiftOutcome:"Inconclusive",missingOutcome:"Invalid"},
    run:{integrity:"reject",controlsMissing:"reject",controlsFail:"reject",colourCompensation:"review",referencePolicy:"all-declared",stdCurve:"review",minR2:0.98,effMin:90,effMax:110,
      minLogs:3,ntcGap:3,ntcGapAction:"review",editDelayHours:72,editAction:"review",calibration:"review",
      maxZoneSpread:1.5,zoneAction:"review",runState:"reject",invalidRunOverrides:true},
    outcomes:JSON.parse(JSON.stringify(SOP_OUTCOME_DEFAULTS)),
    graphs:{showCutoffs:true,showLate:true,showSdLimit:true}
  };
}
const SC_REFERENCE_GENES=()=>[
  {target:"HMG",gene:"hmgA",taxon:"Zea mays",primers:"hmgA F + hmgA R",probe:"hmgA",purpose:"taxon-specific DNA / extraction verification"},
  {target:"LEC",gene:"Le1",taxon:"Glycine max",primers:"Le1 F + Le1 R",probe:"Le1",purpose:"taxon-specific DNA / extraction verification"}
];
const SOP_PRESETS={
  generic:()=>sopBase(),
  gmo:()=>Object.assign(sopBase(),{
    name:"GMO screening — qualitative (example)",assay:"P35S / T-NOS screening with taxon reference",
    notes:"Example structure for element screening with a plant reference gene. Replace cut-offs and control names with the validated values from your SOP.",
    targets:[
      {match:"HMG|hmg|lec|Le1|ADH|adh1|SSIIb|zSSIIb|Cru|cruA|GLP",kind:"reference",cqMax:40,cqLate:36,quantMin:"",lateOutcome:"Inconclusive"},
      {match:"*",kind:"target",cqMax:40,cqLate:38,quantMin:"",lateOutcome:"Repeat"}],
    controls:[
      {name:"NTC",matchBy:"name",match:"NTC|H2O|water|NTC*",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"},
      {name:"Extraction blank",matchBy:"name",match:"EB|BLANK|blank*|MB*",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"reject"},
      {name:"Positive control",matchBy:"role",match:"Positive control|Calibrator",expect:"positive",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"}],
    replicates:{min:2,positiveMin:2,partialOutcome:"Repeat",maxSd:0.5,sdOutcome:"Repeat"}
  }),
  forensic:()=>Object.assign(sopBase(),{
    name:"Forensic DNA quantification triage (example)",assay:"Autosomal / Y / IPC quantification",
    notes:"Example triage in the spirit of Onofri et al. 2024: IPC shift flags inhibition, a low quantity flags the stochastic zone. Replace every value with your validated limits.",
    targets:[
      {match:"IPC|IC",kind:"ic",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"},
      {match:"*",kind:"target",cqMax:40,cqLate:"",quantMin:0.005,lateOutcome:"Inconclusive"}],
    controls:[
      {name:"NTC",matchBy:"role",match:"NTC|Blank",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:1,onFail:"reject"},
      {name:"Reagent blank",matchBy:"name",match:"RB*|reagent blank*",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"reject"},
      {name:"Standards",matchBy:"role",match:"Standard",expect:"standard",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"review"}],
    replicates:{min:1,positiveMin:1,partialOutcome:"Inconclusive",maxSd:0.3,sdOutcome:"Repeat"},
    ic:{maxShift:1,shiftOutcome:"Inconclusive",missingOutcome:"Invalid"}
  })
};
SOP_PRESETS.lab=sopLabScreening;
SOP_PRESETS.sc=()=>{
  const p=sopBase();
  p.name="SC screening — SOP-06 laboratory default";p.version="1.4";
  p.assay="GMO screening SOP-06 (35S / T-NOS with HMG or LEC reference)";
  p.notes="Laboratory default for SC_ experiments. Runs are simplex, so colour compensation is not required. Review-only until the approved SOP owner confirms acceptance decisions and the comparison direction in section 6.2 c5.";
  p.reviewOnly=true;
  p.sourceProposalSchema="qpcr-control-mapping-proposal/v1";
  p.samplePattern="^\\d+\\s*GM\\d{2}(?:\\b|_)";
  p.classificationPrecedence=["explicit reviewed run/well override","assay-scoped name rule","vendor role as supporting evidence","unresolved"];
  p.blockedAutomaticInterpretations=["SOP06 section 6.2 c5 comparison direction versus the LOD control requires laboratory clarification before automated sample calls","Unexplained suffixes and DIL labels remain distinct","2025 SOP acceptance rules do not retroactively replace historical SOP versions"];
  p.targets=[
    {match:"HMG|hmgA|LEC|Le1",kind:"reference",cqMax:40,cqLate:36,quantMin:"",lateOutcome:"Inconclusive"},
    {match:"35S|P35S|CaMV P-35S|T-NOS|T-nos|TNOS",kind:"target",cqMax:40,cqLate:38,quantMin:"",lateOutcome:"Repeat"},
    {match:"*",kind:"target",cqMax:40,cqLate:38,quantMin:"",lateOutcome:"Repeat"}
  ];
  const c=(id,name,match,targets,expect,purpose,material,lo="",hi="",reps=1)=>({id,name,matchBy:"name",match,targets,expect,purpose,material,cqLo:lo,cqHi:hi,minReplicates:reps,minPerRun:0,onFail:"review"});
  p.controls=[
    c("ntc","NTC","/^NTC$/i","*","negative","reaction blank",""),
    c("extr","Extraction blank","/^(BLANK|BLK)\\s*EX/i","*","negative","extraction process blank",""),
    c("grind","Grinding / environment blank","/^(BLANK|BLK)\\s*MAC/i","*","negative","grinding/environment blank",""),
    c("cn-maize","Negative maize — target","/^(CN|NC)\\s+PORUMB\\b/i","35S|P35S|CaMV P-35S|T-NOS|T-nos|TNOS","negative","negative matrix control",""),
    c("cn-maize-ref","Negative maize — HMG reference","/^(CN|NC)\\s+PORUMB\\b/i","HMG|hmgA","positive","reference amplification","",20,27),
    c("cn-soy","Negative soy — target","/^(CN|NC)\\s+SOIA\\b/i","35S|P35S|CaMV P-35S|T-NOS|T-nos|TNOS","negative","negative matrix control",""),
    c("cn-soy-ref","Negative soy — LEC reference","/^(CN|NC)\\s+SOIA\\b/i","LEC|Le1","positive","reference amplification","",20,27),
    c("crm-415b-35s","415B — 35S LOD control","/^415B(?=\\b|\\d)/i","35S|P35S|CaMV P-35S","positive","LOD positive control","ERM-BF415b",29,36,2),
    c("crm-415b-tnos","415B — T-NOS LOD control","/^415B(?=\\b|\\d)/i","T-NOS|T-nos|TNOS","positive","LOD positive control","ERM-BF415b",29,36,2),
    c("crm-415b-hmg","415B — HMG reference","/^415B(?=\\b|\\d)/i","HMG|hmgA","positive","reference amplification","ERM-BF415b",20,27,2),
    c("crm-410cp-35s","410CP — 35S LOD control","/^410CP(?=\\b|\\d)/i","35S|P35S|CaMV P-35S","positive","LOD positive control","ERM-BF410cp",29,36,2),
    c("crm-410cp-tnos","410CP — T-NOS LOD control","/^410CP(?=\\b|\\d)/i","T-NOS|T-nos|TNOS","positive","LOD positive control","ERM-BF410cp",29,36,2),
    c("crm-410cp-lec","410CP — LEC reference","/^410CP(?=\\b|\\d)/i","LEC|Le1","positive","reference amplification","ERM-BF410cp",20,27,2)
  ];
  /* The profile carries the method itself as well as the numeric rules.  These
     are editable laboratory statements; they do not replace stored Cq values
     or vendor calls. */
  p.profileSchemaVersion=2;
  p.method={id:"SOP-06-SC-screening",revision:"2025-II",scope:"SC_ GMO screening experiments",reference_genes:SC_REFERENCE_GENES(),
    reference_correlation:{mode:"any-valid",target_patterns:["35S|P35S|CaMV P-35S","T-NOS|T-nos|TNOS"],description:"A target result is correlated with the valid taxon reference detected for the sample; an alternate undeclared species reference is not treated as a failed sample control."},
    applies_when:{run_name_pattern:"^SC(?:[_\\s-]|$)",platforms:["LightCycler","QuantStudio"],
      target_patterns:["35S|P35S|CaMV P-35S","T-NOS|T-nos|TNOS","HMG|hmgA","LEC|Le1"]},
    on_not_applicable:"unresolved"};
  p.procedure={id:"SOP-06",title:"Qualitative GMO screening of SC_ experiments",revision:"2025-II",
    purpose:"Screen extracted plant DNA for 35S and T-NOS markers with HMG or LEC as the taxon reference.",
    steps:[
      {id:"P01",title:"Sample identity and extraction linkage",instruction:"Keep the SC_ sample identifier, material code, aliquot or dilution suffix, and extraction date together. Parse DD.MM.YYYY strictly and flag a date later than the run date.",acceptance:"No silent renaming; unresolved dates remain unresolved."},
      {id:"P02",title:"Plate and control placement",instruction:"Use two technical replicates for samples and LOD controls. Use one well for NTC, matrix negatives and process blanks unless the approved procedure specifies a periodic environmental blank.",acceptance:"Required controls are present before sample calls are issued."},
      {id:"P03",title:"Amplification and analysis",instruction:"Use the instrument's declared amplification analysis and preserve the original Cq, call, curve and analysis status. A curve without a same-channel result is evidence for review, not a replacement Cq.",acceptance:"Amplification cycles are evaluated separately from melt acquisitions."},
      {id:"P04",title:"Control review",instruction:"Check LOD controls against their target-specific Cq windows, use hmgA (HMG) for Zea mays and Le1 (LEC) for Glycine max as taxon-specific DNA / extraction references, and check negative controls for absence of target amplification.",acceptance:"A failed control changes the run status according to the rule action."},
      {id:"P05",title:"Sample interpretation",instruction:"Interpret a marker only when the target result and its required reference/control evidence meet this profile. Retain inconclusive or repeat outcomes when replicate or reference evidence is incomplete.",acceptance:"Every outcome names the rule and retains the stored call."},
      {id:"P06",title:"Reporting and traceability",instruction:"Review the generated sample report against the loaded experiment, record the profile name, version and SHA-256, and release only the report belonging to that analysis.",acceptance:"No result is reported without an experiment and profile identity."}
    ]};
  p.interpretation={principles:[
      "HMG/hmgA (hmgA F + hmgA R with hmgA probe) verifies Zea mays DNA; Le1/LEC (Le1 F + Le1 R with Le1 probe) verifies Glycine max DNA. These are taxon/extraction references, not GMO targets.",
      "A detected 35S or T-NOS marker is reportable only when the required taxon reference is detected and the run controls pass.",
      "A negative marker with a failed or shifted reference is not reported as negative; it is invalid or inconclusive according to the applicable rule.",
      "A late signal, discordant replicate or Cq outside a control window is retained and reported with its reason.",
      "The stored Cq values, calls and fluorescence traces are never changed by this profile."
    ],rules:[
      {id:"I01",when:"35S or T-NOS detected within the target Cq cut-off and required reference detected",action:"report detected for that marker",outcome:"Positive"},
      {id:"I02",when:"marker not detected and the required HMG or LEC reference is valid",action:"report not detected for that marker",outcome:"Negative"},
      {id:"I03",when:"marker replicates disagree, are late, or exceed the validated Cq window",action:"retain the evidence and request repeat or review",outcome:"Repeat"},
      {id:"I04",when:"negative control amplifies in a screening target",action:"do not issue a sample call; reject or review the run",outcome:"Control fail"},
      {id:"I05",when:"run is not an SC_ experiment or required method data are unavailable",action:"do not apply this profile",outcome:"Profile not applicable"}
    ],reporting:{include_rule_id:true,include_reason:true,include_stored_call:true,release_statuses:["Accepted","Accepted with review"]}};
  p.materials=[{code:"ERM-BF415b",purpose:"LOD positive control",matrix:"maize",shelf_life_days:1095},
    {code:"ERM-BF410cp",purpose:"LOD positive control",matrix:"soy",shelf_life_days:1095}];
  p.replicates={min:2,positiveMin:2,by_role:{sample:2,"positive control":2,"calibrator":2,"negative control":1,NTC:1,blank:1},partialOutcome:"Repeat",maxSd:0.5,sdOutcome:"Repeat"};
  p.sample_id={pattern:"^\\d+\\s*GM\\d{2}(?:\\b|_)",flags:"i",description:"SC_ sample identifier: market number followed by GM code."};
  /* SOP-06 is a review profile for assay interpretation.  An .ixo checksum
     discrepancy remains auditable in File integrity, but it is not an assay
     acceptance failure and must not turn every sample into a rejected run. */
  p.run.integrity="review";p.run.controlsMissing="review";p.run.controlsFail="review";p.run.colourCompensation="off";p.run.referencePolicy="any-valid";p.run.invalidRunOverrides=false;
  return p;
};
/* ---------------------------------------------------------------------------
   SOP-06-DEMO — a demonstration profile for the synthetic demonstration runs.

   It exists so that a demonstration set of a few files populates every graph
   and draws real control limits instead of "collecting baseline" everywhere.

   What it changes, and nothing else:
     - the sample-identifier pattern also accepts the SYNTH demonstration
       identifiers, so a demonstration run is not flagged for review over a
       name that was never meant to match the laboratory pattern.  Acceptance
       then reflects the faults the demonstration data actually carries.
     - phase1 drops from 20 runs to 5 on every control chart, so a short
       demonstration shows limits, run rules and alarms.

   Everything else — every Cq cut-off, target kind, control definition and
   window, replicate rule, run rule, acceptance action, procedure and
   interpretation text — is inherited from SOP_PRESETS.sc() unchanged.

   One chart is deliberately NOT reached from here.  B-M6 "IC shift from fixed
   reference" needs a target of kind "ic" and a numeric ic.referenceCq, and an
   earlier version of this profile declared LEC / Le1 as that internal control
   to make the chart compute.  It was withdrawn: sopSampleRows() excludes only
   kind "reference" from the sample screening decision, so an ic row counts as
   an assay target, and a GMO-negative soy sample whose internal control
   amplified was reported Positive — "35S: Not detected; T-NOS: Not detected;
   LEC: Detected" gave sample_outcome Positive.  A false positive screening
   call is not an acceptable price for one populated chart, so B-M6 stays empty
   under this profile too.  (The same applies to any profile declaring an ic
   target, including the shipped SOP_PRESETS.lab, whose "IPC|IC" rule has this
   behaviour today.)

   This is NOT a laboratory profile: limits computed from five runs are
   indicative only, and the identifier pattern is widened for synthetic names.
   It is deliberately treated as a template, so a reload returns to the
   laboratory default and a browser used for a demonstration cannot quietly
   stay on it.
   --------------------------------------------------------------------------- */
SOP_PRESETS.demo=()=>{
  const p=SOP_PRESETS.sc();
  p.name="SC screening — SOP-06-DEMO (synthetic demonstration only)";
  p.version="1.4-demo";
  p.assay="GMO screening SOP-06 — demonstration variant for synthetic runs";
  p.notes="Demonstration profile for synthetic demonstration data. Inherits every numeric rule, target kind and control definition from the SOP-06 laboratory default and changes two things so that a short demonstration populates all graphs and draws real control limits: the sample-identifier pattern also accepts SYNTH demonstration identifiers, and the control-chart baseline drops from 20 runs to 5. Limits from five runs are indicative only and the widened identifier pattern is not a laboratory rule, so this profile must not be used to interpret laboratory runs. Chart B-M6 (IC shift) stays empty: reaching it needs a target of kind ic, and an ic target is currently counted as an assay target in the sample screening decision, which would report a GMO-negative sample as positive. It is treated as a template and is not restored after a reload.";
  p.reviewOnly=true;
  p.sample_id={pattern:"^(?:\\d+\\s*GM\\d{2}(?:\\b|_)|SYNTH\\s+(?:MZE|SOY|ORPHAN)\\s+\\d{3,5}\\b)",flags:"i",
    description:"SC_ sample identifier (market number followed by GM code), or a SYNTH demonstration identifier."};
  p.samplePattern=p.sample_id.pattern;
  /* Five runs is the floor the statistics allow, so even a short demonstration
     shows limits, run rules and alarms instead of "collecting baseline". */
  if(typeof CC_CHARTS!=="undefined"){
    p.controlCharts=Object.assign({},p.controlCharts);
    CC_CHARTS.forEach(d=>{p.controlCharts[d.id]=Object.assign({},p.controlCharts[d.id],{phase1:5});});
  }
  p.method=Object.assign({},p.method,{id:"SOP-06-DEMO",scope:"synthetic demonstration runs (SC_SYNTH_*)"});
  p.procedure=Object.assign({},p.procedure,{id:"SOP-06-DEMO",
    title:"Demonstration variant of SOP-06 for synthetic runs"});
  return p;
};
const STORED_SOP=sopLoadStored();
const STORED_SOP_IS_TEMPLATE=!!(STORED_SOP&&/^(Generic qPCR|GMO laboratory control mapping|GMO screening — qualitative|Forensic DNA quantification triage|SC screening — SOP-06-DEMO)/i.test(String(STORED_SOP.name||"")));
let SOP=STORED_SOP&&!STORED_SOP_IS_TEMPLATE?STORED_SOP:SOP_PRESETS.sc();
let SOP_AUTO_DEFAULT=!STORED_SOP||STORED_SOP_IS_TEMPLATE;
let SOP_CACHE=null;
function sopLoadStored(){try{const t=localStorage.getItem("qpcr_sop_profile");return t?sopNormalise(JSON.parse(t)):null;}catch(e){return null;}}
function sopStore(){try{localStorage.setItem("qpcr_sop_profile",JSON.stringify(SOP));}catch(e){}}
function sopMaybeSelectScDefault(){
  if(!RUNS.length)return;
  const sc=RUNS.every(r=>/^SC(?:[_\s-]|$)/i.test(runName(r)));
  const old=String(SOP&&SOP.name||"");
  if(sc&&/^(Generic qPCR|GMO screening — qualitative|Forensic DNA quantification)/i.test(old)){
    SOP=SOP_PRESETS.sc();sopStore();invalidateAnalysisCaches();
  }
  /* Migrate the previously stored SC-06 default so an existing browser
     profile receives the same review-only integrity rule as a fresh profile. */
  if(sc&&SOP&&SOP.name==="SC screening — SOP-06 laboratory default"&&String(SOP.version)==="1.0"&&SOP.run&&SOP.run.integrity==="reject"){
    SOP.run.integrity="review";SOP.version="1.1";sopStore();invalidateAnalysisCaches();
  }
  /* SC-06 runs are simplex.  An older saved profile may have inherited the
     generic multi-channel compensation review; migrate it to the laboratory
     setting without changing stored curves or calls. */
  const scVersion=parseFloat(SOP&&SOP.version||"0")||0;
  if(sc&&SOP&&SOP.name==="SC screening — SOP-06 laboratory default"&&scVersion<1.2&&SOP.run&&SOP.run.colourCompensation!=="off"){
    SOP.run.colourCompensation="off";SOP.version="1.2";sopStore();invalidateAnalysisCaches();
  }
  /* Make the validated taxon-reference mapping explicit in profiles saved
     before SC-06 profile version 1.3. */
  if(sc&&SOP&&SOP.name==="SC screening — SOP-06 laboratory default"&&parseFloat(SOP.version||"0")<1.3&&(!SOP.method||!Array.isArray(SOP.method.reference_genes)||!SOP.method.reference_correlation)){
    SOP.method=Object.assign({},SOP.method||{}, {reference_genes:SC_REFERENCE_GENES(),reference_correlation:{mode:"any-valid",target_patterns:["35S|P35S|CaMV P-35S","T-NOS|T-nos|TNOS"],description:"A target result is correlated with the valid taxon reference detected for the sample; an alternate undeclared species reference is not treated as a failed sample control."}});SOP.version="1.3";sopStore();invalidateAnalysisCaches();
  }
  /* Correlate a marker with the valid taxon reference present in simplex
     samples; an alternate species reference is not a failed control. */
  if(sc&&SOP&&SOP.name==="SC screening — SOP-06 laboratory default"&&parseFloat(SOP.version||"0")<1.4){
    SOP.run=SOP.run||{};
    if(SOP.run.referencePolicy==null)SOP.run.referencePolicy="any-valid";
    SOP.version="1.4";sopStore();invalidateAnalysisCaches();
  }
}
function sopNormalise(p){
  if(p&&p.schema==="qpcr-control-mapping-proposal/v1"){
    /* The review proposal intentionally has a different schema.  Opening it
       converts its reviewed SC-06 rules to the application profile shape;
       stored run values and calls remain untouched. */
    const q=SOP_PRESETS.sc();q.name="SC screening — SOP-06 laboratory default";q.version="1.0";return q;
  }
  const b=sopBase();if(!p||typeof p!=="object")return b;
  const o=Object.assign({},b,p);
  ["replicates","ic","run","graphs"].forEach(k=>o[k]=Object.assign({},b[k],p[k]||{}));
  o.outcomes={};SOP_OUTCOMES.forEach(k=>o.outcomes[k]=Object.assign({},SOP_OUTCOME_DEFAULTS[k],(p.outcomes||{})[k]||{}));
  o.targets=Array.isArray(p.targets)&&p.targets.length?p.targets.map(t=>Object.assign({match:"*",kind:"auto",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"},t)):b.targets;
  o.controls=Array.isArray(p.controls)?p.controls.map(c=>Object.assign({name:"",matchBy:"name",match:"",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"reject"},c)):b.controls;
  // Repair only the two known escaped-string defects in saved SC-06 profiles.
  // Custom patterns and every acceptance limit remain unchanged.
  if(o.method&&o.method.id==="SOP-06-SC-screening"){
    const applies=o.method.applies_when||{};
    if(applies.run_name_pattern==="^SC(?:[_s-]|$)")o.method=Object.assign({},o.method,{applies_when:Object.assign({},applies,{run_name_pattern:"^SC(?:[_\\s-]|$)"})});
    if(o.sample_id&&o.sample_id.pattern==="^d+s*GMd{2}(?:\b|_)")o.sample_id=Object.assign({},o.sample_id,{pattern:"^\\d+\\s*GM\\d{2}(?:\\b|_)"});
  }
  o.schema=SOP_SCHEMA;delete o.sha256;return o;
}
function sopCanonical(p){
  const sortKeys=v=>Array.isArray(v)?v.map(sortKeys):v&&typeof v==="object"?Object.keys(v).sort().reduce((a,k)=>(a[k]=sortKeys(v[k]),a),{}):v;
  const c=Object.assign({},p);delete c.sha256;delete c.locked;return JSON.stringify(sortKeys(c));
}
function sopHash(p){return sha256Hex(new TextEncoder().encode(sopCanonical(p||SOP)));}
function sopJSON(){return JSON.stringify(Object.assign({},SOP,{sha256:sopHash()}),null,2);}
function sopChanged(){SOP_CACHE=null;invalidateAnalysisCaches();sopStore();}

/* ---- matching ---- */
function sopMatcher(pattern){
  const p=String(pattern??"").trim();
  if(!p||p==="*")return ()=>true;
  if(/^\/.+\/[a-z]*$/.test(p)){try{const m=p.match(/^\/(.+)\/([a-z]*)$/);const re=new RegExp(m[1],m[2].includes("i")?m[2]:m[2]+"i");return s=>re.test(String(s||""));}catch(e){return ()=>false;}}
  const parts=p.split("|").map(x=>x.trim()).filter(Boolean).map(x=>new RegExp("^"+x.replace(/[.+^${}()[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".")+"$","i"));
  return s=>parts.some(re=>re.test(String(s||"").trim()));
}
function sopNum(v){if(v===""||v==null)return NaN;const n=Number(v);return Number.isFinite(n)?n:NaN;}
function sopCq(w){const q=Number(w.CpRaw);return Number.isFinite(q)&&q>0?q:NaN;}
function sopOmitted(w){return !!(w.eds&&w.eds.omit)||String(w.IsIncluded||"1")==="0";}
function sopTargetSpec(w){
  const t=w.target||w.analysis||"";
  const spec=SOP.targets.find(s=>sopMatcher(s.match)(t))||{match:"*",kind:"auto",cqMax:40};
  let kind=spec.kind||"auto";
  if(kind==="auto")kind=(w.targetType==="dtReference"||w.role==="Reference"||/^(hmg|ic|ipc|ref)/i.test(t))?"reference":"target";
  return Object.assign({},spec,{kind});
}
function sopTargetLabel(row){
  const target=String(row&&row.target||"");
  if(!row||!row.spec||row.spec.kind!=="reference")return target;
  const refs=Array.isArray(SOP&&SOP.method&&SOP.method.reference_genes)?SOP.method.reference_genes:[];
  const ref=refs.find(x=>String(x.target||"").toLowerCase()===target.toLowerCase()||String(x.gene||"").toLowerCase()===target.toLowerCase());
  return ref?`${target} taxon reference (${ref.taxon})`:target+" taxon reference";
}
function sopRunApplicability(run){
  const m=SOP&&SOP.method||{},a=m.applies_when||{};
  if(!Object.keys(a).length)return {applicable:true,reason:"method has no applicability restriction"};
  const name=runName(run);
  if(a.run_name_pattern){try{if(!(new RegExp(a.run_name_pattern,"i")).test(name))return {applicable:false,reason:`run name ${name} does not match this SC_ method`};}catch(e){return {applicable:false,reason:"method run-name pattern is invalid"};}}
  if(Array.isArray(a.platforms)&&a.platforms.length){const plat=String(run.platform||"");if(!a.platforms.some(x=>plat.toLowerCase().includes(String(x).toLowerCase())))return {applicable:false,reason:`platform ${plat||"unknown"} is outside this method`};}
  const names=uniq([...(run.wells||[]).map(w=>w.target||w.analysis||""),...(run.analyses||[]).map(x=>x.shortName||x.name||"")].filter(Boolean));
  if(Array.isArray(a.target_patterns)&&a.target_patterns.length&&!a.target_patterns.some(p=>names.some(n=>sopMatcher(p)(n))))return {applicable:false,reason:"required SC_ targets are not present in the decoded run"};
  const cycles=Number(run.amplificationCycles??run.nCycles??run.cycles);if(Number.isFinite(a.min_amplification_cycles)&&(!Number.isFinite(cycles)||cycles<a.min_amplification_cycles))return {applicable:false,reason:`amplification cycle count ${Number.isFinite(cycles)?cycles:"unknown"} is below the method minimum`};
  return {applicable:true,reason:"run matches SOP-06 SC screening scope"};
}
function sopReplicateMinimum(g){
  const by=(SOP.replicates&&SOP.replicates.by_role)||{};
  const keys=[g.role,g.ctrl&&g.ctrl.name,g.ctrl&&g.ctrl.expect,g.ctrl?(g.ctrl.expect==="positive"?"positive control":g.ctrl.expect==="negative"?"negative control":""):"",g.ctrl?"control":"sample"];
  for(const k of keys){if(!k)continue;const n=Number(by[k]);if(Number.isFinite(n)&&n>0)return n;}
  const n=Number(SOP.replicates&&SOP.replicates.min);return Number.isFinite(n)&&n>0?n:1;
}
/* Control identity is separate from vendor role and from target expectation. */
/* target aliases (as used in the laboratory procedures): one series per assay, whatever the analysis was called */
const CC_TARGET_ALIAS=[[/^(P-?35S|35S|CaMV ?P-?35S)$/i,"35S"],[/^T-?NOS$/i,"T-NOS"],[/^(HMG|hmgA)$/i,"HMG"],[/^(LEC|Le1)$/i,"LEC"]];
function ccCanonTarget(t){t=String(t||"").trim();const a=CC_TARGET_ALIAS.find(([re])=>re.test(t));return a?a[1]:t;}
function sopControlIdentity(w,run){
  const c=sopControlSpec(w);if(!c)return null;
  const raw=String(w.sample||c.name||""),normal=raw.trim().replace(/\s+/g," ").toUpperCase();
  const m=normal.match(/(?<!\d)(\d{1,2})\.(\d{1,2})\.(\d+)(?![\d.])/);
  let extractionDate="",dateState="not recorded",ageDays=NaN;
  if(m){const d=+m[1],mo=+m[2],y=+m[3],t=new Date(Date.UTC(y,mo-1,d));dateState="invalid date";
    if(m[3].length===4&&t.getUTCFullYear()===y&&t.getUTCMonth()===mo-1&&t.getUTCDate()===d){
      extractionDate=t.toISOString().slice(0,10);dateState="parsed from label";
      const start=run&&runTimes(run).start;
      if(Number.isFinite(start)){const r=new Date(start);ageDays=(Date.UTC(r.getFullYear(),r.getMonth(),r.getDate())-t.getTime())/864e5;
        if(ageDays<0)dateState="after run date";}}}
  const material=c.material||normal.replace(/\d{1,2}\.\d{1,2}\.\d+/g,"").trim()||c.name;
  const purpose=c.purpose||(c.expect==="negative"?"negative control":c.expect==="standard"?"standard":"positive control");
  // Exact normalized label retains aliquot numbers, dilution labels and extraction date.
  // Unknown/invalid dates are isolated per source for longitudinal statistics.
  const unresolved=dateState!=="parsed from label";
  const scope=unresolved&&run?" | "+((run.meta||{}).sourceSHA256||runName(run)):"";
  const qual=normal.replace(/(?<!\d)\d{1,2}\.\d{1,2}\.\d+(?![\d.])/,"").replace(material.toUpperCase(),"").replace(/\s+/g," ").trim();
  const extract=(extractionDate?(dateState==="after run date"?extractionDate+" after run":"extracted "+extractionDate):"date "+(dateState==="not recorded"?"not recorded":"unresolved"))+(qual?" · "+qual:"");
  return {raw,material,purpose,extractionDate,dateState,ageDays,
    batch:normal,key:`${w.target||w.analysis||""} | ${normal}${scope}`,
    series:`${ccCanonTarget(w.target||w.analysis||"")} | ${String(material).toUpperCase()}`,extract};
}
function sopLabScreening(){
  const p=SOP_PRESETS.gmo();p.name="GMO laboratory mapping — review scaffold";p.version="2.0";
  p.notes="Control identity scaffold from supplied procedures. Confirm historical SOP, material/dilution and sample-vs-LOD comparison before release decisions.";
  p.reviewOnly=true;
  const c=(id,name,match,targets,expect,purpose,material,lo="",hi="",reps=1)=>
    ({id,name,matchBy:"name",match,targets,expect,purpose,material,cqLo:lo,cqHi:hi,minReplicates:reps,minPerRun:0,onFail:"review"});
  p.controls=[
    c("ntc","NTC","NTC","*","negative","reaction blank",""),
    c("extr","Extraction blank","/^(BLANK|BLK)\\s*EX/i","*","negative","extraction blank",""),
    c("grind","Grinding / environment blank","/^(BLANK|BLK)\\s*MAC/i","*","negative","grinding blank",""),
    c("cn-gmo","Negative matrix — screening","/^(CN|NC)\\s+(PORUMB|SOIA)\\b/i","35S|P35S|T-NOS|TNOS","negative","negative matrix",""),
    c("cn-maize","Negative maize — reference","/^(CN|NC)\\s+PORUMB\\b/i","HMG|hmgA","positive","reference check","",20,27),
    c("cn-soy","Negative soy — reference","/^(CN|NC)\\s+SOIA\\b/i","LEC|Le1","positive","reference check","",20,27),
    c("maize-lod","Maize LOD control","/^415B(?=\\b|\\d)/i","35S|P35S|T-NOS|TNOS","positive","LOD control","415B",29,36,2),
    c("soy-lod","Soy LOD control","/^410CP(?=\\b|\\d)/i","35S|P35S|T-NOS|TNOS","positive","LOD control","410CP",29,36,2),
    c("maize-ref","Maize control reference","/^415B(?=\\b|\\d)/i","HMG|hmgA","positive","reference check","415B",20,27,2),
    c("soy-ref","Soy control reference","/^410CP(?=\\b|\\d)/i","LEC|Le1","positive","reference check","410CP",20,27,2)];
  return p;
}
function ccBaselineNeed(cfg){return Math.max(5,Math.floor(Number(cfg.phase1)||20));}
function ccNoDataReason(def){
  if(["pc_cq","pc_amplitude"].includes(def.id)&&!SOP.controls.some(c=>c.expect==="positive"))
    return "profile has no positive-control rule — configure controls";
  if(def.id==="ic_shift")return "requires a fixed IC reference Cq and matching IC target";
  return "no eligible measurements — check role mapping and assay applicability";
}
function controlBatchRecords(){
  return sopEvaluateAll().flatMap(e=>e.rows.filter(r=>r.ctrl&&r.ctrl.expect==="positive"&&r.ctrl.purpose!=="reference check").map(r=>{
    const id=sopControlIdentity(r.wells[0],e.run),m=e.run.ccStatic||ccStatic(e.run);
    return {experiment:runName(e.run),source:(e.run.meta||{}).sourceSHA256||e.run.file,
      instrument:ccInstrumentKey(e.run),protocol:ccProtocolKey(e.run),target:r.target,controlId:r.ctrl.id||r.ctrl.name||r.ctrl.match,control:r.ctrl.name,
      raw_name:id.raw,material:id.material,batch:id.batch,extraction_date:id.extractionDate,date_state:id.dateState,
      age_days:id.dateState==="parsed from label"?id.ageDays:NaN,date:e.times.start,
      sample:r.sample,well:r.wells&&r.wells[0]&&r.wells[0].well,cq:r.cqMean,detected:r.det,replicates:r.n,amplitude:ccMedian(r.used.filter(w=>w.curve).map(w=>wellSignal(w.curve).amplitude)),
      cooling:m.cool_rate,setting:r.ctrl};}));
}
function controlBatchGraph(c,mode){
  const selected=SOP.controls[Number(c.control)],all=controlBatchRecords();
  /* Control records are rebuilt during evaluation, so object identity is not
     stable after a profile import or edit. Match by the persisted id/name. */
  const selectedId=selected&&(selected.id||selected.name||selected.match);
  const rs=all.filter(r=>(!c.target||r.target===c.target)&&(!selected||r.controlId===selectedId||r.control===selected.name||r.control===selected.match));
  const xval=r=>mode==="age"?r.age_days:mode==="thermal"?r.cooling:r.date/864e5;
  const rows=rs.filter(r=>Number.isFinite(xval(r))&&Number.isFinite(r.cq));
  if(!rows.length)return {svg:svgMessage("No eligible controls: configure positive-control names, target and valid extraction dates."),rows:[]};
  const cm=new Map(),groups=byKey(rows,r=>`${r.instrument} | ${r.target} | ${r.batch} | ${r.protocol}`);
  const series=[...groups].map(([k,v])=>({type:"points",r:4,colour:catColour(cm,k),data:v.map(r=>[xval(r),r.cq,graphHoverLabel(r.experiment,r,`${r.raw_name} · ${r.target} · ${r.detected}/${r.replicates} detected · ${r.date_state}`)])}));
  const x=extent(rows.map(xval));
  const xticks=mode==="batch"?niceTicks(x[0],x[1],6).map(v=>({v,label:new Date(v*864e5).toISOString().slice(0,10)})):undefined;
  return {svg:svgPlot({title:`Control ${mode==="age"?"extract age":mode==="thermal"?"cooling association":"batches over time"} — descriptive, ${rows.length}/${rs.length} eligible groups`,
    width:1100,right:340,height:480,legendChars:52,x,y:extent(rows.map(r=>r.cq)),xticks,xlab:mode==="age"?"Days since labelled extraction":mode==="thermal"?"Peak cooling rate (°C/s), compare only the same instrument/program":"Run date",
    ylab:"Mean control Cq",series,legend:legendFromMap(cm).map(x=>({...x,label:x.label.split(" | ").slice(0,3).join(" | ")}))}),rows:rs.map(({setting,...r})=>r)};
}

function sopControlSpec(w){
  return SOP.controls.find(c=>{
    const hay=c.matchBy==="role"?(w.role||""):(w.sample||"");
    return c.match&&sopMatcher(c.match)(hay)&&sopMatcher(c.targets||"*")(w.target||w.analysis||"");
  })||null;
}
function sopFmt(tpl,vals){return String(tpl||"").replace(/\{(\w+)\}/g,(m,k)=>vals[k]==null||vals[k]===""?"–":String(vals[k]));}
function sopTime(v){
  if(v==null||v==="")return NaN;if(typeof v==="number")return v;
  const s=String(v).trim();if(/^1899/.test(s))return NaN;
  const t=Date.parse(/^\d{4}-\d\d-\d\d \d/.test(s)?s.replace(" ","T"):s);return Number.isFinite(t)?t:NaN;
}
function sopFmtTime(t){if(!Number.isFinite(t))return "";const d=new Date(t),p=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}

/* ---- per-well signal descriptors (never replace stored values) ---- */
function wellSignal(curve){
  if(!curve||!curve.length)return {background:NaN,end:NaN,amplitude:NaN,max:NaN};
  const bg=curve.slice(2,Math.min(10,curve.length));const b=mean(bg.length?bg:curve.slice(0,1));
  const max=Math.max(...curve),end=curve[curve.length-1];
  return {background:b,end,amplitude:max-b,max};
}

/* ---- run timeline: every dated event the files carry ---- */
function runTimeline(run){
  const m=run.meta||{},ev=[],add=(what,t,source,kind)=>{const v=sopTime(t);if(Number.isFinite(v))ev.push({what,time:v,source,kind:kind||"file"});};
  add("Experiment created",m.Created,"experiment Created","file");
  add("Run created",m.RunCreated,"run Created","run");
  add("Run started",m.StartTime,"run StartTime","run");
  add("Run ended",m.EndTime,"run EndTime","run");
  add("Experiment last modified",m.LastModified,"experiment LastModified","edit");
  if(!run.eds)(run.analyses||[]).forEach(a=>{add(`Analysis created — ${a.name||a.shortName}`,a.created,"analysis Created","analysis");
    add(`Analysis modified — ${a.name||a.shortName}`,a.modified,"analysis LastModified","analysis");});
  if(run.eds){
    const E=run.eds;
    if(E.exp&&E.exp.modified)add("Experiment last modified",E.exp.modified,"experiment.xml ModifiedTime","edit");
    const zipDates=(E.entries||[]).map(e=>sopTime(e.date)).filter(Number.isFinite);
    if(zipDates.length){add("Container last saved (ZIP entry dates)",Math.max(...zipDates),"ZIP central directory — newest entry","edit");
      add("Oldest ZIP entry date",Math.min(...zipDates),"ZIP central directory — oldest entry","file");}
    if(E.log&&E.log.start)add("Instrument log start",E.log.start,"messages.log","run");
    if(E.log&&E.log.end)add("Instrument log end",E.log.end,"messages.log","run");
    (E.calibrations||[]).forEach(c=>{add(`Calibration performed — ${c.name}`,c.ts,c.file,"calibration");add(`Calibration expires — ${c.name}`,c.exp,c.file,"calibration");});
  }
  return ev.sort((a,b)=>a.time-b.time);
}
function runTimes(run){
  const ev=runTimeline(run),pick=re=>ev.filter(e=>re.test(e.what)).map(e=>e.time);
  const start=pick(/^Run started$/)[0],end=pick(/^Run ended$/)[0];
  const edits=pick(/last modified|last saved|^Analysis modified/),created=pick(/^Experiment created$/)[0];
  const lastEdit=edits.length?Math.max(...edits):NaN;
  return {start,end,created,lastEdit,durationMin:Number.isFinite(start)&&Number.isFinite(end)?(end-start)/60000:NaN,
    editDelayH:Number.isFinite(lastEdit)&&Number.isFinite(end)?(lastEdit-end)/3600000:NaN};
}

/* ---- standard curves from the stored standards ---- */
function sopStdCurves(run){
  const groups=byKey(ssWells(run).filter(w=>w.role==="Standard"&&!sopOmitted(w)&&Number(w.givenConc||w.StandardConc)>0&&Number.isFinite(sopCq(w))),w=>w.target||w.analysis||"");
  return [...groups].map(([target,ws])=>{
    const pts=ws.map(w=>({x:Math.log10(Number(w.givenConc||w.StandardConc)),y:sopCq(w),well:w.well,sample:w.sample,conc:Number(w.givenConc||w.StandardConc)}));
    const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),n=pts.length,mx=mean(xs),my=mean(ys);
    const sxx=xs.reduce((s,x)=>s+(x-mx)**2,0),sxy=pts.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0);
    const slope=sxx?sxy/sxx:NaN,icpt=my-slope*mx,ssr=pts.reduce((s,p)=>s+(p.y-(icpt+slope*p.x))**2,0),sst=ys.reduce((s,y)=>s+(y-my)**2,0);
    const r2=sst?1-ssr/sst:NaN,eff=(Math.pow(10,-1/slope)-1)*100,logs=n?Math.max(...xs)-Math.min(...xs):0;
    pts.forEach(p=>p.residual=p.y-(icpt+slope*p.x));
    const levels=[...byKey(pts,p=>p.x)].sort((a,b)=>b[0]-a[0]).map(([x,ps])=>({x,mean:mean(ps.map(p=>p.y))}));
    const monotonic=levels.every((l,i)=>i===0||l.mean>=levels[i-1].mean-0.1);
    return {target,points:pts,n,slope,intercept:icpt,r2,efficiency:eff,logs,levels:levels.length,monotonic};
  }).filter(c=>c.levels>=2);
}

/* ---- the interpretation itself ---- */
function sopEvaluateRun(run,ri){
  const processing=sopProcessingApplicability(run);
  const applicability=processing.applicable?sopRunApplicability(run):processing;
  if(!applicability.applicable){
    const T=runTimes(run),reason=applicability.reason;
    return {run,ri,rows:[],criteria:[{criterion:"Method applicability",action:"unresolved",status:"n/a",evidence:reason}],status:`Profile not applicable — ${reason}`,rejected:[],reviewed:[],icMedian:NaN,times:T,applicability};
  }
  const R=SOP.run,rep=SOP.replicates,wells=ssWells(run).filter(w=>w.kind!=="relquant");
  if(SAMPLE_SELECTION.pending||!wells.length)return {run,ri,rows:[],criteria:[{criterion:"Sample selection",action:"review",status:"n/a",evidence:SAMPLE_SELECTION.pending?"Review samples and apply the selection before analysis.":"No samples included in this experiment."}],status:SAMPLE_SELECTION.pending?"Awaiting sample selection":"No samples selected",rejected:[],reviewed:[],icMedian:NaN,times:runTimes(run),applicability};
  const groups=new Map();
  wells.forEach(w=>{const k=`${w.sample||"(well "+w.well+")"}||${w.target||w.analysis||""}`;
    if(!groups.has(k))groups.set(k,[]);groups.get(k).push(w);});
  const rows=[],sampleRef=new Map(),icCqs=[];
  // first pass: descriptive values
  const pre=[...groups].map(([key,ws])=>{
    const w0=ws[0],spec=sopTargetSpec(w0),ctrl=sopControlSpec(w0),use=ws.filter(w=>!sopOmitted(w));
    const cqMax=sopNum(spec.cqMax),cqs=use.map(sopCq);
    const det=cqs.filter(q=>Number.isFinite(q)&&(!Number.isFinite(cqMax)||q<=cqMax));
    const above=cqs.filter(q=>Number.isFinite(q)&&Number.isFinite(cqMax)&&q>cqMax);
    const conc=use.map(w=>Number(w.CalcConc)).filter(c=>Number.isFinite(c)&&c>0);
    const g={run,ri,key,wells:ws,used:use,sample:w0.sample||"",target:w0.target||w0.analysis||"",role:w0.role||"",
      spec,ctrl,cqMax,n:use.length,omitted:ws.length-use.length,det:det.length,above:above.length,
      cqMean:mean(det),cqSd:sd(det),cqMin:det.length?Math.min(...det):NaN,cqMaxObs:det.length?Math.max(...det):NaN,
      conc:mean(conc)};
    if(spec.kind==="ic"&&!ctrl&&g.role!=="Standard"&&Number.isFinite(g.cqMean))icCqs.push(g.cqMean);
    if((spec.kind==="ic"||spec.kind==="reference")&&!ctrl){
      const cur=sampleRef.get(g.sample)||[];cur.push(g);sampleRef.set(g.sample,cur);}
    return g;
  });
  const icMedian=icCqs.length?icCqs.slice().sort((a,b)=>a-b)[Math.floor(icCqs.length/2)]:NaN;
  const referencePolicy=String((SOP.run||{}).referencePolicy||"all-declared");
  const out=(g,outcome,reason,rule)=>{g.outcome=outcome;g.reason=reason||"";g.rule=rule||"";rows.push(g);};
  pre.forEach(g=>{
    const cut=g.cqMax,late=sopNum(g.spec.cqLate),lo=sopNum(g.ctrl&&g.ctrl.cqLo),hi=sopNum(g.ctrl&&g.ctrl.cqHi);
    if(!g.n){out(g,"Not interpreted",g.omitted?"all replicates omitted":"no result","omitted wells");return;}
    if(g.ctrl){
      if(g.ctrl.expect==="standard"){out(g,"Standard","","control: "+g.ctrl.name);return;}
      if(g.ctrl.expect==="negative"){
        if(g.n<(Number(g.ctrl.minReplicates)||1)){out(g,"Control fail","insufficient control replicates","control: "+g.ctrl.name);return;}
        if(g.det)out(g,"Control fail",`amplified in ${g.det}/${g.n} (min Cq ${num(g.cqMin,2)} ≤ ${cut})`,"control: "+g.ctrl.name);
        else out(g,"Control pass","","control: "+g.ctrl.name);
        return;
      }
      const why=[];
      if(g.n<(Number(g.ctrl.minReplicates)||1))why.push(`only ${g.n} replicate(s); control requires ${g.ctrl.minReplicates}`);
      if(g.det<g.n)why.push(`detected in ${g.det}/${g.n}`);
      if(g.det&&Number.isFinite(lo)&&g.cqMean<lo)why.push(`mean Cq ${num(g.cqMean,2)} < ${lo}`);
      if(g.det&&Number.isFinite(hi)&&g.cqMean>hi)why.push(`mean Cq ${num(g.cqMean,2)} > ${hi}`);
      out(g,why.length?"Control fail":"Control pass",why.join("; "),"control: "+g.ctrl.name);return;
    }
    if(g.role==="Standard"){out(g,"Standard","","standard");return;}
    const reasons=[];let outcome;
    const roleNeed=sopReplicateMinimum(g);
    const need=Math.min(Math.max(1,roleNeed),g.n);
    if(g.n<roleNeed)reasons.push(`${g.n} replicate(s), SOP requires ${roleNeed}`);
    if(g.det===0){
      outcome="Negative";
      if(g.spec.kind==="ic"||g.spec.kind==="reference"){
        const alternate=(sampleRef.get(g.sample)||[]).filter(r=>r!==g&&r.spec.kind==="reference"&&r.det>0);
        if(g.spec.kind==="reference"&&referencePolicy==="any-valid"&&alternate.length){
          outcome="Not interpreted";
          reasons.push(`alternate taxon reference ${alternate.map(r=>r.target).join(", ")} detected; ${g.target} is not required for this sample`);
        }else{
          outcome=SOP.ic.missingOutcome||"Invalid";reasons.push(`${g.spec.kind==="ic"?"internal control":"reference"} not detected`);
        }
      }
      else{
        const refs=(sampleRef.get(g.sample)||[]).filter(r=>r!==g);
        const validReference=refs.some(r=>r.spec.kind==="reference"&&r.det>0);
        const failed=referencePolicy==="any-valid"&&validReference?[]:refs.filter(r=>r.det===0);
        const shifted=refs.filter(r=>r.spec.kind==="ic"&&Number.isFinite(icMedian)&&Number.isFinite(r.cqMean)&&r.cqMean-icMedian>sopNum(SOP.ic.maxShift));
        if(failed.length){outcome=SOP.ic.missingOutcome||"Invalid";reasons.push(`${failed.map(r=>r.target).join(", ")} not detected — a negative cannot be reported`);}
        else if(shifted.length){outcome=SOP.ic.shiftOutcome||"Inconclusive";reasons.push(`IC shifted +${num(shifted[0].cqMean-icMedian,2)} cycles from the run median (limit ${SOP.ic.maxShift}) — possible inhibition`);}
      }
    }else if(g.det<need){
      outcome=rep.partialOutcome||"Inconclusive";reasons.push(`detected in ${g.det}/${g.n} replicates, SOP requires ${need}`);
    }else{
      outcome="Positive";
      if(Number.isFinite(late)&&g.cqMean>late){outcome=g.spec.lateOutcome||"Inconclusive";reasons.push(`mean Cq ${num(g.cqMean,2)} above the late-signal limit ${late}`);}
      const qmin=sopNum(g.spec.quantMin);
      if(Number.isFinite(qmin)&&Number.isFinite(g.conc)&&g.conc<qmin){outcome=g.spec.lateOutcome||"Inconclusive";reasons.push(`quantity ${g.conc.toPrecision(3)} below ${qmin} (stochastic zone)`);}
      if(g.det<g.n&&outcome==="Positive")reasons.push(`detected in ${g.det}/${g.n}`);
      if(g.spec.kind==="ic"&&Number.isFinite(icMedian)&&g.cqMean-icMedian>sopNum(SOP.ic.maxShift))
        reasons.push(`IC +${num(g.cqMean-icMedian,2)} cycles from the run median`);
    }
    if(g.det>=2&&Number.isFinite(g.cqSd)&&g.cqSd>sopNum(rep.maxSd)){
      reasons.push(`replicate SD ${num(g.cqSd,2)} > ${rep.maxSd}`);
      if(rep.sdOutcome&&rep.sdOutcome!=="flag"&&(outcome==="Positive"||outcome==="Negative"))outcome=rep.sdOutcome;
    }
    if(g.n<roleNeed&&(outcome==="Positive"||outcome==="Negative"))outcome="Repeat";
    out(g,outcome,reasons.join("; "),g.spec.kind+": "+(g.spec.match||"*"));
  });

  /* run acceptance */
  const crit=[],add=(criterion,action,pass,evidence)=>{if(action==="off")return;crit.push({criterion,action,status:pass===null?"n/a":pass?"pass":action==="reject"?"fail":"review",evidence:evidence||""});};
  if(SOP.reviewOnly)add("Profile is a review scaffold", "review", null, "Informational: laboratory approval and assay-specific sample interpretation are not configured.");
  const g=run.integrity;
  add("Container integrity",R.integrity,g?(g.ok!==false&&g.zipCrcOk!==false):null,integrityLabel(run));
  if(run.eds)add("Run completed",R.runState,run.eds.exp.runState==="COMPLETE",run.eds.exp.runState);
  SOP.controls.forEach(c=>{
    if(!(Number(c.minPerRun)>0))return;
    const present=uniq(wells.filter(w=>sopControlSpec(w)===c).map(w=>w.pos)).length;
    add(`Control present — ${c.name}`,R.controlsMissing,present>=Number(c.minPerRun),`${present} well(s); SOP requires ${c.minPerRun}`);
  });
  const fails=rows.filter(r=>r.outcome==="Control fail");
  const sid=SOP.sample_id||SOP.sampleId;
  if(sid&&sid.pattern){let re=null;try{re=new RegExp(sid.pattern,sid.flags||"i");}catch(e){}
    if(re){const sampleNames=uniq(wells.filter(w=>w.sample&&!sopControlSpec(w)&&w.role!=="Standard").map(w=>String(w.sample).trim()).filter(Boolean));
      const bad=sampleNames.filter(n=>!re.test(n));add("SC sample identifier format","review",bad.length===0,bad.length?`${bad.length} sample name(s) do not match ${sid.pattern}`:`${sampleNames.length} sample name(s) match the SC_ identifier rule`);}}
  SOP.controls.forEach(c=>{
    const mine=rows.filter(r=>r.ctrl===c&&c.expect!=="standard");if(!mine.length)return;
    const bad=mine.filter(r=>r.outcome==="Control fail");
    add(`Control result — ${c.name}`,c.onFail||R.controlsFail,!bad.length,bad.length?bad.map(r=>`${r.sample}/${r.target}: ${r.reason}`).join("; "):`${mine.length} control result(s) accepted`);
  });
  sopStdCurves(run).forEach(sc=>{
    const ok=sc.r2>=sopNum(R.minR2)&&sc.efficiency>=sopNum(R.effMin)&&sc.efficiency<=sopNum(R.effMax)&&sc.logs>=sopNum(R.minLogs)-1e-9&&sc.monotonic;
    add(`Standard curve — ${sc.target}`,R.stdCurve,ok,`slope ${num(sc.slope,3)}, R² ${num(sc.r2,4)}, E ${sc.efficiency>1000||sc.efficiency<-100?"out of range":num(sc.efficiency,1)+" %"}, ${num(sc.logs,1)} log range${sc.monotonic?"":", standards out of order"}`);
  });
  const ntcRows=rows.filter(r=>r.ctrl&&r.ctrl.expect==="negative"&&r.det);
  if(ntcRows.length&&Number.isFinite(sopNum(R.ntcGap))){
    ntcRows.forEach(n=>{
      const unk=rows.filter(r=>!r.ctrl&&r.target===n.target&&r.det&&r.role!=="Standard").map(r=>r.cqMaxObs);
      if(!unk.length)return;const gap=n.cqMin-Math.max(...unk);
      add(`NTC-to-sample gap — ${n.target}`,R.ntcGapAction,gap>=sopNum(R.ntcGap),`NTC ${n.sample} Cq ${num(n.cqMin,2)}; latest sample Cq ${num(Math.max(...unk),2)}; gap ${num(gap,2)} (SOP ≥ ${R.ntcGap})`);
    });
  }
  const T=runTimes(run);
  if(Number.isFinite(T.editDelayH)&&Number.isFinite(sopNum(R.editDelayHours)))
    add("Edited within the allowed window",R.editAction,T.editDelayH<=sopNum(R.editDelayHours),`last change ${sopFmtTime(T.lastEdit)} — ${num(T.editDelayH,1)} h after the run ended (SOP ≤ ${R.editDelayHours} h)`);
  if(Number.isFinite(T.created)&&Number.isFinite(T.start)&&T.created>T.start+60000)
    add("Experiment created before the run",R.editAction,false,`created ${sopFmtTime(T.created)}, run started ${sopFmtTime(T.start)}`);
  if(run.eds){
    const start=run.eds.exp.runStart,exp=(run.eds.calibrations||[]).filter(c=>c.exp&&start&&c.exp<start);
    if((run.eds.calibrations||[]).length)add("Calibrations valid on the run date",R.calibration,!exp.length,exp.length?exp.map(c=>`${c.name} expired ${sopFmtTime(c.exp)}`).join("; "):`${run.eds.calibrations.length} calibration(s) valid`);
    const L=run.eds.log;
    if(L&&L.temps&&L.temps.length&&Number.isFinite(sopNum(R.maxZoneSpread))){const sp=Math.max(...L.temps.map(t=>t[4]));
      add("Block zone uniformity",R.zoneAction,sp<=sopNum(R.maxZoneSpread),`maximum zone spread ${num(sp,2)} °C (SOP ≤ ${R.maxZoneSpread})`);}
  }
  const rejected=crit.filter(c=>c.status==="fail"),reviewed=crit.filter(c=>c.status==="review");
  const status=run.isTemplate?"Template":rejected.length?"Rejected":reviewed.length?"Accepted with review":"Accepted";
  if(rejected.length&&R.invalidRunOverrides)rows.forEach(r=>{if(!r.ctrl&&r.outcome!=="Standard"&&r.outcome!=="Not interpreted"){r.storedOutcome=r.outcome;r.outcome="Invalid run";r.reason=rejected.map(c=>c.criterion).join("; ");}});
  rows.forEach(r=>{
    const o=SOP.outcomes[r.outcome]||SOP_OUTCOME_DEFAULTS[r.outcome]||{};
    r.label=o.label||r.outcome;r.colour=o.colour||"#94a3b8";
    r.report=sopFmt(o.text,{sample:r.sample,target:sopTargetLabel(r),cq:num(r.cqMean,2),sd:num(r.cqSd,2),det:r.det,n:r.n,cutoff:r.cqMax,reason:r.reason,outcome:r.label,run:runName(run)});
  });
  return {run,ri,rows,criteria:crit,status,rejected,reviewed,icMedian,times:T};
}
function sopEvaluateAll(){
  if(SOP_CACHE&&SOP_CACHE.runs===RUNS)return SOP_CACHE.list;
  const list=RUNS.map((r,i)=>{try{return sopEvaluateRun(r,i);}catch(e){console.error(e);return {run:r,ri:i,rows:[],criteria:[{criterion:"Evaluation",action:"review",status:"review",evidence:e.message}],status:"Not evaluated",rejected:[],reviewed:[],times:{}};}});
  SOP_CACHE={runs:RUNS,list};return list;
}
function sopResultForWell(ri,w){
  const ev=sopEvaluateAll()[ri];if(!ev)return null;
  return ev.rows.find(r=>r.wells.includes(w))||null;
}
function sopMeta(){return {sop_profile:SOP.name,sop_version:SOP.version,sop_sha256:sopHash()};}
function sopInterpretationRows(filterRun,forExport){
  const P=s=>forExport?exportName(s):s;
  return sopEvaluateAll().filter(e=>filterRun==null||filterRun===""||String(e.ri)===String(filterRun)).flatMap(e=>e.rows.map(r=>({
    experiment:runName(e.run),run_status:e.status,sample:P(r.sample),target:r.target,role:r.role,
    kind:r.ctrl?"control: "+r.ctrl.name:r.spec.kind,wells:r.wells.map(w=>w.well).join(" "),
    replicates:r.n,detected:r.det,omitted:r.omitted||"",above_cutoff:r.above||"",
    cq_mean:Number.isFinite(r.cqMean)?+r.cqMean.toFixed(3):"",cq_sd:Number.isFinite(r.cqSd)?+r.cqSd.toFixed(3):"",
    cq_cutoff:Number.isFinite(r.cqMax)?r.cqMax:"",quantity:Number.isFinite(r.conc)?r.conc:"",
    outcome:r.outcome,label:r.label,reason:r.reason,report:sopFmt((SOP.outcomes[r.outcome]||{}).text,{sample:P(r.sample),target:sopTargetLabel(r),cq:num(r.cqMean,2),sd:num(r.cqSd,2),det:r.det,n:r.n,cutoff:r.cqMax,reason:r.reason,outcome:r.label,run:runName(e.run)}),
    rule:r.rule,stored_calls:uniq(r.wells.map(w=>w.call)).join(" | "),
    ...sopMeta()})));
}
function sopSampleRows(filterRun,forExport){
  const P=s=>forExport?exportName(s):s;
  return sopEvaluateAll().filter(e=>filterRun==null||filterRun===""||String(e.ri)===String(filterRun)).flatMap(e=>{
    const by=byKey(e.rows.filter(r=>!r.ctrl&&r.outcome!=="Standard"),r=>r.sample);
    return [...by].map(([s,rs])=>{
      const order=["Invalid run","Invalid","Repeat","Inconclusive","Positive","Negative","Not interpreted"];
      /* A taxon reference is a validity check, not a GMO target.  Decide the
         sample-level screening outcome from 35S/T-NOS (or other non-reference
         targets); keep reference failures in needs_action for review. */
      const assay=rs.filter(r=>!r.spec||r.spec.kind!=="reference");
      const decisionRows=assay.length?assay:rs;
      const worst=decisionRows.map(r=>r.outcome).sort((a,b)=>order.indexOf(a)-order.indexOf(b))[0];
      const actionRows=rs.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome));
      const referenceOutcomes=uniq(rs.filter(r=>r.spec&&r.spec.kind==="reference").map(r=>r.outcome));
      return {experiment:runName(e.run),run_status:e.status,sample:P(s),
        summary:rs.map(r=>`${sopTargetLabel(r)}: ${r.label}`).join("; "),sample_outcome:worst,action:actionRows.map(r=>`${sopTargetLabel(r)}: ${r.label}`).join("; "),reference_outcomes:referenceOutcomes.join(" | "),needs_action:actionRows.length?"yes":"",
        report:rs.map(r=>sopFmt((SOP.outcomes[r.outcome]||{}).text,{sample:P(s),target:sopTargetLabel(r),cq:num(r.cqMean,2),sd:num(r.cqSd,2),det:r.det,n:r.n,cutoff:r.cqMax,reason:r.reason,outcome:r.label,run:runName(e.run)})).join(" "),
        ...sopMeta()};
    });
  });
}
function sopCriteriaRows(){
  return sopEvaluateAll().flatMap(e=>e.criteria.map(c=>({experiment:runName(e.run),run_status:e.status,criterion:c.criterion,
    sop_action:c.action,status:c.status,evidence:c.evidence,...sopMeta()})));
}
function sopRunRows(){
  return sopEvaluateAll().map(e=>{
    const cnt=o=>e.rows.filter(r=>r.outcome===o).length,T=e.times||{};
    return {experiment:runName(e.run),platform:e.run.platform||"LightCycler 480",status:e.status,
      rejected:e.rejected.map(c=>c.criterion).join("; "),review:e.reviewed.map(c=>c.criterion).join("; "),
      positive:cnt("Positive"),negative:cnt("Negative"),inconclusive:cnt("Inconclusive"),repeat:cnt("Repeat"),
      invalid:cnt("Invalid")+cnt("Invalid run"),control_fail:cnt("Control fail"),
      run_start:sopFmtTime(T.start),run_end:sopFmtTime(T.end),last_change:sopFmtTime(T.lastEdit),
      hours_run_end_to_last_change:Number.isFinite(T.editDelayH)?+T.editDelayH.toFixed(2):"",
      run_minutes:Number.isFinite(T.durationMin)?+T.durationMin.toFixed(1):"",...sopMeta()};
  });
}
function sopEvents(){
  const out=[];
  sopEvaluateAll().forEach(e=>{
    const exp=runName(e.run);
    e.criteria.filter(c=>c.criterion!=="Container integrity"&&(c.status==="fail"||c.status==="review")).forEach(c=>out.push({experiment:exp,severity:c.status==="fail"?"error":"review",
      area:"SOP: "+SOP.name,finding:`${c.criterion} — ${c.status==="fail"?"not met (run rejected)":"not met (review)"}`,evidence:c.evidence}));
    const act=e.rows.filter(r=>/Invalid$|Repeat|Inconclusive/.test(r.outcome));
    if(act.length)out.push({experiment:exp,severity:"review",area:"SOP: "+SOP.name,
      finding:`${act.length} result(s) need action (${uniq(act.map(r=>r.outcome)).join(", ")})`,
      evidence:act.slice(0,8).map(r=>`${r.sample}/${r.target}: ${r.reason}`).join("; ")+(act.length>8?" …":"")});
  });
  return out;
}

/* ---- forensic checks that need several runs or whole-file views ---- */
/* Reuse forensic scans for the current data and profile. Decoded runs remain
   immutable between refreshes; profile edits and refreshed data invalidate this snapshot. */
let FORENSIC_CACHE=null;
function invalidateAnalysisCaches(){
  FORENSIC_CACHE=null;CC_STATE.cache=null;CC_STATE.evKey=null;CC_STATE.evRuns=null;CC_STATE.evCache=null;
}
function forensicSnapshot(){
  const profile=sopCanonical(SOP);
  if(!FORENSIC_CACHE||FORENSIC_CACHE.runs!==RUNS||FORENSIC_CACHE.n!==RUNS.length||FORENSIC_CACHE.profile!==profile)
    FORENSIC_CACHE={runs:RUNS,n:RUNS.length,profile};
  return FORENSIC_CACHE;
}
function extraForensicEvents(){const c=forensicSnapshot();return c.extra||(c.extra=extraForensicEventsUncached());}
function reviewForensicEventsCore(){const c=forensicSnapshot();return c.core||(c.core=reviewForensicEventsCoreUncached());}
function forensicCounts(){
  const c=forensicSnapshot();if(c.counts)return c.counts;
  const copied=new Map(),findings=new Map();
  try{for(const e of extraForensicEvents())if(e.area==="Copied data")copied.set(e.experiment,(copied.get(e.experiment)||0)+1);}catch(e){console.error(e);}
  try{for(const e of reviewForensicEventsCore())if(e.severity!=="info")findings.set(e.experiment,(findings.get(e.experiment)||0)+1);}catch(e){console.error(e);}
  return c.counts={copied,findings};
}
function extraForensicEventsUncached(){
  const out=[],push=(run,severity,area,finding,evidence)=>out.push({experiment:run?runName(run):"(all loaded runs)",severity,area,finding,evidence:evidence||""});
  const bySha=byKey(RUNS.filter(r=>r.meta&&r.meta.sourceSHA256),r=>r.meta.sourceSHA256);
  bySha.forEach(rs=>{if(rs.length>1)push(null,"error","Duplicate file","The same file content was loaded under several names",rs.map(r=>r.file).join(", "));});
  const byName=byKey(RUNS,r=>runName(r));
  byName.forEach((rs,n)=>{if(rs.length>1&&new Set(rs.map(r=>r.meta.sourceSHA256)).size>1)push(null,"review","Duplicate name","Different files carry the same experiment name",`${n}: ${rs.map(r=>r.file).join(", ")}`);});
  const curveHash=c=>c.map(v=>Number(v).toPrecision(7)).join(",");
  const seen=new Map(),pairs=new Map();
  RUNS.forEach(run=>{
    const phys=new Map();
    (run.wells||[]).forEach(w=>{if(w.curve&&w.curve.length>5&&Math.max(...w.curve)>Math.min(...w.curve))phys.set(`${w.channel}|${w.pos}`,{w,h:curveHash(w.curve)});});
    phys.forEach(({w,h})=>{const k=`${w.channel}|${h}`;const prev=seen.get(k);
      if(prev){const pk=`${RUNS.indexOf(prev.run)}|${RUNS.indexOf(run)}`;if(!pairs.has(pk))pairs.set(pk,{a:prev.run,b:run,list:[]});pairs.get(pk).list.push(`${prev.w.well}=${w.well}`);}
      else seen.set(k,{run,w});});
  });
  pairs.forEach(p=>out.push({experiment:runName(p.b),severity:"error",area:"Copied data",
    finding:p.a===p.b?`${p.list.length} well pair(s) carry identical fluorescence curves`:`${p.list.length} curve(s) are identical to curves in another run`,
    evidence:(p.a===p.b?"":`${runName(p.a)} ↔ ${runName(p.b)}: `)+p.list.slice(0,12).join(", ")+(p.list.length>12?" …":"")}));
  RUNS.forEach(run=>{
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
  });
  const multi=(key,label)=>{const vals=uniq(RUNS.map(r=>String((r.meta||{})[key]||"")).filter(Boolean));
    if(vals.length>1)push(null,"info","Batch consistency",`${vals.length} different ${label} across the loaded runs`,vals.slice(0,8).join(" | "));};
  if(RUNS.length>1){multi("SWVersion","software versions");multi("InstrumentID","instrument identifiers");}
  return out;
}

