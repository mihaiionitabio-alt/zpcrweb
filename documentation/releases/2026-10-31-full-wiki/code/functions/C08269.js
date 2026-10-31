function cmdPrint(text,cls){
  const out=cmdEl("cmd-out");if(!out)return;
  const div=document.createElement("div");
  div.className="cmd-line"+(cls?" "+cls:"");
  if(cls==="echo")div.setAttribute("data-i18n-skip","");
  div.textContent=String(text==null?"":text);
  out.appendChild(div);out.scrollTop=out.scrollHeight;
}