function zpcrRows(run,kind){
 const z=run.zpcr,out=[];
 if(kind==='raw'){
  out.push(['source_sha256','file','member','scan_index','step','cycle','channel_1based','position_type','row_1based','column_1based','mean','sd','min','max']);
  for(const r of z.reads)for(let c=0;c<r.channels;c++)for(let row=0;row<r.rows;row++)for(let col=0;col<r.cols;col++){const w=ZPCR.zpcrWellStats(r,c,row,col);out.push([run.meta.sourceSHA256,run.file,r.name,r.scanIndex,r.step,r.cycle,c+1,row<z.grid.sampleRows?'sample':'reference',row+1,col+1,w.mean,w.sd,w.min,w.max]);}
 }else{
  out.push(['source_sha256','member','scan_index','step','cycle','timestamp','field','value','interpretation']);
  for(const r of z.reads){const add=(k,v,t)=>out.push([run.meta.sourceSHA256,r.name,r.scanIndex,r.step,r.cycle,r.dateText,k,v,t]);for(const [k,v]of Object.entries(r.temps))add(k,v.c,(v.kind==='setpoint'?'integer encoded; physical interpretation unresolved':v.kind+' interpretation')+'; degC');r.leds.forEach((v,c)=>add('LEDCURRENT'+(c+1),v,'DAC setting; not calibrated mA'));add('CHANNELMASK',r.channelMaskRaw,'verbatim; uninterpreted');add('ERRORNUMBER',r.errorNumber,'instrument code');for(let c=0;c<r.channels;c++){for(let k=0;k<4;k++)add('DARK.ch'+(c+1)+'.'+['mean','sd','min','max'][k],r.darkData?.[c*4+k]??'','raw detector counts');}}
 }
 return out;
}