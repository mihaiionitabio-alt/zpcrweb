x=>{
    const w=W[x.well]||{},ds=A.detectors[x.target]||A.defaults||{},dd=x.ddct||{},sc=(r.stdCurves||{})[x.target]||null,f=x.f||[];
    const o={"Well":x.well+1,"Well Position":x.pos,"Omit":String(!!x.omit),"Sample Name":nm(x.sample),"Target Name":x.target,
      "Task":taskOf(x).task||"","Reporter":x.reporter,"Quencher":x.quencher,
      "Quantity":num(f[8]),"Quantity Mean":num(f[9]),"Quantity SD":num(f[10]),
      "RQ":dd.rq??null,"RQ Min":dd.rqMin??null,"RQ Max":dd.rqMax??null,
      "CT":x.undetermined?"Undetermined":x.ct,"Ct Mean":x.ctMean,"Ct SD":x.ctSd,
      "Delta Ct":dd.dct??null,"Delta Ct Mean":dd.dctMean??null,"Delta Ct SD":dd.dctSd??null,"Delta Ct SE":dd.dctSe??null,"Delta Delta Ct":dd.ddct??null,
      "Y-Intercept":sc?sc.yIntercept:null,"R(superscript 2)":sc?sc.r2:null,"Slope":sc?sc.slope:null,"Efficiency":sc?sc.efficiency:null,
      "Automatic Ct Threshold":String(!!ds.autoCt),"Ct Threshold":ds.threshold??null,
      "Automatic Baseline":String(!!ds.autoBaseline),"Baseline Start":x.baseline?x.baseline.start:null,"Baseline End":x.baseline?x.baseline.stop:null,
      "Amp Status":x.ampLabel,"Comments":w.comment||"","Cq Conf":x.conf,"Tm1":null,"Tm2":null,"Tm3":null};
    flagIds.forEach(id=>o[id]=x.flags.some(c=>flagName(c)===id)?"Y":"N");
    return o;
  }