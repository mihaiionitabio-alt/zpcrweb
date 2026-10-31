([k,rows])=>{if(rows&&rows.length)entries.push({name:`${s}/instrument_records/${k}.csv`,
      data:toCSV(uniq(rows.flatMap(Object.keys)).map(x=>({key:x,label:x})),rows)});}