function mlPanelAnomaly(res,S){
  const a=mlAnomalyScores(S.y);
  if(a.degenerate)return {level:"none",html:mlNote("No ranking is offered: "+a.note+".")};
  const sc=a.scores;
  const ranked=sc.map((s,i)=>({...s,i})).filter(s=>Number.isFinite(s.score)).sort((p,q)=>q.score-p.score);
  const unit=res.def.unit||"";
  const ref=3,top=ranked.slice(0,8);
  const fig=mlPlot({title:ui("Unusualness rank of every run — an uncalibrated score, not a significance test"),
    width:880,height:260,x:extent(S.x,0.04),y:[0,Math.max(ref*1.3,...ranked.map(s=>s.score))*1.08],
    xlab:res.X.label,ylab:ui("score (deviation ÷ "+a.scaleKind+")"),
    series:[{type:"bar",colour:"#94a3b8",data:S.x.map((xv,i)=>[xv,Number.isFinite(sc[i].score)?sc[i].score:0,0,
      `${mlRunLabel(S.pts[i].row)}\n${ui("score")} ${mlNum(sc[i].score,3)}`,
      (sc[i].score>=ref?(S.pts[i].flags.length?CC_COL.rule:CC_COL.bad):"#94a3b8")])}],
    hlines:[{y:ref,label:ui("reference line at 3 — a reading aid, not a threshold"),colour:"#6b7280"}],
    legend:[{label:ui("above the line, a rule also fired"),colour:CC_COL.rule},
      {label:ui("above the line, no rule fired"),colour:CC_COL.bad},{label:ui("below"),colour:"#94a3b8"}]});
  const rows=top.map(s=>{const p=S.pts[s.i];
    return {run:mlRunLabel(p.row),date:mlDate(p.row),value:mlNum(S.y[s.i]),
      score:mlNum(s.score,3),robust:mlNum(s.robust,3),local:mlNum(s.local,3),
      novelty:mlNum(s.novelty,3),rule:p.flags.length?p.flags.join(", "):ui("no rule fired")};});
  const silent=top.filter(s=>s.score>=ref&&!S.pts[s.i].flags.length).length;
  return {level:silent?"warn":"ok",
    html:`<div class="chart-wrap">${fig}</div>
      ${table([{key:"run",label:"Experiment"},{key:"date",label:"Date"},
        {key:"value",label:"Value "+(unit?"("+unit+")":""),n:1},{key:"score",label:"Rank score",n:1},
        {key:"robust",label:"Robust",n:1},{key:"local",label:"Local window",n:1},
        {key:"novelty",label:"Novelty (not in the score)",n:1},{key:"rule",label:"Chart rule"}],rows)}
      ${mlNote(`The score is the larger of two deviations, each divided by ${a.scaleKind} (${mlNum(a.scale,3)} ${unit}): distance from the series median, and distance from the fifteen runs around it. It orders the runs; it is not in standard deviations and carries no false-alarm rate, and the line at 3 is drawn to help read the figure rather than to declare a threshold. The local window uses the runs on both sides, so it is retrospective and cannot be read as prospective detection.`)}
      ${mlNote("The novelty column is the distance in a three-lag embedding, attributed to the run in each window that deviates most on its own. It is shown for information and deliberately does not enter the score.")}
      ${silent?`<p><b>${esc(ui(silent+" of the runs listed stand out with no chart rule fired — the shapes the fixed rules were not written for."))}</b></p>`:""}`};
}