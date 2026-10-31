function mlSd(a){a=mlFinite(a);if(a.length<2)return NaN;const m=mlMean(a);
  return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1));}