s=>{
    s.points.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
    const values=s.points.map(p=>p.cq).filter(Number.isFinite),need=ccBaselineNeed(ccCfg("pc_cq")),base=values.slice(0,need),m=mean(base),d=sd(base);
    const flags=grouping==="exact"&&values.length>=need?westgardReview(s.points,m,d):s.points.map(()=>[]);
    s.points.forEach((p,i)=>p.flags=flags[i].join(" "));
    return Object.assign(s,{exact:[...s.exact],runs:s.points.length,n:values.length,mean:m,sd:d,
      cv:cv(values),judgeable:grouping==="exact"&&values.length>=need&&Number.isFinite(d)&&d>0,
      flagged:flags.filter(x=>x.length).length});
  }