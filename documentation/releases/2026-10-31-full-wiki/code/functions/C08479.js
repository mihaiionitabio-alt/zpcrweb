function mlClusterStructure(points,seed,kMax,nNull){
  const n=points.length;
  if(n<12)return {structure:false,why:"fewer than twelve runs"};
  const dims=points[0].length;
  const lo=Array.from({length:dims},(_,d)=>Math.min(...points.map(p=>p[d])));
  const hi=Array.from({length:dims},(_,d)=>Math.max(...points.map(p=>p[d])));
  const best=(pts,sd)=>{
    let b=null;
    for(let k=2;k<=Math.min(kMax||4,Math.floor(n/3));k++){
      const km=mlKMeans(pts,k,sd+k);
      if(km&&Number.isFinite(km.silhouette)&&(!b||km.silhouette>b.silhouette))b=km;
    }
    return b;
  };
  const obs=best(points,seed||4242);
  if(!obs)return {structure:false,why:"too few runs to form groups"};
  const rng=mlRng((seed||4242)+99),nulls=[];
  for(let s=0;s<(nNull||20);s++){
    const sample=Array.from({length:n},()=>Array.from({length:dims},(_,d)=>lo[d]+rng()*(hi[d]-lo[d])));
    const b=best(sample,(seed||4242)+1000+s);
    if(b&&Number.isFinite(b.silhouette))nulls.push(b.silhouette);
  }
  const q90=nulls.length?mlQuantile(nulls,0.9):NaN;
  const structure=Number.isFinite(q90)&&obs.silhouette>q90;
  mlTrace(`cluster structure · best k ${obs.k} · silhouette ${obs.silhouette.toFixed(4)}`
    +` · null 90th percentile ${Number.isFinite(q90)?q90.toFixed(4):"—"} → ${structure?"structure":"no more than chance"}`);
  return {structure,km:obs,k:obs.k,silhouette:obs.silhouette,nullQ90:q90,nNull:nulls.length};
}