function zpcrContributions(){
 const groups=new Map(),result=new Map();for(const run of RUNS.filter(r=>r.zpcr)){const e=run.zpcr.evidence,k=e?.acquisitionSHA256||run.meta.sourceSHA256;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(run);}
 for(const [key,members]of groups){members.sort((a,b)=>a.meta.sourceSHA256.localeCompare(b.meta.sourceSHA256));const signatures=new Set(members.map(r=>JSON.stringify([r.zpcr.evidence?.baseSerial,r.meta.ZPCRProtocolSHA256,r.meta.StartTime,r.meta.InstrumentVersion]))),conflict=signatures.size>1;
 const good=conflict?[]:members.filter(r=>r.zpcr.evidence?.completionSupported),representative=good[0];
 for(const r of members){const e=r.zpcr.evidence;result.set(r,{eligible:r===representative,completionSupported:!!e?.completionSupported&&!conflict,acquisitionSHA256:key,duplicateOf:representative&&r!==representative?representative.meta.sourceSHA256:'',sourceAliases:members.map(a=>({file:a.file,sourceSHA256:a.meta.sourceSHA256})),status:conflict?'REVIEW: identical acquisitions have conflicting run identity/protocol metadata':!e?.completionSupported?(e?.status||'REVIEW: legacy data lacks verification'):r===representative?'One completed acquisition contribution':representative?'Duplicate acquisitions: retained as source evidence, excluded from independent baseline':'REVIEW: no eligible contribution'});}
 }
 return result;
}