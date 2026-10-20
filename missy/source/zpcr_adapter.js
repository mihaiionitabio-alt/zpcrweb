
/* Raw ZPCR adapter: no dye unmixing, Cq, Tm or analytical calls. */
async function decodeZpcr(source){
 const bytes=source.bytes,ab=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),z=await ZPCR.parseZpcr(ab);
 if(!z.reads.length)throw Error('REVIEW: no plate reads in this ZPCR');
 if(z.archive.names.filter(n=>/\.plateread$/i.test(n)).length!==z.reads.length)throw Error('REVIEW: one or more plate reads could not be decoded: '+z.issues.join('; '));
 if(z.grid.referenceRows===null)throw Error('REVIEW: sample/reference boundary is not established');
 if(z.grid.sampleRows!==8||z.grid.cols!==12)throw Error('REVIEW: this importer currently supports 96-well CFX geometry only');
 const first=z.reads[0];if(z.reads.some(r=>r.rows!==first.rows||r.cols!==first.cols||r.channels!==first.channels))throw Error('REVIEW: conflicting acquisition geometries');
 const meta={ZPCRProtocolSHA256:await sourceSha256(new TextEncoder().encode(z.protocolText||'')),name:source.name,InstrumentName:'Bio-Rad CFX '+(z.instrument.block||''),InstrumentID:z.instrument.base||'',SerialNumber:z.instrument.base||'',StartTime:z.runInfo.RunStartTime||'',SWVersion:'',InstrumentVersion:z.instrument.firmware||'',MacroName:'',Notes:'Raw acquisition only; no Cq, Tm, dye unmixing or sample calls. REVIEW.',Platform:'Bio-Rad ZPCR',sourceSHA256:await sourceSha256(bytes),sourceBytes:bytes.length};
 const allCurves={},plate={}; // Raw multi-step curves live in the isolated ZPCR view, never synthetic results.
 for(let pos=0;pos<96;pos++)plate[pos]={name:'',sampleId:'',notes:'Sample identity not decoded',channels:{},subsets:[]};
 const steps=[...new Set(z.reads.map(r=>r.step))];
 return {file:source.name,sourcePath:source.path||source.name,sourceArchive:source.archive||null,zip:source.zip||null,meta,platform:'Bio-Rad ZPCR',zpcr:z,rawOnly:true,wells:[],tmWells:[],genoResults:[],rqResults:[],otherResults:[],allCurves,plate,subsets:[],analyses:[],nCycles:0,acqStats:[],acqError:null,acqMelt:null,acqSegments:[],acqAcquisitions:z.reads.length,acqScalingFactors:[],identities:{},duplicates:0,namedPositions:0,maxPos:96,cols:12,rows:8,blockId:z.instrument.block||'',kinds:[],format:{signature:'ZPCR / ICFF',version:String(first.version.plateread)},integrity:{kind:'zpcr',entries:z.archive.entries,crcVerified:!z.archive.encrypted.length,verifiedScope:'Decoded unencrypted members only',encrypted:z.archive.encrypted},protocol:{programs:steps.map(step=>({name:'Read step '+step,cycles:z.reads.filter(r=>r.step===step).length,mode:'Raw acquisition',segments:[]})),channels:Array.from({length:first.channels},(_,i)=>({name:'Raw channel '+(i+1),active:true,ex:'',em:'',filterSet:'',activityBasis:'Stored channel; mask uninterpreted'})),block:{rowCount:8,colCount:12},setup:{maxPositions:96},analysisModes:[],detectionFormatName:'Uncalibrated optical channels'}};
}
function zpcrRows(run,kind){
 const z=run.zpcr,out=[];
 if(kind==='raw'){
  out.push(['source_sha256','file','member','scan_index','step','cycle','channel_1based','position_type','row_1based','column_1based','mean','sd','min','max']);
  for(const r of z.reads)for(let c=0;c<r.channels;c++)for(let row=0;row<r.rows;row++)for(let col=0;col<r.cols;col++){const w=ZPCR.zpcrWellStats(r,c,row,col);out.push([run.meta.sourceSHA256,run.file,r.name,r.scanIndex,r.step,r.cycle,c+1,row<z.grid.sampleRows?'sample':'reference',row+1,col+1,w.mean,w.sd,w.min,w.max]);}
 }else{
  out.push(['source_sha256','member','scan_index','step','cycle','timestamp','field','value','interpretation']);
  for(const r of z.reads){const add=(k,v,t)=>out.push([run.meta.sourceSHA256,r.name,r.scanIndex,r.step,r.cycle,r.dateText,k,v,t]);for(const [k,v]of Object.entries(r.temps))add(k,v.c,(v.kind==='setpoint'?'integer encoded; physical interpretation unresolved':v.kind+' interpretation')+'; degC');r.leds.forEach((v,c)=>add('LEDCURRENT'+(c+1),v,'DAC setting; not calibrated mA'));add('CHANNELMASK',r.channelMaskRaw,'verbatim; uninterpreted');add('ERRORNUMBER',r.errorNumber,'instrument code');for(let c=0;c<r.channels;c++){for(let k=0;k<4;k++)add('DARK.ch'+(c+1)+'.'+['mean','sd','min','max'][k],r.darkData?.[c*4+k]??'','raw detector counts');}}
 }
 return out;
}
function zpcrRawCSV(run,kind){return zpcrRows(run,kind).map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');}
const zpcrPanel=document.querySelector('#tab-zpcr')||document.createElement('section');zpcrPanel.id='tab-zpcr';zpcrPanel.className='card';zpcrPanel.hidden=true;
document.querySelector('main').append(zpcrPanel);
const zpcrNav=document.querySelector('nav button[data-tab=zpcr]')||document.createElement('button');zpcrNav.dataset.tab='zpcr';zpcrNav.textContent='9 · ZPCR raw / hardware';zpcrNav.hidden=true;zpcrNav.onclick=()=>showTab('zpcr');document.querySelector('nav').append(zpcrNav);
function zpcrPaint(){
 const runs=RUNS.filter(r=>r.zpcr);zpcrPanel.hidden=!runs.length;zpcrNav.hidden=!runs.length;if(!runs.length){zpcrPanel.replaceChildren();return;}
 zpcrPanel.innerHTML='<h2>Bio-Rad ZPCR · raw acquisitions and hardware diagnostics</h2><p class="notice warn">REVIEW — raw import only. No stored Cq/Tm or sample calls are established. Optical channels are not dye identities. Sample names and roles are not decoded. Reference positions are separate from the 96 physical wells. Diagnostics have no acceptance limits.</p>';
 const pick=document.createElement('select');pick.id='zpcr-run';pick.setAttribute('aria-label','ZPCR run');runs.forEach((r,i)=>pick.add(new Option(r.file,String(i))));zpcrPanel.append(pick);
 const body=document.createElement('div');zpcrPanel.append(body);
 function fill(){const run=runs[+pick.value],z=run.zpcr;body.replaceChildren();
 const text=(tag,t)=>{const e=document.createElement(tag);e.textContent=t;body.append(e);return e;};
 text('p',`${run.meta.InstrumentID} · ${z.reads.length} reads · ${z.archive.entries} archive members · source SHA-256 ${run.meta.sourceSHA256}`).style.overflowWrap='anywhere';
 text('p','Run time as stored: '+(run.meta.StartTime||'Unknown')+' · RunInfo.xml. Completion is not certified from archive markers or the absence of an error code.');
 if(z.issues.length)text('p',z.issues.join(' · '));
 text('p','Channels with nonzero stored data (not proof of acquisition status): '+z.scannedChannels.map(c=>c+1).join(', '));
 const controls=text('div','');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:12px 0';
 const select=(id,label,items)=>{const l=document.createElement('label');l.textContent=label+' ';const el=document.createElement('select');el.id=id;el.setAttribute('aria-label',label);items.forEach(([v,t])=>el.add(new Option(t,String(v))));l.append(el);controls.append(l);return el;};
 const step=select('zpcr-step','Acquisition step',[...new Set(z.reads.map(r=>r.step))].map(s=>[s,'Step '+s+' · '+z.reads.filter(r=>r.step===s).length+' reads']));
 const channel=select('zpcr-channel','Raw channel',Array.from({length:z.reads[0].channels},(_,c)=>[c,'Channel '+(c+1)]));
 const well=select('zpcr-well','Physical well',Array.from({length:96},(_,p)=>[p,String.fromCharCode(65+Math.floor(p/12))+(p%12+1)]));
 const telemetry=select('zpcr-telemetry','Hardware series',[...Object.keys(z.reads[0].temps).map(k=>['temp:'+k,k+' (stored type inferred)']),['dark','Detector dark mean'],['reference','Reference-row mean'],['led','LED DAC setting']]);
 const plot=document.createElement('div'),diag=document.createElement('div');body.append(plot,diag);
 function draw(){const reads=z.reads.filter(r=>r.step===+step.value),c=+channel.value,pos=+well.value;plot.replaceChildren();
 const drawSeries=(title,vals,unit)=>{const h=document.createElement('h3');h.textContent=title;plot.append(h);const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 900 260');svg.style.cssText='width:100%;max-height:320px;background:#fff;color:#172d47';svg.setAttribute('aria-label',title);const good=vals.filter(Number.isFinite);if(!good.length)return;let lo=Math.min(...good),hi=Math.max(...good);if(hi===lo){lo-=1;hi+=1;}const pts=vals.map((v,i)=>[65+800*i/Math.max(1,vals.length-1),215-180*(v-lo)/(hi-lo)]);svg.innerHTML='<path d="M65 25V215H865" fill="none" stroke="#60748a"/>'+pts.map(([x,y],i)=>Number.isFinite(vals[i])?`<circle cx="${x}" cy="${y}" r="2" fill="#2166cc"><title>${esc(reads[i].name)} · step ${reads[i].step} · cycle ${reads[i].cycle} · ${vals[i]} ${unit}</title></circle>`:'').join('')+`<text x="5" y="35" font-size="12">${hi.toFixed(3)}</text><text x="5" y="215" font-size="12">${lo.toFixed(3)}</text><text x="65" y="247" font-size="13">Read order within step · ${esc(unit)} · ${vals.length} reads</text>`;plot.append(svg);};
 drawSeries('Raw fluorescence · '+well.selectedOptions[0].text+' · channel '+(c+1),reads.map(r=>ZPCR.zpcrWellMean(r,c,Math.floor(pos/12),pos%12)),'raw instrument units');
 const t=telemetry.value;const vals=reads.map(r=>t.startsWith('temp:')?(r.temps[t.slice(5)]?.c??NaN):t==='dark'?(r.darkData?.[c*4]??NaN):t==='led'?(r.leds[c]??NaN):ZPCR.zpcrStats(Array.from({length:z.grid.referenceRows*r.cols},(_,i)=>ZPCR.zpcrWellMean(r,c,z.grid.sampleRows+Math.floor(i/r.cols),i%r.cols)))?.mean??NaN);
 drawSeries(telemetry.selectedOptions[0].text+' · channel '+(c+1),vals,t.startsWith('temp:')?'°C; plate-read samples':t==='led'?'DAC setting':'raw instrument units');
 const metrics=ZPCR.zpcrQcMetrics(z,+step.value);diag.innerHTML='<h3>Hardware summaries · selected step</h3><p>Descriptive values only. Temperature type is inferred from stored scalar encoding; integer ambient readings may be quantised measurements rather than commanded setpoints. Timing has one-second timestamp resolution. Reference deviations do not identify their cause.</p>';
 const table=document.createElement('table');table.style.cssText='width:100%;table-layout:fixed';table.innerHTML='<thead><tr>'+['Metric','Type / units','n','Mean','SD','Range','Drift %'].map(t=>'<th>'+esc(t)+'</th>').join('')+'</tr></thead>';const tb=document.createElement('tbody');for(const [key,v]of Object.entries(metrics.metrics)){if(key==='config'||key==='referenceVsFactory')continue;const tr=document.createElement('tr');for(const val of [key,[v.kind==='setpoint'?'Integer encoded; unresolved':v.kind,v.unit].filter(Boolean).join(' / '),v.n,v.mean??v.seconds,v.sd,v.range,v.driftPct??v.withinRunDriftPct]){const td=document.createElement('td');td.textContent=typeof val==='number'?Number(val.toPrecision(7)):val??'—';td.style.overflowWrap='anywhere';tr.append(td);}tb.append(tr);}table.append(tb);const wrap=document.createElement('div');wrap.style.overflowX='auto';table.style.minWidth='650px';wrap.append(table);diag.append(wrap);
 const more=document.createElement('details'),sm=document.createElement('summary');sm.textContent='Reference-versus-factory values, configuration and detailed summaries';more.append(sm);diag.append(more);
 const pre=document.createElement('pre');pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;max-height:380px;overflow:auto';pre.textContent=JSON.stringify(metrics,null,2).replace(/scannedChannels/g,'channelsWithNonzeroData').replace(/setpoint/g,'integer encoded; interpretation unresolved');more.append(pre);
 const plate=document.createElement('div');plate.style.cssText='display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px;margin:10px 0';const last=reads.at(-1);for(let p=0;p<96;p++){const b=document.createElement('button'),v=ZPCR.zpcrWellMean(last,c,Math.floor(p/12),p%12);b.textContent=String.fromCharCode(65+Math.floor(p/12))+(p%12+1);b.title='Last read raw mean: '+v;b.style.cssText='min-width:0;padding:7px 1px;font-size:11px';b.onclick=()=>{well.value=String(p);draw();};plate.append(b);}plot.prepend(plate);
 }
 [step,channel,well,telemetry].forEach(e=>e.onchange=draw);draw();
 for(const [label,kind]of [['Download raw sample and reference readings CSV','raw'],['Download per-read hardware CSV','hardware']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>download(run.file+'.'+kind+'.csv',zpcrRawCSV(run,kind),'text/csv');body.append(b);}
 const button=document.createElement('button');button.textContent='Download source inventory and metadata JSON';button.onclick=()=>download(run.file+'.inventory.json',JSON.stringify({sourceSHA256:run.meta.sourceSHA256,meta:run.meta,eligibility:z.evidence,contribution:zpcrContributions().get(run),archive:z.archive,runInfo:z.runInfo,protocol:z.protocolText,issues:z.issues,status:'REVIEW; raw import only'},null,2),'application/json');body.append(button);
 const detail=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');summary.textContent='Stored protocol and archive member inventory';pre.textContent=(z.protocolText||'No protocol text')+'\n\n'+z.archive.names.join('\n');pre.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';detail.append(summary,pre);body.append(detail);
 }
 pick.onchange=fill;fill();if(RUNS.every(r=>r.zpcr))showTab("zpcr");
}

const zpcrMetaRows=metaRows;metaRows=function(){const rows=zpcrMetaRows();rows.forEach((row,i)=>{const r=RUNS[i];if(r?.zpcr){row.curves_decoded=[...new Set(r.zpcr.reads.map(a=>a.step))].length*96*r.zpcr.reads[0].channels;row.quantification_results='Not computed (raw only)';row.cycles=r.zpcr.reads.length;}});return rows;};

const zpcrStyle=document.createElement('style');zpcrStyle.textContent='#tab-zpcr button{border:1px solid #bdcce0;border-radius:5px;background:#eef3fa;color:#16314c;padding:8px 12px;margin:4px;cursor:pointer}#tab-zpcr select{max-width:100%;padding:7px;border:1px solid #bdcce0;border-radius:5px}#tab-zpcr svg{display:block}#tab-zpcr[hidden]{display:none!important}';document.head.append(zpcrStyle);
