next=>function(run,ri){
 const result=next(run,ri);if(maraProfileActive()||SOP.evaluationMode!=='configuration-only')return result;
 const reason=ui('Configuration only; no independent experiment calculation engine selected');for(const row of result.rows){row.outcome='Not interpreted';row.label=ui('Not interpreted');row.report=reason;row.reason=reason;row.conc=NaN;}
 result.status='Not evaluated';result.criteria=[{criterion:reason,action:'review',status:'review',evidence:''}];result.rejected=[];result.reviewed=result.criteria;return result;
}