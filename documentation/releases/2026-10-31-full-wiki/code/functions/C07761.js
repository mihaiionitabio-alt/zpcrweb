fs=>out.push(Object.assign({},w,{curve:(p.raw.data[fs]||[]).map(r=>r?r[pos]:NaN),
        target:fs,analysis:"Raw "+fs,analysisUid:"raw:"+fs,filterName:fs,filterComb:fs}))