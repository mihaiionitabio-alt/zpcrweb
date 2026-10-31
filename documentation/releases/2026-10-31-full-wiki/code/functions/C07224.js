e=>{                 /* without a sheet, a key presses the button that shows it */
    if(!MG.open||MG.sheet||e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey)return;
    const tg=e.target,tag=tg&&tg.tagName;
    if(tag==="INPUT"||tag==="TEXTAREA"||tag==="SELECT"||(tg&&tg.isContentEditable))return;
    const key={"-":"−","=":"+",ArrowLeft:"←",ArrowRight:"→",ArrowUp:"↑",ArrowDown:"↓"}[e.key]||e.key;
    const viewKey={"−":"zoom out","+":"zoom in","←":"pan left","→":"pan right","↑":"pan up","↓":"pan down"}[key];
    if(MG.chart&&viewKey){e.preventDefault();mgCommand(viewKey,"keyboard");return;}
    const b=[...document.querySelectorAll("#mg-actions .mg-act")].find(x=>{const k=x.querySelector(".k");return k&&k.textContent.trim().split(/\s/)[0]===key;});
    if(!b)return;
    e.preventDefault();b.click();
  }