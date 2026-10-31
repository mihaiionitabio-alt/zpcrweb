(t,i)=>out.push(mgIt({kind:"rule",sev:"none",pict:MG_PICT.rule,kindWord:"target rule",code:"T"+(i+1),
    title:t.match==="*"?"Every other target":t.match,
    value:mgTxt(t.cqMax),unit:"Cq cut-off",
    limits:`kind ${mgTxt(t.kind)}${t.cqLate!==""&&t.cqLate!=null?` · late signal beyond Cq ${t.cqLate}`:""}${t.quantMin!==""&&t.quantMin!=null?` · minimum quantity ${t.quantMin}`:""}`,
    state:`A signal later than the cut-off is called negative. A late signal is reported as ${mgTxt(t.lateOutcome)}.`,
    evidence:`rule ${i+1} of ${T.length}; the first matching rule wins`,
    rows:[["Match",mgTxt(t.match)],["Kind",mgTxt(t.kind)],["Cq cut-off",mgTxt(t.cqMax)],
          ["Late signal from",mgTxt(t.cqLate)],["Minimum quantity",mgTxt(t.quantMin)],
          ["Late outcome",mgTxt(t.lateOutcome)]]}))