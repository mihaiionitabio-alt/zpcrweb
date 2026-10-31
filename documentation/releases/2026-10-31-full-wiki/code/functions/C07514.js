g=>({
    experiment:g.experiment,analysis:g.analysis,target:g.target,sample:g.sample,
    wells:g.wells.join(" "),n:g.cq.length,mean:mean(g.cq),sd:sd(g.cq),range:range(g.cq),
    finding:`Replicate range ≥ ${limit} Cq`
  })