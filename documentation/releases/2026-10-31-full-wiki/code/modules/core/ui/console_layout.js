/* Console presentation only: reserve space for the chart, retain all controls. */
Object.assign(ZH_TERMS,{'View · Zoom / pan':'视图 · 缩放和平移','Appearance':'外观','Chart / graph':'图表 / 图形'});
/* Presentation CSS is embedded in the initial style block. */

/* Selection feedback is visual only; native button behavior remains unchanged. */
/* Presentation CSS is embedded in the initial style block. */
document.addEventListener('click',e=>{const button=e.target.closest('#mg-actions button,#mg-sheet-list button,#missy-console-voice-controls button,#missy-console-voice button');if(!button||button.disabled)return;const kind=MG.sheet?.kind,group=['view','zoom','pan'].includes(kind)?'view menu':kind==='appearance'?'appearance menu':kind?'navigation menu':button.dataset.cmd;
 const pulse=node=>{if(!node)return;node.classList.remove('missy-selected-feedback');void node.offsetWidth;node.classList.add('missy-selected-feedback');setTimeout(()=>node.classList.remove('missy-selected-feedback'),300);};pulse(button);
 setTimeout(()=>{if(!button.isConnected){const replacement=[...document.querySelectorAll('#mg-actions button')].find(b=>b.dataset.cmd===group);pulse(replacement);}if(MG.sheet)pulse(document.querySelector('#mg-sheet .mg-sheet-box'));},0);
},true);
