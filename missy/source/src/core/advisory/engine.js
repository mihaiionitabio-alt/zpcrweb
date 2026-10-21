/* ============================================================================
   Advisory analytics for the control charts — learning from the run history.
   Revision 2, 12 October 2026, after independent review.

   Design rules, in order of importance:

   1. The page stays one offline file. No CDN, no TensorFlow.js, no Chart.js:
      a model that needs a download is a model that is absent on a laboratory
      PC with no network, which is where this page is used. Everything below is
      closed form or a few hundred iterations of plain arithmetic.
   2. It is advisory. Nothing here changes a control limit, a Westgard or
      Western Electric flag, a stored Cq, an SOP verdict or an export byte, and
      nothing here writes to any object the page owns. It reads and reports.
   3. It is deterministic. Seeded generator, fixed iteration counts, no wall
      clock, no early stopping. The same runs give the same output.
   4. It says what it is. A quantity that is not calibrated is not labelled as
      if it were: a rank is called a rank, a retrospective percentile is called
      a retrospective percentile, and an interval whose assumptions fail is
      withheld rather than drawn.

   Rule 4 is the whole of revision 2. The review that prompted it found that
   the forecast compared a raw value against limits belonging to a smoothed
   statistic, that the prediction interval used linear leverage for a quadratic
   fit, that the change-point table could contradict its own figure, and that
   an uncalibrated score was presented in standard-deviation units. Each of
   those is corrected below, and the test suite now carries reference values
   from closed-form mathematics rather than only self-consistency checks.
   ========================================================================== */

/* ---------- optional trace --------------------------------------------- */
/* The fitting here has no epochs and no callbacks: the fits are closed form or
   a fixed number of deterministic iterations. When something needs watching,
   set ML_TRACE = true in the developer console and press Recompute on the
   panel. The switch writes to the console and nothing else. */
let ML_TRACE=false;
function mlTrace(){if(ML_TRACE)console.log.apply(console,["[advisory]"].concat([].slice.call(arguments)));}

/* ---------- small numerics -------------------------------------------- */
function mlFinite(a){return a.filter(Number.isFinite);}
function mlMean(a){a=mlFinite(a);return a.length?a.reduce((x,y)=>x+y,0)/a.length:NaN;}
function mlSd(a){a=mlFinite(a);if(a.length<2)return NaN;const m=mlMean(a);
  return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1));}
function mlMedian(a){a=mlFinite(a).slice().sort((x,y)=>x-y);if(!a.length)return NaN;
  const h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2;}
/* Median absolute deviation, scaled so that it estimates the standard
   deviation of normal data. Robust scale matters here: one bad run should not
   widen the band that is supposed to catch the next bad run. */
function mlMad(a){const m=mlMedian(a);const d=mlFinite(a).map(v=>Math.abs(v-m));
  return 1.4826*mlMedian(d);}
/* Scale estimated from successive differences. Unlike the MAD of the values it
   is not inflated by a level shift, which is what makes it the right scale for
   a change-point penalty. */
function mlDiffScale(a){const d=[];for(let i=1;i<a.length;i++)
    if(Number.isFinite(a[i])&&Number.isFinite(a[i-1]))d.push(Math.abs(a[i]-a[i-1]));
  if(!d.length)return NaN;return 1.4826*mlMedian(d)/Math.SQRT2;}
function mlQuantile(a,q){a=mlFinite(a).slice().sort((x,y)=>x-y);if(!a.length)return NaN;
  const h=(a.length-1)*q,lo=Math.floor(h),hi=Math.ceil(h);
  return lo===hi?a[lo]:a[lo]+(h-lo)*(a[hi]-a[lo]);}
/* xorshift32: a seeded generator, so every run of the page gives the same
   numbers. Math.random would make the output of a QC document unrepeatable. */
function mlRng(seed){let s=(seed|0)||123456789;
  return function(){s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)/4294967296);};}
/* A 32-bit content fingerprint (FNV-1a). Used only to key a cache on the data
   it was computed from, so a different history of the same length cannot be
   served a stale result. */
function mlHash32(str){let h=0x811c9dc5;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return (h>>>0).toString(16).padStart(8,"0");}

/* ---------- linear algebra --------------------------------------------- */
/* Gauss-Jordan with partial pivoting. Small systems only (p of 2 or 3 for the
   fits, p of at most a few tens for the correlation matrix). */
function mlSolve(A,b){
  const n=A.length,M=A.map((r,i)=>r.concat([b[i]]));
  for(let i=0;i<n;i++){
    let piv=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[piv][i]))piv=r;
    if(Math.abs(M[piv][i])<1e-14)return null;
    [M[i],M[piv]]=[M[piv],M[i]];
    for(let r=0;r<n;r++){if(r===i)continue;const f=M[r][i]/M[i][i];
      for(let c=i;c<=n;c++)M[r][c]-=f*M[i][c];}
  }
  return M.map((r,i)=>r[n]/r[i]);
}
function mlMatInv(A){
  const n=A.length,M=A.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>i===j?1:0)));
  for(let i=0;i<n;i++){
    let piv=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[piv][i]))piv=r;
    if(Math.abs(M[piv][i])<1e-14)return null;
    [M[i],M[piv]]=[M[piv],M[i]];
    const d=M[i][i];for(let c=0;c<2*n;c++)M[i][c]/=d;
    for(let r=0;r<n;r++){if(r===i)continue;const f=M[r][i];
      if(!f)continue;for(let c=0;c<2*n;c++)M[r][c]-=f*M[i][c];}
  }
  return M.map(r=>r.slice(n));
}
function mlQuad(v,Ainv){/* v' Ainv v */
  let s=0;for(let i=0;i<v.length;i++)for(let j=0;j<v.length;j++)s+=v[i]*Ainv[i][j]*v[j];
  return s;}

/* ---------- distributions ----------------------------------------------
   Needed because the review was right that a normal quantile and an invented
   small-sample factor are not a prediction interval. The functions below are
   the standard series and continued-fraction forms; the test suite checks them
   against published values. */
function mlLogGamma(x){
  const c=[76.18009172947146,-86.50532032941677,24.01409824083091,
           -1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5];
  let y=x,t=x+5.5;t-=(x+0.5)*Math.log(t);let s=1.000000000190015;
  for(let j=0;j<6;j++)s+=c[j]/++y;
  return -t+Math.log(2.5066282746310005*s/x);
}
/* Regularised incomplete beta I_x(a,b). The continued fraction is evaluated by
   the modified Lentz method, two terms per step, which is the form that
   converges for both branches; the symmetry relation is used when x is above
   the switch point so the fraction is always in its convergent region. */
function mlBetaCF(a,b,x){
  const MAXIT=300,EPS=3e-16,FPMIN=1e-300;
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
    d=1/d;
    const del=d*c;h*=del;
    if(Math.abs(del-1)<EPS)break;
  }
  return h;
}
function mlBetaI(x,a,b){
  if(!(x>0))return 0;
  if(x>=1)return 1;
  const bt=Math.exp(mlLogGamma(a+b)-mlLogGamma(a)-mlLogGamma(b)
                    +a*Math.log(x)+b*Math.log(1-x));
  return x<(a+1)/(a+b+2)?bt*mlBetaCF(a,b,x)/a:1-bt*mlBetaCF(b,a,1-x)/b;
}
/* Two-sided Student-t CDF pieces, and the quantile by bisection: fewer than 60
   halvings reach 1e-10, and bisection cannot diverge, which matters more here
   than speed. */
function mlTcdf(t,dof){
  if(!(dof>0)||!Number.isFinite(t))return NaN;
  const x=dof/(dof+t*t),p=0.5*mlBetaI(x,dof/2,0.5);
  return t>0?1-p:p;
}
function mlTinv(p,dof){
  if(!(dof>0))return NaN;
  if(p<=0||p>=1)return NaN;
  let lo=-1e3,hi=1e3;
  for(let i=0;i<200;i++){const mid=(lo+hi)/2;
    if(mlTcdf(mid,dof)<p)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
/* Lower regularised incomplete gamma, for the chi-square tail. */
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
function mlChi2Upper(x,k){if(!(k>0)||!(x>=0))return NaN;return 1-mlGammaP(k/2,x/2);}

/* ---------- A. trend and forecast ---------------------------------------
   A polynomial fit with a prediction interval. Three things the review
   corrected are visible here:
     - the leverage is v'(X'X)^-1 v on the design actually selected, not the
       intercept-and-slope formula, which understates a quadratic interval;
     - the quantile is Student-t at the residual degrees of freedom, replacing
       a normal quantile and an invented small-sample widening factor;
     - the AICc parameter count includes the residual variance, which is an
       estimated parameter of the Gaussian model being compared.
   The interval is a prediction interval for one future observation under an
   independent Gaussian model. When the residuals fail an independence check it
   is withheld rather than drawn, because under positive autocorrelation it is
   too narrow and no honest correction is available from this data alone. */
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
/* Lag-1 autocorrelation and the Ljung-Box portmanteau statistic on the fitted
   residuals. Degrees of freedom are taken as the number of lags tested: the
   residuals come from a regression, not from a fitted ARMA, so no ARMA order
   is subtracted. This is a screen, not a model. */
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
function mlForecast(x,y,ahead,opts){
  const o=opts||{};
  const ok=x.map((v,i)=>[v,y[i]]).filter(q=>Number.isFinite(q[0])&&Number.isFinite(q[1]));
  if(ok.length<8)return null;
  const xs=ok.map(q=>q[0]),ys=ok.map(q=>q[1]);
  /* scale to [0,1]: the page's x axis can be a cycle counter in the tens of
     thousands, and its square ruins the conditioning of the normal equations */
  const x0=xs[0],sx=(xs[xs.length-1]-x0)||1;
  const xn=xs.map(v=>(v-x0)/sx);
  const cands=[mlPolyFit(xn,ys,1)];
  if(ok.length>=12)cands.push(mlPolyFit(xn,ys,2));
  const fits=cands.filter(Boolean).sort((a,b)=>a.degree-b.degree);
  if(!fits.length)return null;
  /* Parsimony with a stated rule. Minimum AICc alone flips between a line and
     a curve on differences of a few tenths, which is noise, and the panel would
     then announce curvature that the data does not establish. The simpler model
     is kept unless a richer one improves AICc by at least 2 -- the conventional
     threshold for "better supported" -- and the margin is reported. */
  const MARGIN=2;
  let m=fits[0];
  for(let i=1;i<fits.length;i++)if(fits[i].aicc<=m.aicc-MARGIN)m=fits[i];
  const margin=fits.length>1?Math.min(...fits.filter(f=>f!==m).map(f=>f.aicc))-m.aicc:NaN;
  const name=f=>f.degree===1?"linear":"quadratic";
  mlTrace(`forecast on ${ok.length} runs · candidates `
    +fits.map(f=>`${name(f)} AICc ${f.aicc.toFixed(3)} R² ${Number.isFinite(f.r2)?f.r2.toFixed(4):"—"}`).join(" · ")
    +` → chose ${name(m)} (simplest unless AICc improves by ${MARGIN}), residual spread ${m.sigma.toExponential(3)}, ${m.dof} dof`);
  const ind=mlIndependence(m.resid);
  mlTrace(`  independence screen · lag-1 r ${Number.isFinite(ind.r1)?ind.r1.toFixed(4):"—"}`
    +` · Ljung-Box Q ${Number.isFinite(ind.Q)?ind.Q.toFixed(3):"—"} on ${ind.lags||0} lags`
    +` · p ${Number.isFinite(ind.p)?ind.p.toFixed(4):"—"} → ${ind.ok===null?"not tested":ind.ok?"no evidence against independence":"AUTOCORRELATED, interval withheld"}`);
  /* future spacing: the median step of the observed x, stated to the reader,
     because five runs ahead on a date or hour axis assumes future spacing */
  const d=[];for(let i=1;i<xn.length;i++)d.push(xn[i]-xn[i-1]);
  const step=mlMedian(d)||1/Math.max(1,xn.length-1);
  const tq=mlTinv(0.975,m.dof);
  const pts=[];
  for(let k=1;k<=(ahead||5);k++){
    const xf=xn[xn.length-1]+k*step;
    const se=m.sigma*Math.sqrt(1+m.lev(xf));
    const half=tq*se;
    pts.push({x:x0+xf*sx,y:m.fit(xf),lo:m.fit(xf)-half,hi:m.fit(xf)+half,se,half});
  }
  return {model:name(m),degree:m.degree,r2:m.r2,sigma:m.sigma,n:m.n,dof:m.dof,
          aicc:fits.map(f=>({model:name(f),aicc:f.aicc,r2:f.r2})),
          selectionMargin:margin,selectionRule:`simplest model unless AICc improves by ${MARGIN}`,
          tQuantile:tq,independence:ind,intervalReliable:ind.ok!==false,
          stepX:step*sx,points:pts,inSample:xn.map(v=>({x:x0+v*sx,y:m.fit(v)})),
          unitKind:o.unitKind||""};
}
/* Does the fitted curve cross a limit within the horizon? The caller decides
   whether a crossing statement is meaningful at all — see the chart-scope
   rules in the panel: it is not, for a statistic the limits do not belong to. */
function mlCrossing(forecast,ucl,lcl){
  if(!forecast)return null;
  for(const p of forecast.points){
    if(Number.isFinite(ucl)&&p.y>ucl)return {x:p.x,limit:ucl,side:"upper"};
    if(Number.isFinite(lcl)&&p.y<lcl)return {x:p.x,limit:lcl,side:"lower"};
  }
  return null;
}

/* ---------- B. change points -------------------------------------------
   Binary segmentation on the mean. The objective is the residual sum of
   squares; a split is kept when its reduction exceeds 2 log(n) s², with s
   estimated from successive differences so that the level shift being detected
   does not inflate the scale that is supposed to judge it. This is an
   exploratory heuristic with the shape of a Schwarz penalty, not a test with a
   calibrated error rate, and the panel says so.

   The means reported for each change point are recomputed from the FINAL
   segmentation, not from the segment that existed when the split was made:
   with three levels the greedy first split sees 0 against the average of 10
   and 20, and reporting that would contradict the figure beside it. */
function mlChangepoints(y,maxPoints){
  const n=y.length;
  const fin=mlFinite(y);
  const out={points:[],segments:[],penalty:NaN,scale:NaN,scaleKind:"none",n,minStep:NaN};
  if(n<12||fin.length<12)return out;
  const cost=(a,b)=>{const sl=y.slice(a,b),m=mlMean(sl);
    return sl.reduce((t,v)=>t+(v-m)*(v-m),0);};
  const describe=list=>{
    const bounds=[0].concat(list.map(c=>c.index),[n]);
    return bounds.slice(0,-1).map((a,i)=>({from:a,to:bounds[i+1],
      mean:mlMean(y.slice(a,bounds[i+1])),level:mlMedian(y.slice(a,bounds[i+1]))}));
  };
  /* one greedy pass at a given penalty */
  const greedy=penalty=>{
    const cuts=[],segments=[[0,n]];
    for(let round=0;round<(maxPoints||3);round++){
      let best=null;
      for(const [a,b] of segments){
        if(b-a<10)continue;
        const base=cost(a,b);
        for(let k=a+5;k<=b-5;k++){
          const gain=base-cost(a,k)-cost(k,b);
          if(gain>penalty&&(!best||gain>best.gain))best={a,b,k,gain};
        }
      }
      if(!best)break;
      cuts.push({index:best.k,gain:best.gain});
      const i=segments.findIndex(q=>q[0]===best.a&&q[1]===best.b);
      segments.splice(i,1,[best.a,best.k],[best.k,best.b]);
    }
    return cuts.sort((p,q)=>p.index-q.index);
  };
  /* The scale that judges a split must come from the variation WITHIN a regime,
     never from the whole series: the global standard deviation is inflated by
     the very shift being detected, and successive differences collapse to zero
     on a piecewise-constant series, where the only non-zero differences ARE the
     shifts. So: a permissive first pass to find candidate regimes, then the
     scale estimated from the residuals inside those regimes, then the real
     pass. Two passes, fixed, deterministic. */
  const span=Math.max(...fin)-Math.min(...fin);
  const d0=mlDiffScale(y);
  const s0=Number.isFinite(d0)&&d0>0?d0:(span>0?span/100:0);
  if(!(s0>0))return Object.assign(out,{scale:0,scaleKind:"series is constant"});
  const within=segs=>{
    const resid=[];
    segs.forEach(g=>{const sl=mlFinite(y.slice(g.from,g.to)),med=mlMedian(sl);
      sl.forEach(v=>resid.push(Math.abs(v-med)));});
    const s=1.4826*mlMedian(resid);
    return Number.isFinite(s)?s:NaN;
  };
  const first=greedy(2*Math.log(n)*s0*s0);
  const s1=within(describe(first));
  const sUse=Number.isFinite(s1)&&s1>0?s1:s0;
  const kindUse=Number.isFinite(s1)&&s1>0?"residuals within the regimes found":
    (Number.isFinite(d0)&&d0>0?"successive differences":"a hundredth of the observed range");
  out.scale=sUse;out.scaleKind=kindUse;
  const penalty=2*Math.log(n)*sUse*sUse;
  out.penalty=penalty;
  mlTrace(`change points · first-pass scale ${s0.toExponential(3)} → within-regime scale ${Number.isFinite(s1)?s1.toExponential(3):"—"} (${kindUse}) · penalty ${penalty.toExponential(3)}`);
  let cuts=greedy(penalty);
  cuts.forEach((c,i)=>mlTrace(`  candidate ${i+1} · index ${c.index} · gain ${c.gain.toExponential(3)}`));
  /* Effect-size screen on a robust level. The residual sum of squares is not
     robust: one extreme run pulls a segment mean far enough that the greedy
     search brackets it with a pair of splits and reports a level change that is
     really a single outlier. Comparing the segment MEDIANS either side and
     requiring the step to exceed twice the within-regime scale removes that
     pair while leaving a genuine shift untouched. The median is then also what
     is reported and drawn, so the table and the figure cannot disagree. */
  const minStep=2*sUse;
  out.minStep=minStep;
  let segs=describe(cuts);
  for(let pass=0;pass<3;pass++){
    const keep=cuts.filter((c,i)=>Math.abs(segs[i+1].level-segs[i].level)>=minStep);
    if(keep.length===cuts.length)break;
    mlTrace(`  effect-size screen removed ${cuts.length-keep.length} split(s) with a level step under ${minStep.toExponential(3)}`);
    cuts=keep;segs=describe(cuts);
  }
  out.segments=segs;
  out.points=cuts.map((c,i)=>({index:c.index,gain:c.gain,
    before:segs[i].level,after:segs[i+1].level,
    beforeMean:segs[i].mean,afterMean:segs[i+1].mean,
    nBefore:segs[i].to-segs[i].from,nAfter:segs[i+1].to-segs[i+1].from}));
  if(out.points.length)mlTrace(`  kept ${out.points.length} change point(s)`);
  else mlTrace("  no change point survives the penalty and the effect-size screen");
  return out;
}

/* ---------- C. an unusualness rank -------------------------------------
   Two transparent deviations, reported as a RANK and not as a significance
   statement. The review was right that the combined number is not a
   standard-deviation statistic, so it is no longer described as one, and the
   lag-embedding novelty term no longer enters the score: it is computed and
   shown in its own column, where a reader can see it without it driving the
   ordering. A window's novelty is still attributed to the run in it that
   deviates most on its own, which is what keeps a spike's neighbours from
   being reported above the spike.

   Zero dispersion is handled explicitly rather than by dividing by 1e-9. A
   rounded or constant series has no robust scale, and inventing one turns the
   last decimal place into an enormous deviation. */
function mlAnomalyScores(y){
  const n=y.length,fin=mlFinite(y);
  const out={scores:y.map(()=>({robust:NaN,local:NaN,novelty:NaN,score:NaN})),
             scale:NaN,scaleKind:"none",degenerate:true,note:""};
  if(fin.length<6){out.note="fewer than six values";return out;}
  const med=mlMedian(y);
  let mad=mlMad(y),kind="scaled MAD";
  if(!(mad>0)){
    /* no spread at the median: fall back to the measurement resolution, the
       smallest non-zero gap between distinct values, and say which was used */
    const u=[...new Set(fin)].sort((a,b)=>a-b),gaps=[];
    for(let i=1;i<u.length;i++)gaps.push(u[i]-u[i-1]);
    if(!gaps.length){out.note="every value is identical: no ranking is possible";return out;}
    mad=Math.min(...gaps);kind="smallest distinct gap (resolution-limited)";
  }
  out.scale=mad;out.scaleKind=kind;out.degenerate=false;
  const local=[],w=7;
  for(let i=0;i<n;i++){
    const a=Math.max(0,i-w),b=Math.min(n,i+w+1);
    const win=y.slice(a,b).filter((_,j)=>a+j!==i);
    const m=mlMedian(win),s=mlMad(win)||mad;
    local.push(Number.isFinite(y[i])?Math.abs(y[i]-m)/s:NaN);
  }
  const rob=y.map(v=>Number.isFinite(v)?Math.abs(v-med)/mad:NaN);
  const own=y.map((_,i)=>{const o=[rob[i],local[i]].filter(Number.isFinite);
    return o.length?Math.max(...o):NaN;});
  /* three-lag embedding: an unusual shape in time, for information only */
  const lag=2,emb=[];
  for(let i=lag;i<n;i++)emb.push([y[i],y[i-1],y[i-2]]);
  const nov=new Array(n).fill(NaN);
  if(emb.length>6&&emb.every(p=>p.every(Number.isFinite))){
    const nn=emb.map((p,i)=>{
      const d=emb.map((q,j)=>i===j?Infinity:Math.sqrt(p.reduce((s,v,t)=>s+(v-q[t])*(v-q[t]),0)))
        .sort((a,b)=>a-b).slice(0,Math.min(5,emb.length-1));
      return mlMean(d);
    });
    const nnMed=mlMedian(nn),nnMad=mlMad(nn);
    if(nnMad>0)for(let i=lag;i<n;i++){
      const d=Math.abs(nn[i-lag]-nnMed)/nnMad;
      if(!Number.isFinite(d))continue;
      let owner=i,best=-Infinity;
      for(let j=i-lag;j<=i;j++)if(Number.isFinite(own[j])&&own[j]>best){best=own[j];owner=j;}
      nov[owner]=Number.isFinite(nov[owner])?Math.max(nov[owner],d):d;
    }
  }
  out.scores=y.map((v,i)=>({robust:rob[i],local:local[i],novelty:nov[i],score:own[i]}));
  return out;
}

/* ---------- D. multivariate: PCA, T² and the residual distance ---------
   One chart sees one metric. A cabinet drifts in several at once, and each may
   stay inside its own limits while the combination has clearly moved.

   All components are computed, not three: the review was right that retaining
   a few leaves faults in the discarded directions invisible, so the squared
   prediction error in exactly those directions is reported beside T². The
   limits are percentiles of the training history and are labelled as
   retrospective ranking aids, not as prospective control limits with a false
   alarm rate. */
function mlStandardise(rows,stats){
  const p=rows[0].length;
  let mean,sd;
  if(stats){mean=stats.mean;sd=stats.sd;}
  else{mean=[];sd=[];
    for(let j=0;j<p;j++){const col=rows.map(r=>r[j]);mean.push(mlMean(col));sd.push(mlSd(col)||1);}}
  return {z:rows.map(r=>r.map((v,j)=>(v-mean[j])/(sd[j]||1))),mean,sd};
}
function mlCorrelation(z){
  const n=z.length,p=z[0].length,C=Array.from({length:p},()=>new Array(p).fill(0));
  for(let i=0;i<n;i++)for(let a=0;a<p;a++)for(let b=a;b<p;b++)C[a][b]+=z[i][a]*z[i][b];
  for(let a=0;a<p;a++)for(let b=a;b<p;b++){C[a][b]/=(n-1);C[b][a]=C[a][b];}
  return C;
}
function mlPower(C,comps,seed){
  const p=C.length,rng=mlRng(seed||12345),out=[];
  mlTrace(`power iteration on a ${p}x${p} correlation matrix for ${comps} component(s)`);
  let M=C.map(r=>r.slice());
  for(let c=0;c<comps;c++){
    let v=Array.from({length:p},()=>rng()-0.5),lambda=0,prev=NaN;
    for(let it=0;it<300;it++){
      const w=M.map(row=>row.reduce((s,m,j)=>s+m*v[j],0));
      const norm=Math.sqrt(w.reduce((s,x)=>s+x*x,0))||1e-12;
      v=w.map(x=>x/norm);lambda=norm;
      if(ML_TRACE&&(it===0||it===9||it===99||it===299))
        mlTrace(`  component ${c+1} · iteration ${it+1} · eigenvalue ${lambda.toFixed(6)} · change ${Number.isFinite(prev)?Math.abs(lambda-prev).toExponential(2):"—"}`);
      prev=lambda;
    }
    out.push({value:lambda,vector:v.slice()});
    for(let a=0;a<p;a++)for(let b=0;b<p;b++)M[a][b]-=lambda*v[a]*v[b];   /* deflate */
  }
  return out;
}
function mlPCA(rows,comps,seed){
  if(rows.length<8||!rows[0]||rows[0].length<3)return null;
  const {z,mean,sd}=mlStandardise(rows);
  const p=z[0].length,C=mlCorrelation(z);
  const eig=mlPower(C,p,seed);                       /* every direction */
  const rank=eig.filter(e=>e.value>1e-8).length;
  const m=Math.max(1,Math.min(comps||2,rank));
  const scoresAll=z.map(r=>eig.map(e=>r.reduce((s,v,j)=>s+v*e.vector[j],0)));
  const scores=scoresAll.map(s=>s.slice(0,m));
  const t2=scoresAll.map(s=>{let acc=0;
    for(let k=0;k<m;k++)if(eig[k].value>1e-9)acc+=s[k]*s[k]/eig[k].value;return acc;});
  /* squared prediction error: the part of a run that the retained components
     cannot reproduce, which is where a fault in a low-variance direction lives */
  const spe=scoresAll.map(s=>{let acc=0;for(let k=m;k<p;k++)acc+=s[k]*s[k];return acc;});
  const retained=eig.slice(0,m).reduce((s,e)=>s+e.value,0)/p;
  mlTrace(`PCA · ${p} metrics · numerical rank ${rank} · ${m} component(s) retained · ${(100*retained).toFixed(1)} % of the variation`);
  return {eig,eigAll:eig,scores,scoresAll,t2,spe,m,p,rank,retained,
          explained:eig.map(e=>e.value/p),mean,sd,
          t2Ucl:mlQuantile(t2,0.99),t2Warn:mlQuantile(t2,0.95),
          speUcl:mlQuantile(spe,0.99),speWarn:mlQuantile(spe,0.95),
          limitKind:"retrospective percentiles of this history"};
}

/* ---------- E. clustering, as an exploratory display -------------------
   Used only to say "these runs behave alike". A group holding the runs before
   a service date and another holding the runs after it is the same finding as
   a change point reached from a different direction — a cross-check, not a new
   claim.

   Two review points are addressed. The k-means++ weighted draw walked past the
   bin it had selected (it subtracted the chosen weight and then advanced), so
   for any interior bin it returned the following point; the draw below stops on
   the bin that contains the variate. And k is no longer assumed: silhouette is
   computed for k = 2..4 and compared against seeded null resamples of the same
   ranges, so the panel can report that a partition is no better than chance
   instead of always presenting two groups. */
function mlDist(a,b){let s=0;for(let i=0;i<a.length;i++)s+=(a[i]-b[i])*(a[i]-b[i]);return Math.sqrt(s);}
/* Draw an index with probability proportional to w. Exposed so the draw itself
   can be tested rather than inferred from a clustering result. */
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
function mlKMeans(points,k,seed){
  const rng=mlRng(seed||777),n=points.length;
  if(n<k*3||k<1)return null;
  const centres=[points[Math.floor(rng()*n)].slice()];
  while(centres.length<k){
    const d2=points.map(p=>Math.pow(Math.min(...centres.map(c=>mlDist(p,c))),2));
    centres.push(points[mlWeightedDraw(d2,rng())].slice());
  }
  let assign=new Array(n).fill(0);
  mlTrace(`k-means: ${n} runs, ${k} group(s), seeded k-means++ start`);
  for(let it=0;it<60;it++){
    let moved=false,moves=0;
    for(let i=0;i<n;i++){
      let best=0,bd=Infinity;
      centres.forEach((c,j)=>{const d=mlDist(points[i],c);if(d<bd){bd=d;best=j;}});
      if(assign[i]!==best){assign[i]=best;moved=true;moves++;}
    }
    if(ML_TRACE){
      const inertia=points.reduce((s,pt,i)=>s+Math.pow(mlDist(pt,centres[assign[i]]),2),0);
      mlTrace(`  pass ${it+1} · ${moves} run(s) reassigned · within-group sum of squares ${inertia.toFixed(4)}`);
    }
    for(let j=0;j<k;j++){
      const mem=points.filter((_,i)=>assign[i]===j);
      if(mem.length)centres[j]=mem[0].map((_,d)=>mlMean(mem.map(m=>m[d])));
    }
    if(!moved)break;
  }
  const sizes=centres.map((_,j)=>assign.filter(a=>a===j).length);
  const inertia=points.reduce((s,pt,i)=>s+Math.pow(mlDist(pt,centres[assign[i]]),2),0);
  mlTrace("  settled · group sizes",sizes);
  return {assign,centres,sizes,inertia,k,silhouette:mlSilhouette(points,assign,k)};
}
function mlSilhouette(points,assign,k){
  const n=points.length;
  if(k<2)return NaN;                        /* undefined for a single group */
  if(assign.some(a=>a==null))return NaN;
  const sizes=Array.from({length:k},(_,j)=>assign.filter(a=>a===j).length);
  if(sizes.some(s=>s===0))return NaN;
  let total=0;
  for(let i=0;i<n;i++){
    const own=sizes[assign[i]];
    if(own<2){continue;}                    /* a singleton contributes 0 */
    let a=0;const b=new Array(k).fill(0);
    for(let j=0;j<n;j++){
      if(i===j)continue;const d=mlDist(points[i],points[j]);
      if(assign[j]===assign[i])a+=d;else b[assign[j]]+=d;
    }
    a/=own-1;
    let bb=Infinity;
    for(let j=0;j<k;j++)if(j!==assign[i]&&sizes[j]>0)bb=Math.min(bb,b[j]/sizes[j]);
    const m=Math.max(a,bb);
    total+=m>0?(bb-a)/m:0;
  }
  return total/n;
}
/* Is there more structure than chance? The null is a seeded uniform resample
   over each dimension's observed range, clustered the same way; a partition is
   reported only when its silhouette beats the 90th percentile of the null.
   Silhouette is undefined at k = 1, so "no groups" is concluded from failing
   the null comparison, never from a silhouette value. */
function mlClusterStructure(points,seed,kMax,nNull){
  const n=points.length;
  if(n<12)return {structure:false,why:"fewer than twelve runs"};
  const dims=points[0].length;
  const lo=Array.from({length:dims},(_,d)=>Math.min(...points.map(p=>p[d])));
  const hi=Array.from({length:dims},(_,d)=>Math.max(...points.map(p=>p[d])));
  const best=(pts,sd)=>{
    let b=null;
    for(let k=2;k<=Math.min(kMax||4,Math.floor(n/3));k++){
      const km=mlKMeans(pts,k,sd+k);
      if(km&&Number.isFinite(km.silhouette)&&(!b||km.silhouette>b.silhouette))b=km;
    }
    return b;
  };
  const obs=best(points,seed||4242);
  if(!obs)return {structure:false,why:"too few runs to form groups"};
  const rng=mlRng((seed||4242)+99),nulls=[];
  for(let s=0;s<(nNull||20);s++){
    const sample=Array.from({length:n},()=>Array.from({length:dims},(_,d)=>lo[d]+rng()*(hi[d]-lo[d])));
    const b=best(sample,(seed||4242)+1000+s);
    if(b&&Number.isFinite(b.silhouette))nulls.push(b.silhouette);
  }
  const q90=nulls.length?mlQuantile(nulls,0.9):NaN;
  const structure=Number.isFinite(q90)&&obs.silhouette>q90;
  mlTrace(`cluster structure · best k ${obs.k} · silhouette ${obs.silhouette.toFixed(4)}`
    +` · null 90th percentile ${Number.isFinite(q90)?q90.toFixed(4):"—"} → ${structure?"structure":"no more than chance"}`);
  return {structure,km:obs,k:obs.k,silhouette:obs.silhouette,nullQ90:q90,nNull:nulls.length};
}

/* ---------- F. which metrics go with a flagged run ---------------------
   Logistic regression on standardised metrics; the label is "this run produced
   at least one forensic finding", taken from the page's own log.

   The review's points are built in. The honest number is an out-of-time AUC:
   the model is fitted on the earlier runs and evaluated on the later ones,
   with the standardisation computed on the training part ONLY, so no
   information from the evaluation period reaches the fit. The in-sample AUC is
   still reported, labelled as such, because it bounds the other from above.
   Event counts are returned so the caller can refuse to display coefficients
   when there are too few flagged runs per metric to mean anything. Removing
   the label's own metrics does not rule out indirect leakage through metrics
   the forensic rules themselves read, which the panel states. */
function mlAuc(pred,lab){
  const pos=pred.filter((_,i)=>lab[i]===1),neg=pred.filter((_,i)=>lab[i]===0);
  if(!pos.length||!neg.length)return NaN;
  let c=0;for(const a of pos)for(const b of neg)c+=a>b?1:(a===b?0.5:0);
  return c/(pos.length*neg.length);
}
function mlFitLogistic(z,yLab,iters,lr,L2,tag){
  const n=z.length,p=z[0].length;
  let w=new Array(p).fill(0),b=0;
  const total=iters||400;
  mlTrace(`logistic regression${tag?" ("+tag+")":""}: ${n} runs, ${p} metrics, ${yLab.filter(v=>v===1).length} flagged, lr ${lr}, L2 ${L2}, ${total} steps`);
  for(let it=0;it<total;it++){
    const gw=new Array(p).fill(0);let gb=0,loss=0;
    for(let i=0;i<n;i++){
      const s=z[i].reduce((acc,v,j)=>acc+v*w[j],0)+b;
      const pr=1/(1+Math.exp(-Math.max(-30,Math.min(30,s))));
      const e=pr-yLab[i];
      for(let j=0;j<p;j++)gw[j]+=e*z[i][j];
      gb+=e;
      if(ML_TRACE)loss-=yLab[i]?Math.log(Math.max(pr,1e-12)):Math.log(Math.max(1-pr,1e-12));
    }
    /* the objective is reported, never acted on: no early stop, so the step
       count is fixed and the result stays deterministic */
    if(ML_TRACE&&(it%50===0||it===total-1)){
      const gn=Math.sqrt(gw.reduce((a,g)=>a+(g/n)*(g/n),0)+(gb/n)*(gb/n));
      mlTrace(`  step ${String(it+1).padStart(4)} · mean log-loss ${(loss/n).toFixed(6)} · gradient norm ${gn.toExponential(3)}`);
    }
    for(let j=0;j<p;j++)w[j]-=lr*(gw[j]/n+L2*w[j]/n);
    b-=lr*gb/n;
  }
  return {w,b};
}
/* The descriptive fit is on every run in the cohort and every feature in it;
   that is what the coefficients describe. An out-of-time evaluation is a
   different object and is passed in explicitly by the caller, because an honest
   one needs the FEATURE SCHEMA frozen on the training rows as well as the
   standardisation -- presence, variance screening and complete-case selection
   computed over the whole period have already seen the evaluation period. The
   caller builds those two matrices; this function only fits and scores. */
function mlLogistic(X,yLab,opts){
  const o=opts||{};
  const n=X.length;if(!n)return null;
  const p=X[0].length;
  const iters=o.iters||400,lr=o.lr||0.1,L2=o.lambda===undefined?0.5:o.lambda;
  const nPos=yLab.filter(v=>v===1).length,nNeg=n-nPos;
  const all=mlStandardise(X);
  const full=mlFitLogistic(all.z,yLab,iters,lr,L2,"all runs in the cohort");
  const predIn=all.z.map(r=>1/(1+Math.exp(-(r.reduce((a,v,j)=>a+v*full.w[j],0)+full.b))));
  const aucIn=mlAuc(predIn,yLab);
  mlTrace(`  in-sample AUC ${Number.isFinite(aucIn)?aucIn.toFixed(4):"—"} · intercept ${full.b.toFixed(4)}`);
  mlTrace("  weights",full.w.map(v=>+v.toFixed(4)));
  let out={aucOut:NaN,nTrain:0,nTest:0,posTrain:0,posTest:0,
           why:"no held-out period was supplied",schemaFrozen:false,keys:o.keys||null};
  const h=o.holdout;
  if(h&&h.Xtr&&h.Xte&&h.Xtr.length>=8&&h.Xte.length>=4){
    const posTr=h.ytr.filter(v=>v===1).length,posTe=h.yte.filter(v=>v===1).length;
    if(posTr>0&&posTr<h.ytr.length&&posTe>0&&posTe<h.yte.length){
      const tr=mlStandardise(h.Xtr);
      const fit=mlFitLogistic(tr.z,h.ytr,iters,lr,L2,"training period");
      const zte=mlStandardise(h.Xte,{mean:tr.mean,sd:tr.sd}).z;    /* training statistics only */
      const pte=zte.map(r=>1/(1+Math.exp(-(r.reduce((a,v,j)=>a+v*fit.w[j],0)+fit.b))));
      out={aucOut:mlAuc(pte,h.yte),nTrain:h.Xtr.length,nTest:h.Xte.length,
           posTrain:posTr,posTest:posTe,why:"",schemaFrozen:!!h.schemaFrozen,
           keys:h.keys||null,nKeys:h.Xtr[0]?h.Xtr[0].length:0};
      mlTrace(`  out-of-time AUC ${Number.isFinite(out.aucOut)?out.aucOut.toFixed(4):"—"}`
        +` · trained on ${out.nTrain} runs (${posTr} flagged), evaluated on ${out.nTest} (${posTe} flagged)`
        +` · schema frozen on training rows: ${out.schemaFrozen}`);
    }else out.why="one of the two periods has no flagged run, or only flagged runs";
  }else if(h)out.why="too few runs in one of the two periods";
  return {w:full.w,b:full.b,pred:predIn,aucIn,auc:aucIn,
          aucOut:out.aucOut,nTrain:out.nTrain,nTest:out.nTest,
          posTrain:out.posTrain,posTest:out.posTest,outWhy:out.why,
          schemaFrozen:out.schemaFrozen,holdoutKeys:out.keys,
          nPos,nNeg,n,p,eventsPerFeature:nPos/Math.max(1,p),
          enoughEvents:nPos>=5&&nNeg>=5&&nPos/Math.max(1,p)>=1};
}
/* Split an ordered list at a fraction of its length; exposed so the caller and
   the tests agree on where the training period ends. */
function mlTimeSplit(n,frac){const cut=Math.floor(n*(frac||0.7));
  return {cut,trainable:cut>=8&&n-cut>=4};}

if(typeof module!=="undefined")module.exports={mlMean,mlSd,mlMedian,mlMad,mlDiffScale,mlQuantile,mlRng,
  mlHash32,mlSolve,mlMatInv,mlQuad,mlLogGamma,mlBetaI,mlTcdf,mlTinv,mlGammaP,mlChi2Upper,
  mlPolyFit,mlIndependence,mlForecast,mlCrossing,mlChangepoints,mlAnomalyScores,
  mlStandardise,mlCorrelation,mlPCA,mlDist,mlWeightedDraw,mlKMeans,mlSilhouette,
  mlClusterStructure,mlAuc,mlLogistic,mlTimeSplit,mlFitLogistic,mlTrace};

