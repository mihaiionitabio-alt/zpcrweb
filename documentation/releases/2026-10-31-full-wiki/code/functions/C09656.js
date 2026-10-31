function reportRememberPreview(){
 if(REPORT_PREVIEW_RETURN||(!AST.open&&!CMD.open))return;
 const mode=AST.open?'assisted':'command';
 REPORT_PREVIEW_RETURN={mode,focus:document.activeElement,scroll:[...document.querySelectorAll(mode==='assisted'?'#ast-list,#ast-form':'#cmd-out,#cmd-script,#cmd-script-wrap')].map(el=>({el,top:el.scrollTop,left:el.scrollLeft}))};
}