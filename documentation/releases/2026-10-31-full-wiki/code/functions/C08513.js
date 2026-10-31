function mlSeries(res){
  if(!res)return {ok:false,why:"no chart result"};
  if(res.type==="funnel")return {ok:false,funnel:true,
    why:"The funnel plot compares operators rather than a series in time, so the advisory layer is not offered for it."};
  const transformed=!!ML_TRANSFORMED[res.type];
  const val=p=>transformed?(p.raw!==undefined?p.raw:NaN):p.y;
  let pts=res.pts.filter(p=>!p.pre&&Number.isFinite(val(p)));
  /* control materials: a new extract is a new process, so the univariate panels
     speak about the current extract only rather than pooling them */
  let segment="",segmentKey="";
  if(res.segmented&&res.segments&&res.segments.length>1){
    const last=res.segments.find(g=>g.last)||res.segments[res.segments.length-1];
    const before=pts.length;
    pts=pts.filter(p=>p.segment===last.key);
    segmentKey=last.key;
    segment=`${last.key} (${before-pts.length} run(s) on earlier extracts are not pooled with it)`;
  }
  if(pts.length<8)return {ok:false,
    why:`Fewer than eight runs with a value in the current cohort (${pts.length}): too few for any of this to mean anything.`};
  /* Which limits actually exist? An EMPTY set of finite limits must not read as
     "constant": that is how a chart still collecting its baseline came to be
     told that no limit is reached. A limit counts as established only when it is
     finite on every charted point. */
  const n=pts.length;
  const uc=pts.map(p=>p.ucl).filter(Number.isFinite),lc=pts.map(p=>p.lcl).filter(Number.isFinite);
  const hasU=uc.length===n,hasL=lc.length===n;
  const spread=a=>a.length?Math.max(...a)-Math.min(...a):0;
  const scale=Math.max(1e-12,Math.abs(mlMedian(pts.map(val))||1));
  const constU=!hasU||spread(uc)/scale<1e-9,constL=!hasL||spread(lc)/scale<1e-9;
  const denom=ML_DENOMINATOR_LIMITS[res.type]||"";
  const baselineReady=res.baselineReady!==false;
  let limitsApply=false,limitWhy="";
  if(transformed)
    limitWhy=`This chart plots ${ML_TRANSFORMED[res.type]}, and its limits belong to that statistic. The forecast below is of the measured value, so it is not compared with them.`;
  else if(denom)
    limitWhy=`No crossing is assessed for this chart type: its limits are a function of ${denom}, which a future run has not supplied. Historical constancy of those limits is not a future denominator.`;
  else if(!hasU&&!hasL)
    limitWhy="No crossing is assessed: this chart has no control limits on the charted runs — it is still collecting its baseline, or limits are not defined for it.";
  else if(!baselineReady)
    limitWhy="No crossing is assessed: the chart itself reports that its baseline is not yet established, so its limits are provisional.";
  else if(!constU||!constL)
    limitWhy="No crossing is assessed: the limits of this chart move from run to run, so there is no fixed limit for a future run to cross.";
  else{limitsApply=true;
    if(hasU&&!hasL)limitWhy="This chart has an upper limit only; the forecast is assessed against that limit alone.";
    else if(hasL&&!hasU)limitWhy="This chart has a lower limit only; the forecast is assessed against that limit alone.";}
  return {ok:true,pts,x:pts.map(p=>p.x),y:pts.map(val),
    quantity:transformed?"the measured value":"the plotted statistic",
    transformed,transformedAs:ML_TRANSFORMED[res.type]||"",
    limitsApply,hasUpper:hasU,hasLower:hasL,oneSided:limitsApply&&!(hasU&&hasL),
    baselineReady,segment,segmentKey,limitWhy};
}