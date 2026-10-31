function reportRestorePreview(){
 const state=REPORT_PREVIEW_RETURN;if(!state)return;REPORT_PREVIEW_RETURN=null;
 if(state.mode==='assisted'){AST.open=true;document.getElementById('astm').classList.add('on');}
 else{CMD.open=true;document.getElementById('cmdm').classList.add('on');}
 const restore=()=>{for(const x of state.scroll){x.el.scrollTop=x.top;x.el.scrollLeft=x.left;}if(state.focus?.isConnected)state.focus.focus({preventScroll:true});};restore();requestAnimationFrame(restore);
}