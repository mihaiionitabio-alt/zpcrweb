async function intake(fileList){
  const token=++APP_STATE.generation;setPhase("staging","new file selection");
  const msg=$("#loadmsg"),accepted=[],errors=[];let total=0;
  const files=[...(fileList||[])];const provenance=[];let expanded=0;
  const task=appTaskStart("Staging files",files.length,true);
  try{
  if(files.length>APP_STATE.limits.maxFiles){
    const msgText=`Selected ${files.length} files; the limit is ${APP_STATE.limits.maxFiles}. Remove files and try again.`;
    appNotice("intake",msgText);STAGED=[];$("#read").disabled=true;msg.innerHTML=`<span class="err">${esc(msgText)}</span>`;setPhase("idle","selection refused");return;
  }
  for(const f of files){
    if(token!==APP_STATE.generation){
      if(APP_STATE.cancelRequested){APP_STATE.cancelRequested=false;setPhase(STAGED.length?"staged":"idle","staging stopped");msg.innerHTML=`<div class="notice warn">Staging was stopped. The previous staged selection was kept.</div>`;}
      return;
    }
    const announced=Number(f&&f.size)||0;
    if(announced&&total+announced>APP_STATE.limits.maxBytes){
      const msgText=`Total staged size would exceed ${(APP_STATE.limits.maxBytes/1073741824).toFixed(0)} GiB.`;
      errors.push(`${f.name}: ${msgText}`);appNotice("intake",msgText);break;
    }
    appTaskStep(task);
    const ab=await f.arrayBuffer(),bytes=new Uint8Array(ab);
    total+=bytes.length;
    if(total>APP_STATE.limits.maxBytes){
      const msgText=`Total staged size exceeds ${(APP_STATE.limits.maxBytes/1073741824).toFixed(0)} GiB.`;
      errors.push(`${f.name}: ${msgText}`);appNotice("intake",msgText);break;
    }
    try{
      const source=await stageReaderFile(f,bytes);
      if(source){accepted.push(source);continue;}
      if(/\.zip$/i.test(f.name)){
        const archive={name:f.name,size:bytes.length};
        const entries=await readZipFiltered(ab,archive,/\.(ixo|eds|edt|rdml|zpcr|pcrd|xml)$/i);
        const manifests=await readZipFiltered(ab,archive,/(^|\/)CFX_RDML_manifest\.json$/i);
        for(const e of manifests){const m=JSON.parse(new TextDecoder().decode(e.bytes));if(m.schema!=='MISSY_CFX_RDML_manifest_v1'||!Array.isArray(m.entries)||m.entries.length>1000)throw Error('Invalid CFX provenance manifest');provenance.push(...m.entries);}
        let usable=0;for(const e of entries){if(accepted.length>=APP_STATE.limits.maxFiles)throw Error('Archive file count limit');expanded+=e.bytes.length;if(expanded>APP_STATE.limits.maxBytes)throw Error('Expanded archive byte limit');const staged=await stageReaderFile({name:e.name},e.bytes,e.archive,e.path);if(staged){accepted.push({...staged,zip:e.zip});usable++;}}
        if(!usable)errors.push(f.name+': no supported experiment entries');
      }else errors.push(f.name+': unsupported format; supported: '+readerAccept());
    }catch(err){errors.push(f.name+': '+err.message);}

  }
  if(token!==APP_STATE.generation)return;
  // Decode XML one file at a time in readStaged; retain original bytes for provenance.
  await cfxBindStaged(accepted,provenance);STAGED=accepted;
  document.querySelectorAll(".pcrd-import-feedback").forEach(e=>e.remove());
  if(accepted.length){
    /* A new staged selection supersedes the previous run set immediately;
       charts must never describe files that are no longer selected. */
    const hadData=RUNS.length||PASTED;
    RUNS=[];PASTED=null;PSEUDO_MAP=null;CC_STATE.cache=null;CC_STATE.instrument="";CC_STATE.open=null;
    if(hadData){["load","sop","results","panel","graphs","review","export"].forEach(t=>markDirty(t));appNotice("intake","previous data cleared; press Read to load the new selection");}
  }
  setPhase(accepted.length?"staged":"idle","staging complete");
  $("#read").disabled=!accepted.length;
  msg.innerHTML=accepted.length
    ? `<b>${accepted.length}</b> file(s) staged: `
      +accepted.slice(0,10).map(s=>`<span>${esc(s.name)}</span> <span class="tag">${(s.bytes.length/1048576).toFixed(1)} MB</span>`).join(" ")
      +(accepted.length>10?` … <span class="tag">+${accepted.length-10} more, ${(accepted.reduce((a,s)=>a+s.bytes.length,0)/1048576).toFixed(0)} MB in total</span>`:"")
      +(errors.length?`<div class="err" style="margin-top:6px">${errors.map(esc).join("<br>")}</div>`:"")
    : `<span class="err">${esc(errors.join("; "))||"Nothing usable was selected."}</span>`;
  }catch(e){appError("intake",e);msg.innerHTML=`<span class="err">${esc(e.message||String(e))}</span>`;setPhase("idle","staging failed");}
  finally{appTaskEnd(task);appStatusPaint();}
}