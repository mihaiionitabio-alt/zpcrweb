(analysis,chanIdx,pos)=>{
    if(!acq.melt)return null;
    let segments=acq.melt.filter(s=>(s.points||[]).some(p=>p.channel===chanIdx));
    if(!segments.length)return null;
    const selected=String((analysis.settings||{}).selectedProgram||"").trim();
    const analysisName=String(analysis.name||"");
    const exact=segments.filter(s=>s.programName&&(s.programName===selected
      ||analysisName.toLowerCase().includes(s.programName.toLowerCase())));
    if(exact.length)segments=exact;
    else if(selected){
      const n=Number(selected);
      const numeric=segments.filter(s=>Number.isFinite(n)&&(s.program===n||s.program+1===n));
      if(numeric.length)segments=numeric;
    }
    /* Never concatenate independent temperature ramps. If the analysis cannot be
       tied to one program, omit the raw melt trace rather than exporting a curve
       that never existed. The instrument's stored Tm peaks remain available. */
    if(segments.length!==1)return {points:null,ambiguous:true,candidates:segments.map(s=>({
      program:s.program,segment:s.segment,programName:s.programName
    }))};
    const s=segments[0],points=(s.points||[])
      .filter(p=>p.channel===chanIdx&&Number.isFinite(p.temp)&&p.values&&Number.isFinite(p.values[pos]))
      .map(p=>({temp:p.temp,fluor:p.values[pos],scalingFactor:p.scalingFactor}));
    return points.length?{points,program:s.program,segment:s.segment,programName:s.programName,ambiguous:false}:null;
  }