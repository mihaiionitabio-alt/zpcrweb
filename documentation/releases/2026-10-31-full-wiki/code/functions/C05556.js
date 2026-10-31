s=>{
    const mt=wells.find(w=>w.sample===s.sample&&w.target===s.target)||{},
      mr=wells.find(w=>w.sample===s.sample&&w.target===ec)||{};
    return {kind:"relquant",analysis:`${kindLabel} — ${s.target}`,analysisUid:"eds:"+s.target,analysisKind:"relquant",
      rule:"ΔΔCt",pairingName:"",well:"",refWell:"",pos:null,sample:s.sample,isCalibrator:s.sample===cal,
      target:s.target,targetTargetName:s.target,referenceName:ec,
      targetCp:(mt.eds||{}).ctMean??null,targetCpSD:(mt.eds||{}).ctSd??null,
      refCp:(mr.eds||{}).ctMean??null,refCpSD:(mr.eds||{}).ctSd??null,
      concRatio:null,concRatioSD:null,normRatio:s.rq,normRatioSD:null,
      rqMin:s.rqMin,rqMax:s.rqMax,dctMean:s.mean,dctMedian:s.median,dctSd:s.sd,dctSe:s.se,ddct:s.ddct,n:s.df!=null?s.df+1:"",
      targetCall:"",refCall:"",concStat:"",normStat:"",hasConcError:false,hasNormError:false,externalCurve:false,
      correction:"",multiplication:"",coveredPairings:""};
  }