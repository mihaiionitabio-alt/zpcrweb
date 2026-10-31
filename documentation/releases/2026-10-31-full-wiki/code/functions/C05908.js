run=>{
    const phys=new Map();
    (run.wells||[]).forEach(w=>{if(w.curve&&w.curve.length>5&&Math.max(...w.curve)>Math.min(...w.curve))phys.set(`${w.channel}|${w.pos}`,{w,h:curveHash(w.curve)});});
    phys.forEach(({w,h})=>{const k=`${w.channel}|${h}`;const prev=seen.get(k);
      if(prev){const pk=`${RUNS.indexOf(prev.run)}|${RUNS.indexOf(run)}`;if(!pairs.has(pk))pairs.set(pk,{a:prev.run,b:run,list:[]});pairs.get(pk).list.push(`${prev.w.well}=${w.well}`);}
      else seen.set(k,{run,w});});
  }