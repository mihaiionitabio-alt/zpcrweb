(pts,sd)=>{
    let b=null;
    for(let k=2;k<=Math.min(kMax||4,Math.floor(n/3));k++){
      const km=mlKMeans(pts,k,sd+k);
      if(km&&Number.isFinite(km.silhouette)&&(!b||km.silhouette>b.silhouette))b=km;
    }
    return b;
  }