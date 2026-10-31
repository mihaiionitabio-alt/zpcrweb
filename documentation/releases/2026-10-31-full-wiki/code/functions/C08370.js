function mlQuad(v,Ainv){/* v' Ainv v */
  let s=0;for(let i=0;i<v.length;i++)for(let j=0;j<v.length;j++)s+=v[i]*Ainv[i][j]*v[j];
  return s;}