function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;
  let box=document.getElementById('missy-evidence-summary');
  if(!box){box=document.createElement('details');box.id='missy-evidence-summary';box.setAttribute('data-i18n-skip','');host.append(box);}
  box.hidden=!RUNS.length;const open=box.open;
  const title=document.createElement('summary');title.textContent=text('Data evidence and limits (read only)','数据记录与局限（只读）');MISSY_EVIDENCE_A11Y.reset(box,title);
  if(!open)return;
  const note=document.createElement('p');note.className='hint';note.textContent=text('Decoded-view inventory only. Not a sample verdict or MISSY 0.3 conformance assessment.','仅列出此解码视图中的记录。不代表样本判定或 MISSY 0.3 符合性评估。');box.append(note);
  const all=rows(true);
  RUNS.forEach((run,i)=>{
   const card=document.createElement('div'),h=document.createElement('h4'),dl=document.createElement('dl');card.className='evidence-run';h.textContent=(i+1)+' · '+run.file;card.append(h,dl);
   for(const r of all.filter(r=>r.evidence_view===i+1)){const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=r.evidence_item;value.textContent=r.evidence_state+(r.evidence_detail?' · '+r.evidence_detail:'');dl.append(term,value);}
   box.append(card);
  });
 }