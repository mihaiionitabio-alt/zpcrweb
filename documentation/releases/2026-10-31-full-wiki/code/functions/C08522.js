function mlCohort(res,ctx){
  /* the instrument and protocol come from the context captured when the panel
     was created, not from the globals as they stand when it is opened */
  const inst=(ctx&&ctx.instrument)||CC_STATE.instrument;
  const prot=(ctx&&ctx.protocol!==undefined)?ctx.protocol:CC_STATE.protocol;
  const all=ccAllRows().filter(r=>r.instrument===inst);
  const proto=prot?all.filter(r=>(r.protocol||"")===prot):all;
  const from=res&&res.cfg&&res.cfg.baseFrom?Date.parse(res.cfg.baseFrom):NaN;
  const kept=(Number.isFinite(from)?proto.filter(r=>(r.date||0)>=from):proto)
    .slice().sort((a,b)=>(a.date||0)-(b.date||0));
  const keys=uniq(kept.map(r=>`${r.protocol||"unknown protocol"} · ${r.firmware||"no firmware"} / ${r.software||"no software"}`));
  return {rows:kept,n:kept.length,baseFrom:res&&res.cfg?res.cfg.baseFrom||"":"",
    droppedByBaseline:proto.length-kept.length,
    instrument:inst,protocol:prot||"",
    keys,mixed:keys.length>1};
}