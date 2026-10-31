()=>{
      const rows=allWellRows();
      const cols=Object.keys(rows[0]||{cq:1}).map(k=>({key:k,label:k}));
      download(baseName()+"_cq_values.csv",toCSV(cols,rows),"text/csv");
    }