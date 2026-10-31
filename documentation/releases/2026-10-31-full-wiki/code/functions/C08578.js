function mlDependencyKey(cohort,F,labels,scope,holdout){
  const schema=M=>M&&M.ok?{keys:M.keys,
    omitted:(M.omitted||[]).map(o=>[o.name,o.why]),
    dropped:(M.dropped||[]).map(d=>[d.run,d.missing]),
    rows:(M.rows||[]).map(r=>r.key),X:M.X}:{ok:false,why:M?M.why:"none"};
  return "advisory-key-v3\n"+mlCanonical({
    version:ML_VERSION,
    instrument:cohort.instrument,protocol:cohort.protocol,baseFrom:cohort.baseFrom,
    sop:sopHash(),
    segmentScope:scope||"",
    /* the primary boundary: the complete inputs, canonically serialised */
    inputs:cohort.rows.map(mlRowInput),
    /* and the derived objects, so the key says what was made from them */
    cohortSchema:schema(F),
    labels:labels||null,
    holdout:holdout?{keys:holdout.keys,Xtr:holdout.Xtr,ytr:holdout.ytr,
      Xte:holdout.Xte,yte:holdout.yte,
      trainRows:holdout.trainRowKeys,testRows:holdout.testRowKeys,
      droppedTest:holdout.droppedTest,trainSchema:holdout.trainSchema}:null});
}