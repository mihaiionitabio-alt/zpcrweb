w=>{const sg=r.mc.signal[w.i]||{},o={"Well":w.i+1,"Well Position":"      "+w.pos,"Cycle":c+1};
    Object.keys(sg).forEach(d=>o[d]=sg[d][c]);mcRows.push(o);}