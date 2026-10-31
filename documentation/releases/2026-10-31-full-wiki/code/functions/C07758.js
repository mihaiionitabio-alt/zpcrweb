pos=>{
      const w=rows.find(x=>x.pos===pos);
      if(sig==="mc")Object.entries(p.mc.signal[pos]||{}).forEach(([dye,arr])=>out.push(Object.assign({},w,{curve:arr,
        target:dye,analysis:"Multicomponent "+dye,analysisUid:"mc:"+dye,filterName:dye,filterComb:QS_DYE_FILTER[dye.toUpperCase()]||""})));
      else p.raw.sets.forEach(fs=>out.push(Object.assign({},w,{curve:(p.raw.data[fs]||[]).map(r=>r?r[pos]:NaN),
        target:fs,analysis:"Raw "+fs,analysisUid:"raw:"+fs,filterName:fs,filterComb:fs})));
    }