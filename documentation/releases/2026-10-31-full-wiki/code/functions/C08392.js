function mlIndependence(resid){
  const n=resid.length;
  if(n<12)return {n,ok:null,why:"too few residuals to test"};
  const m=mlMean(resid),dev=resid.map(v=>v-m);
  const c0=dev.reduce((s,v)=>s+v*v,0);
  if(!(c0>0))return {n,ok:null,why:"residuals are identical"};
  const h=Math.max(1,Math.min(10,Math.floor(n/5)));
  const r=[];
  for(let k=1;k<=h;k++){let s=0;for(let i=k;i<n;i++)s+=dev[i]*dev[i-k];r.push(s/c0);}
  const Q=n*(n+2)*r.reduce((s,rk,i)=>s+rk*rk/(n-(i+1)),0);
  const p=mlChi2Upper(Q,h);
  return {n,r1:r[0],lags:h,Q,df:h,p,ok:p>=0.05,
          se:1/Math.sqrt(n),why:p>=0.05?"":"residuals are autocorrelated"};
}