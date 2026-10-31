sc=>{
    const bad=sc.r2!=null&&sc.r2<0.98,eff=sc.efficiency;
    push(bad||(eff!=null&&(eff<90||eff>110))?"review":"info","Standard curve",
      `${sc.target}: slope ${num(sc.slope,4)}, R² ${num(sc.r2,4)}, efficiency ${num(eff,2)} % (derived from the stored slope)`,
      `y-intercept ${num(sc.yIntercept,3)}; ${sc.x?sc.x.length:0} standard points; review limits R² ≥ 0.98, efficiency 90–110 %`);
  }