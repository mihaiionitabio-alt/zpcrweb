l=>{
    const out=[];let cur="",q=false;
    for(let i=0;i<l.length;i++){
      const c=l[i];
      if(q){ if(c==='"'){ if(l[i+1]==='"'){cur+='"';i++;} else q=false; } else cur+=c; }
      else if(c==='"')q=true;
      else if(c===delim){out.push(cur);cur="";}
      else cur+=c;
    }
    out.push(cur);return out.map(s=>s.trim());
  }