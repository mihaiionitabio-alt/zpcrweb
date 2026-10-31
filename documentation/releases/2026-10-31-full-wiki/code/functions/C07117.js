([name,list],i)=>{
      const fail=list.filter(c=>c.status==="fail").length,rev=list.filter(c=>c.status==="review").length;
      const worst=list.find(c=>c.status==="fail")||list.find(c=>c.status==="review")||list[0];
      out.push(mgIt({kind:"rule",sev:fail?"alarm":rev?"watch":"ok",pict:MG_PICT.rule,kindWord:"criterion on the data",
        code:"A"+(i+1),title:name,value:String(list.length-fail-rev),unit:`of ${list.length} run(s) met`,
        limits:fail?`${fail} rejected`+(rev?`, ${rev} for review`:""):rev?`${rev} for review`:"every run met it",
        state:mgTxt(worst&&worst.evidence),
        evidence:list.map(c=>c.experiment).slice(0,3).join(", ")+(list.length>3?` … (+${list.length-3})`:""),
        rows:list.slice(0,12).map(c=>[c.experiment,`${c.status}${c.evidence?" — "+String(c.evidence).slice(0,70):""}`])}));
    }