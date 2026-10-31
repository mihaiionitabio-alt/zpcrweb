function mlStandardise(rows,stats){
  const p=rows[0].length;
  let mean,sd;
  if(stats){mean=stats.mean;sd=stats.sd;}
  else{mean=[];sd=[];
    for(let j=0;j<p;j++){const col=rows.map(r=>r[j]);mean.push(mlMean(col));sd.push(mlSd(col)||1);}}
  return {z:rows.map(r=>r.map((v,j)=>(v-mean[j])/(sd[j]||1))),mean,sd};
}