g=>{
    const cut=g.cqMax,late=sopNum(g.spec.cqLate),lo=sopNum(g.ctrl&&g.ctrl.cqLo),hi=sopNum(g.ctrl&&g.ctrl.cqHi);
    if(!g.n){out(g,"Not interpreted",g.omitted?"all replicates omitted":"no result","omitted wells");return;}
    if(g.ctrl){
      if(g.ctrl.expect==="standard"){out(g,"Standard","","control: "+g.ctrl.name);return;}
      if(g.ctrl.expect==="negative"){
        if(g.n<(Number(g.ctrl.minReplicates)||1)){out(g,"Control fail","insufficient control replicates","control: "+g.ctrl.name);return;}
        if(g.det)out(g,"Control fail",`amplified in ${g.det}/${g.n} (min Cq ${num(g.cqMin,2)} ≤ ${cut})`,"control: "+g.ctrl.name);
        else out(g,"Control pass","","control: "+g.ctrl.name);
        return;
      }
      const why=[];
      if(g.n<(Number(g.ctrl.minReplicates)||1))why.push(`only ${g.n} replicate(s); control requires ${g.ctrl.minReplicates}`);
      if(g.det<g.n)why.push(`detected in ${g.det}/${g.n}`);
      if(g.det&&Number.isFinite(lo)&&g.cqMean<lo)why.push(`mean Cq ${num(g.cqMean,2)} < ${lo}`);
      if(g.det&&Number.isFinite(hi)&&g.cqMean>hi)why.push(`mean Cq ${num(g.cqMean,2)} > ${hi}`);
      out(g,why.length?"Control fail":"Control pass",why.join("; "),"control: "+g.ctrl.name);return;
    }
    if(g.role==="Standard"){out(g,"Standard","","standard");return;}
    const reasons=[];let outcome;
    const roleNeed=sopReplicateMinimum(g);
    const need=Math.min(Math.max(1,roleNeed),g.n);
    if(g.n<roleNeed)reasons.push(`${g.n} replicate(s), SOP requires ${roleNeed}`);
    if(g.det===0){
      outcome="Negative";
      if(g.spec.kind==="ic"||g.spec.kind==="reference"){
        const alternate=(sampleRef.get(g.sample)||[]).filter(r=>r!==g&&r.spec.kind==="reference"&&r.det>0);
        if(g.spec.kind==="reference"&&referencePolicy==="any-valid"&&alternate.length){
          outcome="Not interpreted";
          reasons.push(`alternate taxon reference ${alternate.map(r=>r.target).join(", ")} detected; ${g.target} is not required for this sample`);
        }else{
          outcome=SOP.ic.missingOutcome||"Invalid";reasons.push(`${g.spec.kind==="ic"?"internal control":"reference"} not detected`);
        }
      }
      else{
        const refs=(sampleRef.get(g.sample)||[]).filter(r=>r!==g);
        const validReference=refs.some(r=>r.spec.kind==="reference"&&r.det>0);
        const failed=referencePolicy==="any-valid"&&validReference?[]:refs.filter(r=>r.det===0);
        const shifted=refs.filter(r=>r.spec.kind==="ic"&&Number.isFinite(icMedian)&&Number.isFinite(r.cqMean)&&r.cqMean-icMedian>sopNum(SOP.ic.maxShift));
        if(failed.length){outcome=SOP.ic.missingOutcome||"Invalid";reasons.push(`${failed.map(r=>r.target).join(", ")} not detected — a negative cannot be reported`);}
        else if(shifted.length){outcome=SOP.ic.shiftOutcome||"Inconclusive";reasons.push(`IC shifted +${num(shifted[0].cqMean-icMedian,2)} cycles from the run median (limit ${SOP.ic.maxShift}) — possible inhibition`);}
      }
    }else if(g.det<need){
      outcome=rep.partialOutcome||"Inconclusive";reasons.push(`detected in ${g.det}/${g.n} replicates, SOP requires ${need}`);
    }else{
      outcome="Positive";
      if(Number.isFinite(late)&&g.cqMean>late){outcome=g.spec.lateOutcome||"Inconclusive";reasons.push(`mean Cq ${num(g.cqMean,2)} above the late-signal limit ${late}`);}
      const qmin=sopNum(g.spec.quantMin);
      if(Number.isFinite(qmin)&&Number.isFinite(g.conc)&&g.conc<qmin){outcome=g.spec.lateOutcome||"Inconclusive";reasons.push(`quantity ${g.conc.toPrecision(3)} below ${qmin} (stochastic zone)`);}
      if(g.det<g.n&&outcome==="Positive")reasons.push(`detected in ${g.det}/${g.n}`);
      if(g.spec.kind==="ic"&&Number.isFinite(icMedian)&&g.cqMean-icMedian>sopNum(SOP.ic.maxShift))
        reasons.push(`IC +${num(g.cqMean-icMedian,2)} cycles from the run median`);
    }
    if(g.det>=2&&Number.isFinite(g.cqSd)&&g.cqSd>sopNum(rep.maxSd)){
      reasons.push(`replicate SD ${num(g.cqSd,2)} > ${rep.maxSd}`);
      if(rep.sdOutcome&&rep.sdOutcome!=="flag"&&(outcome==="Positive"||outcome==="Negative"))outcome=rep.sdOutcome;
    }
    if(g.n<roleNeed&&(outcome==="Positive"||outcome==="Negative"))outcome="Repeat";
    out(g,outcome,reasons.join("; "),g.spec.kind+": "+(g.spec.match||"*"));
  }