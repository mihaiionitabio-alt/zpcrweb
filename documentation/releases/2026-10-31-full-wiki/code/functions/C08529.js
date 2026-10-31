function mlPanelForecast(res,S){
  const fc=mlForecast(S.x,S.y,5,{});
  if(!fc)return {html:mlNote("Fewer than eight runs in the cohort: no forecast is offered."),level:"none"};
  const unit=res.def.unit||"";
  const last=S.pts[S.pts.length-1];
  const ucl=S.limitsApply&&S.hasUpper&&Number.isFinite(last.ucl)?last.ucl:NaN;
  const lcl=S.limitsApply&&S.hasLower&&Number.isFinite(last.lcl)?last.lcl:NaN;
  const cross=S.limitsApply?mlCrossing(fc,ucl,lcl):null;
  const reliable=fc.intervalReliable;
  const ys=S.y.concat(fc.points.flatMap(p=>reliable?[p.lo,p.hi]:[p.y]),
    [ucl,lcl].filter(Number.isFinite));
  const series=[{type:"line",colour:"#cbd5e1",width:1,data:S.pts.map((p,i)=>[p.x,S.y[i]])},
    {type:"points",r:3,colour:CC_COL.pt,data:S.pts.map((p,i)=>[p.x,S.y[i],mlRunLabel(p.row)])},
    {type:"line",colour:"#0f766e",width:1.6,data:fc.inSample.map(p=>[p.x,p.y]),tip:ui("fitted "+fc.model)}];
  if(reliable)series.push(
    {type:"line",colour:"#0f766e",dash:"4 3",data:fc.points.map(p=>[p.x,p.hi]),tip:ui("upper prediction interval")},
    {type:"line",colour:"#0f766e",dash:"4 3",data:fc.points.map(p=>[p.x,p.lo]),tip:ui("lower prediction interval")});
  series.push({type:"points",r:4,colour:"#0f766e",
    data:fc.points.map(p=>[p.x,p.y,ui("forecast")+" "+mlNum(p.y)])});
  const fig=mlPlot({title:ui(reliable?"Forecast of the next five runs with a 95 % prediction interval"
      :"Forecast of the next five runs — interval withheld, see below"),
    width:880,height:300,x:extent(S.x.concat(fc.points.map(p=>p.x)),0.04),y:extent(ys,0.08),
    xlab:res.X.label,ylab:unit+(S.transformed?" ("+ui("measured value")+")":""),
    series,
    hlines:[Number.isFinite(ucl)?{y:ucl,label:"UCL",colour:CC_COL.bad}:null,
      Number.isFinite(lcl)?{y:lcl,label:"LCL",colour:CC_COL.bad}:null].filter(Boolean),
    legend:[{label:ui("observed"),colour:CC_COL.pt},{label:ui("fitted and forecast"),colour:"#0f766e"}]});
  const rows=fc.points.map((p,i)=>({ahead:"+"+(i+1),x:mlNum(p.x,5),y:mlNum(p.y),
    lo:reliable?mlNum(p.lo):"withheld",hi:reliable?mlNum(p.hi):"withheld"}));
  const tab=table([{key:"ahead",label:"Runs ahead"},{key:"x",label:res.X.label,n:1},
    {key:"y",label:"Expected "+(unit||"value"),n:1},
    {key:"lo",label:"Lower 95 %",n:1},{key:"hi",label:"Upper 95 %",n:1}],rows);
  const ind=fc.independence;
  const method=[
    `Quantity fitted: ${S.quantity}${S.transformed?" — "+S.transformedAs+" is what the chart above plots":""}.`,
    `Model: ${fc.model}, chosen by ${fc.selectionRule}; margin over the alternative ${Number.isFinite(fc.selectionMargin)?fc.selectionMargin.toFixed(2)+" AICc":"no alternative"}. R² ${mlNum(fc.r2,3)}, residual spread ${mlNum(fc.sigma)} ${unit}, ${fc.n} runs, ${fc.dof} residual degrees of freedom.`,
    `Interval: one future observation, Student-t at ${fc.dof} degrees of freedom (${mlNum(fc.tQuantile,4)}) times the standard error, with the leverage of the fitted design. It is not a control limit and raises no alarm.`,
    `The 95 % is NOMINAL. Because the model is chosen from the same runs it is fitted to, the level is not exact: in rolling-origin simulation on series that satisfy the assumptions, the intervals this layer offers covered about 93–94 % at every horizon, falling to roughly 89 % five runs ahead when the underlying process was curved. Treat the band as approximate, and more approximate the further out you read it.`,
    `Assumed future spacing: ${mlNum(fc.stepX,4)} on this axis per run, the median observed step.`,
    `Independence screen on the residuals: lag-1 autocorrelation ${mlNum(ind.r1,3)}${Number.isFinite(ind.se)?" (standard error ≈ "+mlNum(ind.se,2)+")":""}, Ljung-Box Q ${mlNum(ind.Q,4)} on ${ind.lags||0} lags, p ${Number.isFinite(ind.p)?ind.p.toExponential(2):"—"}.`
  ].join(" ");
  let verdict;
  if(!reliable)verdict=mlWarn("The residuals are autocorrelated (Ljung-Box p "+(Number.isFinite(ind.p)?ind.p.toExponential(2):"—")
    +"), so the independence assumption the interval rests on does not hold and its nominal 95 % coverage is unsupported. Which way and how far the true coverage departs depends on the dependence structure and the horizon, so no corrected interval is offered either: only the fitted path is shown.");
  else if(ind.ok===null)verdict=mlNote("Too few residuals to test independence ("+ind.n+"): the interval is shown, but nothing here establishes its coverage on this series.");
  else verdict=mlNote("The screen found no evidence against independence. That is not a demonstration of it — at this sample size the test has little power — so the interval's nominal coverage remains an assumption.");
  const crossText=!S.limitsApply
    ?mlNote(S.limitWhy||"No crossing statement is made for this chart type.")
    :`${S.oneSided?mlNote(S.limitWhy):""}<p><b>${esc(cross
        ?`${ui("the fitted model reaches the")} ${ui(cross.side==="upper"?"upper":"lower")} ${ui("control limit")} (${mlNum(cross.limit)} ${unit}) ${ui("within the next five runs")}`
        :ui("the fitted path does not reach "+(S.oneSided?"that limit":"either control limit")+" within the next five runs"))}.</b></p>`;
  return {level:cross?"warn":"ok",
    html:`<div class="chart-wrap">${fig}</div>${tab}${verdict}${crossText}${mlNote(method)}`};
}