t=>{
    const ds=A.detectors[t]||A.defaults||{},rep=reporterOf(t),fs=QS_DYE_FILTER[String(rep).toUpperCase()]||"";
    const res=p.results.filter(x=>x.target===t);
    const stats=new Map();
    res.filter(x=>x.sample&&!x.undetermined).forEach(x=>{
      if(!stats.has(x.sample))stats.set(x.sample,{master:x.sample,wells:[],cpAvg:x.ctMean,cpSD:x.ctSd});
      stats.get(x.sample).wells.push(x.pos);});
    return {name:`${kindLabel} — ${t}`,shortName:t,uid:"eds:"+t,kind,kindLabel,cls:`QuantStudio ${p.exp.typeId||""}`.trim(),
      subsetName:t,calcState:p.exp.finalAnalysis==="true"?"analysed":"not analysed",
      channelIdx:dyeIdx(rep),channelName:rep,filterName:rep,filterComb:fs,
      cpMethod:"Threshold cycle (Ct)",cccEnabled:true,ccNote:"multicomponent (pure-dye) deconvolution",
      created:isoLocal(p.exp.created),modified:"",createdBy:p.exp.operator||"",modifiedBy:"",
      nResults:res.length,channelMismatch:null,channelSignal:null,
      stdCurve:(p.stdCurves||{})[t]?{source:"analysis_result.txt Std Curve Results",curveType:"fitted",
        slope:p.stdCurves[t].slope,yIntercept:p.stdCurves[t].yIntercept,r2:p.stdCurves[t].r2,
        efficiency:p.stdCurves[t].slope<0?Math.pow(10,-1/p.stdCurves[t].slope):null,
        efficiencyPercent:p.stdCurves[t].efficiency,fitError:""}:null,
      settings:{threshold:ds.threshold,autoThreshold:ds.autoCt,autoBaseline:ds.autoBaseline,baselineStart:ds.bStart,baselineEnd:ds.bStop},
      quantStats:[...stats.values()].map(s=>({master:s.master,sampleIds:s.wells.join(" "),count:s.wells.length,
        cpAvg:s.cpAvg,cpSD:s.cpSD,concAvg:"",concSD:"",method:"stored Ct Mean / Ct SD"}))};
  }