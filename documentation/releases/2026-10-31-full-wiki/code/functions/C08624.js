(s,i)=>[s[0],s[1]||0,
      `${mlRunLabel(rows[i])}\n${mlDate(rows[i])}\n${ui("group")} ${km.assign[i]+1}`,
      CC_SEG_PALETTE[km.assign[i]%CC_SEG_PALETTE.length]]