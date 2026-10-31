s=>({
      program:s.program,segment:s.segment,
      programName:s.protocolProgram?String(s.protocolProgram.name||""):"",
      analysisMode:s.protocolProgram?String(s.protocolProgram.mode||""):"",
      points:s.acquisitions.filter(p=>Number.isFinite(p.temp))
        .sort((a,b)=>a.temp-b.temp)
    })