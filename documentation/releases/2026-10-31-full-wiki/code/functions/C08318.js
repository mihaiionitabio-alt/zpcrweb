b=>b.onclick=()=>{
    selCatalogue().filter(x=>x.group===b.dataset.group&&reportItemVisible(x)).forEach(x=>SEL_STATE.ids.add(x.id));astRender();}