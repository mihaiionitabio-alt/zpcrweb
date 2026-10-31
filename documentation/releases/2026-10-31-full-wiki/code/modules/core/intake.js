/* ============================================================
   H. Input handling
   ============================================================ */
let STAGED=[];
async function intake(fileList){
  const token=++APP_STATE.generation;setPhase("staging","new file selection");
  const msg=$("#loadmsg"),accepted=[],errors=[];let total=0;
  const files=[...(fileList||[])];
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
    if(/\.zip$/i.test(f.name)){
      const archive={name:f.name,size:bytes.length};
      try{
        /* A QuantStudio document is itself a ZIP; recognise one that was renamed. */
        const probe=await readZip(ab,archive,/^apldbio\/sds\/experiment\.xml$/);
        if(probe.length){accepted.push({name:f.name.replace(/\.zip$/i,".eds"),path:f.name,bytes,archive:null,zip:null,kind:"eds"});continue;}
        /* An RDML file is a ZIP holding rdml_data.xml; recognise a renamed export. */
        const rprobe=await readZip(ab,archive,/^rdml_data\.xml$/i);
        if(rprobe.length){accepted.push({name:f.name.replace(/\.zip$/i,".rdml"),path:f.name,bytes,archive:null,zip:null,kind:"rdml"});continue;}
        const entries=await readZip(ab,archive,/\.(ixo|eds|edt)$/i);
        if(!entries.length)errors.push(`${f.name}: contains no .ixo, .eds or .rdml entries`);
        entries.forEach(e=>{if(isEdsName(e.name))e.kind="eds";});
        accepted.push(...entries);
      }catch(err){errors.push(`${f.name}: ${err.message}`);}
    }else if(/\.ixo$/i.test(f.name)){
      accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null});
    }else if(isEdsName(f.name)){
      accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null,kind:"eds"});
    }else if(/\.rdml$/i.test(f.name)){
      accepted.push({name:f.name,path:f.name,bytes,archive:null,zip:null,kind:"rdml"});
    }else errors.push(`${f.name}: not an .ixo, .eds, .edt, .rdml or .zip file`);
  }
  if(token!==APP_STATE.generation)return;
  // Decode XML one file at a time in readStaged; retain original bytes for provenance.
  STAGED=accepted;
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
async function readStaged(){
  /* One entry point, one exit state: whatever happens inside, the phase is defined again
     when this returns and any fault is recorded once. */
  const task=appTaskStart("Reading experiment files",STAGED.length,true);
  try{return await readStagedCore(task);}
  catch(e){appError("read",e);const m=$("#readmsg");
    if(m)m.innerHTML=`<div class="notice bad">The read stopped: ${esc(e.message||String(e))}</div>`;}
  finally{appTaskEnd(task);
    if(APP_STATE.phase==="reading")setPhase(RUNS.length?"ready":"idle","read finished");
    appStatusPaint();}
}
async function readStagedCore(task){
  const token=++APP_STATE.generation;setPhase("reading","read started");
  const msg=$("#readmsg");
  msg.innerHTML=`Reading ${STAGED.length} file(s)…`;
  RUNS=[];ssReset();const failed=[];
  for(const [k,s] of STAGED.entries()){
    if(token!==APP_STATE.generation)return appReadSuperseded(msg);
    appTaskStep(task,k+1,s.name);
    if(STAGED.length>3&&k%3===0){msg.innerHTML=`Reading ${k+1} of ${STAGED.length}…`;await new Promise(r=>setTimeout(r,0));}
    try{
      if(s.kind==="rdml"){
        const entries=await rdmlEntries(s.bytes.buffer,s.archive);
        if(!rdmlIsContainer(entries))throw new Error(`${s.name}: not an RDML container (no rdml_data.xml)`);
        const ent=entries.find(e=>/^rdml_data\.xml$/i.test(e.name));
        const produced=rdmlParse(new TextDecoder().decode(ent.bytes),s.name,s.bytes);
        produced.forEach(r=>{validateRunBoundary(r,s.name);RUNS.push(r);});
      }else{
        const source=s.kind==="eds"?s:{...s,text:s.text||new TextDecoder("utf-8").decode(s.bytes)};
        const r=source.kind==="eds"?await decodeEds(source):await decodeIxo(source,"auto");
        validateRunBoundary(r,s.name);await ccExtractOnLoad(r,source);RUNS.push(r);
      }
      if(token!==APP_STATE.generation)return appReadSuperseded(msg);}
    catch(err){failed.push(`${s.name}: ${err.message}`);appError("decode",err,{file:s.name,index:k});}
  }
  if(token!==APP_STATE.generation)return appReadSuperseded(msg);
  const priority=applyRawFilePriority(RUNS);
  if(priority.superseded.length)appNotice("rdml",`${priority.superseded.length} exchange export(s) superseded by the instrument's own file`);
  assignRoles(RUNS);
  sopMaybeSelectScDefault();
  PSEUDO_MAP=null;
  PASTED=null;
  setPhase(RUNS.length?"ready":"idle","read complete");
  msg.innerHTML=RUNS.length
    ? `<div class="notice ok">Read ${RUNS.length} run(s): `
      +`${RUNS.reduce((a,r)=>a+r.wells.length,0)} stored result(s), `
      +`${RUNS.reduce((a,r)=>a+uniqueCurveCount(r),0)} amplification curve(s).</div>`
      +(failed.length?`<div class="notice bad">${failed.map(esc).join("<br>")}</div>`:"")
    : `<div class="notice bad">Nothing could be read.<br>${failed.map(esc).join("<br>")}</div>`;
  CC_STATE.cache=null;CC_STATE.instrument="";CC_STATE.open=null;
  SAMPLE_SELECTION.pending=!!$("#ss-enable").checked&&RUNS.length>0;
  refreshAll();
  if(RUNS.length&&$("#ss-enable").checked){SOP_CACHE=null;ssOpen(true);refreshAll();showTab("load");}
  else if(RUNS.length){ssBuildRows();ssUpdateBadge();showTab("results");}
}

/* CSV re-import: the inhibition test and the replicate checks need only Cq, so
   values from any instrument are accepted. Header matching is deliberately
   loose because every vendor spells these columns differently. */
const CQ_HEADERS=/^(cq|ct|c\.?t\.?|cp|crossing\s*point|quantification\s*cycle|threshold\s*cycle)$/i;
const SAMPLE_HEADERS=/^(sample|sample\s*name|sample\s*id|name|specimen)$/i;
const WELL_HEADERS=/^(well|well\s*position|position|pos|wells?)$/i;
function parseCqTable(text,source){
  if(typeof text!=="string")return {error:"The pasted table is not text."};
  if(text.length>APP_LIMITS.maxCqTextBytes)return {error:`The pasted table is larger than ${(APP_LIMITS.maxCqTextBytes/1048576).toFixed(0)} MiB.`};
  const raw=text.replace(/\r\n?/g,"\n").split("\n").filter(l=>l.trim()!=="");
  if(!raw.length)return {error:"The text is empty."};
  if(raw.length>APP_LIMITS.maxCqRows+31)return {error:`The pasted table has more than ${APP_LIMITS.maxCqRows.toLocaleString()} data rows.`};
  const delim=(raw[0].match(/\t/g)||[]).length>(raw[0].match(/,/g)||[]).length?"\t"
    :((raw[0].match(/;/g)||[]).length>(raw[0].match(/,/g)||[]).length?";":",");
  const split=l=>{
    const out=[];let cur="",q=false;
    for(let i=0;i<l.length;i++){
      const c=l[i];
      if(q){ if(c==='"'){ if(l[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
      else if(c==='"')q=true;
      else if(c===delim){out.push(cur);cur="";}
      else cur+=c;
    }
    out.push(cur);return out.map(s=>s.trim());
  };
  /* Some exports carry preamble lines before the header; find the first row
     that actually names a Cq column rather than assuming it is row one. */
  let hi=-1,head=null;
  for(let i=0;i<Math.min(raw.length,30);i++){
    const cells=split(raw[i]);
    if(cells.some(c=>CQ_HEADERS.test(c))){hi=i;head=cells;break;}
  }
  if(hi<0)return {error:"No column named Cq, Ct, Cp or crossing point was found in the first 30 lines."};
  const iCq=head.findIndex(c=>CQ_HEADERS.test(c));
  let iSample=head.findIndex(c=>SAMPLE_HEADERS.test(c));
  const iWell=head.findIndex(c=>WELL_HEADERS.test(c));
  if(iSample<0)iSample=head.findIndex((c,j)=>j!==iCq&&j!==iWell&&c);
  if(iSample<0)return {error:"No sample-name column was found. The inhibition test needs it to group the dilutions."};
  const rows=[],skipped=[];
  for(let i=hi+1;i<raw.length;i++){
    const c=split(raw[i]);
    if(c.length<=iCq)continue;
    const v=Number(String(c[iCq]).replace(",","."));
    const sample=c[iSample]||"";
    if(!sample&&!Number.isFinite(v))continue;
    if(!Number.isFinite(v)||v<=0){skipped.push(`${sample||"row "+(i+1)}: "${c[iCq]}"`);continue;}
    if(rows.length>=APP_LIMITS.maxCqRows)return {error:`The pasted table has more than ${APP_LIMITS.maxCqRows.toLocaleString()} usable Cq rows.`};
    rows.push({well:iWell>=0?c[iWell]:"",sample,cq:v});
  }
  if(!rows.length)return {error:"A Cq column was found but no row carried a usable number."};
  return {rows,skipped,source,header:head[iCq],sampleCol:head[iSample]};
}
const CSV_EXAMPLE=`Well,Sample Name,Cq
1,Example WD,22.7
2,Example WD,22.3
3,Example 1:4,24.2
4,Example 1:4,24.9
5,Example 1:16,26.5
6,Example 1:16,26.5
7,Example 1:64,28.7
8,Example 1:64,28.5
9,Example 1:256,30.5
10,Example 1:256,30.5`;

function acceptPasted(text,source){
  const r=parseCqTable(text,source);
  const msg=$("#csvmsg");
  if(r.error){msg.innerHTML=`<div class="notice bad">${esc(r.error)}</div>`;return;}
  PASTED=r;RUNS=[];
  msg.innerHTML=`<div class="notice ok">Read <b>${r.rows.length}</b> Cq value(s) from the
    “${esc(r.header)}” column, grouped by “${esc(r.sampleCol)}”.
    ${r.skipped.length?`${r.skipped.length} row(s) had no usable number and were left out.`:""}</div>`;
  refreshAll();
}

