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