function keys(){
  const result=new Map();if(!MG.open)return result;
  const buttons=[...document.querySelectorAll(MG.sheet?'#mg-sheet-list button':'#mg-actions .mg-act')].filter(actionable);
  buttons.forEach(b=>b.querySelectorAll('.missy-voice-key').forEach(e=>e.remove()));
  const pending=[];
  for(const button of buttons){const token=button.querySelector('.k')?.textContent.trim().split(/\s/)[0]||'',n=/^(?:[0-9]|1[0-5])$/.test(token)?Number(token):null;if(n!==null&&!result.has(n))result.set(n,button);else pending.push(button);}
  // Sheet key 0 always closes the sheet; never advertise it as an option.
  for(const button of pending){const n=Array.from({length:MG.sheet?15:16},(_,i)=>i+(MG.sheet?1:0)).find(i=>!result.has(i));if(n!==undefined)result.set(n,button);}
  for(const [n,button]of result){const badge=document.createElement('span');badge.className='missy-voice-key';badge.setAttribute('data-i18n-skip','');badge.textContent=' '+t('Voice ','语音 ')+n;(button.querySelector('.k')||button).append(badge);}
  return result;
 }