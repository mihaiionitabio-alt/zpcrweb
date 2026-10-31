w=>{const key=ssKey(run,w);let r=map.get(key);if(!r){r={key,ri,date,experiment:runName(run),sample:ssName(run,w),wells:new Set(),targets:new Set(),roles:new Set()};map.set(key,r);}
      if(w.well||Number.isFinite(Number(w.pos)))r.wells.add(w.well||posToWell(Number(w.pos),run.cols));
      if(w.target||w.analysis)r.targets.add(w.target||w.analysis);if(w.role)r.roles.add(w.role);}