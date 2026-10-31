function cmdStatusLine(){
  return `files ${RUNS.length} · results ${RUNS.reduce((a,r)=>a+((r.wells||[]).length),0)} · selected ${SEL_STATE.ids.size} · profile ${SOP.name} v${SOP.version}`;
}