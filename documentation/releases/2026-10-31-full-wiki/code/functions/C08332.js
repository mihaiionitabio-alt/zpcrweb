async function astBuild(){
  const msg=astEl("ast-msg");
  if(!SEL_STATE.ids.size){msg.textContent="Choose at least one figure or table first.";msg.className="ast-msg warn";return;}
  const out=astOutput();
  msg.textContent="Building…";msg.className="ast-msg";
  try{
    if(out==="pdf"||out==="both"){const n=await selDownloadReport();msg.textContent=`Report written (${n.toLocaleString()} bytes).`;}
    if(out==="zip"||out==="both"){const n=selDownloadZip();msg.textContent=(out==="both"?msg.textContent+" ":"")+`Archive written (${n} entries).`;}
    msg.className="ast-msg ok";
  }catch(e){msg.textContent="Could not build: "+(e&&e.message||e);msg.className="ast-msg bad";}
}