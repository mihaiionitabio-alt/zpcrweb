function selSelectedBase(){
  const ids=SEL_STATE.ids;
  return selCatalogue().filter(x=>ids.has(x.id)&&reportItemVisible(x)).flatMap(reportExpandItem);
}