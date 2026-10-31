function renderContent(){
  const host=document.getElementById('loadedcard');if(!host)return;
  let box=document.getElementById('missy-evidence-guide');
  if(!box){box=document.createElement('details');box.id='missy-evidence-guide';box.setAttribute('data-i18n-skip','');box.addEventListener('toggle',render);host.append(box);}
  const zh=UI_LANG==='zh',title=document.createElement('summary');title.textContent=zh?'证据含义与界限（只读）':'Evidence meanings and limits (read only)';MISSY_EVIDENCE_A11Y.reset(box,title);
  if(!box.open)return;
  const dl=document.createElement('dl');for(const item of items){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=item[zh?1:0];dd.textContent=item[zh?3:2];dl.append(dt,dd);}box.append(dl);
 }