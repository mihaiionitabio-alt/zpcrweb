el=>{
    const name=pv(el,"name");if(!name)return;
    const items=[...el.querySelectorAll('list[name="Items"] > prop[name="Item"]')].map(x=>parseInt(x.textContent,10)).filter(Number.isFinite);
    out.push({name,forAnalysis:pv(el,"ForAnalysis")==="1",forReport:pv(el,"ForReport")==="1",
      subsetId:pv(el,"SubsetID"),useAll:pv(el,"UseAllSamples")==="1",items});
  }