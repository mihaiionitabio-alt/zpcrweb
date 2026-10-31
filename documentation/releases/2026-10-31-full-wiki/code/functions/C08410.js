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