function mlQuantile(a,q){a=mlFinite(a).slice().sort((x,y)=>x-y);if(!a.length)return NaN;
  const h=(a.length-1)*q,lo=Math.floor(h),hi=Math.ceil(h);
  return lo===hi?a[lo]:a[lo]+(h-lo)*(a[hi]-a[lo]);}