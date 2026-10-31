/* MARA method definitions use the explicit calculation/evidence engine.
   They are distinct from the existing laboratory SC interpretation. */
MISSY_HOOKS.define('sopEvaluateRun');
MISSY_HOOKS.define('sopProcedureHTML');
const MARA_LABELS={
 'none':'无','Standard figures: none':'标准图：无','rule':'规则','value':'数值','Rapid PCR':'快速 PCR','MARA screening':'MARA 筛查','MARA identification':'MARA 转化体定性检测','MARA quantification':'MARA 定量',
 'Screening':'筛查','Identification':'转化体定性检测','Quantification':'定量',
 'Sample DNA (ng/reaction)':'试样 DNA（ng/反应）','CRM maximum DNA (ng/reaction)':'校准品 DNA 上限（ng/反应）','Auxiliary reference':'辅助参考文献','Below LOQ: detected, not quantified':'低于定量限：检出，未定量','Profile SHA-256':'配置文件 SHA-256','Select the actual Annex A/B panel; catalogue entries are not a tested panel':'选择实际采用的附录 A/B 检测组合；目录条目不代表已检测组合','Method':'方法','Annex B assay catalogue':'附录 B 检测方法目录','GGK2: resolve 50 ng reaction versus 100 ng LOD/LOQ basis':'GGK2：确认反应体系 50 ng 与检出限、定量限依据 100 ng 的差异','LOD DNA basis (ng)':'检出限的 DNA 依据（ng）','LOQ DNA basis (ng)':'定量限的 DNA 依据（ng）','Source standard':'来源标准','Source PDF':'来源 PDF','Source clauses':'来源条款',
 'Method role':'方法用途','Event':'转化体','Reference assay':'内标准基因检测',
 'Subsamples':'平行子样','PCR amplifications per subsample':'每个平行子样的 PCR 扩增次数',
 'Controls: PCR amplifications':'质控品 PCR 扩增次数','Ct cut-off':'Ct 截止值',
 'LOD (%)':'检出限（%）','LOQ (%)':'定量限（%）','LOD (copies)':'检出限（拷贝数）','LOQ (copies)':'定量限（拷贝数）',
 'Unresolved rules':'待确认规则','MARA profile rules':'MARA 配置文件规则',
 'Review only — no release decision':'仅供审核；不作放行决定',
 'Laboratory owner, approved revision and control-name mapping':'实验室负责人、批准版本及质控品名称映射',
 'Typical amplification curve and assay/oligo identity':'典型扩增曲线及检测方法、引物和探针身份',
 'Independent subsample identity and technical replicate mapping':'独立平行子样身份及技术重复孔映射',
 'Complete method decision engine is not implemented':'完整的方法判定引擎尚未实现',
 'Explicit copy units and crop reference pairing':'明确的拷贝数单位及作物内标准基因配对',
 'Two validated standard curves from matched CRM dilutions':'相同校准品稀释系列的两条有效标准曲线',
 'CRM uncertainty or laboratory-prepared control acceptance':'有证标准物质不确定度或实验室配制质控品合格判定',
 'Expanded uncertainty and final result rounding':'扩展不确定度及最终结果修约','Confirm reporting at exactly the LOQ (clauses 6.4.10.2.2 and 6.5)':'确认恰好等于定量限时的报告规则（6.4.10.2.2 及 6.5 条）',
 'KJ1003: verify the 19-bp junction sequence':'KJ1003：核实连接区的 19 bp 序列',
 'Select event assay, reference and quantitative control':'选择转化体检测方法、内标准基因及阳性定量质控品',
 'Verify portable rapid-PCR workflow and matrix':'核实便携式快速 PCR 流程及基质',
 'Stored results retained; automatic method calls blocked':'保留仪器保存的结果；阻止自动方法判定',
 'Not declared':'未声明','At least 3':'至少 3',
 'Download all MARA profiles (ZIP)':'下载全部 MARA 配置文件（ZIP）',
 'Profile rules and implementation gaps':'配置文件规则及实现缺项',
 'At |ddCt| ≤ 0.4, use full quantification':'当 |ΔΔCt| ≤ 0.4 时，采用完整定量方法',
 'ddCt < −0.4: higher; ddCt > +0.4: lower':'ΔΔCt < −0.4：高于对照；ΔΔCt > +0.4：低于对照',
 'CRM: |bias| < 2 × u_bias':'有证标准物质：|bias| < 2 × u_bias',
 'Laboratory control: sR ≤ 25% and |biasR| ≤ 25%':'实验室配制质控品：sR ≤ 25% 且 |biasR| ≤ 25%',
 'Sample: s′R ≤ 25% only at or above LOQ':'试样：达到或超过定量限时，s′R ≤ 25%',
 'Screening is limited to the tested panel at its stated LOD':'筛查结论仅适用于实际检测靶标及其所述检出限',
 'Standard curve: R² ≥ 0.98; slope −3.6 to −3.1; ≥5 levels':'标准曲线：R² ≥ 0.98；斜率 −3.6 至 −3.1；至少 5 个浓度梯度',
 'Review gates remain active even if the draft is locked':'即使锁定草案，审核限制仍然有效'
};
Object.assign(ZH_TERMS,MARA_LABELS);
function maraProfileActive(p=SOP){return String(p?.method?.id||'').startsWith('MARA1012-');}
function maraStandardsIndex(){
 const lines=['# MARA 1012 — JSON profiles and method references','','32 JSON profiles: 2 screening, 15 identification, 15 quantification.','','Calculations are provisional until laboratory approval. Enter actual control assignments; no commercial CRM identity or percentage is invented. The LOD is not the positive-control percentage.','','## Method specifications','','- Identification, standards 1–15: section 5. Controls: 5.4.5 / 5.4.7; three independent subsamples × one PCR each (5.4.6.1); majority interpretation (5.5); conditional relative comparison (5.5.2). Positive control: the named event at an actual content within 0.1–1.0% (5.4.5.3).','- Quantification, standards 1–15: section 6. Three subsamples × at least three PCR each (6.4.7.1); matched CRM curves (6.4.6–6.4.8); ratio of mean copies (6.4.9); separate QC/sample acceptance (6.4.10); per-event uncertainty (6.4.11); reporting (6.5); LOD/LOQ (6.6–6.7). Quantitative control: the named event at its actual assigned/certified percentage, comparable to the declared threshold.','- Threshold screening, standard 16: control/uncertainty coverage (3.1); ≥3 subsamples × three PCR each (5.3.6.1); controls (5.3.7); two-stage ΔCt/ΔΔCt (5.3.8); decisions and inclusive ±0.4 band (5.4). No numerical percentage or calibration curves.','- Presence screening, standard 17: controls (7.3.4–7.3.5); sample calls (8.1); LOD 1% (10). No fixed positive-control percentage is specified. Record the actual event/target-containing material and assigned percentage when applicable. Plasmids have no genomic mass fraction by default.','','## Profiles',''];
 for(const role of ['screening','identification','quantification']){
  lines.push('### '+role,'','| SOP / standard | Event / scope | Reference | JSON | Control declaration |','|---|---|---|---|---|');
  for(const x of MARA_PROFILE_LIBRARY.filter(x=>x.role===role)){
   const p=x.profile,event=x.event||(x.standard===16?'Selected published event assay':'Selected Annex A/B panel'),ref=p.method.reference_genes?.map(r=>r.target).join(', ')||'Declare matching crop reference';
   const control=role==='identification'?event+' — actual control 0.1–1.0%':role==='quantification'?event+' — X% (assigned/certified)':x.standard===16?'Selected event — X%, threshold and uncertainty':'Actual event/target control; no fixed % specified';
   lines.push('| '+p.name+' | '+event+' | '+ref+' | ['+x.key+'.json]('+x.key+'.json) | '+control+' |');
  }lines.push('');
 }
 lines.push('## Differences and unresolved inputs','','- GGK2: Sad1 reference; resolve the 50 ng reaction / 100 ng LOD–LOQ basis discrepancy.','- KJC017: 22/44-copy LOD/LOQ; other event standards use 20/40 copies.','- KJ1003: confirm the documented 19-bp junction sequence.','- Uncertainty constants, DNA inputs and CRM maxima are standard-specific.','- Exact-LOQ reporting requires a laboratory policy; default: hold for review.','- Uncertainty mode: standard (default) or validated laboratory total model. Laboratory coefficients replace the standard budget; no complete uncertainties are automatically added together. Laboratory scope, range, components and coverage factor must be confirmed. JRC MU guidance 3rd edition, sections 2.3–2.5, explains precision/bias combination within one budget.','- Sample-name regex must capture sample and subsample identities. Record explicit curve evidence, CRM copy assignments and quantitative-QC reaction pairing.','- Standards 18–20 concern bioinformatics/sequencing and are outside these qPCR profiles.','','## Source files','','Each JSON records source clauses and the PDF checksum. Sources: D:/IXO/CHINESE/gmo/.');
 for(const n of [...new Set(MARA_PROFILE_LIBRARY.map(x=>x.standard))].sort((a,b)=>a-b)){const p=MARA_PROFILE_LIBRARY.find(x=>x.standard===n).profile;lines.push('- '+p.name+': '+p.method.sources[0].pdf);}
 lines.push('','Supporting explanation: A standard-curve-free ΔΔCt method for rapid GMO compliance screening relative to labeling thresholds, doi:10.3389/fpls.2026.1918379, sections 2.2 and 3.3. Research examples do not replace normative MARA requirements.','',
 '## Reproducing the embedded profile SHA-256','',
 'Hash the delivered JSON object directly, without applying defaults or normalisation. Remove only the top-level sha256 and locked properties. Recursively sort object keys using JavaScript Object.keys(value).sort(); preserve array order and all values. Serialize with JSON.stringify (no indentation, no trailing newline). Hash its UTF-8 bytes, without BOM, using SHA-256; output lowercase hexadecimal. This is the application sopCanonical/sopHash algorithm, not RFC 8785. The locked flag is deliberately excluded so that locking does not change the scientific profile identity. No nested fields are removed. SHA256SUMS.txt instead hashes the exact file bytes, including formatting and final newline.','',
 'Independent Node.js reproduction (save as verify-profile.cjs; run node verify-profile.cjs profile.json):','',
 '```js',
 "const fs = require('node:fs'), crypto = require('node:crypto');",
 "const p = JSON.parse(fs.readFileSync(process.argv[2], 'utf8').replace(/^\\uFEFF/, ''));",
 'const expected = p.sha256; delete p.sha256; delete p.locked;',
 "const sort = v => Array.isArray(v) ? v.map(sort) : v && typeof v === 'object' ? Object.keys(v).sort().reduce((o,k) => (o[k]=sort(v[k]),o),{}) : v;",
 "const actual = crypto.createHash('sha256').update(JSON.stringify(sort(p)), 'utf8').digest('hex');",
 "console.log(actual); if (actual !== expected) process.exitCode = 1;",
 '```','');return lines.join('\n');
}
function maraRoleLabel(p=SOP){return ({screening:'Screening',identification:'Identification',quantification:'Quantification'})[p.analyticalRole]||'Screening';}
for(const entry of MARA_PROFILE_LIBRARY){
 SOP_PRESETS[entry.key]=()=>JSON.parse(JSON.stringify(entry.profile));
 const en=entry.profile.name,role=maraRoleLabel(entry.profile);
 // The SOP name is the standard code in both languages; role is the menu group.
}
const MARA_GAPS={laboratory_mapping:'Laboratory owner, approved revision and control-name mapping',curve_evidence:'Typical amplification curve and assay/oligo identity',subsample_mapping:'Independent subsample identity and technical replicate mapping',method_engine:'Complete method decision engine is not implemented',copy_units:'Explicit copy units and crop reference pairing',dual_curves:'Two validated standard curves from matched CRM dilutions',qc_uncertainty:'CRM uncertainty or laboratory-prepared control acceptance',report_rounding:'Expanded uncertainty and final result rounding',loq_boundary:'Confirm reporting at exactly the LOQ (clauses 6.4.10.2.2 and 6.5)',dna_basis:'GGK2: resolve 50 ng reaction versus 100 ng LOD/LOQ basis'};
function maraGaps(p=SOP){const gaps=(p.implementationReview||Object.keys(MARA_GAPS)).map(k=>MARA_GAPS[k]||k);
 if(p.method?.selected_event==='KJ1003')gaps.push('KJ1003: verify the 19-bp junction sequence');
 if(p.method?.standard_number===16)gaps.push('Select event assay, reference and quantitative control');
 if(p.method?.standard_number===17)gaps.push('Verify portable rapid-PCR workflow and matrix','Select the actual Annex A/B panel; catalogue entries are not a tested panel');if(typeof maraNumericProblems==='function')gaps.push(...maraNumericProblems(p));return gaps;}
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
MISSY_HOOKS.use('sopProcedureHTML','mara.method.summary',10,next=>function(){
 if(!maraProfileActive())return next();
 const rows=maraRuleRows();
 return `<details class="sop-sec" open><summary>${esc(ui('0 · Method, procedure and interpretation'))}</summary><p class="notice warn">${esc(ui('Review only — no release decision'))}</p><div class="kv mara-profile-grid">${rows.map(r=>`<b>${esc(r.rule)}</b><span style="overflow-wrap:anywhere" data-i18n-skip>${esc(r.value)}</span>`).join('')}</div><h4>${esc(ui('Unresolved rules'))}</h4><ul>${maraGaps().map(x=>`<li>${esc(ui(x))}</li>`).join('')}</ul></details>`;
});
MISSY_HOOKS.use('sopEvaluateRun','mara.method.calculation',10,next=>function(run,ri){
 return maraProfileActive()?maraEvaluateRun(run,ri):next(run,ri);
});
document.addEventListener('DOMContentLoaded',()=>{
 /* Presentation CSS is embedded in the initial style block. */
 const select=document.getElementById('sop-preset');
 for(const role of ['screening','identification','quantification']){
  const group=document.createElement('optgroup');group.dataset.maraRole=role;group.label=ui('MARA '+role);
  for(const item of MARA_PROFILE_LIBRARY.filter(x=>x.role===role))group.append(new Option(item.profile.name,item.key));select.append(group);
 }
 const zip=document.createElement('button');zip.type='button';zip.className='ghost';zip.id='mara-download-profiles';zip.textContent='Download all MARA profiles (ZIP)';
 zip.onclick=()=>{const files=MARA_PROFILE_LIBRARY.map(x=>({name:x.key+'.json',data:JSON.stringify(x.profile,null,2)+'\n'}));files.push({name:'STANDARDS_INDEX.md',data:maraStandardsIndex()});files.push({name:'SHA256SUMS.txt',data:'# Exact-file SHA-256 (all bytes, formatting and final newline); NOT the embedded canonical profile sha256.\n'+files.map(x=>sha256Hex(new TextEncoder().encode(x.data))+'  '+x.name).join('\n')+'\n'});download('MARA1012_review_profiles.zip',makeStoredZip(files),'application/zip');};
 document.getElementById('sop-save').after(zip);
 const paint=()=>{for(const group of select.querySelectorAll('[data-mara-role]')){group.label=ui('MARA '+group.dataset.maraRole);for(const option of group.querySelectorAll('option')){option.setAttribute('data-i18n-skip','');option.textContent=ui(MARA_PROFILE_LIBRARY.find(x=>x.key===option.value).profile.name);}}};document.getElementById('language-select')?.addEventListener('change',paint);paint();
});
