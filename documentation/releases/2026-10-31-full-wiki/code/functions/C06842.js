d=>{
    const vs=ccVariants(d,rows),variant=vs[0]||"",res=ccCompute(d,rows,variant),st=ccStatus(res);return {d,res,st,variant,enabled:ccCfg(d.id).enabled!==false};}