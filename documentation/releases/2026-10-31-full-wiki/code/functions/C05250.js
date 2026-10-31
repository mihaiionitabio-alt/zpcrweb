el=>{
    const segs=[...el.querySelectorAll('[class="HTCRunSegment"]')].map(s=>({
      target:Number(pv(s,"Target")),target2:Number(pv(s,"Target2")),hold:Number(pv(s,"Hold")),
      slope:Number(pv(s,"Slope")),acqMode:pv(s,"AcquisitionMode"),acqPerDeg:pv(s,"AcqPerDegree"),
      stepSize:Number(pv(s,"StepSize")),stepDelay:Number(pv(s,"StepDelay"))
    }));
    programs.push({name:pv(el,"name"),cycles:Number(pv(el,"Cycles")),mode:pv(el,"AnalysisMode"),segments:segs});
  }