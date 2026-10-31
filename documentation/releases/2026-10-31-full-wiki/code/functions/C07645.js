(run,i)=>{
    const tables=instrumentRecordTables(run);
    Object.entries(tables).forEach(([name,rows])=>entries.push({name:`review/instrument_${String(i+1).padStart(3,"0")}/${safeName(name)}.csv`,data:csv(rows)}));
  }