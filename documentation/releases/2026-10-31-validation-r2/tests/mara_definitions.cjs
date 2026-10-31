// Document, schema, UI and export checks only. No experiment files are loaded.
const fs=require('fs'),assert=require('node:assert/strict'),{chromium}=require(process.env.MISSY_PLAYWRIGHT_MODULE||'playwright');
(async()=>{const b=await chromium.launch({headless:true,...(process.env.MISSY_CHROME_EXECUTABLE?{executablePath:process.env.MISSY_CHROME_EXECUTABLE}:process.platform==='win32'?{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}:{})});try{
 const p=await b.newPage({viewport:{width:1920,height:1080}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.MISSY_TEST_URL||require('node:url').pathToFileURL(require('path').resolve(__dirname,'../../../../index.html')).href);
 const library=await p.evaluate(()=>MARA_PROFILE_LIBRARY.map(x=>({...x,hash:sopHash(x.profile)})));
 assert.equal(library.length,32);assert.equal(new Set(library.map(x=>x.hash)).size,32);assert.equal(library.filter(x=>x.role==='screening').length,2);assert.equal(library.filter(x=>x.role==='identification').length,15);assert.equal(library.filter(x=>x.role==='quantification').length,15);
 for(const x of library){assert.equal(x.profile.name,`MARA 1012-${x.standard}-2026`);assert.equal(x.profile.schema,'qpcr-sop-profile/1');assert.equal(x.profile.sha256,x.hash);assert(x.profile.reviewOnly);assert(!x.profile.locked);assert(x.profile.blockedAutomaticInterpretations.length);assert(x.profile.method.sources[0].sha256.length===64);}
 const q13=library.find(x=>x.standard===13&&x.role==='quantification').profile;assert.equal(q13.calculation.uncertainty.u0,.0082);assert.equal(q13.calculation.uncertainty.ur,.0594);assert.equal(q13.performance.template_ng_per_reaction,50);assert.equal(q13.calibrator.maximum_template_ng_per_reaction,100);
 for(const x of library.filter(x=>x.standard===14))assert.equal(x.profile.method.reference_genes[0].target,'Sad1');
 assert.equal(library.find(x=>x.standard===15&&x.role==='quantification').profile.performance.loq_copies,44);
 assert.equal(library.find(x=>x.standard===17).profile.method.rapid_event_assay_catalogue.length,25);
 const {fixture}=require('./mara_math.cjs');
 const oraclePath=require('path').join(__dirname,'../fixtures/mara_library_oracle.json');
 const measured=[];
 for(const entry of library){
  const f=fixture(structuredClone(entry.profile));
  if(f.p.method.standard_number===17){f.p.method.reference_genes=[{target:'Lectin'}];f.p.method.selected_assays=['pat'];}
  f.p.sample_id={pattern:'^(?<sample>.+)_(?<subsample>[1-3])$',flags:'i'};
  const raw=f.records.map((r,i)=>({sample:r.role==='sample'?'ARTIFICIAL_FIXTURE_'+(r.subsample||'1'):({positive:'CP qualitative',negative:'CN negative',blank:'NTC blank',quantitative:'CPQ quantitative'})[r.role]||r.sample,target:r.assay,CpRaw:Number.isFinite(r.cq)?String(r.cq):'',well:String.fromCharCode(65+Math.floor(i/12))+String(i%12+1).padStart(2,'0'),pos:i,row:Math.floor(i/12),col:i%12,analysis:'fixture-method',analysisUid:'fixture',role:r.role==='calibrator'?'Standard':'Unknown',instrRole:r.role==='calibrator'?'Standard':'Unknown',CalcConc:99999999,StandardConc:99999999,call:'ARTIFICIAL_FIXTURE',IsIncluded:'1'}));
  const result=await p.evaluate(({profile,raw,evidence,context})=>{
   SOP=sopNormalise(profile);SOP_CACHE=null;SAMPLE_SELECTION.pending=false;SAMPLE_SELECTION.excluded.clear();
   const run={file:'ARTIFICIAL_MARA_FIXTURE.ixo',name:'ARTIFICIAL_MARA_FIXTURE',wells:raw,tmWells:[],meta:{sourceSHA256:'a'.repeat(64),InstrumentName:'FIXTURE'},rows:8,cols:12,plate:{},allCurves:{},integrity:{ok:true}};RUNS=[run];
   const e=maraEvidence(run);e.context=context;raw.forEach((w,i)=>e.reactions[maraWellID(w,i)]={curve:evidence[i].curve,copies:evidence[i].copies??'',level:evidence[i].level||'',pair:evidence[i].pair||''});
   const before=JSON.stringify(raw),calculation=sopEvaluateRun(run,0).methodCalculation;
   const result={checks:calculation.checks.filter(c=>!c.pass),decisions:calculation.decisions.map(d=>({outcome:d.outcome,code:d.code})),sourceUnchanged:before===JSON.stringify(raw)};
   RUNS=[];SOP_CACHE=null;return result;
  },{profile:f.p,raw,evidence:f.records,context:f.context});
  assert.deepEqual(result.checks,[],entry.key);assert(result.sourceUnchanged);assert.equal(result.decisions[0].outcome,'Positive',entry.key);
  measured.push({key:entry.key,hash:entry.hash,decisions:result.decisions});
 }
 if(process.env.MISSY_RECORD_MARA_ORACLE==='1')fs.writeFileSync(oraclePath,JSON.stringify({scope:'32 shipped profiles; production sopHash plus positive mathematical run outcomes; recorded after explicit Positive and source-immutability assertions. Not laboratory validation.',profiles:measured},null,2)+'\n');
 assert.deepEqual(measured,JSON.parse(fs.readFileSync(oraclePath,'utf8')).profiles,'Shipped profile hashes/outcomes differ from pinned oracle');
 await p.evaluate(()=>{RUNS=[];SOP_CACHE=null;document.documentElement.classList.remove('missy-starting');document.getElementById('missy-startup')?.remove();document.getElementById('missy-setup')?.remove();document.getElementById('missy-learning')?.close?.();});
 for(const lang of ['en','zh']){
  await p.evaluate(lang=>setLanguage(lang),lang);await p.evaluate(()=>showTab('sop'));
  for(const x of library){await p.locator('#sop-preset').selectOption(x.key);await p.locator('#sop-apply-preset').click();assert.equal(await p.evaluate(()=>sopHash()),x.hash);assert(await p.locator('#sop-editor').count()||await p.locator('.sop-sec').count());}
  for(const width of [390,850,1920]){await p.setViewportSize({width,height:1080});await p.screenshot({path:'tests/MARA_definitions_'+lang+'_'+width+'.png'});assert(await p.locator('main').evaluate(e=>e.getBoundingClientRect().right<=innerWidth));}
 }
 const save=p.waitForEvent('download');await p.locator('#sop-save').click();const single=await save;assert(single.suggestedFilename().includes('screening'));await single.saveAs('tmp/MARA_single_profile.json');
 await p.locator('#sop-file').setInputFiles('tmp/MARA_single_profile.json');await p.waitForFunction(()=>document.getElementById('sop-msg').textContent.length>0);assert.equal(await p.evaluate(()=>sopHash()),library.at(-1).hash);
 const zip=p.waitForEvent('download');await p.locator('#mara-download-profiles').click();await(await zip).saveAs('tmp/MARA1012_review_profiles.zip');
 assert.equal(await p.evaluate(()=>RUNS.length),0);assert.deepEqual(errors,[]);console.log('PASS document/schema/32 hashes; standard-code SOP names; per-event constants and references; 25 rapid assay entries; bilingual menus/3 widths; JSON save/import; ZIP export; 32 pinned hashes and synthetic run outcomes; raw fixture records unchanged; zero native experiment files');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
