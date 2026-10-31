function mlSolve(A,b){
  const n=A.length,M=A.map((r,i)=>r.concat([b[i]]));
  for(let i=0;i<n;i++){
    let piv=i;for(let r=i+1;r<n;r++)if(Math.abs(M[r][i])>Math.abs(M[piv][i]))piv=r;
    if(Math.abs(M[piv][i])<1e-14)return null;
    [M[i],M[piv]]=[M[piv],M[i]];
    for(let r=0;r<n;r++){if(r===i)continue;const f=M[r][i]/M[i][i];
      for(let c=i;c<=n;c++)M[r][c]-=f*M[i][c];}
  }
  return M.map((r,i)=>r[n]/r[i]);
}