a=>{
    const rq=a.relQuant;
    rq.groups.forEach(g=>{
      const refLabel=g.references.join("; ");
      const push=(res,label)=>{
        if(!res)return;
        const targetWell=res.pairName?res.pairName.split("/")[0]:"";
        const refWell=res.pairName&&res.pairName.indexOf("/")>=0?res.pairName.split("/")[1]:"";
        const tp=targetWell?wellToPos(targetWell,cols):null;
        rqResults.push({
          kind:"relquant",analysis:a.name,analysisUid:a.uid,analysisKind:"relquant",
          rule:rq.rule,pairingName:res.pairName||label,
          well:targetWell,refWell,pos:tp,
          sample:res.isCalib?"calibrator":(tp!=null?nameAt(tp):""),
          isCalibrator:res.isCalib,
          target:g.target,targetTargetName:g.target,referenceName:refLabel,
          targetCp:res.targetCp,targetCpSD:res.targetCpSD,
          refCp:res.refCp,refCpSD:res.refCpSD,
          concRatio:res.concRatio,concRatioSD:res.concRatioSD,
          normRatio:res.normRatio,normRatioSD:res.normRatioSD,
          targetCall:res.targetCall,refCall:res.refCall,
          concStat:res.concStat,normStat:res.normStat,
          hasConcError:res.hasConcError,hasNormError:res.hasNormError,
          externalCurve:res.externalCurve,
          correction:rq.correction,multiplication:rq.multiplication,
          coveredPairings:res.pairings.join(" ")
        });
      };
      push(g.calib,"calibrator");
      g.unknowns.forEach(u=>push(u,""));
    });
  }