s=>(s.acqMode==="1"?100000:0)
      +(s.protocolProgram&&/quant/i.test(s.protocolProgram.mode||"")?10000:0)
      +s.distinctCycles*100-s.tempSpan