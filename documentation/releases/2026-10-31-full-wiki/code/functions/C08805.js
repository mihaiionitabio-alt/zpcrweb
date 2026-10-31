function(){return next().map(item=>{if(!item.id.startsWith('cc:z_'))return item;
 return {...item,group:'ZPCR control charts · '+CC_BY_ID[item.id.slice(3)].group,note:CC_BY_ID[item.id.slice(3)].reading+' Instrument, protocol and variant can be selected in Assisted mode or with percent-encoded command options.',ready:()=>{try{return zpcrChartContext(item.id).rows.length>0;}catch(e){return false;}},figure:()=>{
 const {def,o,key,rows,variant}=zpcrChartContext(item.id),old=(SOP.controlCharts||{})[def.id],cfg={...o};delete cfg.instrument;delete cfg.protocol;delete cfg.variant;
 try{SOP.controlCharts=SOP.controlCharts||{};SOP.controlCharts[def.id]={...(old||{}),...cfg};const res=ccCompute(def,rows,variant);return {svg:ccChartSvg(res,`${def.code} ${def.title} · ${key} · ${variant}`),rows:ccChartRows(def,res,variant)};}
 finally{if(old===undefined)delete SOP.controlCharts[def.id];else SOP.controlCharts[def.id]=old;}
 }};});}