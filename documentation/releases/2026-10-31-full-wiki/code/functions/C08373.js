function mlBetaI(x,a,b){
  if(!(x>0))return 0;
  if(x>=1)return 1;
  const bt=Math.exp(mlLogGamma(a+b)-mlLogGamma(a)-mlLogGamma(b)
                    +a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2)?bt*mlBetaCF(a,b,x)/a:1-bt*mlBetaCF(b,a,1-x)/b;
}