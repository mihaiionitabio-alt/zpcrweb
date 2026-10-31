(_,i)=>{const o=[rob[i],local[i]].filter(Number.isFinite);
    return o.length?Math.max(...o):NaN;}