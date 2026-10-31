(name,value,kind,extra)=>{
    if(!Number.isFinite(value))return;
    out.push(Object.assign({name,value,kind},extra||{}));}