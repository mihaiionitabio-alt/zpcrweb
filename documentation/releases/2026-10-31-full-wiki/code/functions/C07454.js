it=>{
    const i=items.indexOf(it);
    return `<div class="dl"><b>${esc(it.title)}</b><span>${esc(it.note)}</span>
      <button class="ghost" data-exp="${i}">Download</button></div>`;
  }