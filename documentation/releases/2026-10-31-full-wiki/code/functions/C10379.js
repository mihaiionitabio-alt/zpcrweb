next=>async function(raw){
  if(String(raw).trim().toLowerCase()==='evidence'){cmdTable(rows(true).map(r=>[r.evidence_view+' · '+r.filename,[r.evidence_item,r.evidence_state,r.evidence_detail].filter(Boolean).join(' · ')]),true);return;}
  return next(raw);
 }