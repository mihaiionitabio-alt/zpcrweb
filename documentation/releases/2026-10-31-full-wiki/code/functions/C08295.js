async function cmdRunLine(raw){
  if(CMD.busy)return;
  CMD.busy=true;
  cmdPrint("> "+raw,"echo");
  try{await cmdExec(raw);}
  catch(e){cmdPrint("error: "+(e&&e.message||e),"bad");}
  finally{CMD.busy=false;cmdEl("cmd-status").textContent=cmdStatusLine();}
}