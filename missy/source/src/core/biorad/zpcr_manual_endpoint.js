/* Manual explanations and raw endpoint summaries; isolated to ZPCR. */

let ZPCR_ENDPOINT_N=7;

const ZPCR_MANUAL_NOTES=[

 'Raw acquisition data; no vendor Cq/Tm calls.',

 'Plate names, roles and targets need verified layout provenance.',

 'Maestro applies a matching plate file during ZPCR conversion.',

 'Maestro RDML exports include selected baseline processing.',

 'Read steps stay separate; raw channels are not dye identities.',

 'Cycles 2–6 / 2–10 are descriptive windows, not Maestro baselines.',

 'Endpoint: last N reads in source order; no smoothing or correction.',

 '65,000 RFU is a threshold-setting bound, not detector saturation.',

 'Recovered exports may duplicate an acquisition; copies count once.',

 'Log/calibration interpretation unavailable without verified decoding.',

 'Research Use Only; not validated; does not replace vendor QC.'

];

function zpcrEndpointMetrics(run,n){

 const m={},z=run.zpcr;if(!Number.isInteger(n)||n<1||n>999)throw Error('Endpoint N must be an integer from 1 to 999');

 for(const step of new Set(z.reads.map(r=>r.step))){const all=z.reads.filter(r=>r.step===step);if(all.length<n)continue;const reads=all.slice(-n);

 for(let c=0;c<all[0].channels;c++)for(let p=0;p<96;p++){

 const ys=reads.map(r=>ZPCR.zpcrWellMean(r,c,Math.floor(p/12),p%12));if(!ys.every(Number.isFinite))continue;

 const q=ZPCR.zpcrStats(ys),v='Step '+step+' · Raw channel '+(c+1)+' · '+String.fromCharCode(65+Math.floor(p/12))+(p%12+1)+' · last '+n+' reads';

 (m.z_endpoint_mean||(m.z_endpoint_mean={}))[v]=q.mean;(m.z_endpoint_span||(m.z_endpoint_span={}))[v]=Math.max(...ys)-Math.min(...ys);

 }}return m;

}

MISSY_HOOKS.use("ccStatic","core/biorad/zpcr_manual_endpoint.js:24",24, next => function(run){const m=next(run);if(run.zpcr)Object.assign(m,zpcrEndpointMetrics(run,ZPCR_ENDPOINT_N));return m;});

for(const [id,code,title]of [['z_endpoint_mean','Z-R6','Raw endpoint — last-N-read mean'],['z_endpoint_span','Z-R7','Raw endpoint — last-N-read range']]){

 const d={id,code,title,group:'hardware',inst:['CFX'],type:'i',variants:true,unit:'raw units',better:'target',status:'B',source:'Raw well means; ordered final N reads per step',idea:'• Select N, step, raw channel and physical well.\n• Entire window required; no missing-value substitution.',reading:'• Last N reads within one acquisition step.\n• Range = maximum minus minimum; temporal spread, not replicate SD.\n• Ramp steps may vary legitimately.\n• No Maestro endpoint equivalence or vendor limits.\n• Matching protocol, firmware and N required.'};CC_CHARTS.push(d);CC_BY_ID[id]=d;

}

function zpcrSetEndpointNBase(n){n=Number(n);if(!Number.isInteger(n)||n<1||n>999)throw Error('Endpoint N must be an integer from 1 to 999');ZPCR_ENDPOINT_N=n;for(const r of RUNS.filter(r=>r.zpcr))delete r.ccStatic;for(const id of ['cc:z_endpoint_mean','cc:z_endpoint_span']){const o=SEL_STATE.options[id];if(o?.variant){const v=decodeURIComponent(o.variant).replace(/last \d+ reads$/,'last '+n+' reads');o.variant=encodeURIComponent(v);}}if(['z_endpoint_mean','z_endpoint_span'].includes(CC_STATE.open))CC_STATE.variant=String(CC_STATE.variant||'').replace(/last \d+ reads$/,'last '+n+' reads');document.querySelectorAll('input[aria-label="ZPCR endpoint N"]').forEach(e=>e.value=n);CC_STATE.cache=null;markDirty('panel');if(MG.open){mgRefresh();mgRender();}}

function zpcrSetEndpointN(...args){return MISSY_HOOKS.invoke("zpcrSetEndpointN",this,args,zpcrSetEndpointNBase);}



function zpcrEndpointControls(){const box=document.createElement('div');box.className='notice';const label=document.createElement('label');label.textContent='Raw endpoint · last N reads ';const input=document.createElement('input');input.type='number';input.min='1';input.max='999';input.value=ZPCR_ENDPOINT_N;input.setAttribute('aria-label','ZPCR endpoint N');input.style.width='90px';label.append(input);const b=document.createElement('button');b.textContent='Apply endpoint window';b.onclick=()=>{try{zpcrSetEndpointN(input.value);if(typeof astRender==='function'&&document.getElementById('ast-list')?.offsetParent)astRender();if(typeof mgRefresh==='function')mgRefresh();}catch(e){input.setCustomValidity(e.message);input.reportValidity();}};input.oninput=()=>input.setCustomValidity('');box.append(label,b);return box;}

MISSY_HOOKS.use("zpcrPaint","core/biorad/zpcr_manual_endpoint.js:25",25, next => function(){next();if(!RUNS.some(r=>r.zpcr))return;const notes=document.createElement('details');notes.innerHTML='<summary>Raw data · manual notes</summary><ul>'+ZPCR_MANUAL_NOTES.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';zpcrPanel.prepend(notes,zpcrEndpointControls());});

MISSY_HOOKS.use("astRender","core/biorad/zpcr_manual_endpoint.js:26",26, next => function(){next();if(RUNS.some(r=>r.zpcr))astEl('ast-list').prepend(zpcrEndpointControls());});

MISSY_HOOKS.use("mgOpen","core/biorad/zpcr_manual_endpoint.js:27",27, next => function(){next();const nav=document.getElementById('mg-nav');nav.querySelector('#zpcr-console-endpoint')?.remove();if(RUNS.some(r=>r.zpcr)){const c=zpcrEndpointControls();c.id='zpcr-console-endpoint';nav.append(c);}});

MISSY_HOOKS.use("cmdExec","core/biorad/zpcr_manual_endpoint.js:28",28, next => async function(raw){const match=String(raw).trim().match(/^zpcr endpoint (\d+)$/i);if(match){zpcrSetEndpointN(match[1]);cmdPrint('• Endpoint window: last '+ZPCR_ENDPOINT_N+' reads.','ok');return;}if(/^zpcr notes$/i.test(String(raw).trim())){ZPCR_MANUAL_NOTES.forEach(t=>cmdPrint('• '+t));return;}return next(raw);});

CMD_HELP.push(['zpcr endpoint N','set raw endpoint window: 1–999 reads'],['zpcr notes','show short manual explanations']);

MISSY_HOOKS.use("zpcrReportScript","core/biorad/zpcr_manual_endpoint.js:29",29, next => function(){return '# Raw endpoint window\nzpcr endpoint '+ZPCR_ENDPOINT_N+'\n'+next();});

MISSY_HOOKS.use("selChartItems","core/biorad/zpcr_manual_endpoint.js:30",30, next => function(){return next().map(x=>x.id.startsWith('cc:z_')?{...x,note:'• '+ZPCR_MANUAL_NOTES.slice(0,8).join('\n• ')+'\n• '+CC_BY_ID[x.id.slice(3)].code+' · '+CC_BY_ID[x.id.slice(3)].title+'\n• Matching protocol / firmware / window required.\n• Descriptive values; no vendor acceptance limits.'}:x);});

MISSY_HOOKS.use("selDataItems","core/biorad/zpcr_manual_endpoint.js:31",31, next => function(){return next().map(x=>x.id==='data:zpcr_sources'?{...x,note:'• '+ZPCR_MANUAL_NOTES.join('\n• ')+'\n'+zpcrInventoryRows().map(r=>'• File: '+r.file+'\n• Source SHA-256: '+r.source_sha256+'\n• Acquisition SHA-256: '+r.acquisition_sha256+'\n• '+r.status).join('\n')}:x);});

MISSY_HOOKS.use("MG_VIEWS.zpcrcharts.build","core/biorad/zpcr_manual_endpoint.js:32",32, next => function(){const items=next();return items.map(x=>x.kind==='chart'?{...x,state:'• '+ZPCR_MANUAL_NOTES.slice(0,7).join('\n• ')}:x);});

// Shared writer, ZPCR reports only: MISSY ink/teal, compact branded page header, white paper.

let zpcrReportLogo=null;

MISSY_HOOKS.use("selBuildReport","core/biorad/zpcr_manual_endpoint.js:33",33, next => async function(){zpcrReportLogo=await svgToJpeg(missySvg(true),3);return next();});

MISSY_HOOKS.use('report.style','missy/print-style',20,next=>function(){

 const style=next();

 return {...style,wrapTitle:true,colour:bold=>bold?[.06,.18,.30]:[.15,.19,.24],

 header(d,text){if(zpcrReportLogo){const j=zpcrReportLogo;d.image(j.bytes,120,40,j.w,j.h);}else text('MISSY  |  RUO  |  NOT VALIDATED',10,true,0,[.06,.18,.30]);d.rule();d.gap(5);},

 paragraphLines(s){if(String(s).includes('ZPCR hardware fields are decoded')||String(s).includes('The page recomputes nothing.'))s='• Research Use Only.\n• Not validated for clinical or instrument qualification decisions.\n• Does not replace vendor QC certification or laboratory validation.';return String(s).split('\n').map(line=>line.replace(/^• /,'- '));}};

});

