l=>{
    const n=l.getAttribute("name");if(!n)return;
    out[n]=[...l.children].map(c=>(c.textContent||"").trim()).filter(x=>x!=="").map(Number)
      .filter(x=>Number.isFinite(x));
  }