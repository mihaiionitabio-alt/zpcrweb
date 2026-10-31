function mlMad(a){const m=mlMedian(a);const d=mlFinite(a).map(v=>Math.abs(v-m));
  return 1.4826*mlMedian(d);}