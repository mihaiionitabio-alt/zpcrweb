(h,i)=>tx.push({px:null,x:pts[0].x,y:(h.y<cLo?cLo:cHi),
    text:`${h.label} — ${h.y<cLo?"below":"above"} this scale`,anchor:"start",size:11,colour:"#7f1d1d"})