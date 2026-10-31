el=>{el.onchange=()=>{
    const c=cols.find(x=>x.key===el.dataset.k),r=rows[Number(el.dataset.i)];
    r[c.key]=c.type==="number"?(el.value===""?"":Number(el.value)):el.value;sopProfileEdited();};}