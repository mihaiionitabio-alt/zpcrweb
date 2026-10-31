o=>({run:mlRunLabel(rows[o.i]),date:mlDate(rows[o.i]),t2:mlNum(o.v,3),q:mlNum(o.q,3),
      flag:((rows[o.i].m||{}).findings||{}).count||0,why:contrib(o)})