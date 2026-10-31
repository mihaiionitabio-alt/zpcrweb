a=>
    `<button class="mg-act ${a.cls||""}" data-cmd="${esc(a.cmd)}" title="${esc(/^[0-9]$/.test(String(a.key))?"press "+a.key:a.label)}">
       <span class="k">${esc(a.key)}${/^[0-9]$/.test(String(a.key))?"  ·  key":""}</span><span class="l">${esc(a.label)}</span></button>`