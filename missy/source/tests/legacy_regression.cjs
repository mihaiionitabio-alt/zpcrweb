/* Local fixture runner; set MISSY_PLAYWRIGHT_MODULE / MISSY_CHROME to override. */
const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.MISSY_PLAYWRIGHT_MODULE||'D:/IXO/release_unified_2026-09-21_r2/documentation/documentation_sources/generator/node_modules/playwright');
const root=path.resolve(__dirname,'..'),fixtures=[
 ['IXO','D:/IXO/phy/ef/QC.03-Mar-2026.28284.ixo'],
 ['EDS','D:/IXO/export/1/4Plex_Multiplex_MMx_10uL.eds'],
 ['EDS2','D:/IXO/export/2/9_log_Fast_Adv_MMx_20uL.eds'],
 ['EDT','D:/IXO/templates/96 Well/Quantification/QS5_PowerUP_SYBR_96-Well-0-2ml_StandardMode.edt'],
 ['RDML','D:/IXO/export/1/4Plex_Multiplex_MMx_10uL.rdml'],
 ['RDML raw','D:/IXO/lc480-ixo-qc-exportv2/extras/rdml_2026-09-24/validation_20260924/rdml/example_1_raw.rdml'],
 ['RDML reanalysis','D:/IXO/lc480-ixo-qc-exportv2/extras/rdml_2026-09-24/validation_20260924/rdml/example_3_linregpcr.rdml']
];
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.MISSY_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[];try{
for(const [label,file]of fixtures){let reference;for(const variant of ['Missy-all','Missy-public']){const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file:///'+root.replaceAll('\\','/')+'/dist/'+variant+'.html');await p.locator('#file').setInputFiles(file);await p.waitForFunction(()=>STAGED.length===1);await p.locator('#read').click();await p.waitForFunction(()=>APP_STATE.phase==='ready'||(APP_STATE.phase==='idle'&&document.getElementById('readmsg').textContent.includes('Nothing could')));const data=await p.evaluate(()=>{
 const q=window.__qc,stable=o=>JSON.parse(JSON.stringify(o));
 const out={runs:RUNS.length,wells:q.allWellRows(),tm:q.tmRows(),sop:q.sopInterpretationRows(),sopRuns:q.sopRunRows(),plate:q.plateMapRows(),replicate:q.replicateReviewRows(),orphans:q.reviewOrphanWells(),cc:q.ccRowsFromRuns(q.runs),records:q.runs.map(r=>q.instrumentRecordTables(r)),rdml:q.runs.map(r=>q.makeRDMLXML(r).replace(/<dateMade>[^<]*<\/dateMade>/g,'<dateMade/>').replace(/2026\.10\.21\.modular1|2026\.09\.23\.hardening2/g,'BUILD_VERSION'))};return stable(out);
});assert(data.runs>0,label+' silently failed');for(const tab of ['load','sop','results','panel','graphs','review','export','integrity']){await p.locator('nav button[data-tab='+tab+']').first().click();assert(await p.locator('#tab-'+tab).isVisible(),label+' '+tab+' invisible');}assert.deepStrictEqual(errors,[],label+' page errors');if(reference)assert.deepStrictEqual(data,reference,label+' legacy values/export changed');else reference=data;await p.close();}results.push({format:label,runs:reference.runs,resultRows:reference.wells.length,equalStoredAndDerivedTables:true,equalRDMLExceptBuildAndExportTime:true,visibleTabs:8});console.log('PASS baseline equality '+label);}
fs.writeFileSync(path.join(__dirname,'LEGACY_REGRESSION_RESULTS.json'),JSON.stringify({baseline:'Zenodo 23437639; MD5 3bf60501a9eeb08166df9bb024fd8495',results},null,2));}finally{await b.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
