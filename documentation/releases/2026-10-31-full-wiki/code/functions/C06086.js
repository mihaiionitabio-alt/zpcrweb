function ssExportClone(clone,original,ri){
  const rows=new WeakMap();["wells","tmWells","rqResults","genoResults","otherResults"].forEach(k=>(clone[k]||[]).forEach((w,i)=>{if((original[k]||[])[i])rows.set(w,original[k][i]);}));
  SS_EXPORT_CONTEXT.set(clone,{original,ri,rows});return clone;
}