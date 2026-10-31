function mlRowInput(r){
  return mlCanonical({key:r.key,run:r.run,file:r.file,date:r.date,
    instrument:r.instrument,platform:r.platform,protocol:r.protocol,
    operator:r.operator,firmware:r.firmware,software:r.software,
    block_cycles:r.block_cycles,sop:r.sop,m:r.m});
}