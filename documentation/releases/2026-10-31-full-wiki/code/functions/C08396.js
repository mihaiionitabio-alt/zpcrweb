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