function sopNormalise(p){
  if(p&&p.schema==="qpcr-control-mapping-proposal/v1"){
    /* The review proposal intentionally has a different schema.  Opening it
       converts its reviewed SC-06 rules to the application profile shape;
       stored run values and calls remain untouched. */
    throw new Error("The retired SC control-mapping proposal is not a supported profile. Select or import a complete SOP profile.");
  }
  const b=sopBase();if(!p||typeof p!=="object")return b;
  const o=Object.assign({},b,p);
  ["replicates","ic","run","graphs"].forEach(k=>o[k]=Object.assign({},b[k],p[k]||{}));
  o.outcomes={};SOP_OUTCOMES.forEach(k=>o.outcomes[k]=Object.assign({},SOP_OUTCOME_DEFAULTS[k],(p.outcomes||{})[k]||{}));
  o.targets=Array.isArray(p.targets)&&p.targets.length?p.targets.map(t=>Object.assign({match:"*",kind:"auto",cqMax:40,cqLate:"",quantMin:"",lateOutcome:"Inconclusive"},t)):b.targets;
  o.controls=Array.isArray(p.controls)?p.controls.map(c=>Object.assign({name:"",matchBy:"name",match:"",expect:"negative",cqLo:"",cqHi:"",targets:"*",minPerRun:0,onFail:"reject"},c)):b.controls;
  // Repair only the two known escaped-string defects in saved SC-06 profiles.
  // Custom patterns and every acceptance limit remain unchanged.
  if(o.method&&o.method.id==="SOP-06-SC-screening"){
    const applies=o.method.applies_when||{};
    if(applies.run_name_pattern==="^SC(?:[_s-]|$)")o.method=Object.assign({},o.method,{applies_when:Object.assign({},applies,{run_name_pattern:"^SC(?:[_\\s-]|$)"})});
    if(o.sample_id&&o.sample_id.pattern==="^d+s*GMd{2}(?:\b|_)")o.sample_id=Object.assign({},o.sample_id,{pattern:"^\\d+\\s*GM\\d{2}(?:\\b|_)"});
  }
  o.schema=SOP_SCHEMA;delete o.sha256;return o;
}