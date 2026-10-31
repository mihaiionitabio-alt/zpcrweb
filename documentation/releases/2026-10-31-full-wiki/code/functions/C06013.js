async e=>{const f=e.target.files[0];if(!f)return;
    try{const p=JSON.parse(await f.text());const claimed=p.sha256;SOP=sopNormalise(p);
      const h=sopHash();$("#sop-msg").innerHTML=claimed?(claimed===h?`<span class="tag ok">${esc(ui("Profile checksum verified"))}</span>`:`<span class="tag bad">${esc(ui("Profile checksum does not match — the file was edited after it was saved"))}</span>`):"";
      sopProfileEdited(true);}catch(err){$("#sop-msg").innerHTML=`<span class="err">${esc(err.message)}</span>`;}
    e.target.value="";}