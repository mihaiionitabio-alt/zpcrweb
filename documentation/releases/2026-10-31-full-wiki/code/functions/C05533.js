s=>({name:s.flag,cycles:s.reps,
    mode:s.steps.some(x=>x.collect)?(/DISSOC|MELT/i.test(s.flag)?"Melting Curves":"Quantification"):"None",
    segments:s.steps.map(x=>({target:x.temps[0],target2:new Set(x.temps).size>1?Math.max(...x.temps):"",
      hold:x.hold,slope:x.ramp,acqMode:x.collect?(x.collectMode||"Single"):"None",acqPerDeg:"",stepSize:"",stepDelay:""}))})