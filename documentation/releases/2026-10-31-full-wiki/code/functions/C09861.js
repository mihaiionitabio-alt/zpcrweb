function signal(r,cut=36,rapid=false){
  if(r.curve==='absent'||r.curve==='atypical')return false;
  if(r.curve!=='typical')return null;
  if(rapid)return true;
  const q=N(r.cq);return q>0&&Number.isFinite(q)?q<=cut:null;
 }