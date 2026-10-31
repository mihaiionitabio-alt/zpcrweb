function cmdOpen(){
  CMD.open=true;document.getElementById("cmdm").classList.add("on");
  const out=cmdEl("cmd-out");
  if(out&&!out.childElementCount){

  }
  cmdEl("cmd-status").textContent=cmdStatusLine();
  const i=cmdEl("cmd-in");if(i)setTimeout(()=>i.focus(),0);
}