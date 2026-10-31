([dye,arr])=>out.push(Object.assign({},w,{curve:arr,
        target:dye,analysis:"Multicomponent "+dye,analysisUid:"mc:"+dye,filterName:dye,filterComb:QS_DYE_FILTER[dye.toUpperCase()]||""}))