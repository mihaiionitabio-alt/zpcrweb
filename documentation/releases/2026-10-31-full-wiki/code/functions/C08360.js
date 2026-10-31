function mlRng(seed){let s=(seed|0)||123456789;
  return function(){s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)/4294967296);};}