async function selWithExportNames(fn){
  if(!pseudoOn())return await fn();
  const keep=RUNS;RUNS=keep.map((r,i)=>ssExportClone(pseudoRun(r),r,i));
  try{return await fn();}finally{RUNS=keep;}
}