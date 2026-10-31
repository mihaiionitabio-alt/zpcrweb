def=>({
    id:"cc:"+def.id,kind:"image",group:"Control charts · "+def.group,title:def.title||def.id,
    note:def.reading||def.idea||"Control chart",ready:()=>ccInstruments().length>0,
    figure:()=>{
      const insts=ccInstruments();if(!insts.length)throw new Error("no instrument history");
      const old=CC_STATE.instrument;CC_STATE.instrument=old&&insts.some(i=>i.key===old)?old:insts[0].key;
      const opt=SEL_STATE.options["cc:"+def.id]||{},oldCfg=(SOP.controlCharts||{})[def.id];
      try{const rows=ccRowsFor(CC_STATE.instrument);if(!rows.length)throw new Error("no rows for instrument");
        if(Object.keys(opt).length){SOP.controlCharts=SOP.controlCharts||{};SOP.controlCharts[def.id]=Object.assign({},oldCfg||{},opt);}
        const v=(ccVariants(def,rows)||[])[0]||"",res=ccCompute(def,rows,v);return {svg:ccChartSvg(res,`${def.code} ${def.title}${v?" · "+v:""}`),rows:ccChartRows(def,res,v)};}
      finally{if(Object.keys(opt).length){SOP.controlCharts=SOP.controlCharts||{};if(oldCfg===undefined)delete SOP.controlCharts[def.id];else SOP.controlCharts[def.id]=oldCfg;}CC_STATE.instrument=old;}
    }
  })