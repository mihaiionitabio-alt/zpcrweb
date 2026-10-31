el=>{
    const d={};el.querySelectorAll(':scope > prop').forEach(pr=>d[pr.getAttribute("name")]=(pr.textContent||"").trim());
    if(!("NormRatio" in d)&&!("ConcRatio" in d))return;
    const num=t=>d[t]===undefined||d[t]===""?null:Number(d[t]);
    rqResults.push({kind:"relquant",analysis:"",analysisKind:"relquant",rule:"",
      pairingName:d.PairingName??d.PairName??"",well:"",refWell:"",pos:null,
      sample:d.SampleName??"",isCalibrator:false,
      target:d.TargetTargetName??"",targetTargetName:d.TargetTargetName??"",
      referenceName:d.ReferenceReferenceName??"",
      targetCp:num("TargetCpMedian"),targetCpSD:num("TargetCpMedianSTD"),
      refCp:num("RefCpMedian"),refCpSD:num("RefCpMedianSTD"),
      concRatio:num("ConcRatio"),concRatioSD:num("ConcRatioSTD"),
      normRatio:num("NormRatio"),normRatioSD:num("NormRatioSTD"),
      targetCall:d.TargetCall??"",refCall:d.RefCall??"",
      concStat:d.ConcRatioStat??"",normStat:d.NormRatioStat??"",
      hasConcError:d.HasConcError==="1",hasNormError:d.HasNormError==="1",
      externalCurve:d.ExtCurve==="1",
      correction:d.CorrectionFactor??"",multiplication:d.MultiplicationFactor??"",
      coveredPairings:""});
  }