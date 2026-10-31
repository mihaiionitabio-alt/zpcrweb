function astCount(){
  const el=astEl("ast-count");if(!el)return;
  const s=selSelected();
  el.textContent=`${s.length} selected · ${s.filter(x=>x.kind==="image").length} figure(s) · ${s.filter(x=>x.kind==="data").length} table(s)`;
}