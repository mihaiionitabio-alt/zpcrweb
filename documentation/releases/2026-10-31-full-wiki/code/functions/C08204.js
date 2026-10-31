function selMatch(pattern){
  const p=String(pattern||"").trim();
  if(!p)return [];
  if(p==="all"||p==="*")return selCatalogue().map(x=>x.id);
  if(p==="images")return selImageItems().map(x=>x.id);
  if(p==="data"||p==="tables")return selDataItems().map(x=>x.id);
  if(p==="cc:all")return selChartItems().map(x=>x.id);
  if(/^cc:(hardware|software|method|operator)$/i.test(p))return selChartItems().filter(x=>x.group.toLowerCase().endsWith(p.slice(3).toLowerCase())).map(x=>x.id);
  const re=new RegExp("^"+p.replace(/[.+^${}()|[\]\\]/g,"\\$&").replace(/\*/g,".*").replace(/\?/g,".")+"$","i");
  return selCatalogue().filter(x=>re.test(x.id)||re.test(x.id.replace(/^[a-z]+:/,""))).map(x=>x.id);
}