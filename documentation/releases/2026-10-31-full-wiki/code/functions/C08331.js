function astOutput(){
  const r=document.querySelector('#astm input[name="ast-out"]:checked');
  return r?r.value:"pdf";
}