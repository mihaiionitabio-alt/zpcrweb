items=>{
    if(items.length===1)return items[0];
    const out=Object.assign({},items[0]);
    out.analysis=uniq(items.map(w=>w.analysis).filter(Boolean)).join(" | ");
    out.analysisUid=uniq(items.map(w=>w.analysisUid).filter(Boolean)).join(" | ");
    out.target=uniq(items.map(w=>w.target).filter(Boolean)).join(" | ");
    out.call=uniq(items.map(w=>w.call).filter(Boolean)).join(" | ");
    out.mergedAnalysisCount=items.length;
    return out;
  }