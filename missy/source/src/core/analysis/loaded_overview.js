/* Descriptive across-run coverage: never pool incompatible measurement cohorts. */
const OVERVIEW_CACHE={runs:null,revision:-1,generation:-1,value:null};
function overviewProtocol(run){
 if(run.cfxRDML?.protocolSHA256)return 'CFX RDML protocol SHA-256 '+run.cfxRDML.protocolSHA256;
 const p=run.protocol||{};if((p.programs||[]).some(x=>(x.segments||[]).length))return sopCanonical({programs:p.programs,channels:p.channels,block:p.block,detectionFormatName:p.detectionFormatName});
 return '(protocol not decoded)';
}
function overviewData(){
 if(OVERVIEW_CACHE.runs===RUNS&&OVERVIEW_CACHE.revision===SAMPLE_SELECTION.revision&&OVERVIEW_CACHE.generation===APP_STATE.generation)return OVERVIEW_CACHE.value;
 const groups=new Map(),runRows=[],points=[];
 function add(run,ri,w,q,basis,target,channel,protocol){
  if(!Number.isFinite(q)||q<=0)return;
  const sn=run.meta.SerialNumber||run.meta.InstrumentID||'',knownProtocol=protocol&&!/not decoded|unknown protocol/i.test(protocol);
  const identity=sn||'Unverified SN; source '+run.meta.sourceSHA256;
  const fingerprint=knownProtocol?sha256Hex(new TextEncoder().encode(protocol)):'Unverified protocol; source '+run.meta.sourceSHA256;
  const key=JSON.stringify([run.reader?.id||run.platform||'',identity,fingerprint,target||'Unassigned',String(channel??''),basis,w.analysis||w.analysisMode||'',w.overviewTargetVerified===false?run.meta.sourceSHA256:'']);
  if(!groups.has(key))groups.set(key,{key,instrument:identity,protocol:fingerprint,target:target||'Unassigned',channel:String(channel??''),basis,analysis:w.analysis||w.analysisMode||'',points:[]});
  const row={run_index:ri+1,filename:run.file,source_sha256:run.meta.sourceSHA256,well:w.well||posToWell(w.pos,run.cols),sample:w.sample||'',role:w.role||w.instrRole||'Unknown',value:q,run};groups.get(key).points.push(row);points.push(row);
 }
 RUNS.forEach((run,ri)=>{
  const selected=ssWells(run),stored=selected.filter(w=>Number.isFinite(sopCq(w))),protocol=overviewProtocol(run);
  for(const w of stored)add(run,ri,w,sopCq(w),'Stored vendor Cq',w.target||w.analysis||'Unassigned',w.filterComb||w.channel,protocol);
  let independent=0;
  if(run.pcrd)for(const group of piResults(run).groups)for(const r of group.records){if(!ssPositionIncluded(run,r.layout.position)||!Number.isFinite(r.cq.value)||r.cq.value<=0)continue;independent++;add(run,ri,{pos:r.layout.position,well:r.layout.well,sample:r.layout.sample,role:r.layout.role,analysis:PCRDI_METHOD+' | acquisition group '+group.step,overviewTargetVerified:!!r.layout.target?.trim()},r.cq.value,'Independently calculated PCRD Cq',r.layout.target?.trim()||'Unassigned target ('+group.dye+')',group.dye+' / raw channel '+(group.channel+1),run.pcrd.protocolSHA256);}
  runRows.push({run:'R'+(ri+1),filename:run.file,format:run.reader?.id||'',selected_results:selected.length,stored_Cq:stored.length,without_Cq:selected.length-stored.length,excluded_results:(run.wells||[]).length-selected.length,independent_Cq:independent,raw_reads:(run.zpcr||run.pcrd)?.reads.length||0});
 });
 const cohorts=[...groups.values()].map((g,i)=>({...g,id:'C'+(i+1)})),stats=[];
 for(const g of cohorts)for(const [role,rows]of byKey(g.points,x=>x.role)){
  const a=rows.map(r=>r.value).sort((a,b)=>a-b);stats.push({cohort:g.id,role,n:a.length,mean:mean(a),median:median(a),SD:a.length>1?sd(a):null,min:a[0],max:a.at(-1)});
 }
 const result={cohorts,stats,runRows,points};OVERVIEW_CACHE.runs=RUNS;OVERVIEW_CACHE.revision=SAMPLE_SELECTION.revision;OVERVIEW_CACHE.generation=APP_STATE.generation;OVERVIEW_CACHE.value=result;return result;
}
function overviewCohortNote(g){return g.id+': '+g.target+' | '+g.basis+' | SN '+g.instrument+' | channel '+g.channel+' | analysis '+(g.analysis||'not recorded')+'\nProtocol fingerprint: '+g.protocol;}
function overviewPlot(g){
 const roles=byKey(g.points,p=>p.role),colours=new Map(),series=[],rows=[],xticks=RUNS.map((r,i)=>({v:i+1,label:'R'+(i+1)}));
 for(const [role,pts]of roles){const colour=catColour(colours,role);series.push({type:'points',r:3,colour,data:pts.map((p,i)=>[p.run_index+((i%13)-6)*.024,p.value,p.filename+' | '+p.well+' | '+p.sample+' | '+role])});
  const medians=[...byKey(pts,p=>p.run_index)].map(([ri,a])=>[ri,median(a.map(p=>p.value)),role+' median; R'+ri]);series.push({type:'points',r:6,colour,data:medians});
  for(const p of pts)rows.push({run:'R'+p.run_index,filename:p.filename,well:p.well,sample:p.sample,role:p.role,Cq:p.value,basis:g.basis});
 }
 return {svg:svgPlot({width:1000,height:560,title:g.id+' - '+g.target+' - '+g.basis,x:[.5,RUNS.length+.5],y:extent(g.points.map(p=>p.value)),xticks,xlab:'Loaded run; full filenames in the source manifest',ylab:'Cq (cycles)',series,legend:legendFromMap(colours)}),rows};
}
function overviewImages(){return overviewData().cohorts.filter(g=>new Set(g.points.map(p=>p.run_index)).size>=2).map(g=>({
 id:'img:overview_'+g.id,kind:'image',group:'Overall summary and comparisons',scope:'all',title:'Across-run Cq comparison - '+g.id+' - '+g.target,
 note:overviewCohortNote(g)+'\nAll selected valid Cq results in this cohort are plotted. Small dots: wells; large dots: per-run/role median. Horizontal jitter only separates overlapping dots. Roles remain separate. No control limits or vendor acceptance are inferred. Biological sample composition can differ; this is descriptive comparison, not proof of QC drift.\n'+[...new Set(g.points.map(p=>p.run_index))].map(i=>'R'+i+': '+RUNS[i-1].file).join('\n'),
 ready:()=>g.points.length>0,figure:()=>overviewPlot(g)
}));}
function overviewSync(){for(let i=GRAPHS.length-1;i>=0;i--)if(GRAPHS[i].id.startsWith('overview_'))GRAPHS.splice(i,1);for(const x of overviewImages())GRAPHS.push({id:x.id.slice(4),title:x.title,group:x.group,scope:'all',opts:[],note:x.note,render:x.figure});}
function overviewTables(){const d=overviewData(),allRows=d.runRows;
 const items=[{id:'data:loaded_overview',kind:'data',group:'Overall summary and comparisons',title:'Overall coverage - all loaded runs',
 note:'Descriptive counts across all loaded run records (analysis views may share a source). Analytical results respect sample selection. Stored and independently calculated Cq are counted separately. Raw-only files have no stored analytical calls. No grand Cq mean is calculated across different targets, protocols, channels, roles or instruments.\nTotals: '+allRows.length+' run records; '+new Set(RUNS.map(r=>r.meta.sourceSHA256)).size+' source files; '+allRows.reduce((n,r)=>n+r.selected_results,0)+' selected stored result records; '+allRows.reduce((n,r)=>n+r.stored_Cq,0)+' valid stored Cq; '+allRows.reduce((n,r)=>n+r.without_Cq,0)+' stored records without valid Cq; '+allRows.reduce((n,r)=>n+r.excluded_results,0)+' excluded records; '+allRows.reduce((n,r)=>n+r.independent_Cq,0)+' independently calculated Cq.\n'+allRows.map(r=>r.run+': '+r.filename).join('\n'),
 ready:()=>RUNS.length>0,rows:()=>allRows.map(r=>({run:r.run,format:r.format,selected:r.selected_results,stored_Cq:r.stored_Cq,no_Cq:r.without_Cq,excluded:r.excluded_results,indep_Cq:r.independent_Cq,raw_reads:r.raw_reads})),file:'all_runs_coverage.csv',tableOptions:{full:true},text:()=>csvOf(allRows)},
 {id:'data:cohort_statistics',kind:'data',group:'Overall summary and comparisons',title:'Overall Cq statistics - separated compatible cohorts',
 note:'Per-result descriptive statistics, separated by source format, instrument identity, decoded protocol fingerprint, target, channel, result basis and role. Sample sizes can differ between runs. A shared label/fingerprint does not verify assay equivalence. SD requires at least two values. Missing instrument/protocol identity or an unnamed PCRD target isolates the source instead of pooling it. PCRD acquisition groups and stored targets remain separate; a dye is not a target identity.\n'+d.cohorts.map(overviewCohortNote).join('\n'),
 ready:()=>d.stats.length>0,rows:()=>d.stats,file:'cohort_statistics.csv',tableOptions:{full:true,columns:['cohort','role','n','mean','median','SD','min','max']},text:()=>csvOf(d.stats)}];return items;
}
MISSY_HOOKS.use('selImageItems','overview/comparison-catalogue',220,next=>function(){return next().filter(x=>!x.id.startsWith('img:overview_')).concat(overviewImages());});
MISSY_HOOKS.use('selDataItems','overview/summary-catalogue',220,next=>function(){return next().concat(overviewTables());});
MISSY_HOOKS.use('astRender','overview/preset',220,next=>function(){next();const tools=document.getElementById('ast-available-tools');if(!tools)return;const button=document.createElement('button');button.type='button';button.textContent=ui('Overview + comparisons');button.id='ast-overview-preset';button.title='Adds overall counts, separated Cq statistics and all available cross-run Cq comparisons; keeps current selections.';button.onclick=()=>{SEL_STATE.figureScope='all';SEL_STATE.ids.add('data:loaded_overview');if(overviewData().stats.length)SEL_STATE.ids.add('data:cohort_statistics');for(const x of overviewImages())SEL_STATE.ids.add(x.id);astRender();};tools.prepend(button);});
MISSY_HOOKS.use('cmdExec','overview/command',220,next=>async function(raw){if(/^overview$/i.test(String(raw).trim())){SEL_STATE.figureScope='all';SEL_STATE.ids.add('data:loaded_overview');if(overviewData().stats.length)SEL_STATE.ids.add('data:cohort_statistics');for(const x of overviewImages())SEL_STATE.ids.add(x.id);cmdPrint('Overall summary and compatible cross-run comparisons added to report selection.','ok');return;}return next(raw);});
CMD_HELP.push(['overview','add overall counts, separated cohort statistics and cross-run comparisons']);
Object.assign(ZH_TERMS,{'Overview + comparisons':'总体统计与跨运行比较'});

MISSY_HOOKS.use('selSelected','overview/summary-first',240,next=>function(){const items=next(),rank=x=>x.id==='data:loaded_overview'?0:x.id==='data:cohort_statistics'?1:x.id.startsWith('img:overview_')?2:3;return items.sort((a,b)=>rank(a)-rank(b));});
