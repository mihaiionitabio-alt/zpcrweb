function compare(ddct,lo=-.4,hi=.4){
  // Decimal Ct arithmetic can leave a few ulps at an inclusive boundary.
  const tol=1e-12*Math.max(1,Math.abs(ddct));
  return ddct<lo-tol?'higher':ddct>hi+tol?'lower':'quantification required';
 }