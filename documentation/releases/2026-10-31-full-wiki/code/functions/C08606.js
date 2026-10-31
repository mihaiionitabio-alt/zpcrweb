(xv,i)=>[xv,p.spe[i],`${mlRunLabel(rows[i])}\nQ ${mlNum(p.spe[i],3)}`,
        p.spe[i]>p.speUcl?CC_COL.bad:p.spe[i]>p.speWarn?CC_COL.rule:CC_COL.pt]