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