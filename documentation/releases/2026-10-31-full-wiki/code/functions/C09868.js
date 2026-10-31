function qc(role,assay,positive){
   const found=active.filter(r=>r.role===role&&r.assay===assay),sets=group(found,r=>r.sample);
   let pass=sets.size>0;for(const rs of sets.values())if(rs.length<controlMin||rs.some(r=>signal(r,cut,rapid)!==positive))pass=false;
   add(role+':'+assay,pass,found.length+'');controlSets[role+':'+assay]=found;return found;
  }