el=>{if(SOP.locked)el.disabled=true;el.onchange=()=>{
    const k=el.dataset.ccCfg;ccSetCfg(def.id,{[k]:el.type==="number"?(el.value===""?"":Number(el.value)):el.value});re();};}