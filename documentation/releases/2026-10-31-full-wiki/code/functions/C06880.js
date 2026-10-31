()=>{
    const k=el.dataset.ccCfg;ccSetCfg(def.id,{[k]:el.type==="number"?(el.value===""?"":Number(el.value)):el.value});re();}