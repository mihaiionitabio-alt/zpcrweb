(a,b)=>{
    const sa=a.severity==="error"?0:1,sb=b.severity==="error"?0:1;return sa-sb||String(a.experiment).localeCompare(String(b.experiment))||String(a.well).localeCompare(String(b.well));
  }