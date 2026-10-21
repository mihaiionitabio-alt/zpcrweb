function integrityLabel(run){
  const g=run&&run.integrity;if(!g)return "not checked";
  if(g.kind==="eds")return `${g.zipCrcOk?"CRC-32 valid":"CRC-32 FAILED"}; ${g.ok===true?"Tamper MD5 matches":g.ok===false?"Tamper MD5 MISMATCH":"no Tamper record"}`;
  return g.ok===true?"container checksum matches":g.ok===false?"container checksum MISMATCH":"no container checksum";
}
function integrityEvents(run,push){
  const g=run.integrity;if(!g)return;
  if(g.kind==="ixo"){
    if(g.ok===true)push("info","Integrity","Container checksum matches the object stream",g.computed);
    else if(g.ok===false)push("error","Integrity","Container checksum does not match — the file was changed after the software sealed it",
      `stored ${g.stored}; recomputed ${g.computed}`);
    else push("review","Integrity","No container checksum could be verified",g.note||"");
    return;
  }
  if(g.zipCrcOk)push("info","Integrity",`ZIP CRC-32 valid for all ${g.entries} entries`,"");
  else push("error","Integrity","ZIP CRC-32 failed",(g.zipCrcBad||[]).join(", "));
  if(g.ok===true)push("info","Integrity","Tamper MD5 matches the stored value",g.computed);
  else if(g.ok===false)push("error","Integrity","Tamper MD5 does not match — the file was changed after the software sealed it",
    `stored ${g.stored}; recomputed ${g.computed}`);
  else push(run.isTemplate?"info":"review","Integrity","No Tamper record in the container",run.isTemplate?"expected for a template":"");
}
