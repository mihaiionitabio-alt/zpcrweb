(g,j)=>{const ds=g.map(r=>r.date).filter(Number.isFinite).sort((a,b)=>a-b);
        return {g:j+1,n:g.length,span:ds.length?`${sopFmtTime(ds[0]).slice(0,10)} → ${sopFmtTime(ds[ds.length-1]).slice(0,10)}`:"—",
          find:g.filter(r=>(((r.m||{}).findings||{}).count>0)).length,
          inst:uniq(g.map(r=>`${r.firmware||"—"} / ${r.software||"—"}`)).slice(0,3).join("; ")};}