(a,i)=>({from:a,to:bounds[i+1],
      mean:mlMean(y.slice(a,bounds[i+1])),level:mlMedian(y.slice(a,bounds[i+1]))})