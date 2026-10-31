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