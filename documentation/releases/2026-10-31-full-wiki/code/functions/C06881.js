el=>{if(SOP.locked)el.disabled=true;el.onchange=()=>{
    const r=Object.assign({},ccCfg(def.id).rules,{[el.dataset.ccRule]:el.checked});ccSetCfg(def.id,{rules:r});re();};}