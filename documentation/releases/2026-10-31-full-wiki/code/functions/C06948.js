async()=>{const b=$("#cc-zip"),msg=$("#cc-msg");if(!ccAllRows().length)return;b.disabled=true;
    try{const n=await ccZipAll($("#cc-zip-png").checked,(d,t)=>{msg.innerHTML=`<div class="notice">${esc(ui("Preparing the charts"))}: ${d} / ${t}</div>`;});
      msg.innerHTML=`<div class="notice ok">${esc(ui("ZIP ready"))}: ${n} ${esc(ui("files"))}.</div>`;}
    catch(e){appError("control-chart archive",e);msg.innerHTML=`<div class="notice bad">${esc(e.message)}</div>`;}finally{b.disabled=false;}}