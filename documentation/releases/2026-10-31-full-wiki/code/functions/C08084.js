r=>{
    if(!r.rdmlDoc){kept.push(r);return;}
    const mine=rdmlKeyOf({name:r.file,experimentId:r.experimentId});
    const hit=mine.find(k=>keys.has(k));
    if(hit){r.supersededBy=vendor.find(v=>rdmlKeyOf({name:v.file,experimentId:(v.meta||{}).name}).includes(hit));
      r.supersededReason=`the instrument's own file for this experiment is loaded (${r.supersededBy?r.supersededBy.file:"vendor container"}); `
        +"the exchange export is kept for comparison only";
      superseded.push(r);}
    kept.push(r);
  }