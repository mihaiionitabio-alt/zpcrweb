function mlTcdf(t,dof){
  if(!(dof>0)||!Number.isFinite(t))return NaN;
  const x=dof/(dof+t*t),p=0.5*mlBetaI(x,dof/2,0.5);
  return t>0?1-p:p;
}