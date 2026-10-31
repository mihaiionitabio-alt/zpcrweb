function astRenderBase(){
  const box=astEl("ast-list");if(!box)return;
  const cat=selCatalogue().filter(reportItemVisible),groups=uniq(cat.map(x=>x.group));
  box.innerHTML=groups.map(g=>{
    const items=cat.filter(x=>x.group===g);
    return `<section class="ast-group"><h3>${esc(g)} <span class="ast-count">${items.length}</span>
      <button type="button" class="ghost ast-all" data-group="${esc(g)}">all</button>
      <button type="button" class="ghost ast-none" data-group="${esc(g)}">none</button></h3>
      <div class="ast-items">${items.map(x=>`<label class="ast-item${x.ready()?"":" ast-off"}">
        <input type="checkbox" data-id="${esc(x.id)}"${SEL_STATE.ids.has(x.id)?" checked":""}${x.ready()?"":" disabled"}>
        <span class="ast-title">${esc(x.title)}</span>
        <span class="ast-id" data-i18n-skip>${esc(x.id)}</span>
      </label>`).join("")}</div></section>`;
  }).join("");
  box.querySelectorAll("input[data-id]").forEach(cb=>cb.onchange=()=>{
    if(cb.checked)SEL_STATE.ids.add(cb.dataset.id);else SEL_STATE.ids.delete(cb.dataset.id);
    astCount();
  });
  box.querySelectorAll(".ast-all").forEach(b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group&&reportItemVisible(x)).forEach(x=>SEL_STATE.ids.add(x.id));astRender();});
  box.querySelectorAll(".ast-none").forEach(b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group).forEach(x=>SEL_STATE.ids.delete(x.id));astRender();});
  const runSel=astEl("ast-run");
  if(runSel){
    runSel.innerHTML='<option value="all">'+esc(ui('All loaded runs - separate figures per run'))+'</option>'+RUNS.map((r,i)=>`<option value="${i}">${esc(r.file||runName(r))}</option>`).join("");
    runSel.value=SEL_STATE.figureScope==='all'?'all':String(selRunIndex());
  }
  astEl("ast-lab").value=sopLabName();
  astEl("ast-analyst").value=sopAnalystName();
  astEl("ast-title").value=SEL_STATE.title;
  astCount();
}