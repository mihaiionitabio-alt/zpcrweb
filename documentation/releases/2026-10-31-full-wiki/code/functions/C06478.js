a=>{if(a.length<2)return -1;let ok=0;for(let i=0;i<a.length;i++){const v=a[i];
    if(isD?(Number.isFinite(v)&&v>-50&&v<200&&Math.abs(v)>1e-6):(i===0||v>=a[i-1]))ok++;}return ok/a.length;}