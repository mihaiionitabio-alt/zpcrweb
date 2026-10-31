function zpcrChartContext(id){
 const def=CC_BY_ID[id.slice(3)],o=SEL_STATE.options[id]||{},decode=v=>{try{return decodeURIComponent(v||'');}catch(e){throw Error('Invalid encoded chart selector');}},insts=ccInstruments().filter(i=>i.platform==='CFX');
 const key=decode(o.instrument)|| (insts.some(i=>i.key===CC_STATE.instrument)?CC_STATE.instrument:insts[0]?.key);
 if(!key||!insts.some(i=>i.key===key))throw Error('Load ZPCR history for the requested instrument');
 const protocol=decode(o.protocol),rows=ccAllRows().filter(r=>r.instrument===key&&(!protocol||r.protocol===protocol)).sort((a,b)=>(a.date||0)-(b.date||0));
 let hours=0;rows.forEach(r=>{r.hours=hours;hours+=(r.m.run_minutes||0)/60;});
 const variants=ccVariants(def,rows),variant=decode(o.variant)||variants[0];if(!variant||!variants.includes(variant))throw Error('No data for this acquisition-step/channel variant');
 return {def,o,key,protocol,rows,variant};
}