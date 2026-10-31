rec=>{
      const pos=rec.pos,d=rec.d,lists=rec.lists;
      const prec=plate[pos]||{},ch=(prec.channels||{})[chanIdx]||{};
      const base={
        well:posToWell(pos,cols),pos,row:Math.floor(pos/cols),col:pos%cols,
        sample:prec.name||"",sampleId:prec.sampleId||"",notes:prec.notes||"",
        target,analysis:a.name,analysisShort:a.shortName,analysisUid:a.uid,analysisKind:a.kind,
        /* Measurements that may be pooled: different targets of the same quantification
           method belong together, but a second-derivative and a fit-points reading of the
           same wells do not, and neither do two relative quantification analyses. */
        analysisGroup:a.parentUid||a.cpMethod||a.uid,
        analysisGroupName:a.parentName||a.cpMethod||a.name,
        channel:chanIdx,filterName:a.filterName,filterComb:a.filterComb,
        instrType:ch.sampleType||"",instrRole:TYPE_TO_ROLE[ch.sampleType]||"",
        givenConc:ch.givenConc,cpLow:ch.cpLow,cpHigh:ch.cpHigh,rqEfficiency:ch.rqEfficiency,
        targetName:ch.targetName||"",targetType:ch.targetType||"",
        dominantChannel:prec.dominantChannel,
        replicateOf:prec.replicateOf,subsetsOfWell:subsetsOfPos[pos]||[],
        IsIncluded:d.IsIncluded??"",manual:d.ManualCall??d.ManualTms??d.ManualGroup??"",
        warnCodes:d.WarnCodes??"",warnDesc:d.WarnDesc??""
      };
      if(rec.kind==="quant"){
        const key=target+"|"+a.uid+"|"+pos;
        if(seen.has(key)){duplicates++;return;}
        seen.add(key);
        const rawCq=Number(d.CrossingPoint),callCode=Number(d.Call??3);
        const curve=(channels&&channels[chanIdx]&&cycles[chanIdx])?cycles[chanIdx].map(c=>channels[chanIdx][c][pos]):null;
        wells.push(Object.assign(base,{
          kind:"quant",
          CpRaw:Number.isFinite(rawCq)?rawCq:null,Cp:Number.isFinite(rawCq)&&rawCq>0?rawCq:null,
          callCode,call:CALL[callCode]??String(callCode),curve,
          CpUncertain:d.CpUncertain??"",CpState:d.CpState??"",CrossingPointStatus:d.CrossingPointStatus??"",
          CalcConc:d.CalcConc??"",ConcStatus:d.ConcStatus??"",StandardConc:d.StandardConc??"",
          CalcConcUnc:d.CalcConcUnc??""
        }));
      }else if(rec.kind==="tm"){
        /* the peak lists are fixed-length and zero-padded; TmCount gives the real number */
        const nPk=Number.isFinite(Number(d.TmCount))?Number(d.TmCount):(lists.Tms||[]).filter(v=>v>0).length;
        const cut=a=>(a||[]).slice(0,nPk);
        const meltTrace=meltTraceFor(a,chanIdx,pos);
        tmWells.push(Object.assign(base,{
          kind:"tm",tms:cut(lists.Tms),shoulders:(lists.Shoulder||[]).slice(0,nPk).filter(v=>v>0),
          areas:cut(lists.Amounts),heights:cut(lists.Heights),widths:cut(lists.Widths),
          callCode:d.Call===undefined?null:Number(d.Call),nPeaks:nPk,showShoulder:d.ShowShoulder==="1",
          manualTms:d.ManualTms??"",meltCurve:meltTrace&&meltTrace.points,
          meltProgram:meltTrace&&meltTrace.programName||"",meltProgramIndex:meltTrace&&meltTrace.program,
          meltSegment:meltTrace&&meltTrace.segment,meltCurveAmbiguous:!!(meltTrace&&meltTrace.ambiguous),
          CpRaw:null,call:"",curve:null
        }));
      }else if(rec.kind==="genotype"){
        genoResults.push(Object.assign(base,{
          kind:"genotype",
          /* Endpoint Genotyping stores the genotype itself in Call. Gene Scanning
             and Melt Curve Genotype store an integer Call state and the textual
             genotype in GroupName (LIMS guide, Tables 6-25 and 6-26). */
          callText:a.kind==="endptgeno"?(d.Call??""):(d.GroupName??""),
          callCode:a.kind==="endptgeno"?null:(d.Call===undefined?null:Number(d.Call)),
          score:d.Score===undefined?null:Number(d.Score),
          groupName:d.GroupName??"",res:d.Res??"",
          peakWt:d.PeakWtFluor===undefined?null:Number(d.PeakWtFluor),
          peakMut:d.PeakMutFluor===undefined?null:Number(d.PeakMutFluor)
        }));
      }else if(rec.kind==="relquant"){
        rqResults.push(Object.assign(base,{
          kind:"relquant",pairingName:d.PairingName??"",
          targetTargetName:d.TargetTargetName??"",referenceName:d.ReferenceReferenceName??"",
          targetCp:d.TargetCpMedian===undefined?null:Number(d.TargetCpMedian),
          targetCpSD:d.TargetCpMedianSTD===undefined?null:Number(d.TargetCpMedianSTD),
          refCp:d.RefCpMedian===undefined?null:Number(d.RefCpMedian),
          refCpSD:d.RefCpMedianSTD===undefined?null:Number(d.RefCpMedianSTD),
          concRatio:d.ConcRatio===undefined?null:Number(d.ConcRatio),
          concRatioSD:d.ConcRatioSTD===undefined?null:Number(d.ConcRatioSTD),
          normRatio:d.NormRatio===undefined?null:Number(d.NormRatio),
          correction:d.CorrectionFactor??"",multiplication:d.MultiplicationFactor??""
        }));
      }else otherResults.push(Object.assign(base,{kind:"other",raw:d}));
    }