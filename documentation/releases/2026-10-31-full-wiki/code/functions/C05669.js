function withExportNames(fn){
  if(!pseudoOn())return fn();
  const keep=RUNS;RUNS=keep.map((r,i)=>ssExportClone(pseudoRun(r),r,i));
  try{return fn();}finally{RUNS=keep;}
}