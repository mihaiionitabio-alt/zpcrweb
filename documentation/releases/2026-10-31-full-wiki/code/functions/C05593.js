q=>{
    if(q.rqMin>0&&q.rqMax/q.rqMin>100)push("review","Relative quantification",
      `${q.sample} / ${q.target}: RQ interval spans more than 100-fold`,`RQ ${Number(q.normRatio).toPrecision(3)} (${Number(q.rqMin).toPrecision(3)} – ${Number(q.rqMax).toPrecision(3)}), n = ${q.n}`);
  }