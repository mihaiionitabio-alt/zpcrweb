function refreshAll(){
  if(typeof overviewSync==="function")overviewSync();
  SOP_CACHE=null;invalidateAnalysisCaches();
  markDirty("load","export","review","sop","results","graphs","panel","integrity");
  renderTab(currentTab());
  if(currentTab()==="integrity")renderIntegrity();
  renderMachineMetadata();
  localizeDOM(document);
}