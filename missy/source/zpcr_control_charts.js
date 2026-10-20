
/* Feed raw ZPCR hardware metrics through MISSY's existing chart/history engine. */
const zpcrCCPlatform=ccPlatform;ccPlatform=function(run){return run.zpcr?'CFX':zpcrCCPlatform(run);};
const zpcrCCProtocol=ccProtocolKey;ccProtocolKey=function(run){return run.zpcr?(run.zpcr.protocolText?'ZPCR protocol SHA-256 '+run.meta.ZPCRProtocolSHA256:'Unknown protocol; source '+run.meta.sourceSHA256):zpcrCCProtocol(run);};
const zpcrCCDynamic=ccDynamic;ccDynamic=function(run,...args){return run.zpcr?{}:zpcrCCDynamic(run,...args);};
const zpcrCCStatic=ccStatic;ccStatic=function(run){
 if(!run.zpcr)return zpcrCCStatic(run);
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
};
const zpcrChartDefs=[
 ['z_block','Z-H1','hardware','Block temperature at plate reads — mean','°C'],
 ['z_block_sd','Z-H2','hardware','Block temperature at plate reads — within-run SD','°C'],
 ['z_sample','Z-H3','hardware','Sample temperature field — mean','°C'],
 ['z_lid','Z-H4','hardware','Lid temperature field — mean','°C'],
 ['z_shuttle','Z-H5','hardware','Shuttle temperature field — mean','°C'],
 ['z_ambient','Z-H6','hardware','Ambient temperature field — quantised/inferred encoding','°C'],
 ['z_dark','Z-H7','hardware','Detector dark reading — mean','raw counts'],
 ['z_dark_drift','Z-H8','hardware','Detector dark reading — within-run change','%'],
 ['z_reference','Z-H9','hardware','Optical reference row — mean','raw instrument units'],
 ['z_ref_drift','Z-H10','hardware','Optical reference row — within-run change','%'],
 ['z_factory','Z-H11','hardware','Optical reference versus stored factory value','% deviation'],
 ['z_led','Z-H12','hardware','LED DAC setting — configuration history','DAC setting'],
 ['z_interval','Z-S1','software','Plate-read interval — mean','s'],
 ['z_interval_sd','Z-S2','software','Plate-read interval — SD','s']
];
for(const [id,code,group,title,unit]of zpcrChartDefs){const def={id,code,group,title,unit,inst:['CFX'],type:'i',variants:true,better:'target',status:'B',source:'ZPCR .Plateread / RunInfo.xml; selected acquisition step and raw channel',idea:'One point per run and acquisition-step/channel variant. Raw hardware data only; no Cq, dye correction or sample-result dependence. Temperature samples are taken at plate reads, not continuously. LED values are configuration settings, not measured current in mA. Ambient scalar interpretation is unresolved; integer-encoded values may be quantised.',reading:'Compare the same instrument, protocol, acquisition step, channel and firmware. Different protocol/firmware cohorts withhold statistical limits. Mean/SD during a melt ramp describe the sweep, not temperature accuracy. Read timing has one-second timestamp resolution. Reference deviations have no assigned cause. Statistical control limits are data-derived, not Bio-Rad acceptance limits; no vendor specifications are supplied.'};CC_CHARTS.push(def);CC_BY_ID[id]=def;}
const zpcrRenderPanel=renderPanel;renderPanel=function(){zpcrRenderPanel();if(CC_STATE.instrument.startsWith('CFX · ')){const box=document.querySelector('#cc-summary');if(box)box.insertAdjacentHTML('afterbegin','<div class="notice warn">Bio-Rad ZPCR hardware control charts: select a matching protocol and acquisition-step/channel variant. No vendor acceptance limits are assigned. Sparse/mixed protocol or firmware history stays collecting a baseline. These charts do not establish Cq, Tm, analytical calls or instrument qualification.</div>');}};
const zpcrCCLink=document.createElement('button');zpcrCCLink.textContent='Open ZPCR control charts · Control panel';zpcrCCLink.className='act';zpcrCCLink.onclick=()=>{const r=RUNS.find(r=>r.zpcr);if(!r)return;CC_STATE.instrument=ccInstrumentKey(r);CC_STATE.protocol='';CC_STATE.open='z_block';CC_STATE.variant='';CC_STATE.cache=null;markDirty('panel');showTab('panel');};
const zpcrBasePaint=zpcrPaint;zpcrPaint=function(){zpcrBasePaint();if(RUNS.some(r=>r.zpcr))zpcrPanel.prepend(zpcrCCLink);};
