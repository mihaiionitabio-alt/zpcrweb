s=>{
    const prog=(protocol&&protocol.programs||[])[s.program]||null;
    const protoSeg=prog&&prog.segments?s.program>=0&&prog.segments[s.segment]:null;
    return Object.assign(s,{
      distinctCycles:Object.keys(s.cycles).length,
      protocolProgram:prog,protocolSegment:protoSeg,
      acqMode:protoSeg?String(protoSeg.acqMode||""):"",
      tempSpan:s.temps.length?Math.max(...s.temps)-Math.min(...s.temps):0
    });
  }