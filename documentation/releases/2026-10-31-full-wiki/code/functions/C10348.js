function refresh(id,render){
  const box=document.getElementById(id),active=document.activeElement;
  let saved=null;
  if(box&&active&&box.contains(active)&&active.matches('summary,button,input,select,textarea,a[href]')){
   const controls=[...box.querySelectorAll('summary,button,input,select,textarea,a[href]')],card=active.closest('.native-card');
   saved={index:controls.indexOf(active),tag:active.tagName,type:active.getAttribute('type'),key:active.dataset.nativeIndex,source:card?.querySelector('h4')?.textContent};
  }
  const result=render();
  if(saved&&document.activeElement!==active){
   const current=document.getElementById(id),target=current?.querySelectorAll('summary,button,input,select,textarea,a[href]')[saved.index];
   if(target&&target.tagName===saved.tag&&target.getAttribute('type')===saved.type&&target.dataset.nativeIndex===saved.key&&target.closest('.native-card')?.querySelector('h4')?.textContent===saved.source&&!current.hidden&&!target.disabled){target.focus({preventScroll:true});}
  }
  return result;
 }