([t,list],i)=>{
    const cq=list.map(r=>r.cqMean).filter(Number.isFinite);
    const need=list.filter(r=>/Invalid|Repeat|Inconclusive|Control fail/.test(r.outcome)).length;
    out.push(mgIt({kind:"results",sev:need?"watch":"ok",pict:MG_PICT.sample,kindWord:"target",code:"TG"+(i+1),
      title:t||"unnamed target",value:cq.length?cq.reduce((a,b)=>a+b,0)/cq.length:"—",
      unit:cq.length?"mean Cq":"",
      limits:`${list.length} result(s) · ${cq.length} with a Cq${need?` · ${need} need action`:""}`,
      state:cq.length?`Cq from ${Math.min(...cq).toFixed(2)} to ${Math.max(...cq).toFixed(2)} across ${uniq(list.map(r=>r.sample)).length} sample(s).`
        :"No Cq was stored for this target.",
      evidence:uniq(list.map(r=>r.role||"")).filter(Boolean).join(", ")||"—",
      rows:[["Results",String(list.length)],["Samples",String(uniq(list.map(r=>r.sample)).length)],
            ["Positive",String(list.filter(r=>r.outcome==="Positive").length)],
            ["Negative",String(list.filter(r=>r.outcome==="Negative").length)],
            ["Need action",String(need)],
            ["Lowest Cq",cq.length?Math.min(...cq).toFixed(2):"—"],
            ["Highest Cq",cq.length?Math.max(...cq).toFixed(2):"—"]]}));
  }