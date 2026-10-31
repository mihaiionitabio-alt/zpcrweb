function mlCorrelation(z){
  const n=z.length,p=z[0].length,C=Array.from({length:p},()=>new Array(p).fill(0));
  for(let i=0;i<n;i++)for(let a=0;a<p;a++)for(let b=a;b<p;b++)C[a][b]+=z[i][a]*z[i][b];
  for(let a=0;a<p;a++)for(let b=a;b<p;b++){C[a][b]/=(n-1);C[b][a]=C[a][b];}
  return C;
}