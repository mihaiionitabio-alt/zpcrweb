s=>{
    out+=`[${s.name}]`+NL+s.cols.join(TAB)+NL;
    s.rows.forEach(row=>{out+=s.cols.map(c=>cell(row[c])).join(TAB).replace(/\t+$/,s.ragged?"":"$&")+NL;});
    (s.tail||[]).forEach(t=>{out+=t.join(TAB)+NL;});
    out+=NL;
  }