(o,i)=>
    `<button data-i="${i}" class="${o.current?"current":""}">
       <span class="k">${i+1} · select${o.current?" · in use":""}</span>
       <span class="l">${esc(o.label)}</span></button>`