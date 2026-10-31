b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group).forEach(x=>SEL_STATE.ids.delete(x.id));astRender();}