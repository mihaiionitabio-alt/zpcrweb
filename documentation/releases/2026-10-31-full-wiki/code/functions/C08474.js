function mlSilhouette(points,assign,k){
  const n=points.length;
  if(k<2)return NaN;                        /* undefined for a single group */
  if(assign.some(a=>a==null))return NaN;
  const sizes=Array.from({length:k},(_,j)=>assign.filter(a=>a===j).length);
  if(sizes.some(s=>s===0))return NaN;
  let total=0;
  for(let i=0;i<n;i++){
    const own=sizes[assign[i]];
    if(own<2){continue;}                    /* a singleton contributes 0 */
    let a=0;const b=new Array(k).fill(0);
    for(let j=0;j<n;j++){
      if(i===j)continue;const d=mlDist(points[i],points[j]);
      if(assign[j]===assign[i])a+=d;else b[assign[j]]+=d;
    }
    a/=own-1;
    let bb=Infinity;
    for(let j=0;j<k;j++)if(j!==assign[i]&&sizes[j]>0)bb=Math.min(bb,b[j]/sizes[j]);
    const m=Math.max(a,bb);
    total+=m>0?(bb-a)/m:0;
  }
  return total/n;
}