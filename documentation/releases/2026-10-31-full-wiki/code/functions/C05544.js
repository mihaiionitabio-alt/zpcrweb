x=>{
    const ci=dyeIdx(x.reporter||reporterOf(x.target)),pos=x.well;
    if(x.rn&&x.rn.length){
      const finite=x.rn.filter(Number.isFinite),amp=finite.length?Math.max(...finite)-Math.min(...finite):null;
      allCurves[`${ci}|${pos}`]={channel:ci,pos,curve:x.rn,amplitude:amp};
    }
    const w=p.plate.wells[pos]||{},task=(w.tasks||[]).find(t=>t.target===x.target)||{};
    // Unnamed standards and controls are still assigned reactions. Preserve
    // their blank name rather than dropping them or inventing a sample name.
    if(!x.sample&&!task.target)return;
    const amp=QS_AMP[String(x.amp).trim()]||{call:"NotCalculated",code:3,label:x.ampLabel||String(x.amp)};
    wells.push({
      kind:"quant",well:posToWell(pos,cols),pos,row:Math.floor(pos/cols),col:pos%cols,
      sample:x.sample,sampleId:"",notes:w.comment||"",target:x.target,
      analysis:`${kindLabel} — ${x.target}`,analysisShort:x.target,analysisUid:"eds:"+x.target,analysisKind:kind,
      analysisGroup:"eds:ct",analysisGroupName:"Threshold cycle (Ct)",
      channel:ci,filterName:x.reporter,filterComb:QS_DYE_FILTER[String(x.reporter).toUpperCase()]||"",
      instrType:task.task||"",instrRole:QS_TASK_ROLE[task.task]||"",givenConc:task.quantity,
      targetName:x.target,targetType:ec?(x.target===ec?"dtReference":"dtTarget"):"",
      replicateOf:undefined,subsetsOfWell:[],IsIncluded:x.omit?"0":"1",manual:"",
      warnCodes:x.flags.map(EDS.flagName).join(" "),
      warnDesc:x.flags.map(f=>(EDS.FLAGS[f]||[])[1]||f).join("; "),
      CpRaw:x.undetermined?null:x.ct,Cp:x.undetermined?null:x.ct,
      callCode:amp.code,call:amp.call,curve:x.rn&&x.rn.length?x.rn:null,
      CpUncertain:"",CpState:x.undetermined?"Undetermined":"",CrossingPointStatus:x.undetermined?"Undetermined":"",
      CalcConc:x.qty??"",ConcStatus:"",StandardConc:task.quantity??"",CalcConcUnc:"",
      eds:{ampLabel:amp.label,ampCode:x.amp,cqConf:x.conf,flags:x.flags,storedCt:x.ct,ctMean:x.ctMean,ctSd:x.ctSd,
        dct:x.ddct?x.ddct.dct:x.dct,ddct:x.ddct||null,threshold:x.threshold,ctRecalc:x.ctRecalc,
        ctDelta:x.ctDelta,undetermined:x.undetermined,rn:x.rn,drn:x.drn,signalType:'Rn',quantity:x.qty,quantityMean:x.qtyMean,quantitySD:x.qtySd,assignedQuantity:task.quantity??'',omit:x.omit}
    });
  }