()=>{
      if(!body)return;
      body.innerHTML=`<p class="hint">${esc(ui("Computing…"))}</p>`;
      setTimeout(()=>{body.innerHTML=mlAdvisoryBody(token);
        if(typeof localizeDOM==="function")localizeDOM(body);},0);
    }