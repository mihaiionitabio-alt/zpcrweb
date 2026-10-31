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