async e=>{const f=e.target.files[0];if(!f)return;
    try{const n=ccImport(await f.text());$("#cc-msg").innerHTML=`<span class="tag ok">${n} ${esc(ui("history rows read"))}</span>`;renderPanel();}
    catch(err){appError("history import",err);$("#cc-msg").innerHTML=`<span class="err">${esc(err.message)}</span>`;}e.target.value="";}