s=>{const p=S.pts[s.i];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),value:mlNum(S.y[s.i]),
      score:mlNum(s.score,3),robust:mlNum(s.robust,3),local:mlNum(s.local,3),
      novelty:mlNum(s.novelty,3),rule:p.flags.length?p.flags.join(", "):ui("no rule fired")};}