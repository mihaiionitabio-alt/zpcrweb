(list,i)=>{
    const v=keep.map(nm=>valueOf(list,nm));
    if(v.every(Number.isFinite)){idx.push(i);X.push(v);}
    else dropped.push({run:rows[i].run,missing:keep.filter((nm,j)=>!Number.isFinite(v[j]))});
  }