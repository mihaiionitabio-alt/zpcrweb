function mlMatInv(A){
  const n=A.length,M=A.map((r,i)=>r.concat(Array.from({length:n},(_,j)=>i===j?1:0)));
  for(let i=0;i<n;i++){
    let piv=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[piv][i]))piv=r;
    if(Math.abs(M[piv][i])<1e-14)return null;
    [M[i],M[piv]]=[M[piv],M[i]];
    const d=M[i][i];for(let c=0;c<2*n;c++)M[i][c]/=d;
    for(let r=0;r<n;r++){if(r===i)continue;const f=M[r][i];
      if(!f)continue;for(let c=0;c<2*n;c++)M[r][c]-=f*M[i][c];}
  }
  return M.map(r=>r.slice(n));
}