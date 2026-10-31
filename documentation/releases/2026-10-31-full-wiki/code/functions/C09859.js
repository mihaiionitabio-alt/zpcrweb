function uncertainty(mean,u0,ur,k=2){
  if(![mean,u0,ur,k].every(Number.isFinite)||mean<0||u0<0||ur<0||k<=0)return null;
  const rawU=k*Math.hypot(u0,ur*mean);if(!(rawU>0))return null;
  const U=Number(rawU.toPrecision(2)),place=Math.floor(Math.log10(U))-1,step=10**place;
  const rounded=Math.round((mean+Number.EPSILON)*1/step)*step;
  const format=x=>place<0?x.toFixed(Math.min(15,-place)):x.toFixed(0);
  return {u:Math.hypot(u0,ur*mean),rawU,U,rounded,place,text:format(rounded)+' ± '+format(U)+' %'};
 }