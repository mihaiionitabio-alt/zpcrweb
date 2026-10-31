r=>{
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
  }