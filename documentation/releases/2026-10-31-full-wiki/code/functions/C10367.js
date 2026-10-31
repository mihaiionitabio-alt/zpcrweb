function boot(){
  render();const box=document.getElementById('missy-evidence-summary');box?.addEventListener('toggle',render);
  const loaded=document.getElementById('loaded');if(loaded)new MutationObserver(render).observe(loaded,{childList:true});
  new MutationObserver(render).observe(document.body,{attributes:true,attributeFilter:['class']});
 }