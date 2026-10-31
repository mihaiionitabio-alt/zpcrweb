/* Candidate B follows actual view state, for mouse, keyboard and voice alike. */
(()=>{
 let queued=false,last='',lastAt=-Infinity;
 const selected=id=>document.getElementById(id)?.value||'';
 const visible=id=>{const e=document.getElementById(id);return !!(e&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden');};
 function signature(){const tab=APP_STATE.activeTab,review=document.querySelector('#review-tabs .on')?.dataset.review||'',ids={graphs:['g-run','g-graph','g-target','g-signal'],panel:['cc-inst','cc-proto','cc-type','cc-variant'],results:['sop-view','sop-run'],review:['plate-run','plate-target','rising-run','instrument-run','cmp-a','cmp-b']}[tab]||[];const values=ids.map(id=>{const e=document.getElementById(id),sheet=e?.closest('.review-sheet');return sheet&&!sheet.classList.contains('on')?'':selected(id);});const item=MG.open?MG.queue?.[MG.at]:null;return JSON.stringify([tab,tab==='review'?review:'',...values,MG.open,MG.open?MG.scope:'',MG.open?MG.at:'',item?.chartId||item?.graphId||'',MG.open?MG.sheet?.kind||'':'',visible('cmdm'),visible('astm'),tab==='panel'?CC_STATE.open:'']);}
 function check(){queued=false;const next=signature(),changed=last&&last!==next;last=next;if(!changed||document.hidden||document.documentElement.classList.contains('missy-starting')||window.MISSY_SETUP?.isOpen)return;if(performance.now()-lastAt<120)return;lastAt=performance.now();const sound=window.__MISSY_GAME_FRAME&&window.parent!==window?window.parent.MISSY_COMPUTER_SOUND:window.MISSY_COMPUTER_SOUND;sound?.chime('navigationTone');}
 function queue(){if(queued)return;queued=true;requestAnimationFrame(check);}
 for(const name of ['showTab','mgOpen','mgRender','mgGo','mgClose','mgCommand','renderPanel','astRender'])MISSY_HOOKS.use(name,'interface-tones/'+name,390,next=>function(...args){const result=next(...args);queue();return result;});
 document.addEventListener('DOMContentLoaded',()=>{last=signature();document.addEventListener('click',queue,true);document.addEventListener('change',queue,true);document.addEventListener('keydown',queue,true);},{once:true});
 window.MISSY_NAVIGATION_TONES=Object.freeze({queue});
})();
