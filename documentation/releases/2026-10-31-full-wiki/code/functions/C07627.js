a=>(a.quantStats||[]).forEach(q=>statistics.push({analysis:a.name,
    sample:q.master,wells:q.sampleIds,n:q.count,cq_mean:q.cpAvg,cq_sd:q.cpSD,
    concentration_mean:q.concAvg,concentration_sd:q.concSD,method:q.method}))