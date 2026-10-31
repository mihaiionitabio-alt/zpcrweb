async function cmdRunScript(text){
  const lines=String(text||"").split(/\r?\n/);
  cmdPrint("running "+lines.filter(l=>l.trim()&&!l.trim().startsWith("#")).length+" line(s) of script","ok");
  for(const l of lines){
    if(!l.trim()||l.trim().startsWith("#"))continue;
    await cmdRunLine(l.trim());
  }
  cmdPrint("script finished","ok");
}