function sopTargetLabel(row){
  const target=String(row&&row.target||"");
  if(!row||!row.spec||row.spec.kind!=="reference")return target;
  const refs=Array.isArray(SOP&&SOP.method&&SOP.method.reference_genes)?SOP.method.reference_genes:[];
  const ref=refs.find(x=>String(x.target||"").toLowerCase()===target.toLowerCase()||String(x.gene||"").toLowerCase()===target.toLowerCase());
  return ref?`${target} taxon reference (${ref.taxon})`:target+" taxon reference";
}