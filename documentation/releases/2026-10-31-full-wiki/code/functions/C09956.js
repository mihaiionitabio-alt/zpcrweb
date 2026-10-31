function maraRuleRows(p=SOP){
 const source=p.method?.sources?.[0]||{},perf=p.performance||{},sub=p.replicates?.subsamples||{};
 const rows=[['Method role',ui(maraRoleLabel(p))],['Method',p.analyticalRole==='identification'?'1':p.analyticalRole==='quantification'?'2':p.method?.standard_number===16?'ΔΔCt':ui('Rapid PCR')],['Event',p.method?.selected_event||ui('Not declared')],['Reference assay',(p.method?.reference_genes||[]).map(x=>x.target).join(', ')||ui('Not declared')],['Ct cut-off',perf.ct_cutoff??36]];
 for(const [key,label] of [['lod_percent','LOD (%)'],['loq_percent','LOQ (%)'],['lod_copies','LOD (copies)'],['loq_copies','LOQ (copies)']])if(perf[key]!=null)rows.push([label,perf[key]]);
 for(const [key,label] of [['lod_basis_template_ng_per_reaction','LOD DNA basis (ng)'],['loq_basis_template_ng_per_reaction','LOQ DNA basis (ng)']])if(perf[key])rows.push([label,perf[key]]);
 if(perf.template_ng_per_reaction)rows.push(['Sample DNA (ng/reaction)',perf.template_ng_per_reaction]);
 if(p.calibrator?.maximum_template_ng_per_reaction)rows.push(['CRM maximum DNA (ng/reaction)',p.calibrator.maximum_template_ng_per_reaction]);

 if(sub.count)rows.push(['Subsamples',sub.count],['PCR amplifications per subsample',p.analyticalRole==='quantification'?ui('At least 3'):sub.amplifications_per_subsample]);
 if(p.replicates?.control_amplifications)rows.push(['Controls: PCR amplifications',ui('At least 3')]);
 if(p.analyticalRole==='quantification'){
  const u=p.calculation?.uncertainty||{};rows.push(['u₀',u.u0],['uᵣ',u.ur],['k',u.coverage_factor_k],['u','√(u₀² + (uᵣ × mean)²)'],['U','k × u'],['c_k','mean(c_event,k) / mean(c_reference,k) × 100'],['f',1.693],['Below LOQ: detected, not quantified','']);
  for(const label of ['Standard curve: R² ≥ 0.98; slope −3.6 to −3.1; ≥5 levels','CRM: |bias| < 2 × u_bias','Laboratory control: sR ≤ 25% and |biasR| ≤ 25%','Sample: s′R ≤ 25% only at or above LOQ'])rows.push([label,'']);
 }else if(p.method?.standard_number!==17){rows.push(['ΔCt','mean(Ct_event) − mean(Ct_reference)'],['ΔΔCt','mean(ΔCt_sample) − mean(ΔCt_control)'],['ddCt < −0.4: higher; ddCt > +0.4: lower',''],['At |ddCt| ≤ 0.4, use full quantification','']);}
 else {rows.push(['Screening is limited to the tested panel at its stated LOD','']);for(const assay of p.method?.rapid_event_assay_catalogue||[])rows.push(['Annex B assay catalogue',assay.target]);}
 return rows.map(([rule,value])=>({rule:ui(rule),value:String(value??'')}));
}