function mlWeightedDraw(w,u){
  const sum=w.reduce((a,b)=>a+b,0);
  if(!(sum>0))return 0;
  let r=u*sum;
  for(let i=0;i<w.length-1;i++){
    if(r<w[i])return i;
    r-=w[i];
  }
  return w.length-1;
}