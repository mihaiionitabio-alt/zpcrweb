/* ---- pseudonyms for downloads: controls keep their names, everything else becomes S01, S02 … ---- */
let PSEUDO_MAP=null;
function pseudonymMap(){
  if(PSEUDO_MAP)return PSEUDO_MAP;
  const m=new Map();let k=0;
  RUNS.forEach(r=>(r.wells||[]).concat(r.tmWells||[]).forEach(w=>{
    const s=w.sample||"";if(!s||m.has(s))return;
    m.set(s,roleFromName(s)!=="Unknown"?s:`S${String(++k).padStart(2,"0")}`);
  }));
  RUNS.forEach(r=>Object.values(r.plate||{}).forEach(x=>{const s=x.name;if(s&&!m.has(s))m.set(s,roleFromName(s)!=="Unknown"?s:`S${String(++k).padStart(2,"0")}`);}));
  return PSEUDO_MAP=m;
}
function pseudoOn(){const c=$("#exp-pseudo");return !!(c&&c.checked);}
function exportName(s){return s&&pseudoOn()?(pseudonymMap().get(s)||s):s;}
function pseudoRun(r){
  const P=s=>exportName(s),mapRows=a=>(a||[]).map(w=>Object.assign({},w,{sample:P(w.sample)}));
  const plate={};Object.entries(r.plate||{}).forEach(([k,v])=>plate[k]=Object.assign({},v,{name:P(v.name)}));
  const meta=Object.assign({},r.meta);if(meta.OriginalPath)meta.OriginalPath="(withheld)";
  return Object.assign({},r,{meta,plate,wells:mapRows(r.wells),tmWells:mapRows(r.tmWells),
    genoResults:mapRows(r.genoResults),rqResults:mapRows(r.rqResults),otherResults:mapRows(r.otherResults),
    sourcePath:r.file,analyses:(r.analyses||[]).map(a=>Object.assign({},a,{quantStats:(a.quantStats||[]).map(q=>Object.assign({},q,{master:P(q.master)}))}))});
}
function withExportNames(fn){
  if(!pseudoOn())return fn();
  const keep=RUNS;RUNS=keep.map((r,i)=>ssExportClone(pseudoRun(r),r,i));
  try{return fn();}finally{RUNS=keep;}
}
