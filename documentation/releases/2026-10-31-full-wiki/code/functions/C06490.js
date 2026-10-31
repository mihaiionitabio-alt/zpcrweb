(p,pi)=>{const s=p.segments;
    for(let i=0;i+1<s.length;i++)add(s[i],s[i+1]);
    if((+p.cycles||1)>1&&s.length>1)add(s[s.length-1],s[0]);
    if(pi>0){const q=progs[pi-1].segments;add(q[q.length-1],s[0]);}}