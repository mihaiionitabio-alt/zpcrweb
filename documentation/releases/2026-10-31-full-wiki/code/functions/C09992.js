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