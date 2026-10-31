function mlPolyFit(x,y,degree){
  const n=x.length,p=degree+1;
  if(n<p+2)return null;
  const row=xv=>Array.from({length:p},(_,i)=>Math.pow(xv,i));
  const A=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>
    x.reduce((s,xv)=>s+Math.pow(xv,i+j),0)));
  const b=Array.from({length:p},(_,i)=>x.reduce((s,xv,k)=>s+Math.pow(xv,i)*y[k],0));
  const c=mlSolve(A,b),Ainv=mlMatInv(A);
  if(!c||!Ainv)return null;
  const fit=xv=>c.reduce((s,ci,i)=>s+ci*Math.pow(xv,i),0);
  const resid=y.map((yv,i)=>yv-fit(x[i]));
  const rss=resid.reduce((s,r)=>s+r*r,0),dof=n-p;
  if(dof<1)return null;
  const sigma=Math.sqrt(rss/dof);
  const yMean=mlMean(y),tss=y.reduce((s,v)=>s+(v-yMean)*(v-yMean),0);
  /* k = coefficients + residual variance */
  const k=p+1,aicc=n-k-1>0?n*Math.log(Math.max(rss/n,1e-300))+2*k+2*k*(k+1)/(n-k-1):Infinity;
  return {coef:c,degree,p,fit,resid,sigma,rss,aicc,r2:tss>0?1-rss/tss:NaN,n,dof,
          lev:xv=>mlQuad(row(xv),Ainv),Ainv};
}