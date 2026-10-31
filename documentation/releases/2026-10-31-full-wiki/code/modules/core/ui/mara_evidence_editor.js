/* Explicit run evidence; no assay status, copies or independent extractions are
 * inferred from an instrument's display name, missing Cq, or well ordering. */
Object.assign(ZH_TERMS,{
 '10 · Method inputs':'10 · 方法输入','Select run':'选择运行','Method and reaction protocol verified':'已核实检测方法及反应程序','Same run and plate verified':'已确认同次运行及同一反应板','CRM dilution range and DNA inputs verified':'已核实 CRM 稀释范围及 DNA 加样量','Rapid-PCR workflow verified':'已核实快速 PCR 流程','KJ1003 junction sequence verified':'已核实 KJ1003 连接区序列','GGK2 DNA basis resolved':'已确认 GGK2 DNA 依据',
 'Curve evidence':'曲线证据','unknown':'未确认','typical':'典型扩增','absent':'无扩增','atypical':'非典型扩增','Reaction use':'反应用途','Stored role':'已保存用途','CRM dilution':'CRM 稀释梯度','Level ID':'梯度标识','Assigned copies':'拷贝数赋值','QC pair ID':'质控配对标识','Export method inputs':'导出方法输入','Import method inputs':'导入方法输入','Method input file does not match this source and SOP':'方法输入文件与此源文件及 SOP 不匹配','Method inputs imported':'已导入方法输入','Sample-name capture groups':'样品名称捕获组','Automatic results':'自动结果','Quantitative QC material':'阳性定量质控材料','Certified CRM':'有证标准物质','Laboratory-prepared control':'实验室配制质控品','At exactly LOQ':'恰好达到定量限时','Hold for review':'保留待审核','Quantify at LOQ':'在定量限处报告定量结果',
 'Exported inputs are bound to the source checksum and SOP checksum':'导出的输入与源文件及 SOP 的校验和绑定','Section 5.5.2 relative comparison':'5.5.2 条相对含量比较','Control GMO event':'质控品转化体','Positive-control content (%)':'阳性质控品含量（%）'
});
function maraRenderEvidence(ri=0){
 const old=document.getElementById('mara-run-inputs');old?.remove();if(!maraProfileActive())return;
 const section=document.createElement('details');section.id='mara-run-inputs';section.className='sop-sec';section.open=true;
 section.innerHTML=`<summary>${esc(ui('10 · Method inputs'))}</summary><label>${esc(ui('Select run'))} <select id="mara-evidence-run">${RUNS.map((r,i)=>`<option value="${i}"${i===ri?' selected':''}>${esc(runName(r))}</option>`).join('')}</select></label><div id="mara-input-context" class="sop-grid"></div><div style="overflow:auto;max-height:440px"><table id="mara-input-reactions"><thead><tr>${['Well','Sample','Target','Cq','Curve evidence','Reaction use','Level ID','Assigned copies','QC pair ID'].map(x=>`<th>${esc(ui(x))}</th>`).join('')}</tr></thead><tbody></tbody></table></div><div class="row"><button id="mara-input-export" class="ghost">${esc(ui('Export method inputs'))}</button><button id="mara-input-import" class="ghost">${esc(ui('Import method inputs'))}</button><input id="mara-input-file" type="file" accept=".json" hidden><span id="mara-input-message"></span></div>`;
 document.getElementById('mara-method-settings')?.after(section);
 const run=RUNS[ri];if(!run){section.querySelector('table').hidden=true;section.querySelector('.row').hidden=true;return;}
 section.querySelector('#mara-evidence-run').onchange=e=>maraRenderEvidence(Number(e.target.value));
 const evidence=maraEvidence(run),input=maraInput(run),ctx=section.querySelector('#mara-input-context');
 const facts=[['methodVerified','Method and reaction protocol verified']];
 if(SOP.analyticalRole==='quantification')facts.push(['samePlateVerified','Same run and plate verified'],['calibrationRangeVerified','CRM dilution range and DNA inputs verified']);
 else if(SOP.method.standard_number===15)facts.push(['samePlateVerified','Same run and plate verified']);
 else if(SOP.method.standard_number===16)facts.push(['samePlateVerified','Same run and plate verified']);
 if(SOP.method.standard_number===17)facts.push(['rapidWorkflow','Rapid-PCR workflow verified']);
 if(SOP.method.standard_number===6)facts.push(['sequenceVerified','KJ1003 junction sequence verified']);
 if(SOP.dnaBasisDiscrepancy)facts.push(['dnaBasisVerified','GGK2 DNA basis resolved']);
 const changed=()=>{sopChanged();markDirty('results','graphs','review','panel');renderSopResults();};
 for(const [key,label] of facts){const el=document.createElement('label');el.innerHTML=`<input type="checkbox"${evidence.context[key]?' checked':''}> ${esc(ui(label))}`;el.firstChild.onchange=e=>{evidence.context[key]=e.target.checked;changed();};ctx.append(el);}
 const body=section.querySelector('tbody');
 for(const r of input.records){const w=r.source,e=evidence.reactions[r.id]||(evidence.reactions[r.id]={});const tr=document.createElement('tr');
  tr.innerHTML=`<td data-i18n-skip>${esc(w.well||w.pos)}</td><td data-i18n-skip>${esc(r.sample)}</td><td data-i18n-skip>${esc(w.target||w.analysis)}</td><td>${Number.isFinite(r.cq)?r.cq:'—'}</td><td><select data-key="curve">${['unknown','typical','absent','atypical'].map(v=>`<option value="${v}"${r.curve===v?' selected':''}>${esc(ui(v))}</option>`).join('')}</select></td><td><select data-key="kind"><option value="">${esc(ui('Stored role'))}</option><option value="calibrator"${e.kind==='calibrator'?' selected':''}>${esc(ui('CRM dilution'))}</option></select></td><td><input data-key="level" value="${esc(e.level||'')}" style="width:90px"></td><td><input type="number" min="0" step="any" data-key="copies" value="${esc(e.copies??'')}" style="width:110px"></td><td><input data-key="pair" value="${esc(e.pair||'')}" style="width:90px"></td>`;
  for(const el of tr.querySelectorAll('[data-key]'))el.onchange=()=>{e[el.dataset.key]=el.type==='number'?(el.value===''?'':Number(el.value)):el.value;changed();};body.append(tr);
 }
 const stamp=()=>({schema:'missy-mara-inputs/1',source_sha256:run.meta?.sourceSHA256||'',sop_sha256:sopHash()});
 section.querySelector('#mara-input-export').onclick=()=>{if(!stamp().source_sha256){section.querySelector('#mara-input-message').textContent=ui('Source checksum required');return;}download(safeName(runName(run))+'_method_inputs.json',JSON.stringify({...stamp(),evidence},null,2),'application/json');};
 section.querySelector('#mara-input-import').onclick=()=>section.querySelector('#mara-input-file').click();
 section.querySelector('#mara-input-file').onchange=async ev=>{try{const x=JSON.parse(await ev.target.files[0].text()),s=stamp();if(!s.source_sha256||x.schema!==s.schema||x.source_sha256!==s.source_sha256||x.sop_sha256!==s.sop_sha256||!x.evidence||typeof x.evidence.context!=='object'||!x.evidence.reactions)throw Error(ui('Method input file does not match this source and SOP'));const known=new Set(input.records.map(r=>r.id));if(Object.keys(x.evidence.reactions).some(k=>!known.has(k)))throw Error(ui('Method input file does not match this source and SOP'));Object.assign(evidence,{context:x.evidence.context,reactions:x.evidence.reactions});changed();maraRenderEvidence(ri);}catch(err){section.querySelector('#mara-input-message').textContent=err.message;}};
 localizeDOM(section);
}
MISSY_HOOKS.use('renderSopEditor','mara.run.inputs',25,next=>function(){next();maraRenderEvidence();});
