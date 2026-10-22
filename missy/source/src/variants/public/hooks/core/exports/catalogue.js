/* ============================================================
   D. The export catalogue
   ============================================================ */
const BASE_MACHINE_METADATA=JSON.parse(document.querySelector("#machine-metadata").textContent);
const JSONLD_STANDARDS=[
  {"@id":"https://www.w3.org/TR/json-ld11/","@type":"dcterms:Standard",name:"JSON-LD 1.1"},
  {"@id":"https://schema.org/Dataset","@type":"dcterms:Standard",name:"Schema.org Dataset"},
  {"@id":"https://www.w3.org/TR/vocab-dcat-3/","@type":"dcterms:Standard",name:"W3C Data Catalog Vocabulary (DCAT 3)"},
  {"@id":"https://www.w3.org/TR/prov-o/","@type":"dcterms:Standard",name:"W3C PROV-O"},
  {"@id":"http://purl.org/pav/","@type":"dcterms:Standard",name:"Provenance, Authoring and Versioning (PAV)"}
];
function metadataId(run,index){
  const key=sourceUidOf(run)||sourceSHA256Of(run)||run.file||String(index+1);
  return `#dataset-${encodeURIComponent(String(key).replace(/[^\w.-]+/g,"-"))}`;
}
function outputDistribution(id,key,name,description,encodingFormat,conformsTo){
  const out={"@id":`${id}/distribution/${key}`,"@type":["DataDownload","dcat:Distribution"],
    name,description,encodingFormat,
    "rdfs:comment":"Generated locally on demand. No public contentUrl is asserted because the experiment and export remain on the user's device."};
  if(conformsTo)out.conformsTo={"@id":conformsTo};
  return out;
}
function distributionsFor(run,id){
  const m=run.meta||{},source={
    "@id":`${id}/source`,"@type":["DataDownload","dcat:Distribution","prov:Entity"],
    name:run.file||m.name||"Original vendor file",
    description:run.eds?"Unmodified Applied Biosystems QuantStudio experiment document used as the provenance anchor."
      :"Unmodified Roche LightCycler 480 experiment container used as the provenance anchor.",
    encodingFormat:"application/octet-stream",
    contentSize:m.sourceBytes?`${m.sourceBytes} B`:undefined,
    "spdx:checksum":m.sourceSHA256?{"@type":"spdx:Checksum",
      "spdx:algorithm":{"@id":"spdx:checksumAlgorithm_sha256"},"spdx:checksumValue":m.sourceSHA256}:undefined,
    additionalProperty:{"@type":"PropertyValue",name:"Source container format",value:run.eds?".eds (QuantStudio experiment document, ZIP container)":".ixo (Roche LightCycler 480 experiment)"},
    identifier:[m.UID?`LightCycler experiment UID: ${m.UID}`:null,m.sourceCRC32?`CRC-32: ${m.sourceCRC32}`:null].filter(Boolean),
    "rdfs:comment":"The source filename is recorded, but a local filesystem path is deliberately not published in JSON-LD."
  };
  const out=[source,
    outputDistribution(id,"cq","Stored Cq values","One row per stored result with well, sample, target, role, call and provenance.","text/csv"),
    outputDistribution(id,"settings","Experiment settings","Traceable settings with the source part or property of the vendor container.","text/csv"),
    outputDistribution(id,"metadata","Dataset metadata","This machine-readable description of the application, catalog, datasets, provenance and distributions.","application/ld+json")
  ];
  if((run.wells||[]).some(w=>w.curve))out.push(
    outputDistribution(id,"rdml","RDML 1.4 experiment","Vendor-neutral qPCR exchange representation.","application/zip","https://rdml.org/"),
    outputDistribution(id,"qpcr","qpcR curve table","Wide CSV curve table with Cycles as the first column.","text/csv"),
    outputDistribution(id,"rdes","RDES long curve table","One fluorescence observation per cycle, well and analysis.","text/tab-separated-values")
  );
  if((run.tmWells||[]).length)out.push(
    outputDistribution(id,"melting","Stored melting peaks","One row per stored peak, with call and manual-edit metadata.","text/csv"));
  return out.map(x=>Object.fromEntries(Object.entries(x).filter(([,v])=>v!==undefined)));
}
function variablesFor(run){
  const out=[];
  if((run.wells||[]).length)out.push({"@type":"PropertyValue",name:"Stored quantification cycle",propertyID:"Cq",unitText:"PCR cycle"},
    {"@type":"PropertyValue",name:"Instrument result call",propertyID:"Call"});
  if((run.wells||[]).some(w=>w.curve))out.push({"@type":"PropertyValue",name:"Raw fluorescence",propertyID:"Fluorescence",unitText:"instrument raw unit"});
  if((run.tmWells||[]).length)out.push({"@type":"PropertyValue",name:"Stored melting temperature",propertyID:"Tm",unitCode:"CEL"});
  return out;
}
function datasetMetadata(run,index){
  const m=run.meta||{},id=metadataId(run,index),uid=sourceUidOf(run),sha=sourceSHA256Of(run),crc=sourceCRCOf(run),
    distributions=distributionsFor(run,id),start=m.StartTime||m.RunCreated||m.Created||"",end=m.EndTime||"",
    title=m.name||run.file||`qPCR experiment ${index+1}`,
    description=`Decoded ${run.platform||"LightCycler 480"} qPCR experiment with ${(run.wells||[]).length} stored quantification result(s), `
      +`${uniqueCurveCount(run)} result-linked amplification curve(s) and ${(run.tmWells||[]).length} melting result(s).`;
  const identifiers=[
    uid?{"@type":"PropertyValue",propertyID:"LightCycler experiment UID",value:uid}:null,
    sha?{"@type":"PropertyValue",propertyID:"SHA-256",value:sha}:null,
    crc?{"@type":"PropertyValue",propertyID:"CRC-32",value:crc}:null
  ].filter(Boolean);
  const counts=[
    ["Plate rows",run.rows],["Plate columns",run.cols],["Acquisition cycles",run.nCycles],
    ["Analyses",(run.analyses||[]).length],["Stored quantification results",(run.wells||[]).length],
    ["Result-linked curves",uniqueCurveCount(run)],["Acquired channel/well curves",acquiredCurveCount(run)],
    ["Melting results",(run.tmWells||[]).length]
  ].filter(([,v])=>v!==""&&v!=null).map(([name,value])=>({"@type":"PropertyValue",name,value}));
  const dataset={
    "@id":id,"@type":["Dataset","dcat:Dataset"],name:title,"dcterms:title":title,
    description,"dcterms:description":description,
    identifier:identifiers,"dcterms:identifier":identifiers.map(x=>x.value),
    includedInDataCatalog:{"@id":"#catalog"},measurementTechnique:"quantitative real-time PCR (qPCR)",
    keywords:["qPCR",run.platform||"LightCycler 480","primary instrument data","Cq","fluorescence","quality control","data integrity"],
    variableMeasured:variablesFor(run),additionalProperty:counts,
    distribution:distributions,"dcat:distribution":distributions.map(x=>({"@id":x["@id"]})),
    conformsTo:JSONLD_STANDARDS,"dcterms:conformsTo":JSONLD_STANDARDS.map(x=>({"@id":x["@id"]})),
    subjectOf:{"@id":"#metadata-profile"},
    conditionsOfAccess:"Processed locally from a user-selected file. Any downstream access conditions are determined by the responsible data steward.",
    "dcterms:rights":"No licence, consent, community authority or permission for future reuse is inferred by this software.",
    "prov:wasDerivedFrom":{"@id":`${id}/source`},
    "prov:wasGeneratedBy":{"@type":"prov:Activity",name:run.eds?"Read-only QuantStudio .eds decoding":"Read-only LightCycler 480 .ixo decoding",
      "prov:used":{"@id":`${id}/source`},"prov:wasAssociatedWith":{"@id":"#application"}},
    "pav:createdWith":{"@id":"#application"},
    "dcterms:provenance":"Decoded read-only from the unmodified vendor container; stored instrument values are preserved and derived review quantities remain labelled.",
    "rdfs:comment":"This Dataset record describes one locally selected experiment. It does not expose the local path or create a network endpoint."
  };
  if(m.Created)dataset.dateCreated=m.Created;
  if(m.LastModified&&!/^1899/.test(m.LastModified))dataset.dateModified=m.LastModified;
  if(start)dataset.temporalCoverage=end?`${start}/${end}`:start;
  if(m.SWVersion)dataset.softwareVersion=m.SWVersion;
  if(m.InstrumentName)dataset.instrument={"@type":"Thing",name:m.InstrumentName,
    identifier:m.InstrumentID||undefined,description:"qPCR instrument recorded in the source experiment"};
  if(operatorOf(run))dataset["prov:qualifiedAttribution"]={"@type":"prov:Attribution",
    "prov:agent":{"@type":"prov:Agent",name:operatorOf(run)},"dcterms:description":"Instrument operator recorded by the run"};
  return JSON.parse(JSON.stringify(dataset));
}
function pastedDatasetMetadata(){
  if(!PASTED||!PASTED.rows||!PASTED.rows.length)return null;
  return {"@id":"#dataset-pasted-cq","@type":["Dataset","dcat:Dataset"],
    name:"Pasted Cq table",description:`Locally parsed Cq table with ${PASTED.rows.length} numeric row(s).`,
    includedInDataCatalog:{"@id":"#catalog"},measurementTechnique:"quantitative real-time PCR (qPCR)",
    variableMeasured:[{"@type":"PropertyValue",name:"Quantification cycle",propertyID:"Cq",unitText:"PCR cycle"}],
    distribution:[outputDistribution("#dataset-pasted-cq","cq","Parsed Cq values","Normalised local CSV representation.","text/csv")],
    subjectOf:{"@id":"#metadata-profile"},
    conditionsOfAccess:"Processed locally from user-pasted values. Any downstream access conditions are determined by the responsible data steward.",
    "dcterms:rights":"No creator, licence, consent, community authority or permission for future reuse is inferred by this software.",
    "rdfs:comment":"This record has no instrument-level provenance because it was created from pasted tabular values rather than an .ixo or .eds container."};
}
function machineMetadataDocument(){
  const doc=clone(BASE_MACHINE_METADATA),graph=doc["@graph"],catalog=graph.find(x=>x["@id"]==="#catalog"),
    datasets=RUNS.map(datasetMetadata),pasted=pastedDatasetMetadata();
  const application=graph.find(x=>x["@id"]==="#application");
  if(application){application.softwareVersion=APP_VERSION;application.dateModified="2026-09-23";}
  if(pasted)datasets.push(pasted);
  catalog.dataset=datasets.map(x=>({"@id":x["@id"]}));
  catalog["dcat:dataset"]=catalog.dataset;
  catalog.numberOfItems=datasets.length;
  catalog.dateModified="2026-09-23";
  graph.push(...datasets);
  return doc;
}
function machineMetadataJSON(){return JSON.stringify(machineMetadataDocument(),null,2)+"\n";}
function renderMachineMetadata(){
  const node=$("#machine-metadata");
  if(node)node.textContent=machineMetadataJSON();
}
function exportCatalogueBase(){
  const items=exportCatalogueCore();
  items.push({title:"Applied sample selection (CSV)",note:"Included and excluded samples per experiment; raw-file and hardware data are unchanged.",ready:()=>RUNS.length>0,run:()=>{ssBuildRows();download("sample_selection.csv",csvOf(ssManifest()),"text/csv");}});
  items.splice(1,0,{
    title:"Forensic log (CSV)",
    note:"One row per run (counts, status) and one per finding: controls, flags, replicate spread, Ct traceability, calibrations and instrument log.",
    ready:()=>RUNS.length>0,run:()=>downloadForensicCSV()
  });
  items.splice(2,0,{
    title:"QuantStudio export layout (TXT)",
    note:"Header plus Sample Setup, Raw Data, Amplification Data, Multicomponent Data, analysis summaries and Results as tab-delimited sections (MAN0010409, chapter 3), with the columns and row order of the software's own export. For LIS/LIMS parsers that expect that layout.",
    ready:()=>RUNS.some(r=>r.eds&&r.eds.results.length),
    run:()=>RUNS.filter(r=>r.eds&&r.eds.results.length).forEach(r=>download(safeName(r.meta.name||r.file)+"_QuantStudio_export.txt",
      EDS.qsExport(r.eds,{pseudo:pseudoOn(),nameOf:exportName}),"text/plain"))
  });
  items.splice(3,0,{
    title:"QuantStudio export workbook (XLSX)",
    note:"The same sheets, columns and row order as the QuantStudio software's Excel export (Sample Setup, Raw Data, Amplification Data, Multicomponent Data, analysis summaries, Results, Reagent Information), rebuilt from the .eds using the export configuration saved inside it.",
    ready:()=>RUNS.some(r=>r.eds&&r.eds.results.length),
    run:()=>RUNS.filter(r=>r.eds&&r.eds.results.length).forEach(r=>download(safeName(r.meta.name||r.file)+"_QuantStudio_export.xlsx",
      qsWorkbook(r,{pseudo:pseudoOn(),nameOf:exportName}),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
  });
  items.push({
    title:"Relative quantification (CSV)",
    note:"Stored relative-quantification results: ΔΔCt summaries with RQ and confidence limits from QuantStudio, pairing ratios from LightCycler.",
    ready:()=>rqRows().length>0,
    run:()=>{const rows=rqRows();download(baseName()+"_relative_quantification.csv",toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}
  });
  items.push({
    title:"Multicomponent and raw filter data (CSV)",
    note:"QuantStudio only: per-dye multicomponent signal and every filter-set reading, one row per named well and cycle — the data under the stored Rn.",
    ready:()=>RUNS.some(r=>r.eds&&r.eds.raw.sets.length),
    run:()=>{const rows=edsSignalRows();if(rows.length)download(baseName()+"_multicomponent_raw.csv",toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}
  });
  const bundle=items.find(it=>/one ZIP/.test(it.title));
  if(bundle){items.splice(items.indexOf(bundle),1);items.push(bundle);}
  return items.map(it=>Object.assign({},it,{run:()=>withExportNames(it.run)}));
}
function exportCatalogue(...args){return MISSY_HOOKS.invoke("exportCatalogue",this,args,exportCatalogueBase);}

/* One browser download for a multi-file export prevents silent download throttling.
   Keep one-file exports unchanged and retain duplicate names with numbered suffixes. */
function downloadExportFiles(kind,files){
  if(!files.length)throw new Error("No files were generated for "+kind);
  if(files.length===1){const f=files[0];download(f.name,f.data,f.mime);return;}
  const used=new Set(),entries=[];
  files.forEach(f=>{
    const original=String(f.name),dot=original.lastIndexOf("."),stem=dot>0?original.slice(0,dot):original,ext=dot>0?original.slice(dot):"";
    let name=original,n=2;while(used.has(name))name=stem+"_"+(n++)+ext;
    used.add(name);entries.push({name,data:f.data});
  });
  const manifest=entries.map(e=>{const bytes=bytesFrom(e.data);return {name:e.name,bytes:bytes.length,sha256:sha256Hex(bytes)};});
  // Reserve metadata names so they cannot collide with exported data filenames.
  let manifestName="export_manifest.json";while(used.has(manifestName))manifestName="_"+manifestName;
  entries.push({name:manifestName,data:JSON.stringify({format:kind,fileCount:manifest.length,files:manifest},null,2)+"\n"});
  download(baseName()+"_"+kind+".zip",makeStoredZip(entries),"application/zip");
}

function exportCatalogueCore(){
  const one=RUNS.length===1?RUNS[0]:null;
  const items=[];
  items.push({
    title:"Cq values (CSV)",
    note:"Every stored crossing point with its well, sample, target, role and call. The plain table most downstream work starts from.",
    ready:()=>RUNS.length>0,
    run:()=>{
      const rows=allWellRows();
      const cols=Object.keys(rows[0]||{cq:1}).map(k=>({key:k,label:k}));
      download(baseName()+"_cq_values.csv",toCSV(cols,rows),"text/csv");
    }
  });
  items.push({
    title:"RDES table (TSV)",
    note:"",
    ready:()=>RUNS.some(r=>r.wells.some(w=>w.curve)),
    run:()=>downloadExportFiles("rdes",RUNS.flatMap(r=>makeRDESTables(r).map(t=>({name:t.file,data:t.data,mime:"text/tab-separated-values"}))))
  });
  items.push({
    title:"RDML 1.4 — for LinRegPCR",
    note:"",
    ready:()=>RUNS.some(r=>r.wells.some(w=>w.curve)),
    run:()=>downloadExportFiles("rdml",RUNS.map(r=>({name:safeName(r.meta.name||r.file)+".rdml",data:makeRDML(r),mime:"application/zip"})))
  });
  items.push({
    title:"qpcR curve table (CSV, wide)",
    note:"",
    ready:()=>RUNS.some(r=>r.wells.some(w=>w.curve)),
    run:()=>downloadExportFiles("qpcr",RUNS.flatMap(r=>makeQpcrWideTables(r).map(t=>({name:t.file,data:t.data,mime:"text/csv"}))))
  });
  items.push({
    title:"Melting peaks (CSV)",
    note:"One row per stored peak with temperature, area, width, height, shoulder, raw call code and manual-edit flag. Wells without a peak remain as one blank row.",
    ready:()=>tmRows().length>0,
    run:()=>{const rows=tmRows();download(baseName()+"_melting_peaks.csv",
      toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}
  });
  items.push({
    title:"Experiment settings (CSV)",
    note:"Every setting the page could read out of the container, each with the property it came from. The same table shown on the Load tab.",
    ready:()=>RUNS.length>0,
    run:()=>{const n=derivedSettings();download(baseName()+"_experiment_settings.csv",
      toCSV([{key:"setting",label:"setting"},{key:"value",label:"value"},{key:"source",label:"read_from"}],n),"text/csv");}
  });
  items.push({
    title:"Everything, as one ZIP",
    note:"Every table above plus both scripts, so a whole experiment can be handed over in a single file.",
    ready:()=>RUNS.length>0,
    run:()=>bundleZip()
  });
  return items;
}
function bundleZip(){
  const entries=[];
  const rows=allWellRows();
  if(rows.length)entries.push({name:"cq_values.csv",data:toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows)});
  const tm=tmRows();
  if(tm.length)entries.push({name:"melting_peaks.csv",data:toCSV(Object.keys(tm[0]).map(k=>({key:k,label:k})),tm)});
  const settings=derivedSettings();
  if(settings.length)entries.push({name:"experiment_settings.csv",
    data:toCSV([{key:"setting",label:"setting"},{key:"value",label:"value"},{key:"source",label:"read_from"}],settings)});
  entries.push({name:"metadata.jsonld",data:machineMetadataJSON()});
  const ev=reviewForensicEvents(),rr=reviewRunRows(ev),frows=[...rr.map(r=>({record_type:"run",...r})),
    ...ev.map(e=>({record_type:"forensic_event",experiment:e.experiment,severity:e.severity,area:e.area,finding:e.finding,evidence:e.evidence}))];
  entries.push({name:"runs_qc_forensic_log.csv",data:toCSV(uniq(frows.flatMap(Object.keys)).map(k=>({key:k,label:k})),frows)});
  const rq=rqRows();
  if(rq.length)entries.push({name:"relative_quantification.csv",data:toCSV(Object.keys(rq[0]).map(k=>({key:k,label:k})),rq)});
  const sig=edsSignalRows();
  if(sig.length)entries.push({name:"multicomponent_raw.csv",data:toCSV(Object.keys(sig[0]).map(k=>({key:k,label:k})),sig)});
  RUNS.forEach(r=>{
    const s=safeName(r.meta.name||r.file);
    if(r.eds&&r.eds.results.length)entries.push({name:`${s}/${s}_QuantStudio_export.txt`,
      data:EDS.qsExport(r.eds,{pseudo:pseudoOn(),nameOf:exportName})});
    if(r.eds&&r.eds.results.length)entries.push({name:`${s}/${s}_QuantStudio_export.xlsx`,data:qsWorkbook(r,{pseudo:pseudoOn(),nameOf:exportName})});
    const rec=instrumentRecordTables(r);
    Object.entries(rec).forEach(([k,rows])=>{if(rows&&rows.length)entries.push({name:`${s}/instrument_records/${k}.csv`,
      data:toCSV(uniq(rows.flatMap(Object.keys)).map(x=>({key:x,label:x})),rows)});});
    if(r.wells.some(w=>w.curve)){
      entries.push({name:`${s}/rdml_data.xml`,data:makeRDMLXML(r)});
      makeQpcrWideTables(r).forEach(t=>entries.push({name:`${s}/${t.file}`,data:t.data}));
      makeRDESTables(r).forEach(t=>entries.push({name:`${s}/${t.file}`,data:t.data}));
    }
  });
  const first=RUNS[0]?safeName(RUNS[0].meta.name||RUNS[0].file):"run";
  const firstWide=RUNS[0]&&makeQpcrWideTables(RUNS[0])[0];
  entries.push({name:"analyse_with_qpcR.R",
    data:rScript().replace("REPLACE_WIDE",firstWide?`${first}/${firstWide.file}`:`${first}/${first}_qpcR_curves.csv`).replace("REPLACE_CQ","cq_values.csv")});
  entries.push({name:"analyse_with_linregpcr.py",
    data:pyScript().replace("REPLACE_RDML",`${first}/rdml_data.xml`)});
  entries.push({name:"README.txt",data:bundleReadme()});
  entries.push({name:"checksums.sha256",data:entries.map(e=>{
    const bytes=e.data instanceof Uint8Array?e.data:new TextEncoder().encode(String(e.data));
    return `${sha256Hex(bytes)}  ${e.name}`;
  }).join("\n")+"\n"});
  download(baseName()+"_open_formats.zip",makeStoredZip(entries),"application/zip");
}
function bundleReadme(){
  return `Raw values, open formats, instrument records and forensic log exported from LightCycler 480 .ixo / QuantStudio 3/5 .eds experiments
${new Date().toISOString()}

Runs included
${RUNS.map(r=>`  - ${r.meta.name||r.file} (${r.rows}x${r.cols}, ${r.nCycles||"?"} cycles, `
  +`${r.wells.length} results, ${uniqueCurveCount(r)} result-linked curves, ${acquiredCurveCount(r)} acquired channel/well curves, `
  +`UID ${sourceUidOf(r)||"not recorded"}, SHA-256 ${sourceSHA256Of(r)||"not recorded"}, CRC-32 ${sourceCRCOf(r)||"not recorded"})`).join("\n")}

Files
  cq_values.csv         stored crossing points (Cq / Ct), one row per result; QuantStudio flags, ΔCt, ΔΔCt, RQ
  runs_qc_forensic_log.csv   container integrity, control, flag and traceability findings
  relative_quantification.csv  stored ΔΔCt / ratio summaries, if any
  multicomponent_raw.csv  QuantStudio per-dye and per-filter signal, if any
  <run>/*_QuantStudio_export.txt   QuantStudio export layout as text (MAN0010409, chapter 3)
  <run>/*_QuantStudio_export.xlsx  the same as a workbook with the software's sheet layout
  <run>/instrument_records/*.csv  run metadata, integrity, program, channels, calibrations, log
  melting_peaks.csv     melting temperatures, if the run has a Tm analysis
  experiment_settings.csv  every setting read out of the container, with its source
  metadata.jsonld       Schema.org/DCAT dataset metadata with PROV-O/PAV provenance
  checksums.sha256      SHA-256 of every component in this open bundle
  <run>/rdml_data.xml   RDML 1.4 - rename to .rdml or zip it to open in RDML tools
  <run>/*_qpcR_curves.csv     one wide curve table per analysis, first column "Cycles"
  <run>/*.rdes.tsv            one long curve table per analysis, one row per cycle
  analyse_with_qpcR.R         fits the curves in R and compares with stored Cq
  analyse_with_linregpcr.py   runs LinRegPCR through rdmlpython

Two things worth knowing
  Keep the original .ixo / .eds alongside this open bundle. It is the provenance anchor;
  its SHA-256 is recorded above and in metadata.jsonld, but the original vendor
  container is not duplicated inside this export.

  RDML is written at version 1.4 because rdmlpython refuses to run LinRegPCR on
  anything older, and every dye is declared as its own element because it raises
  KeyError on a target whose dye is only referenced. Both were found by running
  the tool, not by reading the specification.

  The values in cq_values.csv are the instrument's own. Nothing was recomputed.
  Where this export disagrees with the instrument software, the file is the
  reference - please report it. If sample names were pseudonymised, the mapping
  is not part of this bundle.
`;
}

