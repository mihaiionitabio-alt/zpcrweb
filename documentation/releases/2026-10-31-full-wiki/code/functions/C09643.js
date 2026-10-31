function reportItemVisible(item){
 if(!item||!item.ready())return false;
 if(item.reportGraph){if(!RUNS.some(r=>!r.rawOnly&&!r.pcrdLocked))return false;const run=RUNS[selRunIndex()];if(SEL_STATE.figureScope!=='all'&&(run?.rawOnly||run?.pcrdLocked))return false;return true;}
 if(item.kind==='data'){try{return item.rows().length>0;}catch(e){return false;}}
 if(item.reportAcquisition&&!item.reportPanel.series.some(s=>s.points.some(p=>Number.isFinite(p[1]))))return false;
 if(item.independentGroup){const g=item.independentGroup,metric=item.pcrdMetric.includes('Tm')?'Tm':'Cq';const valid=item.independentComparison?piComparisons().some(r=>r._group===g&&r.metric===metric&&Number.isFinite(r.delta)):g.records.some(r=>Number.isFinite(metric==='Tm'?r.tm.value:r.cq.value));if(!valid)return false;}
 if(SEL_STATE.figureScope!=='all'&&item.kind==='image'){
  const run=RUNS[selRunIndex()];
  if(item.reportAcquisition)return item.reportAcquisition.runs.includes(run)&&item.reportPanel.series.some(s=>s.points.some(p=>Number.isFinite(p[1])));
  if(item.cfxRun)return item.cfxRun===run;
  if(item.independentGroup)return item.independentGroup.run===run&&item.independentGroup.records.some(r=>Number.isFinite(item.pcrdMetric.includes('Tm')?r.tm.value:r.cq.value));
  if(item.id.startsWith('img:pcrd_'))return !!run?.pcrd&&String(item.note).includes(run.file);
 }
 return true;
}