p=>out.push({experiment:runName(p.b),severity:"error",area:"Copied data",
    finding:p.a===p.b?`${p.list.length} well pair(s) carry identical fluorescence curves`:`${p.list.length} curve(s) are identical to curves in another run`,
    evidence:(p.a===p.b?"":`${runName(p.a)} ↔ ${runName(p.b)}: `)+p.list.slice(0,12).join(", ")+(p.list.length>12?" …":"")})