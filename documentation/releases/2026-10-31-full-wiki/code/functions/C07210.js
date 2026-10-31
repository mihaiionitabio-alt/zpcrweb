b=>{
    const on=b.dataset.tab===MG.scope;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");}