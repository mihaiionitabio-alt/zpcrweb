()=>{
 const select=document.getElementById('sop-preset'),apply=document.getElementById('sop-apply-preset');
 const sync=()=>{apply.disabled=!select.value||typeof SOP_PRESETS[select.value]!=='function';};
 select.addEventListener('change',sync);sync();localizeDOM(select);
}