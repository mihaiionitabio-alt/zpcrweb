function reportGraphAvailable(g,ri){
 const run=RUNS[ri];if(!run||run.pcrdLocked||typeof g.render!=='function')return false;
 if(g.scope==='run'&&(run.rawOnly||run.zpcr||run.pcrd))return false;
 let cache=REPORT_GRAPH_AVAILABILITY.get(run);if(!cache){cache=new WeakMap();REPORT_GRAPH_AVAILABILITY.set(run,cache);}
 const key=[APP_STATE.generation,RUNS.length,SAMPLE_SELECTION.revision,sopHash(),JSON.stringify(SEL_STATE.options['img:'+g.id]||{}),ZPCR_ENDPOINT_N].join('|'),old=cache.get(g);
 if(old?.key===key)return old.available;
 let available=false;try{const f=reportGraphFigure(g,ri);available=Array.isArray(f.rows)&&f.rows.length>0;}catch(e){/* Unavailable evidence is hidden; decoder/renderer errors still surface in their own views. */}
 cache.set(g,{key,available});return available;
}