function use(name,id,order,factory){
  if(sealed)throw Error('Hooks are sealed');
  if(!points.has(name))throw Error('Unknown hook: '+name);
  if(typeof id!=='string'||!id||ids.has(id)||!Number.isInteger(order)||typeof factory!=='function')throw Error('Invalid/duplicate hook: '+id);
  ids.add(id);points.get(name).push(Object.freeze({id,order,factory}));points.get(name).sort((a,b)=>a.order-b.order);
 }