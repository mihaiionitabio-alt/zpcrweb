([t,d])=>({target:t,reporter:(p.exp.detectors.find(x=>x.name===t)||{}).reporter||"",
      quencher:(p.exp.detectors.find(x=>x.name===t)||{}).quencher||"",threshold:d.threshold,automatic_threshold:d.autoCt,
      automatic_baseline:d.autoBaseline,baseline_start:d.bStart,baseline_end:d.bStop,confidence:d.confidence})