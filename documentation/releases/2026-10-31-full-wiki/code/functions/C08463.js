function mlKMeans(points,k,seed){
  const rng=mlRng(seed||777),n=points.length;
  if(n<k*3||k<1)return null;
  const centres=[points[Math.floor(rng()*n)].slice()];
  while(centres.length<k){
    const d2=points.map(p=>Math.pow(Math.min(...centres.map(c=>mlDist(p,c))),2));
    centres.push(points[mlWeightedDraw(d2,rng())].slice());
  }
  let assign=new Array(n).fill(0);
  mlTrace(`k-means: ${n} runs, ${k} group(s), seeded k-means++ start`);
  for(let it=0;it<60;it++){
    let moved=false,moves=0;
    for(let i=0;i<n;i++){
      let best=0,bd=Infinity;
      centres.forEach((c,j)=>{const d=mlDist(points[i],c);if(d<bd){bd=d;best=j;}});
      if(assign[i]!==best){assign[i]=best;moved=true;moves++;}
    }
    if(ML_TRACE){
      const inertia=points.reduce((s,pt,i)=>s+Math.pow(mlDist(pt,centres[assign[i]]),2),0);
      mlTrace(`  pass ${it+1} · ${moves} run(s) reassigned · within-group sum of squares ${inertia.toFixed(4)}`);
    }
    for(let j=0;j<k;j++){
      const mem=points.filter((_,i)=>assign[i]===j);
      if(mem.length)centres[j]=mem[0].map((_,d)=>mlMean(mem.map(m=>m[d])));
    }
    if(!moved)break;
  }
  const sizes=centres.map((_,j)=>assign.filter(a=>a===j).length);
  const inertia=points.reduce((s,pt,i)=>s+Math.pow(mlDist(pt,centres[assign[i]]),2),0);
  mlTrace("  settled · group sizes",sizes);
  return {assign,centres,sizes,inertia,k,silhouette:mlSilhouette(points,assign,k)};
}