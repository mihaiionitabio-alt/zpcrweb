x=>`<label class="ast-item${x.ready()?"":" ast-off"}">
        <input type="checkbox" data-id="${esc(x.id)}"${SEL_STATE.ids.has(x.id)?" checked":""}${x.ready()?"":" disabled"}>
        <span class="ast-title">${esc(x.title)}</span>
        <span class="ast-id" data-i18n-skip>${esc(x.id)}</span>
      </label>`