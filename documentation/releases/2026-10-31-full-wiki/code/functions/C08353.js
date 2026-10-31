function mlMedian(a){a=mlFinite(a).slice().sort((x,y)=>x-y);if(!a.length)return NaN;
  const h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2;}