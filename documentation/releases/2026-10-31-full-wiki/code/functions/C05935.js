c=>{
    const v=r[c.key]??"";
    const dis=locked?" disabled":"";
    if(c.type==="select")return `<td><select data-i="${i}" data-k="${c.key}"${dis}>${c.options.map(o=>`<option value="${esc(o)}"${String(v)===String(o)?" selected":""}>${esc(SOP_ACTION_LABEL[o]||o)}</option>`).join("")}</select></td>`;
    if(c.type==="color")return `<td><input type="color" data-i="${i}" data-k="${c.key}" value="${esc(v||"#94a3b8")}"${dis} style="width:46px;padding:0;height:28px"></td>`;
    if(c.type==="static")return `<td>${esc(v)}</td>`;
    return `<td><input type="${c.type==="number"?"number":"text"}" step="any" data-i="${i}" data-k="${c.key}" value="${esc(v)}"${dis} style="min-width:${c.w||80}px"></td>`;
  }