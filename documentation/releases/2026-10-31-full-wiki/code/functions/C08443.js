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