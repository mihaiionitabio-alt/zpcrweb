function issueCurveRows(rows){
  const seen=new Set();return rows.filter(r=>r.source==="curve"&&Array.isArray(r.curve)&&r.curve.length>4).sort((a,b)=>{
    const sa=a.severity==="error"?0:1,sb=b.severity==="error"?0:1;return sa-sb||String(a.experiment).localeCompare(String(b.experiment))||String(a.well).localeCompare(String(b.well));
  }).filter(r=>{const k=`${r.experiment}|${r.well}|${r.channel}|${r.target}`;if(seen.has(k))return false;seen.add(k);return true;}).slice(0,120).map(r=>({curve:r.curve,experiment:r.experiment,well:r.well,sample:r.sample,target:r.target,role:"Issue",call:r.storedCall,issueColour:r.issueColour}));
}