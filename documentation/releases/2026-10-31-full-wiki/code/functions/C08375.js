function mlTinv(p,dof){
  if(!(dof>0))return NaN;
  if(p<=0||p>=1)return NaN;
  let lo=-1e3,hi=1e3;
  for(let i=0;i<200;i++){const mid=(lo+hi)/2;
    if(mlTcdf(mid,dof)<p)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}