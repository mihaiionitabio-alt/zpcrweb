function selValidateOption(id,key,value){
  const rule=selOptionRule(id,key);if(!rule)throw new Error(`${id} does not accept option ${key}`);
  if(rule==="number"&&!Number.isFinite(Number(value)))throw new Error(`${key} must be numeric`);
  if(rule==="numberOrEmpty"&&(value!==""&&!Number.isFinite(Number(value))))throw new Error(`${key} must be numeric or empty`);
  if(rule==="integer"&&(!/^\d+$/.test(value)||Number(value)<0))throw new Error(`${key} must be a non-negative integer`);
  if(rule==="run"&&!(/^(all|\d+)$/.test(value)||RUNS.some(r=>runName(r)===value)))throw new Error(`${key} must identify a loaded run or all`);
  if(rule==="chartSet"&&value!=="*"&&!/^[A-Za-z0-9_,-]+$/.test(value))throw new Error(`${key} must be * or a chart/group list`);
  if(Array.isArray(rule)&&!rule.includes(value))throw new Error(`${key} must be one of ${rule.join(", ")}`);
}