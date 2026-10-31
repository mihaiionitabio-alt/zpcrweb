(s,si)=>program.push({
    program:pi+1,name:p.name||"",cycles:p.cycles,analysis_mode:p.mode||"",segment:si+1,
    target:s.target,target_2:s.target2,hold:s.hold,slope:s.slope,step_size:s.stepSize,
    step_delay:s.stepDelay,acquisition_mode:s.acqMode,acquisitions_per_degree:s.acqPerDegree
  })