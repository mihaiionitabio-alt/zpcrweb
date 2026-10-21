/* ============================================================
   C. Open formats
   ------------------------------------------------------------
   Two details here were established by running the target tools rather
   than by reading their documentation, and both are load-bearing:

   1. rdmlpython refuses LinRegPCR below RDML 1.4
      ("LinRegPCR requires RDML version >= 1.4"), so 1.4 is written.
   2. It resolves a target's chemistry through the dye table and raises
      KeyError on the target id if the referenced dye was never declared.
      Writing <dyeId> without a matching <dye> element therefore produces
      a file that opens, validates and then fails halfway through analysis.
      Every referenced dye is declared.
   ============================================================ */
function dyeChemistryOf(run){
  /* SYBR Green and other intercalators must not be reported as probes: the
     chemistry changes how LinRegPCR treats the amplification plateau. */
  const names=(run.protocol.channels||[]).map(c=>(c.name||"").toLowerCase()).join(" ");
  const anaNames=run.analyses.map(a=>(a.name||"").toLowerCase()).join(" ");
  const text=names+" "+anaNames+" "+(run.meta.name||"").toLowerCase();
  if(/sybr|syto|eva\s*green|intercalat/.test(text))return "DNA-binding dye";
  if(/hybprobe|fret/.test(text))return "hybridization probe";
  return "hydrolysis probe";
}
function rdmlSampleType(role){
  return role==="NTC"?"ntc"
    :(role==="Positive control"||role==="Calibrator")?"pos"
    :(role==="Negative control"||role==="Blank")?"nac"
    :role==="Standard"?"std":"unkn";
}
function rdmlId(prefix,value){return prefix+"_"+String(value||"x").replace(/[^\w.-]+/g,"_");}
function analysisGroups(rows){
  const groups=new Map();
  (rows||[]).forEach(w=>{
    const key=w.analysisUid||w.analysis||"analysis";
    if(!groups.has(key))groups.set(key,{key,name:w.analysis||key,wells:[]});
    groups.get(key).wells.push(w);
  });
  return [...groups.values()];
}
function curveAnalysisGroups(run){return analysisGroups((run.wells||[]).filter(w=>w.curve));}

function makeRDMLXML(run){
  const chemistry=dyeChemistryOf(run);
  const results=[...(run.wells||[]).filter(w=>w.curve),...(run.tmWells||[]).filter(w=>w.meltCurve&&w.meltCurve.length)];
  const targets=uniq(results.map(w=>w.target||"target"));
  const samples=uniq(results.map(w=>w.sample||w.well));
  const roleOf={};results.forEach(w=>{roleOf[w.sample||w.well]=w.role;});
  const dyeOf=t=>rdmlId("dye",t);
  let x=`<?xml version="1.0" encoding="UTF-8"?>\n<rdml version="1.4" xmlns="http://www.rdml.org">\n`;
  x+=`<dateMade>${new Date().toISOString().replace(/\.\d+Z$/,"Z")}</dateMade>\n`;
  x+=`<id><publisher>ixo-qc-export</publisher><serialNumber>${xesc(sourceUidOf(run)||run.meta.name||run.file)}</serialNumber></id>\n`;
  x+=`<experimenter id="op"><firstName>${xesc(operatorOf(run)||"operator")}</firstName><lastName>-</lastName></experimenter>\n`;
  /* dyes first: the element order in RDML 1.4 is dye, sample, target, experiment */
  targets.forEach(t=>{
    x+=`<dye id="${xesc(dyeOf(t))}"><dyeChemistry>${chemistry}</dyeChemistry></dye>\n`;
  });
  samples.forEach(s=>{
    x+=`<sample id="${xesc(rdmlId("smp",s))}"><type>${rdmlSampleType(roleOf[s])}</type>`
      +`<doubleStranded>true</doubleStranded></sample>\n`;
  });
  targets.forEach(t=>{
    x+=`<target id="${xesc(rdmlId("tgt",t))}" type="toi"><dyeId id="${xesc(dyeOf(t))}"/></target>\n`;
  });
  x+=`<experiment id="${xesc(rdmlId("exp",run.meta.name||run.file))}">\n`;
  analysisGroups(results).forEach(group=>{
    x+=`<run id="${xesc(rdmlId("run",(run.meta.name||run.file)+"_"+group.key))}">\n`;
    x+=`<instrument>${xesc(run.meta.InstrumentName||"LightCycler 480")}</instrument>\n`;
    x+=`<pcrFormat><rows>${run.rows}</rows><columns>${run.cols}</columns>`
      +`<rowLabel>ABC</rowLabel><columnLabel>123</columnLabel></pcrFormat>\n`;
    group.wells.forEach(w=>{
      x+=`<react id="${w.pos+1}"><sample id="${xesc(rdmlId("smp",w.sample||w.well))}"/>`;
      x+=`<data><tar id="${xesc(rdmlId("tgt",w.target||"target"))}"/>`;
      if(Number.isFinite(w.CpRaw)&&w.CpRaw>0)x+=`<cq>${w.CpRaw}</cq>`;
      if(w.tms&&Number.isFinite(w.tms[0]))x+=`<meltTemp>${w.tms[0]}</meltTemp>`;
      if(w.curve)w.curve.forEach((v,i)=>{x+=`<adp><cyc>${i+1}</cyc><fluor>${v}</fluor></adp>`;});
      if(w.meltCurve)w.meltCurve.forEach(p=>{
        x+=`<mdp><tmp>${p.temp}</tmp><fluor>${p.fluor}</fluor></mdp>`;
      });
      x+=`</data></react>\n`;
    });
    x+=`</run>\n`;
  });
  x+=`</experiment>\n</rdml>\n`;
  return x;
}
function makeRDML(run){return makeStoredZip([{name:"rdml_data.xml",data:makeRDMLXML(run)}]);}

/* qpcR wants one wide table per analysis: pcrbatch() stops outright unless the
   first column is named exactly "Cycles". Well labels are prefixed with the
   target so replicate groups can be formed with a simple sub() in R. */
function makeQpcrWide(run,analysisKey){
  const groups=curveAnalysisGroups(run);
  const group=analysisKey==null?groups[0]:groups.find(g=>g.key===analysisKey);
  const wells=group?group.wells:[];
  if(!wells.length)return "";
  const n=Math.max(...wells.map(w=>w.curve.length));
  const names=wells.map(w=>`${safeName(w.target||"tgt")}_${safeName(w.sample||w.well)}_${w.well}`);
  const lines=["Cycles,"+names.join(",")];
  for(let i=0;i<n;i++){
    lines.push([i+1,...wells.map(w=>i<w.curve.length?w.curve[i]:"")].join(","));
  }
  return lines.join("\n")+"\n";
}
function makeQpcrWideTables(run){
  const groups=curveAnalysisGroups(run),multi=groups.length>1;
  return groups.map((g,i)=>({
    key:g.key,analysis:g.name,
    file:`${safeName(run.meta.name||run.file)}${multi?"_"+String(i+1).padStart(2,"0")+"_"+safeName(g.name||"analysis"):""}_qpcR_curves.csv`,
    data:makeQpcrWide(run,g.key)
  }));
}
/* The same curves in long form, with the per-well minimum removed. This is a
   plain baseline offset, not a fitted baseline - LinRegPCR and qpcR each fit
   their own, and pre-fitting one here would bias the comparison. */
function makeBaselineCSV(run){
  const cols=[{key:"experiment",label:"experiment"},{key:"well",label:"well"},{key:"sample",label:"sample"},
    {key:"target",label:"target"},{key:"role",label:"role"},{key:"cycle",label:"cycle"},
    {key:"raw",label:"raw"},{key:"baseline_subtracted",label:"baseline_subtracted"}];
  const rows=[];
  run.wells.forEach(w=>{
    if(!w.curve)return;
    const base=Math.min(...w.curve);
    w.curve.forEach((v,i)=>rows.push({experiment:run.meta.name||run.file,well:w.well,sample:w.sample||"",
      target:w.target||"",role:w.role||"",cycle:i+1,raw:v,baseline_subtracted:v-base}));
  });
  return toCSV(cols,rows);
}
function makeRDES(run,analysisKey){
  const groups=curveAnalysisGroups(run);
  const group=analysisKey==null?groups[0]:groups.find(g=>g.key===analysisKey);
  const head=["source_uid","source_crc32","experiment","well","sample","target","analysis","channel","filter","role","instrument_type",
    "replicate_group","stored_cq","call","cycle","fluorescence"];
  const lines=[head.join("\t")];
  (group?group.wells:[]).forEach(w=>{
    w.curve.forEach((v,i)=>lines.push([sourceUidOf(run),sourceCRCOf(run),run.meta.name||run.file,w.well,w.sample,w.target,w.analysis,w.channel,
      w.filterComb,w.role,w.instrType,Number.isFinite(w.replicateOf)?w.replicateOf+1:"",
      w.CpRaw??"",w.call,i+1,v].join("\t")));
  });
  return lines.join("\n")+"\n";
}
function makeRDESTables(run){
  const groups=curveAnalysisGroups(run),multi=groups.length>1;
  return groups.map((g,i)=>({
    key:g.key,analysis:g.name,
    file:`${safeName(run.meta.name||run.file)}${multi?"_"+String(i+1).padStart(2,"0")+"_"+safeName(g.name||"analysis"):""}.rdes.tsv`,
    data:makeRDES(run,g.key)
  }));
}

/* ---------- the two scripts ---------- */
function rScript(){
  return `# qpcR — fit the LightCycler 480 curves and compare with the stored Cq.
#
# Input : <run>_qpcR_curves.csv  (wide; column 1 is "Cycles", one column per well)
#         <run>_cq_values.csv    (the Cq the instrument stored)
#
# install.packages("qpcR")
library(qpcR)

wide <- read.csv("REPLACE_WIDE", check.names = FALSE)
stopifnot(names(wide)[1] == "Cycles")   # pcrbatch() requires this exact name

# Fit every well with the default four-parameter log-logistic model.
ml <- modlist(wide, cyc = 1, fluo = 2:ncol(wide), baseline = "lin")

# Per-well efficiency and second-derivative-maximum Cq.
res <- pcrbatch(wide, cyc = 1, fluo = 2:ncol(wide), model = l4,
                methods = c("sigfit", "sliwin"), plot = FALSE)
write.csv(res, "qpcR_results.csv", row.names = FALSE)

# Compare qpcR's cpD2 with the Cq the instrument stored.
stored <- read.csv("REPLACE_CQ")
qcp <- data.frame(
  column = colnames(wide)[-1],
  cpD2   = sapply(ml, function(m) tryCatch(efficiency(m, plot = FALSE)$cpD2,
                                           error = function(e) NA_real_))
)
qcp$well <- sub("^.*_", "", qcp$column)
cmp <- merge(qcp, stored[, c("well", "cq")], by = "well")
cmp$difference <- cmp$cpD2 - cmp$cq
print(summary(cmp$difference))
write.csv(cmp, "qpcR_vs_stored_cq.csv", row.names = FALSE)

# A disagreement of a few tenths of a cycle is normal: qpcR fits a sigmoid to
# the raw curve while the instrument used its own baseline and threshold.
# A disagreement of several cycles means the curves and the Cq values did not
# come from the same channel, which is worth investigating before going further.
`;
}
function pyScript(){
  return `# rdmlpython / LinRegPCR — reanalyse the exported curves.
#
# Input : <run>.rdml   (RDML 1.4, written by this page)
#
# pip install lxml numpy scipy
# git clone --recursive https://github.com/RDML-consortium/rdmlpython.git
#
# The --recursive matters: the XSD schemas live in a submodule, and validate()
# raises OSError without them. LinRegPCR itself runs without the schemas.

import sys
sys.path.insert(0, "rdmlpython")     # adjust to your checkout
import rdml

doc = rdml.Rdml("REPLACE_RDML")
print("RDML version:", doc.version())   # expect 1.4 — LinRegPCR refuses anything older

for exp in doc.experiments():
    for run in exp.runs():
        result = run.linRegPCR(
            updateRDML=True,          # write efficiencies and N0 back into the document
            saveResultsCSV=True,
            pcrEfficiencyExl=0.05,    # exclude wells more than 5% off the group efficiency
            verbose=False,
        )
        csv = result.get("resultsCSV", "")
        with open("linregpcr_results.tsv", "w", encoding="utf-8") as fh:
            fh.write(csv)
        print("wells analysed:", max(0, len(csv.splitlines()) - 1))

doc.save("reanalysed.rdml")

# The columns to read first are "indiv PCR eff" (per-well efficiency) and
# "N0 (mean eff)" (starting concentration). Wells LinRegPCR excluded carry a
# reason in the "excluded" column — that column is the useful QC output here,
# because it flags curves the instrument accepted and LinRegPCR did not.
`;
}

