/* Explicit, ordered extension points. Core dispatchers keep their identity. */
const MISSY_HOOKS=(()=>{
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
})();

MISSY_HOOKS.define("metaRows");
MISSY_HOOKS.define("ccPlatform");
MISSY_HOOKS.define("ccProtocolKey");
MISSY_HOOKS.define("ccDynamic");
MISSY_HOOKS.define("ccStatic");
MISSY_HOOKS.define("renderPanel");
MISSY_HOOKS.define("zpcrPaint");
MISSY_HOOKS.define("selChartItems");
MISSY_HOOKS.define("selOptionRule");
MISSY_HOOKS.define("selDataItems");
MISSY_HOOKS.define("selSelected");
MISSY_HOOKS.define("mgOpen");
MISSY_HOOKS.define("cmdExec");
MISSY_HOOKS.define("astRender");
MISSY_HOOKS.define("ccRowsFromRuns");
MISSY_HOOKS.define("ccAllRows");
MISSY_HOOKS.define("zpcrInventoryRows");
MISSY_HOOKS.define("zpcrReportScript");
MISSY_HOOKS.define("MG_VIEWS.zpcrcharts.build");
MISSY_HOOKS.define("selBuildReport");
MISSY_HOOKS.define("selImageItems");
MISSY_HOOKS.define("mgPanelItems");
MISSY_HOOKS.define("mgRender");
MISSY_HOOKS.define("mgGo");
MISSY_HOOKS.define("MG_VIEWS.panel.build");
MISSY_HOOKS.define("showTab");
MISSY_HOOKS.define("exportCatalogue");
MISSY_HOOKS.define("renderIntegrity");
MISSY_HOOKS.define("genericScript.onclick");
MISSY_HOOKS.define("zpcrSetEndpointN");
MISSY_HOOKS.define("MG_VIEWS.graphs.build");
MISSY_HOOKS.define("pcrdItems");

MISSY_HOOKS.define('report.style');
MISSY_HOOKS.define('report.paragraph');

MISSY_HOOKS.define('zcModeItems');

MISSY_HOOKS.define("mgClose");
MISSY_HOOKS.define("mgCommand");
