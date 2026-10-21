/* ============================================================
   6. Derived quantities: efficiency index
   ============================================================ */
function effWol(curve){
  if(!curve||curve.length<8)return null;
  const F=curve.map(Number),n=F.length,cyc=[...Array(n)].map((_,i)=>i+1),fmin=Math.min(...F),fmax=Math.max(...F);
  if(fmax-fmin<50)return null;
  let best=null;const lo=fmin-0.02*(fmax-fmin),hi=fmin*0.999;
  for(let k=0;k<12;k++){
    const baseline=lo+(hi-lo)*k/11,y=F.map(v=>v-baseline);if(y.some(v=>v<=0))continue;
    const ly=y.map(Math.log10),amp=Math.max(...y),idx=[];
    for(let i=0;i<y.length;i++)if(y[i]>=0.02*amp&&y[i]<=0.25*amp)idx.push(i);
    if(idx.length<4)continue;
    const runs=[[idx[0]]];for(let i=1;i<idx.length;i++){if(idx[i]===idx[i-1]+1)runs.at(-1).push(idx[i]);else runs.push([idx[i]]);}
    const run=runs.reduce((a,c)=>c.length>a.length?c:a);if(run.length<4)continue;
    const f=fitLin(run.map(i=>cyc[i]),run.map(i=>ly[i]));
    if(f.slope<=0)continue;if(!best||f.r2>best.r2)best={...f,baseline,window:[run[0]+1,run.at(-1)+1]};
  }
  if(!best||best.r2<0.98)return null;
  const E=(10**best.slope-1)*100;
  return E>30&&E<140?Math.round(E*10)/10:null;
}
function effSliwinProxy(curve){
  if(!curve||curve.length<8)return null;
  const F=curve.map(Number),n=F.length,cyc=[...Array(n)].map((_,i)=>i+1),fmin=Math.min(...F),fmax=Math.max(...F);
  if(fmax-fmin<50)return null;
  const y=F.map(v=>v-fmin+1),ly=y.map(Math.log10),amp=Math.max(...y);let best=null;const width=5;
  for(let s=0;s+width<=n;s++){
    const win=[...Array(width)].map((_,i)=>s+i);
    if(y[win[0]]<0.01*amp||y[win.at(-1)]>0.35*amp)continue;
    const f=fitLin(win.map(i=>cyc[i]),win.map(i=>ly[i]));
    if(f.slope>0&&(!best||f.r2>best.r2))best=f;
  }
  if(!best||best.r2<0.99)return null;
  const E=(10**best.slope-1)*100;return E>30&&E<140?Math.round(E*10)/10:null;
}


/* Efficiency from a calibration slope. A slope near zero implies an absurd
   efficiency - 10^(-1/-1e-9) overflows - and a positive slope has no physical
   reading at all, so both return null rather than a number that will be
   formatted and believed. The (1,3] window covers 0-200 % efficiency. */
function efficiencyFromSlope(slope){
  if(!Number.isFinite(slope)||slope>=-1e-6)return null;
  const e=Math.pow(10,-1/slope);
  return (e>1&&e<=3)?e:null;
}

