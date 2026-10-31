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