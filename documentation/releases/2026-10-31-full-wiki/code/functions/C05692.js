s=>{
    const body=s.rows.map(r=>{const a=s.cols.map(c=>r[c]===undefined?null:r[c]);if(s.ragged)while(a.length>3&&a[a.length-1]==null)a.pop();return a;});
    return {name:s.name,rows:[...head,[],[],s.cols,...body,...(s.tail||[])]};
  }