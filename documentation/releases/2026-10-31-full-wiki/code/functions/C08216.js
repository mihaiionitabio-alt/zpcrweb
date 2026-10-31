function selMatchAll(patterns){
  const out=[];
  String(patterns||"").split(/[\s,]+/).filter(Boolean).forEach(p=>selMatch(p).forEach(id=>{if(!out.includes(id))out.push(id);}));
  return out;
}