list=>{
    const bounds=[0].concat(list.map(c=>c.index),[n]);
    return bounds.slice(0,-1).map((a,i)=>({from:a,to:bounds[i+1],
      mean:mlMean(y.slice(a,bounds[i+1])),level:mlMedian(y.slice(a,bounds[i+1]))}));
  }