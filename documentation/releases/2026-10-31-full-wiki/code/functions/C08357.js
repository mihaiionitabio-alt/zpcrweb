function mlDiffScale(a){const d=[];for(let i=1;i<a.length;i++)
    if(Number.isFinite(a[i])&&Number.isFinite(a[i-1]))d.push(Math.abs(a[i]-a[i-1]));
  if(!d.length)return NaN;return 1.4826*mlMedian(d)/Math.SQRT2;}