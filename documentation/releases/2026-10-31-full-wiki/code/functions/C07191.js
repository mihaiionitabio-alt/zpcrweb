([area,list])=>{
    const e0=list.find(e=>e.severity==="error")||list[0];
    const errs=list.filter(e=>e.severity==="error").length;
    out.push(mgIt({kind:"finding",sev:errs?"alarm":"watch",pict:MG_PICT.finding,kindWord:"finding",
      code:errs?"ERR":"REV",title:area,value:String(list.length),unit:list.length===1?"finding":"findings",
      limits:`${errs} error · ${list.length-errs} review · expected: none`,
      state:e0.finding||"",evidence:e0.experiment||"",
      rows:list.slice(0,14).map(e=>[String(e.experiment||e.finding||"").slice(0,44),
        String(e.evidence||e.finding||"").slice(0,80)]),
      actions:[{key:"3",label:"Open the review view on the page",cmd:"open page review"}]}));
  }