(c,i)=>out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.control,kindWord:"control",code:"C"+(i+1),
    title:c.name||c.match,value:mgTxt(c.minPerRun),unit:"required per run",
    limits:`expected ${mgTxt(c.expect)} · matched by ${mgTxt(c.matchBy)}`,
    state:`If this control fails the run is ${c.onFail==="reject"?"rejected":"flagged for review"}.`,
    evidence:`matches ${mgTxt(c.match)} on targets ${mgTxt(c.targets)}`,
    rows:[["Name",mgTxt(c.name)],["Match",mgTxt(c.match)],["Matched by",mgTxt(c.matchBy)],
          ["Expected",mgTxt(c.expect)],["Cq window",(c.cqLo!==""&&c.cqLo!=null?c.cqLo:"—")+" – "+(c.cqHi!==""&&c.cqHi!=null?c.cqHi:"—")],
          ["Minimum per run",mgTxt(c.minPerRun)],["On failure",mgTxt(c.onFail)]]}))