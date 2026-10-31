function mlPanelClusters(mv){
  if(!mv.F.ok||!mv.clusters)return "";
  const c=mv.clusters;
  if(!c.structure)return `<h4>${esc(ui("Behaviour groups"))}</h4>`
    +mlNote(`No grouping is shown. The best partition found (k = ${c.k||"—"}, silhouette ${mlNum(c.silhouette,3)}) is no better than the best partition of ${c.nNull||0} seeded uniform clouds spanning the same ranges (90th percentile ${mlNum(c.nullQ90,3)}). That is evidence against one particular null — a uniform box — and nothing more: a single Gaussian cloud, a curved band or a steady drift would also fail this comparison while still being structure of a kind. Read it as no evidence of groups beyond this comparison, not as proof that none exist.`);
  const rows=mv.F.rows,km=c.km,p=mv.pca;
  const fig=mlPlot({title:ui("Behaviour groups in the plane of the first two components (exploratory)"),
    width:880,height:320,x:extent(p.scores.map(s=>s[0]),0.1),y:extent(p.scores.map(s=>s[1]||0),0.1),
    xlab:ui("Component 1"),ylab:ui("Component 2"),
    series:[{type:"points",r:4,data:p.scores.map((s,i)=>[s[0],s[1]||0,
      `${mlRunLabel(rows[i])}\n${mlDate(rows[i])}\n${ui("group")} ${km.assign[i]+1}`,
      CC_SEG_PALETTE[km.assign[i]%CC_SEG_PALETTE.length]])}],
    legend:km.sizes.map((s,j)=>({label:`${ui("group")} ${j+1} · ${s} ${ui("runs")}`,
      colour:CC_SEG_PALETTE[j%CC_SEG_PALETTE.length]}))});
  const by=km.sizes.map((_,j)=>rows.filter((_,i)=>km.assign[i]===j));
  return `<h4>${esc(ui("Behaviour groups"))}</h4>
    <div class="chart-wrap">${fig}</div>
    ${table([{key:"g",label:"Group"},{key:"n",label:"Runs",n:1},{key:"span",label:"Dates"},
      {key:"find",label:"Runs with a forensic finding",n:1},{key:"inst",label:"Firmware / software seen"}],
      by.map((g,j)=>{const ds=g.map(r=>r.date).filter(Number.isFinite).sort((a,b)=>a-b);
        return {g:j+1,n:g.length,span:ds.length?`${sopFmtTime(ds[0]).slice(0,10)} → ${sopFmtTime(ds[ds.length-1]).slice(0,10)}`:"—",
          find:g.filter(r=>(((r.m||{}).findings||{}).count>0)).length,
          inst:uniq(g.map(r=>`${r.firmware||"—"} / ${r.software||"—"}`)).slice(0,3).join("; ")};}))}
    ${mlNote(`Exploratory only. k = ${c.k} was chosen by the highest silhouette over k = 2 to 4 (${mlNum(c.silhouette,3)}), and kept because it exceeds the 90th percentile of ${c.nNull} seeded uniform-box resamples (${mlNum(c.nullQ90,3)}) — a comparison against that one null, which is weaker than a demonstration that the groups are real. A group holding the runs before a service date and another holding the runs after it is the same finding as a change point, reached from a different direction.`)}`;
}