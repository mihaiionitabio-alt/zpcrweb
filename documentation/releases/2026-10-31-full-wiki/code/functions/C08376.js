function mlGammaP(a,x){
  if(x<0||a<=0)return NaN;
  if(x===0)return 0;
  if(x<a+1){                       /* series */
    let ap=a,sum=1/a,del=sum;
    for(let n=1;n<=500;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-15)break;}
    return sum*Math.exp(-x+a*Math.log(x)-mlLogGamma(a));
  }
  const tiny=1e-300;              /* continued fraction for the upper tail */
  let b=x+1-a,c=1/tiny,d=1/b,h=d;
  for(let i=1;i<=500;i++){
    const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<tiny)d=tiny;
    c=b+an/c;if(Math.abs(c)<tiny)c=tiny;d=1/d;const del=d*c;h*=del;
    if(Math.abs(del-1)<1e-15)break;
  }
  return 1-Math.exp(-x+a*Math.log(x)-mlLogGamma(a))*h;
}