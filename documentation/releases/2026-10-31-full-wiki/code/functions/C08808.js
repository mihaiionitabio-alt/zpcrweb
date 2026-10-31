()=>{
 const {def,o,key,rows,variant}=zpcrChartContext(item.id),old=(SOP.controlCharts||{})[def.id],cfg={...o};delete cfg.instrument;delete cfg.protocol;delete cfg.variant;
 try{SOP.controlCharts=SOP.controlCharts||{};SOP.controlCharts[def.id]={...(old||{}),...cfg};const res=ccCompute(def,rows,variant);return {svg:ccChartSvg(res,`${def.code} ${def.title} · ${key} · ${variant}`),rows:ccChartRows(def,res,variant)};}
 finally{if(old===undefined)delete SOP.controlCharts[def.id];else SOP.controlCharts[def.id]=old;}
 }