(run,ri)=>{const map=new Map(),T=runTimes(run),date=Number.isFinite(T.start)?sopFmtTime(T.start).slice(0,10):"Date not recorded";
    const add=w=>{const key=ssKey(run,w);let r=map.get(key);if(!r){r={key,ri,date,experiment:runName(run),sample:ssName(run,w),wells:new Set(),targets:new Set(),roles:new Set()};map.set(key,r);}
      if(w.well||Number.isFinite(Number(w.pos)))r.wells.add(w.well||posToWell(Number(w.pos),run.cols));
      if(w.target||w.analysis)r.targets.add(w.target||w.analysis);if(w.role)r.roles.add(w.role);};
    [...(run.wells||[]),...(run.tmWells||[]),...(run.genoResults||[]),...(run.rqResults||[]),...(run.otherResults||[])].forEach(add);
    Object.entries(run.plate||{}).forEach(([pos,rec])=>{if(rec.name&&!((run.wells||[]).some(w=>Number(w.pos)===Number(pos))))add({pos:Number(pos),sample:rec.name});});
    out.push(...[...map.values()].map(r=>({...r,wells:[...r.wells],targets:[...r.targets],roles:[...r.roles]})));}