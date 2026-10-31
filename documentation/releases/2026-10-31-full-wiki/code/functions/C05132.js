function invoke(name,context,args,base){
  const entries=points.get(name);if(!entries)throw Error('Unknown hook: '+name);
  let call=base;for(const entry of entries){const next=call;let called=false;call=entry.factory(function(...a){if(called)throw Error('Hook called next twice: '+entry.id);called=true;return next.apply(context,a);});if(typeof call!=='function')throw Error('Hook must return a function: '+entry.id);}
  return call.apply(context,args);
 }