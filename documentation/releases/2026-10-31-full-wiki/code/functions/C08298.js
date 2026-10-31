function cmdScriptToggle(on){
  const box=cmdEl("cmd-script-wrap");if(!box)return;
  const show=on==null?box.hasAttribute("hidden"):!!on;
  if(show)box.removeAttribute("hidden");else box.setAttribute("hidden","");
}