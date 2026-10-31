next => function(run){
 if(!run.zpcr)return next(run);
 const z=run.zpcr,m={};
 const set=(key,variant,value)=>{if(Number.isFinite(value))(m[key]||(m[key]={}))[variant]=value;};
 for(const step of [...new Set(z.reads.map(r=>r.step))]){
  const reads=z.reads.filter(r=>r.step===step),tag='Step '+step,q=ZPCR.zpcrQcMetrics(z,step).metrics;
  for(const [field,id]of [['BLOCKTEMP','z_block'],['SAMPLETEMP','z_sample'],['LIDTEMP','z_lid'],['SHUTTLETEMP','z_shuttle'],['AMBIENTTEMP','z_ambient']]){
   const v=q['temp.'+field];if(v){set(id,tag,v.mean);if(field==='BLOCKTEMP')set('z_block_sd',tag,v.sd);}
  }
  set('z_interval',tag,q['timing.readInterval']?.mean);set('z_interval_sd',tag,q['timing.readInterval']?.sd);
  for(let c=0;c<reads[0].channels;c++){
   const variant=tag+' · Raw channel '+(c+1);
   const dark=reads.map(r=>r.darkData?.[c*4]),ref=reads.map(r=>ZPCR.zpcrStats(Array.from({length:z.grid.referenceRows*r.cols},(_,i)=>ZPCR.zpcrWellMean(r,c,z.grid.sampleRows+Math.floor(i/r.cols),i%r.cols)))?.mean);
   set('z_dark',variant,ZPCR.zpcrStats(dark)?.mean);set('z_reference',variant,ZPCR.zpcrStats(ref)?.mean);
   if(dark[0]!==0)set('z_dark_drift',variant,100*(dark.at(-1)/dark[0]-1));
   if(ref[0]!==0)set('z_ref_drift',variant,100*(ref.at(-1)/ref[0]-1));
   set('z_led',variant,ZPCR.zpcrStats(reads.map(r=>r.leds[c]))?.mean);
   for(const d of q.referenceVsFactory?.byChannel?.[c]||[])set('z_factory',variant+' · Ref '+d.column,d.deviationPct);
  }
 }
 return m;
}