function fit(points){
  if(points.length<2||points.some(p=>!(N(p.copies)>0)||!Number.isFinite(N(p.cq))))return null;
  const xs=points.map(p=>Math.log10(N(p.copies))),ys=points.map(p=>N(p.cq)),mx=avg(xs),my=avg(ys);
  const xx=xs.reduce((s,x)=>s+(x-mx)**2,0);if(!xx)return null;
  const slope=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/xx,intercept=my-slope*mx;
  const ss=ys.reduce((s,y)=>s+(y-my)**2,0),err=xs.reduce((s,x,i)=>s+(ys[i]-intercept-slope*x)**2,0);
  return {slope,intercept,r2:ss?1-err/ss:NaN,min:Math.min(...points.map(p=>N(p.copies))),max:Math.max(...points.map(p=>N(p.copies)))};
 }