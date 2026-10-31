(o,i)=>{
    const list=rows.filter(r=>r.outcome===o);if(!list.length)return;
    const bad=/Invalid|Control fail/.test(o),warn=/Repeat|Inconclusive/.test(o);
    out.push(mgIt({kind:"results",sev:bad?"alarm":warn?"watch":"ok",pict:MG_PICT.sample,kindWord:"outcome",
      code:"O"+(i+1),title:o,value:String(list.length),unit:list.length===1?"result":"results",
      limits:`${uniq(list.map(r=>r.target)).length} target(s) · ${uniq(list.map(r=>r.sample)).length} sample(s)`,
      state:mgTxt((SOP.outcomes[o]||{}).label)+((list[0]&&list[0].reason)?" — "+list[0].reason:""),
      evidence:uniq(list.map(r=>r.target)).slice(0,6).join(", "),
      rows:list.slice(0,12).map(r=>[`${r.sample} · ${r.target}`,
        Number.isFinite(r.cqMean)?"Cq "+r.cqMean.toFixed(2):(r.reason||"—")])}));
  }