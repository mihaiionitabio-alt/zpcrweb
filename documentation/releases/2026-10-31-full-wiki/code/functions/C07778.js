t=>{
    const d=run.eds.analysis.detectors[t];if(d&&Number.isFinite(d.threshold))hl.push({y:d.threshold,label:`${t} threshold`,
      colour:(run.eds.exp.detectors.find(x=>x.name===t)||{}).color||"#475569"});}