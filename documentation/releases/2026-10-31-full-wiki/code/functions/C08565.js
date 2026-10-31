nm=>{
    if(ML_LABEL_SOURCE.some(s=>nm===s||nm.indexOf(s+" · ")===0)){
      omitted.push({name:nm,why:"excluded: this is the metric the label is taken from"});return false;}
    const cov=coverage.get(nm);
    if(cov<Math.max(8,0.8*rows.length)){
      omitted.push({name:nm,why:`present on ${cov} of ${rows.length} runs (under 80 %)`});return false;}
    const col=per.map(l=>valueOf(l,nm)).filter(Number.isFinite);
    if(!((mlSd(col)||0)>1e-12)){
      omitted.push({name:nm,why:"no variation across the cohort"});return false;}
    return true;}