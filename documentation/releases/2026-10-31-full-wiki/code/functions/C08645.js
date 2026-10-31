function mlAdvisoryHtml(res){
  if(!res)return "";
  const token="ml"+(++ML_PANEL_N);
  /* capture the settings the panel will be computed under, so that opening it
     later cannot silently pick up a different instrument or protocol filter */
  ML_PANELS.set(token,{res,instrument:CC_STATE.instrument,protocol:CC_STATE.protocol||"",
    variant:CC_STATE.variant||""});
  /* keep the registry small: a long session opens many charts */
  if(ML_PANELS.size>8)ML_PANELS.delete(ML_PANELS.keys().next().value);
  return `<details class="sop-sec" id="cc-ml" data-ml="${token}">
    <summary>${esc(ui("Advisory analytics — learned from this instrument's own history"))}</summary>
    <div class="toolbar"><button class="ghost" data-ml-recompute="${token}" type="button">${esc(ui("Recompute"))}</button>
      <span class="hint">${esc(ui("Computed when this section is opened. Set ML_TRACE = true in the browser console and press Recompute to report every fit's progress, objective and convergence to the console; the figures and numbers are identical with the trace on or off."))}</span></div>
    <div data-ml-body="${token}"><p class="hint">${esc(ui("Computed when this section is opened."))}</p></div></details>`;
}