w=>{
      const automatic=controlCategory(w);if(!automatic)return;
      const mapped=sopControlSpec(w),rootName=controlProfileRoot(w,mapped)||controlRootName(w.sample||automatic),rootKey=controlRootKey(rootName),root=roots.get(rootKey);
      const category=root?root.category:automatic;if(!category||category==="ignore")return;
      const sample=grouping==="exact"?String(w.sample||category):(root?root.root:controlRootName(w.sample||category));
      const target=w.target||w.analysis||"(all)";
      const identity=grouping==="exact"?String(w.sample||category):rootKey;
      const key=`${grouping}:${identity}||${target}||${ccInstrumentKey(run)}||${ccProtocolKey(run)}`;
      if(!perRun.has(key))perRun.set(key,{sample,category,target,exact:new Set(),values:[],wells:[]});
      const g=perRun.get(key),q=Number(w.CpRaw);g.exact.add(w.sample||"");g.wells.push(w.well);
      if(Number.isFinite(q)&&q>0)g.values.push(q);
    }