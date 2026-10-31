function(){
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
}