w=>{
    const key=w.analysisUid||w.analysis||w.target||"";
    if(!key||seen.has(key))return;seen.add(key);
    out.push({value:key,label:`${w.target||"(no target)"} — ${w.analysis||"analysis"}`});
  }