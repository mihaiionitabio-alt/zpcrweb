function mlPanelDrivers(mv){
  if(!mv||!mv.F||!mv.F.ok)return "";
  const head=`<h4>${esc(ui("Which metrics go with a flagged run"))}</h4>`;
  if(!mv.logit)return head+mlNote("The forensic log has no findings, or a finding on every run, in this cohort: there is nothing for an association model to separate.");
  const L=mv.logit,keys=mv.F.keys;
  const caveats=[
    `Label: a run that produced at least one forensic finding (${L.nPos} of ${L.n} runs). The categories of finding are pooled, because the history row carries a count and not a category; an integrity finding and an analysis-setting finding are therefore treated as the same event, which they are not.`,
    `The label's own metrics are excluded from the features, but that does not rule out indirect leakage: a metric the forensic rules themselves read will carry part of the label by construction. These are associations in this cohort, not causes, and not a prediction for a run that has not happened.`,
    `L2-penalised logistic regression, ${keys.length} standardised metrics, fixed λ = 1 and ${400} steps at a fixed step size — λ is not tuned and no convergence criterion is applied; the trace shows the log-loss and gradient if you need to check it.`,
    mv&&mv.holdout
      ?`For the out-of-time line the feature schema was rebuilt on the ${mv.holdout.nTrainRows} training runs alone (${mv.holdout.keys.length} metric(s) survived there), and the later runs were projected onto it; ${mv.holdout.droppedTest} later run(s) were dropped for missing one of those metrics.`
        +(()=>{const only=mv.holdout.keys.filter(k=>keys.indexOf(k)<0);
          return only.length?` ${only.length} of those metric(s) are not in the cohort-wide set above, because they are recorded often enough inside the training period but not across the whole cohort: ${only.join(", ")}.`:"";})()
        +` The coefficients above, by contrast, are selected and fitted over the whole cohort, so their own selection has seen every run.`
      :"The coefficients above are selected and fitted over the whole cohort: the presence and variance screening that chose the metrics has seen every run, including any later period, so they describe this history rather than predicting a future one."
  ];
  if(!L.enoughEvents)return head
    +mlWarn(`Coefficients are not shown. There are ${L.nPos} flagged and ${L.nNeg} clean run(s) across ${L.p} metrics (${mlNum(L.eventsPerFeature,2)} events per metric). Below roughly one event per metric, and five in each class, the weights of such a model are not interpretable.`)
    +mlNote(caveats.join(" "));
  const w=L.w.map((v,j)=>({k:keys[j],v})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,10);
  /* The host renderer draws VERTICAL bars: x is the position, y is the height
     and the third value is the baseline. Revision 2 passed [coefficient, rank,
     0], so every rectangle's height was its rank and a negative coefficient
     became a positive-height bar standing to the left of zero. There is no
     horizontal bar type to reach for, so each coefficient is drawn as a line
     segment from zero to its value on its own row, with a point at the end. */
  const span=extent(w.map(o=>o.v).concat([0]),0.25);
  const fig=mlPlot({title:ui("Metrics associated with a run that produced a forensic finding"),
    width:880,height:Math.max(220,60+w.length*26),x:span,y:[0.4,w.length+0.6],
    xlab:ui("weight (standardised metric, log-odds) — bar length is the weight, sign is its direction"),
    yticks:false,left:210,
    series:w.map((o,i)=>({type:"line",colour:o.v>0?"#2563eb":"#0891b2",width:9,
        data:[[0,w.length-i],[o.v,w.length-i]],tip:`${o.k}: ${mlNum(o.v,3)}`}))
      .concat([{type:"points",r:3.2,data:w.map((o,i)=>[o.v,w.length-i,
        `${o.k}: ${mlNum(o.v,3)}`,o.v>0?"#1d4ed8":"#0e7490"])}]),
    vlines:[{x:0,label:"",colour:"#9ca3af",dash:"1 0"}],
    texts:w.map((o,i)=>({px:200,y:w.length-i,text:o.k,size:10,anchor:"end",colour:"#374151"}))
      .concat(w.map((o,i)=>({x:o.v,y:w.length-i,text:" "+mlNum(o.v,3),size:10,
        anchor:o.v>0?"start":"end",colour:"#6b7280"}))),
    legend:[{label:ui("higher value, finding more likely"),colour:"#2563eb"},
      {label:ui("higher value, finding less likely"),colour:"#0891b2"}]});
  const perf=table([{key:"what",label:"Evaluation"},{key:"auc",label:"Area under the ROC curve",n:1},
    {key:"note",label:"How to read it"}],
    [{what:"In-sample",auc:mlNum(L.aucIn,3),note:ui("fitted and scored on the same runs: an optimistic estimate of the fit, with no ordering relation to the line below — a later period can be easier and score higher")},
     {what:L.nTest>0?`Out-of-time (${L.nTrain} earlier runs → ${L.nTest} later runs)`:"Out-of-time (not possible on this cohort)",
      auc:Number.isFinite(L.aucOut)?mlNum(L.aucOut,3):"—",
      note:Number.isFinite(L.aucOut)
        ?ui("fitted on the earlier period and scored on the later one, with the feature schema and the standardisation both derived from the training runs only — this is the number that speaks to a later run")
        :ui("not computed: ")+L.outWhy+ui(". Without it the line above cannot be read as evidence that the association holds for a future run.")}]);
  return head+`<div class="chart-wrap">${fig}</div>
    ${table([{key:"metric",label:"Metric"},{key:"w",label:"Weight",n:1},{key:"dir",label:"Reading"}],
      w.map(o=>({metric:o.k,w:mlNum(o.v,3),dir:ui(o.v>0?"a high value goes with a finding":"a high value goes with a clean run")})))}
    ${perf}${mlNote(caveats.join(" "))}`;
}