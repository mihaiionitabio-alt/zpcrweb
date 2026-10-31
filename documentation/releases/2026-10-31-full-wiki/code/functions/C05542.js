x=>{
      if(!stats.has(x.sample))stats.set(x.sample,{master:x.sample,wells:[],cpAvg:x.ctMean,cpSD:x.ctSd});
      stats.get(x.sample).wells.push(x.pos);}