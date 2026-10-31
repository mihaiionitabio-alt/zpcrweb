function mlMultivariate(cohort,scope){
  /* both analysis inputs are constructed before the key is compared */
  const F=mlFeatureMatrix(cohort.rows);
  const labels=F.ok?F.rows.map(r=>((((r.m||{}).findings||{}).count)>0)?1:0):null;
  const usable=!!labels&&labels.some(v=>v===1)&&labels.some(v=>v===0);
  const holdout=usable?mlBuildHoldout(cohort.rows,0.7):null;
  const key=mlDependencyKey(cohort,F,labels,scope,holdout);
  if(ML_STATE.mv&&ML_STATE.mv.key===key)return ML_STATE.mv;
  const out={key,fingerprint:mlHash32(key),F,label:labels,scope:scope||"",holdout};
  if(F.ok){
    out.pca=mlPCA(F.X,2,20260921);
    out.logit=usable?mlLogistic(F.X,labels,{iters:400,lambda:1,holdout}):null;
    out.clusters=out.pca?mlClusterStructure(out.pca.scores.map(q=>q.slice(0,2)),20260921,4,20):null;
  }
  ML_STATE.mv=out;
  return out;
}