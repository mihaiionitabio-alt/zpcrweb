function grade(step,answer,hints=0){
 const truth=step.evaluate();
 const unsafe=(truth.noLimits&&answer.call==='In control') || (truth.notApplicable&&answer.call==='Negative') || (truth.acceptanceFailed&&['Positive','Negative'].includes(answer.call)) || (truth.sentinel&&answer.call==='Positive') || (truth.integrityOpen&&answer.call!==undefined&&answer.call!=='Invalid');
 const parts={};let earned=0,max=0;
 for(const [key,weight] of Object.entries(step.weights)){
  max+=weight;
  const ok=key==='value'?Number.isFinite(answer.value)&&Math.abs(answer.value-truth.value)<=(step.tolerance||0):id(answer[key])===id(truth[key]);
  parts[key]={correct:ok,earned:ok?weight:0,max:weight};earned+=parts[key].earned;
 }
 const cautious=!unsafe&&parts.call&&!parts.call.correct&&['Repeat','Inconclusive'].includes(answer.call)&&['Positive','Negative'].includes(truth.call);
 const ceiling=ceilings[Math.min(3,Math.max(0,hints))];
 return {points:unsafe?-60:Math.min(ceiling,100*earned/max-(cautious?10:0)),rawEarned:earned,rawMax:max,ceiling,unsafe:!!unsafe,retry:!!unsafe,parts,truth};
}