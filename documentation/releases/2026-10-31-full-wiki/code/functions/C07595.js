(r)=>{
    const values=uniq([r.automaticCategory,...CONTROL_CATEGORY_OPTIONS]);
    return `<option value="auto"${r.override?"":" selected"}>${esc(ui(`Automatic — ${r.automaticCategory}`))}</option>`
      +values.map(v=>`<option value="${esc(v)}"${r.override===v?" selected":""}>${esc(ui(v))}</option>`).join("")
      +`<option value="ignore"${r.override==="ignore"?" selected":""}>${esc(ui("Ignore / not a control"))}</option>`;
  }