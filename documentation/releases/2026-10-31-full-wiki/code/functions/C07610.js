(g,key)=>{
      if(!map.has(key))map.set(key,{key,sample:g.sample,category:g.category,target:g.target,
        exact:new Set(),points:[]});
      const s=map.get(key);g.exact.forEach(n=>s.exact.add(n));
      s.points.push({experiment:runName(run),date:(run.meta||{}).StartTime||(run.meta||{}).Created||"",
        tick:displayRunTick(run,ri),cq:g.values.length?mean(g.values):null,n:g.values.length,
        wells:g.wells.join(" ")});
    }