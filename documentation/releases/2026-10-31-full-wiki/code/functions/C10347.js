()=>{
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
 function reset(box,title){
  const summary=box.querySelector(':scope > summary');
  if(!summary){box.replaceChildren(title);return;}
  if(summary.textContent!==title.textContent)summary.textContent=title.textContent;
  for(const child of [...box.childNodes])if(child!==summary)child.remove();
 }
 const style=document.createElement('style');
 style.textContent=["missy-evidence-summary", "missy-provenance-details", "missy-native-inspector", "missy-instrument-context", "missy-scope-snapshot", "missy-evidence-guide", "missy-reader-inventory", "missy-export-dictionary", "missy-source-matches", "missy-calibration-metadata"].map(id=>['summary','button','input','select','a[href]'].map(tag=>'#'+id+' '+tag+':focus-visible').join(',')).join(',')+'{outline:3px solid #1872c7;outline-offset:3px;box-shadow:0 0 0 1px white}';
 document.head.append(style);
 return Object.freeze({refresh,reset});
}