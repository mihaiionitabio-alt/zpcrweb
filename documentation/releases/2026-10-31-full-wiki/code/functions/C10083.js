function maraNumericProblems(p=SOP){const failures=[];
 const low=p.comparison?.lower_threshold,high=p.comparison?.upper_threshold;
 if(low!==undefined&&high!==undefined&&(low===''||high===''||!Number.isFinite(Number(low))||!Number.isFinite(Number(high))||!(Number(low)<Number(high))))failures.push('Invalid method numeric settings');
 if(p.analyticalRole==='quantification'){
  const u=p.calculation?.uncertainty||{};
  if(!(Number(p.run.slopeMin)<Number(p.run.slopeMax))||!(Number(u.coverage_factor_k)>0)||u.u0===''||u.ur===''||!Number.isFinite(Number(u.u0))||!Number.isFinite(Number(u.ur))||Number(u.u0)<0||Number(u.ur)<0)failures.push('Invalid method numeric settings');
 }
 if(p.sample_id?.pattern){try{new RegExp(p.sample_id.pattern,p.sample_id.flags||'');}catch{failures.push('Invalid sample-name pattern');}}
 return [...new Set(failures)];
}