o=>mv.F.keys.map((k,j)=>({k,z:Math.abs((mv.F.X[o.i][j]-p.mean[j])/(p.sd[j]||1))}))
    .sort((a,b)=>b.z-a.z).slice(0,3).map(c=>`${c.k} (${mlNum(c.z,2)} σ)`).join(", ")