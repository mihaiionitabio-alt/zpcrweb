(xv,i)=>[xv,p.t2[i],`${mlRunLabel(rows[i])}\nT² ${mlNum(p.t2[i],3)}`,
        p.t2[i]>p.t2Ucl?CC_COL.bad:p.t2[i]>p.t2Warn?CC_COL.rule:CC_COL.pt]