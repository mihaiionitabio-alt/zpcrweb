()=>{
    const r=Object.assign({},ccCfg(def.id).rules,{[el.dataset.ccRule]:el.checked});ccSetCfg(def.id,{rules:r});re();}