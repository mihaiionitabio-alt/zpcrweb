g=>{
    const items=cat.filter(x=>x.group===g);
    return `<section class="ast-group"><h3>${esc(g)} <span class="ast-count">${items.length}</span>
      <button type="button" class="ghost ast-all" data-group="${esc(g)}">all</button>
      <button type="button" class="ghost ast-none" data-group="${esc(g)}">none</button></h3>
      <div class="ast-items">${items.map(x=>`<label class="ast-item${x.ready()?"":" ast-off"}">
        <input type="checkbox" data-id="${esc(x.id)}"${SEL_STATE.ids.has(x.id)?" checked":""}${x.ready()?"":" disabled"}>
        <span class="ast-title">${esc(x.title)}</span>
        <span class="ast-id" data-i18n-skip>${esc(x.id)}</span>
      </label>`).join("")}</div></section>`;
  }