/* ============================================================
   2. Statistics
   ============================================================ */
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN;}
const avg=mean;
function sd(a){if(a.length<2)return NaN;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));}
function median(a){if(!a.length)return NaN;const s=[...a].sort((x,y)=>x-y),n=s.length,h=n>>1;return n%2?s[h]:(s[h-1]+s[h])/2;}
/* inclusive linear-interpolation percentile (spreadsheet PERCENTILE) */
function percentile(a,p){
  if(!a.length)return NaN;const s=[...a].sort((x,y)=>x-y),n=s.length;
  if(n===1)return s[0];
  const r=p*(n-1),lo=Math.floor(r),hi=Math.ceil(r);
  return lo===hi?s[lo]:s[lo]+(r-lo)*(s[hi]-s[lo]);
}
function range(a){return a.length?Math.max(...a)-Math.min(...a):NaN;}
function cv(a){const m=mean(a);return Number.isFinite(m)&&m!==0?sd(a)/Math.abs(m)*100:NaN;}

/* log-gamma (Lanczos) */
function lgamma(x){
  const g=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let xx=x,y=x,tmp=xx+5.5;tmp-=(xx+0.5)*Math.log(tmp);let ser=1.000000000190015;
  for(let j=0;j<6;j++)ser+=g[j]/++y;
  return -tmp+Math.log(2.5066282746310005*ser/xx);
}
/* continued fraction for the incomplete beta function */
function betacf(a,b,x){
  const MAXIT=300,EPS=3e-14,FPMIN=1e-300;
  const qab=a+b,qap=a+1,qam=a-1;
  let c=1,d=1-qab*x/qap;
  if(Math.abs(d)<FPMIN)d=FPMIN;
  d=1/d;let h=d;
  for(let m=1;m<=MAXIT;m++){
    const m2=2*m;
    let aa=m*(b-m)*x/((qam+m2)*(a+m2));
    d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;
    c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;
    d=1/d;h*=d*c;
    aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));
    d=1+aa*d;if(Math.abs(d)<FPMIN)d=FPMIN;
    c=1+aa/c;if(Math.abs(c)<FPMIN)c=FPMIN;
    d=1/d;const del=d*c;h*=del;
    if(Math.abs(del-1)<EPS)break;
  }
  return h;
}
function betai(a,b,x){
  if(x<=0)return 0;if(x>=1)return 1;
  const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;
}
/* two-tailed p for Student t with df */
function tDistTwoTail(t,df){
  if(!Number.isFinite(t)||!Number.isFinite(df)||df<=0)return NaN;
  return betai(df/2,0.5,df/(df+t*t));
}
/* regularised lower incomplete gamma, for chi-square */
function gammap(a,x){
  if(x<0||a<=0)return NaN;
  if(x===0)return 0;
  if(x<a+1){
    let ap=a,sum=1/a,del=sum;
    for(let n=1;n<500;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*3e-14)break;}
    return sum*Math.exp(-x+a*Math.log(x)-lgamma(a));
  }
  const FPMIN=1e-300;let b=x+1-a,c=1/FPMIN,d=1/b,h=d;
  for(let i=1;i<500;i++){
    const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<FPMIN)d=FPMIN;
    c=b+an/c;if(Math.abs(c)<FPMIN)c=FPMIN;
    d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-14)break;
  }
  return 1-Math.exp(-x+a*Math.log(x)-lgamma(a))*h;
}
function chiSqP(chi,df){if(!Number.isFinite(chi)||chi<0)return NaN;return 1-gammap(df/2,chi/2);}

/* t-tests. Returns {p,t,df,n,method} */
function tTest(xs,ys,type){
  if(type==="paired"){
    const d=[];for(let i=0;i<Math.min(xs.length,ys.length);i++){if(Number.isFinite(xs[i])&&Number.isFinite(ys[i]))d.push(xs[i]-ys[i]);}
    const n=d.length;if(n<2)return {p:NaN,t:NaN,df:NaN,n,method:"paired"};
    const s=sd(d);if(!Number.isFinite(s)||s===0)return {p:mean(d)===0?1:0,t:mean(d)===0?0:Infinity,df:n-1,n,method:"paired"};
    const t=mean(d)/(s/Math.sqrt(n));
    return {p:tDistTwoTail(t,n-1),t,df:n-1,n,method:"paired"};
  }
  const a=xs.filter(Number.isFinite),b=ys.filter(Number.isFinite);
  const n1=a.length,n2=b.length;
  if(n1<2||n2<2)return {p:NaN,t:NaN,df:NaN,n:Math.min(n1,n2),method:type};
  const m1=mean(a),m2=mean(b),v1=sd(a)**2,v2=sd(b)**2;
  let t,df;
  if(type==="equal"){
    const sp2=((n1-1)*v1+(n2-1)*v2)/(n1+n2-2);
    t=(m1-m2)/Math.sqrt(sp2*(1/n1+1/n2));df=n1+n2-2;
  }else{
    const se2=v1/n1+v2/n2;
    t=(m1-m2)/Math.sqrt(se2);
    df=se2**2/((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
  }
  if(!Number.isFinite(t))return {p:1,t:0,df,n:Math.min(n1,n2),method:type};
  return {p:tDistTwoTail(t,df),t,df,n:Math.min(n1,n2),method:type};
}
function fitLin(xs,ys){
  const n=xs.length,mx=mean(xs),my=mean(ys);let sxx=0,sxy=0,syy=0;
  for(let i=0;i<n;i++){sxx+=(xs[i]-mx)**2;sxy+=(xs[i]-mx)*(ys[i]-my);syy+=(ys[i]-my)**2;}
  if(!sxx)return {slope:0,inter:my,r2:0};
  const slope=sxy/sxx,inter=my-slope*mx;let ssr=0;
  for(let i=0;i<n;i++)ssr+=(ys[i]-(slope*xs[i]+inter))**2;
  return {slope,inter,r2:syy>0?1-ssr/syy:0};
}

