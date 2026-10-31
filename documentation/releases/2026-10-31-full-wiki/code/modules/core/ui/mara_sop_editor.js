/* Explicit numeric method inputs extend qpcr-sop-profile/1 without changing SC.
   Free-text rule descriptions document the versioned engine; they are not scripts. */
MISSY_HOOKS.define('renderSopEditor');
Object.assign(SOP_ACTION_LABEL,{'declared-crop-reference-required':'Declared crop reference required','taxon-must-match-declared-matrix':'Taxon must match declared matrix'});
Object.assign(ZH_TERMS,{
 '9 · Method settings':'9 · 方法设置','Sample name format':'样品名称格式','Pattern flags':'匹配标志',
 'Declared event':'声明的转化体','Declared crop reference required':'必须使用声明作物的内标准基因','Taxon must match declared matrix':'物种必须与声明基质相符',
 'CRM':'有证标准物质（CRM）','CRM material':'CRM 材料','CRM lot':'CRM 批次','CRM content basis':'CRM 含量依据','copy-number ratio':'拷贝数比值','mass fraction':'质量分数',
 'Certified content (%)':'认定含量（%）','Certificate uncertainty (%)':'证书不确定度（%）','Certificate uncertainty type':'证书不确定度类型','Certificate coverage factor k':'证书包含因子 k',
 'CRM dilution levels (minimum)':'CRM 稀释梯度数（最少）','Use the same CRM dilutions for both curves':'两条曲线使用相同 CRM 稀释系列',
 'Curve quantity unit':'标准曲线的量值单位','standard':'标准不确定度','expanded':'扩展不确定度','copies':'拷贝数',
 'Calculation and acceptance':'计算与合格判定','Minimum curve slope':'标准曲线斜率下限','Maximum curve slope':'标准曲线斜率上限',
 'Absolute uncertainty u0':'绝对标准不确定度 u0','Relative uncertainty ur':'相对标准不确定度 ur','Coverage factor k':'包含因子 k',
 'Range coefficient f (n=3)':'极差系数 f（n=3）','Expanded uncertainty significant figures':'扩展不确定度有效数字位数','Round result to the uncertainty last digit':'结果修约至不确定度的末位',
 'Maximum sample RSD at or above LOQ (%)':'达到或超过定量限时的试样相对标准偏差上限（%）',
 'Lower ddCt boundary':'ΔΔCt 下边界','Upper ddCt boundary':'ΔΔCt 上边界','Inside-band action':'区间内处理',
 'quantification required':'需要定量','Decision rules':'判定规则','Rule ID':'规则编号','Condition':'条件','Action':'处理','Outcome':'结果',
 'Add decision rule':'添加判定规则','Selected screening panel':'所选筛查靶标组合',
 'Invalid sample-name pattern':'样品名称匹配表达式无效','Invalid method numeric settings':'方法数值设置无效'
});
function maraSettingsHTML(){
 const f=(label,path,type='text',options)=>sopField(label,path,type,options);
 let html=`<details class="sop-sec" id="mara-method-settings" open><summary>${esc(ui('9 · Method settings'))}</summary><div class="sop-grid">${f('Sample name format','sample_id.pattern')}${f('Pattern flags','sample_id.flags')}${f('Declared event','method.selected_event')}${f('Reference assay','method.reference_genes.0.target')}</div>`;
 html+=`<div class="sop-grid">${f('Control GMO event','control_identity.event')}${SOP.analyticalRole!=='quantification'&&SOP.method.standard_number!==16?f('Positive-control content (%)','control_identity.positive_percent','number'):''}</div>`;
 if(SOP.method.standard_number===16)html+=`<div class="sop-grid">${f('Control content','comparison.control_content_percent','number')}${f('Labelling threshold (%)','comparison.labelling_threshold_percent','number')}${f('Control expanded uncertainty (%)','comparison.control_expanded_uncertainty_percent','number')}</div>`;
 if(SOP.analyticalRole==='quantification'){
  html+=`<h4>${esc(ui('CRM'))}</h4><div class="sop-grid">${f('CRM material','calibrator.crm_material')}${f('CRM lot','calibrator.crm_lot')}${f('CRM content basis','calibrator.content_basis','select',['','copy-number ratio','mass fraction'])}${f('Certified content (%)','calibrator.certified_content_percent','number')}${f('Certificate uncertainty (%)','calibrator.certified_uncertainty_percent','number')}${f('Certificate uncertainty type','calibrator.certificate_uncertainty_kind','select',['','standard','expanded'])}${f('Certificate coverage factor k','calibrator.certificate_k','number')}${f('CRM dilution levels (minimum)','calibrator.levels_min','number')}${f('CRM maximum DNA (ng/reaction)','calibrator.maximum_template_ng_per_reaction','number')}${f('Sample DNA (ng/reaction)','reaction.template_ng_per_reaction','number')}${f('Use the same CRM dilutions for both curves','calibrator.shared_dilutions','check')}${f('Curve quantity unit','calibrator.quantity_unit','select',['copies'])}</div>`;
  html+=`<h4>${esc(ui('Calculation and acceptance'))}</h4><div class="sop-grid">${f('Minimum curve slope','run.slopeMin','number')}${f('Maximum curve slope','run.slopeMax','number')}${f('LOD (%)','performance.lod_percent','number')}${f('LOQ (%)','performance.loq_percent','number')}${f('Absolute uncertainty u0','calculation.uncertainty.u0','number')}${f('Relative uncertainty ur','calculation.uncertainty.ur','number')}${f('Coverage factor k','calculation.uncertainty.coverage_factor_k','number')}${f('Range coefficient f (n=3)','calculation.range_coefficient_f.n_3','number')}${f('Expanded uncertainty significant figures','calculation.uncertainty.expanded_significant_figures','number')}${f('Round result to the uncertainty last digit','calculation.uncertainty.align_result_to_uncertainty','check')}${f('Maximum sample RSD at or above LOQ (%)','data_acceptance.sample.if_mean_at_or_above_LOQ.maximum_rsd_percent','number')}</div>`;
 }
 if(SOP.analyticalRole==='identification'&&SOP.comparison)html+=`<div class="sop-grid">${f('Section 5.5.2 relative comparison','comparison.enabled','check')}</div>`;
 if(SOP.analyticalRole==='quantification')html+=`<div class="sop-grid">${f('Quantitative QC material','calibrator.qc_kind','select',['CRM','laboratory'])}${f('At exactly LOQ','calibrator.loq_boundary','select',['review','quantify'])}</div>`;
 if(SOP.analyticalRole==='quantification')html+=`<h4>${esc(ui('Uncertainty model'))}</h4><div class="sop-grid">${f('Uncertainty model','calculation.uncertainty.mode','select',['standard','laboratory'])}${f('Laboratory u0 (percentage points)','calculation.uncertainty.laboratory.u0','number')}${f('Laboratory ur (fraction)','calculation.uncertainty.laboratory.ur','number')}${f('Laboratory coverage factor k','calculation.uncertainty.laboratory.coverage_factor_k','number')}${f('Laboratory range minimum (%)','calculation.uncertainty.laboratory.range_min_percent','number')}${f('Laboratory range maximum (%)','calculation.uncertainty.laboratory.range_max_percent','number')}${f('Laboratory model validated for event and matrix','calculation.uncertainty.laboratory.validated','check')}${f('Bias and relevant components included','calculation.uncertainty.laboratory.components_complete','check')}</div>`;
 if(SOP.method?.standard_number===17){const assays=[...(SOP.targets||[]).filter(x=>x.kind==='target').map(x=>x.match.split('|')[0]),...(SOP.method.rapid_event_assay_catalogue||[]).map(x=>x.target)];
  html+=`<h4>${esc(ui('Selected screening panel'))}</h4><select id="mara-panel-assays" multiple size="6" style="width:100%">${assays.map(x=>`<option value="${esc(x)}"${(SOP.method.selected_assays||[]).includes(x)?' selected':''} data-i18n-skip>${esc(x)}</option>`).join('')}</select>`;}
 html+=`<h4>${esc(ui('Decision rules'))}</h4><div id="mara-decision-rules"></div></details>`;return html;
}
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
MISSY_HOOKS.use('renderSopEditor','mara.method.editor',15,next=>function(){
 next();if(!maraProfileActive())return;
 const box=document.getElementById('sop-editor'),json=document.getElementById('sop-json')?.closest('details');if(!box||!json)return;
 const holder=document.createElement('div');holder.innerHTML=maraSettingsHTML();const section=holder.firstElementChild;json.before(section);
 const mode=section.querySelector('#sopf-calculation-uncertainty-mode');if(mode)for(const o of mode.options)o.textContent=o.value==='standard'?'Standard uncertainty model':'Laboratory uncertainty model';
 const refresh=()=>{SOP.profileSchemaVersion=Math.max(3,SOP.profileSchemaVersion||1);maraSyncControlNames();for(const el of box.querySelectorAll('#sop-controls input[data-k=name]'))el.value=SOP.controls[Number(el.dataset.i)]?.name||'';sopProfileEdited();document.getElementById('sop-json').value=sopJSON();const summary=box.querySelector('.mara-profile-grid')?.closest('details');if(summary)summary.outerHTML=sopProcedureHTML();localizeDOM(box);};
 for(const el of section.querySelectorAll('[data-sop-path]')){el.disabled=!!SOP.locked;el.onchange=()=>{sopSetPath(el.dataset.sopPath,el.type==='checkbox'?el.checked:el.type==='number'?(el.value===''?'':Number(el.value)):el.value);refresh();};}
 for(const path of ['calculation.uncertainty.u0','calculation.uncertainty.ur','calculation.uncertainty.coverage_factor_k']){const el=section.querySelector(`[data-sop-path="${path}"]`);if(el)el.readOnly=true;}
 const panel=section.querySelector('#mara-panel-assays');if(panel){panel.disabled=!!SOP.locked;panel.onchange=()=>{SOP.method.selected_assays=[...panel.selectedOptions].map(x=>x.value);refresh();};}
 if(!SOP.interpretation)SOP.interpretation={rules:[]};
 sopTableEditor(section.querySelector('#mara-decision-rules'),SOP.interpretation.rules||[],[{key:'id',label:'Rule ID',w:85},{key:'when',label:'Condition',w:230},{key:'action',label:'Action',w:230},{key:'outcome',label:'Outcome',w:100}], 'Add decision rule',()=>({id:'',when:'',action:'',outcome:'Inconclusive'}));
 for(const old of section.querySelectorAll('#mara-decision-rules input[data-k=when],#mara-decision-rules input[data-k=action]')){const area=document.createElement('textarea');area.value=old.value;area.dataset.i=old.dataset.i;area.dataset.k=old.dataset.k;area.rows=2;area.style.cssText='width:100%;min-width:230px;min-height:52px;resize:vertical';area.disabled=!!SOP.locked;area.onchange=()=>{SOP.interpretation.rules[Number(area.dataset.i)][area.dataset.k]=area.value;sopProfileEdited();};old.replaceWith(area);}
 section.querySelector('#mara-decision-rules').addEventListener('change',()=>{document.getElementById('sop-json').value=sopJSON();});
 localizeDOM(section);
});
