()=>{const rows=tmRows();download(baseName()+"_melting_peaks.csv",
      toCSV(Object.keys(rows[0]).map(k=>({key:k,label:k})),rows),"text/csv");}