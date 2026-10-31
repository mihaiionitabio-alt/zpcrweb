el=>{const prev=el.onchange;el.onchange=()=>{
    const r=orows[Number(el.dataset.i)];r[el.dataset.k]=el.value;SOP.outcomes[r.outcome][el.dataset.k]=el.value;sopProfileEdited();};}