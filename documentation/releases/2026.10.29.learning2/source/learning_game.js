/* Isolated artificial-data training. Never writes RUNS, SOP or analysis results. */
(function(root){
'use strict';
const VERSION='learning-2';
const RULES=Object.freeze({'chart.baseline':'Baseline readiness','sop.native':'Native detection status','sop.scope':'Profile applicability','integrity.absent':'No supplied checksum'});
const clone=x=>JSON.parse(JSON.stringify(x));
const id=x=>JSON.stringify(x);
const ceilings=[100,70,50,30];
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
function rulesFor(step){return [...new Set([step.evaluate().rule,...Object.keys(RULES)])].filter(Boolean);}
function fixtures(){
 const profile=Object.freeze({id:'TRAINING-NATIVE-1',revision:'1',cutoff:40,baselineMinimum:20});
 const chart=Object.freeze({instrument:'ARTIFICIAL-CFX-2',id:'A-H2c',points:[10,11,10,12,11,10,11]});
 const rows=Array.from({length:21},(_,i)=>Object.freeze({run:'ARTIFICIAL-SC_02',well:'A'+String(i+1).padStart(2,'0'),cq:40,nativeStatus:i<19?'Undetermined':'Detected',fieldId:'nativeStatus'}));
 const baseline=()=>({call:chart.points.length<profile.baselineMinimum?'Cannot be determined':'In control',rule:'chart.baseline',noLimits:chart.points.length<profile.baselineMinimum,evidence:{kind:'chart',instrument:chart.instrument,chart:chart.id}});
 const outcome=row=>({call:row.nativeStatus==='Detected'&&row.cq<=profile.cutoff?'Positive':'Negative',rule:'sop.native',sentinel:row.nativeStatus==='Undetermined',evidence:{kind:'field',run:row.run,well:row.well,field:'nativeStatus'}});
 const step=(x)=>({...x,hints:x.hints||['Inspect the displayed evidence.','Compare it with the training profile.','Use '+(x.rule||'the declared native-status rule')+'.']});
 return {profile,chart,rows,cases:[
 {id:'chart-baseline',title:'Seven points is not a pass / 七个点不代表合格',brief:'Review the chart and the declared minimum before deciding. / 判断前请检查图表及规定的最少点数。',steps:[
 step({id:'count',prompt:'How many recorded points? / 有多少个记录点？',weights:{value:20},evaluate:()=>({value:chart.points.length,rule:'chart.baseline'})}),
 step({id:'decision',prompt:'Commit a chart status, cite its rule and select the chart. / 选择图表状态、规则及证据。',weights:{call:40,rule:40,evidence:20},calls:['In control','Outside limits','To watch','Cannot be determined'],rule:'chart.baseline',evaluate:baseline}),
 step({id:'minimum',prompt:'How many points are required? / 至少需要多少个点？',weights:{value:20},evaluate:()=>({value:profile.baselineMinimum,rule:'chart.baseline'})})]},
 {id:'sentinel',title:'The final cycle / 最后一个循环',brief:'Equal Cq numbers can retain different native statuses. This training profile explicitly accepts measured crossings through cycle 40. / 相同Cq可对应不同原始状态。本训练配置明确接受第40循环的实测交点。',steps:[
 step({id:'count',prompt:'How many rows have Cq 40? / 有多少条记录的Cq为40？',weights:{value:20},evaluate:()=>({value:rows.filter(w=>w.cq===40).length,rule:'sop.native'})}),
 step({id:'crossings',prompt:'How many are measured crossings? / 有多少个实测交点？',weights:{value:30},evaluate:()=>({value:rows.filter(w=>w.nativeStatus==='Detected').length,rule:'sop.native'})}),
 ...[0,19].map(i=>step({id:'well-'+i,prompt:'Commit a call for '+rows[i].well+'; select its distinguishing field. / 判断该孔并选择区分状态的字段。',weights:{call:40,rule:40,evidence:20},calls:['Positive','Negative','Inconclusive','Repeat','Invalid'],evaluate:()=>outcome(rows[i])}))
 ]} ]};
}
function session(data=fixtures(),identity={}){
 const records=[],latest=new Map(),usedHints=new Map();
 const find=(c,s)=>{const step=data.cases.find(x=>x.id===c)?.steps.find(x=>x.id===s);if(!step)throw Error('Unknown training step');return step;};
 return {data,records,hint(c,s){const st=find(c,s),k=c+'/'+s,n=Math.min(3,(usedHints.get(k)||0)+1);usedHints.set(k,n);return st.hints[n-1];},
 commit(c,s,answer,rationale='',latencyMs=0){const step=find(c,s),key=c+'/'+s,score=grade(step,answer,usedHints.get(key)||0);const row={scenario:c,step:s,attempt:records.filter(x=>x.scenario===c&&x.step===s).length+1,answer:clone(answer),truth:clone(score.truth),score,rationale:String(rationale),latencyMs:Math.max(0,Number(latencyMs)||0),hintsUsed:usedHints.get(key)||0,profile:clone(data.profile),moduleVersion:VERSION,...identity,at:new Date().toISOString()};records.push(row);latest.set(key,row);return clone(row);},
 summary(){const all=[...latest.values()],expected=data.cases.reduce((n,c)=>n+c.steps.length,0),mean=all.length?all.reduce((n,x)=>n+x.score.points,0)/all.length:0;return {completed:all.length,total:expected,mean,unresolvedUnsafe:all.filter(x=>x.score.unsafe).length,passed:all.length===expected&&mean>=70&&!all.some(x=>x.score.unsafe),missProfile:records.reduce((a,x)=>{const rule=x.truth.rule;a[rule]??={attempts:0,misses:0};a[rule].attempts++;if(Object.values(x.score.parts).some(p=>!p.correct)||x.score.unsafe)a[rule].misses++;return a;},{}),badges:all.length===expected&&records.every(x=>!x.score.unsafe)?['Steady Hand']:[]};}
 };
}
const api={VERSION,grade,rulesFor,fixtures,session,active:false,voice:()=>false};
if(typeof module!=='undefined')module.exports=api;
root.MISSY_LEARNING=api;
})(typeof window==='undefined'?globalThis:window);
