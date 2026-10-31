function mlTimeSplit(n,frac){const cut=Math.floor(n*(frac||0.7));
  return {cut,trainable:cut>=8&&n-cut>=4};}