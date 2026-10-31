x=>{
    const task=p.plate.wells[x.well]?.tasks.find(t=>t.target===x.target)||{},ci=dyeIdx(x.reporter),tms=Number.isFinite(x.tm)?[x.tm]:[];
    return {kind:'tm',well:posToWell(x.well,cols),pos:x.well,row:Math.floor(x.well/cols),col:x.well%cols,sample:x.sample,target:x.target,targetName:x.target,
      analysis:'Melt curve — '+x.target,analysisUid:'eds:melt:'+x.target,analysisKind:'tm',channel:ci,filterName:x.reporter,filterComb:QS_DYE_FILTER[String(x.reporter).toUpperCase()]||'',
      instrType:task.task||'',instrRole:QS_TASK_ROLE[task.task]||'',IsIncluded:x.omit?'0':'1',tms,nPeaks:tms.length,areas:[],heights:[],widths:[],shoulders:[],
      meltCurve:x.temperatures.length===x.rn.length?x.temperatures.map((temp,i)=>({temp,fluor:x.rn[i]})).filter(v=>Number.isFinite(v.temp)&&Number.isFinite(v.fluor)):null,
      CpRaw:null,Cp:null,call:'',curve:null,eds:{source:x.source||'analysis_result.txt',storedTm:x.tm,storedPeakCount:tms.length,peakSetComplete:null,peakProvenance:'Stored Tm only; additional peaks calculated by vendor software on export are not reconstructed.',temperatures:x.temperatures,fluorescence:x.rn,derivativeTemperatures:x.derivativeTemperatures,storedDerivative:x.drn}};
  }