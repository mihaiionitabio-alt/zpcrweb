s=>({name:s.name,id:s.id,for_analysis:s.forAnalysis,
    for_report:s.forReport,use_all_samples:s.useAll,positions:(s.items||[]).map(p=>posToWell(p,run.cols)).join(" ")})