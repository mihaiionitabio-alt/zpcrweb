function mlPanelChange(res,S){
  const cp=mlChangepoints(S.y,3);
  const basis=mlNote(`Binary segmentation on the mean; a split is kept when the reduction in the residual sum of squares exceeds 2·log(n)·s² with s = ${mlNum(cp.scale,3)} ${res.def.unit||""} estimated from ${cp.scaleKind} (penalty ${mlNum(cp.penalty,4)}); a split is then kept only if the step between the segment medians exceeds 2s = ${mlNum(cp.minStep,3)}, which stops a single extreme run from being reported as a pair of level changes. This is an exploratory heuristic in the shape of a Schwarz penalty, not a test with a calibrated error rate, and it cannot show that no shift exists.`);
  if(!cp.points.length)return {level:"ok",
    html:mlNote("No change of level was detected by this method on these runs. That is not evidence that the level is constant — a smaller shift than this penalty admits would not be reported.")+basis};
  const unit=res.def.unit||"";
  const marks=cp.points.map(c=>({x:S.x[c.index],label:ui("level change"),colour:"#7c3aed",dash:"3 3",row:0}));
  const fig=mlPlot({title:ui("Change points in the level, with the median of each final segment"),
    width:880,height:280,x:extent(S.x,0.04),y:extent(S.y,0.1),xlab:res.X.label,ylab:unit,
    series:[{type:"line",colour:"#cbd5e1",width:1,data:S.pts.map((p,i)=>[p.x,S.y[i]])},
      {type:"points",r:3,colour:CC_COL.pt,data:S.pts.map((p,i)=>[p.x,S.y[i],mlRunLabel(p.row)])}]
      .concat(cp.segments.map(g=>({type:"line",colour:"#7c3aed",width:2,
        data:[[S.x[g.from],g.level],[S.x[Math.max(g.from,g.to-1)],g.level]],
        tip:ui("segment median")+" "+mlNum(g.level)}))),
    vlines:marks,legend:[{label:ui("segment median"),colour:"#7c3aed"}]});
  const rows=cp.points.map(c=>{const p=S.pts[c.index];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),
      before:mlNum(c.before),after:mlNum(c.after),step:mlNum(c.after-c.before),
      nb:c.nBefore,na:c.nAfter};});
  return {level:"warn",html:`<div class="chart-wrap">${fig}</div>
    ${table([{key:"run",label:"First run of the new level"},{key:"date",label:"Date"},
      {key:"before",label:"Level before",n:1},{key:"after",label:"Level after",n:1},
      {key:"step",label:"Step",n:1},{key:"nb",label:"Runs before",n:1},{key:"na",label:"Runs after",n:1}],rows)}
    ${mlNote("The levels quoted are the medians of the final segments, which is what the figure draws, so the table and the figure agree. A change point is a date to look for a cause — a service, a reagent lot, a firmware change. If the new level is accepted, the chart's own baseline setting below is where that is recorded; nothing here changes it.")}
    ${basis}`};
}