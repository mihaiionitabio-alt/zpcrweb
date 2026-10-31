function mlPanelMulti(mv,cohort,scopeNote){
  if(!mv.F.ok)return mlNote("The multivariate view is not offered: "+mv.F.why+".")+mlInventory(mv.F);
  const p=mv.pca;
  if(!p)return mlNote("Too few complete runs for a multivariate decomposition.")+mlInventory(mv.F);
  const rows=mv.F.rows,n=rows.length,x=rows.map((r,i)=>i+1);
  const figT=mlPlot({title:ui("Hotelling T² — the retained components, per run"),
    width:880,height:260,x:[0.5,n+0.5],y:[0,Math.max(p.t2Ucl*1.25,...p.t2)*1.08],
    xlab:ui("Run (in date order)"),ylab:"T²",
    series:[{type:"line",colour:"#cbd5e1",width:1,data:x.map((xv,i)=>[xv,p.t2[i]])},
      {type:"points",r:3.4,data:x.map((xv,i)=>[xv,p.t2[i],`${mlRunLabel(rows[i])}\nT² ${mlNum(p.t2[i],3)}`,
        p.t2[i]>p.t2Ucl?CC_COL.bad:p.t2[i]>p.t2Warn?CC_COL.rule:CC_COL.pt])}],
    hlines:[{y:p.t2Ucl,label:ui("99th percentile of this history"),colour:CC_COL.bad},
      {y:p.t2Warn,label:ui("95th percentile"),colour:CC_COL.rule}]});
  const figQ=mlPlot({title:ui("Residual distance Q — the directions the components do not keep"),
    width:880,height:240,x:[0.5,n+0.5],y:[0,Math.max(p.speUcl*1.25,...p.spe)*1.08],
    xlab:ui("Run (in date order)"),ylab:"Q",
    series:[{type:"line",colour:"#cbd5e1",width:1,data:x.map((xv,i)=>[xv,p.spe[i]])},
      {type:"points",r:3.4,data:x.map((xv,i)=>[xv,p.spe[i],`${mlRunLabel(rows[i])}\nQ ${mlNum(p.spe[i],3)}`,
        p.spe[i]>p.speUcl?CC_COL.bad:p.spe[i]>p.speWarn?CC_COL.rule:CC_COL.pt])}],
    hlines:[{y:p.speUcl,label:ui("99th percentile of this history"),colour:CC_COL.bad},
      {y:p.speWarn,label:ui("95th percentile"),colour:CC_COL.rule}]});
  const over=p.t2.map((v,i)=>({v,i,q:p.spe[i]}))
    .filter(o=>o.v>p.t2Ucl||o.q>p.speUcl).sort((a,b)=>(b.v/p.t2Ucl+b.q/p.speUcl)-(a.v/p.t2Ucl+a.q/p.speUcl)).slice(0,10);
  const contrib=o=>mv.F.keys.map((k,j)=>({k,z:Math.abs((mv.F.X[o.i][j]-p.mean[j])/(p.sd[j]||1))}))
    .sort((a,b)=>b.z-a.z).slice(0,3).map(c=>`${c.k} (${mlNum(c.z,2)} σ)`).join(", ");
  const tabOver=over.length?table([{key:"run",label:"Experiment"},{key:"date",label:"Date"},
    {key:"t2",label:"T²",n:1},{key:"q",label:"Q",n:1},{key:"flag",label:"Forensic findings",n:1},
    {key:"why",label:"Metrics furthest from the centre"}],
    over.map(o=>({run:mlRunLabel(rows[o.i]),date:mlDate(rows[o.i]),t2:mlNum(o.v,3),q:mlNum(o.q,3),
      flag:((rows[o.i].m||{}).findings||{}).count||0,why:contrib(o)}))):mlNote("No run is above the 99th percentile of either statistic in this cohort.");
  const figS=mlPlot({title:ui("Runs in the plane of the first two components"),
    width:880,height:320,x:extent(p.scores.map(s=>s[0]),0.1),y:extent(p.scores.map(s=>s[1]||0),0.1),
    xlab:`${ui("Component 1")} (${mlPct(p.explained[0])})`,
    ylab:`${ui("Component 2")} (${mlPct(p.explained[1])})`,
    series:[{type:"points",r:4,data:p.scores.map((s,i)=>[s[0],s[1]||0,
      `${mlRunLabel(rows[i])}\n${mlDate(rows[i])}`,CC_COL.pt])}]});
  const load=p.eig[0].vector.map((v,j)=>({k:mv.F.keys[j],v})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,8);
  const tabLoad=table([{key:"metric",label:"Metric"},{key:"w",label:"Weight in component 1",n:1},
    {key:"dir",label:"Direction"}],
    load.map(l=>({metric:l.k,w:mlNum(l.v,3),dir:ui(l.v>0?"rises with the component":"falls with the component")})));
  return `<h4>${esc(ui("The instrument as a whole"))}</h4>
    ${scopeNote||""}
    <div class="chart-wrap">${figT}</div>
    <div class="chart-wrap">${figQ}</div>
    ${mlNote(`The correlation matrix of ${mv.F.keys.length} metrics over ${n} runs, decomposed by power iteration. Numerical rank ${p.rank} of ${p.p}; ${p.m} component(s) retained, holding ${mlPct(p.retained)} of the variation. T² measures the distance of a run from the centre of the retained subspace, and Q the part of the run those components cannot reproduce — a fault confined to a low-variance direction shows in Q and not in T², which is why both are drawn.`)}
    ${mlWarn("Both sets of lines are "+p.limitKind+", computed from the same runs they are compared against. They rank runs within this history; they are not control limits, carry no false-alarm rate, and with a short history a highest-ranked run will exceed the 99th percentile whenever the values differ at all.")}
    ${tabOver}
    <div class="chart-wrap">${figS}</div>
    ${tabLoad}
    ${mlInventory(mv.F)}`;
}