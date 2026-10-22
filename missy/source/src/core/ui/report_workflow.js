/* Explicit report coverage and reversible graph previews. No global replacements. */
Object.assign(ZH_TERMS,{
 'Runs for standard figures':'标准图的运行范围',
 'All loaded runs - separate figures per run':'所有已加载运行 - 每个运行分别绘图',
 'Choose All loaded runs to repeat selected standard figures for every compatible run. Acquisition comparisons keep their labelled source groups. Tables cover all loaded data. Only available items are shown.':'选择所有已加载运行，为每个兼容运行分别生成所选标准图。采集比较图保留标注的来源分组。表格涵盖所有已加载数据，仅显示可用项目。',
 'Select all available':'选择所有可用项目','Clear selection':'清除选择',
 'No report items are available for this selection. Choose another run or load decoded data.':'当前选择没有可用报告项目。请选择其他运行或加载可解码的数据。',
 'All loaded source files and checksums':'所有已加载源文件及校验和'
});
let REPORT_PREVIEW_RETURN=null;
const REPORT_GRAPH_AVAILABILITY=new WeakMap();
function reportGraphRunIndexes(g){return g.scope==='run'&&SEL_STATE.figureScope==='all'?RUNS.map((_,i)=>i):[selRunIndex()];}
function reportGraphFigure(g,ri){const f=g.render(selGraphContext(g,ri));return {svg:f.svg,rows:f.rows||[]};}
function reportGraphAvailable(g,ri){
 const run=RUNS[ri];if(!run||run.pcrdLocked||typeof g.render!=='function')return false;
 if(g.scope==='run'&&(run.rawOnly||run.zpcr||run.pcrd))return false;
 let cache=REPORT_GRAPH_AVAILABILITY.get(run);if(!cache){cache=new WeakMap();REPORT_GRAPH_AVAILABILITY.set(run,cache);}
 const key=[APP_STATE.generation,RUNS.length,SAMPLE_SELECTION.revision,sopHash(),JSON.stringify(SEL_STATE.options['img:'+g.id]||{}),ZPCR_ENDPOINT_N].join('|'),old=cache.get(g);
 if(old?.key===key)return old.available;
 let available=false;try{const f=reportGraphFigure(g,ri);available=Array.isArray(f.rows)&&f.rows.length>0;}catch(e){/* Unavailable evidence is hidden; decoder/renderer errors still surface in their own views. */}
 cache.set(g,{key,available});return available;
}
function reportItemVisible(item){
 if(!item||!item.ready())return false;
 if(item.reportGraph){if(!RUNS.some(r=>!r.rawOnly&&!r.pcrdLocked))return false;const run=RUNS[selRunIndex()];if(SEL_STATE.figureScope!=='all'&&(run?.rawOnly||run?.pcrdLocked))return false;return true;}
 if(item.kind==='data'){try{return item.rows().length>0;}catch(e){return false;}}
 if(item.reportAcquisition&&!item.reportPanel.series.some(s=>s.points.some(p=>Number.isFinite(p[1]))))return false;
 if(item.independentGroup){const g=item.independentGroup,metric=item.pcrdMetric.includes('Tm')?'Tm':'Cq';const valid=item.independentComparison?piComparisons().some(r=>r._group===g&&r.metric===metric&&Number.isFinite(r.delta)):g.records.some(r=>Number.isFinite(metric==='Tm'?r.tm.value:r.cq.value));if(!valid)return false;}
 if(SEL_STATE.figureScope!=='all'&&item.kind==='image'){
  const run=RUNS[selRunIndex()];
  if(item.reportAcquisition)return item.reportAcquisition.runs.includes(run)&&item.reportPanel.series.some(s=>s.points.some(p=>Number.isFinite(p[1])));
  if(item.cfxRun)return item.cfxRun===run;
  if(item.independentGroup)return item.independentGroup.run===run&&item.independentGroup.records.some(r=>Number.isFinite(item.pcrdMetric.includes('Tm')?r.tm.value:r.cq.value));
  if(item.id.startsWith('img:pcrd_'))return !!run?.pcrd&&String(item.note).includes(run.file);
 }
 return true;
}
function reportExpandItem(item){
 if(!item.reportGraph||item.reportGraph.scope!=='run')return [item];
 const g=item.reportGraph;
 return reportGraphRunIndexes(g).filter(ri=>reportGraphAvailable(g,ri)).map(ri=>({
  ...item,id:item.id+'@run:'+ri,title:item.title+' | '+RUNS[ri].file,
  note:(item.note||'')+(g.id==='plate'?'\nDecoded plate layout: '+RUNS[ri].rows*RUNS[ri].cols+' wells; '+RUNS[ri].rows+' rows x '+RUNS[ri].cols+' columns.':'')+'\nSource: '+RUNS[ri].file+'\nSource SHA-256: '+(RUNS[ri].meta.sourceSHA256||'Not recorded'),
  figure:()=>reportGraphFigure(g,ri)
 }));
}
function reportRememberPreview(){
 if(REPORT_PREVIEW_RETURN||(!AST.open&&!CMD.open))return;
 const mode=AST.open?'assisted':'command';
 REPORT_PREVIEW_RETURN={mode,focus:document.activeElement,scroll:[...document.querySelectorAll(mode==='assisted'?'#ast-list,#ast-form':'#cmd-out,#cmd-script,#cmd-script-wrap')].map(el=>({el,top:el.scrollTop,left:el.scrollLeft}))};
}
function reportRestorePreview(){
 const state=REPORT_PREVIEW_RETURN;if(!state)return;REPORT_PREVIEW_RETURN=null;
 if(state.mode==='assisted'){AST.open=true;document.getElementById('astm').classList.add('on');}
 else{CMD.open=true;document.getElementById('cmdm').classList.add('on');}
 const restore=()=>{for(const x of state.scroll){x.el.scrollTop=x.top;x.el.scrollLeft=x.left;}if(state.focus?.isConnected)state.focus.focus({preventScroll:true});};restore();requestAnimationFrame(restore);
}
MISSY_HOOKS.use('mgClose','report/restore-preview',200,next=>function(...args){const out=next(...args);reportRestorePreview();return out;});
MISSY_HOOKS.use('mgCommand','report/preview-exit',200,next=>function(text,...args){
 const command=String(text||'').trim().toLowerCase();
 if(REPORT_PREVIEW_RETURN&&/^(chart close|exit)$/.test(command)){mgClose();return true;}
 if(/^open page |^(load|sop|results|review|panel)$/.test(command))REPORT_PREVIEW_RETURN=null;
 return next(text,...args);
});
MISSY_HOOKS.use('astRender','report/coverage-controls',200,next=>function(){
 next();const select=astEl('ast-run'),label=select.closest('label');label.firstChild.textContent=ui('Runs for standard figures');
 let help=document.getElementById('ast-coverage-help');if(!help){help=document.createElement('p');help.id='ast-coverage-help';label.after(help);}
 help.textContent=ui('Choose All loaded runs to repeat selected standard figures for every compatible run. Acquisition comparisons keep their labelled source groups. Tables cover all loaded data. Only available items are shown.');
 let tools=document.getElementById('ast-available-tools');if(!tools){tools=document.createElement('div');tools.id='ast-available-tools';const all=document.createElement('button'),none=document.createElement('button');all.type=none.type='button';all.textContent=ui('Select all available');none.textContent=ui('Clear selection');all.onclick=()=>{for(const x of selCatalogue().filter(reportItemVisible))SEL_STATE.ids.add(x.id);astRender();};none.onclick=()=>{SEL_STATE.ids.clear();astRender();};tools.append(all,none);astEl('ast-list').prepend(tools);}
 const manifestInput=astEl('ast-list').querySelector('input[data-id="data:source_manifest"]');if(manifestInput){const required=selSelected().some(item=>item.id!=='data:source_manifest');manifestInput.checked=required||SEL_STATE.ids.has('data:source_manifest');manifestInput.disabled=required;manifestInput.closest('label').title='Included automatically with selected report material to retain full source identities.';}
 const empty=astEl('ast-list').querySelector('.ast-empty');empty?.remove();if(!astEl('ast-list').querySelector('.ast-group')){const p=document.createElement('p');p.className='ast-empty';p.textContent=ui('No report items are available for this selection. Choose another run or load decoded data.');astEl('ast-list').append(p);}
 const endpoint=document.getElementById('assisted-endpoint');if(endpoint)endpoint.hidden=!RUNS.some(r=>r.zpcr||r.pcrd||r.cfxRDML);
});
MISSY_HOOKS.use('selDataItems','report/full-source-manifest',200,next=>function(){return next().concat({
 id:'data:source_manifest',kind:'data',group:'Source provenance',title:'All loaded source files and checksums',
 note:'Full source inventory for every loaded format.\n'+RUNS.map(r=>'File: '+r.file+'\nSHA-256: '+(r.meta.sourceSHA256||'Not recorded')).join('\n'),
 ready:()=>RUNS.length>0,rows:()=>RUNS.map(r=>({filename:r.file,sha256:r.meta.sourceSHA256||'',bytes:r.meta.sourceBytes??'',format:r.reader?.id||''})),file:'source_manifest.csv',text(){return csvOf(this.rows());}
});});
MISSY_HOOKS.use('selSelected','report/retain-source-manifest',200,next=>function(){const chosen=next();if(chosen.length&&!chosen.some(x=>x.id==='data:source_manifest'))chosen.push(selItem('data:source_manifest'));return chosen;});
const reportWorkflowStyle=document.createElement('style');reportWorkflowStyle.textContent=`
#ast-coverage-help{font-size:12px;line-height:1.5;color:#526580;margin:-3px 0 14px}
#ast-list .ast-item>button{grid-column:2/-1;justify-self:start;width:auto;min-width:110px;white-space:nowrap;border:1px solid #cbd5e1;border-radius:6px;padding:6px 12px;background:#eef2f7;color:#102f4d;font:inherit;font-size:13px;cursor:pointer;margin-top:6px}
#ast-available-tools{display:flex;gap:8px;margin-bottom:16px}#ast-available-tools button{border:1px solid #cbd5e1;border-radius:6px;padding:7px 12px;background:#eef2f7;color:#102f4d;font:inherit;font-size:13px;cursor:pointer}
`;document.head.append(reportWorkflowStyle);
reportWorkflowStyle.textContent+='#assisted-endpoint[hidden]{display:none!important}';

/* Keep long identifiers inside the existing Assisted cards. */
reportWorkflowStyle.textContent+=`#ast-list .ast-item{grid-template-columns:22px minmax(0,1fr);grid-template-rows:min-content min-content min-content;align-content:start;min-width:0}#ast-list .ast-item>span{min-width:0;max-width:100%;overflow-wrap:anywhere;white-space:normal}`;
