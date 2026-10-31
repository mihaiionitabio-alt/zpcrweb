function maraApplicability(run,p=SOP){
 const original=SS_EXPORT_CONTEXT.get(run)?.original||run;
 const selected=p.method.standard_number===17?p.method.selected_assays||[]:[p.method.selected_event].filter(Boolean);
 const specs=selected.map(name=>({name,spec:p.targets.find(t=>t.kind==='target'&&(t.match===name||sopMatcher(t.match)(name)))}));
 const declared=new Set((original.wells||[]).map(w=>w.target||w.targetName).filter(Boolean));
 for(const a of original.analyses||[])for(const key of ['target','targetName','shortName'])if(a[key])declared.add(a[key]);
 for(const well of Object.values(original.plate||{}))for(const ch of Object.values(well.channels||{}))if(ch.targetName)declared.add(ch.targetName);
 const matches=[...declared].some(target=>specs.some(x=>x.name===target||x.spec&&sopMatcher(x.spec.match)(target)));
 const reason=!selected.length?ui('Select the event or screening panel before applying this profile'):!matches?ui('Selected profile target is not declared in this experiment'):'';
 return {applicable:!reason,reason,expected:selected.join(', '),observed:[...declared].join(', ')};
}