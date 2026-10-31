r=>{const list=mlFeatureRows(r);
    const v=Ftr.keys.map(nm=>{const f=list.find(q=>q.name===nm);return f?f.value:NaN;});
    if(v.every(Number.isFinite)){Xte.push(v);keep.push(r);}}