function mlAuc(pred,lab){
  const pos=pred.filter((_,i)=>lab[i]===1),neg=pred.filter((_,i)=>lab[i]===0);
  if(!pos.length||!neg.length)return NaN;
  let c=0;for(const a of pos)for(const b of neg)c+=a>b?1:(a===b?0.5:0);
  return c/(pos.length*neg.length);
}