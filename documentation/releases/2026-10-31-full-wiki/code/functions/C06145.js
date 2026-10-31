function ssBind(){
  ["#ss-names-enable","#ss-names-scope","#ss-names-sensitivity","#ss-names-filter"].forEach(id=>$(id).onchange=()=>{if(!$("#ss-names-enable").checked&&$("#ss-group").value==="namePattern")$("#ss-group").value="experiment";SAMPLE_SELECTION.page=0;ssRender();});
  $("#ss-names-unusual").onclick=()=>{$("#ss-names-enable").checked=true;$("#ss-group").value="namePattern";$("#ss-names-filter").value="unusual";$("#ss-view").value="all";SAMPLE_SELECTION.page=0;ssRender();};
  $("#ss-edit").onclick=()=>ssOpen(false);
  $("#ss-enable").onchange=e=>{if(e.target.checked&&RUNS.length)ssOpen(false);else if(!e.target.checked){ssReset();SOP_CACHE=null;invalidateAnalysisCaches();refreshAll();}};
  let timer;$("#ss-search").oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{SAMPLE_SELECTION.page=0;ssRender();},120);};
  ["#ss-group","#ss-view"].forEach(id=>$(id).onchange=()=>{if($("#ss-group").value==="namePattern")$("#ss-names-enable").checked=true;SAMPLE_SELECTION.page=0;ssRender();});
  $("#ss-select").onclick=()=>{ssFiltered().forEach(r=>SAMPLE_SELECTION.draft.delete(r.key));ssRender();};
  $("#ss-unselect").onclick=()=>{ssFiltered().forEach(r=>SAMPLE_SELECTION.draft.add(r.key));ssRender();};
  $("#ss-prev").onclick=()=>{SAMPLE_SELECTION.page--;ssRender();};$("#ss-next").onclick=()=>{SAMPLE_SELECTION.page++;ssRender();};
  $("#ss-apply").onclick=ssApply;$("#ss-cancel").onclick=()=>{$("#ss-review").hidden=true;SAMPLE_SELECTION.draft=new Set(SAMPLE_SELECTION.excluded);ssUpdateBadge();};
  $("#ss-manifest").onclick=()=>{ssBuildRows();download("sample_selection.csv",csvOf(ssManifest()),"text/csv");};
}