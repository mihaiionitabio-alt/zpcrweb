function mlAdvisoryBind(card){
  const root=card||document;
  root.querySelectorAll("[data-ml]").forEach(d=>{
    const token=d.dataset.ml;
    const body=root.querySelector(`[data-ml-body="${token}"]`);
    const fill=()=>{
      if(!body)return;
      body.innerHTML=`<p class="hint">${esc(ui("Computing…"))}</p>`;
      setTimeout(()=>{body.innerHTML=mlAdvisoryBody(token);
        if(typeof localizeDOM==="function")localizeDOM(body);},0);
    };
    d.addEventListener("toggle",()=>{if(d.open&&!d.dataset.filled){d.dataset.filled="1";fill();}});
    const btn=root.querySelector(`[data-ml-recompute="${token}"]`);
    if(btn)btn.onclick=e=>{e.preventDefault();e.stopPropagation();
      ML_STATE.mv=null;d.dataset.filled="1";d.open=true;fill();};
  });
}