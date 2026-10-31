run=>(run.wells||[]).forEach(w=>{
    const automatic=controlCategory(w);if(!automatic)return;
    const mapped=sopControlSpec(w),root=controlProfileRoot(w,mapped)||controlRootName(w.sample||automatic),key=controlRootKey(root);if(!key)return;
    if(!roots.has(key))roots.set(key,{key,root,variants:new Set(),counts:new Map()});
    const r=roots.get(key);r.variants.add(String(w.sample||root));
    r.counts.set(automatic,(r.counts.get(automatic)||0)+1);
  })