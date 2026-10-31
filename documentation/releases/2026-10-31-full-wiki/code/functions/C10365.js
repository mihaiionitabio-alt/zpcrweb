(run,i)=>{
   const card=document.createElement('div'),h=document.createElement('h4'),dl=document.createElement('dl');card.className='evidence-run';h.textContent=(i+1)+' · '+run.file;card.append(h,dl);
   for(const r of all.filter(r=>r.evidence_view===i+1)){const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=r.evidence_item;value.textContent=r.evidence_state+(r.evidence_detail?' · '+r.evidence_detail:'');dl.append(term,value);}
   box.append(card);
  }