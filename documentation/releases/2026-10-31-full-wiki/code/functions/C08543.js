g=>({type:"line",colour:"#7c3aed",width:2,
        data:[[S.x[g.from],g.level],[S.x[Math.max(g.from,g.to-1)],g.level]],
        tip:ui("segment median")+" "+mlNum(g.level)})