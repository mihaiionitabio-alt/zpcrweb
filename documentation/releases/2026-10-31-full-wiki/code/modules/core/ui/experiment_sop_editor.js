/* Optional experiment design metadata. No defaults are inserted into SC/MARA
 * profiles until the operator edits this section. These fields are not a new
 * independent LC480 calculation/peak-finding implementation. */
const EXPERIMENT_SOP_DEFAULTS={schema:'missy-experiment-analysis/1',configuration_only:true,
 quantification:{enabled:false,method:'absolute-standard-curve',target_pattern:'',sample_group_pattern:'',biological_replicates_min:'',technical_replicates_min:'',
  absolute:{calibrator_pattern:'',quantity_unit:'',curve_source:'in-run',external_curve_id:'',fit_model:'linear-cq-log10',levels_min:'',min_r2:'',slope_min:'',slope_max:''},
  relative:{model:'efficiency-corrected',reference_pattern:'',calibrator_sample_pattern:'',baseline_group:'',efficiency_source:'relative-standard-curves',efficiency_notation:'amplification-factor',target_amplification_factor:'',reference_amplification_factor:'',reference_aggregation:'single-reference',result_unit:'fold-change'}},
 melting:{enabled:false,analysis:'tm-calling',chemistry:'',signal_source:'stored-tm',temperature_min_c:'',temperature_max_c:'',ramp_rate_c_per_s:'',acquisitions_per_c:'',max_peaks:'',include_shoulders:false,peak_rules:[]}
};
const EXPERIMENT_OPTION_LABELS={'absolute-standard-curve':'Absolute quantification (standard curve)','relative-calibrator-normalized':'Relative quantification (calibrator normalized)','in-run':'Within the run','external':'External curve','linear-cq-log10':'Linear Cq versus log10 quantity','polynomial':'Polynomial','imported':'Imported model','efficiency-corrected':'Efficiency corrected','delta-delta-cq':'ΔΔCq','relative-standard-curves':'Relative standard curves','fixed-factors':'Specified amplification factors','single-reference':'Single reference','geometric-mean':'Geometric mean','tm-calling':'Tm calling','product-identification':'Product identification','genotyping':'Genotyping','stored-tm':'Stored Tm','negative-first-derivative':'Negative first derivative','stored-fluorescence':'Stored fluorescence'};
Object.assign(ZH_TERMS,{
 '11 · Other experiment settings':'11 · 其他实验设置','Configuration only; does not change the active calculation engine':'仅用于配置；不改变当前计算引擎','Enable quantification settings':'启用定量设置','Quantification method':'定量方法','Target pattern':'靶标匹配规则','Sample grouping pattern':'样品分组规则','Biological replicates (minimum)':'生物学重复数（最少）','Technical replicates (minimum)':'技术重复数（最少）',
 'absolute-standard-curve':'标准曲线绝对定量','relative-calibrator-normalized':'校准样品归一化相对定量','Calibrator name pattern':'校准品名称规则','Quantity unit':'量值单位','Curve source':'标准曲线来源','in-run':'同次运行','external':'外部曲线','External curve identifier':'外部曲线标识','Curve model':'标准曲线模型','linear-cq-log10':'Cq 与量值常用对数的线性模型','polynomial':'多项式','imported':'导入模型','Minimum calibration levels':'最少校准梯度数','Minimum R²':'R² 下限',
 'Relative quantification model':'相对定量模型','efficiency-corrected':'扩增效率校正','delta-delta-cq':'ΔΔCq','Reference target pattern':'内参靶标规则','Calibrator sample pattern':'校准样品规则','Baseline group':'基线组','Efficiency source':'扩增效率来源','relative-standard-curves':'相对标准曲线','fixed-factors':'指定扩增因子','Target amplification factor':'靶标扩增因子','Reference amplification factor':'内参扩增因子','Reference normalization':'内参归一化','single-reference':'单个内参','geometric-mean':'几何均值','fold-change':'相对倍数变化','Result unit':'结果单位',
 'Enable melting settings':'启用熔解分析设置','Melting analysis':'熔解分析','tm-calling':'Tm 判定','product-identification':'产物鉴别','genotyping':'基因分型','Detection chemistry':'检测化学体系','Melting data source':'熔解数据来源','stored-tm':'保存的 Tm','negative-first-derivative':'负一阶导数','stored-fluorescence':'保存的荧光数据','Minimum temperature (°C)':'温度下限（°C）','Maximum temperature (°C)':'温度上限（°C）','Ramp rate (°C/s)':'升温速率（°C/s）','Acquisitions per °C':'每摄氏度采集次数','Maximum peaks':'峰数上限','Include shoulders':'包括肩峰','Expected Tm (°C)':'预期 Tm（°C）','Tm tolerance (°C)':'Tm 容差（°C）','Expected peak count':'预期峰数','Minimum peak height':'峰高下限','Minimum peak area':'峰面积下限','Maximum peak width':'峰宽上限','Control pattern':'质控品规则','Genotype label':'基因型标签','Add melting rule':'添加熔解规则','Melting rules':'熔解规则'
});
for(const [key,label] of Object.entries(EXPERIMENT_OPTION_LABELS))ZH_TERMS[label]=ZH_TERMS[key]||label;
function experimentSopEditor(){
 const box=document.getElementById('sop-editor');if(!box)return;
 const section=document.createElement('details');section.className='sop-sec';section.id='experiment-sop-settings';
 const config=SOP.experiment_analysis||EXPERIMENT_SOP_DEFAULTS,get=path=>path.split('.').reduce((o,k)=>o?.[k],config);
 const field=(label,path,type='text',opts=[])=>{const v=get(path),key='experiment_analysis.'+path;let input;
  if(type==='select')input=`<select data-experiment-path="${key}">${opts.map(x=>`<option value="${esc(x)}"${String(v)===String(x)?' selected':''}>${esc(ui(EXPERIMENT_OPTION_LABELS[x]||x))}</option>`).join('')}</select>`;
  else input=`<input data-experiment-path="${key}" type="${type}"${type==='checkbox'?(v?' checked':''):` value="${esc(v??'')}"`}${type==='number'?' step="any"':''}>`;
  return `<label class="sop-field"><span>${esc(ui(label))}</span>${input}</label>`;
 };
 const grid=fields=>'<div class="sop-grid">'+fields.join('')+'</div>';
 section.innerHTML=`<summary>${esc(ui('11 · Other experiment settings'))}</summary><p>${esc(ui('Configuration only; does not change the active calculation engine'))}</p>`+
 grid([field('Enable quantification settings','quantification.enabled','checkbox'),field('Quantification method','quantification.method','select',['absolute-standard-curve','relative-calibrator-normalized']),field('Target pattern','quantification.target_pattern'),field('Sample grouping pattern','quantification.sample_group_pattern'),field('Biological replicates (minimum)','quantification.biological_replicates_min','number'),field('Technical replicates (minimum)','quantification.technical_replicates_min','number')])+
 '<h4>'+esc(ui(EXPERIMENT_OPTION_LABELS['absolute-standard-curve']))+'</h4>'+grid([field('Calibrator name pattern','quantification.absolute.calibrator_pattern'),field('Quantity unit','quantification.absolute.quantity_unit'),field('Curve source','quantification.absolute.curve_source','select',['in-run','external']),field('External curve identifier','quantification.absolute.external_curve_id'),field('Curve model','quantification.absolute.fit_model','select',['linear-cq-log10','polynomial','imported']),field('Minimum calibration levels','quantification.absolute.levels_min','number'),field('Minimum R²','quantification.absolute.min_r2','number'),field('Minimum curve slope','quantification.absolute.slope_min','number'),field('Maximum curve slope','quantification.absolute.slope_max','number')])+
 '<h4>'+esc(ui(EXPERIMENT_OPTION_LABELS['relative-calibrator-normalized']))+'</h4>'+grid([field('Relative quantification model','quantification.relative.model','select',['efficiency-corrected','delta-delta-cq']),field('Reference target pattern','quantification.relative.reference_pattern'),field('Calibrator sample pattern','quantification.relative.calibrator_sample_pattern'),field('Baseline group','quantification.relative.baseline_group'),field('Efficiency source','quantification.relative.efficiency_source','select',['relative-standard-curves','fixed-factors']),field('Target amplification factor','quantification.relative.target_amplification_factor','number'),field('Reference amplification factor','quantification.relative.reference_amplification_factor','number'),field('Reference normalization','quantification.relative.reference_aggregation','select',['single-reference','geometric-mean']),field('Result unit','quantification.relative.result_unit')])+
 '<h4>'+esc(ui('Melting analysis'))+'</h4>'+grid([field('Enable melting settings','melting.enabled','checkbox'),field('Melting analysis','melting.analysis','select',['tm-calling','product-identification','genotyping']),field('Detection chemistry','melting.chemistry','select',['','SYBR Green I','HybProbe','SimpleProbe']),field('Melting data source','melting.signal_source','select',['stored-tm','negative-first-derivative','stored-fluorescence']),field('Minimum temperature (°C)','melting.temperature_min_c','number'),field('Maximum temperature (°C)','melting.temperature_max_c','number'),field('Ramp rate (°C/s)','melting.ramp_rate_c_per_s','number'),field('Acquisitions per °C','melting.acquisitions_per_c','number'),field('Maximum peaks','melting.max_peaks','select',['','2','6']),field('Include shoulders','melting.include_shoulders','checkbox')])+
 '<h4>'+esc(ui('Melting rules'))+'</h4><div id="experiment-melting-rules"></div>';
 const json=document.getElementById('sop-json')?.closest('details');if(json)json.before(section);else box.append(section);
 const ensure=()=>{if(!SOP.experiment_analysis)SOP.experiment_analysis=JSON.parse(JSON.stringify(EXPERIMENT_SOP_DEFAULTS));};
 for(const el of section.querySelectorAll('[data-experiment-path]')){el.disabled=!!SOP.locked;el.onchange=()=>{ensure();sopSetPath(el.dataset.experimentPath,el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':Number(el.value)):el.value);sopProfileEdited();document.getElementById('sop-json').value=sopJSON();};}
 const renderRules=()=>{
  const rules=SOP.experiment_analysis?.melting?.peak_rules||[];
  sopTableEditor(section.querySelector('#experiment-melting-rules'),rules,[{key:'target',label:'Target'},{key:'tm_c',label:'Expected Tm (°C)',type:'number'},{key:'tolerance_c',label:'Tm tolerance (°C)',type:'number'},{key:'peak_count',label:'Expected peak count',type:'number'},{key:'height_min',label:'Minimum peak height',type:'number'},{key:'area_min',label:'Minimum peak area',type:'number'},{key:'width_max',label:'Maximum peak width',type:'number'},{key:'control_pattern',label:'Control pattern'},{key:'genotype',label:'Genotype label'}],'Add melting rule',()=>({target:'',tm_c:'',tolerance_c:'',peak_count:'',height_min:'',area_min:'',width_max:'',control_pattern:'',genotype:''}));
  if(!SOP.experiment_analysis){const add=section.querySelector('#experiment-melting-rules button');if(add)add.onclick=()=>{ensure();SOP.experiment_analysis.melting.peak_rules.push({target:'',tm_c:'',tolerance_c:'',peak_count:'',height_min:'',area_min:'',width_max:'',control_pattern:'',genotype:''});sopProfileEdited();renderRules();};}
 };
 renderRules();section.querySelector('#experiment-melting-rules').addEventListener('change',()=>{document.getElementById('sop-json').value=sopJSON();});localizeDOM(section);
}
MISSY_HOOKS.use('renderSopEditor','experiment.optional.settings',35,next=>function(){next();experimentSopEditor();});
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
for(const kind of ['absolute','relative','melting'])SOP_PRESETS['experiment_'+kind]=()=>experimentSopTemplate(kind);
Object.assign(ZH_TERMS,{'Other experiment configurations':'其他实验配置','Absolute quantification — configuration':'绝对定量 — 配置','Relative quantification — configuration':'相对定量 — 配置','Melting analysis — configuration':'熔解分析 — 配置','Configuration only; no independent experiment calculation engine selected':'仅用于配置；尚未选择独立的实验计算引擎'});
document.addEventListener('DOMContentLoaded',()=>{const select=document.getElementById('sop-preset'),group=document.createElement('optgroup');group.label=ui('Other experiment configurations');for(const kind of ['absolute','relative','melting'])group.append(new Option(ui(experimentSopTemplate(kind).name),'experiment_'+kind));select?.append(group);});
MISSY_HOOKS.use('sopEvaluateRun','experiment.configuration.only',40,next=>function(run,ri){
 const result=next(run,ri);if(maraProfileActive()||SOP.evaluationMode!=='configuration-only')return result;
 const reason=ui('Configuration only; no independent experiment calculation engine selected');for(const row of result.rows){row.outcome='Not interpreted';row.label=ui('Not interpreted');row.report=reason;row.reason=reason;row.conc=NaN;}
 result.status='Not evaluated';result.criteria=[{criterion:reason,action:'review',status:'review',evidence:''}];result.rejected=[];result.reviewed=result.criteria;return result;
});
