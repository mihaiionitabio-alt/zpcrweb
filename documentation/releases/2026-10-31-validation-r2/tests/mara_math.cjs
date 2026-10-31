// Mathematical fixtures only. No instrument files; no claim of laboratory validation.
const assert=require('node:assert/strict'),fs=require('fs'),E=require('../src/core/mara_engine.js');
const profiles=fs.readdirSync('profiles/MARA1012').filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync('profiles/MARA1012/'+x,'utf8')));
function fixture(p){
 const quant=p.analyticalRole==='quantification',rapid=p.method.standard_number===17,dd=p.method.standard_number===16,event=rapid?'pat':dd?'WYN341GmC':p.method.selected_event,reference=rapid||dd?'Lectin':p.method.reference_genes[0].target;
 if(dd){p.method.selected_event=event;p.method.reference_genes=[{target:reference}];p.comparison={...p.comparison,control_content_percent:3,labelling_threshold_percent:3,control_expanded_uncertainty_percent:.1};}
 if(!quant&&!rapid)p.control_identity={...p.control_identity,event,positive_percent:.1};
 const context={assays:[event],reference,methodVerified:true,sequenceVerified:true,dnaBasisVerified:true,rapidWorkflow:true,samePlateVerified:true,calibrationRangeVerified:true};
 const records=[];let id=0;
 const reaction=(role,sample,assay,cq,extra={})=>records.push({id:'r'+id++,role,sample,assay,cq,curve:Number.isFinite(cq)?'typical':'absent',...extra});
 for(const role of ['blank','negative',...(quant?[]:[dd?'quantitative':'positive'])])for(const assay of [event,reference])for(let i=0;i<(rapid?1:3);i++)reaction(role,role,assay,role==='positive'||role==='quantitative'||role==='negative'&&assay===reference?25:NaN);
 if(quant){
  p.calibrator={...p.calibrator,quantity_unit:'copies',content_basis:'copy-number ratio',certified_content_percent:1,certified_uncertainty_percent:.1,certificate_uncertainty_kind:'standard',loq_boundary:'review'};
  const low=p.performance.lod_copies===22?33:30;
  for(let level=0;level<5;level++)for(const assay of [event,reference])for(let i=0;i<3;i++){
   const copies=low*10**level*(assay===reference?100:1),cq=38-3.3*Math.log10(copies);
   reaction('calibrator','CAL'+level,assay,cq,{copies,level:'L'+level});
  }
  for(const assay of [event,reference])for(let i=0;i<3;i++)reaction('quantitative','CPQ',assay,38-3.3*Math.log10(assay===reference?100000:1000),{pair:'P'+i});
 }
 for(let sub=1;sub<=(rapid?1:3);sub++)for(const assay of [event,reference])for(let rep=0;rep<(quant||dd?3:1);rep++)reaction('sample','S_'+sub,assay,quant?38-3.3*Math.log10(assay===reference?100000:1000):dd&&assay===event?24.5:25,{sampleGroup:'S',subsample:rapid?'':String(sub)});
 return {p,records,context,event,reference,reaction};
}
const near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<t,`${a} != ${b}`);
let checks=0;
for(const raw of profiles){const f=fixture(structuredClone(raw)),before=JSON.stringify(f.records),r=E.evaluate(f.p,f.records,f.context);
 assert(r.valid,raw.method.id+' '+JSON.stringify(r.checks.filter(x=>!x.pass)));
 assert.equal(r.decisions.length,1);assert.equal(r.decisions[0].outcome,'Positive',raw.method.id);
 if(raw.analyticalRole==='quantification'){
  near(r.decisions[0].values.content_percent,1);near(r.decisions[0].values.rawU,2*Math.hypot(raw.calculation.uncertainty.u0,raw.calculation.uncertainty.ur));assert.match(r.decisions[0].values.text,/±/);
 }else assert.equal(r.decisions[0].code,raw.method.standard_number===17?'panel_detected':raw.method.standard_number===16?'higher':'majority');
 assert.equal(JSON.stringify(f.records),before);checks++;
 // A missing curve is never accepted as a negative result.
 f.records.find(x=>x.role==='sample'&&x.assay===f.event).curve='unknown';
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Inconclusive');checks++;
 // Any contaminated blank invalidates all sample calls.
 const blank=f.records.find(x=>x.role==='blank'&&x.assay===f.event);blank.curve='typical';blank.cq=20;
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Invalid run');checks++;
}
assert.equal(profiles.length,32);assert(profiles.some(p=>p.method.standard_number===16));
const q=profiles.find(p=>p.method.standard_number===13&&p.analyticalRole==='quantification');
const qualitative=profiles.find(p=>p.method.standard_number===13&&p.analyticalRole==='identification');
{
 const f=fixture(structuredClone(q));f.p.calculation.uncertainty.mode='laboratory';
 f.p.calculation.uncertainty.laboratory={u0:.02,ur:.1,coverage_factor_k:3,range_min_percent:.1,range_max_percent:5,validated:true,components_complete:true,measurand:'copy-number ratio'};
 const d=E.evaluate(f.p,f.records,f.context).decisions[0];assert.equal(d.code,'quantified');near(d.values.rawU,3*Math.hypot(.02,.1));assert.equal(d.values.coverage_factor,3);assert.equal(d.values.uncertainty_basis,'laboratory');
 f.p.calculation.uncertainty.laboratory.components_complete=false;assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].code,'laboratory_uncertainty');
 f.p.calculation.uncertainty.laboratory.components_complete=true;f.p.calculation.uncertainty.laboratory.range_max_percent=.5;assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].code,'laboratory_uncertainty');checks+=3;
 const g=fixture(structuredClone(q));g.p.calculation.uncertainty.u0=.5;assert.equal(E.evaluate(g.p,g.records,g.context).decisions[0].code,'uncertainty_settings');checks++;
}
{
 const raw=profiles.find(p=>p.method.standard_number===16);
 for(const delta of [-.5,-.4,0,.4,.5]){const f=fixture(structuredClone(raw));for(const r of f.records.filter(r=>r.role==='sample'&&r.assay===f.event))r.cq=25+delta;
  const d=E.evaluate(f.p,f.records,f.context).decisions[0];assert.equal(d.code,delta<-.4?'higher':delta>.4?'lower':'quantification required');near(d.values.delta_delta_ct,delta);assert.equal(d.values.content_percent,undefined);checks++;
 }
 const f=fixture(structuredClone(raw));f.records=f.records.filter(r=>!(r.role==='sample'&&r.subsample==='3'));assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].code,'replicate_structure');
 const g=fixture(structuredClone(raw));g.p.comparison.labelling_threshold_percent=5;assert(!E.evaluate(g.p,g.records,g.context).valid);
 const h=fixture(structuredClone(raw));h.records.find(r=>r.role==='quantitative').cq=37;assert.equal(E.evaluate(h.p,h.records,h.context).decisions[0].outcome,'Invalid run');checks+=3;
 const k=fixture(structuredClone(q));for(const sub of ['1','2','3'])for(const assay of [k.event,k.reference]){
  const values=assay===k.event?[1000,2000,3000]:[10000,100000,200000];k.records.filter(r=>r.role==='sample'&&r.subsample===sub&&r.assay===assay).forEach((r,i)=>r.cq=38-3.3*Math.log10(values[i]));
 }near(E.evaluate(k.p,k.records,k.context).decisions[0].values.content_percent,100*6000/310000);checks++;
}
{
 const f=fixture(structuredClone(qualitative));
 for(const r of f.records.filter(x=>x.role==='sample'&&x.assay===f.event)){r.cq=36;r.curve='typical';}
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Positive');
 f.records.find(x=>x.role==='sample'&&x.assay===f.event).cq=36.001;
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Positive');
 f.records.filter(x=>x.role==='sample'&&x.assay===f.event)[1].cq=36.001;
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Negative');
 f.records.find(x=>x.role==='sample'&&x.assay===f.reference).curve='absent';
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].outcome,'Invalid');checks+=4;
}
{
 const f=fixture(structuredClone(q));f.records.find(x=>x.role==='sample').subsample='';assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].code,'replicate_structure');
 const z=fixture(structuredClone(q));z.records.find(x=>x.role==='quantitative').pair='';assert(!E.evaluate(z.p,z.records,z.context).valid);
 const u=fixture(structuredClone(q));u.p.calibrator.content_basis='mass fraction';assert(!E.evaluate(u.p,u.records,u.context).valid);
 const v=fixture(structuredClone(q));v.records=v.records.filter(x=>!(x.role==='calibrator'&&x.level==='L4'));assert(!E.evaluate(v.p,v.records,v.context).valid);
 const w=fixture(structuredClone(q));w.records.find(x=>x.role==='calibrator').copies='';assert(!E.evaluate(w.p,w.records,w.context).valid);
 const x=fixture(structuredClone(q));x.records.push({...x.records[0]});assert(!E.evaluate(x.p,x.records,x.context).valid);checks+=6;
}
{
 for(const content of [.08,.1,.2]){const f=fixture(structuredClone(q));for(const r of f.records.filter(x=>x.role==='sample'))r.cq=38-3.3*Math.log10(r.assay===f.reference?100000:content*1000);
  const d=E.evaluate(f.p,f.records,f.context).decisions[0];assert.equal(d.code,content<.1?'below_loq':content===.1?'loq_boundary':'quantified');if(content<=.1)assert.equal(d.values.content_percent,undefined);
 }
 const f=fixture(structuredClone(q));for(const r of f.records.filter(x=>x.role==='sample'&&x.assay===f.event&&x.subsample==='3'))r.cq=38-3.3*Math.log10(4000);
 assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].code,'sample_precision');checks+=4;
}
const line=E.fit([10,100,1000].map(copies=>({copies,cq:40-3.3*Math.log10(copies)})));near(line.slope,-3.3);near(line.intercept,40);near(line.r2,1);near(E.copies(30.1,line),1000);
{
 for(const delta of [-.5,-.4,0,.4,.5]){
  const f=fixture(structuredClone(qualitative));f.p.comparison.enabled=true;
  for(const assay of [f.event,f.reference])for(let i=0;i<3;i++)f.reaction('quantitative','CPQ',assay,25);
  for(const r of f.records.filter(r=>r.role==='sample'&&r.assay===f.event))r.cq=25+delta;
  const d=E.evaluate(f.p,f.records,f.context).decisions[0];assert.equal(d.outcome,'Positive');near(d.values.delta_delta_ct,delta);
  assert.equal(d.values.comparison_outcome,delta<-.4?'higher':delta>.4?'lower':'quantification required');assert.equal(d.values.content_percent,undefined);checks++;
 }
 const f=fixture(structuredClone(qualitative));f.p.comparison.enabled=true;assert.equal(E.evaluate(f.p,f.records,f.context).decisions[0].values.comparison_outcome,'comparison_unavailable');checks++;
 const boundary=fixture(structuredClone(q));for(const r of boundary.records)if(r.curve==='typical')r.cq=38+(r.cq-38)*3.6/3.3;
 const result=E.evaluate(boundary.p,boundary.records,boundary.context);assert(result.valid);assert.equal(result.decisions[0].code,'quantified');checks++;
 // Calibrators and R² are irrelevant to section 5. Neither absent standards nor
 // deliberately nonsensical legacy efficiency values can veto identification.
 const k=fixture(structuredClone(qualitative));k.p.run.effMin=9999;k.p.run.effMax=0;k.p.run.minR2=2;assert.equal(E.evaluate(k.p,k.records,k.context).decisions[0].outcome,'Positive');checks++;
}
assert(E.crmAcceptance([1,1,1],1,.1).pass);assert(!E.crmAcceptance([1.2,1.2,1.2],1,0).pass);assert(!E.crmAcceptance([1.2,1.2,1.2],1,.099).pass);
assert(!E.crmAcceptance([1.2,1.2,1.2],1,.1).pass,'strict bias boundary must fail despite floating subtraction');
assert.equal(E.signal({curve:'unknown',cq:20}),null);assert.equal(E.signal({curve:'typical',cq:40},36,true),true);assert.equal(E.signal({curve:'typical',cq:40}),false);
assert.equal(E.uncertainty(1,.0082,.0594).text,'1.00 ± 0.12 %');
console.log('PASS '+profiles.length+' standards/roles; '+checks+' decision checks; OLS/inverse, per-event uncertainty, majority/Ct boundary, missing evidence, contamination, CRM/basis/pairing, calibration coverage, LOQ and precision; zero experiment files');
module.exports={fixture,profiles};
