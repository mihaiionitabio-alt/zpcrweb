function maraEvidence(run){
 const original=SS_EXPORT_CONTEXT.get(run)?.original;if(original)return maraEvidence(original);
 let all=MARA_EVIDENCE.get(run);if(!all){all=new Map();MARA_EVIDENCE.set(run,all);}
 const key=sopHash();if(!all.has(key))all.set(key,{context:{},reactions:{}});return all.get(key);
}