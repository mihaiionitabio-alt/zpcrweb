function mgInit(){
  document.querySelectorAll("#mg-nav [data-tab]").forEach(b=>b.onclick=()=>mgScope(b.dataset.tab));
  document.addEventListener("keydown",e=>{                 /* a sheet answers the number keys */
    if(!MG.open||!MG.sheet)return;
    if(e.key==="Escape"||e.key==="0"){mgSheetClose();e.preventDefault();return;}
    if(/^[1-9]$/.test(e.key)){mgSheetPick(+e.key-1);e.preventDefault();}
  });
  document.addEventListener("keydown",e=>{                 /* without a sheet, a key presses the button that shows it */
    if(!MG.open||MG.sheet||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
    const tg=e.target,tag=tg&&tg.tagName;
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||(tg&&tg.isContentEditable))return;
    const key={"-":"−","=":"+",ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓"}[e.key]||e.key;
    const viewKey={"−":"zoom out","+":"zoom in","←":"pan left","→":"pan right","↑":"pan up","↓":"pan down"}[key];
    if(MG.chart&&viewKey){e.preventDefault();mgCommand(viewKey,"keyboard");return;}
    const b=[...document.querySelectorAll("#mg-actions .mg-act")].find(x=>{const k=x.querySelector(".k");return k&&k.textContent.trim().split(/\s/)[0]===key;});
    if(!b)return;
    e.preventDefault();b.click();
  });
  /* the console follows the data: rebuild when a read finishes or the profile changes */
  const tick=()=>{if(MG.open){const before=MG.queue.map(mgItemKey).join("\u001f")+"|"+MG.at;mgRefresh();const after=MG.queue.map(mgItemKey).join("\u001f")+"|"+MG.at;if(before!==after)mgRender();}};
  setInterval(tick,4000);
}