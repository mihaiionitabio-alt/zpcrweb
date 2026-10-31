()=>{
 const points=new Map(),ids=new Set();let sealed=false;
 function define(name){if(!points.has(name)){if(sealed)throw Error('Hooks are sealed');points.set(name,[]);}}
 function use(name,id,order,factory){
  if(sealed)throw Error('Hooks are sealed');
  if(!points.has(name))throw Error('Unknown hook: '+name);
  if(typeof id!=='string'||!id||ids.has(id)||!Number.isInteger(order)||typeof factory!=='function')throw Error('Invalid/duplicate hook: '+id);
  ids.add(id);points.get(name).push(Object.freeze({id,order,factory}));points.get(name).sort((a,b)=>a.order-b.order);
 }
 function invoke(name,context,args,base){
  const entries=points.get(name);if(!entries)throw Error('Unknown hook: '+name);
  let call=base;for(const entry of entries){const next=call;let called=false;call=entry.factory(function(...a){if(called)throw Error('Hook called next twice: '+entry.id);called=true;return next.apply(context,a);});if(typeof call!=='function')throw Error('Hook must return a function: '+entry.id);}
  return call.apply(context,args);
 }
 function slot(name,base){define(name);return function(...args){return invoke(name,this,args,base);};}
 function inspect(){return [...points].map(([name,entries])=>({name,extensions:entries.map(({id,order})=>({id,order}))}));}
 return Object.freeze({define,use,invoke,slot,inspect,seal(){sealed=true;}});
}