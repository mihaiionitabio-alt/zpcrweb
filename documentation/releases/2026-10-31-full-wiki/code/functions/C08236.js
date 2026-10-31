l=>{
    const f=split(l);if(f.length<=Math.max(iId,iInc))return;
    const id=f[iId].trim(),inc=/^(y|yes|true|1|x)$/i.test(f[iInc].trim());
    if(!id)return;rows++;
    if(!known.has(id)){unknown.push(id);return;}
    if(inc)SEL_STATE.ids.add(id);else SEL_STATE.ids.delete(id);
    applied++;
  }