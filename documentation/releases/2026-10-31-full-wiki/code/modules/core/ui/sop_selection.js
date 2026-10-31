/* A method must be selected deliberately; retired SC presets are not restored. */
Object.assign(ZH_TERMS,{'No SOP selected':'尚未选择SOP','Select a SOP profile':'请选择SOP配置','Select a SOP profile before interpreting experiment results.':'判定实验结果前，请先选择SOP配置。'});
document.addEventListener('DOMContentLoaded',()=>{
 const select=document.getElementById('sop-preset'),apply=document.getElementById('sop-apply-preset');
 const sync=()=>{apply.disabled=!select.value||typeof SOP_PRESETS[select.value]!=='function';};
 select.addEventListener('change',sync);sync();localizeDOM(select);
});
