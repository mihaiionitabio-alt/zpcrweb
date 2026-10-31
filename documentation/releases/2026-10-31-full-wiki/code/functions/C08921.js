function zpcrEndpointMetrics(run,n){

 const m={},z=run.zpcr;if(!Number.isInteger(n)||n<1||n>999)throw Error('Endpoint N must be an integer from 1 to 999');

 for(const step of new Set(z.reads.map(r=>r.step))){const all=z.reads.filter(r=>r.step===step);if(all.length<n)continue;const reads=all.slice(-n);

 for(let c=0;c<all[0].channels;c++)for(let p=0;p<96;p++){

 const ys=reads.map(r=>ZPCR.zpcrWellMean(r,c,Math.floor(p/12),p%12));if(!ys.every(Number.isFinite))continue;

 const q=ZPCR.zpcrStats(ys),v='Step '+step+' · Raw channel '+(c+1)+' · '+String.fromCharCode(65+Math.floor(p/12))+(p%12+1)+' · last '+n+' reads';

 (m.z_endpoint_mean||(m.z_endpoint_mean={}))[v]=q.mean;(m.z_endpoint_span||(m.z_endpoint_span={}))[v]=Math.max(...ys)-Math.min(...ys);

 }}return m;

}