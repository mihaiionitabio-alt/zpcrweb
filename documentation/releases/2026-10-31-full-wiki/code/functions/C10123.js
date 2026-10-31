function experimentSopTemplate(kind){
 const p=sopBase();p.name=kind==='absolute'?'Absolute quantification — configuration':kind==='relative'?'Relative quantification — configuration':'Melting analysis — configuration';p.version='1.0-configuration';p.reviewOnly=true;p.evaluationMode='configuration-only';
 p.notes='Configuration fields only. No independent relative/absolute/Tm algorithm is selected. Enter assay-specific limits; the LC480 manuals describe the intended method. Stored measurements are unchanged.';
 p.blockedAutomaticInterpretations=['Configuration-only template: no independent calculation engine selected.','Example names and calibration quantities are illustrative configuration, not measured data.','Validate assay-specific controls, acceptance limits and sample mappings before interpreting results.'];
 p.targets=[];p.controls=[];p.experiment_analysis=JSON.parse(JSON.stringify(EXPERIMENT_SOP_DEFAULTS));
 p.experiment_analysis.quantification.enabled=kind!=='melting';p.experiment_analysis.quantification.method=kind==='relative'?'relative-calibrator-normalized':'absolute-standard-curve';p.experiment_analysis.melting.enabled=kind==='melting';
 // Examples are assay-specific configuration, never imported measurements or
 // inherited SC/GMO acceptance limits. They remain provisional until validated.
 const prefix=kind==='absolute'?'ABS':kind==='relative'?'REL':'MELT';
 p.assay=kind==='absolute'?'Example DNA concentration':kind==='relative'?'Example gene expression':'Example melting product';
 p.samplePattern='^'+prefix+'_SAMPLE_[0-9]+(?:_R[0-9]+)?$';
 p.sample_id={pattern:p.samplePattern,flags:'i',description:'Example sample identifier; replace with the laboratory naming rule.'};
 p.replicates={min:1,positiveMin:1,partialOutcome:'Inconclusive',maxSd:'',sdOutcome:'Repeat'};
 p.ic={referenceCq:'',maxShift:'',shiftOutcome:'Inconclusive',missingOutcome:'Invalid'};
 Object.assign(p.run,{minR2:'',effMin:'',effMax:'',minLogs:'',ntcGap:'',maxZoneSpread:''});
 p.experiment_analysis.examples={configuration_only:true,not_experimental_data:true,samples:[prefix+'_SAMPLE_001_R1',prefix+'_SAMPLE_002_R1']};
 const q=p.experiment_analysis.quantification,m=p.experiment_analysis.melting;
 q.sample_group_pattern='^('+prefix+'_SAMPLE_[0-9]+)(?:_R[0-9]+)?$';
 p.controls=[{name:'No-template control',matchBy:'name',match:prefix+'_NTC',expect:'negative',cqLo:'',cqHi:'',targets:'*',minPerRun:1,onFail:'reject'}];
 if(kind==='absolute'){
  p.targets=[{match:'DNA_TARGET',kind:'auto',cqMax:'',cqLate:'',quantMin:'',lateOutcome:'Inconclusive'}];
  q.target_pattern='DNA_TARGET';q.absolute.calibrator_pattern='ABS_STD_*';q.absolute.quantity_unit='copies/reaction';
  p.experiment_analysis.examples.standards=[100000,10000,1000,100,10].map((quantity,i)=>({sample:'ABS_STD_'+(i+1),target:'DNA_TARGET',quantity,unit:'copies/reaction'}));
 }else if(kind==='relative'){
  p.targets=[{match:'GENE_TARGET',kind:'auto',cqMax:'',cqLate:'',quantMin:'',lateOutcome:'Inconclusive'},{match:'REF_GENE',kind:'reference',cqMax:'',cqLate:'',quantMin:'',lateOutcome:'Inconclusive'}];
  q.target_pattern='GENE_TARGET';q.relative.reference_pattern='REF_GENE';q.relative.calibrator_sample_pattern='REL_CALIBRATOR';q.relative.baseline_group='REL_CALIBRATOR';
  p.experiment_analysis.examples.calibrator={sample:'REL_CALIBRATOR',targets:['GENE_TARGET','REF_GENE']};
 }else{
  p.targets=[{match:'MELT_PRODUCT',kind:'auto',cqMax:'',cqLate:'',quantMin:'',lateOutcome:'Inconclusive'}];
  m.chemistry='SYBR Green I';m.max_peaks='2';
  m.peak_rules=[{target:'MELT_PRODUCT',tm_c:'',tolerance_c:'',peak_count:'',height_min:'',area_min:'',width_max:'',control_pattern:'MELT_POSITIVE',genotype:''}];
  p.experiment_analysis.examples.positive_control={sample:'MELT_POSITIVE',target:'MELT_PRODUCT'};
 }
 return p;
}