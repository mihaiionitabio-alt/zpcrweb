function(run,ri){
 return maraProfileActive()?maraEvaluateRun(run,ri):next(run,ri);
}