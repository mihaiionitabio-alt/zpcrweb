(xv,i)=>[xv,Number.isFinite(sc[i].score)?sc[i].score:0,0,
      `${mlRunLabel(S.pts[i].row)}\n${ui("score")} ${mlNum(sc[i].score,3)}`,
      (sc[i].score>=ref?(S.pts[i].flags.length?CC_COL.rule:CC_COL.bad):"#94a3b8")]