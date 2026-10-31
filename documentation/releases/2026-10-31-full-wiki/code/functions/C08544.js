c=>{const p=S.pts[c.index];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),
      before:mlNum(c.before),after:mlNum(c.after),step:mlNum(c.after-c.before),
      nb:c.nBefore,na:c.nAfter};}