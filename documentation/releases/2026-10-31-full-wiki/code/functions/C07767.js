function renderCurveGraphAnalysis(run,targetKey){
  const el=$("#curve-analysis");if(!el)return;
  if(!run){el.innerHTML=graphAnalysisMarkup(null,null,"","");return;}
  const targetSel=$("#curve-target"),sampleSel=$("#curve-sample"),signalSel=$("#curve-signal");
  const targetLabel=targetSel&&targetSel.selectedIndex>=0?targetSel.options[targetSel.selectedIndex].textContent:"All analyses";
  const signalLabel=signalSel&&signalSel.selectedIndex>=0?signalSel.options[signalSel.selectedIndex].textContent:"Stored curve (raw / Rn)";
  el.innerHTML=graphAnalysisMarkup(run,{g:{title:"Amplification curves"},target:targetLabel},targetKey,sampleSel&&sampleSel.value,signalLabel);
}