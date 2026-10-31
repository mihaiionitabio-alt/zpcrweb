function reset(box,title){
  const summary=box.querySelector(':scope > summary');
  if(!summary){box.replaceChildren(title);return;}
  if(summary.textContent!==title.textContent)summary.textContent=title.textContent;
  for(const child of [...box.childNodes])if(child!==summary)child.remove();
 }