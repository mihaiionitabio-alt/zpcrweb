function maraDecisionText(d){
 let text=maraMessage(d.code);
 if(d.code==='majority')text+=' · '+d.values.positive_subsamples+'/3 · '+ui(d.outcome==='Positive'?'Detected':'Not detected');
 if(d.code==='quantified')text+=' · C = '+d.values.text+'; k = '+d.values.coverage_factor+'; '+ui(d.values.uncertainty_basis==='laboratory'?'Laboratory uncertainty model':'Standard uncertainty model');
 if(Number.isFinite(d.values.delta_delta_ct)&&!d.values.comparison_outcome)text+=' · ΔCt = '+d.values.delta_ct.toFixed(4)+'; ΔCt (QC) = '+d.values.control_delta_ct.toFixed(4)+'; ΔΔCt = '+d.values.delta_delta_ct.toFixed(4)+'; '+ui('Control content')+' = '+d.values.control_content_percent+' %';
 if(d.failures?.length)text+=': '+d.failures.map(maraMessage).join('; ');
 if(d.values.comparison_outcome)text+='; '+maraMessage(d.values.comparison_outcome)+(Number.isFinite(d.values.delta_delta_ct)?' · ΔCt = '+d.values.delta_ct.toFixed(4)+'; ΔCt (QC) = '+d.values.control_delta_ct.toFixed(4)+'; ΔΔCt = '+d.values.delta_delta_ct.toFixed(4):'');
 return text;
}