/* Method adapter: preserves stored records, separates run evidence from SOP JSON. */
const MARA_EVIDENCE=new WeakMap();
function maraEvidence(run){
 const original=SS_EXPORT_CONTEXT.get(run)?.original;if(original)return maraEvidence(original);
 let all=MARA_EVIDENCE.get(run);if(!all){all=new Map();MARA_EVIDENCE.set(run,all);}
 const key=sopHash();if(!all.has(key))all.set(key,{context:{},reactions:{}});return all.get(key);
}
function maraWellID(w,i){return JSON.stringify([w.analysisUid||w.analysis||'',w.target||'',w.pos??w.well??i,w.channel||'']);}
function maraControlMatches(c,w,p){
 if(sopMatcher(c.match)(String(c.matchBy==='role'?w.role||'':w.sample||'')))return true;
 const primary=(p.analyticalRole==='identification'&&c.id==='pos-qual-qc')||((p.analyticalRole==='quantification'||p.method.standard_number===16)&&c.id==='pos-quant-qc');
 if(!primary)return false;
 const event=p.control_identity?.event,pct=p.analyticalRole==='quantification'?p.calibrator?.certified_content_percent:p.method.standard_number===16?p.comparison?.control_content_percent:p.control_identity?.positive_percent;
 if(!event||pct===''||pct==null)return false;
 const escape=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return new RegExp('^'+escape(event)+'(?:\\s+|\\s*·\\s*)'+escape(pct)+'\\s*%$','i').test(String(w.sample||''));
}
function maraInput(run,p=SOP,evidence=maraEvidence(run)){
 const exportContext=SS_EXPORT_CONTEXT.get(run);
 const rapid=p.method.standard_number===17;
 const refName=p.method.reference_genes?.[0]?.target||'';
 const refSpec=p.targets.find(t=>t.kind==='reference'&&t.match&&sopMatcher(t.match)(refName));
 const reference=refName;
 const selected=rapid?(p.method.selected_assays||[]):[p.method.selected_event].filter(Boolean);
 const specs=selected.map(name=>({name,spec:p.targets.find(t=>t.kind==='target'&&(t.match===name||sopMatcher(t.match)(name)))}));
 const matchAssay=w=>{const t=String(w.target||w.analysis||'');if(refName&&(t.toLowerCase()===refName.toLowerCase()||refSpec&&sopMatcher(refSpec.match)(t)))return reference;return specs.find(x=>x.name===t||x.spec&&sopMatcher(x.spec.match)(t))?.name||'';};
 const all=ssWells(run),records=[];
 for(const [i,shown] of all.entries()){
  const w=exportContext?.rows.get(shown)||shown;
  const assay=matchAssay(w);if(!assay)continue;
  const id=maraWellID(w,i),e=evidence.reactions[id]||{};
  const matched=p.controls.filter(c=>c.id!=='cal-lowest'&&maraControlMatches(c,w,p));
  const kinds=new Set(matched.map(c=>/pos-quant/.test(c.id)?'quantitative':/pos-qual/.test(c.id)?'positive':/blank/.test(c.id)?'blank':/^neg/.test(c.id)?'negative':'unknown'));
  let role=kinds.size===1?[...kinds][0]:kinds.size>1?'ambiguous':'sample';
  if(e.kind==='calibrator'||role==='sample'&&(w.role==='Standard'||w.instrRole==='Standard'))role='calibrator';
  let sampleGroup=w.sample||'',subsample='',mappingError=false;
  if(role==='sample'&&!rapid){
   try{const pattern=p.sample_id?.pattern,re=pattern?new RegExp(pattern,(p.sample_id.flags||'i').replace(/[gy]/g,'')):null,m=re?.exec(String(w.sample||''));
    if(!m?.groups?.sample||!m.groups.subsample)mappingError=true;else{sampleGroup=m.groups.sample;subsample=m.groups.subsample;}
   }catch{mappingError=true;}
  }
  records.push({id,physicalId:JSON.stringify([w.pos??w.well??i,assay]),source:shown,originalSource:w,assay,role,sample:String(w.sample||''),sampleGroup,subsample,mappingError,cq:sopCq(w),curve:e.curve||'unknown',copies:e.copies,level:e.level||'',pair:e.pair||'',omitted:sopOmitted(w)});
 }
 return {records,context:{...evidence.context,reference,assays:selected,selectionPending:SAMPLE_SELECTION.pending,complete:!run.isTemplate&&(!run.eds||run.eds.exp?.runState==='COMPLETE')}};
}
const MARA_MESSAGES={
 laboratory_uncertainty:['Laboratory uncertainty model not validated, incomplete or outside its applicable range','实验室不确定度模型未经验证、不完整或超出适用范围'],
 threshold_control:['Control event, content and uncertainty must cover the declared labelling threshold','质控品的转化体、含量及不确定度必须覆盖声明的标识阈值'],comparison_control:['Quantitative comparison control not accepted','用于比较的阳性定量质控品不合格'],comparison_not_detected:['Relative comparison cannot be calculated without consistent event detection','转化体未一致检出，无法计算相对含量比较'],
 range_coefficient:['Range coefficient f = 1.693 for three values','三个数据的极差系数 f = 1.693'],
 positive_control_content:['Positive control must identify the event and its assigned content (0.1–1.0%)','阳性质控品必须明确转化体及其赋值含量（0.1–1.0%）'],
 control_mapping:['Control-name mapping is ambiguous','质控品名称映射不明确'],
 higher:['Event content higher than quantitative control','转化体含量高于阳性定量质控品'],lower:['Event content lower than quantitative control','转化体含量低于阳性定量质控品'],'quantification required':['Method 2 quantification required','需要采用方法 2 定量'],comparison_unavailable:['Relative comparison unavailable: quantitative control or complete detected subsamples missing','无法比较相对含量：缺少合格的阳性定量质控品或完整检出的平行子样'],
 event_not_detected:['Event not detected; crop reference accepted','未检出转化体；作物内标准基因合格'],
 method_verified:['Assay, reaction protocol and matrix not confirmed','尚未确认检测方法、反应程序及基质'],sequence_verified:['KJ1003 junction sequence not confirmed','尚未确认 KJ1003 连接区序列'],dna_basis_verified:['GGK2 DNA basis not resolved','尚未确认 GGK2 DNA 依据'],assay_selection:['Select the event/panel and crop reference','请选择转化体或筛查组合及作物内标准基因'],selection_applied:['Apply sample selection','请应用样品选择'],run_complete:['Run is incomplete or a template','运行未完成或为模板'],unique_reactions:['Duplicate reaction identities','反应标识重复'],rapid_workflow:['Rapid-PCR workflow not confirmed','尚未确认快速 PCR 流程'],same_plate:['Same run and plate not confirmed','尚未确认同次运行及同一反应板'],calibration_range:['CRM range and DNA inputs not confirmed','尚未确认 CRM 范围及 DNA 加样量'],copy_units:['CRM assignments must use copies','CRM 赋值必须使用拷贝数'],
 run_requirements:['Run requirements not met','运行要求未满足'],missing_evidence:['Required evidence is missing','缺少所需证据'],missing_assay:['Missing event or reference reaction','缺少转化体或内标准基因反应'],sample_name_mapping:['Sample-name format needs sample and subsample captures','样品名称格式必须包含 sample 和 subsample 捕获组'],replicate_structure:['Independent subsamples or PCR replicates do not meet the method','独立平行子样或 PCR 重复数不符合方法要求'],curve_evidence:['Amplification-curve evidence is missing','缺少扩增曲线证据'],reference_failed:['Crop reference failed; a GMO-negative result cannot be issued','作物内标准基因不合格；不能出具转基因阴性结果'],majority:['Three-subsample majority decision','三个平行子样的多数判定'],discordant:['Discordant amplifications; repeat','扩增结果不一致；需重测'],panel_detected:['Detected in the selected screening panel','在所选筛查组合中检出'],panel_not_detected:['Not detected for this assay at the method LOD of 1%','在方法 1% 检出限下未检出该靶标'],not_quantifiable:['Event not consistently detected; no numerical content issued','转化体未一致检出；不出具含量数值'],below_loq:['Detected; content below the quantification limit','检出；含量低于定量限'],loq_boundary:['Exactly at LOQ; reporting policy requires confirmation','恰好达到定量限；需确认报告规则'],sample_curve_range:['Sample outside the accepted calibration range','试样超出合格标准曲线范围'],sample_precision:['Sample relative standard deviation exceeds the limit','试样相对标准偏差超限'],uncertainty_settings:['Invalid uncertainty settings','不确定度设置无效'],quantified:['Quantified with expanded uncertainty','定量结果及扩展不确定度'],
 blank:['Blank control','空白质控品'],negative:['Negative control','阴性质控品'],positive:['Positive control','阳性质控品'],quantitative_control:['Quantitative control replicates and curve evidence','阳性定量质控品重复数及曲线证据'],quantitative_acceptance:['Quantitative control acceptance','阳性定量质控品合格判定'],calibration_levels:['CRM levels, copy assignments and replicates','CRM 梯度、拷贝数赋值及重复数'],calibration_fit:['Standard-curve slope and R²','标准曲线斜率及 R²'],lowest_calibrator:['Lowest CRM dilution amplification','最低 CRM 稀释梯度扩增'],lowest_copy_range:['Lowest CRM level must be above LOD and at or below LOQ','最低 CRM 梯度必须高于检出限且不高于定量限'],matched_dilutions:['Matched CRM dilution levels','匹配的 CRM 稀释梯度'],shared_crm_ratio:['Same CRM dilution series for both curves','两条曲线使用相同 CRM 稀释系列'],qc_curve_range:['Quantitative control within calibration range','阳性定量质控品处于标准曲线范围内'],supported_method:['Unsupported method','不支持的方法']
};
function maraMessage(code){const [key,...tail]=String(code).split(':'),pair=MARA_MESSAGES[key];return (pair?pair[UI_LANG==='zh'?1:0]:key)+(tail.length?' · '+tail.join(':'):'');}
function maraDecisionText(d){
 let text=maraMessage(d.code);
 if(d.code==='majority')text+=' · '+d.values.positive_subsamples+'/3 · '+ui(d.outcome==='Positive'?'Detected':'Not detected');
 if(d.code==='quantified')text+=' · C = '+d.values.text+'; k = '+d.values.coverage_factor+'; '+ui(d.values.uncertainty_basis==='laboratory'?'Laboratory uncertainty model':'Standard uncertainty model');
 if(Number.isFinite(d.values.delta_delta_ct)&&!d.values.comparison_outcome)text+=' · ΔCt = '+d.values.delta_ct.toFixed(4)+'; ΔCt (QC) = '+d.values.control_delta_ct.toFixed(4)+'; ΔΔCt = '+d.values.delta_delta_ct.toFixed(4)+'; '+ui('Control content')+' = '+d.values.control_content_percent+' %';
 if(d.failures?.length)text+=': '+d.failures.map(maraMessage).join('; ');
 if(d.values.comparison_outcome)text+='; '+maraMessage(d.values.comparison_outcome)+(Number.isFinite(d.values.delta_delta_ct)?' · ΔCt = '+d.values.delta_ct.toFixed(4)+'; ΔCt (QC) = '+d.values.control_delta_ct.toFixed(4)+'; ΔΔCt = '+d.values.delta_delta_ct.toFixed(4):'');
 return text;
}
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
Object.assign(ZH_TERMS,{'Select the event or screening panel before applying this profile':'应用此配置前请选择转化体或筛查组合','Selected profile target is not declared in this experiment':'本实验未声明所选配置的靶标','Select a profile matching the experiment':'请选择与实验匹配的配置','Profile selection required':'需要选择适用配置'});
function maraEvaluateRun(run,ri){
 const applicability=maraApplicability(run);
 if(!applicability.applicable)return {run,ri,rows:[],criteria:[{criterion:ui('Method applicability'),action:'unresolved',status:'n/a',evidence:applicability.reason+'; '+applicability.expected}],rejected:[],reviewed:[],status:'Profile not applicable — '+applicability.reason,times:runTimes(run),icMedian:NaN,applicability};
 const input=maraInput(run),calc=MARA_ENGINE.evaluate(SOP,input.records,input.context),rows=[];
 const makeRow=(rs,sample,target,outcome,reason,values={},ctrl=null)=>{
  const exporting=!!SS_EXPORT_CONTEXT.get(run);if(exporting)sample=ctrl?exportName(sample):maraExportSample(sample,rs.map(r=>r.originalSource||r.source));
  const ws=rs.map(r=>r.source),used=rs.filter(r=>!r.omitted),qs=used.map(r=>Number(r.cq)).filter(Number.isFinite),det=used.filter(r=>MARA_ENGINE.signal(r)===true);
  const spec={kind:ctrl?'control':'target',match:target,cqMax:36},o=SOP.outcomes[outcome]||{};
  return {run,ri,key:sample+'||'+target,sample,target,exporting,originalWells:rs.map(r=>r.originalSource||r.source),role:ctrl?'Control':'Sample',wells:ws,used:used.map(r=>r.source),spec,ctrl,n:used.length,omitted:rs.length-used.length,det:det.length,above:qs.filter(x=>x>36).length,cqMax:36,cqMean:mean(qs),cqSd:sd(qs),conc:values.content_percent??NaN,outcome,label:ui(o.label||outcome),colour:o.colour||'#94a3b8',reason,report:reason+(SOP.reviewOnly?'; '+ui('Review only — no release decision'):''),rule:SOP.method.id,methodValues:values,methodCalculated:true};
 };
 for(const d of calc.decisions)rows.push(makeRow(d.reactions.filter(r=>r.assay===d.target),d.sample,d.target,d.outcome,maraDecisionText(d),d.values));
 const references=byKey(input.records.filter(r=>r.role==='sample'&&r.assay===input.context.reference),r=>r.sampleGroup||r.sample);
 for(const [sample,rs] of references){const valid=rs.some(r=>!r.omitted)&&rs.filter(r=>!r.omitted).every(r=>MARA_ENGINE.signal(r)===true),r=makeRow(rs,sample,input.context.reference,valid?'Control pass':'Invalid',valid?ui('Crop reference accepted'):maraMessage('reference_failed'));r.spec.kind='reference';rows.push(r);}
 const controls=byKey(input.records.filter(r=>r.role!=='sample'),r=>r.sample+'||'+r.assay);
 for(const rs of controls.values()){
    const r=rs[0],related=calc.checks.filter(c=>c.code.endsWith(':'+r.assay)&&c.code.startsWith(r.role==='quantitative'?'quantitative':r.role)),out=r.role==='calibrator'?'Standard':related.length&&related.every(c=>c.pass)?'Control pass':'Control fail';
  rows.push(makeRow(rs,r.sample,r.assay,out,ui(out),{}, {name:r.role,id:r.role}));
 }
 const checkLabels={supported_method:['Supported method','支持的方法'],method_verified:['Method and reaction protocol verified','已核实检测方法及反应程序'],sequence_verified:['KJ1003 junction sequence verified','已核实 KJ1003 连接区序列'],dna_basis_verified:['GGK2 DNA basis resolved','已确认 GGK2 DNA 依据'],assay_selection:['Event/panel and crop reference selected','已选择转化体或筛查组合及作物内标准基因'],selection_applied:['Sample selection applied','已应用样品选择'],run_complete:['Completed experimental run','已完成的实验运行'],unique_reactions:['Unique reaction identities','唯一反应标识'],rapid_workflow:['Rapid-PCR workflow verified','已核实快速 PCR 流程'],same_plate:['Same run and plate verified','已确认同次运行及同一反应板'],calibration_range:['CRM dilution range and DNA inputs verified','已核实 CRM 稀释范围及 DNA 加样量'],copy_units:['CRM assignments in copies','CRM 以拷贝数赋值']};
 Object.assign(checkLabels,{control_mapping:['Unambiguous control mapping','明确的质控品映射'],positive_control_content:['Positive control event and assigned content','阳性质控品转化体及赋值含量'],threshold_control:['Threshold-matched quantitative control','与阈值匹配的阳性定量质控品']});
 const criteria=calc.checks.map(c=>({criterion:checkLabels[c.code]?.[UI_LANG==='zh'?1:0]||maraMessage(c.code),action:'reject',status:c.pass?'pass':'fail',evidence:maraEvidenceDetail(c.detail)}));
 if(SOP.reviewOnly)criteria.push({criterion:ui('Review only — no release decision'),action:'review',status:'review',evidence:ui('Automatic calculations are provisional until laboratory approval')});
 const rejected=criteria.filter(c=>c.status==='fail'),reviewed=criteria.filter(c=>c.status==='review');
 return {run,ri,rows,criteria,rejected,reviewed,status:rejected.length?'Rejected':reviewed.length?'Accepted with review':'Accepted',times:runTimes(run),icMedian:NaN,methodCalculation:calc};
}
function maraExportSample(sample,wells){if(!pseudoOn())return sample;const known=pseudonymMap().get(sample);return known||'G-'+exportName(wells[0]?.sample||'');}
MISSY_HOOKS.define('sopInterpretationRows');MISSY_HOOKS.define('sopSampleRows');
MISSY_HOOKS.use('sopInterpretationRows','mara.calculated.export',20,next=>function(filterRun,forExport){
 if(!maraProfileActive())return next(filterRun,forExport);
 const name=s=>forExport?exportName(s):s;
 return sopEvaluateAll().filter(e=>filterRun==null||filterRun===''||String(e.ri)===String(filterRun)).flatMap(e=>e.rows.map(r=>({experiment:runName(e.run),run_status:e.status,sample:forExport&&!r.exporting?maraExportSample(r.sample,r.originalWells):r.sample,source_sample_names:uniq(r.originalWells.map(w=>name(w.sample))).join(' | '),target:r.target,role:r.role,kind:r.ctrl?'control':r.spec.kind,wells:r.wells.map(w=>w.well).join(' '),replicates:r.n,detected:r.det,omitted:r.omitted,cq_mean:Number.isFinite(r.cqMean)?r.cqMean:'',cq_sd:Number.isFinite(r.cqSd)?r.cqSd:'',cq_cutoff:36,quantity:r.methodValues.content_percent??'',expanded_uncertainty:r.methodValues.U??'',uncertainty_basis:r.methodValues.uncertainty_basis||'',coverage_factor:r.methodValues.coverage_factor??'',subsample_ratios:r.methodValues.subsample_ratios?.join(' | ')||'',rsd_percent:r.methodValues.rsd_percent??'',delta_ct:r.methodValues.delta_ct??'',control_delta_ct:r.methodValues.control_delta_ct??'',delta_delta_ct:r.methodValues.delta_delta_ct??'',comparison_outcome:r.methodValues.comparison_outcome??'',outcome:r.outcome,label:r.label,reason:r.reason,report:r.report,rule:r.rule,provisional:!!SOP.reviewOnly,stored_calls:uniq(r.wells.map(w=>w.call)).join(' | '),...sopMeta()})));
});
MISSY_HOOKS.use('sopSampleRows','mara.calculated.samples',20,next=>function(filterRun,forExport){
 if(!maraProfileActive())return next(filterRun,forExport);
 const rs=sopInterpretationRows(filterRun,forExport).filter(r=>r.kind==='target'),groups=byKey(rs,r=>r.experiment+'||'+r.sample);
 const order=['Invalid run','Invalid','Repeat','Inconclusive','Positive','Negative','Not interpreted'];
 const samples=[...groups.values()].map(a=>{const r=a[0],worst=a.slice().sort((x,y)=>order.indexOf(x.outcome)-order.indexOf(y.outcome))[0];return {experiment:r.experiment,run_status:r.run_status,sample:r.sample,summary:a.map(x=>x.target+': '+x.label).join('; '),sample_outcome:worst.outcome,action:a.filter(x=>/Invalid|Repeat|Inconclusive/.test(x.outcome)).map(x=>x.reason).join('; '),needs_action:a.some(x=>/Invalid|Repeat|Inconclusive/.test(x.outcome))?'yes':'',reference_outcomes:'',report:a.map(x=>x.target+': '+x.report).join('; '),...sopMeta()};});
 const unmatched=sopEvaluateAll().filter(e=>(filterRun==null||filterRun===''||String(e.ri)===String(filterRun))&&e.applicability?.applicable===false).map(e=>({experiment:runName(e.run),run_status:e.status,sample:'',summary:ui('Profile selection required'),sample_outcome:'Not evaluated',action:ui('Select a profile matching the experiment'),needs_action:'',requires_profile_selection:'yes',reference_outcomes:'',report:e.applicability.reason+'; '+e.applicability.expected,...sopMeta()}));return [...samples,...unmatched];
});
Object.assign(ZH_TERMS,{'Automatic calculations are provisional until laboratory approval':'自动计算结果在实验室批准前仅供审核','Crop reference accepted':'作物内标准基因合格','Source checksum required':'需要源文件校验和'});
MISSY_HOOKS.define('sopStdCurves');
MISSY_HOOKS.use('sopStdCurves','mara.assigned.curves',20,next=>function(run){
 if(!maraProfileActive())return next(run);if(SOP.analyticalRole!=='quantification')return [];
 const {records}=maraInput(run),groups=byKey(records.filter(r=>r.role==='calibrator'&&!r.omitted&&r.copies>0&&Number.isFinite(r.cq)),r=>r.assay);
 return [...groups].map(([target,rs])=>{const c=MARA_ENGINE.fit(rs);if(!c)return null;const points=rs.map(r=>({x:Math.log10(r.copies),y:r.cq,well:r.source.well,sample:SS_EXPORT_CONTEXT.has(run)?exportName(r.sample):r.sample,conc:r.copies,residual:r.cq-(c.intercept+c.slope*Math.log10(r.copies))}));return {...c,target,points,n:rs.length,efficiency:(10**(-1/c.slope)-1)*100,levels:new Set(rs.map(r=>r.level)).size,logs:Math.log10(c.max/c.min),monotonic:c.slope<0};}).filter(Boolean);
});
MISSY_HOOKS.define('MG_VIEWS.results.build');
MISSY_HOOKS.use('MG_VIEWS.results.build','mara.console.results',20,next=>function(){
 if(!maraProfileActive())return next();
 return sopEvaluateAll().flatMap(e=>e.rows.filter(r=>!r.ctrl&&r.spec.kind==='target').map((r,i)=>mgIt({kind:'results',sev:/Invalid/.test(r.outcome)?'alarm':/Inconclusive|Repeat/.test(r.outcome)||SOP.reviewOnly?'watch':'ok',pict:MG_PICT.sample,kindWord:ui('Automatic results'),code:'MARA'+(i+1),title:r.sample+' · '+r.target,value:r.methodValues.text||r.label,unit:'',state:r.report,evidence:runName(e.run),rows:[[ui('Mean Cq'),Number.isFinite(r.cqMean)?r.cqMean.toFixed(3):'—'],[ui('Outcome'),r.label],[ui('Reason'),r.reason]],actions:[{key:'3',label:ui('Open the results view on the page'),cmd:'open page results'}]})));
});
MISSY_HOOKS.use('report.paragraph','mara.calculation.disclosure',30,next=>function(text){
 if(maraProfileActive()&&(/The page recomputes nothing.|Stored vendor results are kept unchanged./.test(String(text))))text=ui('MARA results are calculated by MISSY from stored Cq values and explicit method inputs. Stored measurements are unchanged. Laboratory approval is separate from automatic calculation.');
 return next(text);
});
Object.assign(ZH_TERMS,{
 'MARA results are calculated by MISSY from stored Cq values and explicit method inputs. Stored measurements are unchanged. Laboratory approval is separate from automatic calculation.':'MARA 结果由 MISSY 根据保存的 Cq 值及明确的方法输入计算。保存的测量值保持不变。实验室批准与自动计算相互独立。',
 'Method reaction evidence':'方法反应证据','content_percent':'含量（%）','expanded_uncertainty':'扩展不确定度','coverage_factor':'包含因子','subsample_ratios':'平行子样拷贝数比值','rsd_percent':'相对标准偏差（%）','provisional':'暂定结果','source_sample_names':'源样品名称','review':'审核','quantify':'定量','laboratory':'实验室配制质控品','run_status':'运行状态','criterion':'判定标准','sop_action':'SOP 处理','evidence':'证据','sop_profile':'SOP 配置文件','sop_version':'SOP 版本','summary':'结果摘要','sample_outcome':'样品结果','action':'处理','needs_action':'需处理','reference_outcomes':'内标准基因结果','report':'报告结果','pass':'通过','fail':'未通过','slope':'斜率','intercept':'截距','r2':'R²','min':'最小值','max':'最大值',
 'delta_ct':'ΔCt','control_delta_ct':'质控品 ΔCt','delta_delta_ct':'ΔΔCt','comparison_outcome':'相对比较结果'
});
MISSY_HOOKS.use('selDataItems','mara.result.evidence',30,next=>function(){
 const items=next();if(!maraProfileActive())return items;
 for(const item of items){
  if(item.id==='data:sop_answers')item.tableOptions={full:true,columns:['experiment','sample','report']};
  if(item.id==='data:sop_criteria')item.tableOptions={full:true,columns:['criterion','status','evidence']};
  if(item.id==='data:sop_runs')item.tableOptions={full:true,columns:['experiment','status','positive','negative','invalid','review']};
 }
 const rows=()=>RUNS.flatMap(run=>{const {records,context}=maraInput(run);return records.map(r=>({experiment:runName(run),source_sha256:run.meta?.sourceSHA256||'',sample:exportName(r.sample),target:r.assay,well:r.source.well,role:r.role,cq:Number.isFinite(r.cq)?r.cq:'',curve_evidence:r.curve,assigned_copies:r.copies??'',level:r.level,qc_pair:r.pair,omitted:r.omitted,method_verified:context.methodVerified===true,...sopMeta()}));});
 items.push({id:'data:mara_evidence',kind:'data',group:'Tables',title:ui('Method reaction evidence'),note:'',ready:()=>RUNS.length>0,rows,file:'method_reaction_evidence.csv',text:()=>csvOf(rows())});return items;
});
MISSY_HOOKS.define('GRAPHS.stdcurve.render');
MISSY_HOOKS.use('GRAPHS.stdcurve.render','mara.standard.figure',20,next=>function(c){
 if(!maraProfileActive())return next(c);
 const cs=sopStdCurves(c.run).filter(s=>!c.target||s.target===c.target);if(!cs.length)return {svg:svgMessage(ui('No assigned CRM copy values')),rows:[]};
 const colours=new Map(),series=[],texts=[];
 for(const [i,s] of cs.entries()){
  const col=catColour(colours,s.target),xs=s.points.map(p=>p.x),a=Math.min(...xs),b=Math.max(...xs);
  series.push({type:'points',colour:col,data:s.points.map(p=>[p.x,p.y,`${p.sample} · ${p.well} · ${p.conc} · Cq ${p.y}`])});
  series.push({type:'line',colour:col,data:[[a,s.intercept+s.slope*a],[b,s.intercept+s.slope*b]]});
  texts.push({px:80,py:46+i*17,colour:col,text:`${s.target}: ${ui('Slope')} ${num(s.slope,3)} (−3.6 … −3.1); R² ${num(s.r2,4)} (≥0.98)`});
 }
 const all=cs.flatMap(s=>s.points);
 return {svg:svgPlot({title:runName(c.run),x:extent(all.map(p=>p.x)),y:extent(all.map(p=>p.y),.25),xlab:ui('log10 assigned CRM copies'),ylab:ui('Stored Cq'),series,texts,legend:legendFromMap(colours)}),rows:cs.flatMap(s=>s.points.map(p=>({target:s.target,well:p.well,sample:p.sample,assigned_copies:p.conc,cq:p.y,residual:p.residual,slope:s.slope,intercept:s.intercept,r2:s.r2})))};
});
Object.assign(ZH_TERMS,{'No assigned CRM copy values':'尚未赋予 CRM 拷贝数','log10 assigned CRM copies':'CRM 拷贝数赋值的常用对数','Slope':'斜率','Control content':'质控品含量','Labelling threshold (%)':'标识阈值（%）','Control expanded uncertainty (%)':'质控品扩展不确定度（%）'});
function maraEvidenceDetail(value){
 if(!String(value).startsWith('{'))return value;
 try{return Object.entries(JSON.parse(value)).map(([k,v])=>ui(k)+' = '+(typeof v==='number'?Number(v.toPrecision(8)):typeof v==='boolean'?ui(v?'pass':'fail'):String(v??'—'))).join('; ');}catch{return value;}
}
Object.assign(ZH_TERMS,{'assigned_copies':'拷贝数赋值','residual':'残差','cq':'Cq','positive':'阳性','negative':'阴性','invalid':'无效','mean':'均值','s':'标准偏差','rsd':'相对标准偏差','uMean':'均值标准不确定度','bias':'偏倚','uBias':'偏倚标准不确定度','measured':'测量值','expected':'预期值','Selected results':'所选结果'});
MISSY_HOOKS.define('selReportTitle');
MISSY_HOOKS.use('selReportTitle','mara.report.title',20,next=>function(){return maraProfileActive()&&!SEL_STATE.title?ui('Selected results')+(RUNS.length===1?' — '+runName(RUNS[0]):''):next();});
MISSY_HOOKS.use('selImageItems','mara.figure.metadata',35,next=>function(){const items=next();if(maraProfileActive())for(const x of items)if(x.id.startsWith('img:stdcurve'))x.note='';return items;});
function maraGraphNote(g){return g.id==='stdcurve'?'':g.note||'';}
function maraSyncControlNames(p=SOP){
 for(const c of p.controls||[]){if(!['pos-qual-qc','pos-quant-qc'].includes(c.id))continue;
  const event=p.control_identity?.event||p.method.selected_event||'',pct=c.id==='pos-quant-qc'&&p.analyticalRole==='quantification'?p.calibrator?.certified_content_percent:c.id==='pos-qual-qc'?p.control_identity?.positive_percent:p.comparison?.control_content_percent;
  c.event=event;c.content_percent=pct??'';c.name=event?event+' · '+(pct!==''&&pct!=null?pct+' %':'% (not declared)'):'Positive control · event and content not declared';
 }
}

Object.assign(ZH_TERMS,{'Standard uncertainty model':'标准规定的不确定度模型','Laboratory uncertainty model':'实验室不确定度模型','Uncertainty model':'不确定度模型','Laboratory u0 (percentage points)':'实验室 u0（百分点）','Laboratory ur (fraction)':'实验室 ur（小数）','Laboratory coverage factor k':'实验室包含因子 k','Laboratory range minimum (%)':'实验室模型适用含量下限（%）','Laboratory range maximum (%)':'实验室模型适用含量上限（%）','Laboratory model validated for event and matrix':'实验室模型已针对该转化体及基质验证','Bias and relevant components included':'已包含偏倚及相关分量','uncertainty_basis':'不确定度依据'});
